import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// /p/[uuid]用のヘッダー（Claude Designハンドオフバンドル
// 「Clipnote Public Clip Page」に準拠）。管理画面のAdminHeaderとは別に
// 独自のトンマナで実装する（設計書2章）。/c/[uuid]は独自の見た目のため
// 下のPublicCollectionHeaderを使う。
export function PublicHeader({
  title,
  visibility,
  fromCollection,
}: {
  title: string;
  visibility: "public" | "private";
  fromCollection?: { id: string; name: string } | null;
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

      {fromCollection && (
        <div className="mx-auto max-w-[1160px] px-4 pb-2 md:px-8">
          <Link
            href={`/c/${fromCollection.id}`}
            className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-secondary-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3.5" /> 「{fromCollection.name}」に戻る
          </Link>
        </div>
      )}
    </header>
  );
}

// /c/[uuid]用のヘッダー（Claude Designハンドオフバンドル
// 「Clipnote Public Collection Page」に準拠）。コレクション自体のタイトルは
// 下のヒーローセクションで大きく見せるため、ヘッダーには所有者アバターと
// 「◯◯のコレクション」という控えめなラベルのみを置く。
export function PublicCollectionHeader({ ownerName }: { ownerName: string }) {
  const initial = ownerName.trim().charAt(0).toUpperCase() || "?";

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-[1160px] items-center justify-between gap-4 px-4 py-5 md:px-8">
        <Link
          href="/"
          className="shrink-0 text-xl font-extrabold tracking-tight text-foreground md:text-[22px]"
        >
          Clip<span className="text-primary">note</span>
        </Link>

        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-primary-foreground">
            {initial}
          </span>
          <span className="truncate text-[13px] font-semibold whitespace-nowrap text-secondary-foreground">
            {ownerName}のコレクション
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
