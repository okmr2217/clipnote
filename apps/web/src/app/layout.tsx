import type { Metadata } from "next";
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
  description: "AI生成のHTML/Markdownを保存・公開管理するツール",
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
