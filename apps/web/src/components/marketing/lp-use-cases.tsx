const USE_CASES = [
  {
    format: "MD",
    title: "議事録・会議メモをチームに共有",
    description:
      "AIが整理してくれた議事録や週次レポートを貼り付けて保存。見出しやリストで読みやすいまま、URLひとつでチームに共有できる。",
  },
  {
    format: "HTML",
    title: "資料ページをそのまま公開",
    description:
      "AIに作ってもらった提案資料やイベント告知ページを、コードを書かずにそのまま公開。開いた人には意図した見た目で表示される。",
  },
  {
    format: "TXT",
    title: "旅行プランや学習メモを見返す",
    description:
      "AIに考えてもらった旅行プランや解説を、メモ帳感覚でそのまま保存。あとから自分のライブラリで一覧して見返せる。",
  },
  {
    format: "MIX",
    title: "複数のAIで作った成果物を、ひとつのライブラリに集約",
    description:
      "ChatGPTで下書きしてClaudeで整形、のように使うAIを使い分けても、保存先はClipnoteひとつ。あとから一覧で管理できる。",
  },
];

export function LpUseCases() {
  return (
    <section className="mx-auto max-w-[1160px] px-5 pt-16 pb-16 md:px-8 md:pt-24 md:pb-24">
      <h2 className="mb-10 text-center text-[22px] font-extrabold tracking-tight text-foreground md:text-[26px]">
        こんな時に使える
      </h2>

      <div className="mx-auto flex max-w-[820px] flex-col gap-4">
        {USE_CASES.map((item) => (
          <div
            key={item.title}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center"
          >
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-secondary text-xs font-extrabold text-primary">
              {item.format}
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-[1.7] text-secondary-foreground">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
