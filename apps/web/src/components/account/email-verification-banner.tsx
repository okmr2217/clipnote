"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export function EmailVerificationBanner({ email }: { email: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function handleResend() {
    setStatus("sending");
    await authClient.sendVerificationEmail({ email, callbackURL: "/admin" });
    setStatus("sent");
  }

  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-border bg-secondary px-4 py-2.5 text-center text-[13px] font-semibold text-secondary-foreground"
    >
      <span>メールアドレスが未確認です。</span>
      {status === "sent" ? (
        <span>確認メールを再送信しました。</span>
      ) : (
        <button
          type="button"
          onClick={handleResend}
          disabled={status === "sending"}
          className="font-bold text-primary hover:text-accent-foreground"
        >
          確認メールを再送信
        </button>
      )}
    </div>
  );
}
