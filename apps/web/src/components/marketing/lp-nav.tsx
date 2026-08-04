import Link from "next/link";

export function LpNav() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-[1160px] items-center justify-between px-5 py-5 md:px-8">
        <span className="text-xl font-extrabold tracking-tight text-foreground md:text-[22px]">
          Clip<span className="text-primary">note</span>
        </span>
        <Link
          href="/signup"
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold whitespace-nowrap text-primary-foreground shadow-[var(--shadow-accent)]"
        >
          無料で始める
        </Link>
      </div>
    </header>
  );
}
