import { collectionPages, collections, pages } from "@clipnote/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { CollectionDetail } from "@/components/collections/collection-detail";
import type { ClipOption, CollectionMemberClip } from "@/components/collections/types";

export default async function AdminCollectionDetailPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;

  // AdminLayoutが未認証を弾いているため、ここではセッションは存在する前提。
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session!.user.id;

  const db = await getDb();
  const [collection] = await db
    .select()
    .from(collections)
    .where(and(eq(collections.id, uuid), eq(collections.userId, userId)));

  if (!collection) {
    notFound();
  }

  const [memberRows, clipRows] = await Promise.all([
    db
      .select({
        id: pages.id,
        title: pages.title,
        contentType: pages.contentType,
        visibility: pages.visibility,
        sortOrder: collectionPages.sortOrder,
      })
      .from(collectionPages)
      .innerJoin(pages, eq(collectionPages.pageId, pages.id))
      .where(eq(collectionPages.collectionId, uuid))
      .orderBy(asc(collectionPages.sortOrder)),
    db
      .select({ id: pages.id, title: pages.title, contentType: pages.contentType })
      .from(pages)
      .where(eq(pages.userId, userId)),
  ]);

  const members: CollectionMemberClip[] = memberRows;
  const clipOptions: ClipOption[] = clipRows;

  return (
    <main className="px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-4xl">
        <CollectionDetail
          collection={{
            id: collection.id,
            name: collection.name,
            description: collection.description,
            visibility: collection.visibility,
            updatedAt: collection.updatedAt,
          }}
          initialMembers={members}
          clipOptions={clipOptions}
        />
      </div>
    </main>
  );
}
