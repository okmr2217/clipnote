"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CopyButton({
  getValue,
  label = "コピー",
  copiedLabel = "コピーしました",
  icon,
  className,
  showLabel = false,
}: {
  getValue: () => string;
  label?: string;
  copiedLabel?: string;
  icon?: ReactNode;
  className?: string;
  // アイコンのみ（既定）だと埋もれて見落とされやすい場面向けに、テキストラベル
  // も常時表示するバリアント。
  showLabel?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(getValue());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Button
      type="button"
      variant={showLabel ? "outline" : "ghost"}
      size={showLabel ? "sm" : "icon-sm"}
      onClick={handleCopy}
      title={label}
      className={
        showLabel
          ? cn("h-auto gap-1.5 rounded-full border-primary/40 px-3 py-1.5 text-xs text-primary", className)
          : className
      }
    >
      {icon}
      {showLabel ? (
        <span>{copied ? copiedLabel : label}</span>
      ) : (
        <span className="sr-only">{copied ? copiedLabel : label}</span>
      )}
    </Button>
  );
}
