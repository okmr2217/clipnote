import { Badge } from "@/components/ui/badge";
import type { ClipRow } from "@/components/clips/types";

export function CollectionChips({ collections }: { collections: ClipRow["collections"] }) {
  if (collections.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {collections.map((collection) => (
        <Badge key={collection.id} variant="secondary" className="bg-muted">
          {collection.name}
        </Badge>
      ))}
    </div>
  );
}
