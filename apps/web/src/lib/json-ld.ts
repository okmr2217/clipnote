// AIO/LLMO対策（docs/design-web.md 4-9節）。JSON-LDにはクリップ／コレクション
// のtitle・description等ユーザー入力をそのまま含めるため、`<script>`要素に
// dangerouslySetInnerHTMLで埋め込む際、値の中に`</script>`が含まれていると
// スクリプトタグを閉じてしまい後続文字列が実行されるおそれがある（本文自体は
// 別オリジンiframeで無害化しない設計だが、ここは親オリジンの<script>に直接
// 挿入するため個別に対策が必要）。山括弧をUnicodeエスケープ（<）に
// 置き換え、タグとして解釈されないようにする。
export function jsonLdScriptProps(data: unknown): {
  type: string;
  dangerouslySetInnerHTML: { __html: string };
} {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return { type: "application/ld+json", dangerouslySetInnerHTML: { __html: json } };
}
