"use client";

import { cn } from "@/lib/utils";
import type { ClipRow } from "@/components/clips/types";

export function VisibilityToggle({
  visibility,
  onToggle,
  disabled,
}: {
  visibility: ClipRow["visibility"];
  onToggle: () => void;
  disabled?: boolean;
}) {
  const isPublic = visibility === "public";

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      title="クリックで公開設定を切り替え"
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-opacity disabled:opacity-50",
        isPublic ? "bg-secondary text-primary" : "bg-muted text-secondary-foreground",
      )}
    >
      {isPublic ? "Public" : "Private"}
    </button>
  );
}
