import { Hono } from "hono";
import { verifyContentToken } from "@clipnote/content-token";
import { createDb, schema } from "@clipnote/db";
import { eq } from "drizzle-orm";
import { renderMarkdownDocument } from "./markdown";
import { renderPlainTextDocument } from "./plaintext";
import { RESIZE_SCRIPT } from "./resize-script";
import { wrapErrorDocument } from "./document-shell";

interface Env {
  DB: D1Database;
  CONTENT_HOST: string;
  CONTENT_TOKEN_SECRET: string;
  WEB_ORIGIN: string;
}

const app = new Hono<{ Bindings: Env }>();

// 設計書4-3節：Hostヘッダー検証。コンテンツ配信ドメイン以外からのアクセス
// を拒否する。ワーカーの存在自体を隠すため404で応答する。
app.use("*", async (c, next) => {
  const host = c.req.header("host");
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
    return c.html(wrapErrorDocument("このクリップは表示できません。"), 403);
  }
  const verified = await verifyContentToken({ token, uuid, secret: c.env.CONTENT_TOKEN_SECRET });
  if (!verified) {
    return c.html(wrapErrorDocument("このクリップは表示できません。"), 403);
  }

  // 設計書4-4節③：ここで初めてD1への読み取りアクセスが発生する。
  const db = createDb(c.env.DB);
  const [page] = await db.select().from(schema.pages).where(eq(schema.pages.id, uuid));
  if (!page) {
    return c.html(wrapErrorDocument("このクリップは見つかりませんでした。"), 404);
  }

  // トークンごとに内容・可視性が変わりうるため、いかなるキャッシュにも
  // 乗せない（private/non-storeのブラウザ・CDNキャッシュ抑止）。
  c.header("Cache-Control", "private, no-store");

  // このcontentドメインのURLはAIエージェント等がJSを実行せずに本文を発見する
  // ための経路として公開ページ（apps/web）のbody内にリンクを置いているが
  // （apps/web/src/app/p/[uuid]/page.tsx参照）、検索エンジンにはraw文書ではなく
  // ヘッダー・フッター付きの/p/{uuid}を正規ページとして拾わせたい。本文（HTML
  // 種別は特にAI生成のドキュメント全体）を書き換えずに済むよう、HTMLタグでは
  // なくレスポンスヘッダーでcanonical・noindexを伝える。
  c.header("X-Robots-Tag", "noindex");
  c.header("Link", `<${c.env.WEB_ORIGIN}/p/${uuid}>; rel="canonical"`);

  // 設計書4-4節④⑤：content_typeに応じて出力。サニタイズは行わない
  // （プレーンテキストのみHTMLとして解釈されうる文字をエスケープするが、
  // これは無害化ではなく素のテキストとして表示するための処理）。
  // RESIZE_SCRIPTは末尾に追記するだけ（本文自体には手を加えない）。
  // </body></html>より後ろに書いてもブラウザのHTMLパース時にbody内へ
  // 押し込まれて実行される。
  if (page.contentType === "html") {
    return c.html(page.content + RESIZE_SCRIPT);
  }
  if (page.contentType === "plaintext") {
    return c.html(renderPlainTextDocument(page.content));
  }
  return c.html(await renderMarkdownDocument(page.content));
});

export default app;
