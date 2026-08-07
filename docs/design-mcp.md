# Clipnote 設計書：apps/mcp（mcp.clipnote.paritto.dev）

> 最終更新：2026-08-07
> 位置づけ：`docs/design.md`（共通設計書）の詳細版。`apps/mcp`固有の内容（MCPツール定義・APIキー認証・OAuth 2.1認可フロー・OAuth関連データモデル・連携管理画面）を集約する。
> クリップ・コレクションのデータモデル本体は`docs/design-web.md`、コンテンツ配信の隔離モデルは`docs/design-content.md`を参照。

---

## 1. 概要

`mcp.clipnote.paritto.dev`で稼働するMCPサーバー。ClaudeなどのMCP対応クライアントから、Clipnoteのクリップを直接参照・登録・更新できるようにする。認証は**APIキー方式**と**OAuth 2.1方式**（Authorization Code + PKCE + 動的クライアント登録）を併存させる。

- `apps/web`が認可サーバー（Authorization Server）を、`apps/mcp`がリソースサーバー（Resource Server）を兼ねる
- Paritto全体のSSO統合（別リポジトリ`paritto-auth`が担う、エコシステム共通の認可サーバーへの相乗り）とは別軸。今回のMCP用OAuthはClipnote単体で完結する別物であり、混同しないこと

---

## 2. 技術構成

- Honoベースの軽量Worker（`apps/content`と同じ方針。Next.js/Reactランタイムは使わない。単純なリクエスト処理のみのため、バンドルサイズ・コールドスタートを最小化する）
- トランスポート：Streamable HTTP（MCP TypeScript SDKのHTTPトランスポートを利用）
- `packages/db`を通じてD1へアクセスし、既存のクリップ・コレクションのクエリ層・バリデーションロジック・`page_versions`退避ロジックを`apps/web`と共有する
- OAuthアクセストークンの検証には`@better-auth/oauth-provider/resource-client`（`jose`依存のみの軽量なサブパス）を使う。フルの`oauthProvider`本体は認可サーバー側（`apps/web`）にしか置かない。DBへの問い合わせは発生しない（JWKS公開鍵によるローカル署名検証のみ）ため、軽量Worker方針を損なわない

---

## 3. URL・エンドポイント設計

MCPサーバー（`mcp.clipnote.paritto.dev`）はMCPプロトコル（Streamable HTTP）のエンドポイントであり、`docs/design-web.md`のようなブラウザ向けURL設計の対象外。

| パス | 内容 |
| --- | --- |
| `/mcp` | MCPプロトコル本体（Streamable HTTP） |
| `/.well-known/oauth-protected-resource` | Protected Resource Metadata（RFC 9728）。`mcp.clipnote.paritto.dev`側で公開 |

認可サーバー側のエンドポイント（`apps/web`がホスト）：

| パス | 内容 | 認証 |
| --- | --- | --- |
| `/oauth/consent` | OAuth認可時の同意画面（6-3節） | 必須（未ログイン時は`/login`へリダイレクト） |
| `/.well-known/oauth-authorization-server` | OAuth 2.1認可サーバーのメタデータ（RFC 8414） | - |
| `/oauth2/register` | 動的クライアント登録（DCR） | - |
| `/oauth2/authorize` | 認可エンドポイント | - |
| `/oauth2/token` | トークンエンドポイント | - |
| `/api/auth/jwks` | JWKS（署名検証用公開鍵） | - |

---

## 4. 認証設計

MCPサーバーは`apps/web`が用いるセッションCookie・`apps/content`が用いるHMACトークン（`docs/design-content.md`参照）いずれとも異なる認証を用いる。Bearerトークンの形状（`cn_live_`プレフィックスの有無）で、APIキー方式・OAuth方式のいずれかに振り分ける。

- **APIキー方式**：Claude Desktop・Claude Code等、Bearerトークンを直接設定できるクライアント向け。管理画面は5章参照
- **OAuth 2.1方式**：claude.aiのカスタムコネクタ等、OAuthの動的クライアント登録が前提のクライアント向け。`apps/web`が認可サーバーを、`apps/mcp`がリソースサーバーを兼ねる

