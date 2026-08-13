"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, DownloadIcon, HistoryIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormatBadge } from "@/components/clips/format-badge";
import { VersionPreviewDialog, type PreviewTarget } from "@/components/clips/version-preview-dialog";
import { RestoreVersionAlert } from "@/components/clips/restore-version-alert";
import type { ClipDetail, PageVersionRow } from "@/components/clips/types";
import type { ContentType, UpdateSource } from "@clipnote/pages/validation";

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function sanitizeForFileName(value: string): string {
  return value.replace(/[\\/:*?"<>|]/g, "_").trim() || "clip";
}

const EXTENSION_BY_CONTENT_TYPE: Record<ContentType, string> = {
  html: "html",
  markdown: "md",
  plaintext: "txt",
};

const MIME_TYPE_BY_CONTENT_TYPE: Record<ContentType, string> = {
  html: "text/html",
  markdown: "text/markdown",
  plaintext: "text/plain",
};

function extensionFor(contentType: ContentType): string {
  return EXTENSION_BY_CONTENT_TYPE[contentType];
}

// この更新がどこ経由で行われたかの表示ラベル（設計書v13 9章）。
const SOURCE_LABEL: Record<UpdateSource, string> = {
  web: "管理画面",
  api_key: "MCP（APIキー）",
  oauth: "MCP（OAuth）",
};

// サーバー通信なしでダウンロードさせる（設計書6-5節）：表示のためにすでに
// クライアント側へ渡っているテキストをBlob化してaタグ経由で保存するだけで、
// 追加のfetchは発生しない。
function downloadAsFile(fileNameBase: string, contentType: ContentType, content: string) {
  const mimeType = MIME_TYPE_BY_CONTENT_TYPE[contentType];
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${fileNameBase}.${extensionFor(contentType)}`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function VersionHistory({
  clip,
  versions,
  fromCollection,
}: {
  clip: ClipDetail;
  versions: PageVersionRow[];
  fromCollection?: { id: string; name: string } | null;
}) {
  const router = useRouter();
  const [previewTarget, setPreviewTarget] = useState<PreviewTarget>(null);
  const [restoreTarget, setRestoreTarget] = useState<PageVersionRow | null>(null);

  function refresh() {
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {fromCollection ? (
        <Link
          href={`/admin/collections/${fromCollection.id}`}
          className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-secondary-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" /> 「{fromCollection.name}」に戻る
        </Link>
      ) : (
        <Link
          href="/admin"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-secondary-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" /> クリップ一覧へ戻る
        </Link>
      )}

      <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] md:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <FormatBadge contentType={clip.contentType} />
          <Badge variant={clip.visibility === "public" ? "secondary" : "outline"}>
            {clip.visibility === "public" ? "公開" : "非公開"}
          </Badge>
        </div>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight">{clip.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          最終更新: {dateFormatter.format(clip.updatedAt)}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] md:p-8">
        <div className="mb-5 flex items-center gap-2">
          <HistoryIcon className="size-5 text-primary" />
          <h2 className="text-lg font-extrabold tracking-tight">更新履歴</h2>
        </div>

        <ul className="flex flex-col gap-3">
          <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-secondary/60 px-4 py-3.5">
            <div className="flex items-center gap-2 text-sm">
              <span className="size-2 rounded-full bg-primary" aria-hidden />
              <span className="font-bold text-foreground">
                現在のバージョン (v{clip.currentVersionNumber})
              </span>
              <span className="text-muted-foreground">{dateFormatter.format(clip.updatedAt)}</span>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => downloadAsFile(sanitizeForFileName(clip.title), clip.contentType, clip.content)}
            >
              <DownloadIcon /> ダウンロード
            </Button>
          </li>

          {versions.map((version) => (
            <li
              key={version.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3.5"
            >
              <div className="flex items-center gap-2 text-sm">
                <span className="size-2 rounded-full bg-muted-foreground/40" aria-hidden />
                <span className="font-bold text-foreground">v{version.versionNumber}</span>
                <span className="text-muted-foreground">{dateFormatter.format(version.createdAt)}</span>
                <Badge variant="outline">{SOURCE_LABEL[version.source]}</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPreviewTarget({
                      label: `v${version.versionNumber}`,
                      contentType: version.contentType,
                      content: version.content,
                    })
                  }
                >
                  プレビュー
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    downloadAsFile(
                      `${sanitizeForFileName(clip.title)}_v${version.versionNumber}`,
                      version.contentType,
                      version.content,
                    )
                  }
                >
                  <DownloadIcon /> ダウンロード
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setRestoreTarget(version)}
                >
                  復元
                </Button>
              </div>
            </li>
          ))}
        </ul>

        {versions.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            更新履歴はまだありません。コンテンツ更新を行うと、上書き前の内容がここに記録されます。
          </p>
        ) : (
          <p className="mt-4 text-xs text-muted-foreground">直近10件のみ保持されます。</p>
        )}
      </div>

      <VersionPreviewDialog target={previewTarget} onOpenChange={(open) => !open && setPreviewTarget(null)} />
      <RestoreVersionAlert
        clipId={clip.id}
        version={restoreTarget}
        onOpenChange={(open) => !open && setRestoreTarget(null)}
        onRestored={refresh}
      />
    </div>
  );
}
