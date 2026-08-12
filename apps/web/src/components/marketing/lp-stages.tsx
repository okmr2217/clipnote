import {
  ClipboardPasteIcon,
  FileIcon,
  SparklesIcon,
  SearchIcon,
  HistoryIcon,
  RefreshCwIcon,
  BotIcon,
  LockIcon,
  Link2Icon,
  Share2Icon,
  ChevronRightIcon,
} from "lucide-react";

const STAGES = [
  {
    step: "STEP 1",
    title: "登録",
    subtitle: "クリップをつくる",
    items: [
      {
        icon: SparklesIcon,
        title: "AIに直接お願いできる",
        description: "ClaudeやChatGPTとの会話の続きで、そのままクリップを保存。貼り付け作業そのものが不要になります。",
        highlight: true,
      },
      {
        icon: ClipboardPasteIcon,
        title: "貼り付けるだけで保存",
        description: "コピーした内容を貼り付けるだけ。エディタも変換も不要です。",
      },
      {
        icon: FileIcon,
        title: "ファイルもそのまま使える",
        description: "ドラッグ&ドロップで、中身とタイトルが自動で入ります。",
      },
    ],
  },
  {
    step: "STEP 2",
    title: "管理",
    subtitle: "整理して、迷わず見つける",
    items: [
      {
        icon: SearchIcon,
        title: "検索してすぐ見つかる",
        description: "タイトルで検索できるから、増えても迷いません。",
      },
      {
        icon: HistoryIcon,
        title: "更新しても安心",
        description: "上書きしても前の内容は自動保存。いつでも見返し・復元できます。",
      },
      {
        icon: RefreshCwIcon,
        title: "MCPで書き換えられる",
        description: "ClaudeやChatGPTとの会話でそのまま更新をお願いできます。旧内容は自動でバージョン保存。",
      },
      {
        icon: BotIcon,
        title: "AIが取得して回答に活かす",
        description:
          "過去に保存したクリップをAIが読み込んで、それを踏まえて答えてくれます。旅行プランの続きを相談したり、以前の資料を踏まえた質問をしたりできます。",
        highlight: true,
      },
    ],
  },
  {
    step: "STEP 3",
    title: "公開",
    subtitle: "見せたい人に、そのまま共有",
    items: [
      {
        icon: LockIcon,
        title: "公開・非公開を選べる",
        description: "自分だけの保存にするか、URLで公開するか。あとからいつでも変更できます。",
      },
      {
        icon: Link2Icon,
        title: "URLひとつで共有",
        description: "発行したURLを送るだけ。相手はブラウザで開くだけで見られます。",
      },
      {
        icon: Share2Icon,
        title: "コレクションもまとめて公開",
        description: "複数のクリップを、ひとつの公開ページとして共有できます。",
      },
    ],
  },
];

export function LpStages() {
  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto max-w-[1160px] px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto mb-10 max-w-[560px] text-center">
          <h2 className="text-[22px] font-extrabold tracking-tight text-foreground md:text-[26px]">
            登録から公開まで、迷わない。
          </h2>
          <p className="mt-3 text-sm leading-[1.8] text-secondary-foreground">
            クリップは、つくる→整理する→共有する、の3ステップで完結します。
          </p>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-stretch">
          {STAGES.map((stage, index) => (
            <div key={stage.title} className="flex items-stretch gap-6">
              <div className="flex flex-1 flex-col rounded-3xl border border-border bg-background p-7 md:w-[320px] md:flex-none">
                <span className="inline-block w-fit rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary">
                  {stage.step}
                </span>
                <h3 className="mt-4 text-lg font-bold text-foreground">{stage.title}</h3>
                <p className="mt-1 text-sm text-secondary-foreground">{stage.subtitle}</p>

                <ul className="mt-6 flex flex-col gap-4 border-t border-border pt-6">
                  {stage.items.map(({ icon: Icon, title, description, highlight }) => (
                    <li
                      key={title}
                      className={
                        highlight
                          ? "flex gap-3 rounded-2xl bg-secondary/70 p-3"
                          : "flex gap-3"
                      }
                    >
                      <div
                        className={
                          highlight
                            ? "flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary"
                            : "flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary"
                        }
                      >
                        <Icon
                          className={
                            highlight ? "size-4 text-primary-foreground" : "size-4 text-primary"
                          }
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-bold text-foreground">{title}</p>
                          {highlight && (
                            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                              おすすめ
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs leading-[1.6] text-secondary-foreground">
                          {description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {index < STAGES.length - 1 && (
                <ChevronRightIcon className="hidden size-5 shrink-0 self-center text-muted-foreground md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
