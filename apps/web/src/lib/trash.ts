import type { Database } from "@clipnote/db";
import { pages } from "@clipnote/db/schema";
import { and, desc, eq, isNotNull, lt } from "drizzle-orm";
import { getDb } from "@/lib/db";
import type { TrashRow } from "@/components/clips/types";

// 30日間の保持期間（docs/design-trash.md 1章・6章）。自動パージ（apps/web
// のCron Trigger、src/app/api/trash/purge/route.ts）と表示上の残り日数計算
// (daysUntilPurge)の両方がこの定数を参照する。
export const TRASH_RETENTION_DAYS = 30;

// /admin/trash専用のデータ取得（docs/design-trash.md 3-3節）。削除日時
// 降順で並べる。
export async function loadTrashData(userId: string): Promise<{ clips: TrashRow[] }> {
  const db = await getDb();

  const rows = await db
    .select({
      id: pages.id,
      title: pages.title,
      contentType: pages.contentType,
      deletedAt: pages.deletedAt,
    })
    .from(pages)
    .where(and(eq(pages.userId, userId), isNotNull(pages.deletedAt)))
    .orderBy(desc(pages.deletedAt));

  const clips: TrashRow[] = rows.map((row) => ({ ...row, deletedAt: row.deletedAt! }));

  return { clips };
}

export function daysUntilPurge(deletedAt: Date, now: Date = new Date()): number {
  const purgeAt = deletedAt.getTime() + TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((purgeAt - now.getTime()) / (24 * 60 * 60 * 1000)));
}

// 30日超過分のゴミ箱を物理削除する日次バッチ（docs/design-trash.md 6章）。
// page_versions・collection_pagesはON DELETE CASCADEで自動的に削除される
// （設計書8章）ため、対象を1件ずつ処理する必要はない。「完全に削除」の
// 手動操作（/api/pages/[uuid]のDELETE）と同じカスケード機構に乗るだけで、
// 削除ロジック自体を別関数として分岐させていない。
export async function purgeExpiredTrash(db: Database, now: Date = new Date()) {
  const cutoff = new Date(now.getTime() - TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  await db.delete(pages).where(and(isNotNull(pages.deletedAt), lt(pages.deletedAt, cutoff)));
}
