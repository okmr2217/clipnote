"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { PageVersionRow } from "@/components/clips/types";

export function RestoreVersionAlert({
  clipId,
  version,
  onOpenChange,
  onRestored,
}: {
  clipId: string;
  version: PageVersionRow | null;
  onOpenChange: (open: boolean) => void;
  onRestored: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRestore() {
    if (!version) return;
    setSubmitting(true);
    const response = await fetch(`/api/pages/${clipId}/restore`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionId: version.id }),
    });
    setSubmitting(false);

    if (!response.ok) {
      setError("復元に失敗しました。");
      return;
    }

    onOpenChange(false);
    onRestored();
  }

  return (
    <AlertDialog
      open={version !== null}
      onOpenChange={(next) => {
        if (!next) setError(null);
        onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>v{version?.versionNumber}の内容で上書きしますか？</AlertDialogTitle>
          <AlertDialogDescription>
            現在の内容をv{version?.versionNumber}の内容で上書きします。上書き前の内容も新しいバージョンとして更新履歴に保存されます。
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="px-1 text-sm text-destructive">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>キャンセル</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleRestore} disabled={submitting}>
            復元する
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
