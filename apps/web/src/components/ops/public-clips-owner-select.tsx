"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import type { OpsPublicClipOwner } from "@/lib/ops";

const ALL_OWNERS_VALUE = "__all__";

export function PublicClipsOwnerSelect({
  owners,
  ownerId,
}: {
  owners: OpsPublicClipOwner[];
  ownerId: string | undefined;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const value = ownerId ?? ALL_OWNERS_VALUE;
  const current = owners.find((owner) => owner.id === ownerId);

  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (!next) return;
        const params = new URLSearchParams(searchParams);
        if (next === ALL_OWNERS_VALUE) {
          params.delete("owner");
        } else {
          params.set("owner", next);
        }
        router.push(`/ops/clips?${params.toString()}`);
      }}
    >
      <SelectTrigger className="h-9! w-fit shrink-0 rounded-full bg-muted px-4 py-2.5 text-[13px] font-semibold text-secondary-foreground">
        {current ? current.email : "すべての所有者"}
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_OWNERS_VALUE}>すべての所有者</SelectItem>
        {owners.map((owner) => (
          <SelectItem key={owner.id} value={owner.id}>
            {owner.email}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
