"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FormatBadge } from "@/components/clips/format-badge";
import { PermanentlyDeleteClipAlert } from "@/components/clips/permanently-delete-clip-alert";
import { daysUntilPurge } from "@/lib/trash";
import type { TrashRow } from "@/components/clips/types";

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function TrashList({ clips }: { clips: TrashRow[] }) {
  const router = useRouter();
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TrashRow | null>(null);

  function refresh() {
    router.refresh();
  }

  async function handleRestore(clip: TrashRow) {
    setRestoringId(clip.id);
    const response = await fetch(`/api/pages/${clip.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deleted: false }),
    });
    setRestoringId(null);
    if (response.ok) refresh();
  }

  if (clips.length === 0) {
    return <p className="py-16 text-center text-sm text-muted-foreground">ゴミ箱は空です。</p>;
  }

  return (
    <div>
      {/* デスクトップ：テーブル形式 */}
      <div className="hidden overflow-x-auto md:block">
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead>形式</TableHead>
              <TableHead>タイトル</TableHead>
              <TableHead>削除日時</TableHead>
              <TableHead>自動削除まで</TableHead>
              <TableHead className="w-56" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {clips.map((clip) => (
              <TableRow key={clip.id}>
                <TableCell>
                  <FormatBadge contentType={clip.contentType} />
                </TableCell>
                <TableCell className="text-[15px] font-semibold">{clip.title}</TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {dateFormatter.format(clip.deletedAt)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  あと{daysUntilPurge(clip.deletedAt)}日で完全削除されます
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={restoringId === clip.id}
                      onClick={() => handleRestore(clip)}
                    >
                      復元
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(clip)}
                    >
                      完全に削除
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* モバイル：カード形式 */}
      <div className="flex flex-col gap-3 md:hidden">
        {clips.map((clip) => (
          <div key={clip.id} className="rounded-xl border border-border p-4">
            <div className="mb-2.5 flex items-center gap-2">
              <FormatBadge contentType={clip.contentType} />
            </div>
            <div className="mb-2 text-base font-bold leading-snug">{clip.title}</div>
            <div className="mb-3 text-xs font-medium text-muted-foreground">
              削除: {dateFormatter.format(clip.deletedAt)}・あと{daysUntilPurge(clip.deletedAt)}
              日で完全削除されます
            </div>
            <div className="flex items-center gap-2 border-t border-border pt-2.5">
              <Button
                variant="outline"
                size="sm"
                disabled={restoringId === clip.id}
                onClick={() => handleRestore(clip)}
              >
                復元
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteTarget(clip)}
              >
                完全に削除
              </Button>
            </div>
          </div>
        ))}
      </div>

      <PermanentlyDeleteClipAlert
        clip={deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onDeleted={refresh}
      />
    </div>
  );
}
