import { LpNav } from "@/components/marketing/lp-nav";
import { LpHero } from "@/components/marketing/lp-hero";
import { LpFeatures } from "@/components/marketing/lp-features";
import { LpHowItWorks } from "@/components/marketing/lp-how-it-works";
import { LpProductShowcase } from "@/components/marketing/lp-product-showcase";
import { LpUseCases } from "@/components/marketing/lp-use-cases";
import { LpReassurance } from "@/components/marketing/lp-reassurance";
import { LpFaq } from "@/components/marketing/lp-faq";
import { LpFinalCta } from "@/components/marketing/lp-final-cta";
import { LpFooter } from "@/components/marketing/lp-footer";

// LP（要件定義書1章の訴求ポイント・Claude Designハンドオフバンドル
// 「Clipnote Landing Page」に準拠）。管理画面はshadcn/uiだが、LPはカスタム
// Tailwind実装とする方針（設計書2章）のため、shadcnのButton等は使わない。
export default function Home() {
  return (
    <main className="flex flex-col">
      <LpNav />
      <LpHero />
      <LpFeatures />
      <LpHowItWorks />
      <LpProductShowcase />
      <LpUseCases />
      <LpReassurance />
      <LpFaq />
      <LpFinalCta />
      <LpFooter />
    </main>
  );
}
