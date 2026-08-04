# 開発・デプロイ手順

Clipnoteはpnpm workspace + turborepoによるモノレポです。本ドキュメントでは開発サーバーの起動方法とデプロイ手順をまとめます。

## 構成

| パス | 役割 | 実行環境 |
| --- | --- | --- |
| `apps/web` | 管理画面・公開ページ（Next.js） | Cloudflare Workers（`@opennextjs/cloudflare`） |
| `apps/content` | クリップ公開用の軽量API（Hono） | Cloudflare Workers |
| `apps/mcp` | MCPサーバー（未実装） | - |
| `packages/db` | D1スキーマ・マイグレーション（Drizzle） | Cloudflare D1 |

## 前提条件

- Node.js（バージョンは`.nvmrc`を参照）
- pnpm（`package.json`の`packageManager`に固定バージョンあり。`corepack enable`推奨）
- Cloudflareアカウント、`wrangler login`済みであること（デプロイ・リモートD1操作に必要）

## セットアップ

```bash
pnpm install
```

`apps/web`の環境変数を用意します。

```bash
cp apps/web/.env.example apps/web/.env.local
```

`BETTER_AUTH_SECRET`に値を設定してください（`BETTER_AUTH_URL`はローカルなら`http://localhost:3000`のままでOK）。

`CONTENT_TOKEN_SECRET`は`apps/web`と`apps/content`で同じ値を共有する必要があります（設計書4-4節）。`apps/content`側の環境変数も用意してください。

```bash
cp apps/content/.dev.vars.example apps/content/.dev.vars
```

`apps/web/.env.local`の`CONTENT_TOKEN_SECRET`と`apps/content/.dev.vars`の`CONTENT_TOKEN_SECRET`に同じランダム値を設定してください。`NEXT_PUBLIC_CONTENT_ORIGIN`（apps/web側）と`CONTENT_HOST`（apps/content側）は、`wrangler dev`がデフォルトで待ち受けるアドレス`http://localhost:8787`に合わせてあります（実際のポートがずれる場合は両方を実際の値に合わせて調整してください）。

D1のローカルDBを作成し、マイグレーションを適用します。

```bash
pnpm --filter @clipnote/db db:create:local
pnpm --filter @clipnote/db db:migrate:local
```

## 開発サーバーの起動

ルートから全workspaceをまとめて起動する場合。

```bash
pnpm dev
```

個別に起動する場合。

```bash
pnpm --filter web dev        # Next.js dev server（apps/web）
pnpm --filter content dev    # wrangler dev（apps/content）
```

DBの中身をGUIで確認したい場合はDrizzle Studioを使います。

```bash
pnpm --filter @clipnote/db db:studio
```

## ビルド・Lint・テスト

```bash
pnpm build   # turbo run build（全workspace）
pnpm lint    # turbo run lint（全workspace）
pnpm --filter @clipnote/db test   # vitest run
```

`apps/web`単体でCloudflare Worker向けビルドをローカルプレビューしたい場合。

```bash
pnpm --filter web preview
```

## デプロイ

ルートから全workspaceをまとめてデプロイする場合。

```bash
pnpm deploy
```

個別にデプロイする場合。

```bash
pnpm --filter web deploy       # opennextjs-cloudflare build && deploy
pnpm --filter content deploy   # wrangler deploy
```

リモートD1へのマイグレーション適用（本番反映）はデプロイとは別コマンドです。スキーマ変更を伴うリリースでは、デプロイ前にリモートマイグレーションを適用してください。

```bash
pnpm --filter @clipnote/db db:migrate:remote
```

## wrangler.jsonc について

D1の`database_id`は`apps/web`と`packages/db`で同一のDB（`clipnote-db`）を指しています。スキーマとマイグレーションは`packages/db`が所有し、`apps/web`は同じDBに対する読み書き用のバインディングのみを持ちます。マイグレーション追加時は`packages/db`側で`db:generate`してから、ローカル・リモート双方に適用してください。

## その他

- Cloudflareの型定義を再生成する場合: `pnpm --filter web cf-typegen`
- `apps/mcp`は実装フェーズ未着手のため、開発・デプロイ手順は今後追記します。
