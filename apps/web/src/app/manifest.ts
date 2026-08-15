import type { MetadataRoute } from "next";

// PWAマニフェスト。アイコンは仮のもの（scripts/generate-pwa-icons.mjsで生成）。
// 正式デザインができ次第 public/icons 配下の画像を差し替える。
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Clipnote",
    short_name: "Clipnote",
    description: "AIとのやり取りをメモ帳のように保存・共有できるツール",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf6f0",
    theme_color: "#c1503a",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/maskable-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
