"use client";

import { useState } from "react";
import { CopyIcon } from "lucide-react";
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
import { CopyButton } from "@/components/ui/copy-button";

// "name": 名前入力ダイアログ（設計書8-2節1段階目）
// { rawKey }: 発行成功後、生キー全文を1回だけ表示する段階（同2段階目）
type Stage = "name" | { rawKey: string };

export function IssueApiKeyDialog({
  open,
  onOpenChange,
  onIssued,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIssued: () => void;
}) {
  const [name, setName] = useState("");
  const [stage, setStage] = useState<Stage>("name");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName("");
    setStage("name");
    setSubmitting(false);
    setError(null);
  }

  async function handleIssue() {
    setError(null);
    if (name.trim().length === 0) {
      setError("名前を入力してください。");
      return;
    }

    setSubmitting(true);
    const response = await fetch("/api/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setSubmitting(false);

    if (!response.ok) {
      setError("発行に失敗しました。");
      return;
    }

    const body = (await response.json()) as { rawKey: string };
    setStage({ rawKey: body.rawKey });
    onIssued();
  }

  function handleClose() {
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-lg gap-0 rounded-3xl p-6 sm:max-w-lg sm:p-8">
        {stage === "name" ? (
          <>
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-extrabold">新規APIキー</DialogTitle>
            </DialogHeader>

            <div className="mb-2 flex flex-col gap-2">
              <Label htmlFor="new-api-key-name" className="text-sm font-bold">
                名前
              </Label>
              <Input
                id="new-api-key-name"
                placeholder="例: Claude Desktop用"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-auto rounded-md bg-background px-3.5 py-3"
              />
            </div>

            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

            <DialogFooter className="mx-0 mb-0 mt-6 border-none bg-transparent p-0">
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
                className="h-auto px-6 py-3 shadow-[var(--shadow-accent)]"
                onClick={handleIssue}
                disabled={submitting}
              >
                発行
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-extrabold">APIキーが発行されました</DialogTitle>
            </DialogHeader>

            <p className="mb-4 text-sm font-semibold text-destructive">
              このキーは二度と表示されません。今すぐコピーして安全な場所に保管してください。
            </p>

            <div className="mb-6 flex items-center gap-2 rounded-md border border-border bg-background px-3.5 py-3">
              <code className="flex-1 overflow-x-auto font-mono text-sm">{stage.rawKey}</code>
              <CopyButton getValue={() => stage.rawKey} label="キーをコピー" icon={<CopyIcon />} />
            </div>

            <DialogFooter className="mx-0 mb-0 border-none bg-transparent p-0">
              <Button
                type="button"
                className="h-auto px-6 py-3 shadow-[var(--shadow-accent)]"
                onClick={handleClose}
              >
                閉じる
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
