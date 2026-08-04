import { Hono } from "hono";
import { StreamableHTTPTransport } from "@hono/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { and, desc, eq, like } from "drizzle-orm";
import { createDb, schema } from "@clipnote/db";
import { hashApiKey } from "@clipnote/auth";
import { getUtf8ByteLength, MAX_CONTENT_BYTES, validateContent } from "@clipnote/pages/validation";
import { replacePageContent } from "@clipnote/pages/page-versions";

interface Env {
  DB: D1Database;
}
interface Variables {
  userId: string;
}

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// クリップが存在しない場合と他ユーザー所有の場合を同一メッセージにし、
// 他ユーザーのクリップの存在を推測されないようにする（設計書4-7節・13-5節）。
const NOT_FOUND_MESSAGE = "指定されたクリップが見つかりません。";

function contentErrorMessage(content: string, error: NonNullable<ReturnType<typeof validateContent>>): string {
  switch (error) {
    case "empty":
      return "本文が空です。";
    case "invalid_utf8":
      return "本文に無効なUTF-8文字が含まれています。";
    case "too_large":
      return `本文がサイズ上限（${MAX_CONTENT_BYTES} bytes）を超えています（現在 ${getUtf8ByteLength(content)} bytes）。`;
  }
}

// Bearer認証：MCPトランスポート層に到達する前にHono側で完結させる
// （設計書4-7節・13-3節）。無効・欠落トークンはプレーンなHTTP 401で応答する。
app.use("/mcp", async (c, next) => {
  const authHeader = c.req.header("authorization");
  const rawKey = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : null;
  if (!rawKey) {
    c.header("WWW-Authenticate", 'Bearer realm="clipnote-mcp"');
    return c.text("unauthorized", 401);
  }

  const db = createDb(c.env.DB);
  const keyHash = await hashApiKey(rawKey);
  const [apiKey] = await db.select().from(schema.apiKeys).where(eq(schema.apiKeys.keyHash, keyHash));
  if (!apiKey) {
    c.header("WWW-Authenticate", 'Bearer realm="clipnote-mcp"');
    return c.text("unauthorized", 401);
  }

  // last_used_atの更新はレスポンスをブロックしない（表示用の付随情報のため、
  // まれな競合での取りこぼしは許容する）。
  c.executionCtx.waitUntil(
    db
      .update(schema.apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(schema.apiKeys.id, apiKey.id))
      .then(() => {}),
  );

  c.set("userId", apiKey.userId);
  await next();
});

app.all("/mcp", async (c) => {
  const userId = c.get("userId");
  const db = createDb(c.env.DB);

  // リクエストごとに新規McpServer/Transportを生成する。ツールのクロージャが
  // このリクエストのuserIdだけを捕捉するようにし、Workers isolateが同時に
  // 複数リクエストを処理してもユーザーIDの取り違えが起きないようにする。
  const server = new McpServer({ name: "clipnote-mcp", version: "1.0.0" });

  server.registerTool(
    "list_pages",
    {
      description: "認証済みユーザーが所有するクリップの一覧を取得する（本文は含まない）。",
      inputSchema: { query: z.string().optional() },
    },
    async ({ query }) => {
      const rows = await db
        .select({
          uuid: schema.pages.id,
          title: schema.pages.title,
          contentType: schema.pages.contentType,
          visibility: schema.pages.visibility,
          updatedAt: schema.pages.updatedAt,
        })
        .from(schema.pages)
        .where(
          query
            ? and(eq(schema.pages.userId, userId), like(schema.pages.title, `%${query}%`))
            : eq(schema.pages.userId, userId),
        )
        .orderBy(desc(schema.pages.updatedAt));

      return { content: [{ type: "text", text: JSON.stringify(rows) }] };
    },
  );

  server.registerTool(
    "get_page",
    {
      description: "uuidを指定してクリップの本文を含む内容を取得する。",
      inputSchema: { uuid: z.string() },
    },
    async ({ uuid }) => {
      const [page] = await db
        .select()
        .from(schema.pages)
        .where(and(eq(schema.pages.id, uuid), eq(schema.pages.userId, userId)));
      if (!page) {
        return { content: [{ type: "text", text: NOT_FOUND_MESSAGE }], isError: true };
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              uuid: page.id,
              title: page.title,
              content: page.content,
              contentType: page.contentType,
              visibility: page.visibility,
              updatedAt: page.updatedAt,
            }),
          },
        ],
      };
    },
  );

  server.registerTool(
    "upload_page",
    {
      description: "新しいクリップをアップロードする。",
      inputSchema: {
        content: z.string(),
        contentType: z.enum(["html", "markdown"]),
        title: z.string().trim().min(1),
        visibility: z.enum(["private", "public"]).optional(),
      },
    },
    async ({ content, contentType, title, visibility }) => {
      const contentError = validateContent(content);
      if (contentError) {
        return { content: [{ type: "text", text: contentErrorMessage(content, contentError) }], isError: true };
      }

      const uuid = crypto.randomUUID();
      await db.insert(schema.pages).values({
        id: uuid,
        userId,
        title,
        content,
        contentType,
        visibility: visibility ?? "private",
      });

      return {
        content: [
          { type: "text", text: JSON.stringify({ uuid, url: `https://clipnote.paritto.dev/p/${uuid}` }) },
        ],
      };
    },
  );

  server.registerTool(
    "update_page",
    {
      description: "既存クリップの本文を全文差し替えする（更新前の内容はpage_versionsへ退避される）。",
      inputSchema: { uuid: z.string(), content: z.string() },
    },
    async ({ uuid, content }) => {
      const [page] = await db
        .select()
        .from(schema.pages)
        .where(and(eq(schema.pages.id, uuid), eq(schema.pages.userId, userId)));
      if (!page) {
        return { content: [{ type: "text", text: NOT_FOUND_MESSAGE }], isError: true };
      }

      const contentError = validateContent(content);
      if (contentError) {
        return { content: [{ type: "text", text: contentErrorMessage(content, contentError) }], isError: true };
      }

      await replacePageContent(db, page, { content, contentType: page.contentType });

      return {
        content: [
          { type: "text", text: JSON.stringify({ uuid, url: `https://clipnote.paritto.dev/p/${uuid}` }) },
        ],
      };
    },
  );

  const transport = new StreamableHTTPTransport({ sessionIdGenerator: undefined });
  await server.connect(transport);
  return transport.handleRequest(c);
});

export default app;
