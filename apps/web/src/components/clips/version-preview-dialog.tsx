"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ContentType } from "@/lib/validation";

export type PreviewTarget = {
  label: string;
  contentType: ContentType;
  content: string;
} | null;

export function VersionPreviewDialog({
  target,
  onOpenChange,
}: {
  target: PreviewTarget;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={target !== null} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] w-full max-w-3xl flex-col gap-4 rounded-3xl p-6 sm:max-w-3xl sm:p-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">
            {target?.label}のプレビュー
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-background">
          {target?.contentType === "html" ? (
            // 本来は別ドメイン配信＋短命トークンで隔離する（設計書4-1節）が、
            // その公開配信の仕組みは本タスクのスコープ外。ここでは
            // allow-same-originを付けないsandboxed iframeを使い、同一オリジン
            // に埋め込んでもiframe側はopaqueなオリジンになる（＝管理画面の
            // Cookie/Storageへアクセスできない）という同じ隔離効果を得ている。
            <iframe
              key={target.content}
              title="バージョンプレビュー"
              srcDoc={target.content}
              sandbox="allow-scripts allow-popups allow-modals allow-popups-to-escape-sandbox"
              className="size-full min-h-[50vh] bg-white"
            />
          ) : (
            // Markdown→HTML変換パイプライン（content配信ドメイン側の処理、
            // 設計書4-4節）は本タスクのスコープ外のため、素のテキストとして
            // プレビューする。
            <pre className="size-full min-h-[50vh] overflow-auto p-4 text-sm whitespace-pre-wrap text-foreground">
              {target?.content}
            </pre>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
