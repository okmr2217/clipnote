import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { ConnectedAppRow } from "@/components/connected-apps/types";

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function ConnectedAppTable({
  apps,
  onRevoke,
}: {
  apps: ConnectedAppRow[];
  onRevoke: (app: ConnectedAppRow) => void;
}) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <Table className="min-w-[720px]">
        <TableHeader>
          <TableRow>
            <TableHead>アプリ</TableHead>
            <TableHead>連携日時</TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {apps.map((app) => (
            <TableRow key={app.clientId}>
              <TableCell className="text-[15px] font-semibold text-foreground">{app.name}</TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {app.createdAt ? dateFormatter.format(app.createdAt) : "不明"}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" onClick={() => onRevoke(app)}>
                  失効
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
