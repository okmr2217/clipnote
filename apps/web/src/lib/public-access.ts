import { cache } from "react";
import { collectionPages, collections, pages, users } from "@clipnote/db/schema";
import { and, asc, eq, isNull, sql } from "drizzle-orm";
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
  // ゴミ箱内のクリップは、所有者本人がゴミ箱画面から辿るプレビューに限って
  // 許可する（docs/design-trash.md 5章）。第三者・非公開クリップと同様に
  // 「存在しない」のと同じnullで返し、存在の痕跡を残さない。
  if (page.deletedAt !== null && page.userId !== user?.id) return null;
  if (page.visibility === "private" && page.userId !== user?.id) return null;

  return { page, viewerUserId: user?.id ?? null };
});

export const loadPublicCollection = cache(async (uuid: string) => {
  const user = await requireSessionUser();
  const db = await getDb();
  const [row] = await db
    .select({ collection: collections, ownerName: users.name })
    .from(collections)
    .innerJoin(users, eq(collections.userId, users.id))
    .where(eq(collections.id, uuid));
  if (!row) return null;
  const { collection, ownerName } = row;
  if (collection.visibility === "private" && collection.userId !== user?.id) return null;

  const isOwner = collection.userId === user?.id;

  // 所有者以外（未認証含む）が閲覧する場合は非公開クリップをクエリの時点で
  // 除外する（設計書4-5節：一覧のレスポンスにすら含めず、存在の痕跡を
  // 残さない）。ゴミ箱内のクリップは所有者本人の閲覧時も含めて常に除外する
  // （docs/design-trash.md 3-4節）。
  const memberRows = await db
    .select({
      id: pages.id,
      title: pages.title,
      contentType: pages.contentType,
      updatedAt: pages.updatedAt,
      sortOrder: collectionPages.sortOrder,
    })
    .from(collectionPages)
    .innerJoin(pages, eq(collectionPages.pageId, pages.id))
    .where(
      and(
        eq(collectionPages.collectionId, uuid),
        isNull(pages.deletedAt),
        isOwner ? undefined : eq(pages.visibility, "public"),
      ),
    )
    .orderBy(asc(collectionPages.sortOrder));

  return { collection, ownerName, viewerUserId: user?.id ?? null, isOwner, members: memberRows };
});

// 閲覧数のカウント（design-web.md 4-10節）。/p/[uuid]・/c/[uuid]のページ
// コンポーネント本体からのみ呼ぶ（1リクエスト＝1閲覧として数える）。
// loadPublicPage/loadPublicCollectionには載せない：あちらはgenerateMetadata・
// トークン自動更新API（POST /api/content-token、90秒毎）・/adminのプレビュー
// パネルからも共有で呼ばれるため、そこに載せると90秒毎の心拍のような呼び出し
// や所有者自身の管理画面操作までカウントしてしまう。公開設定がpublicの間、
// かつ所有者本人以外の閲覧のみを対象にする。
export async function recordPageView(page: { id: string; visibility: string; userId: string }, viewerUserId: string | null) {
  if (page.visibility !== "public" || viewerUserId === page.userId) return;
  const db = await getDb();
  await db
    .update(pages)
    .set({ viewCount: sql`${pages.viewCount} + 1` })
    .where(eq(pages.id, page.id));
}

export async function recordCollectionView(
  collection: { id: string; visibility: string; userId: string },
  viewerUserId: string | null,
) {
  if (collection.visibility !== "public" || viewerUserId === collection.userId) return;
  const db = await getDb();
  await db
    .update(collections)
    .set({ viewCount: sql`${collections.viewCount} + 1` })
    .where(eq(collections.id, collection.id));
}
