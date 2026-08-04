import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { VisibilityToggle } from "@/components/clips/visibility-toggle";
import { CopyUrlButton } from "@/components/clips/copy-url-button";
import type { CollectionSummary } from "@/components/collections/types";

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function CollectionCard({
  collections,
  onToggleVisibility,
}: {
  collections: CollectionSummary[];
  onToggleVisibility: (collection: CollectionSummary) => void;
}) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {collections.map((collection) => (
        <div key={collection.id} className="rounded-xl border border-border p-4">
          <div className="mb-2.5 flex items-center gap-2">
            <VisibilityToggle
              visibility={collection.visibility}
              onToggle={() => onToggleVisibility(collection)}
            />
            <Badge variant="secondary" className="ml-auto bg-muted">
              {collection.pageCount}件
            </Badge>
          </div>
          <Link
            href={`/admin/collections/${collection.id}`}
            className="mb-2 block text-base font-bold leading-snug"
          >
            {collection.name}
          </Link>
          {collection.description && (
            <p className="mb-2.5 line-clamp-1 text-sm text-muted-foreground">
              {collection.description}
            </p>
          )}
          <div className="mb-3 text-xs font-medium text-muted-foreground">
            更新: {dateFormatter.format(collection.updatedAt)}
          </div>
          <div className="flex items-center gap-4 border-t border-border pt-2.5">
            {collection.visibility === "public" && (
              <CopyUrlButton uuid={collection.id} path="c" className="text-primary" />
            )}
            <Link
              href={`/admin/collections/${collection.id}`}
              className="text-sm font-semibold text-secondary-foreground"
            >
              詳細を見る
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
