"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConnectedAppTable } from "@/components/connected-apps/connected-app-table";
import { ConnectedAppCard } from "@/components/connected-apps/connected-app-card";
import { RevokeConnectedAppAlert } from "@/components/connected-apps/revoke-connected-app-alert";
import type { ConnectedAppRow } from "@/components/connected-apps/types";

export function ConnectedAppList({ apps }: { apps: ConnectedAppRow[] }) {
  const router = useRouter();
  const [revoking, setRevoking] = useState<ConnectedAppRow | null>(null);

  if (apps.length === 0) {
    return null;
  }

  return (
    <div className="mt-10">
      <h2 className="mb-1 text-lg font-extrabold tracking-tight">連携中のアプリ</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        OAuthで認可したclaude.ai等のアプリの一覧です。
      </p>

      <ConnectedAppTable apps={apps} onRevoke={setRevoking} />
      <ConnectedAppCard apps={apps} onRevoke={setRevoking} />

      <RevokeConnectedAppAlert
        app={revoking}
        onOpenChange={(open) => !open && setRevoking(null)}
        onRevoked={() => router.refresh()}
      />
    </div>
  );
}
