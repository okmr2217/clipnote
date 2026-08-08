import { Badge } from "@/components/ui/badge";
import type { ClipRow } from "@/components/clips/types";

const FORMAT_LABEL: Record<ClipRow["contentType"], string> = {
  html: "HTML",
  markdown: "MD",
  plaintext: "TXT",
};

export function FormatBadge({ contentType }: { contentType: ClipRow["contentType"] }) {
  return (
    <Badge variant="secondary" className="bg-muted font-bold uppercase">
      {FORMAT_LABEL[contentType]}
    </Badge>
  );
}
