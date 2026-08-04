import Link from "next/link";
import { cn } from "@/lib/utils";

// /p/[uuid]・/c/[uuid]共通のヘッダー（Claude Designハンドオフバンドル
// 「Clipnote Public Clip Page」に準拠）。管理画面のAdminHeaderとは別に
// 独自のトンマナで実装する（設計書2章）。
export function PublicHeader({
  title,
  visibility,
}: {
  title: string;
  visibility: "public" | "private";
}) {
  const isPublic = visibility === "public";

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-[1160px] items-center justify-between gap-4 px-4 py-5 md:px-8">
        <Link
          href="/"
          className="shrink-0 text-xl font-extrabold tracking-tight text-foreground md:text-[22px]"
        >
          Clip<span className="text-primary">note</span>
        </Link>

        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate text-[15px] font-bold text-foreground">{title}</span>
          <span
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-[11px] font-bold whitespace-nowrap",
              isPublic ? "bg-secondary text-primary" : "bg-muted text-secondary-foreground",
            )}
          >
            {isPublic ? "公開" : "非公開"}
          </span>
        </div>

        <Link
          href="/"
          className="hidden shrink-0 rounded-full bg-muted px-4 py-2 text-[13px] font-bold whitespace-nowrap text-secondary-foreground hover:text-foreground sm:inline-flex"
        >
          Clipnoteとは ↗
        </Link>
      </div>
    </header>
  );
}
