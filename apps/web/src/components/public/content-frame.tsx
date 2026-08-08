"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// 設計書4-4節：トークンの有効期限は2分。切れる前に更新できるよう90秒間隔で
// 取得し直す。
const REFRESH_INTERVAL_MS = 90_000;

// 本文（content側）から通知される高さの許容範囲。異常値でレイアウトが
// 壊れないようクランプする。
const MIN_REPORTED_HEIGHT = 0;
const MAX_REPORTED_HEIGHT = 20000;

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
  const [height, setHeight] = useState<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // uuidが変わった（＝別のクリップへクライアント側遷移した）ら高さをリセットする。
  // useEffectではなくレンダー中にsetStateする形にし、カスケードする再レンダーを避ける
  // （https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes）。
  const [prevUuid, setPrevUuid] = useState(uuid);
  if (uuid !== prevUuid) {
    setPrevUuid(uuid);
    setHeight(null);
  }

  // sandbox属性にallow-same-originを付けていないため、本文（content側）から
  // 見た自身のoriginはopaque（"null"）になる。そのためevent.originでの検証は
  // できず、event.source（window参照）が自分のiframeと一致するかで送信元を
  // 照合する（apps/content/src/resize-script.ts参照）。
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data as unknown;
      if (
        data &&
        typeof data === "object" &&
        (data as { source?: unknown }).source === "clipnote-content" &&
        typeof (data as { height?: unknown }).height === "number"
      ) {
        const reported = (data as { height: number }).height;
        setHeight(Math.min(Math.max(reported, MIN_REPORTED_HEIGHT), MAX_REPORTED_HEIGHT));
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

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
    // 背景色はここでは持たせない。HTML/Markdownどちらも本文（content側）が
    // 自身の背景を決める構造に統一しており、透過にしておくことでMarkdown側の
    // `background: transparent`が親ページのカード背景にそのまま馴染む。
    <iframe
      key={uuid}
      ref={iframeRef}
      title={title}
      src={src}
      sandbox="allow-scripts allow-popups allow-modals allow-popups-to-escape-sandbox"
      className={cn("w-full border-0", className)}
      style={height !== null ? { height } : undefined}
    />
  );
}
