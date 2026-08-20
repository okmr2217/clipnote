import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OpsNav } from "@/components/ops/ops-nav";
import { loadOpsUsers } from "@/lib/ops";

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export default async function OpsPage() {
  const users = await loadOpsUsers();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <OpsNav current="users" />
      <h1 className="text-xl font-bold">ユーザー一覧</h1>
      <p className="mt-1 text-sm text-muted-foreground">全{users.length}件</p>
      <div className="mt-6 overflow-x-auto">
        <Table className="min-w-[560px]">
          <TableHeader>
            <TableRow>
              <TableHead>メールアドレス</TableHead>
              <TableHead>登録日</TableHead>
              <TableHead className="text-right">クリップ数</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{dateFormatter.format(user.createdAt)}</TableCell>
                <TableCell className="text-right">{user.clipCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
