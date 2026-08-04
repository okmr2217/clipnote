// コンテンツ更新・バージョン復元の両方から使う共通処理（設計書11章）。
import { pages, pageVersions } from "@clipnote/db/schema";
import { and, desc, eq, notInArray, sql } from "drizzle-orm";
import type { Database } from "@clipnote/db";
import type { ContentType } from "@/lib/validation";

export const KEPT_VERSION_COUNT = 10; // 直近10件のみ保持（設計書11章）

// 流れ（設計書11章）：①現在のpages.contentをpage_versionsへ退避
// （新しいversion_numberでINSERT）→ ②pages.contentを新しい内容でUPDATE
// → ③直近10件を超える分を削除。3ステップの途中で失敗すると退避内容と
// 現在の内容が食い違うため、db.batch()で1つの原子的な単位として実行する。
// コンテンツ更新（1章）・バージョン復元（11章の「復元も1回の更新として
// 履歴に残る」）のどちらも、この「現在の内容を退避してから上書きする」
// という同じ手順になるため共通化している。
export async function replacePageContent(
  db: Database,
  currentPage: { id: string; content: string; contentType: ContentType },
  next: { content: string; contentType: ContentType },
) {
  const [{ maxVersionNumber }] = await db
    .select({ maxVersionNumber: sql<number | null>`max(${pageVersions.versionNumber})` })
    .from(pageVersions)
    .where(eq(pageVersions.pageId, currentPage.id));
  const archivedVersionNumber = (maxVersionNumber ?? 0) + 1;

  const archiveOldContent = db.insert(pageVersions).values({
    id: crypto.randomUUID(),
    pageId: currentPage.id,
    content: currentPage.content,
    contentType: currentPage.contentType,
    versionNumber: archivedVersionNumber,
  });
  const updateContent = db
    .update(pages)
    .set({ content: next.content, contentType: next.contentType, updatedAt: new Date() })
    .where(eq(pages.id, currentPage.id));
  const pruneOldVersions = db.delete(pageVersions).where(
    and(
      eq(pageVersions.pageId, currentPage.id),
      notInArray(
        pageVersions.versionNumber,
        db
          .select({ versionNumber: pageVersions.versionNumber })
          .from(pageVersions)
          .where(eq(pageVersions.pageId, currentPage.id))
          .orderBy(desc(pageVersions.versionNumber))
          .limit(KEPT_VERSION_COUNT),
      ),
    ),
  );

  await db.batch([archiveOldContent, updateContent, pruneOldVersions]);

  return { archivedVersionNumber };
}
