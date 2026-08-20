"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import type { OpsPublicClipsStatus } from "@/lib/ops";

const STATUS_LABELS: Record<OpsPublicClipsStatus, string> = {
  active: "アクティブのみ",
  archived: "アーカイブのみ",
  all: "すべて",
};

export function PublicClipsStatusSelect({ status }: { status: OpsPublicClipsStatus }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <Select
      value={status}
      onValueChange={(value) => {
        if (!value) return;
        const params = new URLSearchParams(searchParams);
        params.set("status", value);
        router.push(`/ops/clips?${params.toString()}`);
      }}
    >
      <SelectTrigger className="h-9! w-fit shrink-0 rounded-full bg-muted px-4 py-2.5 text-[13px] font-semibold text-secondary-foreground">
        {STATUS_LABELS[status]}
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(STATUS_LABELS) as OpsPublicClipsStatus[]).map((value) => (
          <SelectItem key={value} value={value}>
            {STATUS_LABELS[value]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
