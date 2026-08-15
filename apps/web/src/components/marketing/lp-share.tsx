import { Link2Icon, EyeIcon, GlobeIcon } from "lucide-react";

const POINTS = [
  {
    icon: Link2Icon,
    title: "URLひとつで共有",
    description: "PrivateかPublicかを選べば、共有用URLが自動発行されます。",
  },
  {
    icon: GlobeIcon,
    title: "コードを書かずにそのまま開ける",
    description: "受け取った相手はコードを見ることなく、ブラウザでそのまま開けます。",
  },
  {
    icon: EyeIcon,
    title: "公開範囲はあとから変更できる",
    description: "Private/Publicはいつでも切り替え可能。公開したくなったら、そのとき選べます。",
  },
];

export function LpShare() {
  return (
    <section className="mx-auto max-w-[1160px] px-5 py-16 md:px-8 md:py-24">
      <div className="grid gap-12 md:grid-cols-2 md:items-center md:gap-16">
        <div>
          <h2 className="text-[26px] font-extrabold tracking-tight text-foreground md:text-[30px]">
            書いたら、そのまま見せられる。
          </h2>
          <p className="mt-4 max-w-[420px] text-[15px] leading-[1.8] text-secondary-foreground">
            Markdownで書いた記録も、AIに作らせたHTMLも、そのままURLで共有できます。
          </p>
          <ul className="mt-7 flex flex-col gap-5">
            {POINTS.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex gap-3.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Icon className="size-4.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{title}</p>
                  <p className="mt-0.5 text-sm leading-[1.7] text-secondary-foreground">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
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
    </section>
  );
}