いずれの方式でも、認証成功時に得られるのは`pages.user_id`と同一のユーザーIDのみであり、以降のクエリ・バリデーション・権限チェックは完全に共通。

### 4-1. APIキー方式

```
① クライアントがリクエストヘッダーに Authorization: Bearer {APIキー} を付与
② サーバー側でキーをハッシュ化し、api_keys.key_hash と照合してuser_idを特定
③ 認証成功時、該当行の last_used_at を更新
④ 認証失敗時はMCPのエラーレスポンスとして返す
```

APIキーのハッシュ照合ロジックは、`apps/web`（管理画面での発行）と`apps/mcp`（検証）の両方から参照するため、`packages/auth`として共有パッケージ化している（「2つ以上のappsから参照されるものだけpackages化する」方針に準拠。`docs/design.md`のモノレポ構成参照）。`api_keys`テーブルの定義は`docs/design-web.md`9章参照。

### 4-2. OAuth 2.1方式

`apps/web`（`clipnote.paritto.dev`）が認可サーバー（Authorization Server）、`apps/mcp`（`mcp.clipnote.paritto.dev`）がリソースサーバー（Resource Server）を兼ねる構成。`better-auth`の`jwt`プラグイン（JWKS発行）と`oauthProvider`プラグイン（`@better-auth/oauth-provider`）を`apps/web`側にのみ追加し、認可コード・トークンの発行とDBテーブル（`oauth_*`、7章）の読み書きはすべて認可サーバー側で完結させる。

```
① クライアント（claude.ai等）がmcp.clipnote.paritto.dev/mcpへ未認証でアクセス
② 401 + WWW-Authenticate: Bearer resource_metadata="https://mcp.clipnote.paritto.dev/.well-known/oauth-protected-resource"
③ クライアントがProtected Resource Metadata（RFC 9728）を取得し、認可サーバーのURL（clipnote.paritto.dev）を知る
④ クライアントがAuthorization Server Metadata（RFC 8414、/.well-known/oauth-authorization-server）を取得
⑤ クライアントが動的クライアント登録（DCR、/oauth2/register）でclient_idを取得
⑥ クライアントがPKCE付きでブラウザを/oauth2/authorizeへ誘導
⑦ 未ログインなら/loginへ、ログイン済みなら/oauth/consent（6-3節）へ
⑧ ユーザーが「許可する」→認可コードを発行し、クライアントのredirect_uriへリダイレクト
⑨ クライアントが/oauth2/tokenへ認可コード＋PKCE検証用コードを送信し、JWTアクセストークン（＋リフレッシュトークン）を取得
⑩ 以降はAuthorization: Bearer {JWT}でmcp.clipnote.paritto.dev/mcpにアクセス
⑪ Resource Server側はJWKS（clipnote.paritto.dev/api/auth/jwks）で署名検証し、aud（リソース識別子）・iss（発行者）を確認してuser_idを特定
```

ClipnoteはこのOAuthに関して単体で完結する認可サーバーであり、別リポジトリ`paritto-auth`が担うParitto全体のSSO統合とは独立している。将来的にエコシステム全体のSSOへ統合する場合は、別途大きな設計変更として扱う。

### 4-3. MCP認証固有のセキュリティ

`docs/design.md`のセキュリティまとめに掲載の横断的な脅威一覧のうち、MCP固有の項目を再掲する。

