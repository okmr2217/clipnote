"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "テキスト・Markdown・HTML、どれも使えますか？",
    a: "はい、すべて使えます。テキストやMarkdownだけでも十分メモとして使えますし、表現力を求める場合はHTMLもそのまま保存・公開できます。",
  },
  {
    q: "Markdownの中でどこまで書けますか？",
    a: "見出し・リスト・引用・リンク・画像といった基本的な記法に加え、テーブルやタスクリスト、コードのシンタックスハイライト、数式（KaTeX）、絵文字ショートコードにも対応しています。詳しくは「対応形式」セクションをご覧ください。",
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
    q: "誤って削除してしまったら？",
    a: "削除してもすぐには消えず、ゴミ箱に30日間保管されます。その間はいつでも元に戻せます。",
  },
  {
    q: "ChatGPTやGeminiでも使えますか？",
    a: "はい。貼り付けての保存はAIツール不問で使えます。ChatGPTやGeminiとの会話で生成したHTML/Markdownも、コピーして貼り付けるだけで保存できます。",
  },
  {
    q: "MCP連携も使えますか？",
    a: "はい。Claudeは無料プランを含む全プラン（Claude Desktop・Claude Code・claude.ai）で利用できます。ChatGPTはPlus以上のプランで、設定の「Developer mode」をONにすると利用できます（Web版のみ、保存・更新時は都度承認が必要）。Geminiは一般ユーザー向けアプリでの対応窓口が現状ないため非対応です。",
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
