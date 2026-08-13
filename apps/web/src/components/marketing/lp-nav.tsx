import Link from "next/link";
import { ClipnoteMark } from "@/components/brand/clipnote-mark";

export function LpNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-[1160px] items-center justify-between px-5 py-5 md:px-8">
        <span className="flex items-center gap-1 text-xl font-extrabold tracking-[-0.01em] text-foreground md:text-[22px]">
          <ClipnoteMark className="size-9" />
          <span>
            Clip<span className="text-primary">note</span>
          </span>
        </span>
        <Link
          href={isLoggedIn ? "/admin" : "/signup"}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold whitespace-nowrap text-primary-foreground shadow-[var(--shadow-accent)]"
        >
          {isLoggedIn ? "管理画面へ" : "無料で始める"}
        </Link>
      </div>
    </header>
  );
}
