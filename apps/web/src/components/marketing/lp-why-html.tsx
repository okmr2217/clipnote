import { PaletteIcon, BotIcon, GlobeIcon } from "lucide-react";

const REASONS = [
  {
    icon: PaletteIcon,
    title: "見た目そのまま",
    description: "AIが考えたレイアウトや色づかいを、そのままの見た目で保存できます。",
  },
  {
    icon: BotIcon,
    title: "変換の手間なし",
    description:
      "ChatGPTやClaudeが作るものの多くはHTML。コピーして貼り付けるだけで、そのまま使えます。",
  },
  {
    icon: GlobeIcon,
    title: "特別なアプリは不要",
    description: "ブラウザさえあれば誰でも開けます。相手に何かをインストールしてもらう必要はありません。",
  },
];

const EXAMPLES = [
  "資料・提案書ページ",
  "イベント告知ページ",
  "診断・簡易ツール",
  "ポートフォリオページ",
  "ちょっとしたゲーム",
];

export function LpWhyHtml() {
  return (
    <section className="mx-auto max-w-[1160px] px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto mb-10 max-w-[560px] text-center">
        <h2 className="text-[22px] font-extrabold tracking-tight text-foreground md:text-[26px]">
          Markdownだけじゃない、HTMLという選択。
        </h2>
        <p className="mt-3 text-sm leading-[1.8] text-secondary-foreground">
          そのうえで、AIが作ったHTMLもそのまま保存・公開できます。レイアウトから装飾まで、そのまま。
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {REASONS.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-9 px-7"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-secondary">
              <Icon className="size-5 text-primary" />
            </div>
            <h3 className="mt-2 text-lg font-bold text-foreground">{title}</h3>
            <p className="text-sm leading-[1.7] text-secondary-foreground">{description}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-10 max-w-[720px] text-center">
        <p className="text-xs font-bold text-muted-foreground">こんなものが作れます</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2.5">
          {EXAMPLES.map((example) => (
            <span
              key={example}
              className="rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground"
            >
              {example}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
