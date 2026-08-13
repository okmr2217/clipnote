import { collectionPages, collections, pages } from "@clipnote/db/schema";
import { and, eq, inArray, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireSessionUser } from "@/lib/auth";
import {
  isContentType,
  isVisibility,
  validateContent,
} from "@clipnote/pages/validation";

export async function POST(request: Request) {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { title, contentType, content, visibility, collectionIds } = body as Record<
    string,
    unknown
  >;

  if (typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "invalid_title" }, { status: 400 });
  }
  if (!isContentType(contentType)) {
    return NextResponse.json({ error: "invalid_content_type" }, { status: 400 });
  }
  if (!isVisibility(visibility)) {
    return NextResponse.json({ error: "invalid_visibility" }, { status: 400 });
  }
  if (typeof content !== "string") {
    return NextResponse.json({ error: "invalid_content" }, { status: 400 });
  }
  const contentError = validateContent(content);
  if (contentError) {
    return NextResponse.json({ error: contentError }, { status: 400 });
  }

  let validCollectionIds: string[] = [];
  if (collectionIds !== undefined) {
    if (
      !Array.isArray(collectionIds) ||
      !collectionIds.every((id) => typeof id === "string")
    ) {
      return NextResponse.json({ error: "invalid_collection_ids" }, { status: 400 });
    }
    validCollectionIds = collectionIds;
  }

  const db = await getDb();

  if (validCollectionIds.length > 0) {
    const owned = await db
      .select({ id: collections.id })
      .from(collections)
      .where(
        and(eq(collections.userId, user.id), inArray(collections.id, validCollectionIds)),
      );
    if (owned.length !== new Set(validCollectionIds).size) {
      return NextResponse.json({ error: "invalid_collection_ids" }, { status: 400 });
    }
  }

  const id = crypto.randomUUID();
  const pageInsert = db.insert(pages).values({
    id,
    userId: user.id,
    title: title.trim(),
    content,
    contentType,
    visibility,
  });

  if (validCollectionIds.length > 0) {
    // 新規クリップは各コレクションで既存クリップの後ろ（末尾）に追加する。
    // 選択したコレクション配列内でのインデックスをsort_orderに使うと、
    // そのコレクション内の既存クリップと衝突・矛盾するため、
    // コレクションごとの現在の最大sort_orderを基準に算出する。
    const maxSortOrderRows = await db
      .select({
        collectionId: collectionPages.collectionId,
        maxSortOrder: sql<number>`max(${collectionPages.sortOrder})`,
      })
      .from(collectionPages)
      .where(inArray(collectionPages.collectionId, validCollectionIds))
      .groupBy(collectionPages.collectionId);
    const maxSortOrderByCollection = new Map(
      maxSortOrderRows.map((row) => [row.collectionId, row.maxSortOrder]),
    );

    const collectionPagesInsert = db.insert(collectionPages).values(
      validCollectionIds.map((collectionId) => ({
        id: crypto.randomUUID(),
        collectionId,
        pageId: id,
        sortOrder: (maxSortOrderByCollection.get(collectionId) ?? -1) + 1,
      })),
    );
    await db.batch([pageInsert, collectionPagesInsert]);
  } else {
    await pageInsert;
  }

  return NextResponse.json({ id }, { status: 201 });
}
