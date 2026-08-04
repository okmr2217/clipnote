import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { ApiKeyRow } from "@/components/api-keys/types";

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function ApiKeyTable({
  apiKeys,
  onRevoke,
}: {
  apiKeys: ApiKeyRow[];
  onRevoke: (apiKey: ApiKeyRow) => void;
}) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <Table className="min-w-[720px]">
        <TableHeader>
          <TableRow>
            <TableHead>名前</TableHead>
            <TableHead>キー</TableHead>
            <TableHead>作成日時</TableHead>
            <TableHead>最終利用日時</TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {apiKeys.map((apiKey) => (
            <TableRow key={apiKey.id}>
              <TableCell className="text-[15px] font-semibold text-foreground">{apiKey.name}</TableCell>
              <TableCell className="font-mono text-sm text-muted-foreground">
                {apiKey.keyPrefix}
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {dateFormatter.format(apiKey.createdAt)}
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {apiKey.lastUsedAt ? dateFormatter.format(apiKey.lastUsedAt) : "未使用"}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" onClick={() => onRevoke(apiKey)}>
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
