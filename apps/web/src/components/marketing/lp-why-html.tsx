import { PaletteIcon, BotIcon, GlobeIcon } from "lucide-react";

const REASONS = [
  {
    icon: PaletteIcon,
    title: "表現力のあるレイアウト",
    description:
      "見出しやリストだけでなく、レイアウト・装飾・インタラクションまで。AIが考えた見た目を、そのまま再現できます。",
  },
  {
    icon: BotIcon,
    title: "AIが得意な形式",
    description:
      "ChatGPTやClaudeが生成する成果物の多くはHTML。変換や整形をはさまず、そのまま貼り付けるだけで公開できます。",
  },
  {
    icon: GlobeIcon,
    title: "ブラウザがそのまま解釈",
    description:
      "追加のレンダリング処理は不要。ブラウザがネイティブに解釈するので、意図した見た目のまま誰でも閲覧できます。",
  },
];

export function LpWhyHtml() {
  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto max-w-[1160px] px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto mb-10 max-w-[560px] text-center">
          <h2 className="text-[22px] font-extrabold tracking-tight text-foreground md:text-[26px]">
            Markdownだけじゃない、HTMLという選択。
          </h2>
          <p className="mt-3 text-sm leading-[1.8] text-secondary-foreground">
            ClipnoteはMarkdownに加えてHTMLもそのまま保存・公開できます。
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {REASONS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col gap-3 rounded-3xl border border-border bg-background p-9 px-7"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-secondary">
                <Icon className="size-5 text-primary" />
              </div>
              <h3 className="mt-2 text-lg font-bold text-foreground">{title}</h3>
              <p className="text-sm leading-[1.7] text-secondary-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
