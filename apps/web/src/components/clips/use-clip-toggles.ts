"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ClipRow } from "@/components/clips/types";

// 公開設定・固定・アーカイブの楽観的トグルをまとめたフック。ClipList（旧一覧）
// とClipWorkspace（2カラム新レイアウト）の両方から使う共通ロジック。
export function useClipToggles(clips: ClipRow[]) {
  const router = useRouter();
  const [optimisticVisibility, setOptimisticVisibility] = useState<
    Record<string, ClipRow["visibility"]>
  >({});
  const [optimisticPinned, setOptimisticPinned] = useState<Record<string, boolean>>({});
  const [optimisticArchived, setOptimisticArchived] = useState<Record<string, boolean>>({});

  const resolvedClips = useMemo(() => {
    return clips.map((clip) => ({
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
  }, [clips, optimisticVisibility, optimisticPinned, optimisticArchived]);

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

  return { resolvedClips, handleToggleVisibility, handleTogglePin, handleToggleArchive };
}
