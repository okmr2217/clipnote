"use client";

import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  ClipboardCopyIcon,
  DownloadIcon,
  EllipsisIcon,
  PinIcon,
  PinOffIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ClipRow } from "@/components/clips/types";

export function ClipOverflowMenu({
  clip,
  onEditMetadata,
  onUpdateContent,
  onCopyContent,
  onDownloadContent,
  onTogglePin,
  onToggleArchive,
  onDelete,
}: {
  clip: ClipRow;
  onEditMetadata: () => void;
  onUpdateContent: () => void;
  onCopyContent: () => void;
  onDownloadContent: () => void;
  onTogglePin?: () => void;
  onToggleArchive: () => void;
  onDelete: () => void;
}) {
  const isArchived = clip.archivedAt !== null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" title="操作">
            <EllipsisIcon />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          render={<a href={`/p/${clip.id}`} target="_blank" rel="noreferrer" />}
        >
          プレビュー
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEditMetadata}>メタデータ編集</DropdownMenuItem>
        <DropdownMenuItem onClick={onUpdateContent}>コンテンツ更新</DropdownMenuItem>
        <DropdownMenuItem render={<Link href={`/admin/pages/${clip.id}`} />}>
          更新履歴
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onCopyContent}>
          <ClipboardCopyIcon /> コンテンツをコピー
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDownloadContent}>
          <DownloadIcon /> コンテンツをダウンロード
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {onTogglePin && (
          <DropdownMenuItem onClick={onTogglePin}>
            {clip.pinned ? (
              <>
                <PinOffIcon /> 固定を解除
              </>
            ) : (
              <>
                <PinIcon /> 固定する
              </>
            )}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onToggleArchive}>
          {isArchived ? (
            <>
              <ArchiveRestoreIcon /> アーカイブを解除
            </>
          ) : (
            <>
              <ArchiveIcon /> アーカイブ
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          削除
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
