import { apiKeys } from "@clipnote/db/schema";
import { NextResponse } from "next/server";
import { generateApiKey, hashApiKey, maskApiKey } from "@clipnote/auth";
import { getDb } from "@/lib/db";
import { requireSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const { name } = body as Record<string, unknown>;
  if (typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "invalid_name" }, { status: 400 });
  }

  const rawKey = generateApiKey();
  const keyHash = await hashApiKey(rawKey);
  const keyPrefix = maskApiKey(rawKey);

  const db = await getDb();
  const id = crypto.randomUUID();
  await db.insert(apiKeys).values({
    id,
    userId: user.id,
    name: name.trim(),
    keyHash,
    keyPrefix,
  });

  // rawKeyはこのレスポンスでのみ返す。DBにはkey_hashのみ保存し、以降は
  // 誰も生キーの文字列に触れられない（設計書8-2節）。
  return NextResponse.json({ id, name: name.trim(), keyPrefix, rawKey }, { status: 201 });
}
