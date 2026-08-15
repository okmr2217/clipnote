import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // IMAGES bindingを使わない運用のため、next/imageの最適化は無効化する（要件定義書3章）
  images: { unoptimized: true },
  // @clipnote/dbはビルド済みJSではなくTSソースを直接exportするワークスペース
  // パッケージのため、Next.jsのデフォルトのnode_modules除外対象から外す
  transpilePackages: ["@clipnote/db"],
};

export default nextConfig;

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
// apps/content・apps/mcp・packages/dbのwrangler devと同じディレクトリに
// ローカルD1を永続化する。指定しないとこのディレクトリ配下の.wrangler/state
// に独立したDBができてしまい、webで作成したclipがcontent側から見えず
// （逆も同様）常に404になる。
initOpenNextCloudflareForDev({ persist: { path: "../../.wrangler/state/v3" } });
