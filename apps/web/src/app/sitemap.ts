import type { MetadataRoute } from "next";
import { collections, pages } from "@clipnote/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { getSiteOrigin } from "@/lib/site-origin";

// D1参照をビルド時に発生させないため動的レンダリングにする（app/page.tsxと
// 同じ理由。docs/design-web.md 4-9節）。
export const dynamic = "force-dynamic";

// AIO/LLMO対策として、公開（visibility: "public"）なクリップ・コレクション
// のURLをsitemapに含める。これにより、どこからもリンクされていない公開
// クリップもクローラーが発見できるようになる（＝非公開とは異なり、公開と
// 明示したコンテンツはクロール対象になるという設計判断。docs/design-web.md
// 4-9節）。private・ゴミ箱内のクリップは元々問い合わせ対象から除外する。
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = await getSiteOrigin();
  const db = await getDb();

  const publicPages = await db
    .select({ id: pages.id, updatedAt: pages.updatedAt })
    .from(pages)
    .where(and(eq(pages.visibility, "public"), isNull(pages.deletedAt)));

  const publicCollections = await db
    .select({ id: collections.id, updatedAt: collections.updatedAt })
    .from(collections)
    .where(eq(collections.visibility, "public"));

  const staticEntries: MetadataRoute.Sitemap = [
    { url: origin, changeFrequency: "weekly", priority: 1 },
    { url: `${origin}/contact`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${origin}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${origin}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const pageEntries: MetadataRoute.Sitemap = publicPages.map((page) => ({
    url: `${origin}/p/${page.id}`,
    lastModified: page.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const collectionEntries: MetadataRoute.Sitemap = publicCollections.map((collection) => ({
    url: `${origin}/c/${collection.id}`,
    lastModified: collection.updatedAt,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticEntries, ...pageEntries, ...collectionEntries];
}
