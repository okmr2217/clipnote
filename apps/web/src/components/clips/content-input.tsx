"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ByteCounter } from "@/components/clips/byte-counter";
import { FormatBadge } from "@/components/clips/format-badge";
import {
  MAX_CONTENT_BYTES,
  getUtf8ByteLength,
  looksMojibake,
  validateContent,
  type ContentType,
} from "@clipnote/pages/validation";
import { cn } from "@/lib/utils";

const ERROR_MESSAGES: Record<string, string> = {
  empty: "本文を入力してください。",
  invalid_utf8: "本文に無効な文字が含まれています。",
  too_large: `本文がサイズ上限（${MAX_CONTENT_BYTES.toLocaleString()} bytes）を超えています。`,
};

const PASTE_LABEL: Record<ContentType, string> = {
  html: "貼り付けされたHTML",
  markdown: "貼り付けされたマークダウン",
};

const EXTENSION_FORMAT: Record<string, ContentType> = {
  html: "html",
  htm: "html",
  md: "markdown",
  markdown: "markdown",
  txt: "markdown",
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

// 本文の内容から形式を判定する（設計書5-1節）。厳密な構文解析はせず、
// HTMLタグらしきものが含まれるかどうかの大まかな判定にとどめる。
function detectFormatFromContent(content: string): ContentType {
  const hasHtmlTag = /<\/?[a-z][a-z0-9]*[\s>]/i.test(content.trim());
  return hasHtmlTag ? "html" : "markdown";
}

// ファイル名の拡張子が対応形式なら拡張子を優先し、貼り付けや未対応拡張子の
// 場合は本文の内容から判定する。
function detectContentType(content: string, fileName?: string): ContentType {
  const fromExtension = fileName ? guessFormatFromExtension(fileName) : null;
  return fromExtension ?? detectFormatFromContent(content);
}

export function ContentInput({
  content,
  onContentChange,
  contentType,
  onContentTypeChange,
  onFileNameGuess,
}: {
  content: string;
  onContentChange: (value: string) => void;
  contentType: ContentType;
  onContentTypeChange: (value: ContentType) => void;
  onFileNameGuess?: (nameWithoutExt: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState<"input" | "confirmed">(content.length > 0 ? "confirmed" : "input");
  const [sourceLabel, setSourceLabel] = useState<string | null>(null);
  const [extensionWarning, setExtensionWarning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 貼り付け・ファイル読み込みいずれの経路でも、判定・バリデーションを経て
  // 確定表示（ファイル名/ラベル・形式・サイズ）へ切り替える共通処理。
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

    const nameWithoutExt = file.name.replace(/\.[^./\\]+$/, "");
    onFileNameGuess?.(nameWithoutExt);
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
    setExtensionWarning(false);
    setError(null);
    onContentChange("");
  }

  const byteLength = getUtf8ByteLength(content);
  const mojibakeWarning = looksMojibake(content);

  if (step === "confirmed") {
    return (
      <div className="flex flex-col">
        <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-5 sm:p-7">
          <div className="flex min-w-0 items-center gap-3">
            <FormatBadge contentType={contentType} />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{sourceLabel}</p>
              <ByteCounter byteLength={byteLength} className="text-left" />
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
          AIとの会話などで生成したHTML/Markdownをそのまま貼り付けてください。形式は自動で判定されます。
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
