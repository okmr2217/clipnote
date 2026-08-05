"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChangePasswordDialog } from "@/components/account/change-password-dialog";

export function AccountSettings({
  user,
}: {
  user: { name: string; email: string; emailVerified: boolean };
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold tracking-tight md:text-2xl">アカウント設定</h1>

      <div className="rounded-2xl border border-border bg-card p-6">
        <dl className="flex flex-col gap-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="font-semibold text-muted-foreground">名前</dt>
            <dd className="font-medium">{user.name}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="font-semibold text-muted-foreground">メールアドレス</dt>
            <dd className="flex items-center gap-2 font-medium">
              {user.email}
              {user.emailVerified ? (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-bold text-secondary-foreground">
                  確認済み
                </span>
              ) : (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-bold text-primary">
                  未確認
                </span>
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-6 border-t border-border pt-6">
          <Button
            variant="outline"
            className="h-auto px-5 py-3"
            onClick={() => setDialogOpen(true)}
          >
            パスワードを変更
          </Button>
        </div>
      </div>

      <ChangePasswordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onChanged={() => router.refresh()}
      />
    </div>
  );
}
