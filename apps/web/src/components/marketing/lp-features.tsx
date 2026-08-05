import { ClipboardPasteIcon, LockIcon, HistoryIcon } from "lucide-react";

const FEATURES = [
  {
    icon: ClipboardPasteIcon,
    title: "貼り付けるだけで保存。",
    description:
      "AIとの会話で生成したHTMLやMarkdownを、貼り付けるだけで保存。エディタや変換作業は不要です。",
  },
  {
    icon: LockIcon,
    title: "公開しなくても大丈夫。",
    description:
      "誰にも見せない自分専用のクリップとして保存できます。公開は、必要になったときに選べばOKです。",
  },
  {
    icon: HistoryIcon,
    title: "更新しても、消えない。",
    description:
      "内容を上書きしても過去のバージョンは自動で保存され、いつでも復元・ダウンロードできます。",
  },
];

export function LpFeatures() {
  return (
    <section className="mx-auto max-w-[1160px] px-5 pb-16 md:px-8 md:pb-24">
      <div className="mx-auto mb-10 max-w-[560px] text-center">
        <h2 className="text-[22px] font-extrabold tracking-tight text-foreground md:text-[26px]">
          保存するだけでいい。
        </h2>
        <p className="mt-3 text-sm leading-[1.8] text-secondary-foreground">
          公開する予定がなくても大丈夫。Clipnoteは、自分専用のライブラリとしても使えます。
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-9 px-7"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-secondary">
              <Icon className="size-5 text-primary" />
            </div>
            <h3 className="mt-2 text-xl font-bold text-foreground">{title}</h3>
            <p className="text-sm leading-[1.7] text-secondary-foreground">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
