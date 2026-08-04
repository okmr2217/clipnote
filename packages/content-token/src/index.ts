// HMAC-SHA256の署名付き短命トークン（設計書4-4節）。webがトークンを発行し、
// contentが検証する。両者が別々に実装すると仕様変更が片方だけ漏れる事故に
// つながるため共有パッケージとして切り出す（設計書12-2節）。
//
// トークン構造：
//   payload = "{userId}:{uuid}:{exp}"
//   sig     = HMAC-SHA256(payload, secret)（hex文字列）
//   token   = base64url("{payload}:{sig}")
//
// 検証（HMAC計算のみで完結し、DBアクセスは不要）は content 側の責務。
// userIdはペイロードの一部として署名対象に含まれるのみで、content側の
// 認可判定には使わない（content側はセッション/ユーザーテーブルを持たない
// ステートレス設計のため）。

export const CONTENT_TOKEN_TTL_SECONDS = 120; // 有効期限2分（設計書4-4節）

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array | null {
  if (hex.length % 2 !== 0 || !/^[0-9a-f]*$/i.test(hex)) return null;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function importHmacKey(secret: string, usage: "sign" | "verify") {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    [usage],
  );
}

export async function createContentToken(params: {
  userId: string;
  uuid: string;
  secret: string;
  now?: number;
}): Promise<string> {
  const exp = Math.floor((params.now ?? Date.now()) / 1000) + CONTENT_TOKEN_TTL_SECONDS;
  const payload = `${params.userId}:${params.uuid}:${exp}`;

  const key = await importHmacKey(params.secret, "sign");
  const sigBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const sigHex = toHex(sigBuffer);

  return toBase64Url(encoder.encode(`${payload}:${sigHex}`));
}

export interface ContentTokenPayload {
  userId: string;
  uuid: string;
  exp: number;
}

/**
 * トークンを検証する。署名が不正・期限切れ・uuid不一致のいずれかであれば
 * nullを返す（設計書4-4節：他クリップへのトークン流用を防ぐためuuid一致
 * 確認を必須とする）。
 */
export async function verifyContentToken(params: {
  token: string;
  uuid: string;
  secret: string;
  now?: number;
}): Promise<ContentTokenPayload | null> {
  let decoded: string;
  try {
    decoded = new TextDecoder().decode(fromBase64Url(params.token));
  } catch {
    return null;
  }

  const parts = decoded.split(":");
  if (parts.length !== 4) return null;
  const [userId, uuid, expStr, sigHex] = parts;

  if (uuid !== params.uuid) return null;

  const exp = Number(expStr);
  if (!Number.isInteger(exp)) return null;
  const nowSeconds = Math.floor((params.now ?? Date.now()) / 1000);
  if (nowSeconds > exp) return null;

  const sigBytes = fromHex(sigHex);
  if (!sigBytes) return null;

  const payload = `${userId}:${uuid}:${expStr}`;
  const key = await importHmacKey(params.secret, "verify");
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes as BufferSource,
    encoder.encode(payload),
  );
  if (!valid) return null;

  return { userId, uuid, exp };
}
