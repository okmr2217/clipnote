import { collectionPages, collections } from "@clipnote/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireSessionUser } from "@/lib/auth";

// デスクトップのドラッグ&ドロップ、モバイルの並び替えモードのいずれも、
// 操作完了時点でまとめて1回このAPIを呼ぶ（設計書7-3節：書き込み回数の抑制）。
// bodyは並び替え後の全所属クリップidを希望する順序で渡し、既存の所属集合と
// 完全一致することを検証してからsort_orderをindexで振り直す。
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

  const existing = await db
    .select({ pageId: collectionPages.pageId })
    .from(collectionPages)
    .where(eq(collectionPages.collectionId, uuid));
  const existingIds = new Set(existing.map((row) => row.pageId));
  const requestedIds = new Set(pageIds);

  const isSameSet =
    existingIds.size === requestedIds.size &&
    existing.every((row) => requestedIds.has(row.pageId));
  if (!isSameSet) {
    return NextResponse.json({ error: "invalid_page_ids" }, { status: 400 });
  }

  if (pageIds.length === 0) {
    return NextResponse.json({ id: uuid });
  }

  const updates = pageIds.map((pageId, index) =>
    db
      .update(collectionPages)
      .set({ sortOrder: index })
      .where(and(eq(collectionPages.collectionId, uuid), eq(collectionPages.pageId, pageId))),
  );
  const touchStmt = db.update(collections).set({ updatedAt: new Date() }).where(eq(collections.id, uuid));

  type BatchArg = Parameters<typeof db.batch>[0];
  await db.batch([...updates, touchStmt] as unknown as BatchArg);

  return NextResponse.json({ id: uuid });
}
