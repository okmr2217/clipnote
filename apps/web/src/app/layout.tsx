import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clipnote",
  description: "AIとのやり取りをメモ帳のように保存・共有できるツール",
  // iOSはWeb App Manifestの`display: "standalone"`だけでは
  // ホーム画面追加後のスタンドアロン起動に対応しないため、apple-mobile-web-app系の
  // metaタグを別途出す必要がある（Android/ChromeはWeb App Manifestのみで足りる）。
  appleWebApp: {
    capable: true,
    title: "Clipnote",
    statusBarStyle: "default",
  },
  other: {
    // Next.jsは標準化された`mobile-web-app-capable`のみを出力するが、
    // 古いiOS Safariはそれを認識せず`apple-mobile-web-app-capable`のみを見るため併記する。
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#c1503a",
  // ノッチ・ホームインジケーター等の安全領域までコンテンツを描画できるようにする
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${plusJakartaSans.variable} ${jetBrainsMono.variable} h-full antialiased`}
      // Dark Reader等の拡張機能がハイドレーション前にdata-darkreader-*属性を
      // <html>へ注入し、無害なハイドレーション不一致警告を出すことがあるため抑制する。
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
