// 公開ページ（apps/web）側でiframeを内部スクロールさせず、本文の高さに合わせて
// 伸縮させるために埋め込む。子（このWorkerが返すドキュメント）から高さを
// postMessageで親へ通知する。sandbox属性にallow-same-originを付けていないため
// 子から見た自身のoriginはopaque（"null"）になり、親側もevent.originでの検証は
// できない／しない設計（親側はevent.source＝window参照で送信元を照合する）。
//
// 画像の遅延読み込みやWebフォント適用など、短時間に複数回連続してレイアウトが
// 変化する場面でpostMessageを都度送ると、親側の高さが小刻みに何度も変わり
// スクロールが不自然に感じられる。requestAnimationFrameで1フレームにつき
// 最大1回に間引き、まとめて通知する。
//
// リンククリックはiframe自身のナビゲーションとして処理されてしまうと、
// 遷移先のページが（RESIZE_SCRIPTを持たないため）伸縮しないままiframeの
// 枠内に押し込められて表示され、遷移が機能していないように見える。
// ページ内アンカー（#から始まるhref）以外のクリックはすべてwindow.openで
// 新規タブとして開く（sandboxのallow-popups-to-escape-sandboxにより、
// 親ページとは独立した通常のタブとして開ける）。
export const RESIZE_SCRIPT = `<script>(function(){
var reportScheduled = false;
function report(){
  reportScheduled = false;
  parent.postMessage({ source: "clipnote-content", height: document.documentElement.scrollHeight }, "*");
}
function scheduleReport(){
  if (reportScheduled) return;
  reportScheduled = true;
  requestAnimationFrame(report);
}
scheduleReport();
window.addEventListener("load", scheduleReport);
if (window.ResizeObserver) {
  new ResizeObserver(scheduleReport).observe(document.documentElement);
} else {
  window.addEventListener("resize", scheduleReport);
}

document.addEventListener("click", function(event){
  var link = event.target && event.target.closest ? event.target.closest("a[href]") : null;
  if (!link) return;
  var href = link.getAttribute("href");
  if (!href || href.charAt(0) === "#") return;
  event.preventDefault();
  window.open(link.href, "_blank", "noopener,noreferrer");
});
})();</script>`;
