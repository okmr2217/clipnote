import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ContentType } from "@clipnote/pages/validation";

const shortDateFormatter = new Intl.DateTimeFormat("ja-JP", { month: "long", day: "numeric" });

const TAG_STYLE: Record<ContentType, string> = {
  html: "bg-secondary text-primary",
  markdown: "bg-muted text-secondary-foreground",
  plaintext: "bg-muted text-secondary-foreground",
};

const TAG_LABEL: Record<ContentType, string> = {
  html: "HTML",
  markdown: "MD",
  plaintext: "TXT",
};

function TagIcon({ contentType }: { contentType: ContentType }) {
  if (contentType === "html") {
    return (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
        <path d="M4 4l1.5 15L12 21l6.5-2L20 4H4z" />
      </svg>
    );
  }
  if (contentType === "markdown") {
    return (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M7 15V9l3 3 3-3v6M17 9v6M14.5 12.5L17 15l2.5-2.5" />
      </svg>
    );
  }
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M4 3h11l5 5v13H4z" />
      <path d="M8 12h8M8 16h8M8 8h4" />
    </svg>
  );
}

// Claude Designハンドオフバンドル「Clipnote Public Collection Page」の
// 形式タグ。管理画面のFormatBadge（components/clips/format-badge.tsx）とは
// 別デザイン（アイコン付き・形式ごとに配色が異なる）のため、このページ専用
// コンポーネントとして分離する。
function ContentTypeTag({ contentType }: { contentType: ContentType }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold",
        TAG_STYLE[contentType],
      )}
    >
      <TagIcon contentType={contentType} />
      {TAG_LABEL[contentType]}
    </span>
  );
}

export function PublicCollectionGrid({
  members,
  collectionId,
}: {
  members: { id: string; title: string; contentType: ContentType; updatedAt: Date }[];
  collectionId: string;
}) {
  if (members.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center text-sm font-medium text-muted-foreground">
        公開されているクリップがありません。
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      {members.map((member) => (
        <li key={member.id}>
          <Link
            href={`/p/${member.id}?from=${collectionId}`}
            className="group flex h-full flex-col gap-2.5 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_16px_32px_-16px_rgba(43,35,32,0.22)]"
          >
            <ContentTypeTag contentType={member.contentType} />
            <p className="text-[16px] leading-snug font-bold tracking-[-0.01em] text-foreground">
              {member.title}
            </p>
            <div className="mt-auto flex items-center justify-between border-t border-border pt-2.5 text-[12.5px] font-medium text-muted-foreground">
              <span>{shortDateFormatter.format(member.updatedAt)}</span>
              <span className="-translate-x-1 font-bold text-primary opacity-0 transition-[opacity,transform] duration-150 group-hover:translate-x-0 group-hover:opacity-100">
                開く →
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
