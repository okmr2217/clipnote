import { collectionPages, collections } from "@clipnote/db/schema";
import { desc, eq, inArray, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { CollectionList } from "@/components/collections/collection-list";
import type { CollectionSummary } from "@/components/collections/types";

export default async function AdminCollectionsPage() {
  // AdminLayoutが未認証を弾いているため、ここではセッションは存在する前提。
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session!.user.id;

  const db = await getDb();
  const rows = await db
    .select({
      id: collections.id,
      name: collections.name,
      description: collections.description,
      visibility: collections.visibility,
      updatedAt: collections.updatedAt,
    })
    .from(collections)
    .where(eq(collections.userId, userId))
    .orderBy(desc(collections.updatedAt));

  const collectionIds = rows.map((row) => row.id);
  const countByCollectionId = new Map<string, number>();

  if (collectionIds.length > 0) {
    const counts = await db
      .select({ collectionId: collectionPages.collectionId, count: sql<number>`count(*)` })
      .from(collectionPages)
      .where(inArray(collectionPages.collectionId, collectionIds))
      .groupBy(collectionPages.collectionId);

    for (const row of counts) {
      countByCollectionId.set(row.collectionId, row.count);
    }
  }

  const collectionsList: CollectionSummary[] = rows.map((row) => ({
    ...row,
    pageCount: countByCollectionId.get(row.id) ?? 0,
  }));

  return (
    <main className="px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-6xl">
        <CollectionList collections={collectionsList} />
      </div>
    </main>
  );
}
