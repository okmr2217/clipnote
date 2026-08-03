"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signUpError } = await authClient.signUp.email({ name, email, password });

    setIsSubmitting(false);

    if (signUpError) {
      setError(signUpError.message ?? "登録に失敗しました");
      return;
    }

    router.push("/admin");
  }

  return (
    <main>
      <h1>新規登録</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">名前</label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="email">メールアドレス</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">パスワード</label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        {error ? <p role="alert">{error}</p> : null}
        <button type="submit" disabled={isSubmitting}>
          登録
        </button>
      </form>
      <p>
        すでにアカウントをお持ちの方は<Link href="/login">ログイン</Link>
      </p>
    </main>
  );
}
