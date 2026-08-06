import { SaveIcon, LibraryIcon, Share2Icon, SparklesIcon } from "lucide-react";

const CAPABILITIES = [
  {
    icon: SaveIcon,
    title: "保存する",
    description: "テキストもHTMLも、そのままの形で残しておける。",
  },
  {
    icon: LibraryIcon,
    title: "見返す",
    description: "メモ帳のように一覧で管理し、あとから探せる。",
  },
  {
    icon: Share2Icon,
    title: "共有する",
    description: "URLひとつで、誰にでもそのまま見せられる。",
  },
  {
    icon: SparklesIcon,
    title: "育てる",
    description: "AIに直接編集させて、会話の続きで更新できる。",
    href: "#mcp",
  },
];

export function LpCapabilities() {
  return (
    <section className="mx-auto max-w-[1160px] px-5 pb-16 md:px-8 md:pb-24">
      <div className="mx-auto mb-10 max-w-[560px] text-center">
        <h2 className="text-[22px] font-extrabold tracking-tight text-foreground md:text-[26px]">
          できること。
        </h2>
        <p className="mt-3 text-sm leading-[1.8] text-secondary-foreground">
          AIとのやり取りを、保存してから育てるまで。Clipnoteでひとつながりにできます。
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">
        {CAPABILITIES.map(({ icon: Icon, title, description, href }) => {
          const content = (
            <>
              <div className="flex size-10 items-center justify-center rounded-xl bg-secondary">
                <Icon className="size-5 text-primary" />
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">{title}</h3>
              <p className="mt-1.5 text-sm leading-[1.7] text-secondary-foreground">
                {description}
              </p>
            </>
          );

          if (href) {
            return (
              <a
                key={title}
                href={href}
                className="flex flex-col rounded-3xl border border-border bg-card p-7"
              >
                {content}
              </a>
            );
          }

          return (
            <div key={title} className="flex flex-col rounded-3xl border border-border bg-card p-7">
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
