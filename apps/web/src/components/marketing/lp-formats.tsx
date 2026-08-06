const FORMAT_COMPARISON = [
  {
    format: "プレーンテキスト",
    detail: "改行と文字だけで、そのままメモに。",
    href: "https://clipnote.paritto.dev/p/728326ea-0169-4454-a44f-e5ed6f619922",
  },
  {
    format: "Markdown",
    detail: "見出し・リスト・表などで、少し整理された形に。",
    href: "https://clipnote.paritto.dev/p/f4c1ee60-68d5-4541-9b05-23b2868447f6",
  },
  {
    format: "HTML",
    detail: "レイアウトや装飾も含めて、AI好みの見た目に。",
    href: "https://clipnote.paritto.dev/p/40e46cf9-eb31-4c63-aa0a-9bd315a02fb6",
  },
];

export function LpFormats() {
  return (
    <section className="mx-auto max-w-[1160px] px-5 pb-14 md:px-8 md:pb-20">
      <div className="mx-auto mb-8 max-w-[560px] text-center">
        <h2 className="text-[22px] font-extrabold tracking-tight text-foreground md:text-[26px]">
          対応形式
        </h2>
        <p className="mt-3 text-sm leading-[1.8] text-secondary-foreground">
          プレーンテキスト・Markdown・HTMLの3形式に対応しています。
        </p>
      </div>

      <div className="mx-auto flex max-w-[720px] flex-col gap-3">
        {FORMAT_COMPARISON.map((row) => (
          <div
            key={row.format}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:gap-5"
          >
            <span className="inline-block w-fit shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary sm:w-[130px] sm:text-center">
              {row.format}
            </span>
            <p className="flex-1 text-sm leading-[1.7] text-secondary-foreground">{row.detail}</p>
            <a
              href={row.href}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-sm font-bold whitespace-nowrap text-primary underline decoration-primary/40 underline-offset-2"
            >
              サンプルを見る →
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
