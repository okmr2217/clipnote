"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ContentInput } from "@/components/clips/content-input";
import { validateContent, type ContentType } from "@clipnote/pages/validation";
import type { ClipRow } from "@/components/clips/types";

const ERROR_MESSAGES: Record<string, string> = {
  empty: "本文を入力してください。",
  invalid_utf8: "本文に無効な文字が含まれています。",
  too_large: "本文がサイズ上限（1,048,576 bytes）を超えています。",
};

export function UpdateContentDialog({
  clip,
  onOpenChange,
  onUpdated,
}: {
  clip: ClipRow | null;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}) {
  // 呼び出し側（ClipList）がclip.idをkeyにして描画するため、開くたびにこの
  // コンポーネント自体が再マウントされ、useStateの初期値だけでリセットできる。
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState<ContentType>(clip?.contentType ?? "html");
  const [currentByteLength, setCurrentByteLength] = useState<number | null>(null);
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clip) return;

    fetch(`/api/pages/${clip.id}/content`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        const parsed = data as { contentByteLength: number } | null;
        if (parsed) setCurrentByteLength(parsed.contentByteLength);
      });
  }, [clip]);

  function handleReviewClick() {
    setError(null);
    const contentError = validateContent(content);
    if (contentError) {
      setError(ERROR_MESSAGES[contentError]);
      return;
    }
    setStep("confirm");
  }

  async function handleConfirm() {
    if (!clip) return;
    setSubmitting(true);
    const response = await fetch(`/api/pages/${clip.id}/content`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, contentType }),
    });
    setSubmitting(false);

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError((body?.error && ERROR_MESSAGES[body.error]) ?? "更新に失敗しました。");
      setStep("form");
      return;
    }

    onOpenChange(false);
    onUpdated();
  }

  const newByteLength = validateContent(content) ? null : new TextEncoder().encode(content).length;

  return (
    <Dialog open={clip !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-5 rounded-3xl p-6 sm:max-w-lg sm:p-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">クリップ本文の差し替え</DialogTitle>
        </DialogHeader>

        {step === "form" ? (
          <>
            <p className="text-sm text-muted-foreground">
              既存の本文を上書きします。この操作は更新履歴として記録され、後から復元・ダウンロードできます。タイトル・公開設定・所属コレクションは変更されません。
            </p>

            <ContentInput
              content={content}
              onContentChange={setContent}
              contentType={contentType}
              onContentTypeChange={setContentType}
            />

            {currentByteLength !== null && newByteLength !== null && (
              <p className="text-xs text-muted-foreground">
                現在: {currentByteLength.toLocaleString()} bytes → 新しい本文:{" "}
                {newByteLength.toLocaleString()} bytes（差分{" "}
                {newByteLength >= currentByteLength ? "+" : ""}
                {(newByteLength - currentByteLength).toLocaleString()} bytes）
              </p>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter className="mx-0 mb-0 border-none bg-transparent p-0">
              <Button
                type="button"
                variant="outline"
                className="h-auto px-6 py-3"
                onClick={() => onOpenChange(false)}
              >
                キャンセル
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="h-auto px-6 py-3"
                onClick={handleReviewClick}
              >
                内容を確認して更新
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <p className="text-sm text-foreground">
              本当にこのクリップの本文を差し替えますか？現在の本文は更新履歴に保存されたうえで上書きされます。
            </p>

            <DialogFooter className="mx-0 mb-0 border-none bg-transparent p-0">
              <Button
                type="button"
                variant="outline"
                className="h-auto px-6 py-3"
                onClick={() => setStep("form")}
                disabled={submitting}
              >
                戻る
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="h-auto px-6 py-3"
                onClick={handleConfirm}
                disabled={submitting}
              >
                上書きして更新する
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
