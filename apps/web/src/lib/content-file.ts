import type { ContentType } from "@clipnote/pages/validation";

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

export function sanitizeForFileName(value: string): string {
  return value.replace(/[\\/:*?"<>|]/g, "_").trim() || "clip";
}

// サーバー通信なしでダウンロードさせる（設計書6-5節）：クライアント側へ渡って
// いるテキストをBlob化してaタグ経由で保存するだけ。
export function downloadAsFile(fileNameBase: string, contentType: ContentType, content: string) {
  const mimeType = MIME_TYPE_BY_CONTENT_TYPE[contentType];
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${fileNameBase}.${EXTENSION_BY_CONTENT_TYPE[contentType]}`;
  anchor.click();
  URL.revokeObjectURL(url);
}
