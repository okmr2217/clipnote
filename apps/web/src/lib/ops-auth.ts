import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createRemoteJWKSet, jwtVerify } from "jose";

// `/ops`（運営者向けの内部管理画面）はbetter-authのセッションではなく、
// Cloudflare Access（Zero Trust）で保護する別系統の認証。Access側で`/ops`
// 配下をApplicationとして登録し、認証済みリクエストにのみ付与される
// `Cf-Access-Jwt-Assertion`ヘッダーのJWTを検証する。Access Application自体が
// 直接アクセスをブロックする前提だが、Workerへの直接到達（設定ミス等）に
// 備えた多層防御としてアプリ側でも署名・iss・audを検証する。
const ACCESS_JWT_HEADER = "Cf-Access-Jwt-Assertion";

let jwksInstance: ReturnType<typeof createRemoteJWKSet> | undefined;
let jwksTeamDomain: string | undefined;

function getJwks(teamDomain: string) {
  if (jwksInstance && jwksTeamDomain === teamDomain) return jwksInstance;

  jwksInstance = createRemoteJWKSet(new URL(`https://${teamDomain}/cdn-cgi/access/certs`));
  jwksTeamDomain = teamDomain;

  return jwksInstance;
}

export async function verifyOpsAccess(headers: Headers): Promise<boolean> {
  const token = headers.get(ACCESS_JWT_HEADER);
  if (!token) return false;

  const { env } = await getCloudflareContext({ async: true });
  const teamDomain = env.CF_ACCESS_TEAM_DOMAIN;
  const aud = env.CF_ACCESS_AUD;
  if (!teamDomain || !aud) return false;

  try {
    await jwtVerify(token, getJwks(teamDomain), {
      issuer: `https://${teamDomain}`,
      audience: aud,
    });
    return true;
  } catch {
    return false;
  }
}
