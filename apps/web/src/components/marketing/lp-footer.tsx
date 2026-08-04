export function LpFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-3 px-5 py-8 md:px-8">
        <span className="text-[15px] font-extrabold tracking-tight text-foreground">
          Clip<span className="text-primary">note</span>
        </span>
        <div className="flex gap-6">
          <a href="#" className="text-[13px] font-medium text-muted-foreground">
            利用規約
          </a>
          <a href="#" className="text-[13px] font-medium text-muted-foreground">
            お問い合わせ
          </a>
        </div>
      </div>
    </footer>
  );
}
