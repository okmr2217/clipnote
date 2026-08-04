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

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const errors: typeof fieldErrors = {};
    if (!EMAIL_RE.test(email)) errors.email = "有効なメールアドレスを入力してください";
    if (password.length === 0) errors.password = "パスワードを入力してください";
    return errors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    const { error } = await authClient.signIn.email({ email, password });
    setIsSubmitting(false);

    if (error) {
      setServerError("メールアドレスまたはパスワードが正しくありません");
      return;
    }

    router.push(searchParams.get("redirect") ?? "/admin");
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
          error={fieldErrors.email}
          onChange={(event) => {
            setEmail(event.target.value);
            setFieldErrors((prev) => ({ ...prev, email: undefined }));
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
            setFieldErrors((prev) => ({ ...prev, password: undefined }));
          }}
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 h-auto w-full py-3.5 shadow-[var(--shadow-accent)]"
        >
          ログイン
        </Button>
      </form>
      <p className="mt-[22px] text-center text-[13px] font-medium text-secondary-foreground">
        アカウントをお持ちでない方は{" "}
        <Link href="/signup" className="font-bold text-primary hover:text-accent-foreground">
          新規登録
        </Link>
      </p>
    </AuthCard>
  );
}
