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

`apps/content`・`apps/mcp`は`wrangler deploy`（esbuildによるトランスパイルのみ）で型検査をしないため、変更時は個別に`tsc --noEmit`を回すこと。

```bash
pnpm --filter content exec tsc --noEmit -p tsconfig.json
pnpm --filter mcp exec tsc --noEmit -p tsconfig.json
```

### CI / CD

`.github/workflows/ci.yml`は2つのジョブで構成する。

| ジョブ | トリガー | 内容 |
| --- | --- | --- |
| `verify` | `development`・`main`へのpush、および全Pull Request | lint・build（型検査兼）・`apps/content`/`apps/mcp`の`tsc --noEmit`・`packages/db`のテスト |
| `deploy` | `main`へのpush（かつ`verify`が成功した場合のみ） | リモートD1マイグレーション適用（`db:migrate:remote`）→`pnpm run deploy`（web・content・mcpを本番デプロイ） |

`main`は「現在本番にデプロイされている内容」を表すブランチという位置づけ（本書冒頭）のため、`development`を`main`にマージしてpushすると、そのまま自動で本番デプロイまで実行される。**本番への自動適用**であることに留意し、`main`への直接pushは避け、必ず`development`側でCIを通してからマージすること。

#### 事前準備（初回のみ）

`deploy`ジョブは以下のリポジトリシークレットを使用する。**GitHubリポジトリの Settings → Secrets and variables → Actions で手動追加する必要がある**（このリポジトリはpublicのため、シークレットが未設定のままだと`deploy`ジョブは認証エラーで失敗するだけで、値が漏れることはない）。

| シークレット名 | 値 |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Workers Scripts編集・D1編集権限を持つCloudflare APIトークン（本書「本番環境のシークレット投入」で使うものと同じ権限で発行できる） |

Cloudflareアカウント ID（`55b4467be01cbb1f5104758b2a728da9`）は秘匿情報ではないため`ci.yml`に直書きしている。

デプロイ前に人の承認を挟みたくなった場合は、GitHubリポジトリの Settings → Environments で`production`という名前のEnvironmentを作成し、Required reviewersを設定すればよい（`ci.yml`の`deploy`ジョブは`environment: production`を指定済みのため、ワークフロー側の変更は不要）。

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

## D1のバックアップ・復旧

D1データベース（`clipnote-db`）は利用者のアカウント情報・クリップ本文を保持する唯一のデータストアであり、消失・破損時の復旧手段を2段構えで用意する。

### 1. Time Travel（自動・平常時の主な復旧手段）

