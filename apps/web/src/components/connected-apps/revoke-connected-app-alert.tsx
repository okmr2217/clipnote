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
import type { ConnectedAppRow } from "@/components/connected-apps/types";

export function RevokeConnectedAppAlert({
  app,
  onOpenChange,
  onRevoked,
}: {
  app: ConnectedAppRow | null;
  onOpenChange: (open: boolean) => void;
  onRevoked: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRevoke() {
    if (!app) return;
    setSubmitting(true);
    const response = await fetch(`/api/oauth-clients/${app.clientId}`, { method: "DELETE" });
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
      open={app !== null}
      onOpenChange={(next) => {
        if (!next) setError(null);
        onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>連携を解除しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            「{app?.name}」との連携を解除します。以降このアプリから再度アクセスするには、あらためて認可が必要になります。この操作は取り消せません。
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="px-1 text-sm text-destructive">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>キャンセル</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleRevoke} disabled={submitting}>
            解除する
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
