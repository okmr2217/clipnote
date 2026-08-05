import { ClipboardPasteIcon, Link2Icon, HistoryIcon } from "lucide-react";

const FEATURES = [
  {
    icon: ClipboardPasteIcon,
    title: "AIが作ったものを、そのまま保存。",
    description:
      "Claudeとの会話で生成したHTMLやMarkdownを、貼り付けるだけ、あるいはMCP経由で会話からそのまま保存。エディタや変換作業は不要です。",
  },
  {
    icon: Link2Icon,
    title: "ブラウザでそのまま開けるURLに。",
    description:
      "PrivateかPublicかを選べば、共有用URLが自動発行。受け取った相手はコードを見ることなく、ブラウザでそのまま開けます。",
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
