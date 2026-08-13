import { NextResponse } from "next/server";
import { contactEmail, sendEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE_LENGTH = 4000;

// 認証不要の公開フォーム（LPフッター「お問い合わせ」・公開クリップ／コレクションの
// 通報導線から利用、design.md5章）。ボット対策は簡易なハニーポットのみ（宛先は
// 固定のCONTACT_EMAIL_TOのため、第三者への送信中継には使えない）。
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { email, message, reportedUrl, website } = body as Record<string, unknown>;

  // ハニーポット：人間には見えない`website`フィールドが埋まっていたらボット扱い
  // し、送信したふりをして早期リターンする。
  if (typeof website === "string" && website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  if (
    typeof message !== "string" ||
    message.trim().length === 0 ||
    message.length > MAX_MESSAGE_LENGTH
  ) {
    return NextResponse.json({ error: "invalid_message" }, { status: 400 });
  }
  if (reportedUrl !== undefined && typeof reportedUrl !== "string") {
    return NextResponse.json({ error: "invalid_reported_url" }, { status: 400 });
  }

  const to = process.env.CONTACT_EMAIL_TO;
  if (!to) {
    console.error("[contact] CONTACT_EMAIL_TO is not configured");
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  await sendEmail({
    to,
    ...contactEmail({ fromEmail: email, message, reportedUrl: reportedUrl || undefined }),
  });

  return NextResponse.json({ ok: true });
}
