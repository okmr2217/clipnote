import Link from "next/link";
import { FileQuestionIcon } from "lucide-react";

// AdminLayout配下で notFound() が呼ばれた際に表示される（ヘッダー・フッターは
// AdminLayoutが既に提供しているため、ここでは中身のみを持つ）。
export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <FileQuestionIcon className="size-10 text-muted-foreground" aria-hidden />
      <h1 className="text-xl font-extrabold text-foreground md:text-2xl">見つかりませんでした</h1>
      <p className="max-w-[40ch] text-[14px] leading-relaxed text-secondary-foreground">
        お探しのクリップまたはコレクションは存在しないか、削除された可能性があります。
      </p>
      <Link
        href="/admin"
        className="mt-2 rounded-lg bg-primary px-5 py-2.5 text-[13px] font-bold text-primary-foreground"
      >
        クリップ一覧に戻る
      </Link>
    </div>
  );
}
