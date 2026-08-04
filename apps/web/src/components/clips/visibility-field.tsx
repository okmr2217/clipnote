"use client";

import { cn } from "@/lib/utils";
import type { Visibility } from "@/lib/validation";

export function VisibilityField({
  value,
  onChange,
}: {
  value: Visibility;
  onChange: (value: Visibility) => void;
}) {
  return (
    <div className="inline-flex rounded-full bg-secondary p-1">
      {(["private", "public"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "rounded-full px-4 py-2 text-xs font-bold transition-colors",
            value === option
              ? "bg-secondary-foreground text-primary-foreground"
              : "text-muted-foreground",
          )}
        >
          {option === "private" ? "非公開" : "公開"}
        </button>
      ))}
    </div>
  );
}
