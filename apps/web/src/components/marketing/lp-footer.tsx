import Link from "next/link";

export function LpFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-3 px-5 py-8 md:px-8">
        <span className="text-[15px] font-extrabold tracking-tight text-foreground">
          Clip<span className="text-primary">note</span>
        </span>
        <div className="flex gap-6">
          <Link href="/terms" className="text-[13px] font-medium text-muted-foreground">
            利用規約
          </Link>
          <Link href="/privacy" className="text-[13px] font-medium text-muted-foreground">
            プライバシーポリシー
          </Link>
          <Link href="/contact" className="text-[13px] font-medium text-muted-foreground">
            お問い合わせ
          </Link>
        </div>
      </div>
    </footer>
  );
}
