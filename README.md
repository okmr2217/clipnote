# Clipnote

AI生成のHTML/Markdownを保存・公開管理するツール。

## 構成

pnpm workspace + turborepoによるモノレポです。

- `apps/web` — 管理画面・公開ページ（Next.js、Cloudflare Workers上で稼働）
- `apps/content` — クリップ公開用の軽量API（Hono）
- `apps/mcp` — MCPサーバー（未実装）
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
