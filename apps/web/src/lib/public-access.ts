import { cache } from "react";
import { collectionPages, collections, pages } from "@clipnote/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { requireSessionUser } from "@/lib/auth";

// /p/[uuid]・/c/[uuid]のアクセス可否判定（設計書4-5節）。存在しない場合と
// 「存在するが非公開で権限がない」場合を呼び出し側で区別させない
// （どちらもnullを返す）ことで、非公開クリップ／コレクションの存在自体を
// 秘匿する。generateMetadataとpageコンポーネントの両方から呼ばれるため、
// 同一リクエスト内でのD1問い合わせの重複を避けるためreact cacheで包む。

export const loadPublicPage = cache(async (uuid: string) => {
  const user = await requireSessionUser();
  const db = await getDb();
  const [page] = await db.select().from(pages).where(eq(pages.id, uuid));
  if (!page) return null;
  if (page.visibility === "private" && page.userId !== user?.id) return null;

  return { page, viewerUserId: user?.id ?? null };
});

export const loadPublicCollection = cache(async (uuid: string) => {
  const user = await requireSessionUser();
  const db = await getDb();
  const [collection] = await db.select().from(collections).where(eq(collections.id, uuid));
  if (!collection) return null;
  if (collection.visibility === "private" && collection.userId !== user?.id) return null;

  const isOwner = collection.userId === user?.id;

  // 所有者以外（未認証含む）が閲覧する場合は非公開クリップをクエリの時点で
  // 除外する（設計書4-5節：一覧のレスポンスにすら含めず、存在の痕跡を
  // 残さない）。
  const memberRows = await db
    .select({
      id: pages.id,
      title: pages.title,
      contentType: pages.contentType,
      sortOrder: collectionPages.sortOrder,
    })
    .from(collectionPages)
    .innerJoin(pages, eq(collectionPages.pageId, pages.id))
    .where(
      and(
        eq(collectionPages.collectionId, uuid),
        isOwner ? undefined : eq(pages.visibility, "public"),
      ),
    )
    .orderBy(asc(collectionPages.sortOrder));

  return { collection, viewerUserId: user?.id ?? null, isOwner, members: memberRows };
});
