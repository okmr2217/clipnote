import Link from "next/link";
import { ArrowDownIcon, MessageSquareIcon, ClipboardIcon, GlobeIcon } from "lucide-react";

export function LpHero() {
  return (
    <section className="mx-auto grid max-w-[1160px] gap-12 px-5 py-16 md:grid-cols-2 md:items-center md:gap-16 md:px-8 md:py-24">
      <div>
        <h1 className="text-[32px] leading-[1.25] font-extrabold tracking-tight text-foreground md:text-[48px]">
          AIが作った&quot;それ&quot;を、
          <br />
          ちゃんと残せる場所に。
        </h1>
        <p className="mt-6 max-w-[440px] text-[17px] leading-[1.8] text-secondary-foreground">
          AIとの会話で生成したHTML/Markdownを、貼り付けるだけで保存。MCPでClaudeと直接つなげば、会話からそのままクリップの作成・更新もできます。公開URLを発行して、すぐに共有できます。
        </p>
        <Link
          href="/signup"
          className="mt-8 inline-block rounded-xl bg-primary px-[30px] py-[15px] text-[15px] font-bold text-primary-foreground shadow-[var(--shadow-accent)]"
        >
          無料で始める
        </Link>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-full rounded-2xl border border-border bg-background p-4">
            <div className="mb-2.5 flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <MessageSquareIcon className="size-4" />
              Claudeとの会話
            </div>
            <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2 text-[13px] leading-[1.6] text-primary-foreground">
              このHTML、Clipnoteに保存して
            </div>
          </div>

          <ArrowDownIcon className="size-4 shrink-0 text-muted-foreground" />

          <div className="flex w-full items-center gap-2.5 rounded-2xl border border-border bg-background p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary">
              <ClipboardIcon className="size-4.5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold text-foreground">週次レポート.html</p>
              <p className="text-[11px] text-muted-foreground">Clipnoteに保存</p>
            </div>
          </div>

          <ArrowDownIcon className="size-4 shrink-0 text-muted-foreground" />

          <div className="w-full rounded-2xl border border-border bg-background p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <GlobeIcon className="size-4" />
              公開ページ
            </div>
            <div className="flex items-center justify-between gap-2 rounded-xl bg-secondary px-3.5 py-2.5">
              <span className="truncate font-mono text-xs text-primary">
                clipnote.paritto.dev/p/9f21a
              </span>
              <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                公開
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
