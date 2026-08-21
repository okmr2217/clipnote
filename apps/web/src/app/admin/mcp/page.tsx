import { apiKeys, oauthClients, oauthConsents } from "@clipnote/db/schema";
import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { ApiKeyList } from "@/components/api-keys/api-key-list";
import type { ApiKeyRow } from "@/components/api-keys/types";
import { ConnectedAppList } from "@/components/connected-apps/connected-app-list";
import type { ConnectedAppRow } from "@/components/connected-apps/types";
import { McpConnectGuide } from "@/components/mcp-connect/mcp-connect-guide";

export const metadata: Metadata = {
  title: "MCP連携 | Clipnote",
};

export default async function McpPage() {
  // AdminLayoutが未認証を弾いているため、ここではセッションは存在する前提。
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session!.user.id;

  const db = await getDb();
  const rows = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      createdAt: apiKeys.createdAt,
      lastUsedAt: apiKeys.lastUsedAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId))
    .orderBy(desc(apiKeys.createdAt));

  // OAuthで認可済みのアプリ一覧（設計書8章）。同意記録（oauth_consents）を
  // 正とする：同一クライアントへの再認可はupsertされるため重複しない。
  const connectedApps = await db
    .select({
      clientId: oauthConsents.clientId,
      name: oauthClients.name,
      createdAt: oauthConsents.createdAt,
    })
    .from(oauthConsents)
    .innerJoin(oauthClients, eq(oauthClients.clientId, oauthConsents.clientId))
    .where(eq(oauthConsents.userId, userId))
    .orderBy(desc(oauthConsents.createdAt));

  return (
    <main className="px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-xl font-extrabold tracking-tight md:text-2xl">MCP連携</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            ClaudeなどのMCP対応クライアントからClipnoteのクリップを操作できるようにします。
          </p>
        </div>
        <McpConnectGuide />
        <ApiKeyList apiKeys={rows as ApiKeyRow[]} />
        <ConnectedAppList
          apps={connectedApps.map((app) => ({ ...app, name: app.name ?? app.clientId })) as ConnectedAppRow[]}
        />
      </div>
    </main>
  );
}
