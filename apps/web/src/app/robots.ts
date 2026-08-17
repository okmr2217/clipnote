import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/site-origin";

// AIO/LLMO対策（docs/design-web.md 4-9節）。管理画面・認証系・APIルートは
// 公開情報を持たないためdisallowし、公開クリップ・コレクション・LP・静的
// ページはクロール対象として明示的に許可する。
export default async function robots(): Promise<MetadataRoute.Robots> {
  const origin = await getSiteOrigin();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/login", "/signup", "/forgot-password", "/reset-password"],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
