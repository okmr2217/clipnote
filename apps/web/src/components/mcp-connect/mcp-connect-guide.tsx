"use client";

import { CopyIcon } from "lucide-react";
import { Tabs, TabsIndicator, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { CopyButton } from "@/components/ui/copy-button";

const MCP_URL = "https://mcp.clipnote.paritto.dev/mcp";

function CodeBlock({ value }: { value: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-border bg-background px-3.5 py-3">
      <pre className="flex-1 overflow-x-auto whitespace-pre-wrap break-all font-mono text-[13px] leading-[1.6]">
        {value}
      </pre>
      <CopyButton getValue={() => value} label="コピー" icon={<CopyIcon />} />
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-primary">
        {n}
      </span>
      <div className="flex-1 text-sm leading-[1.7] text-secondary-foreground">{children}</div>
    </li>
  );
}

export function McpConnectGuide() {
  return (
    <div className="mb-10 rounded-2xl border border-border bg-card p-5 md:p-7">
      <h2 className="text-lg font-extrabold tracking-tight md:text-xl">Claudeと接続する</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        使っているClaudeの種類に合わせて、接続方法を選んでください。
      </p>

      <Tabs defaultValue="claude-ai" className="mt-5">
        <TabsList>
          <TabsIndicator />
          <TabsTab value="claude-ai">claude.ai</TabsTab>
          <TabsTab value="desktop">Claude Desktop</TabsTab>
          <TabsTab value="code">Claude Code</TabsTab>
        </TabsList>

        <TabsPanel value="claude-ai" className="mt-5">
          <ol className="flex flex-col gap-4">
            <Step n={1}>claude.aiの「設定 &gt; コネクタ」を開き、「カスタムコネクタを追加」を選びます。</Step>
            <Step n={2}>
              URL欄に以下を入力します。
              <div className="mt-2">
                <CodeBlock value={MCP_URL} />
              </div>
            </Step>
            <Step n={3}>
              「接続」を押すとClipnoteのログイン・アクセス許可画面が表示されるので、内容を確認して許可してください。APIキーの発行は不要です。
            </Step>
          </ol>
        </TabsPanel>

        <TabsPanel value="desktop" className="mt-5">
          <ol className="flex flex-col gap-4">
            <Step n={1}>
              下の「APIキーを発行」からAPIキーを発行します（名前の例: 「Claude Desktop用」）。
            </Step>
            <Step n={2}>
              Claude Desktopの設定ファイル（claude_desktop_config.json）に、発行したキーを使って以下を追加します。
              <div className="mt-2">
                <CodeBlock
                  value={`{
  "mcpServers": {
    "clipnote": {
      "url": "${MCP_URL}",
      "headers": {
        "Authorization": "Bearer <発行したAPIキー>"
      }
    }
  }
}`}
                />
              </div>
            </Step>
            <Step n={3}>Claude Desktopを再起動すると接続されます。</Step>
          </ol>
        </TabsPanel>

        <TabsPanel value="code" className="mt-5">
          <ol className="flex flex-col gap-4">
            <Step n={1}>
              下の「APIキーを発行」からAPIキーを発行します（名前の例: 「Claude Code用」）。
            </Step>
            <Step n={2}>
              ターミナルで以下のコマンドを実行します。
              <div className="mt-2">
                <CodeBlock
                  value={`claude mcp add --transport http clipnote ${MCP_URL} \\\n  --header "Authorization: Bearer <発行したAPIキー>"`}
                />
              </div>
            </Step>
            <Step n={3}>これで新しいセッションからClipnoteのクリップを操作できるようになります。</Step>
          </ol>
        </TabsPanel>
      </Tabs>
    </div>
  );
}
