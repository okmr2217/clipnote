// クリップ本文のバリデーション（設計書5章）。管理画面（web）・MCPサーバー
// （mcp）の両方から参照する共有ロジックのため、Web標準APIのみに依存し、
// どちらの実行環境でも同じ判定になるようにする。

export const MAX_CONTENT_BYTES = 1_048_576; // 1MB（設計書5-2節）
export const CONTENT_TYPES = ["html", "markdown"] as const;
export const VISIBILITIES = ["private", "public"] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];
export type Visibility = (typeof VISIBILITIES)[number];

// encodeURIComponentは対のないサロゲートに対してURIErrorを送出するため、
// TextEncoderでバイト数を数える前の「有効なUTF-8文字列か」の簡易チェックに使える
// （TextEncoder自身は不正なサロゲートをU+FFFDに黙って置換してしまい、チェックにならない）。
export function isValidUtf8String(value: string): boolean {
  try {
    encodeURIComponent(value);
    return true;
  } catch {
    return false;
  }
}

export function getUtf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

export type ContentValidationError =
  | "empty"
  | "invalid_utf8"
  | "too_large";

export function validateContent(content: string): ContentValidationError | null {
  if (content.length === 0) return "empty";
  if (!isValidUtf8String(content)) return "invalid_utf8";
  if (getUtf8ByteLength(content) > MAX_CONTENT_BYTES) return "too_large";
  return null;
}

export function isContentType(value: unknown): value is ContentType {
  return typeof value === "string" && (CONTENT_TYPES as readonly string[]).includes(value);
}

export function isVisibility(value: unknown): value is Visibility {
  return typeof value === "string" && (VISIBILITIES as readonly string[]).includes(value);
}

// U+FFFD（文字化けの兆候）が一定割合以上含まれる場合は警告表示に使う
// （設計書5-3節）。ブロックはしない、非同期の目安として呼び出し側が使う。
export function looksMojibake(content: string): boolean {
  if (content.length === 0) return false;
  const replacementCount = (content.match(/�/g) ?? []).length;
  return replacementCount / content.length > 0.01;
}
