import { Button } from "@/components/ui/button";
import type { ConnectedAppRow } from "@/components/connected-apps/types";

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function ConnectedAppCard({
  apps,
  onRevoke,
}: {
  apps: ConnectedAppRow[];
  onRevoke: (app: ConnectedAppRow) => void;
}) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {apps.map((app) => (
        <div key={app.clientId} className="rounded-xl border border-border p-4">
          <div className="mb-2.5 text-base font-bold leading-snug">{app.name}</div>
          <div className="mb-3 text-xs font-medium text-muted-foreground">
            連携: {app.createdAt ? dateFormatter.format(app.createdAt) : "不明"}
          </div>
          <div className="flex items-center border-t border-border pt-2.5">
            <Button variant="outline" size="sm" className="ml-auto" onClick={() => onRevoke(app)}>
              失効
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
