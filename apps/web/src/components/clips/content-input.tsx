"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FormatBadge } from "@/components/clips/format-badge";
import { MAX_CONTENT_BYTES, looksMojibake, validateContent, type ContentType } from "@clipnote/pages/validation";
import { cn } from "@/lib/utils";

const ERROR_MESSAGES: Record<string, string> = {
  empty: "本文を入力してください。",
  invalid_utf8: "本文に無効な文字が含まれています。",
  too_large: `本文がサイズ上限（${MAX_CONTENT_BYTES.toLocaleString()} bytes）を超えています。`,
};

const PASTE_LABEL: Record<ContentType, string> = {
  html: "貼り付けされたHTML",
  markdown: "貼り付けされたマークダウン",
  plaintext: "貼り付けされたプレーンテキスト",
};

const EXTENSION_FORMAT: Record<string, ContentType> = {
  html: "html",
  htm: "html",
  md: "markdown",
  markdown: "markdown",
  txt: "plaintext",
};

function guessFormatFromExtension(fileName: string): ContentType | null {
  const match = /\.([a-zA-Z0-9]+)$/.exec(fileName);
  const ext = match?.[1]?.toLowerCase();
  if (!ext || !(ext in EXTENSION_FORMAT)) return null;
  return EXTENSION_FORMAT[ext];
}

// 拡張子が対象外の場合の警告文（設計書5-3節：ブロックせず警告のみ）。
function hasRecognizedExtension(fileName: string): boolean {
  const match = /\.([a-zA-Z0-9]+)$/.exec(fileName);
  const ext = match?.[1]?.toLowerCase();
  return !!ext && ext in EXTENSION_FORMAT;
}

