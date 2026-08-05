import { oauthAccessTokens, oauthConsents, oauthRefreshTokens } from "@clipnote/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireSessionUser } from "@/lib/auth";

// OAuth連携の失効：同意（oauth_consents）を取り消し、既存のリフレッシュ
// トークンも削除して以降のトークン更新を止める。発行済みのアクセストークン
// はJWTでステートレスに検証されるため即時失効はできないが、有効期限が短い
// （既定1時間）ため実用上の猶予として許容する。
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ clientId: string }> },
) {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { clientId } = await params;
  const db = await getDb();
  const [existing] = await db
    .select({ clientId: oauthConsents.clientId })
    .from(oauthConsents)
    .where(and(eq(oauthConsents.clientId, clientId), eq(oauthConsents.userId, user.id)));
  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await db
    .delete(oauthConsents)
    .where(and(eq(oauthConsents.clientId, clientId), eq(oauthConsents.userId, user.id)));
  await db
    .delete(oauthRefreshTokens)
    .where(and(eq(oauthRefreshTokens.clientId, clientId), eq(oauthRefreshTokens.userId, user.id)));
  await db
    .delete(oauthAccessTokens)
    .where(and(eq(oauthAccessTokens.clientId, clientId), eq(oauthAccessTokens.userId, user.id)));

  return new NextResponse(null, { status: 204 });
}
