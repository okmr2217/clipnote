"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { ClipTable } from "@/components/clips/clip-table";
import { ClipCard } from "@/components/clips/clip-card";
import { NewClipDialog } from "@/components/clips/new-clip-dialog";
import { EditMetadataDialog } from "@/components/clips/edit-metadata-dialog";
import { UpdateContentDialog } from "@/components/clips/update-content-dialog";
import { DeleteClipAlert } from "@/components/clips/delete-clip-alert";
import type { ClipRow, CollectionOption } from "@/components/clips/types";

type DialogState =
  | { type: "new" }
  | { type: "edit-metadata"; clip: ClipRow }
  | { type: "update-content"; clip: ClipRow }
  | { type: "delete"; clip: ClipRow }
  | null;

export function ClipList({
  clips,
  collectionOptions,
}: {
  clips: ClipRow[];
  collectionOptions: CollectionOption[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [formatFilter, setFormatFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [collectionFilter, setCollectionFilter] = useState("all");
  const [archiveFilter, setArchiveFilter] = useState<"active" | "archived" | "all">("active");
  const [dialog, setDialog] = useState<DialogState>(null);
  const [optimisticVisibility, setOptimisticVisibility] = useState<
    Record<string, ClipRow["visibility"]>
  >({});
  const [optimisticPinned, setOptimisticPinned] = useState<Record<string, boolean>>({});
  const [optimisticArchived, setOptimisticArchived] = useState<Record<string, boolean>>({});

  function refresh() {
    router.refresh();
  }

  const visibleClips = useMemo(() => {
    return clips
      .map((clip) => ({
        ...clip,
        visibility: optimisticVisibility[clip.id] ?? clip.visibility,
        pinned: optimisticPinned[clip.id] ?? clip.pinned,
        archivedAt:
          clip.id in optimisticArchived
            ? optimisticArchived[clip.id]
              ? (clip.archivedAt ?? new Date())
              : null
            : clip.archivedAt,
      }))
      .filter((clip) => {
        if (search && !clip.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (formatFilter !== "all" && clip.contentType !== formatFilter) return false;
        if (visibilityFilter !== "all" && clip.visibility !== visibilityFilter) return false;
        if (
          collectionFilter !== "all" &&
          !clip.collections.some((c) => c.id === collectionFilter)
        ) {
          return false;
        }
        if (archiveFilter === "active" && clip.archivedAt !== null) return false;
        if (archiveFilter === "archived" && clip.archivedAt === null) return false;
        return true;
      });
  }, [
    clips,
    search,
    formatFilter,
    visibilityFilter,
    collectionFilter,
    archiveFilter,
    optimisticVisibility,
    optimisticPinned,
    optimisticArchived,
  ]);

  function clearOptimisticVisibility(clipId: string) {
    setOptimisticVisibility((prev) => {
      if (!(clipId in prev)) return prev;
      const next = { ...prev };
      delete next[clipId];
      return next;
    });
  }

  async function handleToggleVisibility(clip: ClipRow) {
    const current = optimisticVisibility[clip.id] ?? clip.visibility;
    const next = current === "public" ? "private" : "public";
    setOptimisticVisibility((prev) => ({ ...prev, [clip.id]: next }));

    const response = await fetch(`/api/pages/${clip.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visibility: next }),
    });

    if (!response.ok) {
      clearOptimisticVisibility(clip.id);
      return;
    }

    router.refresh();
    clearOptimisticVisibility(clip.id);
  }

  async function handleTogglePin(clip: ClipRow) {
    const current = optimisticPinned[clip.id] ?? clip.pinned;
    const next = !current;
    setOptimisticPinned((prev) => ({ ...prev, [clip.id]: next }));

    const response = await fetch(`/api/pages/${clip.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: next }),
    });

    if (!response.ok) {
      setOptimisticPinned((prev) => {
        const rest = { ...prev };
        delete rest[clip.id];
        return rest;
      });
      return;
    }

    router.refresh();
  }

  async function handleToggleArchive(clip: ClipRow) {
    const current = optimisticArchived[clip.id] ?? clip.archivedAt !== null;
    const next = !current;
    setOptimisticArchived((prev) => ({ ...prev, [clip.id]: next }));

    const response = await fetch(`/api/pages/${clip.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: next }),
    });

    if (!response.ok) {
      setOptimisticArchived((prev) => {
        const rest = { ...prev };
        delete rest[clip.id];
        return rest;
      });
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight md:text-2xl">クリップ一覧</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            HTML/Markdownで作成したコンテンツを保存し、公開設定や編集をここから管理します。
          </p>
        </div>
        <Button
          className="hidden h-auto px-5 py-3 shadow-[var(--shadow-accent)] md:inline-flex"
          onClick={() => setDialog({ type: "new" })}
        >
          <PlusIcon /> 新規クリップ
        </Button>
        <Button
          variant="secondary"
          size="icon"
          aria-label="新規クリップ"
          className="size-9 rounded-md text-primary shadow-none md:hidden"
          onClick={() => setDialog({ type: "new" })}
        >
          <PlusIcon />
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <Input
          placeholder="タイトルで検索"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-auto rounded-md bg-background px-4 py-2.5 md:min-w-56 md:flex-1"
        />
        <div className="flex gap-2 overflow-x-auto md:contents">
          <Select value={formatFilter} onValueChange={(value) => setFormatFilter(value ?? "all")}>
            <SelectTrigger className="h-9! shrink-0 rounded-full bg-muted px-4 py-2.5 text-[13px] font-semibold text-secondary-foreground">
              形式
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">形式: すべて</SelectItem>
              <SelectItem value="html">HTML</SelectItem>
              <SelectItem value="markdown">Markdown</SelectItem>
              <SelectItem value="plaintext">プレーンテキスト</SelectItem>
            </SelectContent>
          </Select>
          <Select value={visibilityFilter} onValueChange={(value) => setVisibilityFilter(value ?? "all")}>
            <SelectTrigger className="h-9! shrink-0 rounded-full bg-muted px-4 py-2.5 text-[13px] font-semibold text-secondary-foreground">
              公開設定
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">公開設定: すべて</SelectItem>
              <SelectItem value="private">非公開</SelectItem>
              <SelectItem value="public">公開</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={archiveFilter}
            onValueChange={(value) => setArchiveFilter((value as typeof archiveFilter) ?? "active")}
          >
            <SelectTrigger className="h-9! shrink-0 rounded-full bg-muted px-4 py-2.5 text-[13px] font-semibold text-secondary-foreground">
              状態
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">アクティブのみ</SelectItem>
              <SelectItem value="archived">アーカイブ済みのみ</SelectItem>
              <SelectItem value="all">すべて</SelectItem>
            </SelectContent>
          </Select>
          {collectionOptions.length > 0 && (
            <Select value={collectionFilter} onValueChange={(value) => setCollectionFilter(value ?? "all")}>
              <SelectTrigger className="h-9! shrink-0 rounded-full bg-muted px-4 py-2.5 text-[13px] font-semibold text-secondary-foreground">
                コレクション
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">コレクション: すべて</SelectItem>
                {collectionOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {visibleClips.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          {clips.length === 0
            ? "まだクリップがありません。［＋ 新規クリップ］から最初のクリップを登録しましょう。"
            : archiveFilter === "archived"
              ? "アーカイブ済みのクリップがありません。"
              : "条件に一致するクリップがありません。"}
        </p>
      ) : (
        <>
          <ClipTable
            clips={visibleClips}
            onToggleVisibility={handleToggleVisibility}
            onEditMetadata={(clip) => setDialog({ type: "edit-metadata", clip })}
            onUpdateContent={(clip) => setDialog({ type: "update-content", clip })}
            onTogglePin={handleTogglePin}
            onToggleArchive={handleToggleArchive}
            onDelete={(clip) => setDialog({ type: "delete", clip })}
          />
          <ClipCard
            clips={visibleClips}
            onToggleVisibility={handleToggleVisibility}
            onEditMetadata={(clip) => setDialog({ type: "edit-metadata", clip })}
            onUpdateContent={(clip) => setDialog({ type: "update-content", clip })}
            onTogglePin={handleTogglePin}
            onToggleArchive={handleToggleArchive}
            onDelete={(clip) => setDialog({ type: "delete", clip })}
          />
        </>
      )}

      <NewClipDialog
        open={dialog?.type === "new"}
        onOpenChange={(open) => !open && setDialog(null)}
        collectionOptions={collectionOptions}
        onCreated={refresh}
      />
      <EditMetadataDialog
        key={dialog?.type === "edit-metadata" ? dialog.clip.id : "edit-metadata-empty"}
        clip={dialog?.type === "edit-metadata" ? dialog.clip : null}
        onOpenChange={(open) => !open && setDialog(null)}
        collectionOptions={collectionOptions}
        onUpdated={refresh}
      />
      <UpdateContentDialog
        key={dialog?.type === "update-content" ? dialog.clip.id : "update-content-empty"}
        clip={dialog?.type === "update-content" ? dialog.clip : null}
        onOpenChange={(open) => !open && setDialog(null)}
        onUpdated={refresh}
      />
      <DeleteClipAlert
        clip={dialog?.type === "delete" ? dialog.clip : null}
        onOpenChange={(open) => !open && setDialog(null)}
        onDeleted={refresh}
      />
    </div>
  );
}
