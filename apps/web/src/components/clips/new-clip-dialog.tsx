"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContentInput } from "@/components/clips/content-input";
import { VisibilityField } from "@/components/clips/visibility-field";
import { CollectionMultiselect } from "@/components/clips/collection-multiselect";
import { validateContent, type ContentType, type Visibility } from "@/lib/validation";
import type { CollectionOption } from "@/components/clips/types";

const ERROR_MESSAGES: Record<string, string> = {
  empty: "本文を入力してください。",
  invalid_utf8: "本文に無効な文字が含まれています。",
  too_large: "本文がサイズ上限（1,048,576 bytes）を超えています。",
  invalid_title: "タイトルを入力してください。",
};

export function NewClipDialog({
  open,
  onOpenChange,
  collectionOptions,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionOptions: CollectionOption[];
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);
  const [contentType, setContentType] = useState<ContentType>("html");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [collectionIds, setCollectionIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setTitle("");
    setTitleTouched(false);
    setContentType("html");
    setContent("");
    setVisibility("private");
    setCollectionIds([]);
    setError(null);
  }

  async function handleSubmit() {
    setError(null);

    if (title.trim().length === 0) {
      setError(ERROR_MESSAGES.invalid_title);
      return;
    }
    const contentError = validateContent(content);
    if (contentError) {
      setError(ERROR_MESSAGES[contentError]);
      return;
    }

    setSubmitting(true);
    const response = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, contentType, content, visibility, collectionIds }),
    });
    setSubmitting(false);

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError((body?.error && ERROR_MESSAGES[body.error]) ?? "登録に失敗しました。");
      return;
    }

    reset();
    onOpenChange(false);
    onCreated();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-lg rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">新規クリップ登録</DialogTitle>
        </DialogHeader>

        <ContentInput
          content={content}
          onContentChange={setContent}
          contentType={contentType}
          onContentTypeChange={setContentType}
          onFileNameGuess={(name) => {
            if (!titleTouched) setTitle(name);
          }}
        />

        <div className="flex flex-col gap-2">
          <Label htmlFor="new-clip-title" className="text-sm font-bold">
            タイトル
          </Label>
          <Input
            id="new-clip-title"
            placeholder="クリップのタイトルを入力"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setTitleTouched(true);
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm font-bold">公開設定</Label>
          <VisibilityField value={visibility} onChange={setVisibility} />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm font-bold">
            コレクション <span className="font-normal text-muted-foreground">（任意）</span>
          </Label>
          <CollectionMultiselect
            options={collectionOptions}
            value={collectionIds}
            onChange={setCollectionIds}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter className="border-none bg-transparent p-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={submitting}>
            登録
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
