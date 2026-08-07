# Clipnote 設計書（共通）

> 最終更新：2026-08-07（v15）
> 対象：要件定義書 v9 の詳細設計のうち、複数アプリ（`apps/web` / `apps/content` / `apps/mcp`）に共通する内容（用語整理／ドメイン構成／データモデル索引／削除カスケード／セキュリティまとめ／将来検討／モノレポ構成）
> v15での変更点：
> - 対応コンテンツ形式にプレーンテキストを追加（要件定義書v9・1章）。`pages`/`page_versions`の`content_type`にDB制約レベルで`plaintext`を追加した（詳細は`docs/design-web.md`9章）
> v14での変更点：
> - アプリ単位で詳細設計書を分割。`apps/web`固有の内容（URL・UI方針・バリデーション・画面設計・アカウント管理・APIキー管理画面・データモデルの大半）は`docs/design-web.md`へ、`apps/content`固有の内容（コンテンツ配信・iframe隔離の実装詳細・トークン検証）は`docs/design-content.md`へ、`apps/mcp`固有の内容（MCPツール定義・OAuth 2.1認可フロー・OAuth関連データモデル・連携管理画面）は`docs/design-mcp.md`へ移動した。本書はそれらに共通する内容と、各書への索引のみを残す
>
> 旧v13までの変更履歴（機能追加の経緯）は各詳細設計書の冒頭に記載している。

---

## 0. ドキュメント構成

実装前に必ず本書と、対象アプリの詳細設計書を確認すること。特にセキュリティ設計は絶対に省略しない。

| ドキュメント | 内容 |
| --- | --- |
| `docs/design.md`（本書） | 用語整理・ドメイン構成・データモデル索引・削除カスケード・セキュリティまとめ・将来検討・モノレポ構成 |
| `docs/design-web.md` | `apps/web`（管理画面・LP・公開ページ外枠）：URL設計・UI方針・バリデーション・クリップ／コレクション管理画面・APIキー管理画面・アカウント設定・データモデル（`pages`等） |
| `docs/design-content.md` | `apps/content`（コンテンツ配信）：XSS隔離モデル・Hostヘッダー検証・トークン検証フロー |
| `docs/design-mcp.md` | `apps/mcp`（MCPサーバー）：ツール定義・APIキー／OAuth 2.1認証フロー・連携管理画面・OAuthデータモデル |

---

## 1. 用語整理

「コンテンツ／ページ／クリップ」の呼称が曖昧なため、ユーザー向け表示名と内部名を分離して整理する。

| 概念 | DB／コード内部名（変更なし） | ユーザー向け表示名 |
| --- | --- | --- |
| 個別のHTML/Markdown/プレーンテキスト文書 | `pages` | **クリップ**（Clip） |
| 複数クリップの束 | `collections` | **コレクション** |
| 中間テーブル | `collection_pages` | （UI上には露出しない） |
| MCP連携用の鍵 | `api_keys` | **APIキー** |

- DB・URL（`pages` / `/p/`）は変更しない。UUIDベースで意味を持たないパスのため、表示名変更の影響を受けない。
- UI文言のみ「ページ」→「クリップ」に統一する。

---

## 2. ドメイン構成

| 用途 | ドメイン | 詳細設計書 |
| --- | --- | --- |
| Web本体（管理画面／公開ページ外枠／LP） | `clipnote.paritto.dev` | `docs/design-web.md` |
| コンテンツ配信（iframe内） | `content.clipnote.paritto.dev` | `docs/design-content.md` |
| MCPサーバー | `mcp.clipnote.paritto.dev` | `docs/design-mcp.md` |

親ドメイン`paritto.dev`を共有するため、Cookieスコープの扱い（`apps/web`のセッションCookieを`clipnote.paritto.dev`単体にスコープする）に注意が必要。詳細は`docs/design-web.md`4-3節参照。

---

## 3. データモデル索引

DBスキーマ本体（`packages/db`）は全アプリ共有だが、テーブルごとに発行・更新の主体となるアプリが異なる。詳細な列定義は各詳細設計書を参照。

| テーブル | 発行・更新の主体 | 定義の掲載先 |
| --- | --- | --- |
| `users`（better-auth管理） | `apps/web` | `docs/design-web.md`9章 |
| `pages` | `apps/web`（`apps/mcp`からも書き込みあり） | `docs/design-web.md`9章 |
| `collections` | `apps/web` | `docs/design-web.md`9章 |
| `collection_pages` | `apps/web` | `docs/design-web.md`9章 |
| `page_versions` | `apps/web`（`apps/mcp`からも書き込みあり） | `docs/design-web.md`9章 |
| `api_keys` | `apps/web`（発行）／`apps/mcp`（検証） | `docs/design-web.md`9章 |
| `jwks` | `apps/web`（OAuth認可サーバー） | `docs/design-mcp.md`7章 |
| `oauth_clients` | `apps/web`（OAuth認可サーバー） | `docs/design-mcp.md`7章 |
| `oauth_refresh_tokens` | `apps/web`（OAuth認可サーバー） | `docs/design-mcp.md`7章 |
| `oauth_access_tokens` | `apps/web`（OAuth認可サーバー） | `docs/design-mcp.md`7章 |
| `oauth_consents` | `apps/web`（OAuth認可サーバー） | `docs/design-mcp.md`7章 |

