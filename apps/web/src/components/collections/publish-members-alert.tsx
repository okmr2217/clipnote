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

export function PublishMembersAlert({
  collectionId,
  privateMemberCount,
  open,
  onOpenChange,
  onPublished,
}: {
  collectionId: string;
  privateMemberCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublished: (publishedIds: string[]) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePublish() {
    setSubmitting(true);
    setError(null);
    const response = await fetch(`/api/collections/${collectionId}/publish-members`, {
      method: "POST",
    });
    setSubmitting(false);

    if (!response.ok) {
      setError("公開に失敗しました。");
      return;
    }

    const { publishedIds } = (await response.json()) as { publishedIds: string[] };
    onPublished(publishedIds);
    onOpenChange(false);
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setError(null);
        onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>非公開クリップをすべて公開にしますか？</AlertDialogTitle>
          <AlertDialogDescription>
            このコレクションに含まれる非公開クリップ{privateMemberCount}件をすべて公開に切り替えます。各クリップは公開URLから第三者でも閲覧できるようになります。この操作は取り消せません（クリップごとに個別で非公開へ戻すことは可能です）。
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="px-1 text-sm text-destructive">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>キャンセル</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handlePublish} disabled={submitting}>
            すべて公開にする
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
