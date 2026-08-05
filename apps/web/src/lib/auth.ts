import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDb, schema } from "@clipnote/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt } from "better-auth/plugins";
import { oauthProvider } from "@better-auth/oauth-provider";
import { headers } from "next/headers";

// MCPのOAuth 2.1認可サーバーとしてクリップノートを機能させるためのスコープ
// （設計書4-7節・13章）。read/write等の粒度は設けない（要件定義書15章：
// APIキーのスコープ分けと同様、将来検討）。
const MCP_SCOPE = "mcp" as const;

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
    plugins: [
      // oauthProviderが発行するアクセストークンをJWT化し、JWKS
      // （/api/auth/jwks）で公開する。apps/mcp（Resource Server）はネット
      // ワーク越しにDBへ問い合わせず、この公開鍵でローカル検証するだけで
      // 済むため、apps/content同様ステートレスな検証が可能になる（design.md
      // 4-4節のHMACトークン検証と同じ思想）。
      jwt({
        jwt: {
          definePayload: ({ user }) => ({ sub: user.id }),
        },
        // oauthProviderと併用時の推奨設定：jwtプラグイン単体の「セッションご
        // とにJWTへ署名してレスポンスヘッダーに載せる」機能を無効化する
        // （oauthProviderが発行するアクセストークンの署名にのみ鍵を使う）。
        disableSettingJwtHeader: true,
      }),
      // MCPサーバー（mcp.clipnote.paritto.dev）向けのOAuth 2.1認可サーバー
      // 機能（設計書4-7節・13章）。既存のAPIキー方式（packages/auth）とは
      // 併存し、置き換えではない。claude.aiのカスタムコネクタ等、動的client
      // 登録（DCR）が前提のクライアントに対応するためallowDynamicClient
      // Registrationを有効化する。DCRはクライアント（claude.ai側）がユーザー
      // をログインへ誘導する“前”に自己登録する前提のため、未ログイン状態
      // でも登録できるようallowUnauthenticatedClientRegistrationも有効化
      // する（これを外すとclaude.aiからの初回接続がDCRの時点で401になる）。
      oauthProvider({
        loginPage: "/login",
        consentPage: "/oauth/consent",
        allowDynamicClientRegistration: true,
        allowUnauthenticatedClientRegistration: true,
        scopes: [MCP_SCOPE],
        clientRegistrationDefaultScopes: [MCP_SCOPE],
        validAudiences: ["https://mcp.clipnote.paritto.dev"],
        // /.well-known/oauth-authorization-serverはapp/.well-known配下の
        // route.tsで明示的に再公開しているため、起動時の警告を抑制する。
        silenceWarnings: { oauthAuthServerConfig: true },
        schema: {
          oauthClient: { modelName: "oauthClients" },
          oauthAccessToken: { modelName: "oauthAccessTokens" },
          oauthRefreshToken: { modelName: "oauthRefreshTokens" },
          oauthConsent: { modelName: "oauthConsents" },
        },
      }),
    ],
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
