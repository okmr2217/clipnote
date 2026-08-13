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
import type { TrashRow } from "@/components/clips/types";

// ゴミ箱からの「完全に削除」専用の確認ダイアログ（docs/design-trash.md
// 4章）。ゴミ箱への移動自体は確認不要（use-clip-toggles.tsのhandleTrash）
// だが、この操作だけは唯一の不可逆操作のため確認を必須にする。
export function PermanentlyDeleteClipAlert({
  clip,
  onOpenChange,
  onDeleted,
}: {
  clip: TrashRow | null;
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
          <AlertDialogTitle>完全に削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            「{clip?.title}」を完全に削除します。元に戻せません（更新履歴ごと完全に削除されます）。
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
            完全に削除する
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
