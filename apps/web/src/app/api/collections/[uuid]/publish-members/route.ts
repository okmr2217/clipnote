import { collectionPages, collections, pages } from "@clipnote/db/schema";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireSessionUser } from "@/lib/auth";

// 公開コレクションに非公開クリップが含まれる場合の一括公開操作
// （docs/design-web.md 8-2節）。対象は当該コレクションに所属する非公開
// クリップのみ。コレクション自体の公開設定や他コレクションへの所属には
// 触れない。破壊的操作（非公開クリップが一斉に公開になる）のため、
// 呼び出し側（クライアント）で警告ダイアログによる確認を必須とする。
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { uuid } = await params;
  const db = await getDb();
  const [collection] = await db
    .select({ id: collections.id })
    .from(collections)
    .where(and(eq(collections.id, uuid), eq(collections.userId, user.id)));
  if (!collection) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const privateMembers = await db
    .select({ id: pages.id })
    .from(collectionPages)
    .innerJoin(pages, eq(collectionPages.pageId, pages.id))
    .where(
      and(
        eq(collectionPages.collectionId, uuid),
        eq(pages.visibility, "private"),
        isNull(pages.deletedAt),
      ),
    );

  if (privateMembers.length === 0) {
    return NextResponse.json({ publishedIds: [] });
  }

  const publishedIds = privateMembers.map((row) => row.id);
  await db
    .update(pages)
    .set({ visibility: "public", updatedAt: new Date() })
    .where(inArray(pages.id, publishedIds));

  return NextResponse.json({ publishedIds });
}
