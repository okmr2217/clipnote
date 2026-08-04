import { createContentToken as signContentToken } from "@clipnote/content-token";

// process.env読み取りはリクエスト処理中の関数内でのみ行う。モジュール
// スコープ（トップレベル）で読むと、Workers環境ではリクエスト到達前の
// isolate起動時に評価されてしまい値が入っていない（lib/db.ts・lib/auth.ts
// のD1バインディング遅延取得と同じ理由）。
function getContentTokenSecret(): string {
  const secret = process.env.CONTENT_TOKEN_SECRET;
  if (!secret) {
    throw new Error("CONTENT_TOKEN_SECRET is not set");
  }
  return secret;
}

// iframeの埋め込み先を組み立てるためのcontentドメインのオリジン
// （設計書1章）。ビルド時に埋め込まれるクライアント公開値のため
// NEXT_PUBLIC_接頭辞を使う。
export function getContentOrigin(): string {
  const origin = process.env.NEXT_PUBLIC_CONTENT_ORIGIN;
  if (!origin) {
    throw new Error("NEXT_PUBLIC_CONTENT_ORIGIN is not set");
  }
  return origin;
}

// userIdは署名対象に含まれるだけで、content側の認可判定には使われない
// （content側はステートレスでユーザーテーブルを参照しない、設計書4-4節）。
// 未認証の公開クリップ閲覧ではセッションが無いため"anonymous"を詰める。
export async function issueContentToken(uuid: string, userId: string | null): Promise<string> {
  return signContentToken({ userId: userId ?? "anonymous", uuid, secret: getContentTokenSecret() });
}
