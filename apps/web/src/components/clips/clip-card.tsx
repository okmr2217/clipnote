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
});

export function ClipCard({
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
    <div className="flex flex-col gap-3 md:hidden">
      {clips.map((clip) => (
        <div key={clip.id} className="rounded-xl border border-border bg-card p-4">
          <div className="mb-2.5 flex items-center gap-2">
            <FormatBadge contentType={clip.contentType} />
            <VisibilityToggle
              visibility={clip.visibility}
              onToggle={() => onToggleVisibility(clip)}
            />
          </div>
          <a
            href={`/p/${clip.id}`}
            target="_blank"
            rel="noreferrer"
            className="mb-2 block text-base font-bold leading-snug"
          >
            {clip.title}
          </a>
          <div className="mb-2.5">
            <CollectionChips collections={clip.collections} />
          </div>
          <div className="mb-3 text-xs font-medium text-muted-foreground">
            更新: {dateFormatter.format(clip.updatedAt)}
          </div>
          <div className="flex items-center gap-4 border-t border-border pt-2.5">
            {clip.visibility === "public" && (
              <CopyUrlButton uuid={clip.id} className="text-primary" />
            )}
            <a href={`/p/${clip.id}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-secondary-foreground">
              プレビュー
            </a>
            <div className="ml-auto">
              <ClipOverflowMenu
                clip={clip}
                onEditMetadata={() => onEditMetadata(clip)}
                onUpdateContent={() => onUpdateContent(clip)}
                onDelete={() => onDelete(clip)}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
