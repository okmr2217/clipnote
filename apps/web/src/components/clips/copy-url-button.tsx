"use client";

import { useState } from "react";
import { Link2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyUrlButton({ uuid, className }: { uuid: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/p/${uuid}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={handleCopy}
      title="公開URLをコピー"
      className={className}
    >
      <Link2Icon />
      <span className="sr-only">{copied ? "コピーしました" : "公開URLをコピー"}</span>
    </Button>
  );
}
