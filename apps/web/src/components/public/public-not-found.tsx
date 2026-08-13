import Link from "next/link";
import { FileQuestionIcon } from "lucide-react";
import { PublicFooter } from "@/components/public/public-footer";

// /p/[uuid]・/c/[uuid]共通のnot-found UI。「存在しない」場合と「存在するが
// 非公開で権限がない」場合を文言上も区別しない（apps/web/src/lib/public-access.ts
// のコメント・設計書4-5節と同じ理由：非公開クリップ／コレクションの存在自体を
// 秘匿する）。ヘッダーはロゴのみのシンプル版とし、PublicHeader/PublicCollectionHeader
// が要求するtitle・ownerName等（存在しないリソースには無い情報）には依存しない。
export function PublicNotFound({ heading, description }: { heading: string; description: string }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-[1160px] items-center px-4 py-5 md:px-8">
          <Link
            href="/"
            className="shrink-0 text-xl font-extrabold tracking-tight text-foreground md:text-[22px]"
          >
            Clip<span className="text-primary">note</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
        <FileQuestionIcon className="size-10 text-muted-foreground" aria-hidden />
        <h1 className="text-xl font-extrabold text-foreground md:text-2xl">{heading}</h1>
        <p className="max-w-[40ch] text-[14px] leading-relaxed text-secondary-foreground">{description}</p>
        <Link
          href="/"
          className="mt-2 rounded-lg bg-primary px-5 py-2.5 text-[13px] font-bold text-primary-foreground"
        >
          Clipnoteのトップへ戻る
        </Link>
      </main>

      <PublicFooter showDescription={false} />
    </div>
  );
}
