const USE_CASES = [
  "AIに作ってもらった資料ページを、そのまま公開したい",
  "週次レポートや議事録を、チームにURLひとつで共有したい",
  "イベント告知ページを、コードを書かずにサクッと作りたい",
];

export function LpUseCases() {
  return (
    <section className="mx-auto max-w-[1160px] px-5 pb-16 md:px-8 md:pb-24">
      <h2 className="mb-10 text-center text-[22px] font-extrabold tracking-tight text-foreground md:text-[26px]">
        こんな時に使える
      </h2>

      <div className="grid gap-6 md:grid-cols-3">
        {USE_CASES.map((text) => (
          <div
            key={text}
            className="overflow-hidden rounded-3xl border border-border bg-card"
          >
            <div className="flex items-center gap-1.5 border-b border-border bg-secondary px-3 py-2">
              <span className="size-1.5 rounded-full bg-accent" />
              <span className="size-1.5 rounded-full bg-accent" />
              <span className="size-1.5 rounded-full bg-accent" />
              <div className="ml-1 h-3 flex-1 rounded-md bg-card" />
            </div>
            <div className="flex h-16 items-center justify-center px-4.5">
              <div className="h-2 w-3/5 rounded-full bg-muted" />
            </div>
            <p className="px-5 pb-5 text-[15px] leading-[1.6] font-semibold text-foreground">
              {text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
