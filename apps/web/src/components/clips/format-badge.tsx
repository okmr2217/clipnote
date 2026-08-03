import { Badge } from "@/components/ui/badge";
import type { ClipRow } from "@/components/clips/types";

export function FormatBadge({ contentType }: { contentType: ClipRow["contentType"] }) {
  return (
    <Badge variant="secondary" className="uppercase">
      {contentType === "html" ? "HTML" : "MD"}
    </Badge>
  );
}
