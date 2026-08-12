import { getCloudflareContext } from "@opennextjs/cloudflare";

// Cloudflare Email Sendingはparitto.devゾーン単位で有効化されており、
// clipnote.paritto.devサブドメインのfromアドレスはemail.invalidで拒否される
// ため、送信元はルートドメインを使う。
const FROM = { email: "noreply@paritto.dev", name: "Clipnote" };

// paritto.dev未有効化のCloudflare Email Sendingを前提にせず、開発時は実送信
// せずコンソールにリンクを出す（本番切り替えはNODE_ENVのみで行う）。
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[dev email] to=${to} subject=${subject}\n${text}`);
    return;
  }

  const { env } = await getCloudflareContext({ async: true });
  await env.EMAIL.send({ to, from: FROM, subject, html, text });
}

export function resetPasswordEmail(url: string) {
  return {
    subject: "【Clipnote】パスワードの再設定",
    text: `以下のリンクからパスワードを再設定してください（有効期限があります）。\n\n${url}\n\n心当たりがない場合はこのメールを無視してください。`,
    html: `<p>以下のリンクからパスワードを再設定してください（有効期限があります）。</p><p><a href="${url}">${url}</a></p><p>心当たりがない場合はこのメールを無視してください。</p>`,
  };
}

export function verifyEmailEmail(url: string) {
  return {
    subject: "【Clipnote】メールアドレスの確認",
    text: `以下のリンクからメールアドレスを確認してください。\n\n${url}\n\n心当たりがない場合はこのメールを無視してください。`,
    html: `<p>以下のリンクからメールアドレスを確認してください。</p><p><a href="${url}">${url}</a></p><p>心当たりがない場合はこのメールを無視してください。</p>`,
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// お問い合わせ・公開コンテンツの通報（/contact）から運営宛（CONTACT_EMAIL_TO）
// に送るメール。返信はこのメール本文の送信元アドレスへ手動で行う運用とする
// （better-authのメールと異なりreply-toの仕組みは持たない）。
export function contactEmail({
  fromEmail,
  message,
  reportedUrl,
}: {
  fromEmail: string;
  message: string;
  reportedUrl?: string;
}) {
  const subject = reportedUrl ? "【Clipnote】コンテンツの通報" : "【Clipnote】お問い合わせ";
  const metaText = reportedUrl ? `対象URL: ${reportedUrl}\n` : "";
  const metaHtml = reportedUrl ? `<p>対象URL: ${escapeHtml(reportedUrl)}</p>` : "";

  return {
    subject,
    text: `送信元: ${fromEmail}\n${metaText}\n${message}`,
    html: `<p>送信元: ${escapeHtml(fromEmail)}</p>${metaHtml}<p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
  };
}
