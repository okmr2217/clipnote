import { headers } from "next/headers";

// OGP画像等の絶対URLを組み立てるための自オリジン取得。metadataBaseを
// レイアウトのモジュールスコープで固定すると、Workers環境ではリクエスト
// 到達前に評価されてしまう恐れがあるため（lib/db.ts等と同じ理由）、
// リクエスト時に呼び出すheaders()から都度組み立てる。
export async function getSiteOrigin(): Promise<string> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  if (!host) {
    return process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  }
  const defaultProto = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  const proto = requestHeaders.get("x-forwarded-proto") ?? defaultProto;
  return `${proto}://${host}`;
}
