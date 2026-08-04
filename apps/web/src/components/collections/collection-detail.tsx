"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VisibilityToggle } from "@/components/clips/visibility-toggle";
import { EditCollectionDialog } from "@/components/collections/edit-collection-dialog";
import { DeleteCollectionAlert } from "@/components/collections/delete-collection-alert";
import { CollectionMembers } from "@/components/collections/collection-members";
import type {
  ClipOption,
  CollectionDetail as CollectionDetailData,
  CollectionMemberClip,
} from "@/components/collections/types";

export function CollectionDetail({
  collection: initialCollection,
  initialMembers,
  clipOptions,
}: {
  collection: CollectionDetailData;
  initialMembers: CollectionMemberClip[];
  clipOptions: ClipOption[];
}) {
  const [collection, setCollection] = useState(initialCollection);
  const [members, setMembers] = useState(initialMembers);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleToggleVisibility() {
    const previous = collection.visibility;
    const next = previous === "public" ? "private" : "public";
    setCollection((prev) => ({ ...prev, visibility: next }));

    const response = await fetch(`/api/collections/${collection.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visibility: next }),
    });

    if (!response.ok) {
      setCollection((prev) => ({ ...prev, visibility: previous }));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/collections"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-secondary-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" /> コレクション一覧へ戻る
      </Link>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-3">
              <VisibilityToggle visibility={collection.visibility} onToggle={handleToggleVisibility} />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">{collection.name}</h1>
            {collection.description && (
              <p className="mt-1 text-sm text-muted-foreground">{collection.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setEditOpen(true)}>
              情報を編集
            </Button>
            <Button type="button" variant="destructive" onClick={() => setDeleteOpen(true)}>
              削除
            </Button>
          </div>
        </div>
      </div>

      <CollectionMembers
        collectionId={collection.id}
        members={members}
        onMembersChange={setMembers}
        clipOptions={clipOptions}
      />

      <EditCollectionDialog
        collection={collection}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdated={(next) => setCollection((prev) => ({ ...prev, ...next }))}
      />
      <DeleteCollectionAlert
        collectionId={collection.id}
        collectionName={collection.name}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </div>
  );
}
