"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthErrorBanner } from "@/components/auth/auth-error-banner";
import { AuthField } from "@/components/auth/auth-field";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (name.trim().length === 0) errors.name = "名前を入力してください";
    if (!EMAIL_RE.test(email)) errors.email = "有効なメールアドレスを入力してください";
    if (password.length < 8) errors.password = "パスワードは8文字以上で入力してください";
    if (confirmPassword !== password) errors.confirmPassword = "パスワードが一致しません";
    return errors;
  }

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    const { error } = await authClient.signUp.email({ name, email, password });
    setIsSubmitting(false);

    if (error) {
      setServerError(
        error.status === 422
          ? "このメールアドレスは既に登録されています"
          : "登録に失敗しました。時間をおいて再度お試しください。",
      );
      return;
    }

    router.push(redirectParam ?? "/admin");
  }

  return (
    <AuthCard>
      {serverError && <AuthErrorBanner message={serverError} />}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <AuthField
          id="name"
          label="名前"
          type="text"
          value={name}
          error={fieldErrors.name}
          onChange={(event) => {
            setName(event.target.value);
            clearFieldError("name");
          }}
        />
        <AuthField
          id="email"
          label="メールアドレス"
          type="email"
          placeholder="you@example.com"
          value={email}
          error={fieldErrors.email}
          onChange={(event) => {
            setEmail(event.target.value);
            clearFieldError("email");
          }}
        />
        <AuthField
          id="password"
          label="パスワード"
          type="password"
          placeholder="••••••••"
          value={password}
          error={fieldErrors.password}
          onChange={(event) => {
            setPassword(event.target.value);
            clearFieldError("password");
          }}
        />
        <AuthField
          id="confirm-password"
          label="パスワード（確認）"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          error={fieldErrors.confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            clearFieldError("confirmPassword");
          }}
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 h-auto w-full py-3.5 shadow-[var(--shadow-accent)]"
        >
          アカウントを作成
        </Button>
      </form>
      <p className="mt-[22px] text-center text-[13px] font-medium text-secondary-foreground">
        既にアカウントをお持ちの方は{" "}
        <Link
          href={redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : "/login"}
          className="font-bold text-primary hover:text-accent-foreground"
        >
          ログイン
        </Link>
      </p>
    </AuthCard>
  );
}
