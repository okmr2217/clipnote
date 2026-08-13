import Link from "next/link";
import { MessageSquareIcon } from "lucide-react";

const TOOLS = [
  { label: "一覧を見る", detail: "自分のクリップをタイトルで検索・一覧表示" },
  { label: "中身を取り出して回答に使う", detail: "指定したクリップの本文を取得し、それを踏まえて答えてくれる" },
  { label: "新しく保存する", detail: "会話の続きで、そのままクリップを作成" },
  { label: "書き換える", detail: "既存クリップを更新（旧内容は自動でバージョン保存）" },
];

const PLAN_SUPPORT = [
  {
    name: "Claude",
    plan: "Free〜Enterprise（全プラン）",
    note: "Freeはカスタムコネクタ1個までの制限あり",
  },
  {
    name: "ChatGPT",
    plan: "Plus / Pro / Business / Enterprise / Edu",
    note: "設定の「Developer mode」をONにして接続（Web版のみ）",
  },
];

export function LpMcp() {
  return (
    <section id="mcp" className="scroll-mt-20 border-y border-border bg-card">
      <div className="mx-auto max-w-[1160px] px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-center md:gap-16">
          <div>
            <span className="inline-block rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-primary">
              Claude / ChatGPTユーザー向け
            </span>
            <h2 className="mt-4 text-[26px] font-extrabold tracking-tight text-foreground md:text-[30px]">
              AIに直接、管理させる。
            </h2>
            <p className="mt-4 max-w-[420px] text-[15px] leading-[1.8] text-secondary-foreground">
              MCPは、AIとClipnoteをつなぐ「連携のしくみ」です。名前は難しそうですが、やることはアプリ同士を一度つなぐだけ。あとは会話の中で「保存して」「書き換えて」とお願いするだけで、貼り付け作業そのものが不要になります。さらに保存はゴールではありません。AIが必要なときに自分でクリップを読み出し、その内容を踏まえて答えてくれるので、以前のやり取りを覚えている相手と話すような感覚で会話を続けられます。現在はClaude（無料プランを含む全プラン）とChatGPT（Plus以上）に対応。設定は数分で完了します。
            </p>
            <ul className="mt-6 flex flex-col gap-3">
              {TOOLS.map((t) => (
                <li key={t.label} className="flex gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-primary">
                    ✓
                  </span>
                  <span className="text-sm leading-[1.6]">
                    <span className="font-bold text-foreground">{t.label}</span>
                    <span className="text-secondary-foreground">　{t.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <span className="rounded-lg border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground">
                Claude Desktop / Claude Code：APIキーで接続
              </span>
              <span className="rounded-lg border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground">
                claude.ai：OAuthでワンクリック連携
              </span>
              <span className="rounded-lg border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground">
                ChatGPT：Developer Mode（要ユーザー承認）で連携
              </span>
            </div>
            <Link
              href="/signup?redirect=%2Fadmin%2Fmcp"
              className="mt-7 inline-block rounded-xl bg-primary px-[30px] py-[15px] text-[15px] font-bold text-primary-foreground shadow-[var(--shadow-accent)]"
            >
              無料で始めてMCP連携する
            </Link>
          </div>

          <div className="flex flex-col gap-5">
            <div className="rounded-3xl border border-border bg-background p-6 shadow-[var(--shadow-card)]">
              <div className="mb-4 flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <MessageSquareIcon className="size-4" />
                AIとの会話
              </div>
              <div className="flex flex-col gap-3">
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-[13px] leading-[1.6] text-primary-foreground">
                  さっき作った週次レポートのHTML、Clipnoteに保存して公開URLを発行して
                </div>
                <div className="mr-auto max-w-[85%] rounded-2xl rounded-tl-sm bg-secondary px-4 py-2.5 text-[13px] leading-[1.6] text-foreground">
                  保存しました。公開URL: clipnote.paritto.dev/p/9f21a
                </div>
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-[13px] leading-[1.6] text-primary-foreground">
                  先週保存した旅行プラン、それを踏まえて温泉宿も追加で提案して
                </div>
                <div className="mr-auto max-w-[85%] rounded-2xl rounded-tl-sm bg-secondary px-4 py-2.5 text-[13px] leading-[1.6] text-foreground">
                  「旅行プラン案」を読み込みました。2日目の京都エリアに合わせて、近くの温泉宿を2件追加しました
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-background p-6 shadow-[var(--shadow-card)]">
              <p className="mb-4 text-xs font-bold text-muted-foreground">対応AI・プラン一覧</p>
              <ul className="flex flex-col gap-4">
                {PLAN_SUPPORT.map((service) => (
                  <li key={service.name} className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{service.name}</span>
                      <span className="text-xs text-secondary-foreground">{service.plan}</span>
                    </div>
                    <p className="text-[11px] leading-[1.6] text-muted-foreground">
                      {service.note}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
