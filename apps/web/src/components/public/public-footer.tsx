import Link from "next/link";

// Claude Designハンドオフバンドル「Clipnote Public Clip Page」
// 「Clipnote Public Collection Page」のフッターに準拠。公開URLは第三者に
// 共有される二次的なLPとして機能するため（設計書2章）、Clipnote自体への
// 導線を含める。コレクションページのハンドオフバンドルでは説明文が省かれた
// コンパクト版になっているため、showDescriptionで切り替える。
export function PublicFooter({ showDescription = true }: { showDescription?: boolean } = {}) {
  return (
    <footer className="border-t border-border bg-card px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-[1160px] flex-col items-center gap-2.5 text-center">
        <div className="text-[17px] font-extrabold tracking-tight text-foreground">
          Clip<span className="text-primary">note</span>
        </div>
        {showDescription && (
          <p className="max-w-[380px] text-[13px] leading-relaxed font-medium text-secondary-foreground">
            AIが生成したHTMLやMarkdownを、そのままの見た目で保存・整理し、必要な相手にだけ公開できるツールです。
          </p>
        )}
        <Link
          href="/"
          className="mt-1 rounded-lg bg-primary px-5 py-2.5 text-[13px] font-bold text-primary-foreground"
        >
          Clipnoteを無料で試す
        </Link>
        <Link href="/" className="text-[11px] font-medium text-muted-foreground">
          Clipnoteで作られています
        </Link>
      </div>
    </footer>
  );
}
