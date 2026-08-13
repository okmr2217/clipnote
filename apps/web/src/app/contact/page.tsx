"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthErrorBanner } from "@/components/auth/auth-error-banner";
import { AuthField } from "@/components/auth/auth-field";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactPage() {
  return (
    <Suspense>
      <ContactForm />
    </Suspense>
  );
}

function ContactForm() {
  const searchParams = useSearchParams();
  // 公開クリップ／コレクションの通報導線（/p/[uuid]・/c/[uuid]）からの
  // 事前入力用（design.md5章「公開コンテンツの通報」）。
  const reportedUrl = searchParams.get("url");

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(
    reportedUrl ? `【通報】このURLのコンテンツについて問題を報告します。\n\n理由: ` : "",
  );
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; message?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  function validate() {
    const errors: typeof fieldErrors = {};
    if (!EMAIL_RE.test(email)) errors.email = "有効なメールアドレスを入力してください";
    if (message.trim().length === 0) errors.message = "内容を入力してください";
    return errors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        message,
        reportedUrl: reportedUrl || undefined,
        website: honeypot,
      }),
    });
    setIsSubmitting(false);

    if (!response.ok) {
      setServerError("送信に失敗しました。時間をおいて再度お試しください。");
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <AuthCard>
        <p className="text-center text-sm font-medium text-secondary-foreground">
          お問い合わせを受け付けました。内容を確認の上、必要に応じてご入力のメールアドレス宛にご連絡します。
        </p>
        <p className="mt-[22px] text-center text-[13px] font-medium text-secondary-foreground">
          <Link href="/" className="font-bold text-primary hover:text-accent-foreground">
            トップページに戻る
          </Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <h1 className="mb-5 text-center text-lg font-bold text-foreground">
        {reportedUrl ? "コンテンツの通報" : "お問い合わせ"}
      </h1>
      {serverError && <AuthErrorBanner message={serverError} />}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {reportedUrl && (
          <p className="rounded-md border border-border bg-secondary px-3.5 py-3 text-[13px] font-medium text-secondary-foreground">
            対象URL: {reportedUrl}
          </p>
        )}
        <AuthField
          id="email"
          label="メールアドレス（返信用）"
          type="email"
          placeholder="you@example.com"
          value={email}
          error={fieldErrors.email}
          onChange={(event) => {
            setEmail(event.target.value);
            setFieldErrors((prev) => ({ ...prev, email: undefined }));
          }}
        />
        <div className="flex flex-col gap-2">
          <Label htmlFor="message" className="text-[13px] font-semibold">
            内容
          </Label>
          <Textarea
            id="message"
            rows={6}
            value={message}
            aria-invalid={!!fieldErrors.message}
            onChange={(event) => {
              setMessage(event.target.value);
              setFieldErrors((prev) => ({ ...prev, message: undefined }));
            }}
          />
          {fieldErrors.message && (
            <p role="alert" className="text-xs font-semibold text-primary">
              {fieldErrors.message}
            </p>
          )}
        </div>
        {/* ハニーポット：CSSで隠すのみでinputごと除去しないことで単純なボットを検知する */}
        <label className="absolute -left-[9999px]" aria-hidden="true">
          Website
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
          />
        </label>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 h-auto w-full py-3.5 shadow-[var(--shadow-accent)]"
        >
          送信する
        </Button>
      </form>
    </AuthCard>
  );
}
