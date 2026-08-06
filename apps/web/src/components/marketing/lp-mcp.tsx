import Link from "next/link";
import { MessageSquareIcon } from "lucide-react";

const TOOLS = [
  { label: "一覧を見る", detail: "自分のクリップをタイトルで検索・一覧表示" },
  { label: "中身を取り出す", detail: "指定したクリップの本文を取得" },
  { label: "新しく保存する", detail: "会話の続きで、そのままクリップを作成" },
  { label: "書き換える", detail: "既存クリップを更新（旧内容は自動でバージョン保存）" },
];

export function LpMcp() {
  return (
    <section id="mcp" className="scroll-mt-20 border-y border-border bg-card">
      <div className="mx-auto max-w-[1160px] px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-center md:gap-16">
          <div>
            <span className="inline-block rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-primary">
              Claudeユーザー向け
            </span>
            <h2 className="mt-4 text-[26px] font-extrabold tracking-tight text-foreground md:text-[30px]">
              AIに直接、管理させる。
            </h2>
            <p className="mt-4 max-w-[420px] text-[15px] leading-[1.8] text-secondary-foreground">
              貼り付け作業そのものをなくすこともできます。MCP（Model Context Protocol）でつなげば、会話からそのままクリップを作成・更新可能。現在はClaude（Claude Desktop・Claude Code・claude.ai）に対応しています。設定は数分で完了。
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
            </div>
            <Link
              href="/signup?redirect=%2Fadmin%2Fmcp"
              className="mt-7 inline-block rounded-xl bg-primary px-[30px] py-[15px] text-[15px] font-bold text-primary-foreground shadow-[var(--shadow-accent)]"
            >
              無料で始めてMCP連携する
            </Link>
          </div>

          <div className="rounded-3xl border border-border bg-background p-6 shadow-[var(--shadow-card)]">
            <div className="mb-4 flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <MessageSquareIcon className="size-4" />
              Claudeとの会話
            </div>
            <div className="flex flex-col gap-3">
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-[13px] leading-[1.6] text-primary-foreground">
                さっき作った週次レポートのHTML、Clipnoteに保存して公開URLを発行して
              </div>
              <div className="mr-auto max-w-[85%] rounded-2xl rounded-tl-sm bg-secondary px-4 py-2.5 text-[13px] leading-[1.6] text-foreground">
                保存しました。公開URL: clipnote.paritto.dev/p/9f21a
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
