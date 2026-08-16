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
import { parse as parseYaml } from "yaml";
import { wrapHtmlDocument } from "./document-shell";

// 設計書4-4節：unified/remark/rehypeでMarkdown→HTML変換のみを行う。
// サニタイズ処理（rehype-sanitize等）は導入しない（設計書4-1節：安全性は
// iframeの別ドメイン配信+sandbox属性で担保する設計のため）。
// allowDangerousHtml: Markdown本文中に埋め込まれた生HTMLをそのまま通す
// （falseだと剥ぎ取られてしまい、無害化ではなく機能欠落になるため必須）。
// remarkFrontmatter: 本文先頭のYAML front matter（`---`区切り）を
// メタデータブロックとして切り出す。切り出したブロックをmdastノードとして
// 認識させ、remarkRehypeが未知のノード型として無視する（＝本文の出力から
// 除外する）ことで、生のfront matterテキストが本文中にそのまま表示されて
// しまう不具合を防ぐ。値そのものの表示は below の`renderFrontMatterHtml`が
// 別途YAMLパースして担う（設計書design-content.md 4章）。
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

// 本文が`---`から始まる場合のみfront matterとみなす（`apps/web`の
// タイトル抽出と同じ判定基準。design-web.md 5-4節参照）。
const FRONT_MATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// 配列（スカラーのみ）は読点区切りのテキストに、ネストしたオブジェクト・
// 配列はJSON文字列にフォールバックする（構造の解釈はせず、値をそのまま
// 見せることだけを目的とするため）。
function formatFrontMatterValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map((item) => (item !== null && typeof item === "object" ? JSON.stringify(item) : String(item)))
      .join("、");
  }
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  return String(value);
}

// front matterのYAMLをパースし、キー・値の一覧をメタデータ欄（`<dl>`）として
// HTML化する。`title`キーは`pages.title`（管理画面のタイトル自動取得で
// 反映済み。design-web.md 5-4節）としてページ側で既に表示されているため、
// ここでの重複表示を避けるため除外する。パース失敗・トップレベルがオブジェクト
// でない・表示可能なキーが1つもない場合はnull（本文のレンダリング自体は
// 失敗させない。design-content.md 4章）。
function renderFrontMatterHtml(rawYaml: string): string | null {
  let parsed: unknown;
  try {
    parsed = parseYaml(rawYaml);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;

  const rows = Object.entries(parsed as Record<string, unknown>)
    .filter(([key, value]) => key.toLowerCase() !== "title" && value !== null && value !== undefined && value !== "")
    .map(([key, value]) => `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(formatFrontMatterValue(value))}</dd>`)
    .join("");

  return rows ? `<dl class="frontmatter">${rows}</dl>` : null;
}

export async function renderMarkdownDocument(markdown: string): Promise<string> {
  const body = String(await processor.process(markdown));
  // $...$ 記法が本文に含まれない場合はKaTeXのCSS読み込み自体が無駄になるため、
  // 変換結果にkatexクラスが出現した場合のみ読み込む（このCSSだけは数式の
  // グリフ表示にKaTeX独自フォントが必要でCDN依存になる。他の見た目は
  // フォントも含めて外部リクエストなしで完結させている）。
  const fontLink = body.includes('class="katex"') ? KATEX_CSS_LINK : "";

  const frontMatterMatch = FRONT_MATTER_PATTERN.exec(markdown);
  const frontMatterHtml = frontMatterMatch ? renderFrontMatterHtml(frontMatterMatch[1]) : null;

  return wrapHtmlDocument((frontMatterHtml ?? "") + body, fontLink);
}