| 懸念 | 対策 |
| --- | --- |
| MCP経由での不正アクセス | APIキーはハッシュ化して保存、Bearerトークンとして検証、他ユーザーのクリップへのアクセスは権限エラーと未存在エラーを区別せず拒否 |
| OAuthアクセストークンの偽造・改ざん | JWT署名（`jwt`プラグインのJWKS）をResource Server（`apps/mcp`）側でローカル検証。`aud`（リソース識別子）・`iss`（認可サーバー）を必須チェックし、他リソース向けトークンの転用（confused deputy）を防止 |
| 第三者アプリへの過剰な権限付与 | ユーザーの明示的な同意（`/oauth/consent`）を経ないとアクセストークンを発行しない。スコープは`mcp`単一のみ |
| 連携解除後もアクセストークンが使われ続ける | 「連携中のアプリ」画面（6-2節）からの失効操作でリフレッシュトークン・同意記録を削除し、以降の更新を停止。既発行のアクセストークンは短い有効期限（既定1時間）で自然失効させる |

---

## 5. 画面設計：APIキー管理（`apps/web`が実装）

APIキー一覧・新規発行・失効の画面本体は`apps/web`の`/admin/api-keys`に実装される。UIの詳細（一覧表示・発行フロー・失効確認ダイアログ・空状態）は`docs/design-web.md`10章を参照。本セクションでは連携管理の一部としての位置づけのみ記す。

---

## 6. 画面設計：OAuth連携管理（`apps/web`が実装）

APIキー画面同様、実装は`apps/web`の`/admin/api-keys`ページ内・`/oauth/consent`ページに置かれるが、OAuthデータモデル（7章）と密結合のため本ドキュメントにまとめる。

### 6-1. 連携中のアプリ（`/admin/api-keys`内）

claude.ai等、OAuthで認可したアプリの一覧・失効画面。APIキー一覧の下に別セクションとして表示し、新規ページは設けない。連携が1件もない場合はセクションごと非表示にする（APIキーの空状態とは異なり、専用の空状態は設けない）。

**デスクトップ（`md`以上）：テーブル形式**

| 表示列 | 内容 |
| --- | --- |
| アプリ | OAuthクライアント登録時の名前（`oauth_clients.name`） |
| 連携日時 | 初回同意日時（`oauth_consents.created_at`） |
| 操作 | 「失効」ボタン |

**モバイル（`md`未満）：カード形式**

```
┌───────────────────────────────┐
│ Claude                          │
│ 連携: 2026-08-05                 │
│                                 │
│                     [ 失効 ]     │
└───────────────────────────────┘
```

失効時の確認ダイアログ：

```
┌─────────────────────────────────┐
│ 連携を解除しますか？                  │
├─────────────────────────────────┤
│ 「Claude」との連携を解除します。         │
│ 以降このアプリから再度アクセスするには、    │
│ あらためて認可が必要になります。          │
│ この操作は取り消せません。               │
│                                   │
│              [ キャンセル ] [ 解除する ]│
└─────────────────────────────────┘
```

確認ダイアログ必須（`docs/design-web.md`7章の基準に準拠）。実行ボタンは警告色（`destructive`バリアント）。失効操作は`oauth_consents`・`oauth_refresh_tokens`・`oauth_access_tokens`の該当行（ユーザー×クライアント単位）を削除する。既発行のアクセストークン（JWT）はステートレス検証のため即時失効はできず、短い有効期限（既定1時間）による自然失効に委ねる（4-3節）。

### 6-2. 連携失効時のカスケード

| 削除対象 | 影響範囲 |
| --- | --- |
| 連携中のアプリを失効 | 該当ユーザー×クライアントの`oauth_consents`・`oauth_refresh_tokens`・`oauth_access_tokens`行を削除。`oauth_clients`自体は残す |
| ユーザーを削除（想定上） | 所有する`oauth_clients`・`oauth_access_tokens`・`oauth_refresh_tokens`・`oauth_consents`も連動削除（`ON DELETE CASCADE`） |

DB制約としては、`oauth_clients.user_id`・`oauth_access_tokens.user_id`・`oauth_refresh_tokens.user_id`・`oauth_consents.user_id`に`ON DELETE CASCADE`を設定し、アプリケーション側で個別に削除処理を書かずに整合性を保つ。クリップ・コレクション側のカスケードは`docs/design.md`参照。

### 6-3. OAuth同意画面（`/oauth/consent`）

