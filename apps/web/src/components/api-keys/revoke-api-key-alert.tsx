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
import type { ApiKeyRow } from "@/components/api-keys/types";

export function RevokeApiKeyAlert({
  apiKey,
  onOpenChange,
  onRevoked,
}: {
  apiKey: ApiKeyRow | null;
  onOpenChange: (open: boolean) => void;
  onRevoked: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRevoke() {
    if (!apiKey) return;
    setSubmitting(true);
    const response = await fetch(`/api/api-keys/${apiKey.id}`, { method: "DELETE" });
    setSubmitting(false);

    if (!response.ok) {
      setError("失効に失敗しました。");
      return;
    }

    onOpenChange(false);
    onRevoked();
  }

  return (
    <AlertDialog
      open={apiKey !== null}
      onOpenChange={(next) => {
        if (!next) setError(null);
        onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>APIキーを失効しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            「{apiKey?.name}」を失効します。失効すると、このキーを使った連携（Claude等）は利用できなくなります。この操作は取り消せません。
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="px-1 text-sm text-destructive">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>キャンセル</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleRevoke} disabled={submitting}>
            失効する
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
