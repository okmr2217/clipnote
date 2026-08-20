"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import type { OpsPublicClipsSort } from "@/lib/ops";

const SORT_LABELS: Record<OpsPublicClipsSort, string> = {
  created_desc: "作成日時が新しい順",
  created_asc: "作成日時が古い順",
  updated_desc: "更新日時が新しい順",
  updated_asc: "更新日時が古い順",
  views_desc: "プレビュー数が多い順",
  views_asc: "プレビュー数が少ない順",
};

export function PublicClipsSortSelect({ sort }: { sort: OpsPublicClipsSort }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <Select
      value={sort}
      onValueChange={(value) => {
        if (!value) return;
        const params = new URLSearchParams(searchParams);
        params.set("sort", value);
        router.push(`/ops/clips?${params.toString()}`);
      }}
    >
      <SelectTrigger className="h-9! w-fit shrink-0 rounded-full bg-muted px-4 py-2.5 text-[13px] font-semibold text-secondary-foreground">
        {SORT_LABELS[sort]}
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(SORT_LABELS) as OpsPublicClipsSort[]).map((value) => (
          <SelectItem key={value} value={value}>
            {SORT_LABELS[value]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
