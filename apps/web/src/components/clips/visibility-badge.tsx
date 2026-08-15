import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ClipRow } from "@/components/clips/types";

// 状態行に並ぶ情報バッジの1つ。形式バッジ・コレクションチップと同じ見た目にし、
// 公開/非公開の区別のみドットで補足する。クリック操作は持たない（切替はヘッダーの
// 専用トグルボタンで行う）。
export function VisibilityBadge({ visibility }: { visibility: ClipRow["visibility"] }) {
  const isPublic = visibility === "public";

  return (
    <Badge variant="secondary" className="gap-1.5 bg-muted font-bold">
      <span className={cn("size-1.5 rounded-full", isPublic ? "bg-primary" : "bg-muted-foreground/50")} />
      {isPublic ? "公開" : "非公開"}
    </Badge>
  );
}
