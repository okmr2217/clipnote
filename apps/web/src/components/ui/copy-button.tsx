"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function CopyButton({
  getValue,
  label = "コピー",
  copiedLabel = "コピーしました",
  icon,
  className,
}: {
  getValue: () => string;
  label?: string;
  copiedLabel?: string;
  icon?: ReactNode;
  className?: string;
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
      variant="ghost"
      size="icon-sm"
      onClick={handleCopy}
      title={label}
      className={className}
    >
      {icon}
      <span className="sr-only">{copied ? copiedLabel : label}</span>
    </Button>
  );
}
