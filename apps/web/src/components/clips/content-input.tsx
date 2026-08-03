"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ByteCounter } from "@/components/clips/byte-counter";
import { getUtf8ByteLength, looksMojibake, type ContentType } from "@/lib/validation";
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
}: {
  content: string;
  onContentChange: (value: string) => void;
  contentType: ContentType;
  onContentTypeChange: (value: ContentType) => void;
  onFileNameGuess?: (nameWithoutExt: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);

  async function handleFile(file: File) {
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
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "rounded-xl border-2 border-dashed border-accent bg-background p-4 transition-colors",
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
            size="sm"
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

      <div className="flex items-center gap-5">
        <Label className="text-sm font-bold">形式</Label>
        <RadioGroup
          value={contentType}
          onValueChange={(value) => {
            onContentTypeChange(value as ContentType);
            setAutoDetected(false);
          }}
          className="grid-flow-col items-center gap-5"
        >
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <RadioGroupItem value="html" /> HTML
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <RadioGroupItem value="markdown" /> Markdown
          </label>
        </RadioGroup>
        {autoDetected && (
          <span className="ml-auto text-xs text-muted-foreground">自動判定されました</span>
        )}
      </div>

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

      <ByteCounter byteLength={byteLength} />
    </div>
  );
}
