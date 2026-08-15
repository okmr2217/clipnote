"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import type { ClipRow } from "@/components/clips/types";

// 公開設定・固定・アーカイブ・ゴミ箱の楽観的トグルをまとめたフック。
// ClipWorkspace（/adminの一覧＋プレビュー）が使う共通ロジック。
export function useClipToggles(clips: ClipRow[]) {
  const router = useRouter();
  const toast = useToast();
  const [optimisticVisibility, setOptimisticVisibility] = useState<
    Record<string, ClipRow["visibility"]>
  >({});
  const [optimisticPinned, setOptimisticPinned] = useState<Record<string, boolean>>({});
  const [optimisticArchived, setOptimisticArchived] = useState<Record<string, boolean>>({});
  // ゴミ箱へ移動したクリップのidの集合。一覧からの即時除外にのみ使う
  // （docs/design-trash.md 3-1節：確認ダイアログなし・Undoトースト方式）。
  const [trashedIds, setTrashedIds] = useState<Set<string>>(new Set());

  const resolvedClips = useMemo(() => {
    return clips
      .filter((clip) => !trashedIds.has(clip.id))
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
      }));
  }, [clips, optimisticVisibility, optimisticPinned, optimisticArchived, trashedIds]);

  async function patch(
    clipId: string,
    body: Record<string, unknown>,
    revert: () => void,
  ): Promise<boolean> {
    const response = await fetch(`/api/pages/${clipId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      revert();
      return false;
    }

    router.refresh();
    return true;
  }

  async function handleToggleVisibility(clip: ClipRow) {
    const current = optimisticVisibility[clip.id] ?? clip.visibility;
    const next = current === "public" ? "private" : "public";
    setOptimisticVisibility((prev) => ({ ...prev, [clip.id]: next }));

    await patch(clip.id, { visibility: next }, () => {
      setOptimisticVisibility((prev) => {
        const rest = { ...prev };
        delete rest[clip.id];
        return rest;
      });
    });
  }

  async function handleTogglePin(clip: ClipRow) {
    const current = optimisticPinned[clip.id] ?? clip.pinned;
    const next = !current;
    setOptimisticPinned((prev) => ({ ...prev, [clip.id]: next }));

    await patch(clip.id, { pinned: next }, () => {
      setOptimisticPinned((prev) => {
        const rest = { ...prev };
        delete rest[clip.id];
        return rest;
      });
    });
  }

  async function handleToggleArchive(clip: ClipRow) {
    const current = optimisticArchived[clip.id] ?? clip.archivedAt !== null;
    const next = !current;
    setOptimisticArchived((prev) => ({ ...prev, [clip.id]: next }));

    await patch(clip.id, { archived: next }, () => {
      setOptimisticArchived((prev) => {
        const rest = { ...prev };
        delete rest[clip.id];
        return rest;
      });
    });
  }

  // クリップ削除＝ゴミ箱への移動（docs/design-trash.md 3-1節・4章）。確認
  // ダイアログは出さず、一覧から即座に消してUndoトーストで取り消し手段を
  // 提供する。物理削除は/admin/trash側の「完全に削除」でのみ行う。
  async function handleTrash(clip: ClipRow) {
    setTrashedIds((prev) => new Set(prev).add(clip.id));

    const ok = await patch(clip.id, { deleted: true }, () => {
      setTrashedIds((prev) => {
        const next = new Set(prev);
        next.delete(clip.id);
        return next;
      });
    });

    if (ok) {
      toast.add({
        title: "ゴミ箱に移動しました",
        description: clip.title,
        timeout: 6000,
        actionProps: {
          children: "元に戻す",
          onClick: () => handleUndoTrash(clip.id),
        },
      });
    }
  }

  async function handleUndoTrash(clipId: string) {
    setTrashedIds((prev) => {
      const next = new Set(prev);
      next.delete(clipId);
      return next;
    });

    await patch(clipId, { deleted: false }, () => {
      setTrashedIds((prev) => new Set(prev).add(clipId));
    });
  }

  return {
    resolvedClips,
    handleToggleVisibility,
    handleTogglePin,
    handleToggleArchive,
    handleTrash,
  };
}
