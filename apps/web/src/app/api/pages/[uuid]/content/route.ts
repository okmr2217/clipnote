import { pages, pageVersions } from "@clipnote/db/schema";
import { and, desc, eq, notInArray, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireSessionUser } from "@/lib/auth";
import { getUtf8ByteLength, isContentType, validateContent } from "@/lib/validation";

const KEPT_VERSION_COUNT = 10; // 直近10件のみ保持（設計書11章）

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

  const [{ maxVersionNumber }] = await db
    .select({ maxVersionNumber: sql<number | null>`max(${pageVersions.versionNumber})` })
    .from(pageVersions)
    .where(eq(pageVersions.pageId, uuid));
  const nextVersionNumber = (maxVersionNumber ?? 0) + 1;

  // 更新の流れ（設計書11章）：①更新前のpages.contentをpage_versionsへ退避
  // → ②pages.contentを新しい内容でUPDATE → ③直近10件を超える分を削除。
  // 3ステップの途中で失敗すると退避内容と現在の内容が食い違うため、
  // db.batch()で1つの原子的な単位として実行する。
  const archiveOldContent = db.insert(pageVersions).values({
    id: crypto.randomUUID(),
    pageId: uuid,
    content: page.content,
    contentType: page.contentType,
    versionNumber: nextVersionNumber,
  });
  const updateContent = db
    .update(pages)
    .set({ content, contentType, updatedAt: new Date() })
    .where(eq(pages.id, uuid));
  const pruneOldVersions = db.delete(pageVersions).where(
    and(
      eq(pageVersions.pageId, uuid),
      notInArray(
        pageVersions.versionNumber,
        db
          .select({ versionNumber: pageVersions.versionNumber })
          .from(pageVersions)
          .where(eq(pageVersions.pageId, uuid))
          .orderBy(desc(pageVersions.versionNumber))
          .limit(KEPT_VERSION_COUNT),
      ),
    ),
  );

  await db.batch([archiveOldContent, updateContent, pruneOldVersions]);

  return NextResponse.json({ id: uuid, contentType, archivedVersionNumber: nextVersionNumber });
}
