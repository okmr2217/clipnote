// 公開ページ（apps/web）側でiframeを内部スクロールさせず、本文の高さに合わせて
// 伸縮させるために埋め込む。子（このWorkerが返すドキュメント）から高さを
// postMessageで親へ通知する。sandbox属性にallow-same-originを付けていないため
// 子から見た自身のoriginはopaque（"null"）になり、親側もevent.originでの検証は
// できない／しない設計（親側はevent.source＝window参照で送信元を照合する）。
export const RESIZE_SCRIPT = `<script>(function(){
function report(){
  parent.postMessage({ source: "clipnote-content", height: document.documentElement.scrollHeight }, "*");
}
report();
window.addEventListener("load", report);
if (window.ResizeObserver) {
  new ResizeObserver(report).observe(document.documentElement);
} else {
  window.addEventListener("resize", report);
}
})();</script>`;
