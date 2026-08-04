"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ByteCounter } from "@/components/clips/byte-counter";
import { MAX_CONTENT_BYTES, getUtf8ByteLength, looksMojibake, type ContentType } from "@/lib/validation";
import { cn } from "@/lib/utils";

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

// 選択中の形式と本文の食い違いを大まかに検知する（設計書5-1節：警告のみ、
// ブロックしない）。厳密な構文解析はしない。
function looksLikeFormatMismatch(content: string, contentType: ContentType): boolean {
  const trimmed = content.trim();
  if (trimmed.length === 0) return false;
  const hasHtmlTag = /<\/?[a-z][a-z0-9]*[\s>]/i.test(trimmed);
  if (contentType === "markdown" && /<!doctype html|<html[\s>]/i.test(trimmed)) return true;
  if (contentType === "html" && !hasHtmlTag) return true;
  return false;
}

export function ContentInput({
  content,
  onContentChange,
  contentType,
  onContentTypeChange,
  onFileNameGuess,
  showByteCounter = true,
}: {
  content: string;
  onContentChange: (value: string) => void;
  contentType: ContentType;
  onContentTypeChange: (value: ContentType) => void;
  onFileNameGuess?: (nameWithoutExt: string) => void;
  showByteCounter?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);
  const [extensionWarning, setExtensionWarning] = useState(false);
  const [fileSizeError, setFileSizeError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setFileSizeError(null);

    // 設計書5-3節：実際にテキストとして読み込む前に File.size で事前チェックする。
    if (file.size > MAX_CONTENT_BYTES) {
      setFileSizeError(
        `ファイルサイズが上限（${MAX_CONTENT_BYTES.toLocaleString()} bytes）を超えています。`,
      );
      return;
    }

    setExtensionWarning(!hasRecognizedExtension(file.name));

    const text = await file.text();
    onContentChange(text);

    const guessed = guessFormatFromExtension(file.name);
    if (guessed) {
      onContentTypeChange(guessed);
      setAutoDetected(true);
    } else {
      setAutoDetected(false);
    }

    const nameWithoutExt = file.name.replace(/\.[^./\\]+$/, "");
    onFileNameGuess?.(nameWithoutExt);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) void handleFile(file);
  }

  const byteLength = getUtf8ByteLength(content);
  const mojibakeWarning = looksMojibake(content);
  const mismatchWarning = looksLikeFormatMismatch(content, contentType);

  return (
    <div className="flex flex-col">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "mb-[22px] rounded-xl border-2 border-dashed border-accent bg-background p-5 transition-colors sm:p-7",
          isDragging && "bg-accent/20",
        )}
      >
        <Textarea
          value={content}
          onChange={(event) => {
            onContentChange(event.target.value);
            setAutoDetected(false);
          }}
          placeholder="ここに貼り付け、またはファイルをドラッグ&ドロップ"
          className="min-h-40 resize-y border-none bg-transparent p-0 shadow-none focus-visible:ring-0"
        />
        <div className="mt-3 flex justify-end">
          <Button
            type="button"
            variant="secondary"
            className="h-auto px-4.5 py-2.5 text-[13px]"
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
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Label className="text-sm font-bold">形式</Label>
          <RadioGroup
            value={contentType}
            onValueChange={(value) => {
              onContentTypeChange(value as ContentType);
              setAutoDetected(false);
            }}
            className="w-auto grid-flow-col items-center gap-5"
          >
            <label className="flex cursor-pointer items-center gap-2 text-sm whitespace-nowrap">
              <RadioGroupItem value="html" /> HTML
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm whitespace-nowrap">
              <RadioGroupItem value="markdown" /> Markdown
            </label>
          </RadioGroup>
          {autoDetected && (
            <span className="ml-auto text-xs whitespace-nowrap text-muted-foreground">
              自動判定されました
            </span>
          )}
        </div>

        {fileSizeError && <p className="text-xs text-destructive">{fileSizeError}</p>}
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
        {!mojibakeWarning && mismatchWarning && (
          <p className="text-xs text-primary">
            選択中の形式と本文の内容が一致していない可能性があります。
          </p>
        )}

        {showByteCounter && <ByteCounter byteLength={byteLength} />}
      </div>
    </div>
  );
}
