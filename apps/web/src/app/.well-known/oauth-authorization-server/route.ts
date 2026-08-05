import { oauthProviderAuthServerMetadata } from "@better-auth/oauth-provider";
import { getAuth } from "@/lib/auth";

// oauthProviderプラグインのgetOAuthServerConfigエンドポイントは、better-auth
// のcatch-all（/api/auth配下）にマウントされる。RFC 8414・MCP認可仕様は
// このメタデータをオリジン直下の/.well-known/に要求するため、ここで明示的に
// 再公開する。
export async function GET(request: Request) {
  const auth = await getAuth();
  return oauthProviderAuthServerMetadata(auth)(request);
}
