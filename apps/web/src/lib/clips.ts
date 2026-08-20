import { collectionPages, collections, pages } from "@clipnote/db/schema";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import type { ClipRow, CollectionOption } from "@/components/clips/types";

// /admin（一覧＋プレビューのClipWorkspace）が使うデータ取得。並び順は
// 固定→更新日時降順（design-web.md 6-1節）。ゴミ箱内（deleted_at IS NOT
// NULL）のクリップは常に除外する（docs/design-trash.md 3-1節）。ゴミ箱
// 自体の一覧は@/lib/trashのloadTrashDataを使う。
export async function loadClipWorkspaceData(
  userId: string,
): Promise<{ clips: ClipRow[]; collectionOptions: CollectionOption[] }> {
  const db = await getDb();

  const [pageRows, collectionOptions] = await Promise.all([
    db
      .select({
        id: pages.id,
        title: pages.title,
        contentType: pages.contentType,
        visibility: pages.visibility,
        pinned: pages.pinned,
        archivedAt: pages.archivedAt,
        updatedAt: pages.updatedAt,
        viewCount: pages.viewCount,
      })
      .from(pages)
      .where(and(eq(pages.userId, userId), isNull(pages.deletedAt)))
      .orderBy(desc(pages.pinned), desc(pages.updatedAt)),
    db
      .select({ id: collections.id, name: collections.name, visibility: collections.visibility })
      .from(collections)
      .where(eq(collections.userId, userId)),
  ]);

  const pageIds = pageRows.map((row) => row.id);
  const collectionsByPageId = new Map<string, { id: string; name: string }[]>();

  if (pageIds.length > 0) {
    const links = await db
      .select({
        pageId: collectionPages.pageId,
        collectionId: collections.id,
        collectionName: collections.name,
      })
      .from(collectionPages)
      .innerJoin(collections, eq(collectionPages.collectionId, collections.id))
      .where(inArray(collectionPages.pageId, pageIds));

    for (const link of links) {
      const list = collectionsByPageId.get(link.pageId) ?? [];
      list.push({ id: link.collectionId, name: link.collectionName });
      collectionsByPageId.set(link.pageId, list);
    }
  }

  const clips: ClipRow[] = pageRows.map((row) => ({
    ...row,
    collections: collectionsByPageId.get(row.id) ?? [],
  }));

  return { clips, collectionOptions: collectionOptions as CollectionOption[] };
}
