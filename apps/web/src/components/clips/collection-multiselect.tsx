"use client";

import { useMemo, useState } from "react";
import { XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { CollectionOption } from "@/components/clips/types";

export function CollectionMultiselect({
  options,
  value,
  onChange,
}: {
  options: CollectionOption[];
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const selected = useMemo(
    () => options.filter((option) => value.includes(option.id)),
    [options, value],
  );
  const filtered = useMemo(
    () => options.filter((option) => option.name.toLowerCase().includes(search.toLowerCase())),
    [options, search],
  );

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }

  return (
    <Popover>
      <PopoverTrigger className="flex min-h-11 w-full flex-wrap items-center gap-2 rounded-md border border-input bg-background px-3 py-2.5 text-left text-sm">
        {selected.map((option) => (
          <Badge key={option.id} variant="secondary" className="gap-1">
            {option.name}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                toggle(option.id);
              }}
              className="cursor-pointer"
            >
              <XIcon className="size-3" />
            </button>
          </Badge>
        ))}
        <span className="whitespace-nowrap text-muted-foreground">コレクションを選択 ▾</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--anchor-width) min-w-64">
        <Input
          placeholder="コレクションを検索"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="mb-1"
        />
        <div className="flex max-h-48 flex-col gap-0.5 overflow-y-auto">
          {options.length === 0 ? (
            <p className="px-2 py-1.5 text-sm text-muted-foreground">
              コレクションがありません
            </p>
          ) : filtered.length === 0 ? (
            <p className="px-2 py-1.5 text-sm text-muted-foreground">
              一致するコレクションがありません
            </p>
          ) : (
            filtered.map((option) => (
              <label
                key={option.id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
              >
                <Checkbox
                  checked={value.includes(option.id)}
                  onCheckedChange={() => toggle(option.id)}
                />
                {option.name}
              </label>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
