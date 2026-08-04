import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentFrame } from "@/components/public/content-frame";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { getContentOrigin, issueContentToken } from "@/lib/content-token";
import { buildPublicMetadata } from "@/lib/public-metadata";
import { loadPublicPage } from "@/lib/public-access";

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
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  const result = await loadPublicPage(uuid);
  if (!result) {
    notFound();
  }

  const { page, viewerUserId } = result;
  const token = await issueContentToken(uuid, viewerUserId);
  const contentOrigin = getContentOrigin();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <PublicHeader title={page.title} visibility={page.visibility} />

      <main className="flex-1">
        {page.contentType === "html" ? (
          // HTML本文はヘッダー直下からエッジtoエッジで表示する
          // （ハンドオフバンドルのHTMLバリアント）。
          <ContentFrame
            uuid={uuid}
            initialToken={token}
            contentOrigin={contentOrigin}
            title={page.title}
            className="min-h-[70vh]"
          />
        ) : (
          // Markdown本文は文書として読みやすい幅の中央カラムに収める
          // （ハンドオフバンドルのMarkdownバリアント、ボーダーなしでカード背景に
          // 直接馴染ませる）。
          <div className="mx-auto max-w-[680px] px-4 py-12 md:px-8 md:py-16">
            <ContentFrame
              uuid={uuid}
              initialToken={token}
              contentOrigin={contentOrigin}
              title={page.title}
              className="min-h-[60vh]"
            />
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
