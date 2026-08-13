import { collectionPages, collections, pages } from "@clipnote/db/schema";
import { and, eq, inArray } from "drizzle-orm";
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
  const { title, visibility, collectionIds, pinned, archived, deleted } = body as Record<
    string,
    unknown
  >;

  const update: {
    title?: string;
    visibility?: "private" | "public";
    pinned?: boolean;
    archivedAt?: Date | null;
    deletedAt?: Date | null;
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

  // ゴミ箱への移動／復元（docs/design-trash.md 3-1節・2-3節）。移動は即時
  // 反映・確認ダイアログ不要（クライアント側でUndoトーストを出す）。復元は
  // pinned/archivedAtの値をそのまま残すため、ここでは他のフィールドに触れない。
  if (deleted !== undefined) {
    if (typeof deleted !== "boolean") {
      return NextResponse.json({ error: "invalid_deleted" }, { status: 400 });
    }
    update.deletedAt = deleted ? new Date() : null;
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
    validCollectionIds = collectionIds;
  }

  const pageUpdate = db.update(pages).set(update).where(eq(pages.id, uuid));

  if (validCollectionIds !== null) {
    const deleteExisting = db
      .delete(collectionPages)
      .where(eq(collectionPages.pageId, uuid));

    if (validCollectionIds.length > 0) {
      const insertNew = db.insert(collectionPages).values(
        validCollectionIds.map((collectionId, index) => ({
          id: crypto.randomUUID(),
          collectionId,
          pageId: uuid,
          sortOrder: index,
        })),
      );
      await db.batch([pageUpdate, deleteExisting, insertNew]);
    } else {
      await db.batch([pageUpdate, deleteExisting]);
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

  // 「削除」操作自体は論理削除（PATCH { deleted: true }）に変更したため、
  // このエンドポイントはゴミ箱からの「完全に削除」専用となる（設計書
  // docs/design-trash.md 4章）。ゴミ箱に入っていないクリップの直接ハード
  // 削除は許可しない。
  if (existing.deletedAt === null) {
    return NextResponse.json({ error: "not_in_trash" }, { status: 400 });
  }

  // page_versions・collection_pagesはON DELETE CASCADEで自動的に削除される
  // （設計書8章）。
  await db.delete(pages).where(eq(pages.id, uuid));

  return new NextResponse(null, { status: 204 });
}
