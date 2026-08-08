import { FolderIcon, GripVerticalIcon, EyeIcon } from "lucide-react";
import { FormatBadge } from "@/components/clips/format-badge";

const POINTS = [
  {
    icon: FolderIcon,
    title: "ひとつのURLにまとめる",
    description: "複数のクリップをコレクションとして束ねて、ひとつの公開ページに。",
  },
  {
    icon: GripVerticalIcon,
    title: "並び順は自由自在",
    description: "ドラッグ&ドロップで、クリップの表示順をいつでも入れ替えられます。",
  },
  {
    icon: EyeIcon,
    title: "公開範囲はコレクション単位で",
    description: "個別のクリップとは別に、コレクション全体のPrivate/Publicを管理できます。",
  },
];

const DEMO_MEMBERS: { contentType: "html" | "markdown"; title: string; date: string }[] = [
  { contentType: "html", title: "サマリー.html", date: "8月3日" },
  { contentType: "markdown", title: "詳細レポート", date: "8月3日" },
  { contentType: "html", title: "付録データ.html", date: "8月2日" },
];

export function LpCollections() {
  return (
    <section className="border-y border-border bg-secondary">
      <div className="mx-auto max-w-[1160px] px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-center md:gap-16">
          <div>
            <h2 className="text-[26px] font-extrabold tracking-tight text-foreground md:text-[30px]">
              まとめて、ひとつのURLに。
            </h2>
            <p className="mt-4 max-w-[420px] text-[15px] leading-[1.8] text-secondary-foreground">
              複数のクリップをコレクションとして束ねれば、資料集や週次レポートもひとつの公開ページにできます。
            </p>
            <ul className="mt-7 flex flex-col gap-5">
              {POINTS.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex gap-3.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-card">
                    <Icon className="size-4.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{title}</p>
                    <p className="mt-0.5 text-sm leading-[1.7] text-secondary-foreground">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2.5 border-b border-border bg-muted px-4 py-3">
              <span className="size-2.5 rounded-full bg-accent" />
              <span className="size-2.5 rounded-full bg-accent" />
              <span className="size-2.5 rounded-full bg-accent" />
              <div className="ml-1 flex-1 truncate rounded-md bg-card px-3 py-1.5 font-mono text-xs text-muted-foreground">
                clipnote.paritto.dev/c/9f21a
              </div>
            </div>

            <div className="bg-background p-6">
              <span className="mb-3 inline-block rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-primary">
                コレクション
              </span>
              <h3 className="text-[19px] leading-[1.3] font-extrabold tracking-[-0.01em] text-foreground">
                秋の新機能アップデート資料
              </h3>
              <p className="mt-2 text-[13px] leading-[1.6] text-secondary-foreground">
                チームで議論してきた新機能を中心にご紹介します。
              </p>
              <div className="mt-3 mb-5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span>3件のクリップ</span>
                <span className="size-[3px] shrink-0 rounded-full bg-muted-foreground opacity-50" />
                <span>2026年8月3日 更新</span>
              </div>

              <div className="flex flex-col gap-2.5">
                {DEMO_MEMBERS.map((member) => (
                  <div
                    key={member.title}
                    className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2.5"
                  >
                    <FormatBadge contentType={member.contentType} />
                    <span className="flex-1 truncate text-[13px] font-semibold text-foreground">
                      {member.title}
                    </span>
                    <span className="text-xs text-muted-foreground">{member.date}</span>
                    <span className="text-xs font-bold text-primary">開く →</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
