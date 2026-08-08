import { PinIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FormatBadge } from "@/components/clips/format-badge";
import { VisibilityToggle } from "@/components/clips/visibility-toggle";
import { CollectionChips } from "@/components/clips/collection-chips";
import { CopyUrlButton } from "@/components/clips/copy-url-button";
import { ClipOverflowMenu } from "@/components/clips/clip-overflow-menu";
import type { ClipRow } from "@/components/clips/types";

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function ClipTable({
  clips,
  onToggleVisibility,
  onEditMetadata,
  onUpdateContent,
  onTogglePin,
  onToggleArchive,
  onDelete,
}: {
  clips: ClipRow[];
  onToggleVisibility: (clip: ClipRow) => void;
  onEditMetadata: (clip: ClipRow) => void;
  onUpdateContent: (clip: ClipRow) => void;
  onTogglePin: (clip: ClipRow) => void;
  onToggleArchive: (clip: ClipRow) => void;
  onDelete: (clip: ClipRow) => void;
}) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <Table className="min-w-[880px]">
        <TableHeader>
          <TableRow>
            <TableHead>形式</TableHead>
            <TableHead>タイトル</TableHead>
            <TableHead>公開設定</TableHead>
            <TableHead>コレクション</TableHead>
            <TableHead>更新日時</TableHead>
            <TableHead className="w-11" />
            <TableHead className="w-11" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {clips.map((clip) => (
            <TableRow key={clip.id} className={cn(clip.archivedAt && "opacity-60")}>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <FormatBadge contentType={clip.contentType} />
                  {clip.pinned && <PinIcon className="size-3.5 text-primary" aria-label="固定済み" />}
                </div>
              </TableCell>
              <TableCell>
                <a
                  href={`/p/${clip.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[15px] font-semibold text-foreground hover:text-primary"
                >
                  {clip.title}
                </a>
                {clip.archivedAt && (
                  <Badge variant="secondary" className="ml-2 bg-muted text-muted-foreground">
                    アーカイブ済み
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <VisibilityToggle
                  visibility={clip.visibility}
                  onToggle={() => onToggleVisibility(clip)}
                />
              </TableCell>
              <TableCell>
                <CollectionChips collections={clip.collections} />
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {dateFormatter.format(clip.updatedAt)}
              </TableCell>
              <TableCell className="text-center">
                {clip.visibility === "public" && <CopyUrlButton uuid={clip.id} />}
              </TableCell>
              <TableCell className="text-center">
                <ClipOverflowMenu
                  clip={clip}
                  onEditMetadata={() => onEditMetadata(clip)}
                  onUpdateContent={() => onUpdateContent(clip)}
                  onTogglePin={() => onTogglePin(clip)}
                  onToggleArchive={() => onToggleArchive(clip)}
                  onDelete={() => onDelete(clip)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
