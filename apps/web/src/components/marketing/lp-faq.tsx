"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "HTMLとMarkdown、どちらも使えますか？",
    a: "はい、どちらの形式にも対応しています。",
  },
  {
    q: "公開したコンテンツは誰でも見られますか？",
    a: "公開設定はPrivate/Publicから選べます。Publicにした場合のみ、URLを知っている人が閲覧できます。",
  },
  {
    q: "内容を間違えて上書きしてしまったら？",
    a: "過去のバージョンはいつでも復元・ダウンロードできるので安心です。",
  },
  {
    q: "ChatGPTでも使えますか？",
    a: "現在はClaude（Claude Desktop・Claude Code・claude.ai）のMCP連携に対応しています。他のAIツールへの対応は今後検討予定です。",
  },
];

export function LpFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-[780px] px-5 pt-16 md:px-8 md:pt-24">
      <h2 className="mb-8 text-center text-[22px] font-extrabold tracking-tight text-foreground md:text-[26px]">
        よくある質問
      </h2>

      <div className="flex flex-col gap-3">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <button
              key={faq.q}
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="rounded-2xl border border-border bg-card px-6 py-5 text-left"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-[15px] font-bold text-foreground">{faq.q}</span>
                <span className="shrink-0 text-lg font-bold text-primary">
                  {isOpen ? "－" : "＋"}
                </span>
              </div>
              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-200",
                  isOpen ? "grid-rows-[1fr] pt-3.5" : "grid-rows-[0fr]",
                )}
              >
                <p className="overflow-hidden text-sm leading-[1.7] text-secondary-foreground">
                  {faq.a}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
