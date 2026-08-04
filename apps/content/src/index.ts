import { Hono } from "hono";
import { verifyContentToken } from "@clipnote/content-token";
import { createDb, schema } from "@clipnote/db";
import { eq } from "drizzle-orm";
import { renderMarkdownDocument } from "./markdown";
import { RESIZE_SCRIPT } from "./resize-script";

interface Env {
  DB: D1Database;
  CONTENT_HOST: string;
  CONTENT_TOKEN_SECRET: string;
}

const app = new Hono<{ Bindings: Env }>();

// 設計書4-3節：Hostヘッダー検証。コンテンツ配信ドメイン以外からのアクセス
// を拒否する。ワーカーの存在自体を隠すため404で応答する。
app.use("*", async (c, next) => {
  const host = c.req.header("host");
  console.log("DEBUG host check", JSON.stringify({ host, envHost: c.env.CONTENT_HOST }));
  if (host !== c.env.CONTENT_HOST) {
    return c.text("not found", 404);
  }
  await next();
});

app.get("/:uuid", async (c) => {
  const uuid = c.req.param("uuid");
  const token = c.req.query("t");

  // 設計書4-4節②：HMAC計算のみで完結する検証（DBアクセス不要）。
  // 署名不正・期限切れ・uuid不一致のいずれも同じ403として扱う。
  if (!token) {
    return c.text("forbidden", 403);
  }
  const verified = await verifyContentToken({ token, uuid, secret: c.env.CONTENT_TOKEN_SECRET });
  if (!verified) {
    return c.text("forbidden", 403);
  }

  // 設計書4-4節③：ここで初めてD1への読み取りアクセスが発生する。
  const db = createDb(c.env.DB);
  const [page] = await db.select().from(schema.pages).where(eq(schema.pages.id, uuid));
  if (!page) {
    return c.text("not found", 404);
  }

  // トークンごとに内容・可視性が変わりうるため、いかなるキャッシュにも
  // 乗せない（private/non-storeのブラウザ・CDNキャッシュ抑止）。
  c.header("Cache-Control", "private, no-store");

  // 設計書4-4節④⑤：content_typeに応じて出力。サニタイズは行わない。
  // RESIZE_SCRIPTは末尾に追記するだけ（本文自体には手を加えない）。
  // </body></html>より後ろに書いてもブラウザのHTMLパース時にbody内へ
  // 押し込まれて実行される。
  if (page.contentType === "html") {
    return c.html(page.content + RESIZE_SCRIPT);
  }
  return c.html(await renderMarkdownDocument(page.content));
});

export default app;
