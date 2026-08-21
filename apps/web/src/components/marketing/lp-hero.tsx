import Link from "next/link";
import { ArrowDownIcon, MessageSquareIcon, ClipboardIcon, LibraryIcon } from "lucide-react";

const LIBRARY_ITEMS = [
  { title: "旅行プラン案", date: "8月5日" },
  { title: "週次レポート", date: "8月3日" },
  { title: "読書メモ", date: "8月1日" },
];

export function LpHero() {
  return (
    <section className="mx-auto grid max-w-[1160px] gap-12 px-5 py-16 md:grid-cols-2 md:items-center md:gap-16 md:px-8 md:py-24">
      <div>
        <h1 className="text-[32px] leading-[1.25] font-extrabold tracking-tight text-foreground md:text-[48px]">
          そのチャット、
          <br />
          閉じたら消える。
        </h1>
        <p className="mt-3 text-[15px] font-bold text-primary md:text-base">
          AIとのやり取りを、資産として残す場所。
        </p>
        <p className="mt-6 max-w-[440px] text-[17px] leading-[1.8] text-secondary-foreground">
          AIに「保存して」と言うだけで、その場で残せる。貼り付けるだけでも、もちろんOK。ChatGPTやClaudeとのやり取りを、消える前に資産として残せます。
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/signup"
            className="inline-block rounded-xl bg-primary px-[30px] py-[15px] text-[15px] font-bold text-primary-foreground shadow-[var(--shadow-accent)]"
          >
            無料で始める
          </Link>
          <a href="#mcp" className="text-sm font-bold text-primary underline decoration-primary/40 underline-offset-2">
            AIに直接保存させる →
          </a>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-full rounded-2xl border border-border bg-background p-4">
            <div className="mb-2.5 flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <MessageSquareIcon className="size-4" />
              AIとの会話
            </div>
            <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2 text-[13px] leading-[1.6] text-primary-foreground">
              このやり取り、あとで見返せるように残しておきたい
            </div>
          </div>

          <ArrowDownIcon className="size-4 shrink-0 text-muted-foreground" />

          <div className="flex w-full items-center gap-2.5 rounded-2xl border border-border bg-background p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary">
              <ClipboardIcon className="size-4.5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold text-foreground">旅行プラン案</p>
              <p className="text-[11px] text-muted-foreground">貼り付けてClipnoteに保存</p>
            </div>
          </div>

          <ArrowDownIcon className="size-4 shrink-0 text-muted-foreground" />

          <div className="w-full rounded-2xl border border-border bg-background p-4">
            <div className="mb-2.5 flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <LibraryIcon className="size-4" />
              マイライブラリ
            </div>
            <div className="flex flex-col gap-1.5">
              {LIBRARY_ITEMS.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between gap-2 rounded-xl bg-secondary px-3.5 py-2"
                >
                  <span className="truncate text-xs font-semibold text-foreground">
                    {item.title}
                  </span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{item.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