`apps/content`はいずれのテーブルも`pages`の読み取り以外は行わない（`docs/design-content.md`5章参照）。

### 将来追加予定のテーブル（本書のスコープ外）

| テーブル | 追加タイミング |
| --- | --- |
| `tags` / `page_tags` | タグ機能の実装時（MVP対象外） |

---

## 4. 削除時のカスケード挙動

| 削除対象 | 影響範囲 |
| --- | --- |
| クリップを削除 | `page_versions`（履歴）も連動削除。所属していた全コレクションの`collection_pages`からも自動的に外れる（コレクション自体は残る） |
| コレクションを削除 | `collection_pages`の関連付けのみ削除。**所属していたクリップ自体は削除されない** |
| ユーザーを削除（想定上） | 所有する`pages`・`collections`・`api_keys`・`oauth_clients`・`oauth_access_tokens`・`oauth_refresh_tokens`・`oauth_consents`も連動削除（`ON DELETE CASCADE`） |
| 連携中のアプリを失効（`docs/design-mcp.md`6章参照） | 該当ユーザー×クライアントの`oauth_consents`・`oauth_refresh_tokens`・`oauth_access_tokens`行を削除。`oauth_clients`自体は残す |

DB制約としては、`collection_pages.page_id`・`collection_pages.collection_id`・`page_versions.page_id`・`api_keys.user_id`・`oauth_clients.user_id`・`oauth_access_tokens.user_id`・`oauth_refresh_tokens.user_id`・`oauth_consents.user_id`に`ON DELETE CASCADE`を設定し、アプリケーション側で個別に削除処理を書かずに整合性を保つ。

コレクション削除時の確認ダイアログには「所属していたクリップ自体は削除されません」という文言を明記し、誤解を防ぐ（確認ダイアログの基準は`docs/design-web.md`7章参照）。

---

## 5. セキュリティまとめ（横断表）

各項目の実装詳細は担当アプリの詳細設計書を参照。

| 懸念 | 対策 | 詳細 |
| --- | --- | --- |
| XSS（悪意あるHTMLのスクリプト実行） | iframe別ドメインサーブで親のCookie/Storageを隔離（本文自体の無害化は行わない） | `docs/design-content.md`2章 |
| iframe srcの書き換え | Hostヘッダー検証でブロック | `docs/design-content.md`3章 |
| 別ドメインでの認証 | HMAC-SHA256署名付き短命トークン（DBアクセスなしで検証） | `docs/design-web.md`4-4節・`docs/design-content.md`4章 |
| 親ドメイン共有によるCookie漏出リスク | セッションCookieの`Domain`属性をホスト単体にスコープ | `docs/design-web.md`4-3節 |
| UUIDが漏れても非公開クリップを閲覧できる | トークンなしアクセスを拒否 | `docs/design-content.md`4章 |
| トークンの流用 | トークン内のUUIDと対象クリップのUUIDを一致確認 | `docs/design-content.md`4-1節 |
| 公開コレクション経由で非公開クリップの存在が露見する | 一覧そのものから除外（存在の痕跡を残さない） | `docs/design-web.md`4-5節 |
| 公開コレクション経由で非公開クリップの存在がOGP等から露見する | privateなコンテンツの固有情報をOGPに出力しない | `docs/design-web.md`4-6節 |
| 長時間閲覧時のトークン失効 | iframeの定期的な自動更新 | `docs/design-web.md`4-4節 |
| MCP経由での不正アクセス | APIキーはハッシュ化して保存、Bearerトークンとして検証、他ユーザーのクリップへのアクセスは権限エラーと未存在エラーを区別せず拒否 | `docs/design-mcp.md`4-1節・4-3節 |
| OAuthアクセストークンの偽造・改ざん | JWT署名（`jwt`プラグインのJWKS）をResource Server（`apps/mcp`）側でローカル検証。`aud`（リソース識別子）・`iss`（認可サーバー）を必須チェックし、他リソース向けトークンの転用（confused deputy）を防止 | `docs/design-mcp.md`4-2節・4-3節 |
| 第三者アプリへの過剰な権限付与 | ユーザーの明示的な同意（`/oauth/consent`）を経ないとアクセストークンを発行しない。スコープは`mcp`単一のみ | `docs/design-mcp.md`4-3節・6-3節 |
| 連携解除後もアクセストークンが使われ続ける | 「連携中のアプリ」画面からの失効操作でリフレッシュトークン・同意記録を削除し、以降の更新を停止。既発行のアクセストークンは短い有効期限（既定1時間）で自然失効させる | `docs/design-mcp.md`4-3節・6-1節 |
| パスワードリセットによるメールアドレス列挙 | `/forgot-password`は登録有無に関わらず同一の成功メッセージを返す。トークンはbetter-authが`verifications`テーブルで単回使用・有効期限付きで管理 | `docs/design-web.md`11-1節 |
| メール確認・リセットトークンの悪用 | いずれもbetter-authのコア機能が生成する単回使用・短命トークンで、独自実装は行わない | `docs/design-web.md`11-2節 |
| メール送信基盤（ドメイン）未有効化時の情報漏洩 | 開発環境・未有効化時はコンソールログへのフォールバックのみで、外部への誤送信は発生しない設計 | `docs/design-web.md`11-4節 |

