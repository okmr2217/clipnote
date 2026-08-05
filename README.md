# Clipnote

AI生成のHTML/Markdownを保存・公開管理するツール。テキストを貼り付けるだけで保存・URL共有できるほか、MCP（Model Context Protocol）でClaudeと直接つなぎ、会話からそのままクリップを作成・更新できます。

## URL

- Web（管理画面・LP・公開ページ外枠）: https://clipnote.paritto.dev
- コンテンツ配信（iframe内、直接アクセス不要）: https://content.clipnote.paritto.dev
- MCPサーバー: https://mcp.clipnote.paritto.dev

## 主な機能

- **クリップの保存・公開**: AIが生成したHTML/Markdownを貼り付けるかファイルをドロップして保存。Private/Publicを切り替えて共有用URLを発行できます。
- **コレクション**: 複数のクリップをまとめて、ひとつのURLで公開できます。
- **バージョン履歴**: 上書き保存しても過去の内容はいつでも復元・ダウンロードできます。
- **MCP連携**: Claude Desktop / Claude Code / claude.aiから、クリップの一覧取得・取得・作成・更新をMCP経由で行えます（詳細は[apps/mcp](./apps/mcp)）。
  - 接続方法は2種類: 管理画面（`/admin/api-keys`）で発行するAPIキー（Claude Desktop / Claude Code向け）、またはOAuth 2.1 + Dynamic Client Registration（claude.aiのカスタムコネクタ向け）。
  - 連携中のアプリはいつでも同じ画面から確認・失効できます。

## 構成

pnpm workspace + turborepoによるモノレポです。

- `apps/web` — 管理画面・LP・公開ページ・OAuth認可サーバー（Next.js、Cloudflare Workers上で稼働）
- `apps/content` — クリップ公開用の軽量API（Hono）
- `apps/mcp` — MCPサーバー（Hono、Cloudflare Workers上で稼働）。APIキー認証とOAuth（JWT/JWKS検証）の両方に対応し、`list_pages` / `get_page` / `upload_page` / `update_page` の4ツールを提供
- `packages/db` — D1スキーマ・マイグレーション（Drizzle）

## クイックスタート

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm --filter @clipnote/db db:create:local
pnpm --filter @clipnote/db db:migrate:local
pnpm dev
```

開発サーバー・デプロイ手順の詳細は [docs/development.md](./docs/development.md) を参照してください。

## ドキュメント

- 要件定義: [docs/requirements.md](./docs/requirements.md)
- 詳細設計: [docs/design.md](./docs/design.md)
- 開発・デプロイ手順: [docs/development.md](./docs/development.md)
