# Clipnote 設計書：apps/content（content.clipnote.paritto.dev）

> 最終更新：2026-08-16
> v3での変更点：Markdownのfront matterの値を、本文冒頭のメタデータ欄として表示するようにした（4章）。`title`キーは`pages.title`として既に別枠（`PublicHeader`等）で表示されているため重複を避けて除外し、それ以外のキー・値をキー名そのままで一覧表示する
> v2での変更点：Markdown→HTML変換パイプラインに`remark-frontmatter`を追加し、本文先頭のYAML front matterブロックをレンダリング結果から除外するようにした（4章）。タイトルとしての読み取りは`apps/web`側（貼り付け時点）のみで行い、`apps/content`側では読み取り・利用は行わない（`docs/design-web.md`5-4節参照）
> 位置づけ：`docs/design.md`（共通設計書）の詳細版。`apps/content`固有の内容（コンテンツ配信・XSS隔離モデル・トークン検証）を集約する。
> トークン生成側（`apps/web`）の実装は`docs/design-web.md`、共通の脅威一覧は`docs/design.md`のセキュリティまとめを参照。

---

## 1. 役割

`apps/content`は、クリップ本文（HTML/Markdown/プレーンテキスト、**v9でプレーンテキストを追加**）をiframe内で配信する専用の軽量Worker。`apps/web`のようなNext.js/Reactランタイムは使わず、単純なリクエスト処理のみに特化する。

- ユーザー生成コンテンツ（AI生成のHTML/Markdown、あるいは会話ログ・メモ書きなどのプレーンテキスト）の配信のみを担当し、認証UI・管理画面を一切持たない
- セッションCookieによるユーザー認証フローを持たないステートレスな設計（ユーザーテーブルへの問い合わせやセッション検証は不要）
- Markdown→HTML変換（unified/remark/rehype）もこのWorker内で行う。プレーンテキストはunifiedパイプラインを使わず、HTML特殊文字のエスケープのみで表示する（4-1節参照）

---

## 2. XSS対策：別ドメインiframeによるコンテンツ配信

```
[本オリジン] clipnote.paritto.dev/p/[uuid]（apps/web）
  └─ <iframe src="https://content.clipnote.paritto.dev/[uuid]?t=xxx"
             sandbox="allow-scripts allow-popups allow-modals allow-popups-to-escape-sandbox">
```

> **重要**：この隔離モデルにより、クリップ本文（HTML）に対してスクリプト等の無害化（サニタイズ）処理は行わない。本文中に`<script>`タグや任意のJSが含まれていても、実行コンテキストが親オリジンから完全に分離されているため許容する設計とする。この方針はMCP経由（`upload_page`/`update_page`、`docs/design-mcp.md`参照）で登録されたコンテンツにも同様に適用する。

`iframe`タグ自体（`sandbox`属性含む）は`apps/web`側が生成する（`docs/design-web.md`4-1節・4-2節参照）。`apps/content`は、その`iframe`から呼び出されるコンテンツ本体を配信する側の実装として、以下の隔離モデルの上で成立している。

### 2-1. sandbox属性が意味する制約（`apps/content`が受け取る制約）

`apps/content`が配信するHTMLは、次の`sandbox`属性のもとで実行される（属性自体の設定は`apps/web`側）。

| フラグ | 採用 | 理由 |
| --- | --- | --- |
| `allow-scripts` | ○ | Mermaid等のスクリプト実行に必須 |
| `allow-popups` | ○ | 文書内の外部リンクを新規タブで開く |
| `allow-modals` | ○ | ライブラリ初期化エラー表示等、害は小さい |
| `allow-popups-to-escape-sandbox` | ○ | ポップアップで開いた先に制限を継承させない |
| `allow-same-origin` | ✕（付けない） | Cookie/Storage窃取を防ぐセキュリティの核。`apps/content`はこの属性が付かない前提でCookie/Storageを一切使わない設計にできる |
| `allow-forms` | ✕ | 文書中心の用途では不要 |
| `allow-top-navigation`系 | ✕ | フィッシング対策として付けない |

---

## 3. Hostヘッダー検証

コンテンツ配信エンドポイントで`Host`ヘッダーを検証し、コンテンツ配信ドメイン（`content.clipnote.paritto.dev`）以外からのアクセスを拒否する。これにより、iframeの`src`が別ドメインに書き換えられて`apps/content`が意図しないオリジンから呼び出されるケースを防ぐ。