MCPクライアント（claude.ai等）が`/oauth2/authorize`にアクセスすると、未ログインなら`/login`（ログイン後にこの画面へ戻る）、ログイン済みならこの画面へリダイレクトされる。管理画面（`/admin`配下）とは別の、`/login`・`/signup`と同じ認証系レイアウト（`AuthCard`、`docs/design-web.md`3-1節のトンマナ）を用いる。

```
┌─────────────────────────────┐
│         Clipnote               │
├─────────────────────────────┤
│    外部アプリからのアクセス許可      │
│                               │
│           Claude               │
│                               │
│  ・クリップの一覧取得・作成・更新     │
│                               │
│        [ 許可する ]            │
│        [ 拒否する ]            │
└─────────────────────────────┘
```

スコープは`mcp`の1種類のみ（9章参照）のため、権限の内訳表示も固定文言1行のみ。「許可する」で`/oauth2/consent`にaccept:trueを送信し、認可コード付きでクライアントのredirect_uriへ戻る。「拒否する」はaccept:falseを送信し、エラーとしてredirect_uriへ戻る。

---

## 7. データモデル：OAuth関連テーブル

`apps/web`のbetterAuth()インスタンスに追加した`jwt`・`oauthProvider`プラグイン（`@better-auth/oauth-provider`）が管理する5テーブル。フィールド構成・型（`created_at`等がミリ秒精度でNOT NULL制約を持たない点も含む）はプラグインの実装依存のため、手書きではなく`@better-auth/cli generate`が出力したものをそのまま採用している。`apps/mcp`（Resource Server）はこれらのテーブルを直接参照せず、JWKS経由でアクセストークン（JWT）を検証するのみ（4-2節）。

**`jwks`テーブル**：`jwt`プラグインの署名鍵ペア。

| カラム | 型 | 内容 |
| --- | --- | --- |
| id | uuid | PK |
| public_key | text | 公開鍵 |
| private_key | text | 秘密鍵 |
| created_at | timestamp(ms) | |
| expires_at | timestamp(ms) | nullable |

**`oauth_clients`テーブル**：動的クライアント登録（DCR）で登録されたOAuthクライアント（claude.ai等）。

| カラム | 型 | 内容 |
| --- | --- | --- |
| id | uuid | PK |
| client_id | text | クライアントID（unique） |
| client_secret | text | nullable（PKCE必須のpublicクライアントでは未使用） |
| name | text | クライアント名（DCR時に自己申告、「連携中のアプリ」画面で表示） |
| redirect_uris | json (text) | 許可リダイレクトURI一覧 |
| scopes | json (text) | nullable |
| require_pkce | boolean | nullable（publicクライアントは常にPKCE必須） |
| user_id | uuid | FK → users（`ON DELETE CASCADE`）。DCRを実行したユーザー |
| その他 | - | `disabled`・`token_endpoint_auth_method`・`grant_types`・`response_types`・`metadata`等、OAuth/DCR仕様（RFC 7591）準拠のメタデータ列 |

**`oauth_refresh_tokens`テーブル**：リフレッシュトークン。

| カラム | 型 | 内容 |
| --- | --- | --- |
| id | uuid | PK |
| token | text | リフレッシュトークン本体（unique） |
| client_id | text | FK → oauth_clients.client_id（`ON DELETE CASCADE`） |
| user_id | uuid | FK → users（`ON DELETE CASCADE`） |
| expires_at | timestamp(ms) | nullable |
| revoked | timestamp(ms) | nullable。失効日時 |
| scopes | json (text) | |

**`oauth_access_tokens`テーブル**：アクセストークンの発行記録（検証自体はJWT署名で行うため、監査・失効管理用）。

| カラム | 型 | 内容 |
| --- | --- | --- |
| id | uuid | PK |
| token | text | nullable（JWTはステートレス検証のため必須ではない） |
| client_id | text | FK → oauth_clients.client_id（`ON DELETE CASCADE`） |
| user_id | uuid | FK → users（`ON DELETE CASCADE`） |
| refresh_id | uuid | FK → oauth_refresh_tokens.id（`ON DELETE CASCADE`） |
| expires_at | timestamp(ms) | nullable |
| scopes | json (text) | |

