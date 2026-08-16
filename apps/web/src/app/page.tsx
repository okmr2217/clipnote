import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
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

// LP（要件定義書1章の訴求ポイント・Claude Designハンドオフバンドル
// 「Clipnote Landing Page」に準拠）。管理画面はshadcn/uiだが、LPはカスタム
// Tailwind実装とする方針（設計書2章）のため、shadcnのButton等は使わない。
export default async function Home() {
  // ログイン済みユーザーがLPの入り口をそのまま管理画面への導線として使える
  // よう、ヘッダーCTAのみ出し分ける（LP自体はログイン有無に関わらず表示する
  // ―― 見返したいケースを潰さないため、`/`から`/admin`への強制リダイレクトはしない）。
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <main className="flex flex-col">
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
