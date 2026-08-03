"use client";

import { EllipsisIcon } from "lucide-react";
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
  onDelete,
}: {
  clip: ClipRow;
  onEditMetadata: () => void;
  onUpdateContent: () => void;
  onDelete: () => void;
}) {
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
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          削除
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
