import { NextResponse } from "next/server";
import { issueContentToken } from "@/lib/content-token";
import { loadPublicPage } from "@/lib/public-access";

// /p/[uuid]のiframeが90秒間隔で叩く、トークン更新専用エンドポイント
// （設計書4-4節）。アクセス権は毎回この場で再判定する。閲覧中にセッションが
// 切れた・非公開化された場合は単に403/404を返し、クライアント側は静かに
// 更新を諦める設計とする（エラー表示はしない）。
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { uuid } = body as Record<string, unknown>;
  if (typeof uuid !== "string" || uuid.length === 0) {
    return NextResponse.json({ error: "invalid_uuid" }, { status: 400 });
  }

  const result = await loadPublicPage(uuid);
  if (!result) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const token = await issueContentToken(uuid, result.viewerUserId);
  return NextResponse.json({ token });
}
