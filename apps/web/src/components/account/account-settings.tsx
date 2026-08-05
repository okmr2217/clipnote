"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, TriangleAlert } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { ChangePasswordDialog } from "@/components/account/change-password-dialog";

function initialsOf(source: string) {
  const parts = source.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function AccountSettings({
  user,
}: {
  user: { name: string; email: string; emailVerified: boolean };
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">("idle");
  const initials = initialsOf(user.name || user.email);

  async function handleResend() {
    setResendStatus("sending");
    await authClient.sendVerificationEmail({ email: user.email, callbackURL: "/admin/settings" });
    setResendStatus("sent");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold tracking-tight md:text-2xl">アカウント設定</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          プロフィール情報の確認とパスワードの変更を行います。
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] md:p-8">
        <div className="flex items-center gap-4">
          <div className="flex size-14 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-lg font-bold text-primary">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="truncate text-lg font-extrabold tracking-tight">{user.name}</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-medium text-muted-foreground">{user.email}</span>
              {user.emailVerified ? (
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-primary">
                  確認済み
                </span>
              ) : (
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-accent-foreground">
                  未確認
                </span>
              )}
            </div>
          </div>
        </div>

        {!user.emailVerified && (
          <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-secondary px-4 py-3.5">
            <TriangleAlert className="mt-0.5 size-4 flex-shrink-0 text-accent-foreground" />
            <p className="text-[13px] font-medium leading-relaxed text-accent-foreground">
              メールアドレスが未確認です。
              {resendStatus === "sent" ? (
                <span className="font-bold"> 確認メールを再送信しました。</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendStatus === "sending"}
                  className="ml-1 font-bold underline decoration-1 underline-offset-2 hover:text-primary"
                >
                  確認メールを再送信
                </button>
              )}
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 flex-shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <KeyRound className="size-4" />
            </div>
            <div>
              <div className="text-sm font-bold">パスワード</div>
              <div className="text-xs font-medium text-muted-foreground">••••••••</div>
            </div>
          </div>
          <Button
            variant="outline"
            className="h-auto flex-shrink-0 px-5 py-2.5"
            onClick={() => setDialogOpen(true)}
          >
            変更
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