---

## 4. 認証：署名付き短命トークン（HMAC-SHA256）の検証

`apps/web`が発行した署名付き短命トークン（有効期限：2分）を`apps/content`側で検証する。トークン生成側の詳細（発行フロー・自動更新UI）は`docs/design-web.md`4-4節を参照。

トークンの構造：

```
payload = "{userId}:{uuid}:{exp}"
sig     = HMAC-SHA256(payload, CONTENT_TOKEN_SECRET)
token   = base64url("{payload}:{sig}")
```

`CONTENT_TOKEN_SECRET`は`apps/web`・`apps/content`共通の環境変数。生成・検証ロジックは`packages/content-token`として両アプリから参照する共有パッケージにする。

### 4-1. `apps/content`側の処理フロー

```
① Hostヘッダー検証（コンテンツ配信ドメイン以外からのアクセスを拒否）
② HMACトークンの検証（署名の正当性・有効期限・UUID一致確認）
   ← ここはHMAC計算のみで完結し、DBアクセスは不要
③ D1からUUIDで該当するpages行を1件取得
   ← ここはD1への読み取りアクセスが必要（トークン検証とは独立した処理）
④ content_typeに応じて出力：
   - html：pages.contentをそのままレスポンス（Content-Type: text/html）
   - markdown：unified/remark/rehypeでHTMLに変換してからレスポンス。
     本文先頭にYAML front matter（`---`区切り）がある場合、
     `remark-frontmatter`でmdastノードとして切り出し、本文（Markdown
     由来のHTML）からは除外する（**v2で追加**。front matterはメタデータ
     であり本文ではないため、素通しで水平線＋テキストとして表示されて
     しまう不具合を防ぐ）。切り出したYAMLは別途`yaml`パッケージで
     パースし、`title`キーを除く各キー・値を本文冒頭の`<dl class=
     "frontmatter">`（キー名と値を並べただけの簡易なメタデータ欄。
     値の意味解釈やMarkdown/HTMLとしてのレンダリングはせず、常に
     プレーンテキストとしてHTMLエスケープして表示する）として表示する
     （**v3で追加**）。パースに失敗した場合・トップレベルがオブジェクト
     でない場合・表示可能なキーが1つもない場合は何も表示せず、本文の
     レンダリング自体は継続する。値が配列（スカラーのみ）の場合は
     読点区切りで表示し、ネストしたオブジェクト・配列はJSON文字列として
     表示する（構造の解釈はしない）
   - plaintext（v9で追加）：構文はいっさい解釈せず、HTML特殊文字（`&` `<` `>`）
     のみエスケープしたうえで、改行・空白を保持する`<pre>`要素に埋め込んで
     レスポンス（`white-space: pre-wrap`で折り返す）
⑤ 本文の無害化（サニタイズ）は行わない（2章の方針の通り）。plaintextの
   エスケープは「文字として正しく表示するため」の処理であり、危険な
   コンテンツの除去を目的とするサニタイズとは異なる（構文を解釈しない
   ためそもそも実行される余地がない）
```

UUID一致確認（②）により他クリップのトークン流用を防止する。トークンの正当性検証（①②）はDBアクセス不要でHMAC計算のみのため、不正リクエストを早期に安価に弾ける設計になっている。

---

## 5. データモデル：`pages`テーブルの参照

`apps/content`は`pages`テーブルを読み取り専用で参照する（③の`content_type`に応じた出力判定に使用）。テーブル定義自体は`apps/web`が発行・更新の主体であり、`docs/design-web.md`9章を参照。`apps/content`側でこのテーブルへの書き込みは行わない。

---

## 6. モノレポ内の位置づけ

- `apps/content`：本ドキュメントが扱うコンテンツ配信専用Worker（Honoベース、`docs/design.md`のモノレポ構成参照）
- `packages/content-token`：HMAC-SHA256のトークン生成・検証ロジック（4章の`payload`構造）。`apps/web`（生成）と`apps/content`（検証）の両方が同じロジックを持つ必要があるため共有パッケージとして切り出す。2箇所に別々実装すると片方だけ仕様変更が漏れる事故に繋がるため必須
- `packages/db`：D1スキーマ定義・マイグレーション。`apps/content`は`pages`テーブルの読み取りのみに利用
