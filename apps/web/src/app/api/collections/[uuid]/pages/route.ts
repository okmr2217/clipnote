import { collectionPages, collections, pages } from "@clipnote/db/schema";
import { and, asc, eq, inArray, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireSessionUser } from "@/lib/auth";

// コレクション詳細の「クリップを追加」ダイアログから、選択済みidの集合を
// まとめて受け取り、既存の所属関係との差分だけ追加/削除する（設計書7-4節：
// チェックの付け外しで追加/除外の両方を1つのUIで扱う）。既存メンバーの
// sort_orderは変更せず、新規追加分だけ末尾に積む。
export async function PATCH(
  request: Request,
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

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const { pageIds } = body as Record<string, unknown>;
  if (!Array.isArray(pageIds) || !pageIds.every((id) => typeof id === "string")) {
    return NextResponse.json({ error: "invalid_page_ids" }, { status: 400 });
  }
  const desiredIds = [...new Set(pageIds)];

  if (desiredIds.length > 0) {
    // ゴミ箱内のクリップはコレクションへ追加できない（docs/design-trash.md
    // 3-4節）。既存メンバーがゴミ箱に入った場合は下のmemberRowsクエリで除外
    // されるため、ここでの整合性チェックはあくまで新規追加のガード。
    const owned = await db
      .select({ id: pages.id })
      .from(pages)
      .where(and(eq(pages.userId, user.id), isNull(pages.deletedAt), inArray(pages.id, desiredIds)));
    if (owned.length !== desiredIds.length) {
      return NextResponse.json({ error: "invalid_page_ids" }, { status: 400 });
    }
  }

  const existing = await db
    .select({ pageId: collectionPages.pageId, sortOrder: collectionPages.sortOrder })
    .from(collectionPages)
    .where(eq(collectionPages.collectionId, uuid));
  const existingIds = new Set(existing.map((row) => row.pageId));
  const desiredSet = new Set(desiredIds);

  const toRemove = existing.filter((row) => !desiredSet.has(row.pageId)).map((row) => row.pageId);
  const toAdd = desiredIds.filter((id) => !existingIds.has(id));
  const maxSortOrder = existing.reduce((max, row) => Math.max(max, row.sortOrder), -1);

  const deleteStmt =
    toRemove.length > 0
      ? db
          .delete(collectionPages)
          .where(
            and(eq(collectionPages.collectionId, uuid), inArray(collectionPages.pageId, toRemove)),
          )
      : null;
  const insertStmt =
    toAdd.length > 0
      ? db.insert(collectionPages).values(
          toAdd.map((pageId, index) => ({
            id: crypto.randomUUID(),
            collectionId: uuid,
            pageId,
            sortOrder: maxSortOrder + 1 + index,
          })),
        )
      : null;
  const touchStmt = db.update(collections).set({ updatedAt: new Date() }).where(eq(collections.id, uuid));

  if (deleteStmt && insertStmt) {
    await db.batch([deleteStmt, insertStmt, touchStmt]);
  } else if (deleteStmt) {
    await db.batch([deleteStmt, touchStmt]);
  } else if (insertStmt) {
    await db.batch([insertStmt, touchStmt]);
  }

  const memberRows = await db
    .select({
      id: pages.id,
      title: pages.title,
      contentType: pages.contentType,
      visibility: pages.visibility,
      sortOrder: collectionPages.sortOrder,
    })
    .from(collectionPages)
    .innerJoin(pages, eq(collectionPages.pageId, pages.id))
    .where(and(eq(collectionPages.collectionId, uuid), isNull(pages.deletedAt)))
    .orderBy(asc(collectionPages.sortOrder));

  return NextResponse.json({ members: memberRows });
}
