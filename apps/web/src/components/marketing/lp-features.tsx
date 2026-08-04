import { ClipboardPasteIcon, Link2Icon, LayersIcon } from "lucide-react";

const FEATURES = [
  {
    icon: ClipboardPasteIcon,
    title: "貼り付けて、保存。",
    description: "エディタ不要。テキストもファイルも、そのまま貼るだけ。",
  },
  {
    icon: Link2Icon,
    title: "URLで、共有。",
    description: "公開設定を選べば、共有用URLが自動で発行されます。",
  },
  {
    icon: LayersIcon,
    title: "まとめて、公開。",
    description: "複数のクリップを束ねて、ひとつのURLに。",
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
