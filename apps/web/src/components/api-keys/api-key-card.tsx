import { Button } from "@/components/ui/button";
import type { ApiKeyRow } from "@/components/api-keys/types";

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function ApiKeyCard({
  apiKeys,
  onRevoke,
}: {
  apiKeys: ApiKeyRow[];
  onRevoke: (apiKey: ApiKeyRow) => void;
}) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {apiKeys.map((apiKey) => (
        <div key={apiKey.id} className="rounded-xl border border-border p-4">
          <div className="mb-2 text-base font-bold leading-snug">{apiKey.name}</div>
          <div className="mb-2.5 font-mono text-sm text-muted-foreground">{apiKey.keyPrefix}</div>
          <div className="mb-3 text-xs font-medium text-muted-foreground">
            作成: {dateFormatter.format(apiKey.createdAt)}　最終利用:{" "}
            {apiKey.lastUsedAt ? dateFormatter.format(apiKey.lastUsedAt) : "未使用"}
          </div>
          <div className="flex items-center border-t border-border pt-2.5">
            <Button variant="outline" size="sm" className="ml-auto" onClick={() => onRevoke(apiKey)}>
              失効
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
