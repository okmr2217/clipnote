import { wrapHtmlDocument } from "./document-shell";

// html/markdownとは異なり、プレーンテキストは構文をいっさい解釈しない
// （設計書5-1節「改行と文字だけ。飾らずに、そのままメモとして残せる」）。
// HTMLとして解釈されうる文字だけをエスケープし、白紙のドキュメント内に
// そのまま流し込む。
function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function renderPlainTextDocument(content: string): string {
  // white-space: pre-wrap（document-shellのpre.plaintext）で改行・連続する
  // 空白をそのまま保持しつつ、はみ出した行は折り返す。
  return wrapHtmlDocument(`<pre class="plaintext">${escapeHtml(content)}</pre>`);
}
