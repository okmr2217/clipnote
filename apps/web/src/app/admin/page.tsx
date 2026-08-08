import { collectionPages, collections, pages } from "@clipnote/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { ClipList } from "@/components/clips/clip-list";
import type { ClipRow, CollectionOption } from "@/components/clips/types";

export default async function AdminPage() {
  // AdminLayoutが未認証を弾いているため、ここではセッションは存在する前提。
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session!.user.id;

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

  return (
    <main className="px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-6xl">
        <ClipList clips={clips} collectionOptions={collectionOptions as CollectionOption[]} />
      </div>
    </main>
  );
}
