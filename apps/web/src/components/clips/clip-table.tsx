import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  onDelete,
}: {
  clips: ClipRow[];
  onToggleVisibility: (clip: ClipRow) => void;
  onEditMetadata: (clip: ClipRow) => void;
  onUpdateContent: (clip: ClipRow) => void;
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
            <TableRow key={clip.id}>
              <TableCell>
                <FormatBadge contentType={clip.contentType} />
              </TableCell>
              <TableCell>
                <a
                  href={`/p/${clip.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-foreground hover:text-primary"
                >
                  {clip.title}
                </a>
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
