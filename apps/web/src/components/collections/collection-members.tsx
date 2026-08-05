"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DesktopMemberList } from "@/components/collections/desktop-member-list";
import { MobileMemberList } from "@/components/collections/mobile-member-list";
import { AddClipsDialog } from "@/components/collections/add-clips-dialog";
import type { ClipOption, CollectionMemberClip } from "@/components/collections/types";

export function CollectionMembers({
  collectionId,
  members,
  onMembersChange,
  clipOptions,
  initialAddClipsOpen = false,
}: {
  collectionId: string;
  members: CollectionMemberClip[];
  onMembersChange: (members: CollectionMemberClip[]) => void;
  clipOptions: ClipOption[];
  initialAddClipsOpen?: boolean;
}) {
  const [addOpen, setAddOpen] = useState(initialAddClipsOpen);
  const [mobileReordering, setMobileReordering] = useState(false);

  // ドラッグ操作／並び替えモードの完了時点でまとめて1回だけAPIを呼ぶ
  // （設計書7-3節）。失敗時は元の順序に戻す。
  async function persistReorder(orderedIds: string[]) {
    const previous = members;
    const next = orderedIds
      .map((id, index) => {
        const member = members.find((m) => m.id === id);
        return member ? { ...member, sortOrder: index } : null;
      })
      .filter((member): member is CollectionMemberClip => member !== null);
    onMembersChange(next);

    const response = await fetch(`/api/collections/${collectionId}/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageIds: orderedIds }),
    });
    if (!response.ok) {
      onMembersChange(previous);
    }
  }

  async function handleRemove(pageId: string) {
    const previous = members;
    onMembersChange(members.filter((member) => member.id !== pageId));

    const response = await fetch(`/api/collections/${collectionId}/pages/${pageId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      onMembersChange(previous);
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold tracking-tight">所属クリップ</h2>
        {!mobileReordering && (
          <Button
            type="button"
            className="h-auto px-4 py-2.5 shadow-[var(--shadow-accent)]"
            onClick={() => setAddOpen(true)}
          >
            <PlusIcon /> クリップを追加
          </Button>
        )}
      </div>

      {members.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          まだクリップがありません。［＋ クリップを追加］から追加しましょう。
        </p>
      ) : (
        <>
          <DesktopMemberList
            members={members}
            collectionId={collectionId}
            onReorder={persistReorder}
            onRemove={handleRemove}
          />
          <MobileMemberList
            members={members}
            collectionId={collectionId}
            onReorder={persistReorder}
            onRemove={handleRemove}
            onModeChange={setMobileReordering}
          />
        </>
      )}

      <AddClipsDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        collectionId={collectionId}
        clipOptions={clipOptions}
        currentMemberIds={members.map((member) => member.id)}
        onAdded={onMembersChange}
      />
    </div>
  );
}
