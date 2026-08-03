import { collections } from "@clipnote/db/schema";
import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireSessionUser } from "@/lib/auth";

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
