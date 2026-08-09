import { collectionPages, collections, pages } from "@clipnote/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import type { ClipRow, CollectionOption } from "@/components/clips/types";

// /admin（旧一覧）・/admin/clips（2カラム新レイアウト）の両方から使う共通の
// データ取得。並び順は固定→更新日時降順（design-web.md 6-1節）。
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
      })
      .from(pages)
      .where(eq(pages.userId, userId))
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
