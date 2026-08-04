import { collections } from "@clipnote/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireSessionUser } from "@/lib/auth";
import { isVisibility } from "@clipnote/pages/validation";

async function loadOwnedCollection(
  db: Awaited<ReturnType<typeof getDb>>,
  uuid: string,
  userId: string,
) {
  const [collection] = await db
    .select()
    .from(collections)
    .where(and(eq(collections.id, uuid), eq(collections.userId, userId)));
  return collection ?? null;
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
  const existing = await loadOwnedCollection(db, uuid, user.id);
  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const { name, description, visibility } = body as Record<string, unknown>;

  const update: {
    name?: string;
    description?: string | null;
    visibility?: "private" | "public";
    updatedAt: Date;
  } = {
    updatedAt: new Date(),
  };

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "invalid_name" }, { status: 400 });
    }
    update.name = name.trim();
  }

  if (description !== undefined) {
    if (typeof description !== "string") {
      return NextResponse.json({ error: "invalid_description" }, { status: 400 });
    }
    update.description = description.trim().length > 0 ? description.trim() : null;
  }

  if (visibility !== undefined) {
    if (!isVisibility(visibility)) {
      return NextResponse.json({ error: "invalid_visibility" }, { status: 400 });
    }
    update.visibility = visibility;
  }

  await db.update(collections).set(update).where(eq(collections.id, uuid));

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
  const existing = await loadOwnedCollection(db, uuid, user.id);
  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // collection_pagesはON DELETE CASCADEで自動的に削除される（設計書8章）。
  // 所属していたpages自体は削除されない。
  await db.delete(collections).where(eq(collections.id, uuid));

  return new NextResponse(null, { status: 204 });
}
