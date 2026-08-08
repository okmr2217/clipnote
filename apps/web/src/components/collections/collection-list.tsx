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
import { CollectionTable } from "@/components/collections/collection-table";
import { CollectionCard } from "@/components/collections/collection-card";
import { NewCollectionDialog } from "@/components/collections/new-collection-dialog";
import { EditCollectionDialog } from "@/components/collections/edit-collection-dialog";
import { DeleteCollectionAlert } from "@/components/collections/delete-collection-alert";
import type { CollectionSummary } from "@/components/collections/types";

export function CollectionList({ collections }: { collections: CollectionSummary[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [newOpen, setNewOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<CollectionSummary | null>(null);
  const [deletingCollection, setDeletingCollection] = useState<CollectionSummary | null>(null);
  const [optimisticVisibility, setOptimisticVisibility] = useState<
    Record<string, CollectionSummary["visibility"]>
  >({});

  const visibleCollections = useMemo(() => {
    return collections
      .map((collection) => ({
        ...collection,
        visibility: optimisticVisibility[collection.id] ?? collection.visibility,
      }))
      .filter((collection) => {
        if (search && !collection.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (visibilityFilter !== "all" && collection.visibility !== visibilityFilter) return false;
        return true;
      });
  }, [collections, search, visibilityFilter, optimisticVisibility]);

  function clearOptimisticVisibility(id: string) {
    setOptimisticVisibility((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  async function handleToggleVisibility(collection: CollectionSummary) {
    const current = optimisticVisibility[collection.id] ?? collection.visibility;
    const next = current === "public" ? "private" : "public";
    setOptimisticVisibility((prev) => ({ ...prev, [collection.id]: next }));

    const response = await fetch(`/api/collections/${collection.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visibility: next }),
    });

    if (!response.ok) {
      clearOptimisticVisibility(collection.id);
      return;
    }

    router.refresh();
    clearOptimisticVisibility(collection.id);
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight md:text-2xl">コレクション一覧</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            複数のクリップをまとめて公開・非公開を切り替えられます。
          </p>
        </div>
        <Button
          className="hidden h-auto px-5 py-3 shadow-[var(--shadow-accent)] md:inline-flex"
          onClick={() => setNewOpen(true)}
        >
          <PlusIcon /> 新規コレクション
        </Button>
        <Button
          variant="secondary"
          size="icon"
          aria-label="新規コレクション"
          className="size-9 rounded-md text-primary shadow-none md:hidden"
          onClick={() => setNewOpen(true)}
        >
          <PlusIcon />
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <Input
          placeholder="名前で検索"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-auto rounded-md bg-background px-4 py-2.5 md:min-w-56 md:flex-1"
        />
        <div className="flex gap-2 overflow-x-auto md:contents">
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
        </div>
      </div>

      {visibleCollections.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          {collections.length === 0
            ? "まだコレクションがありません。［＋ 新規コレクション］から作成しましょう。"
            : "条件に一致するコレクションがありません。"}
        </p>
      ) : (
        <>
          <CollectionTable
            collections={visibleCollections}
            onToggleVisibility={handleToggleVisibility}
            onEdit={setEditingCollection}
            onDelete={setDeletingCollection}
          />
          <CollectionCard
            collections={visibleCollections}
            onToggleVisibility={handleToggleVisibility}
            onEdit={setEditingCollection}
            onDelete={setDeletingCollection}
          />
        </>
      )}

      <NewCollectionDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        onCreated={(id) => router.push(`/admin/collections/${id}?addClips=1`)}
      />

      {editingCollection && (
        <EditCollectionDialog
          collection={editingCollection}
          open={editingCollection !== null}
          onOpenChange={(open) => {
            if (!open) setEditingCollection(null);
          }}
          onUpdated={() => {
            setEditingCollection(null);
            router.refresh();
          }}
        />
      )}

      {deletingCollection && (
        <DeleteCollectionAlert
          collectionId={deletingCollection.id}
          collectionName={deletingCollection.name}
          open={deletingCollection !== null}
          onOpenChange={(open) => {
            if (!open) setDeletingCollection(null);
          }}
        />
      )}
    </div>
  );
}
