"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FormatBadge } from "@/components/clips/format-badge";
import type { ClipOption, CollectionMemberClip } from "@/components/collections/types";

export function AddClipsDialog({
  open,
  onOpenChange,
  collectionId,
  clipOptions,
  currentMemberIds,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionId: string;
  clipOptions: ClipOption[];
  currentMemberIds: string[];
  onAdded: (members: CollectionMemberClip[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>(currentMemberIds);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      clipOptions.filter(
        (clip) =>
          (clip.archivedAt === null || currentMemberIds.includes(clip.id)) &&
          clip.title.toLowerCase().includes(search.toLowerCase()),
      ),
    [clipOptions, currentMemberIds, search],
  );

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const response = await fetch(`/api/collections/${collectionId}/pages`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageIds: selected }),
    });
    setSubmitting(false);

    if (!response.ok) {
      setError("更新に失敗しました。");
      return;
    }

    const body = (await response.json()) as { members: CollectionMemberClip[] };
    onAdded(body.members);
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setSelected(currentMemberIds);
        setSearch("");
        setError(null);
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md gap-5 rounded-3xl p-6 sm:max-w-md sm:p-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">クリップを追加</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="タイトルで検索"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-auto rounded-md bg-background px-3.5 py-3"
        />

        <div className="flex max-h-72 flex-col gap-0.5 overflow-y-auto">
          {clipOptions.length === 0 ? (
            <p className="px-2 py-1.5 text-sm text-muted-foreground">クリップがありません</p>
          ) : filtered.length === 0 ? (
            <p className="px-2 py-1.5 text-sm text-muted-foreground">一致するクリップがありません</p>
          ) : (
            filtered.map((clip) => (
              <label
                key={clip.id}
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm hover:bg-accent"
              >
                <Checkbox checked={selected.includes(clip.id)} onCheckedChange={() => toggle(clip.id)} />
                <FormatBadge contentType={clip.contentType} />
                <span className="truncate">{clip.title}</span>
                {clip.archivedAt && (
                  <Badge variant="secondary" className="ml-auto shrink-0 bg-muted text-muted-foreground">
                    アーカイブ済み
                  </Badge>
                )}
              </label>
            ))
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter className="mx-0 mb-0 border-none bg-transparent p-0">
          <Button
            type="button"
            variant="outline"
            className="h-auto px-6 py-3"
            onClick={() => onOpenChange(false)}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            className="h-auto px-6 py-3 shadow-[var(--shadow-accent)]"
            onClick={handleSubmit}
            disabled={submitting}
          >
            追加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
