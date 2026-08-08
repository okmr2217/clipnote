import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// OAuth 2.1のディスカバリー・DCR・トークン交換系エンドポイント（設計書4-7節・
// 13-3節）は、MCPクライアント（claude.ai等）が別オリジンから直接fetchする
// 前提のため、CORSを許可する。それ以外（sign-in等セッションCookieに関わる
// エンドポイント）はbetter-authのorigin-checkミドルウェアによる同一オリジン
// 制限を維持し、ここではCORSヘッダーを付与しない。
const PUBLIC_OAUTH_PATH_PREFIXES = ["/api/auth/oauth2/", "/api/auth/jwks"];

function isPublicOAuthPath(pathname: string): boolean {
  return PUBLIC_OAUTH_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function withCors(request: Request, response: Response): Response {
  const pathname = new URL(request.url).pathname;
  if (!isPublicOAuthPath(pathname)) return response;

  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return new Response(response.body, { status: response.status, headers });
}

export async function GET(request: Request) {
  const auth = await getAuth();
  const response = await toNextJsHandler(auth).GET(request);
  return withCors(request, response);
}

export async function POST(request: Request) {
  const auth = await getAuth();
  const response = await toNextJsHandler(auth).POST(request);
  return withCors(request, response);
}

export async function OPTIONS(request: Request) {
  const pathname = new URL(request.url).pathname;
  if (!isPublicOAuthPath(pathname)) return new Response(null, { status: 204 });

  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
