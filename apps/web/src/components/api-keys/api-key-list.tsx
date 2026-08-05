"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiKeyTable } from "@/components/api-keys/api-key-table";
import { ApiKeyCard } from "@/components/api-keys/api-key-card";
import { IssueApiKeyDialog } from "@/components/api-keys/issue-api-key-dialog";
import { RevokeApiKeyAlert } from "@/components/api-keys/revoke-api-key-alert";
import type { ApiKeyRow } from "@/components/api-keys/types";

type DialogState = { type: "issue" } | { type: "revoke"; apiKey: ApiKeyRow } | null;

export function ApiKeyList({ apiKeys }: { apiKeys: ApiKeyRow[] }) {
  const router = useRouter();
  const [dialog, setDialog] = useState<DialogState>(null);

  function refresh() {
    router.refresh();
  }

  return (
    <div className="mt-10">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight">APIキー</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Claude Desktop・Claude Codeなど、APIキーで接続するクライアント用に発行・管理します。
          </p>
        </div>
        <Button
          variant="outline"
          className="hidden h-auto px-4 py-2 md:inline-flex"
          onClick={() => setDialog({ type: "issue" })}
        >
          <PlusIcon /> 新規APIキー
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="新規APIキー"
          className="size-9 rounded-md md:hidden"
          onClick={() => setDialog({ type: "issue" })}
        >
          <PlusIcon />
        </Button>
      </div>

      {apiKeys.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="max-w-sm text-sm text-muted-foreground">
            まだAPIキーがありません。Claude Desktop・Claude Codeと接続するには、新規に発行してください。
          </p>
          <Button variant="outline" className="h-auto px-4 py-2" onClick={() => setDialog({ type: "issue" })}>
            <PlusIcon /> 新規APIキー発行
          </Button>
        </div>
      ) : (
        <>
          <ApiKeyTable apiKeys={apiKeys} onRevoke={(apiKey) => setDialog({ type: "revoke", apiKey })} />
          <ApiKeyCard apiKeys={apiKeys} onRevoke={(apiKey) => setDialog({ type: "revoke", apiKey })} />
        </>
      )}

      <IssueApiKeyDialog
        open={dialog?.type === "issue"}
        onOpenChange={(open) => !open && setDialog(null)}
        onIssued={refresh}
      />
      <RevokeApiKeyAlert
        apiKey={dialog?.type === "revoke" ? dialog.apiKey : null}
        onOpenChange={(open) => !open && setDialog(null)}
        onRevoked={refresh}
      />
    </div>
  );
}
