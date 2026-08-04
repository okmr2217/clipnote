import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { RESIZE_SCRIPT } from "./resize-script";

// 設計書4-4節：unified/remark/rehypeでMarkdown→HTML変換のみを行う。
// サニタイズ処理（rehype-sanitize等）は導入しない（設計書4-1節：安全性は
// iframeの別ドメイン配信+sandbox属性で担保する設計のため）。
// allowDangerousHtml: Markdown本文中に埋め込まれた生HTMLをそのまま通す
// （falseだと剥ぎ取られてしまい、無害化ではなく機能欠落になるため必須）。
const processor = unified()
  .use(remarkParse)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeStringify, { allowDangerousHtml: true });

// 設計書2-2節のデザイントークン（クリーム背景・Plus Jakarta Sans/JetBrains Mono）
// をこのWorkerが生成するドキュメントに直接埋め込む。HTMLバリアントは本文が
// 自己完結ドキュメントなので幅・余白・配色を持たせず親ページ（apps/web）任せに
// できるが、Markdownバリアントはこのunified変換で生成する無地のHTMLなので、
// 中央カラム幅・余白・タイポグラフィをここで持たせて初めてHTMLバリアントと
// 同じ「contentが見た目に責任を持つ」構造になる（親ページ側はiframeを
// エッジtoエッジで置くだけ）。
const STYLE = `
  :root { color-scheme: light; }
  html, body { background: transparent; margin: 0; }
  body {
    max-width: 680px;
    margin: 0 auto;
    padding: 3rem 1rem;
    font-family: "Plus Jakarta Sans", ui-sans-serif, system-ui, -apple-system, sans-serif;
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
  code, pre, kbd, samp { font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace; font-size: 0.875em; }
  code { background: #f1e7db; padding: 0.15em 0.4em; border-radius: 0.35em; }
  pre { background: #f1e7db; padding: 1em; border-radius: 0.75rem; overflow-x: auto; }
  pre code { background: none; padding: 0; }
  blockquote { padding-left: 1em; border-left: 3px solid #e8dcd0; color: #6b5d52; }
  img { max-width: 100%; height: auto; border-radius: 0.75rem; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #e8dcd0; padding: 0.5em 0.75em; text-align: left; }
  th { background: #f3e4da; font-weight: 700; }
  hr { border: none; border-top: 1px solid #e8dcd0; margin: 2em 0; }
`;

const FONT_LINK =
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap">';

export async function renderMarkdownDocument(markdown: string): Promise<string> {
  const body = String(await processor.process(markdown));
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${FONT_LINK}<style>${STYLE}</style></head><body>${body}${RESIZE_SCRIPT}</body></html>`;
}