// Markdownらしい記法（見出し・リスト・引用・コードブロック・表・リンク・強調・
// 区切り線）を大まかに検出する。プレーンテキスト（会話ログやメモ書きなど）は
// これらの記法を含まないことが多いため、いずれにも一致しない場合はプレーン
// テキストとみなす（厳密なCommonMark判定はしない。設計書5-1節と同じ方針）。
const MARKDOWN_MARKERS: RegExp[] = [
  /^#{1,6}\s+\S/m,
  /^\s*([-*+]|\d+\.)\s+\S/m,
  /^>\s?\S/m,
  /^```/m,
  /^\s*\|.+\|\s*$/m,
  /\[[^\]]+\]\([^)]+\)/,
  /(\*\*|__)[^\s*_][^*_]*\1/,
  /^([-*_]\s*){3,}$/m,
];

function looksLikeMarkdown(content: string): boolean {
  return MARKDOWN_MARKERS.some((pattern) => pattern.test(content));
}

// 本文の内容から形式を判定する（設計書5-1節）。厳密な構文解析はせず、
// HTMLタグらしきものが含まれるか→Markdownらしい記法が含まれるか、の順で
// 大まかに判定し、どちらでもなければプレーンテキストとする。
function detectFormatFromContent(content: string): ContentType {
  const hasHtmlTag = /<\/?[a-z][a-z0-9]*[\s>]/i.test(content.trim());
  if (hasHtmlTag) return "html";
  return looksLikeMarkdown(content) ? "markdown" : "plaintext";
}

// ファイル名の拡張子が対応形式なら拡張子を優先し、貼り付けや未対応拡張子の
// 場合は本文の内容から判定する。
function detectContentType(content: string, fileName?: string): ContentType {
  const fromExtension = fileName ? guessFormatFromExtension(fileName) : null;
  return fromExtension ?? detectFormatFromContent(content);
}

const MAX_GUESSED_TITLE_LENGTH = 120;

function stripHtmlTags(value: string): string {
  return value.replace(/<[^>]+>/g, "");
}

function truncateTitle(value: string): string {
  return value.length > MAX_GUESSED_TITLE_LENGTH
    ? `${value.slice(0, MAX_GUESSED_TITLE_LENGTH - 1)}…`
    : value;
}

// <title>タグ、なければ最初の<h1>のテキストをタイトル候補として抽出する。
// どちらも無ければnull（断片的なHTMLではよくあるため、失敗はエラーではない）。
function extractHtmlTitle(html: string): string | null {
  const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  const titleText = stripHtmlTags(titleMatch?.[1] ?? "").trim();
  if (titleText) return titleText;

  const h1Match = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
  const h1Text = stripHtmlTags(h1Match?.[1] ?? "").trim();
  return h1Text || null;
}

// 本文が先頭行から`---`で始まる場合のみYAML front matterとみなし、対応する
// 閉じ`---`までのブロックを本文から切り離す。それ以外（`---`が先頭行でない、
// 閉じの`---`が無い等）はfront matterとして扱わない（Markdownの区切り線・
// 表記法との誤判定を避けるため）。
function stripFrontMatter(markdown: string): { block: string | null; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(markdown);
  if (!match) return { block: null, body: markdown };
  return { block: match[1], body: markdown.slice(match[0].length) };
}

// front matterブロック内から`title:`行のみを読み取る（他キーは対象外。
// タイトル欄と重複するdescription/tags等は要件定義書5-7節でMVP対象外の
// ため扱わない）。YAMLパーサは導入せず、単純な`key: value`一行のみを
// 対象にする最小限の抽出に留める。前後のクォート（`"`/`'`）は取り除く。
function extractFrontMatterTitle(block: string): string | null {
  const titleLine = block.split(/\r?\n/).find((line) => /^title\s*:/.test(line.trim()));
  if (!titleLine) return null;
  const value = titleLine
    .trim()
    .replace(/^title\s*:\s*/, "")
    .trim()
    .replace(/^(["'])([\s\S]*)\1$/, "$2")
    .trim();
  return value || null;
}

// タイトル候補は、本文先頭のYAML front matterの`title:`があればそれを
// 最優先とする（HTMLの`<title>`タグに相当する、明示的なメタデータのため）。
// 無ければfront matter除去後の本文で、先頭の`# 見出し`（H1）のみを候補と
// する。見出し以外の先頭行（表・コードブロックの断片等）をタイトル扱いに
// すると誤検知しやすいため、フォールバックはしない。
function extractMarkdownTitle(markdown: string): string | null {
  const { block, body } = stripFrontMatter(markdown);
  const frontMatterTitle = block ? extractFrontMatterTitle(block) : null;
  if (frontMatterTitle) return frontMatterTitle;

  for (const line of body.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const headingMatch = /^#\s+(.+)$/.exec(trimmed);
    return headingMatch ? headingMatch[1].trim() || null : null;
  }
  return null;
}

// 先頭の空行を除いた最初の行をタイトル候補とする。プレーンテキストには
// 見出し構文がないため、空でなければ無条件に採用する（会議メモ等では
// 一行目がタイトルのように書かれることが多いため）。
function extractPlainTextTitle(content: string): string | null {
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed) return trimmed;
  }
  return null;
}

function extractContentTitle(content: string, contentType: ContentType): string | null {
  const extracted =
    contentType === "html"
      ? extractHtmlTitle(content)
      : contentType === "markdown"
        ? extractMarkdownTitle(content)
        : extractPlainTextTitle(content);
  return extracted ? truncateTitle(extracted) : null;
}

// タイトルの取得優先度：本文から抽出できた場合はそれを優先し（AI生成コンテンツは
// ファイル名より本文中のタイトルの方が説明的なため）、取れない場合のみファイル名
// （拡張子除去）にフォールバックする。
function guessTitle(content: string, contentType: ContentType, fileName?: string): string | null {
  const contentTitle = extractContentTitle(content, contentType);
  if (contentTitle) return contentTitle;

  if (fileName) {
    const nameWithoutExt = fileName.replace(/\.[^./\\]+$/, "").trim();
    if (nameWithoutExt) return nameWithoutExt;
  }

  return null;
}

export function ContentInput({
  content,
  onContentChange,
  contentType,
  onContentTypeChange,
  onTitleGuess,
}: {
  content: string;
  onContentChange: (value: string) => void;
  contentType: ContentType;
  onContentTypeChange: (value: ContentType) => void;
  onTitleGuess?: (title: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState<"input" | "confirmed">(content.length > 0 ? "confirmed" : "input");
  const [sourceLabel, setSourceLabel] = useState<string | null>(null);
  const [titleGuess, setTitleGuess] = useState<string | null>(null);
  const [extensionWarning, setExtensionWarning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 貼り付け・ファイル読み込みいずれの経路でも、判定・バリデーションを経て
  // 確定表示（ファイル名/ラベル・形式・タイトル候補）へ切り替える共通処理。
  function finalizeContent(text: string, fileName?: string) {
    const validationError = validateContent(text);
    if (validationError) {
      setError(ERROR_MESSAGES[validationError]);
      onContentChange(text);
      return;
    }

    const detected = detectContentType(text, fileName);
    setError(null);
    onContentChange(text);
    onContentTypeChange(detected);
    setSourceLabel(fileName ?? PASTE_LABEL[detected]);
    setStep("confirmed");

    const guessedTitle = guessTitle(text, detected, fileName);
    setTitleGuess(guessedTitle);
    if (guessedTitle) onTitleGuess?.(guessedTitle);
  }

  async function handleFile(file: File) {
    setError(null);

    // 設計書5-3節：実際にテキストとして読み込む前に File.size で事前チェックする。
    if (file.size > MAX_CONTENT_BYTES) {
      setError(`ファイルサイズが上限（${MAX_CONTENT_BYTES.toLocaleString()} bytes）を超えています。`);
      return;
    }

    setExtensionWarning(!hasRecognizedExtension(file.name));

    const text = await file.text();
    finalizeContent(text, file.name);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) void handleFile(file);
  }

  function handlePaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
    const text = event.clipboardData.getData("text");
    if (!text) return;
    event.preventDefault();
    setExtensionWarning(false);
    finalizeContent(text);
  }

  function handleReset() {
    setStep("input");
    setSourceLabel(null);
    setTitleGuess(null);
    setExtensionWarning(false);
    setError(null);
    onContentChange("");
  }

  const mojibakeWarning = looksMojibake(content);

  if (step === "confirmed") {
    return (
      <div className="flex flex-col">
        <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-5 sm:p-7">
          <div className="flex min-w-0 items-center gap-3">
            <FormatBadge contentType={contentType} />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{sourceLabel}</p>
              {titleGuess && <p className="truncate text-xs text-muted-foreground">{titleGuess}</p>}
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-auto shrink-0 px-4 py-2 text-[13px]"
            onClick={handleReset}
          >
            変更する
          </Button>
        </div>

        {extensionWarning && (
          <p className="text-xs text-primary">
            対応する拡張子（.html / .htm / .md / .markdown / .txt）以外のファイルです。
          </p>
        )}
        {mojibakeWarning && (
          <p className="text-xs text-primary">
            文字化けの可能性があります（UTF-8として正しく読み込めているか確認してください）。
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="mb-2 rounded-xl border border-border bg-background p-4">
        <Label className="text-sm font-bold">テキストを貼り付け</Label>
        <p className="mt-1 text-xs text-muted-foreground">
          AIとの会話などで生成したHTML/Markdown、会話ログやメモ書きなどのプレーンテキストをそのまま貼り付けてください。形式は自動で判定されます。
        </p>
        <Textarea
          value={content}
          onChange={(event) => {
            onContentChange(event.target.value);
            setError(null);
          }}
          onPaste={handlePaste}
          placeholder="ここに貼り付け"
          rows={1}
          className="field-sizing-fixed mt-2 min-h-0 resize-none overflow-y-auto rounded-md bg-background px-3.5 py-3 text-base shadow-none"
        />
        {content.trim().length > 0 && (
          <div className="mt-2 flex justify-end">
            <Button
              type="button"
              className="h-auto px-4.5 py-2.5 text-[13px]"
              onClick={() => finalizeContent(content)}
            >
              確定
            </Button>
          </div>
        )}
      </div>

      <div className="mb-2 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        または
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "mb-2 flex flex-col gap-2 rounded-xl border-2 border-dashed border-accent bg-background p-4 transition-colors sm:flex-row sm:items-center sm:justify-between",
          isDragging && "bg-accent/20",
        )}
      >
        <div className="min-w-0">
          <Label className="text-sm font-bold">ファイルをアップロード</Label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            ドラッグ&ドロップ、または選択してください（.html / .htm / .md / .markdown / .txt）。ブラウザ内でのみ読み込まれ、送信されません。
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="h-auto shrink-0 px-4.5 py-2.5 text-[13px]"
          onClick={() => fileInputRef.current?.click()}
        >
          ファイルを選択
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".html,.htm,.md,.markdown,.txt"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
            event.target.value = "";
          }}
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
