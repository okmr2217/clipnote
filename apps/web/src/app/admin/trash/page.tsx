import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { loadTrashData } from "@/lib/trash";
import { TrashList } from "@/components/clips/trash-list";

// ゴミ箱画面（docs/design-trash.md 3-3節）。削除したクリップは30日間ここに
// 保持され、期間が過ぎると自動的に完全削除される（apps/webのCron Trigger）。
export default async function TrashPage() {
  // AdminLayoutが未認証を弾いているため、ここではセッションは存在する前提。
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session!.user.id;

  const { clips } = await loadTrashData(userId);

  return (
    <main className="px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-xl font-extrabold tracking-tight md:text-2xl">ゴミ箱</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            削除したクリップは30日間ここに保持されます。期間が過ぎると自動的に完全削除されます。
          </p>
        </div>
        <TrashList clips={clips} />
      </div>
    </main>
  );
}
