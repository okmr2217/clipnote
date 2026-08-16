import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkEmoji from "remark-emoji";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import { wrapHtmlDocument } from "./document-shell";

// 設計書4-4節：unified/remark/rehypeでMarkdown→HTML変換のみを行う。
// サニタイズ処理（rehype-sanitize等）は導入しない（設計書4-1節：安全性は
// iframeの別ドメイン配信+sandbox属性で担保する設計のため）。
// allowDangerousHtml: Markdown本文中に埋め込まれた生HTMLをそのまま通す
// （falseだと剥ぎ取られてしまい、無害化ではなく機能欠落になるため必須）。
// remarkFrontmatter: 本文先頭のYAML front matter（`---`区切り）を
// メタデータブロックとして切り出す。タイトル抽出は`apps/web`側（貼り付け
// 時点）でのみ行うため、ここではブロックをmdastノードとして認識させ、
// remarkRehypeが未知のノード型として無視する（＝出力から除外する）ことで、
// 本文中に生のfront matterテキストがそのまま表示されてしまう不具合を防ぐ
// 目的だけに使う（設計書design-content.md 4章）。
// remarkGfm: 表・取り消し線・タスクリスト・オートリンク・脚注などGFM拡張に
// 対応する（プレーンなremark-parseだけではCommonMark範囲のみで表などが
// 素通りしてしまう）。footnoteLabel/footnoteBackLabelは英語既定のままだと
// 日本語コンテンツの脚注セクションだけ英語表記になってしまうため上書きする。
// remarkMath+rehypeKatex: `$...$`/`$$...$$`をKaTeXでレンダリングする。
// rehypeHighlight: フェンスドコードブロックの```lang表記をもとに構文強調する
// （言語未指定のコードブロックはそのまま、detect:trueにはしない）。
const processor = unified()
  .use(remarkParse)
  .use(remarkFrontmatter, ["yaml"])
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkEmoji)
  .use(remarkRehype, {
    allowDangerousHtml: true,
    footnoteLabel: "脚注",
    footnoteBackLabel: "本文に戻る",
  })
  .use(rehypeKatex)
  .use(rehypeHighlight)
  .use(rehypeStringify, { allowDangerousHtml: true });

const KATEX_CSS_LINK =
  '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">';

export async function renderMarkdownDocument(markdown: string): Promise<string> {
  const body = String(await processor.process(markdown));
  // $...$ 記法が本文に含まれない場合はKaTeXのCSS読み込み自体が無駄になるため、
  // 変換結果にkatexクラスが出現した場合のみ読み込む（このCSSだけは数式の
  // グリフ表示にKaTeX独自フォントが必要でCDN依存になる。他の見た目は
  // フォントも含めて外部リクエストなしで完結させている）。
  const fontLink = body.includes('class="katex"') ? KATEX_CSS_LINK : "";
  return wrapHtmlDocument(body, fontLink);
}
