import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDb, schema } from "@clipnote/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { headers } from "next/headers";

function createAuth(db: D1Database) {
  return betterAuth({
    // Origin/CSRF検証（better-authのorigin-checkミドルウェア）がbaseURLの
    // オリジンをtrustedOriginsへ組み込むため必須。未設定だとリクエストから
    // 推測させることになり、Cloudflare Workers環境では正しく解決されず
    // "Invalid origin"で全リクエストが弾かれることがある。
    baseURL: process.env.BETTER_AUTH_URL,
    database: drizzleAdapter(createDb(db), {
      provider: "sqlite",
      schema,
    }),
    // packages/db pluralizes better-auth's default model names (design.md
    // 11章: `users`テーブル) to match this repo's table naming convention.
    user: { modelName: "users" },
    session: { modelName: "sessions" },
    account: { modelName: "accounts" },
    verification: { modelName: "verifications" },
    emailAndPassword: {
      enabled: true,
    },
    // セッションCookieのスコープ（design.md 1章）：`paritto.dev`はcontent/mcp
    // サブドメインとも共有される親ドメインのため、advanced.crossSubDomainCookies
    // は有効化しない。Domain属性を省略することで、Cookieは発行元ホスト
    // （clipnote.paritto.dev）単体にスコープされ、親ドメイン全体には広がらない。
  });
}

// The D1 binding is only reachable at request time (Workers have no
// top-level binding access), so the betterAuth() instance is built lazily
// on first use and cached for the life of the isolate.
let authInstance: ReturnType<typeof createAuth> | undefined;

export async function getAuth() {
  if (authInstance) return authInstance;

  const { env } = await getCloudflareContext({ async: true });
  authInstance = createAuth(env.DB);

  return authInstance;
}

// app/api/**のroute handlerは/adminと違いlayout.tsxのセッションチェックを
// 経由しない（proxy.tsのmatcherは/admin/:path*のみ）ため、各handlerが個別に
// 呼び出して401判定する。
export async function requireSessionUser() {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });

  return session?.user ?? null;
}
