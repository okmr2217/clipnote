import { oauthClients } from "@clipnote/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { ConsentForm } from "@/components/oauth/consent-form";

// /oauth2/authorizeがこのページへリダイレクトする際、元の認可リクエスト一式
// （client_id・scope・redirect_uri・code_challenge等）を署名付きでクエリに
// 埋め込んで渡してくる（better-authのoauthProviderプラグインの仕様）。この
// ページはそれを解釈せず、表示に必要なclient_id・scopeだけを読み取り、残り
// は署名検証込みでそのまま/oauth2/consentへ渡す（ConsentForm参照）。
export default async function OAuthConsentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawQuery = new URLSearchParams(
    Object.entries(params).flatMap(([key, value]) => {
      if (value === undefined) return [];
      return (Array.isArray(value) ? value : [value]).map((v): [string, string] => [key, v]);
    }),
  ).toString();

  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect(`/login?redirect=${encodeURIComponent(`/oauth/consent?${rawQuery}`)}`);
  }

  const clientId = typeof params.client_id === "string" ? params.client_id : undefined;
  const scope = typeof params.scope === "string" ? params.scope : "";

  if (!clientId) {
    redirect("/admin");
  }

  const db = await getDb();
  const [client] = await db
    .select({ name: oauthClients.name })
    .from(oauthClients)
    .where(eq(oauthClients.clientId, clientId));

  return <ConsentForm clientName={client?.name ?? clientId} scope={scope} oauthQuery={rawQuery} />;
}
