import { PinIcon, ArchiveIcon, Trash2Icon } from "lucide-react";

const POINTS = [
  {
    icon: PinIcon,
    title: "固定",
    description: "よく見返すクリップは、一覧の上に固定しておける。",
  },
  {
    icon: ArchiveIcon,
    title: "アーカイブ",
    description: "使い終わったクリップは、消さずに一覧から一時的に片付けられる。",
  },
  {
    icon: Trash2Icon,
    title: "ゴミ箱（30日間）",
    description: "削除してもすぐには消えない。30日以内ならいつでも復元できる。",
  },
];

export function LpOrganize() {
  return (
    <section className="mx-auto max-w-[1160px] px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto mb-10 max-w-[560px] text-center">
        <h2 className="text-[22px] font-extrabold tracking-tight text-foreground md:text-[26px]">
          増えても迷わない。
        </h2>
        <p className="mt-3 text-sm leading-[1.8] text-secondary-foreground">
          固定・アーカイブ・ゴミ箱で、片付けながら残せます。
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {POINTS.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-7"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-secondary">
              <Icon className="size-5 text-primary" />
            </div>
            <h3 className="mt-2 text-lg font-bold text-foreground">{title}</h3>
            <p className="text-sm leading-[1.7] text-secondary-foreground">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
