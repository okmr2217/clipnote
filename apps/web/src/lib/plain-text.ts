// AIO/LLMO対策（docs/design-web.md 4-9節）。JSを実行しない/別オリジンへの
// リンクを辿らないAIクローラー向けに、本文（`apps/content`が別オリジンの
// sandboxed iframeで配信するため通常は読み取れない）の平文版を`/p/[uuid]`
// 自体（同一オリジン）にsr-onlyで埋め込むための変換。ここで生成した文字列は
// 常にJSXのテキストノードとして描画し、HTMLとして解釈・実行されることは
// ないため、本文の無害化（サニタイズ）をしないという設計方針（4-1節）とは
// 抵触しない。

// 1本文あたり最大1MB（要件定義4章）まで許容されるため、全クローラーへ
// 無制限に転送すると通常閲覧者の転送量にも影響する。上限を設けて切り詰める。
const MAX_PLAIN_TEXT_CHARS = 20_000;

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity: string) => {
    if (entity.startsWith("#")) {
      const isHex = entity[1] === "x" || entity[1] === "X";
      const codePoint = isHex ? Number.parseInt(entity.slice(2), 16) : Number.parseInt(entity.slice(1), 10);
      if (Number.isNaN(codePoint)) return match;
      try {
        return String.fromCodePoint(codePoint);
      } catch {
        return match;
      }
    }
    return NAMED_ENTITIES[entity] ?? match;
  });
}

function htmlToPlainText(html: string): string {
  // <script>/<style>の中身はそもそも本文の読み物ではないため、テキストとして
  // 抜き出すとノイズになる。タグ除去の前にブロックごと取り除く。
  const withoutNonContent = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ");
  const withoutTags = withoutNonContent.replace(/<[^>]+>/g, " ");
  return decodeEntities(withoutTags)
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// front matter（`---`区切りのYAMLブロック）はメタデータであり本文ではない
// ため、apps/contentのレンダリングパイプライン同様に除外する
// （docs/design-content.md 4章）。
function stripFrontMatter(markdown: string): string {
  const match = markdown.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return match ? markdown.slice(match[0].length) : markdown;
}

export function extractPlainText(
  content: string,
  contentType: "html" | "markdown" | "plaintext",
): string {
  const text =
    contentType === "html"
      ? htmlToPlainText(content)
      : contentType === "markdown"
        ? stripFrontMatter(content).trim()
        : content;

  if (text.length <= MAX_PLAIN_TEXT_CHARS) return text;
  return `${text.slice(0, MAX_PLAIN_TEXT_CHARS)}…`;
}
