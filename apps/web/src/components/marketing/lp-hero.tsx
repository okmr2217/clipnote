import Link from "next/link";
import { FormatBadge } from "@/components/clips/format-badge";

const PREVIEW_ITEMS: {
  contentType: "html" | "markdown";
  title: string;
  visibility: "public" | "private";
}[] = [
  { contentType: "html", title: "週次レポート.html", visibility: "public" },
  { contentType: "markdown", title: "定例会議の議事録", visibility: "private" },
  { contentType: "html", title: "イベント告知ページ", visibility: "public" },
];

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
          AIとの会話で生成したHTML/Markdownを、貼り付けるだけで保存。Claudeとつなげば、会話からそのまま保存もできます。URLを発行してすぐに共有できます。
        </p>
        <Link
          href="/signup"
          className="mt-8 inline-block rounded-xl bg-primary px-[30px] py-[15px] text-[15px] font-bold text-primary-foreground shadow-[var(--shadow-accent)]"
        >
          無料で始める
        </Link>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[15px] font-extrabold text-foreground">クリップ一覧</span>
          <span className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
            ＋ 新規
          </span>
        </div>
        <div className="flex flex-col gap-2.5">
          {PREVIEW_ITEMS.map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-2.5 rounded-xl border border-border px-3.5 py-3"
            >
              <FormatBadge contentType={item.contentType} />
              <span className="flex-1 truncate text-[13px] font-semibold text-foreground">
                {item.title}
              </span>
              <span
                className={
                  item.visibility === "public"
                    ? "rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold whitespace-nowrap text-primary"
                    : "rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold whitespace-nowrap text-secondary-foreground"
                }
              >
                {item.visibility === "public" ? "公開" : "非公開"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
