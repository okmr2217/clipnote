import { cn } from "@/lib/utils";
import { MAX_CONTENT_BYTES } from "@clipnote/pages/validation";

const WARNING_THRESHOLD = 0.9;

export function ByteCounter({ byteLength, className }: { byteLength: number; className?: string }) {
  const isWarning = byteLength > MAX_CONTENT_BYTES * WARNING_THRESHOLD;
  const isOver = byteLength > MAX_CONTENT_BYTES;

  return (
    <div
      className={cn(
        "text-right font-mono text-xs",
        isOver ? "font-bold text-destructive" : isWarning ? "text-primary" : "text-muted-foreground",
        className,
      )}
    >
      {byteLength.toLocaleString()} / {MAX_CONTENT_BYTES.toLocaleString()} bytes
    </div>
  );
}