**`oauth_consents`テーブル**：ユーザーの同意記録。「連携中のアプリ」画面（6-1節）の一覧はこのテーブルを正とする。

| カラム | 型 | 内容 |
| --- | --- | --- |
| id | uuid | PK |
| client_id | text | FK → oauth_clients.client_id（`ON DELETE CASCADE`） |
| user_id | uuid | FK → users（`ON DELETE CASCADE`） |
| scopes | json (text) | |
| created_at | timestamp(ms) | nullable。初回同意日時（6-1節の「連携日時」表示に使用） |
| updated_at | timestamp(ms) | nullable |

---

## 8. ツール定義

### `list_pages`

- 引数：`query`（タイトル部分一致検索、任意・省略可）
- 返り値：該当ユーザーのクリップ一覧。各項目は`uuid`・`title`・`content_type`・`visibility`・`updated_at`（本文は含めない）

### `get_page`

- 引数：`uuid`（必須）
- 返り値：`uuid`・`title`・`content`（本文）・`content_type`・`visibility`・`updated_at`
- 対象クリップが存在しない、または他ユーザーのものである場合はエラー（存在の有無を区別しないメッセージにし、他ユーザーのクリップの存在を推測されないようにする）

### `upload_page`

- 引数：
  - `content`（必須）
  - `content_type`（`html` / `markdown` / `plaintext`、必須。**v9で`plaintext`を追加**。自動判定はしない）
  - `title`（必須）
  - `visibility`（`private` / `public`、省略時は`private`）
- コレクションへの割当引数は**持たせない**（MVPの範囲外。管理画面から手動で割り当てる運用、`docs/design.md`将来検討参照）
- バリデーション：空文字列・不正UTF-8の拒否、1MB上限チェックを`apps/web`と共通の関数で実施（`docs/design-web.md`5章参照）
- 返り値：`uuid`、公開URL（`https://clipnote.paritto.dev/p/{uuid}`）

### `update_page`

- 引数：`uuid`（必須）、`content`（必須、全文差し替え）
- 内部処理：更新前の本文を`page_versions`へ退避してから`pages.content`を更新（`docs/design-web.md`6-4節・9章の`page_versions`運用方針と同じロジックを共有関数として再利用する）
- バリデーションは`upload_page`と共通
- 対象クリップが他ユーザーのものである場合はエラー
- 返り値：`uuid`、公開URL

---

## 9. エラーハンドリング

| ケース | 扱い |
| --- | --- |
| APIキー無効・失効済み | 認証エラーとして返す |
| 対象クリップが存在しない／他ユーザー所有 | 権限エラーと未存在エラーを区別しないメッセージ |
| 本文サイズ超過 | 上限バイト数と現在のバイト数を含めたエラーメッセージ |
| 空文字列・不正UTF-8 | バリデーションエラーメッセージ |

---

## 10. スコープ外（次フェーズ以降）

- クリップの削除、コレクションの作成・編集・クリップの追加操作（現状はupload/update/list/getのみ）
- APIキーのスコープ分け（read/write）
- OAuthのスコープ細分化（read/write等）。現状は`mcp`スコープ1種類のみ

---

## 11. モノレポ内の位置づけ

- `apps/mcp`：本ドキュメントが扱うMCPサーバー（`apps/content`と同じ理由でHonoベースの軽量構成）
- `packages/auth`：APIキーのハッシュ生成・照合ロジック。`apps/web`（発行時のハッシュ生成）と`apps/mcp`（検証時のハッシュ照合）の両方が同じロジックを持つ必要があるため共有パッケージ化する
- `packages/db`：D1スキーマ定義・マイグレーション。`apps/mcp`はクリップ・コレクション・OAuth関連テーブルへの読み書きに利用
