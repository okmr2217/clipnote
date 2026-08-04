import { pages, pageVersions } from "@clipnote/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireSessionUser } from "@/lib/auth";
import { replacePageContent } from "@clipnote/pages/page-versions";

// 復元の流れ（設計書11章）：①復元前の現在の内容をpage_versionsへ退避
// → ②選択したバージョンの内容でpages.contentをUPDATE
// （＝復元も1回の更新として履歴に残る）。
export async function POST(
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
  const { versionId } = body as Record<string, unknown>;
  if (typeof versionId !== "string") {
    return NextResponse.json({ error: "invalid_version_id" }, { status: 400 });
  }

  const db = await getDb();
  const [page] = await db
    .select()
    .from(pages)
    .where(and(eq(pages.id, uuid), eq(pages.userId, user.id)));
  if (!page) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const [version] = await db
    .select()
    .from(pageVersions)
    .where(and(eq(pageVersions.id, versionId), eq(pageVersions.pageId, uuid)));
  if (!version) {
    return NextResponse.json({ error: "version_not_found" }, { status: 404 });
  }

  const { archivedVersionNumber } = await replacePageContent(db, page, {
    content: version.content,
    contentType: version.contentType,
  });

  return NextResponse.json({
    id: uuid,
    contentType: version.contentType,
    archivedVersionNumber,
    restoredFromVersionNumber: version.versionNumber,
  });
}
