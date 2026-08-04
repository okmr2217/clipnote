import type { Metadata } from "next";
import { getSiteOrigin } from "@/lib/site-origin";

export const GENERIC_TAGLINE =
  "AIが生成したHTMLやMarkdownを、そのままの見た目で保存・整理し、必要な相手にだけ公開できるツールです。";

// /p/[uuid]・/c/[uuid]共通のOGP組み立て（設計書4-6節）。非公開・存在しない
// 場合はクリップ／コレクション固有の情報（タイトル・説明）を一切出さず、
// 固定文言のみにする（存在の秘匿性を保つため）。og:imageはpublic/private
// 問わず固定のブランド画像を使い回す。
export async function buildPublicMetadata(params: {
  isPublic: boolean;
  title: string;
  description?: string | null;
}): Promise<Metadata> {
  const origin = await getSiteOrigin();
  const ogImageUrl = `${origin}/og-image.png`;

  const title = params.isPublic ? params.title : "Clipnote";
  const description = params.isPublic ? (params.description ?? GENERIC_TAGLINE) : GENERIC_TAGLINE;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
  };
}
