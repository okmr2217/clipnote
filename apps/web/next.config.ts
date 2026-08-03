import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // IMAGES bindingを使わない運用のため、next/imageの最適化は無効化する（要件定義書3章）
  images: { unoptimized: true },
};

export default nextConfig;

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
