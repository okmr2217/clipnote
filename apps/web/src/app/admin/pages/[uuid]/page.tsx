import { collections, pages, pageVersions } from "@clipnote/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { KEPT_VERSION_COUNT } from "@clipnote/pages/page-versions";
import { VersionHistory } from "@/components/clips/version-history";
import type { ClipDetail, PageVersionRow } from "@/components/clips/types";

export default async function AdminPageDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ uuid: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { uuid } = await params;
  const { from } = await searchParams;

  // AdminLayoutが未認証を弾いているため、ここではセッションは存在する前提。
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session!.user.id;

  const db = await getDb();
  const [page] = await db
    .select()
    .from(pages)
    .where(and(eq(pages.id, uuid), eq(pages.userId, userId)));

  if (!page) {
    notFound();
  }

  const versionRows = await db
    .select()
    .from(pageVersions)
    .where(eq(pageVersions.pageId, uuid))
    .orderBy(desc(pageVersions.versionNumber))
    .limit(KEPT_VERSION_COUNT);

  const clip: ClipDetail = {
    id: page.id,
    title: page.title,
    content: page.content,
    contentType: page.contentType,
    visibility: page.visibility,
    updatedAt: page.updatedAt,
    currentVersionNumber: (versionRows[0]?.versionNumber ?? 0) + 1,
  };

  const versions: PageVersionRow[] = versionRows.map((row) => ({
    id: row.id,
    versionNumber: row.versionNumber,
    contentType: row.contentType,
    content: row.content,
    createdAt: row.createdAt,
  }));

  // クリップは複数コレクションに属しうる（多対1に限定されない）ため、遷移元
  // コレクションはクエリパラメータで受け取り、所属コレクション一覧からは推測しない。
  let fromCollection: { id: string; name: string } | null = null;
  if (from) {
    const [collection] = await db
      .select({ id: collections.id, name: collections.name })
      .from(collections)
      .where(and(eq(collections.id, from), eq(collections.userId, userId)));
    fromCollection = collection ?? null;
  }

  return (
    <main className="px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-4xl">
        <VersionHistory clip={clip} versions={versions} fromCollection={fromCollection} />
      </div>
    </main>
  );
}
