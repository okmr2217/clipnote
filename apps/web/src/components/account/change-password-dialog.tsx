"use client";

import { authClient } from "@/lib/auth-client";
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

export function ChangePasswordDialog({
  open,
  onOpenChange,
  onChanged,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSubmitting(false);
    setError(null);
  }

  async function handleSubmit() {
    setError(null);

    if (currentPassword.length === 0) {
      setError("現在のパスワードを入力してください。");
      return;
    }
    if (newPassword.length < 8) {
      setError("新しいパスワードは8文字以上で入力してください。");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("新しいパスワードが一致しません。");
      return;
    }

    setSubmitting(true);
    const { error: apiError } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setSubmitting(false);

    if (apiError) {
      setError("現在のパスワードが正しくありません。");
      return;
    }

    reset();
    onOpenChange(false);
    onChanged();
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
        <DialogHeader className="mb-6">
          <DialogTitle className="text-xl font-extrabold">パスワードを変更</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="current-password" className="text-sm font-bold">
              現在のパスワード
            </Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="h-auto rounded-md bg-background px-3.5 py-3"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-password" className="text-sm font-bold">
              新しいパスワード
            </Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="h-auto rounded-md bg-background px-3.5 py-3"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm-password" className="text-sm font-bold">
              新しいパスワード（確認）
            </Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="h-auto rounded-md bg-background px-3.5 py-3"
            />
          </div>
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
            onClick={handleSubmit}
            disabled={submitting}
          >
            変更
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
