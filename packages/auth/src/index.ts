// APIキーの生成・ハッシュ化・マスク表示（設計書8章・13-3節）。webがキーを
// 発行し（生成＋ハッシュ保存）、mcpが検証する（提示されたキーをハッシュ化し
// api_keys.key_hashと照合）。ハッシュ化ロジックが両者で食い違うと認証が
// 壊れるため、content-tokenと同様に共有パッケージとして切り出す。

export const API_KEY_PREFIX = "cn_live_";

// crypto.randomUUID()（ハイフン除去後32桁の16進数、約122bitのランダム性）を
// そのままキー本体として使う。サーバー生成の高エントロピー値であり、
// ユーザー入力のパスワードとは性質が異なるため、追加のエンコードは不要。
export function generateApiKey(): string {
  const random = crypto.randomUUID().replace(/-/g, "");
  return `${API_KEY_PREFIX}${random}`;
}

// SHA-256の単純なダイジェスト（ソルトなし）。key_hashをユニークインデックス
// でO(1)照合できることが認証フローの前提であり、行ごとに異なるソルトを
// 使う設計だと全行を舐めて比較する必要が出てしまう。生キーのエントロピー
// （~122bit、サーバー生成）がレインボーテーブル攻撃を実用上不可能にして
// いるため、低速化ハッシュ（bcrypt等）は不要と判断。
export async function hashApiKey(rawKey: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(rawKey));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// 発行時に一度だけ計算し、api_keys.key_prefixにマスク済み文字列としてその
// まま保存する（生キーの断片を別カラムで保持しない）。生キーは発行直後の
// 1回しか露出しない設計のため、その時点で「表示に必要な分だけ」を確定して
// おき、以降は誰も生キーの文字列に触れずに済むようにする。表示形式は
// 設計書8-1節の例（`cn_live_************abcd`）に合わせる。
export function maskApiKey(rawKey: string): string {
  const tail = rawKey.slice(-4);
  return `${API_KEY_PREFIX}${"*".repeat(12)}${tail}`;
}
