"use client";

import { useState } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";

// スコープは"mcp"の一種類のみ（要件定義書15章の方針に合わせ、read/write等の
// 粒度は設けない）。将来スコープが増えた場合はここに追記する。
const SCOPE_LABELS: Record<string, string> = {
  mcp: "クリップの一覧取得・作成・更新",
};

export function ConsentForm({
  clientName,
  scope,
  oauthQuery,
}: {
  clientName: string;
  scope: string;
  oauthQuery: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scopes = scope.split(" ").filter(Boolean);

  async function respond(accept: boolean) {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/oauth2/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // oauth_queryは/oauth2/authorizeがこのページへのリダイレクトURLに
        // 埋め込んだ、署名付きの元リクエスト一式（client_id・scope・
        // redirect_uri・code_challenge等）。改変検知のためサーバー側で
        // 署名検証されるので、受け取ったクエリ文字列をそのまま返す。
        body: JSON.stringify({ accept, oauth_query: oauthQuery }),
      });
      const data: { url?: string } = await response.json();

      if (!response.ok || !data.url) {
        throw new Error("consent failed");
      }
      window.location.href = data.url;
    } catch {
      setError("処理に失敗しました。もう一度お試しください。");
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard>
      <p className="mb-1 text-center text-sm font-semibold text-secondary-foreground">
        外部アプリからのアクセス許可
      </p>
      <p className="mb-6 text-center text-lg font-bold">{clientName}</p>
      <ul className="mb-7 flex flex-col gap-2 text-sm text-secondary-foreground">
        {(scopes.length > 0 ? scopes : ["mcp"]).map((s) => (
          <li key={s}>・{SCOPE_LABELS[s] ?? s}</li>
        ))}
      </ul>
      {error && (
        <p role="alert" className="mb-4 text-center text-xs font-semibold text-primary">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          disabled={isSubmitting}
          onClick={() => respond(true)}
          className="h-auto w-full py-3.5 shadow-[var(--shadow-accent)]"
        >
          許可する
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => respond(false)}
          className="h-auto w-full py-3.5"
        >
          拒否する
        </Button>
      </div>
    </AuthCard>
  );
}
