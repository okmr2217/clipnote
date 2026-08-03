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
import type { ClipRow } from "@/components/clips/types";

export function DeleteClipAlert({
  clip,
  onOpenChange,
  onDeleted,
}: {
  clip: ClipRow | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!clip) return;
    setSubmitting(true);
    const response = await fetch(`/api/pages/${clip.id}`, { method: "DELETE" });
    setSubmitting(false);

    if (!response.ok) {
      setError("削除に失敗しました。");
      return;
    }

    onOpenChange(false);
    onDeleted();
  }

  return (
    <AlertDialog
      open={clip !== null}
      onOpenChange={(next) => {
        if (!next) setError(null);
        onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>クリップを削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            「{clip?.title}」を削除します。この操作は取り消せません（更新履歴もすべて削除されます）。
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="px-1 text-sm text-destructive">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>キャンセル</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={submitting}
          >
            削除する
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