---

## 6. 将来検討（本書スコープ外）

- クリップ内容のインライン編集機能（エディタ＋ライブプレビュー）。ダウンロード機能によって代替する。将来追加する場合も`page_versions`テーブルはそのまま活用できる
- 一覧アイテムのサムネイル／プレビュー画像表示（Cloudflare Browser Rendering等によるスクリーンショット生成が必要）。実装後はOGP画像にも動的に反映する
- タグ機能
- ページ単位のパスワード保護・リンク共有
- APIキーのスコープ分け（read/write等）。現状は全キー同一権限
- OAuthのスコープ細分化（read/write等）。現状は`mcp`スコープ1種類のみ
- MCP経由でのクリップ削除・コレクション操作（現状はupload/update/list/getのみ）
- Paritto全体のSSO統合（別リポジトリ`paritto-auth`が担う、エコシステム共通の認可サーバーへの相乗り）。今回追加したMCP用OAuthはClipnote単体で完結する別物であり、混同しないこと

---

## 7. モノレポ構成

`apps/`（デプロイされる実行単位）と`packages/`（共有ライブラリ）を分ける構成とする。

```
clipnote/
├── apps/
│   ├── web/               # メイン Next.js アプリ（clipnote.paritto.dev）
│   ├── content/            # コンテンツ配信 Worker（content.clipnote.paritto.dev）
│   └── mcp/                # MCPサーバー Worker（mcp.clipnote.paritto.dev）
├── packages/
│   ├── db/                  # D1スキーマ・マイグレーション・クエリ層
│   ├── content-token/        # HMAC署名・検証ロジック（web/contentで共有）
│   └── auth/                 # APIキーのハッシュ生成・照合ロジック（web/mcpで共有）
├── docs/
│   ├── requirements.md
│   ├── design.md
│   ├── design-web.md
│   ├── design-content.md
│   └── design-mcp.md
├── package.json
└── pnpm-workspace.yaml
```

### 7-1. `apps/`の内訳

| フォルダ | 収める内容 | 理由 | 詳細設計書 |
| --- | --- | --- | --- |
| `apps/web` | 管理画面（クリップ・コレクション・APIキー管理）・LP・`/p/` `/c/`の外枠（Next.js全体） | ドメイン設計（2章）と1対1対応させる | `docs/design-web.md` |
| `apps/content` | コンテンツ配信専用の軽量Worker（Next.jsではなくHono等の軽量ルーターを使用） | トークン検証はステートレスだが、コンテンツ本体の取得にはD1読み取りアクセスが必要。Next.js/Reactランタイムのオーバーヘッドを避け、バンドルサイズ・コールドスタートを最小化する。Markdown→HTML変換（unified/remark/rehype）もこのWorker内で行う | `docs/design-content.md` |
| `apps/mcp` | MCPサーバー | `apps/content`と同じ理由でHonoベースの軽量構成にする | `docs/design-mcp.md` |

### 7-2. `packages/`の内訳と切り出し方針

「2つ以上の`apps`から参照されるもの」だけを`packages/`に切り出す方針とし、過剰分割にならないようにする。

| パッケージ | 収める内容 | 理由 |
| --- | --- | --- |
| `packages/db` | D1スキーマ定義・マイグレーション | `web`・`content`・`mcp`のすべてがD1への読み取り・書き込みを行うため共有パッケージ化する |
| `packages/content-token` | HMAC-SHA256のトークン生成・検証ロジック | `web`（生成）と`content`（検証）の両方が同じロジックを持つ必要がある。2箇所に別々実装すると片方だけ仕様変更が漏れる事故に繋がるため、必ず共有パッケージとして切り出す |
| `packages/auth` | APIキーのハッシュ生成・照合ロジック | `web`（発行時のハッシュ生成）と`mcp`（検証時のハッシュ照合）の両方が同じロジックを持つ必要がある。`content-token`と同じ理由で共有パッケージ化する |

shadcn/uiのコンポーネント等、現時点で`web`のみが使うものは`apps/web`内に置き、無理に`packages/ui`のような形で切り出さない。

### 7-3. ツール構成

`pnpm workspaces` + `turborepo`の組み合わせを推奨する。`turbo.json`でapp単位のビルド・デプロイタスクを分離できるため、「`mcp`だけ再デプロイする」といった単位でのタスク実行に対応しやすい。

---

## 8. 関連ドキュメント

- Clipnote要件定義 v8：本書が詳細設計を担当する上位ドキュメント
- `docs/design-web.md` / `docs/design-content.md` / `docs/design-mcp.md`：アプリ単位の詳細設計書（0章参照）
