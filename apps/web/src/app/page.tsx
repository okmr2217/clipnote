import { headers } from "next/headers";
import type { Metadata } from "next";
import { getAuth } from "@/lib/auth";
import { jsonLdScriptProps } from "@/lib/json-ld";
import { getSiteOrigin } from "@/lib/site-origin";
import { LpNav } from "@/components/marketing/lp-nav";
import { LpHero } from "@/components/marketing/lp-hero";
import { LpCapabilities } from "@/components/marketing/lp-capabilities";
import { LpStages } from "@/components/marketing/lp-stages";
import { LpFormats } from "@/components/marketing/lp-formats";
import { LpMcp } from "@/components/marketing/lp-mcp";
import { LpWhyHtml } from "@/components/marketing/lp-why-html";
import { LpShare } from "@/components/marketing/lp-share";
import { LpCollections } from "@/components/marketing/lp-collections";
import { LpUseCases } from "@/components/marketing/lp-use-cases";
import { LpFaq } from "@/components/marketing/lp-faq";
import { LpFinalCta } from "@/components/marketing/lp-final-cta";
import { LpFooter } from "@/components/marketing/lp-footer";

// セッション状態（ログイン有無）でナビ表示が変わるため、ビルド時の静的
// プリレンダーは行わずリクエスト毎に動的レンダリングする（D1参照を
// ビルド中に発生させない。並列ビルドワーカーが同一ローカルD1へ同時
// アクセスしSQLITE_BUSYでworkerdがクラッシュする不具合の回避）。
export const dynamic = "force-dynamic";

// og:image等の絶対URLはWorkers環境ではリクエスト到達前にmetadataBaseが
// 評価される恐れがあるため（lib/site-origin.ts参照）、generateMetadataで
// リクエスト時に組み立てる。og:imageは/p・/c同様、固定のブランド画像を使う。
// AIO/LLMO対策（docs/design-web.md 4-9節）としてLP固有のtitle・descriptionを
// ルートレイアウトの汎用文言より具体化し、AI検索・LLMの要約・推薦時に
// Clipnoteが何をするツールかを正しく伝えられるようにする。
export async function generateMetadata(): Promise<Metadata> {
  const origin = await getSiteOrigin();
  const title = "Clipnote | AIとの会話から生まれたHTML・Markdownを保存・公開";
  const description =
    "ClaudeなどのAIとの会話で生成したHTML・Markdown・プレーンテキストを、そのままの見た目で保存・整理し、ユニークな公開URLで共有できるツール。MCP連携でAIから直接クリップの作成・更新もできます。";
  const ogImageUrl = `${origin}/og-image.png`;

  return {
    title,
    description,
    alternates: { canonical: origin },
    openGraph: {
      title,
      description,
      url: origin,
      siteName: "Clipnote",
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

// LP（要件定義書1章の訴求ポイント・Claude Designハンドオフバンドル
// 「Clipnote Landing Page」に準拠）。管理画面はshadcn/uiだが、LPはカスタム
// Tailwind実装とする方針（設計書2章）のため、shadcnのButton等は使わない。
export default async function Home() {
  // ログイン済みユーザーがLPの入り口をそのまま管理画面への導線として使える
  // よう、ヘッダーCTAのみ出し分ける（LP自体はログイン有無に関わらず表示する
  // ―― 見返したいケースを潰さないため、`/`から`/admin`への強制リダイレクトはしない）。
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  const origin = await getSiteOrigin();

  // AIO/LLMO対策（docs/design-web.md 4-9節）。Clipnote自体がどんなツールかを
  // 構造化データとしても示し、LLMがツールを説明・推薦する際の材料にする。
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Clipnote",
    url: origin,
    description:
      "AIとの会話で生成したHTML・Markdown・プレーンテキストを保存・整理し、公開URLで共有できるツール。MCP連携でAIから直接クリップを作成・更新できる。",
    applicationCategory: "Utility",
    operatingSystem: "Web",
    publisher: { "@type": "Organization", name: "Clipnote", url: origin },
  };

  return (
    <main className="flex flex-col">
      <script {...jsonLdScriptProps(jsonLd)} />
      <LpNav isLoggedIn={Boolean(session)} />
      <LpHero />
      <LpCapabilities />
      <LpStages />
      <LpFormats />
      <LpMcp />
      <LpWhyHtml />
      <LpShare />
      <LpCollections />
      <LpUseCases />
      <LpFaq />
      <LpFinalCta />
      <LpFooter />
    </main>
  );
}
