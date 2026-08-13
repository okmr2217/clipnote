import { collectionPages, collections, pages } from "@clipnote/db/schema";
import { and, eq, inArray, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireSessionUser } from "@/lib/auth";
import { isVisibility } from "@clipnote/pages/validation";

async function loadOwnedPage(
  db: Awaited<ReturnType<typeof getDb>>,
  uuid: string,
  userId: string,
) {
  const [page] = await db
    .select()
    .from(pages)
    .where(and(eq(pages.id, uuid), eq(pages.userId, userId)));
  return page ?? null;
}

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
  const existing = await loadOwnedPage(db, uuid, user.id);
  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const { title, visibility, collectionIds, pinned, archived } = body as Record<
    string,
    unknown
  >;

  const update: {
    title?: string;
    visibility?: "private" | "public";
    pinned?: boolean;
    archivedAt?: Date | null;
    updatedAt: Date;
  } = {
    updatedAt: new Date(),
  };

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "invalid_title" }, { status: 400 });
    }
    update.title = title.trim();
  }

  if (visibility !== undefined) {
    if (!isVisibility(visibility)) {
      return NextResponse.json({ error: "invalid_visibility" }, { status: 400 });
    }
    update.visibility = visibility;
  }

  if (pinned !== undefined) {
    if (typeof pinned !== "boolean") {
      return NextResponse.json({ error: "invalid_pinned" }, { status: 400 });
    }
    update.pinned = pinned;
  }

  if (archived !== undefined) {
    if (typeof archived !== "boolean") {
      return NextResponse.json({ error: "invalid_archived" }, { status: 400 });
    }
    update.archivedAt = archived ? new Date() : null;
  }

  let validCollectionIds: string[] | null = null;
  if (collectionIds !== undefined) {
    if (
      !Array.isArray(collectionIds) ||
      !collectionIds.every((id) => typeof id === "string")
    ) {
      return NextResponse.json({ error: "invalid_collection_ids" }, { status: 400 });
    }
    if (collectionIds.length > 0) {
      const owned = await db
        .select({ id: collections.id })
        .from(collections)
        .where(
          and(eq(collections.userId, user.id), inArray(collections.id, collectionIds)),
        );
      if (owned.length !== new Set(collectionIds).size) {
        return NextResponse.json({ error: "invalid_collection_ids" }, { status: 400 });
      }
    }
    validCollectionIds = [...new Set(collectionIds)];
  }

  const pageUpdate = db.update(pages).set(update).where(eq(pages.id, uuid));

  if (validCollectionIds !== null) {
    // 所属コレクションの差分だけを追加/削除する。既存の所属関係の
    // sort_orderは変更せず、新規に加わったコレクションでは各コレクション内の
    // 既存クリップより前（最小sort_order-1）に追加する。公開コレクションは
    // クリップを都度追加していくタイムライン的な使い方を想定し、追加した
    // クリップが先頭に来る挙動を仕様とする（8-4節の考え方をこの仕様に合わせて更新）。
    const existingMemberships = await db
      .select({ collectionId: collectionPages.collectionId })
      .from(collectionPages)
      .where(eq(collectionPages.pageId, uuid));
    const existingCollectionIds = new Set(existingMemberships.map((row) => row.collectionId));
    const desiredCollectionIds = new Set(validCollectionIds);

    const toRemove = [...existingCollectionIds].filter((id) => !desiredCollectionIds.has(id));
    const toAdd = validCollectionIds.filter((id) => !existingCollectionIds.has(id));

    const deleteRemoved =
      toRemove.length > 0
        ? db
            .delete(collectionPages)
            .where(
              and(eq(collectionPages.pageId, uuid), inArray(collectionPages.collectionId, toRemove)),
            )
        : null;

    let insertAdded = null;
    if (toAdd.length > 0) {
      const minSortOrderRows = await db
        .select({
          collectionId: collectionPages.collectionId,
          minSortOrder: sql<number>`min(${collectionPages.sortOrder})`,
        })
        .from(collectionPages)
        .where(inArray(collectionPages.collectionId, toAdd))
        .groupBy(collectionPages.collectionId);
      const minSortOrderByCollection = new Map(
        minSortOrderRows.map((row) => [row.collectionId, row.minSortOrder]),
      );
      insertAdded = db.insert(collectionPages).values(
        toAdd.map((collectionId) => ({
          id: crypto.randomUUID(),
          collectionId,
          pageId: uuid,
          sortOrder: minSortOrderByCollection.has(collectionId)
            ? minSortOrderByCollection.get(collectionId)! - 1
            : 0,
        })),
      );
    }

    if (deleteRemoved && insertAdded) {
      await db.batch([pageUpdate, deleteRemoved, insertAdded]);
    } else if (deleteRemoved) {
      await db.batch([pageUpdate, deleteRemoved]);
    } else if (insertAdded) {
      await db.batch([pageUpdate, insertAdded]);
    } else {
      await pageUpdate;
    }
  } else {
    await pageUpdate;
  }

  return NextResponse.json({ id: uuid });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { uuid } = await params;
  const db = await getDb();
  const existing = await loadOwnedPage(db, uuid, user.id);
  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // page_versions・collection_pagesはON DELETE CASCADEで自動的に削除される
  // （設計書8章）。
  await db.delete(pages).where(eq(pages.id, uuid));

  return new NextResponse(null, { status: 204 });
}
