import { Link2Icon } from "lucide-react";

export function LpHowItWorks() {
  return (
    <section className="mx-auto max-w-[1160px] px-5 pb-16 md:px-8 md:pb-24">
      <h2 className="mb-10 text-center text-[22px] font-extrabold tracking-tight text-foreground md:text-[26px]">
        使い方は3ステップ
      </h2>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <StepBadge n={1} />
          <h3 className="text-lg font-bold text-foreground">貼り付ける</h3>
          <p className="text-sm leading-[1.7] text-secondary-foreground">
            AIが作ったHTMLやMarkdownを、テキストで貼り付けるかファイルをドロップ。
          </p>
          <div className="rounded-xl border-2 border-dashed border-accent bg-card px-4 py-5 text-center">
            <p className="text-xs leading-relaxed text-secondary-foreground">
              ここに貼り付け、または
              <br />
              ファイルをドラッグ&ドロップ
            </p>
            <span className="mt-2.5 inline-block rounded-lg bg-secondary px-3.5 py-1.5 text-[11px] font-bold text-primary">
              ファイルを選択
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <StepBadge n={2} />
          <h3 className="text-lg font-bold text-foreground">公開設定を選ぶ</h3>
          <p className="text-sm leading-[1.7] text-secondary-foreground">
            PrivateかPublicか、いつでも切り替え可能。
          </p>
          <div className="flex items-center justify-center rounded-xl border border-border bg-card px-4 py-6">
            <div className="inline-flex rounded-full bg-secondary p-1">
              <span className="rounded-full bg-muted-foreground px-4 py-1.5 text-xs font-bold text-card">
                Private
              </span>
              <span className="rounded-full px-4 py-1.5 text-xs font-bold text-primary">
                Public
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <StepBadge n={3} />
          <h3 className="text-lg font-bold text-foreground">シェアする</h3>
          <p className="text-sm leading-[1.7] text-secondary-foreground">
            発行されたURLをそのまま送るだけ。
          </p>
          <div className="flex flex-col items-center gap-2.5 rounded-xl border border-border bg-card p-4">
            <div className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2">
              <span className="flex-1 truncate font-mono text-xs text-muted-foreground">
                clipnote.paritto.dev/c/9f21a
              </span>
              <Link2Icon className="size-3.5 shrink-0 text-muted-foreground" />
            </div>
            <span className="rounded-lg bg-foreground px-3 py-1.5 text-[11px] font-bold text-background">
              URLをコピーしました
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepBadge({ n }: { n: number }) {
  return (
    <div className="flex size-9 items-center justify-center rounded-full bg-primary text-[15px] font-extrabold text-primary-foreground">
      {n}
    </div>
  );
}
