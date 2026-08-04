import { pages } from "@clipnote/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireSessionUser } from "@/lib/auth";
import { getUtf8ByteLength, isContentType, validateContent } from "@clipnote/pages/validation";
import { replacePageContent } from "@clipnote/pages/page-versions";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { uuid } = await params;
  const db = await getDb();
  const [page] = await db
    .select()
    .from(pages)
    .where(and(eq(pages.id, uuid), eq(pages.userId, user.id)));

  if (!page) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    id: page.id,
    contentType: page.contentType,
    updatedAt: page.updatedAt,
    contentByteLength: getUtf8ByteLength(page.content),
  });
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
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const { content, contentType } = body as Record<string, unknown>;

  if (!isContentType(contentType)) {
    return NextResponse.json({ error: "invalid_content_type" }, { status: 400 });
  }
  if (typeof content !== "string") {
    return NextResponse.json({ error: "invalid_content" }, { status: 400 });
  }
  const contentError = validateContent(content);
  if (contentError) {
    return NextResponse.json({ error: contentError }, { status: 400 });
  }

  const db = await getDb();
  const [page] = await db
    .select()
    .from(pages)
    .where(and(eq(pages.id, uuid), eq(pages.userId, user.id)));

  if (!page) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { archivedVersionNumber } = await replacePageContent(db, page, { content, contentType });

  return NextResponse.json({ id: uuid, contentType, archivedVersionNumber });
}
