const BASIC_URL = "https://clipnote.paritto.dev/p/517e3dbe-a018-4e0c-bfd0-84ce7910a08d";
const ADVANCED_URL = "https://clipnote.paritto.dev/p/44cb4a58-a4da-4137-975d-52b79ee92d00";
const DIFFERENTIATOR_URL = "https://clipnote.paritto.dev/p/c3707214-3821-437e-9d8e-a785363961c4";

const FORMAT_COMPARISON = [
  { format: "プレーンテキスト", detail: "改行と文字だけで、そのままメモに。" },
  { format: "Markdown", detail: "見出し・リスト・表などで、少し整理された形に。" },
  { format: "HTML", detail: "レイアウトや装飾も含めて、AI好みの見た目に。" },
];

const MARKDOWN_FEATURES = [
  { label: "見出し", href: BASIC_URL },
  { label: "リスト", href: BASIC_URL },
  { label: "引用", href: BASIC_URL },
  { label: "リンク", href: BASIC_URL },
  { label: "画像", href: BASIC_URL },
  { label: "テーブル", href: ADVANCED_URL },
  { label: "タスクリスト", href: ADVANCED_URL },
  { label: "脚注", href: ADVANCED_URL },
  { label: "コードブロック（シンタックスハイライト）", href: DIFFERENTIATOR_URL },
  { label: "数式（KaTeX）", href: DIFFERENTIATOR_URL },
  { label: "絵文字ショートコード", href: DIFFERENTIATOR_URL },
  { label: "Mermaid図", href: null, note: "近日対応" },
];

export function LpFormats() {
  return (
    <section className="mx-auto max-w-[1160px] px-5 pb-14 md:px-8 md:pb-20">
      <div className="mx-auto mb-8 max-w-[560px] text-center">
        <h2 className="text-[22px] font-extrabold tracking-tight text-foreground md:text-[26px]">
          対応形式
        </h2>
        <p className="mt-3 text-sm leading-[1.8] text-secondary-foreground">
          プレーンテキスト・Markdown・HTMLの3形式に対応しています。
        </p>
      </div>

      <div className="mx-auto max-w-[720px] overflow-hidden rounded-2xl border border-border">
        <table className="w-full border-collapse text-left text-sm">
          <tbody>
            {FORMAT_COMPARISON.map((row, i) => (
              <tr key={row.format} className={i > 0 ? "border-t border-border" : undefined}>
                <th
                  scope="row"
                  className="w-[140px] bg-secondary px-4 py-3 align-top text-xs font-bold text-primary"
                >
                  {row.format}
                </th>
                <td className="bg-card px-4 py-3 text-secondary-foreground">{row.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mx-auto mt-10 max-w-[720px]">
        <h3 className="mb-4 text-center text-sm font-bold text-foreground">
          Markdownで使える記法
        </h3>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[420px] border-collapse text-left text-sm">
            <tbody>
              {MARKDOWN_FEATURES.map((feature, i) => (
                <tr
                  key={feature.label}
                  className={i > 0 ? "border-t border-border bg-card" : "bg-card"}
                >
                  <td className="px-4 py-2.5 text-foreground">{feature.label}</td>
                  <td className="px-4 py-2.5 text-right">
                    {feature.href ? (
                      <a
                        href={feature.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="whitespace-nowrap text-xs font-bold text-primary underline decoration-primary/40 underline-offset-2"
                      >
                        サンプルを見る →
                      </a>
                    ) : (
                      <span className="whitespace-nowrap text-xs font-semibold text-muted-foreground">
                        {feature.note}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
