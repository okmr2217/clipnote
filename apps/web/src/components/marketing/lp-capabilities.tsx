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
    <section className="mx-auto max-w-[1160px] px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto mb-10 max-w-[560px] text-center">
        <h2 className="text-[22px] font-extrabold tracking-tight text-foreground md:text-[26px]">
          できること。
        </h2>
        <p className="mt-3 text-sm leading-[1.8] text-secondary-foreground">
          AIとのやり取りを、保存してから育てるまで。Clipnoteでひとつながりにできます。
        </p>
      </div>

      <div className="flex flex-col divide-y divide-border rounded-3xl border border-border bg-card sm:flex-row sm:divide-x sm:divide-y-0">
        {CAPABILITIES.map(({ icon: Icon, title, description, href }) => {
          const content = (
            <>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                <Icon className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">{title}</h3>
                <p className="mt-1 text-sm leading-[1.6] text-secondary-foreground">
                  {description}
                </p>
              </div>
            </>
          );

          if (href) {
            return (
              <a key={title} href={href} className="flex flex-1 items-center gap-4 p-6">
                {content}
              </a>
            );
          }

          return (
            <div key={title} className="flex flex-1 items-center gap-4 p-6">
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
