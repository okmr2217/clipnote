import { collections } from "@clipnote/db/schema";
import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireSessionUser } from "@/lib/auth";
import { isVisibility } from "@clipnote/pages/validation";

export async function GET() {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const rows = await db
    .select({ id: collections.id, name: collections.name, visibility: collections.visibility })
    .from(collections)
    .where(eq(collections.userId, user.id))
    .orderBy(asc(collections.name));

  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const { name, description, visibility } = body as Record<string, unknown>;

  if (typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "invalid_name" }, { status: 400 });
  }
  if (!isVisibility(visibility)) {
    return NextResponse.json({ error: "invalid_visibility" }, { status: 400 });
  }
  if (description !== undefined && typeof description !== "string") {
    return NextResponse.json({ error: "invalid_description" }, { status: 400 });
  }

  const db = await getDb();
  const id = crypto.randomUUID();
  await db.insert(collections).values({
    id,
    userId: user.id,
    name: name.trim(),
    description:
      typeof description === "string" && description.trim().length > 0
        ? description.trim()
        : null,
    visibility,
  });

  return NextResponse.json({ id }, { status: 201 });
}
