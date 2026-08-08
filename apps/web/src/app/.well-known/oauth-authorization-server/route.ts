import { oauthProviderAuthServerMetadata } from "@better-auth/oauth-provider";
import { getAuth } from "@/lib/auth";

// oauthProviderプラグインのgetOAuthServerConfigエンドポイントは、better-auth
// のcatch-all（/api/auth配下）にマウントされる。RFC 8414・MCP認可仕様は
// このメタデータをオリジン直下の/.well-known/に要求するため、ここで明示的に
// 再公開する。MCPクライアント（claude.ai等）が別オリジンからfetchしてJSで
// 読み取る前提のため、CORSを許可する。
//
// 注意：issuerが`{baseURL}/api/auth`とパスを含むため、RFC 8414準拠クライアン
// トは本来`/.well-known/oauth-authorization-server/api/auth`（ホストとパスの
// 間に.well-knownを挿入）を叩く。そちらは
// `./api/auth/route.ts`が同じハンドラを再公開している。このファイルへの直接
// アクセスは非準拠クライアント向けのフォールバックとして残す。
export async function GET(request: Request) {
  const auth = await getAuth();
  const response = await oauthProviderAuthServerMetadata(auth)(request);
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  return new Response(response.body, { status: response.status, headers });
}
