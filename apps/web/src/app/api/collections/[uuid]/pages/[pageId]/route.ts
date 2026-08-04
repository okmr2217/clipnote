import { collectionPages, collections } from "@clipnote/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireSessionUser } from "@/lib/auth";

// 「外す」：collection_pagesの関連付けのみ削除する。クリップ本体（pages行）
// は削除しない（設計書7-5節）。確認ダイアログ不要（9章）。
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ uuid: string; pageId: string }> },
) {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { uuid, pageId } = await params;
  const db = await getDb();
  const [collection] = await db
    .select({ id: collections.id })
    .from(collections)
    .where(and(eq(collections.id, uuid), eq(collections.userId, user.id)));
  if (!collection) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await db.batch([
    db
      .delete(collectionPages)
      .where(and(eq(collectionPages.collectionId, uuid), eq(collectionPages.pageId, pageId))),
    db.update(collections).set({ updatedAt: new Date() }).where(eq(collections.id, uuid)),
  ]);

  return new NextResponse(null, { status: 204 });
}
