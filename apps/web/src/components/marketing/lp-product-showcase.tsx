"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { FormatBadge } from "@/components/clips/format-badge";

const TABS = ["管理画面", "新規登録", "公開ページ"] as const;
type Tab = (typeof TABS)[number];

const LIST_ITEMS: {
  contentType: "html" | "markdown";
  title: string;
  visibility: "public" | "private";
  date: string;
}[] = [
  { contentType: "html", title: "週次レポート.html", visibility: "public", date: "2026-08-03" },
  { contentType: "markdown", title: "定例会議の議事録", visibility: "private", date: "2026-08-02" },
  { contentType: "html", title: "イベント告知ページ", visibility: "public", date: "2026-07-28" },
];

export function LpProductShowcase() {
  const [tab, setTab] = useState<Tab>("管理画面");

  return (
    <section className="mx-auto max-w-[1160px] px-5 pb-16 md:px-8 md:pb-24">
      <h2 className="mb-8 text-center text-[22px] font-extrabold tracking-tight text-foreground md:text-[26px]">
        プロダクトを覗いてみる
      </h2>

      <div className="mb-5 flex flex-wrap justify-center gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full px-4.5 py-2.5 text-[13px] font-bold whitespace-nowrap",
              tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mx-auto max-w-[900px] overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2.5 border-b border-border bg-secondary px-4 py-3">
          <span className="size-2.5 rounded-full bg-accent" />
          <span className="size-2.5 rounded-full bg-accent" />
          <span className="size-2.5 rounded-full bg-accent" />
          <div className="ml-1 flex-1 truncate rounded-md bg-card px-3 py-1.5 font-mono text-xs text-muted-foreground">
            clipnote.paritto.dev
          </div>
        </div>

        <div className="min-h-[320px] overflow-x-auto bg-background p-7">
          {tab === "管理画面" && (
            <div>
              <div className="mb-3.5 flex items-center justify-between">
                <span className="text-[16px] font-extrabold text-foreground">クリップ一覧</span>
                <span className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground">
                  ＋ 新規クリップ
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {LIST_ITEMS.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2.5"
                  >
                    <FormatBadge contentType={item.contentType} />
                    <span className="flex-1 truncate text-[13px] font-semibold text-foreground">
                      {item.title}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-bold whitespace-nowrap",
                        item.visibility === "public"
                          ? "bg-secondary text-primary"
                          : "bg-muted text-secondary-foreground",
                      )}
                    >
                      {item.visibility === "public" ? "公開" : "非公開"}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "新規登録" && (
            <div className="mx-auto max-w-[420px] rounded-3xl bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="mb-4 text-[16px] font-extrabold text-foreground">新規クリップ登録</div>
              <div className="mb-4 rounded-xl border-2 border-dashed border-accent bg-background px-5 py-5 text-center">
                <p className="text-xs leading-relaxed text-secondary-foreground">
                  ここに貼り付け、または
                  <br />
                  ファイルをドラッグ&ドロップ
                </p>
              </div>
              <div className="mb-3.5 flex items-center gap-3">
                <span className="text-xs font-semibold text-foreground">形式：HTML</span>
                <span className="text-[11px] text-muted-foreground">自動判定されました</span>
              </div>
              <div className="mb-3.5 h-9.5 rounded-md border border-border bg-background" />
              <div className="flex justify-end gap-2.5">
                <span className="rounded-md border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground">
                  キャンセル
                </span>
                <span className="rounded-md bg-primary px-4.5 py-2 text-xs font-bold text-primary-foreground">
                  登録
                </span>
              </div>
            </div>
          )}

          {tab === "公開ページ" && (
            <div className="mx-auto max-w-[520px] overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                <span className="text-sm font-extrabold text-foreground">
                  Clip<span className="text-primary">note</span>
                </span>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-primary">
                  Public
                </span>
              </div>
              <div className="px-6 py-8">
                <div className="mb-2.5 text-lg font-extrabold text-foreground">
                  秋のプロダクトローンチについて
                </div>
                <p className="text-[13px] leading-[1.7] text-secondary-foreground">
                  チームで議論してきた新機能を中心にご紹介します。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
