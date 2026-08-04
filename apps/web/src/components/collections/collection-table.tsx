import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VisibilityToggle } from "@/components/clips/visibility-toggle";
import { CopyUrlButton } from "@/components/clips/copy-url-button";
import type { CollectionSummary } from "@/components/collections/types";

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function CollectionTable({
  collections,
  onToggleVisibility,
}: {
  collections: CollectionSummary[];
  onToggleVisibility: (collection: CollectionSummary) => void;
}) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <Table className="min-w-[880px]">
        <TableHeader>
          <TableRow>
            <TableHead>コレクション名</TableHead>
            <TableHead>説明</TableHead>
            <TableHead>公開設定</TableHead>
            <TableHead>所属クリップ数</TableHead>
            <TableHead>更新日時</TableHead>
            <TableHead className="w-11" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {collections.map((collection) => (
            <TableRow key={collection.id}>
              <TableCell>
                <Link
                  href={`/admin/collections/${collection.id}`}
                  className="text-[15px] font-semibold text-foreground hover:text-primary"
                >
                  {collection.name}
                </Link>
              </TableCell>
              <TableCell className="max-w-64 truncate text-muted-foreground">
                {collection.description || "—"}
              </TableCell>
              <TableCell>
                <VisibilityToggle
                  visibility={collection.visibility}
                  onToggle={() => onToggleVisibility(collection)}
                />
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="bg-muted">
                  {collection.pageCount}件
                </Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {dateFormatter.format(collection.updatedAt)}
              </TableCell>
              <TableCell className="text-center">
                {collection.visibility === "public" && (
                  <CopyUrlButton uuid={collection.id} path="c" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
