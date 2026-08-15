"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthErrorBanner } from "@/components/auth/auth-error-banner";
import { AuthField } from "@/components/auth/auth-field";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

type FieldErrors = { password?: string; confirmPassword?: string };

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!token) {
    return (
      <AuthCard>
        <AuthErrorBanner message="リンクが無効か、有効期限が切れています。もう一度パスワード再設定をお試しください。" />
      </AuthCard>
    );
  }

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (password.length < 8) errors.password = "パスワードは8文字以上で入力してください";
    if (confirmPassword !== password) errors.confirmPassword = "パスワードが一致しません";
    return errors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    const { error } = await authClient.resetPassword({ newPassword: password, token: token! });
    setIsSubmitting(false);

    if (error) {
      setServerError("リンクが無効か、有効期限が切れています。もう一度パスワード再設定をお試しください。");
      return;
    }

    router.push("/login?reset=1");
  }

  return (
    <AuthCard>
      {serverError && <AuthErrorBanner message={serverError} />}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <AuthField
          id="password"
          name="password"
          autoComplete="new-password"
          label="新しいパスワード"
          type="password"
          placeholder="••••••••"
          value={password}
          error={fieldErrors.password}
          onChange={(event) => {
            setPassword(event.target.value);
            setFieldErrors((prev) => ({ ...prev, password: undefined }));
          }}
        />
        <AuthField
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          label="新しいパスワード（確認）"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          error={fieldErrors.confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
          }}
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 h-auto w-full py-3.5 shadow-[var(--shadow-accent)]"
        >
          パスワードを再設定
        </Button>
      </form>
    </AuthCard>
  );
}
