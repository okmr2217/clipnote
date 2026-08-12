# 開発・デプロイ手順

Clipnoteはpnpm workspace + turborepoによるモノレポです。本ドキュメントでは開発サーバーの起動方法とデプロイ手順をまとめます。

## 構成

| パス | 役割 | 実行環境 | ローカルポート |
| --- | --- | --- | --- |
| `apps/web` | 管理画面・公開ページ（Next.js） | Cloudflare Workers（`@opennextjs/cloudflare`） | 3000 |
| `apps/content` | クリップ公開用の軽量API（Hono） | Cloudflare Workers | 8787 |
| `apps/mcp` | MCPサーバー（Hono） | Cloudflare Workers | 8788 |
| `packages/db` | D1スキーマ・マイグレーション（Drizzle） | Cloudflare D1 | - |

`apps/content`と`apps/mcp`はどちらも`wrangler dev`で動きますが、`wrangler dev`はデフォルトでポート8787・インスペクタポート9229を使うため、`pnpm dev`で両方を同時起動すると衝突します。`apps/mcp`側の`package.json`で`--port 8788 --inspector-port 9230`を明示的に指定して回避しています。ポートを変更する場合は両方（起動コマンドの`--port`と、参照元の環境変数）を揃えて変更してください。

## 前提条件

- Node.js（バージョンは`.nvmrc`を参照）
- pnpm（`package.json`の`packageManager`に固定バージョンあり）。有効化には`corepack enable`を実行し、リポジトリルートで`corepack prepare pnpm@10.26.2 --activate`を実行してください（`pnpm`コマンドが未インストールの環境ではこれが必要です）
- Cloudflareアカウント、`wrangler login`済みであること（デプロイ・リモートD1操作に必要。ローカル開発のみなら不要）

## セットアップ

```bash
corepack enable
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

`apps/web/.env.local`の`CONTENT_TOKEN_SECRET`と`apps/content/.dev.vars`の`CONTENT_TOKEN_SECRET`に同じランダム値を設定してください（例: `openssl rand -hex 32`）。`BETTER_AUTH_SECRET`も同様にランダム値を設定します。`NEXT_PUBLIC_CONTENT_ORIGIN`（apps/web側）と`CONTENT_HOST`（apps/content側）は、`wrangler dev`がデフォルトで待ち受けるアドレス`http://localhost:8787`に合わせてあります（実際のポートがずれる場合は両方を実際の値に合わせて調整してください）。

`apps/mcp`はD1バインディングのみを使い、追加の環境変数・シークレットは不要です（APIキーやOAuthトークンの検証情報はすべてD1側に保存されています）。

D1のマイグレーションをローカルに適用します。

```bash
pnpm --filter @clipnote/db db:migrate:local
```

`--local --persist-to`オプションにより、実際のCloudflare D1リソースには触れず、`.wrangler/state`配下にローカル専用のSQLiteファイルが作られます（識別子は各`wrangler.jsonc`にコミット済みの`database_id`を流用するだけで、Cloudflare側にその名前のD1データベースが存在している必要はありません）。そのため`pnpm --filter @clipnote/db db:create:local`（`wrangler d1 create`）を実行する必要はありません。このコマンドは実際にCloudflare API へリモートでD1データベースを新規登録するための一度きりのプロジェクトセットアップ用コマンドで、登録済みのアカウントで再実行すると`A database with that name already exists`エラーになります。2人目以降の開発者はこのコマンドを実行せず、`db:migrate:local`から始めてください。

## 開発サーバーの起動

ルートから全workspaceをまとめて起動する場合。

```bash
pnpm dev
```

個別に起動する場合。

```bash
pnpm --filter web dev        # Next.js dev server（apps/web） -> http://localhost:3000
pnpm --filter content dev    # wrangler dev（apps/content）   -> http://localhost:8787
pnpm --filter mcp dev        # wrangler dev（apps/mcp）       -> http://localhost:8788
```

`apps/mcp`のOAuthトークン検証（JWKS取得）を含めて動作確認したい場合は、`apps/web`も同時に起動しておく必要があります。APIキー認証のみで確認する場合はDBだけで完結するため`apps/mcp`単体の起動でも動作します。

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

ルートから全workspaceをまとめてデプロイする場合。`pnpm deploy`はpnpm自体の組み込みコマンド（プロジェクトのデプロイ用ディレクトリ生成機能）と名前が衝突し何も実行されないため、`run`を省略しないこと。

```bash
pnpm run deploy
```

個別にデプロイする場合も同様に`run`が必要です。

```bash
pnpm --filter web run deploy       # opennextjs-cloudflare build && deploy
pnpm --filter content run deploy   # wrangler deploy
pnpm --filter mcp run deploy       # wrangler deploy
```

リモートD1へのマイグレーション適用（本番反映）はデプロイとは別コマンドです。スキーマ変更を伴うリリースでは、デプロイ前にリモートマイグレーションを適用してください。

```bash
pnpm --filter @clipnote/db db:migrate:remote
```

### デプロイ後：mainブランチの更新

GitHubのデフォルトブランチは`main`で、「現在本番にデプロイされている内容」を表すブランチとして運用する。CIによる自動化はしていないため、`pnpm run deploy`でのデプロイに成功したら、デプロイした人が都度`main`を更新すること。

```bash
git checkout main
git pull origin main
git merge development   # デプロイ元がdevelopment以外のブランチの場合はそのブランチ名に置き換える
git push origin main
```

`main`への直接コミットはせず、必ず`development`（または各機能ブランチ）経由でマージする。

## wrangler.jsonc について

D1の`database_id`は`apps/web`・`apps/content`・`apps/mcp`・`packages/db`で同一のDB（`clipnote-db`）を指しています。スキーマとマイグレーションは`packages/db`が所有し、各アプリは同じDBに対するバインディングのみを持ちます。マイグレーション追加時は`packages/db`側で`db:generate`してから、ローカル・リモート双方に適用してください。

## その他

- Cloudflareの型定義を再生成する場合: `pnpm --filter web cf-typegen`
