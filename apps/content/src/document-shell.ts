import { RESIZE_SCRIPT } from "./resize-script";

// 設計書2-2節のデザイントークン（クリーム背景）をこのWorkerが生成する
// ドキュメントに直接埋め込む。HTMLバリアントは本文が自己完結ドキュメントなので
// 幅・余白・配色を持たせず親ページ（apps/web）任せにできるが、Markdown・
// プレーンテキストバリアントはこのWorkerが生成する無地のHTMLなので、中央カラム
// 幅・余白・タイポグラフィをここで持たせて初めてHTMLバリアントと同じ「contentが
// 見た目に責任を持つ」構造になる（親ページ側はiframeをエッジtoエッジで置くだけ）。
// フォントはOS標準フォントに任せる（外部フォント読み込みをしない）。
export const DOCUMENT_STYLE = `
  :root { color-scheme: light; }
  html, body { background: transparent; margin: 0; }
  body {
    max-width: 760px;
    margin: 0 auto;
    padding: 3rem 1rem;
    font-family: ui-sans-serif, system-ui, -apple-system, "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic UI", "Yu Gothic", Meiryo, "Noto Sans CJK JP", "Segoe UI", sans-serif;
    font-size: 16px;
    line-height: 1.75;
    color: #2b2320;
  }
  @media (min-width: 768px) {
    body { padding: 4rem 2rem; }
  }
  body > :first-child { margin-top: 0; }
  body > :last-child { margin-bottom: 0; }
  h1, h2, h3, h4, h5, h6 { margin: 2em 0 0.6em; line-height: 1.3; font-weight: 800; color: #2b2320; }
  h1 { font-size: 1.75em; }
  h2 { font-size: 1.4em; }
  h3 { font-size: 1.15em; }
  p, ul, ol, blockquote, pre, table { margin: 1em 0; }
  ul, ol { padding-left: 1.5em; }
  li { margin: 0.35em 0; }
  a { color: #c1503a; text-decoration: underline; text-underline-offset: 2px; }
  code, pre, kbd, samp { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; font-size: 0.875em; }
  code { background: #f1e7db; padding: 0.15em 0.4em; border-radius: 0.35em; }
  pre { background: #f1e7db; padding: 1em; border-radius: 0.75rem; overflow-x: auto; }
  pre code { background: none; padding: 0; }
  blockquote { padding-left: 1em; border-left: 3px solid #e8dcd0; color: #6b5d52; }
  img { max-width: 100%; height: auto; border-radius: 0.75rem; }
  table { width: 100%; border-collapse: collapse; display: block; overflow-x: auto; font-size: 0.9em; }
  th, td { padding: 0.4em 0.75em; border: none; border-bottom: 1px solid #e8dcd0; }
  th:not([align]), td:not([align]) { text-align: left; }
  th { font-weight: 700; border-bottom: 2px solid #d8c9ba; }
  tr:last-child > td { border-bottom: none; }
  hr { border: none; border-top: 1px solid #e8dcd0; margin: 2em 0; }
  del { color: #8a7a6d; }
  li:has(> input[type="checkbox"]) { list-style: none; margin-left: -1.5em; }
  input[type="checkbox"] { margin-right: 0.5em; }
  .footnotes { margin-top: 2.5em; padding-top: 1.25em; border-top: 1px solid #e8dcd0; font-size: 0.875em; color: #6b5d52; }
  .footnotes ol { padding-left: 1.25em; }
  a[data-footnote-ref] { font-size: 0.75em; }
  .hljs-comment, .hljs-quote { color: #8a7a6d; font-style: italic; }
  .hljs-keyword, .hljs-selector-tag, .hljs-literal, .hljs-subst { color: #c1503a; font-weight: 600; }
  .hljs-string, .hljs-attr, .hljs-regexp, .hljs-addition { color: #7a3226; }
  .hljs-number, .hljs-symbol, .hljs-bullet { color: #a0432e; }
  .hljs-title, .hljs-name, .hljs-section, .hljs-built_in { color: #2b2320; font-weight: 700; }
  .hljs-variable, .hljs-template-variable, .hljs-attribute { color: #6b5d52; }
  .hljs-deletion { color: #a0432e; }
  .hljs-type, .hljs-class .hljs-title { color: #7a3226; font-weight: 600; }
  /* プレーンテキストバリアント（plaintext.ts）：コードブロックのpreとは異なり、
     背景ボックスを持たせず本文と同じフォント・サイズで、改行・空白だけを
     そのまま保持する（設計書5-1節「改行と文字だけ」の表記方針）。 */
  pre.plaintext { background: none; padding: 0; border-radius: 0; overflow-x: visible; white-space: pre-wrap; word-break: break-word; font-family: inherit; font-size: 1em; }
`;

export function wrapHtmlDocument(bodyHtml: string, extraHead = ""): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${extraHead}<style>${DOCUMENT_STYLE}</style></head><body>${bodyHtml}${RESIZE_SCRIPT}</body></html>`;
}

// トークン検証失敗（403）・クリップ未存在（404）時、無地のtext/plainではなく
// 本文と同じトンマナのメッセージを返す（apps/web側の親iframeはRESIZE_SCRIPT
// 経由の高さ通知に対応済みなので、この文書でもそのまま自然に収まる）。
export function wrapErrorDocument(message: string): string {
  return wrapHtmlDocument(`<p style="text-align:center;color:#6b5d52;">${message}</p>`);
}
