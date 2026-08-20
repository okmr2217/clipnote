import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentFrame } from "@/components/public/content-frame";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { getContentOrigin, issueContentToken } from "@/lib/content-token";
import { jsonLdScriptProps } from "@/lib/json-ld";
import { extractPlainText } from "@/lib/plain-text";
import { buildPublicMetadata } from "@/lib/public-metadata";
import { loadPublicCollection, loadPublicPage } from "@/lib/public-access";
import { getSiteOrigin } from "@/lib/site-origin";

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
  const token = await issueContentToken(uuid, viewerUserId);
  const contentOrigin = getContentOrigin();

  // AIO/LLMO対策（docs/design-web.md 4-9節）。privateクリップは所有者本人の
  // 閲覧時のみここへ到達しうるが（loadPublicPage参照）、OGP同様クリップ固有
  // 情報を出すのはpublicの場合に限定する（buildPublicMetadataと同じ方針）。
  const isPublic = page.visibility === "public";
  const origin = await getSiteOrigin();
  const pageUrl = `${origin}/p/${uuid}`;
  const plainText = isPublic ? extractPlainText(page.content, page.contentType) : null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: page.title,
    url: pageUrl,
    dateModified: page.updatedAt.toISOString(),
    datePublished: page.createdAt.toISOString(),
    isPartOf: { "@type": "WebSite", name: "Clipnote", url: origin },
  };

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
      {isPublic && <script {...jsonLdScriptProps(jsonLd)} />}

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

        {/* リンクを辿らないクローラー向けの保険として、本文の平文版も同一
            オリジンにsr-onlyで直接埋め込む（docs/design-web.md 4-9節）。
            HTMLはタグ除去済みのプレーンテキストのためJSXが自動エスケープ
            して描画し、実行コンテキストへは影響しない。 */}
        {plainText && <p className="sr-only">{plainText}</p>}

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
