"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRightIcon,
  ExternalLinkIcon,
  GlobeIcon,
  PencilIcon,
  TriangleAlertIcon,
  Trash2Icon,
} from "lucide-react";
import { CopyUrlButton } from "@/components/clips/copy-url-button";
import { EditCollectionDialog } from "@/components/collections/edit-collection-dialog";
import { DeleteCollectionAlert } from "@/components/collections/delete-collection-alert";
import { CollectionMembers } from "@/components/collections/collection-members";
import type {
  ClipOption,
  CollectionDetail as CollectionDetailData,
  CollectionMemberClip,
} from "@/components/collections/types";

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function CollectionDetail({
  collection: initialCollection,
  initialMembers,
  clipOptions,
  initialAddClipsOpen = false,
}: {
  collection: CollectionDetailData;
  initialMembers: CollectionMemberClip[];
  clipOptions: ClipOption[];
  initialAddClipsOpen?: boolean;
}) {
  const [collection, setCollection] = useState(initialCollection);
  const [members, setMembers] = useState(initialMembers);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isPublic = collection.visibility === "public";
  const privateMemberCount = members.filter((member) => member.visibility === "private").length;

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
    <div>
      <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <Link href="/admin/collections" className="hover:text-foreground">
          コレクション
        </Link>
        <ChevronRightIcon className="size-3.5" />
        <span className="font-semibold text-foreground">{collection.name}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">{collection.name}</h1>
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              title="名前を編集"
              className="text-muted-foreground hover:text-foreground"
            >
              <PencilIcon className="size-3.5" />
            </button>
          </div>
          <p className="mt-1.5 text-sm font-medium text-muted-foreground">
            {members.length}件のクリップ ・ {dateFormatter.format(collection.updatedAt)}更新
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isPublic && (
            <>
              <CopyUrlButton uuid={collection.id} path="c" />
              <a
                href={`/c/${collection.id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-secondary-foreground hover:text-foreground"
              >
                公開ページで見る <ExternalLinkIcon className="size-3.5" />
              </a>
            </>
          )}
          <button
            type="button"
            onClick={handleToggleVisibility}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-bold whitespace-nowrap text-primary"
          >
            <GlobeIcon className="size-3.5" /> {isPublic ? "公開中" : "非公開"}
          </button>
        </div>
      </div>

      {isPublic && privateMemberCount > 0 && (
        <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-secondary p-3.5">
          <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0 text-accent-foreground" />
          <p className="text-sm leading-relaxed text-accent-foreground">
            このコレクションは公開ですが、非公開のクリップが{privateMemberCount}件含まれています。公開URLの一覧からは自動的に除外されます。
          </p>
        </div>
      )}

      <div className="mt-5 rounded-xl border border-border bg-background p-4 md:p-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-bold text-muted-foreground">説明</p>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <PencilIcon className="size-3" /> 編集
          </button>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {collection.description || (
            <span className="text-muted-foreground">説明はありません</span>
          )}
        </p>
      </div>

      <div className="mt-5">
        <CollectionMembers
          collectionId={collection.id}
          members={members}
          onMembersChange={setMembers}
          clipOptions={clipOptions}
          initialAddClipsOpen={initialAddClipsOpen}
        />
      </div>

      <div className="mt-5 flex justify-end border-t border-border pt-4">
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-destructive"
        >
          <Trash2Icon className="size-3.5" /> コレクションを削除
        </button>
      </div>

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
