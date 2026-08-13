import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { LpNav } from "@/components/marketing/lp-nav";
import { LpFooter } from "@/components/marketing/lp-footer";

export const metadata: Metadata = {
  title: "プライバシーポリシー | Clipnote",
};

// 公開前チェックリスト対応（design.md5章）。法務レビュー前提の初版ドラフト。
const LAST_UPDATED = "2026-08-12";

export default async function PrivacyPage() {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <>
      <LpNav isLoggedIn={Boolean(session)} />
      <main className="mx-auto w-full max-w-[760px] px-5 py-16 md:px-8 md:py-24">
        <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-foreground">
          プライバシーポリシー
        </h1>
        <p className="mb-10 text-sm text-muted-foreground">最終更新日：{LAST_UPDATED}</p>

        <div className="flex flex-col gap-8 text-[15px] leading-relaxed text-foreground">
          <Section title="1. 取得する情報">
            <p>Clipnote運営（以下「運営」といいます）は、本サービスの提供にあたり以下の情報を取得します。</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>アカウント情報（氏名、メールアドレス、パスワード（ハッシュ化して保存））</li>
              <li>利用者が保存したクリップ・コレクションの内容（タイトル・本文・公開設定等）</li>
              <li>MCP連携のためのAPIキー・OAuth連携情報（発行時刻、失効状態等。キー自体はハッシュ化して保存）</li>
              <li>アクセスログ（IPアドレス、日時等。不正利用防止・レート制限のために一時的に保持）</li>
              <li>認証セッション維持のためのCookie</li>
              <li>お問い合わせフォームからご提供いただいた情報（メールアドレス、お問い合わせ内容）</li>
            </ul>
          </Section>

          <Section title="2. 利用目的">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>本サービスの提供・運営・改善のため</li>
              <li>本人確認・認証のため</li>
              <li>不正利用・利用規約違反への対応のため</li>
              <li>お問い合わせへの対応のため</li>
              <li>パスワード再設定・メール確認等、アカウントに関する重要な通知のため</li>
            </ul>
          </Section>

          <Section title="3. 第三者提供">
            <p>
              運営は、法令に基づく場合を除き、利用者本人の同意なく個人情報を第三者に提供しません。ただし、公開設定を「公開」にしたクリップ・コレクションの内容は、その性質上、URLを知る第三者が閲覧可能な状態になります。
            </p>
          </Section>

          <Section title="4. 委託先（インフラ事業者）">
            <p>
              本サービスは、Cloudflare, Inc.が提供するホスティング・データベース（Cloudflare
              Workers／D1）・メール送信基盤上で稼働しています。取得した情報は、これらインフラ事業者のサーバー上に保存されます。
            </p>
          </Section>

          <Section title="5. Cookieの利用">
            <p>
              本サービスは、ログイン状態を維持するための認証用Cookieを使用します。広告配信・行動追跡を目的としたCookieは使用しません。
            </p>
          </Section>

          <Section title="6. 保存期間・削除">
            <p>
              アカウント情報・クリップ等の利用者データは、アカウントが存在する間保持します。利用者は管理画面からクリップ・コレクション・APIキー・OAuth連携をいつでも削除できます。アカウント自体の削除をご希望の場合は
              <Link href="/contact" className="font-bold text-primary hover:text-accent-foreground">
                お問い合わせフォーム
              </Link>
              からご連絡ください。
            </p>
          </Section>

          <Section title="7. 開示・訂正・削除等の請求">
            <p>
              利用者は、運営が保有する自己の個人情報について、開示・訂正・削除等を求めることができます。ご希望の場合は下記お問い合わせ窓口までご連絡ください。本人確認の上、合理的な範囲で対応します。
            </p>
          </Section>

          <Section title="8. お問い合わせ窓口">
            <p>
              個人情報の取り扱いに関するお問い合わせは
              <Link href="/contact" className="font-bold text-primary hover:text-accent-foreground">
                お問い合わせフォーム
              </Link>
              からご連絡ください。
            </p>
          </Section>

          <Section title="9. 本ポリシーの改定">
            <p>
              運営は、必要と判断した場合には、利用者への事前の通知なく本ポリシーを改定できるものとします。改定後の内容は、本ページに掲載した時点から効力を生じるものとします。
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
