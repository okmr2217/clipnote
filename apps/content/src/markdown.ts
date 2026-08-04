import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

// 設計書4-4節：unified/remark/rehypeでMarkdown→HTML変換のみを行う。
// サニタイズ処理（rehype-sanitize等）は導入しない（設計書4-1節：安全性は
// iframeの別ドメイン配信+sandbox属性で担保する設計のため）。
// allowDangerousHtml: Markdown本文中に埋め込まれた生HTMLをそのまま通す
// （falseだと剥ぎ取られてしまい、無害化ではなく機能欠落になるため必須）。
const processor = unified()
  .use(remarkParse)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeStringify, { allowDangerousHtml: true });

export async function renderMarkdownDocument(markdown: string): Promise<string> {
  const body = String(await processor.process(markdown));
  return `<!doctype html><html><head><meta charset="utf-8"></head><body>${body}</body></html>`;
}
