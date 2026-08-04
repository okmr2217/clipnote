"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// 設計書4-4節：トークンの有効期限は2分。切れる前に更新できるよう90秒間隔で
// 取得し直す。
const REFRESH_INTERVAL_MS = 90_000;

export function ContentFrame({
  uuid,
  initialToken,
  contentOrigin,
  title,
  className,
}: {
  uuid: string;
  initialToken: string;
  contentOrigin: string;
  title: string;
  className?: string;
}) {
  const [token, setToken] = useState(initialToken);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/content-token", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ uuid }),
        });
        if (!res.ok) return; // 静かに諦め、次回の定期実行を待つ（設計書4-4節）
        const data: unknown = await res.json();
        if (data && typeof data === "object" && typeof (data as { token?: unknown }).token === "string") {
          setToken((data as { token: string }).token);
        }
      } catch {
        // ネットワークエラー等も同様に静かに諦める
      }
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(id);
  }, [uuid]);

  const src = `${contentOrigin}/${uuid}?t=${encodeURIComponent(token)}`;

  return (
    // allow-same-originは付けない（Cookie/Storage窃取を防ぐセキュリティの核、
    // 設計書4-2節）。本文自体のサニタイズは行わず、このiframe隔離のみで
    // XSSから親オリジンを守る設計（設計書4-1節）。
    <iframe
      key={uuid}
      title={title}
      src={src}
      sandbox="allow-scripts allow-popups allow-modals allow-popups-to-escape-sandbox"
      className={cn("w-full border-0 bg-white", className)}
    />
  );
}
