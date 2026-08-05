"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthErrorBanner } from "@/components/auth/auth-error-banner";
import { AuthField } from "@/components/auth/auth-field";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>(undefined);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    if (!EMAIL_RE.test(email)) {
      setFieldError("有効なメールアドレスを入力してください");
      return;
    }

    setIsSubmitting(true);
    await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
    setIsSubmitting(false);

    // 登録有無に関わらず同じ結果を表示する（メールアドレス列挙対策）。
    setSent(true);
  }

  if (sent) {
    return (
      <AuthCard>
        <p className="text-center text-sm font-medium text-secondary-foreground">
          ご入力いただいたメールアドレスが登録されている場合、パスワード再設定用のメールを送信しました。メール内のリンクからパスワードを再設定してください。
        </p>
        <p className="mt-[22px] text-center text-[13px] font-medium text-secondary-foreground">
          <Link href="/login" className="font-bold text-primary hover:text-accent-foreground">
            ログイン画面に戻る
          </Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      {serverError && <AuthErrorBanner message={serverError} />}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <AuthField
          id="email"
          label="メールアドレス"
          type="email"
          placeholder="you@example.com"
          value={email}
          error={fieldError}
          onChange={(event) => {
            setEmail(event.target.value);
            setFieldError(undefined);
          }}
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 h-auto w-full py-3.5 shadow-[var(--shadow-accent)]"
        >
          再設定メールを送信
        </Button>
      </form>
      <p className="mt-[22px] text-center text-[13px] font-medium text-secondary-foreground">
        <Link href="/login" className="font-bold text-primary hover:text-accent-foreground">
          ログイン画面に戻る
        </Link>
      </p>
    </AuthCard>
  );
}