D1は追加設定なしで直近の変更履歴を保持しており、特定時点の状態を確認・復元できる（[Cloudflare公式ドキュメント](https://developers.cloudflare.com/d1/reference/time-travel/)記載の保持期間内）。誤ったマイグレーション適用・アプリ側の不具合によるデータ破損など、通常の障害対応はまずこちらを使う。

```bash
# 現在のbookmark（復元ポイントの識別子）を確認
npx wrangler d1 time-travel info clipnote-db --remote

# 特定時刻（UTC）に復元
npx wrangler d1 time-travel restore clipnote-db --remote --timestamp="2026-08-01T00:00:00Z"

# 特定bookmarkに復元
npx wrangler d1 time-travel restore clipnote-db --remote --bookmark=<bookmark>
```

復元はデータベース全体を対象時点の状態に**上書き**する（復元後に発生した変更は失われる）ため、実行前に対象時点で問題ないか`time-travel info`で確認すること。

### 2. 手動エクスポート（Cloudflareアカウント自体の障害・誤操作に備えたオフプラットフォームの控え）

Time Travelはあくまで同一Cloudflareアカウント内の機能のため、アカウント誤操作・契約解除等に備えて、これとは別に定期的な手動エクスポートを推奨する。頻度の目安は月1回程度、または大きめのマイグレーションを本番適用する直前。

```bash
npx wrangler d1 export clipnote-db --remote --output=clipnote-db-$(date +%Y%m%d).sql
```

**出力ファイルには利用者のクリップ本文・メールアドレス等がそのまま含まれる。** Gitリポジトリやパブリックな場所には絶対に置かず、暗号化した上でパスワードマネージャーの添付ファイルやプライベートなストレージ等、機密情報を扱える手段で保管する。不要になった古い世代のバックアップは削除する。

復元時は、対象クリップノートDB（別のD1インスタンス、または`--local`のローカルSQLite）に対してエクスポートしたSQLを流し込む。

```bash
npx wrangler d1 execute clipnote-db --remote --file=clipnote-db-20260801.sql
```

## wrangler.jsonc について

D1の`database_id`は`apps/web`・`apps/content`・`apps/mcp`・`packages/db`で同一のDB（`clipnote-db`）を指しています。スキーマとマイグレーションは`packages/db`が所有し、各アプリは同じDBに対するバインディングのみを持ちます。マイグレーション追加時は`packages/db`側で`db:generate`してから、ローカル・リモート双方に適用してください。

## 公開コンテンツの通報対応

Clipnoteは投稿されたHTML/Markdownを無害化（サニタイズ）しない設計（要件定義書4章）のため、公開設定にされたクリップ・コレクションが違法・権利侵害・フィッシング等に悪用される可能性がある。管理画面には運営（サイト管理者）向けの強制非公開化・削除UIは無い（各利用者は自分のクリップのみ操作可能）ため、通報を受けた場合は以下の手順でD1に対して直接操作する。

1. `/p/[uuid]`・`/c/[uuid]`フッターの「このコンテンツの問題を報告する」リンク、または`/contact`経由で通報を受け付ける（`CONTACT_EMAIL_TO`宛にメールが届く）
2. 通報されたURLからuuidを特定する
3. 内容を確認し、規約違反（利用規約第4条）と判断した場合、対象を非公開化する

   ```bash
   # クリップの場合
   npx wrangler d1 execute clipnote-db --remote \
     --command "UPDATE pages SET visibility = 'private' WHERE id = '<uuid>'"

   # コレクションの場合
   npx wrangler d1 execute clipnote-db --remote \
     --command "UPDATE collections SET visibility = 'private' WHERE id = '<uuid>'"
   ```

   非公開化ではなくクリップ自体の削除が必要な場合（フィッシング等、悪意が明白なケース）は`pages`から該当行を削除する（`page_versions`・所属コレクションとの関連付けはON DELETE CASCADEで連動削除される。design.md4章参照）。

   ```bash
   npx wrangler d1 execute clipnote-db --remote \
     --command "DELETE FROM pages WHERE id = '<uuid>'"
   ```

4. 悪質なアカウントについては、繰り返しの違反があれば当該`users`行の削除も検討する（関連するクリップ・APIキー・OAuth連携もカスケード削除される）
5. 通報者に対応結果を任意で返信する（`/contact`送信時に入力されたメールアドレス宛）

このフローは応急対応であり、利用者が増えてきた段階では管理画面上に運営向けの強制非公開化UIを設けることを検討する（本書スコープ外）。

## 本番環境のシークレット投入

`apps/web`が使うシークレット（`BETTER_AUTH_SECRET`・`CONTENT_TOKEN_SECRET`）は`wrangler.jsonc`の`vars`には書かず、Cloudflare側に`wrangler secret put`で個別に投入する。**本番デプロイ前に一度だけ必要な作業**で、`.env.local`・`.dev.vars`のセットアップ（前述）とは別物。

```bash
# apps/webディレクトリで実行
npx wrangler secret put BETTER_AUTH_SECRET
npx wrangler secret put CONTENT_TOKEN_SECRET

# apps/contentディレクトリで実行（apps/webと同じ値を使うこと。設計書4-4節）
npx wrangler secret put CONTENT_TOKEN_SECRET
```

`apps/mcp`は追加のシークレットを必要としない（development.md冒頭参照）。

値は`openssl rand -hex 32`等で生成したランダム文字列を使う。`CONTACT_EMAIL_TO`はメールアドレスであり機密情報ではないため、`wrangler.jsonc`の`vars`にそのままコミットしている。

### ローテーション方針

| シークレット | ローテーションの影響 | 方針 |
| --- | --- | --- |
| `CONTENT_TOKEN_SECRET` | ローテーション直後、更新前に発行済みの短命トークン（有効期限2分）のみ検証エラーになる。iframeは90秒間隔で自動更新するため、通常は次回更新時に新トークンへ切り替わり、利用者影響はごく短時間に限られる | 漏洩が疑われる場合は速やかにローテーションする（apps/web・apps/content両方を同時に、同じ値で） |
| `BETTER_AUTH_SECRET` | ローテーションすると、既存のセッションCookieの署名検証が無効になり全利用者が強制ログアウトされる。JWKS（`jwks`テーブル）の秘密鍵はこの値で暗号化して保存されているため復号できなくなり、OAuth 2.1（MCP連携）のアクセストークン発行・検証もやり直しが必要になる。APIキー方式のMCP認証（`api_keys`テーブル、独自ハッシュ）はこの値に依存しないため影響を受けない | 漏洩が疑われる場合のみ実施する。トラフィックの少ない時間帯に行い、事前に告知する |

## その他

- Cloudflareの型定義を再生成する場合: `pnpm --filter web cf-typegen`
