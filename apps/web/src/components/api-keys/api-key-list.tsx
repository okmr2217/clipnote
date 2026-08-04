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
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-extrabold tracking-tight md:text-2xl">APIキー</h1>
        <Button
          className="hidden h-auto px-5 py-3 shadow-[var(--shadow-accent)] md:inline-flex"
          onClick={() => setDialog({ type: "issue" })}
        >
          <PlusIcon /> 新規APIキー
        </Button>
        <Button
          variant="secondary"
          size="icon"
          aria-label="新規APIキー"
          className="size-9 rounded-md text-primary shadow-none md:hidden"
          onClick={() => setDialog({ type: "issue" })}
        >
          <PlusIcon />
        </Button>
      </div>

      {apiKeys.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="max-w-sm text-sm text-muted-foreground">
            まだAPIキーがありません。ClaudeなどのMCP対応クライアントと連携するには、新規に発行してください。
          </p>
          <Button
            className="h-auto px-5 py-3 shadow-[var(--shadow-accent)]"
            onClick={() => setDialog({ type: "issue" })}
          >
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
