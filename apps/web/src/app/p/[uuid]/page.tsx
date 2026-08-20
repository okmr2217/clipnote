import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentFrame } from "@/components/public/content-frame";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { getContentOrigin, issueContentToken } from "@/lib/content-token";
import { buildPublicMetadata } from "@/lib/public-metadata";
import { loadPublicCollection, loadPublicPage, recordPageView } from "@/lib/public-access";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ uuid: string }>;
}): Promise<Metadata> {
  const { uuid } = await params;
  const result = await loadPublicPage(uuid);

  return buildPublicMetadata({
    isPublic: result?.page.visibility === "public",
    title: result?.page.title ?? "Clipnote",
  });
}

export default async function PublicClipPage({
  params,
  searchParams,
}: {
  params: Promise<{ uuid: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { uuid } = await params;
  const { from } = await searchParams;
  const result = await loadPublicPage(uuid);
  if (!result) {
    notFound();
  }

  const { page, viewerUserId } = result;
  await recordPageView(page, viewerUserId);
  const token = await issueContentToken(uuid, viewerUserId);
  const contentOrigin = getContentOrigin();

  // クリップは複数コレクションに属しうる（多対1に限定されない）ため、遷移元
  // コレクションはクエリパラメータで受け取り、所属コレクション一覧からは推測
  // しない。loadPublicCollectionの可視性チェックに乗せ、非公開コレクション
  // の存在を漏らさないようにした上で、このクリップが実際にメンバーである
  // 場合のみ「戻る」リンクを出す。
  let fromCollection: { id: string; name: string } | null = null;
  if (from) {
    const collectionResult = await loadPublicCollection(from);
    if (collectionResult && collectionResult.members.some((member) => member.id === uuid)) {
      fromCollection = { id: collectionResult.collection.id, name: collectionResult.collection.name };
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <PublicHeader title={page.title} visibility={page.visibility} fromCollection={fromCollection} />

      <main className="flex-1">
        {/* HTML・Markdownどちらもヘッダー直下からエッジtoエッジで表示する。
            読みやすい幅への制限・余白・タイポグラフィは本文（content側、
            apps/content）が持つ構造に統一しており、親ページ側では幅を
            持たせない（Markdownバリアントもハンドオフバンドルの見た目を
            content側のCSSとして再現している）。 */}
        {/* AIエージェント等がJSを実行せずbody内のリンクをたどるだけで本文
            （content側が生成するHTML文書）を発見できるようにする。視覚的には
            sr-onlyで隠し、人間の閲覧導線には影響させない。content側のレスポンス
            はcanonical・noindexを返すため、検索エンジンの正規ページはこの
            /p/{uuid}のままになる（apps/content/src/index.ts参照）。 */}
        <a href={`${contentOrigin}/${uuid}?t=${encodeURIComponent(token)}`} className="sr-only">
          {page.title}の本文を直接見る
        </a>

        <ContentFrame
          uuid={uuid}
          initialToken={token}
          contentOrigin={contentOrigin}
          title={page.title}
          className="min-h-[70vh]"
        />
      </main>

      <PublicFooter reportPath={`/p/${uuid}`} />
    </div>
  );
}
