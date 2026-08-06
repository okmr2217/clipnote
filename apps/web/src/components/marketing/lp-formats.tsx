const FORMATS = [
  {
    format: "プレーンテキスト",
    description: "改行と文字だけ。飾らずに、そのままメモとして残せる。",
    suited: ["会話ログの保存", "思いつきのメモ", "下書き・アイデア出し"],
    href: "https://clipnote.paritto.dev/p/728326ea-0169-4454-a44f-e5ed6f619922",
  },
  {
    format: "Markdown",
    description: "見出し・リスト・表・引用などで、情報を構造化して残せる。",
    suited: ["議事録・まとめ", "比較表やチェックリスト", "手順書・学習ノート"],
    href: "https://clipnote.paritto.dev/p/f4c1ee60-68d5-4541-9b05-23b2868447f6",
  },
  {
    format: "HTML",
    description:
      "レイアウトや装飾、インタラクションまで。AIが考えた見た目をそのまま再現できる。",
    suited: ["資料・レポートページ", "イベント告知ページ", "凝ったデザインの成果物"],
    href: "https://clipnote.paritto.dev/p/40e46cf9-eb31-4c63-aa0a-9bd315a02fb6",
  },
] as const;

function PlainTextPreview() {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex flex-col gap-1.5 font-mono text-[11px] leading-[1.7] text-foreground">
        <p>会議メモ</p>
        <p className="text-secondary-foreground">・A社と14時に打ち合わせ</p>
        <p className="text-secondary-foreground">・資料は事前送付済み</p>
        <p className="text-secondary-foreground">・次回は来月頭</p>
      </div>
    </div>
  );
}

function MarkdownPreview() {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-sm font-extrabold text-foreground">進捗まとめ</p>
      <ul className="mt-2 flex flex-col gap-1 text-[11px] text-foreground">
        <li className="flex items-center gap-1.5">
          <span className="size-1 shrink-0 rounded-full bg-primary" />
          設計レビュー：完了
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-1 shrink-0 rounded-full bg-primary" />
          実装：進行中
        </li>
      </ul>
      <div className="mt-2.5 overflow-hidden rounded-md border border-border text-[10px]">
        <div className="grid grid-cols-2 divide-x divide-border border-b border-border bg-secondary font-bold text-secondary-foreground">
          <span className="px-2 py-1">項目</span>
          <span className="px-2 py-1">状態</span>
        </div>
        <div className="grid grid-cols-2 divide-x divide-border text-foreground">
          <span className="px-2 py-1">公開</span>
          <span className="px-2 py-1">未着手</span>
        </div>
      </div>
    </div>
  );
}

function HtmlPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="bg-gradient-to-br from-primary to-accent-foreground p-4">
        <p className="text-xs font-extrabold text-primary-foreground">秋の新商品案内</p>
        <p className="mt-1 text-[10px] text-primary-foreground/85">
          レイアウトも装飾も、そのまま。
        </p>
        <span className="mt-2.5 inline-block rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-primary">
          詳しく見る
        </span>
      </div>
    </div>
  );
}

const PREVIEWS = {
  プレーンテキスト: PlainTextPreview,
  Markdown: MarkdownPreview,
  HTML: HtmlPreview,
} as const;

export function LpFormats() {
  return (
    <section className="mx-auto max-w-[1160px] px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto mb-10 max-w-[560px] text-center">
        <h2 className="text-[22px] font-extrabold tracking-tight text-foreground md:text-[26px]">
          対応形式
        </h2>
        <p className="mt-3 text-sm leading-[1.8] text-secondary-foreground">
          プレーンテキスト・Markdown・HTMLの3形式に対応。中身にあわせて選べます。
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {FORMATS.map((item) => {
          const Preview = PREVIEWS[item.format];
          return (
            <div
              key={item.format}
              className="flex flex-col rounded-3xl border border-border bg-card p-7"
            >
              <span className="inline-block w-fit rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary">
                {item.format}
              </span>

              <div className="mt-4">
                <Preview />
              </div>

              <p className="mt-4 text-sm leading-[1.7] text-secondary-foreground">
                {item.description}
              </p>

              <div className="mt-5 border-t border-border pt-5">
                <p className="text-xs font-bold text-muted-foreground">向いている内容</p>
                <ul className="mt-2.5 flex flex-col gap-1.5">
                  {item.suited.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 text-sm font-bold text-primary underline decoration-primary/40 underline-offset-2"
              >
                サンプルを見る →
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
