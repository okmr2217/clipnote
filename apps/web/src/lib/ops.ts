import { pages, users } from "@clipnote/db/schema";
import { and, count, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";

export type OpsUserRow = {
  id: string;
  email: string;
  createdAt: Date;
  clipCount: number;
};

// クリップ数はゴミ箱内（deleted_at IS NOT NULL）を除いた件数。/adminの一覧
// （@/lib/clips.ts）と同じ除外方針。
export async function loadOpsUsers(): Promise<OpsUserRow[]> {
  const db = await getDb();

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      createdAt: users.createdAt,
      clipCount: count(pages.id),
    })
    .from(users)
    .leftJoin(pages, and(eq(pages.userId, users.id), isNull(pages.deletedAt)))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt));

  return rows;
}
