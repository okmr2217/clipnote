import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { LpNav } from "@/components/marketing/lp-nav";
import { LpFooter } from "@/components/marketing/lp-footer";

export const metadata: Metadata = {
  title: "利用規約 | Clipnote",
};

// 公開前チェックリスト対応（design.md5章）。法務レビュー前提の初版ドラフト。
// 内容の追加・変更時は本文だけでなく「最終更新日」も更新すること。
const LAST_UPDATED = "2026-08-12";

export default async function TermsPage() {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <>
      <LpNav isLoggedIn={Boolean(session)} />
      <main className="mx-auto w-full max-w-[760px] px-5 py-16 md:px-8 md:py-24">
        <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-foreground">利用規約</h1>
        <p className="mb-10 text-sm text-muted-foreground">最終更新日：{LAST_UPDATED}</p>

        <div className="flex flex-col gap-8 text-[15px] leading-relaxed text-foreground">
          <Section title="第1条（適用）">
            <p>
              本規約は、Clipnote運営（以下「運営」といいます）が提供するコンテンツ保存・公開管理サービス「Clipnote」（以下「本サービス」といいます）の利用条件を定めるものです。利用者は、本サービスを利用することで本規約に同意したものとみなします。
            </p>
          </Section>

          <Section title="第2条（サービス内容）">
            <p>
              本サービスは、利用者がHTML・Markdown・プレーンテキスト形式のコンテンツ（以下「クリップ」といいます）を保存し、任意で公開URLを発行して第三者に共有できる機能を提供します。クリップの公開設定（非公開／公開）は利用者自身が管理します。
            </p>
          </Section>

          <Section title="第3条（アカウント登録）">
            <p>
              本サービスの利用にはアカウント登録が必要です。利用者は、登録情報を正確に保つとともに、ログイン情報を自己の責任で管理するものとします。ログイン情報の管理不十分、使用上の過誤、第三者の使用等によって生じた損害の責任は利用者が負うものとし、運営は一切の責任を負いません。
            </p>
          </Section>

          <Section title="第4条（禁止事項）">
            <p>利用者は、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>法令または公序良俗に違反する内容を含むクリップを公開する行為</li>
              <li>第三者の著作権・商標権その他の知的財産権、プライバシー、名誉その他の権利・利益を侵害する内容を公開する行為</li>
              <li>フィッシングサイト・マルウェア配布・詐欺等、第三者に不利益を与える目的でコンテンツを公開する行為</li>
              <li>本サービスのサーバー・ネットワークに過度な負荷をかける行為、または不正アクセスを試みる行為</li>
              <li>他の利用者になりすます行為、または虚偽の情報を登録する行為</li>
              <li>本サービスを商用の迷惑行為（スパム配信等）の踏み台として利用する行為</li>
              <li>その他、運営が不適切と合理的に判断する行為</li>
            </ul>
          </Section>

          <Section title="第5条（コンテンツの取り扱い）">
            <p>
              クリップの著作権その他の権利は、投稿した利用者に帰属します。運営は、保存されたHTML／Markdownコンテンツについて無害化（サニタイズ）処理を行いません。公開設定を「公開」にしたクリップ・コレクションは、URLを知る第三者が閲覧できる状態になることを理解した上で、利用者自身の責任において公開設定を行ってください。
            </p>
          </Section>

          <Section title="第6条（通報への対応・利用制限）">
            <p>
              運営は、第4条に違反するクリップ・コレクションが存在すると判断した場合、利用者への事前の通知を行うことなく、当該コンテンツを非公開化し、またはアカウントの利用を制限・停止できるものとします。本サービスの公開コンテンツに関する通報は
              <Link href="/contact" className="font-bold text-primary hover:text-accent-foreground">
                お問い合わせフォーム
              </Link>
              から受け付けています。
            </p>
          </Section>

          <Section title="第7条（免責事項）">
            <p>
              運営は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定目的への適合性等に関するものを含みます）がないことを明示的にも黙示的にも保証しません。運営は、本サービスに起因して利用者に生じたあらゆる損害について、運営の故意または重過失による場合を除き、一切の責任を負いません。
            </p>
          </Section>

          <Section title="第8条（サービス内容の変更・中断・終了）">
            <p>
              運営は、利用者への事前の通知なく、本サービスの内容を変更し、または本サービスの提供を中断・終了できるものとします。これによって利用者に生じた損害について、運営は一切の責任を負いません。
            </p>
          </Section>

          <Section title="第9条（本規約の変更）">
            <p>
              運営は、必要と判断した場合には、利用者への事前の通知なく本規約を変更できるものとします。変更後の規約は、本ページに掲載した時点から効力を生じるものとします。
            </p>
          </Section>

          <Section title="第10条（準拠法・裁判管轄）">
            <p>
              本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合には、運営の所在地を管轄する裁判所を専属的合意管轄とします。
            </p>
          </Section>

          <Section title="第11条（お問い合わせ）">
            <p>
              本規約に関するお問い合わせは
              <Link href="/contact" className="font-bold text-primary hover:text-accent-foreground">
                お問い合わせフォーム
              </Link>
              からご連絡ください。
            </p>
          </Section>
        </div>
      </main>
      <LpFooter />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-base font-bold text-foreground">{title}</h2>
      {children}
    </section>
  );
}
