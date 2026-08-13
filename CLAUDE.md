# CLAUDE.md（プロジェクトルートに配置）

## プロジェクト概要
Clipnote: AIとのやり取りで生成したHTML/Markdown/プレーンテキストを保存・公開管理するツール

## 必読ドキュメント
- 要件定義: docs/requirements.md
- 詳細設計（共通）: docs/design.md
- 詳細設計（apps/web）: docs/design-web.md
- 詳細設計（apps/content）: docs/design-content.md
- 詳細設計（apps/mcp）: docs/design-mcp.md
実装前に必ずdocs/design.mdと対象アプリの詳細設計書を確認すること。特にセキュリティ設計（docs/design.md5章、および各詳細設計書のセキュリティ関連章）は絶対に省略しない。

## 技術スタック
- Next.js (App Router) + TypeScript
- Cloudflare Worker (@opennextjs/cloudflare) + D1
- shadcn/ui + Tailwind CSS（管理画面）
- better-auth（メール/パスワード）

## 規約
- DB内部名は`pages`のまま。UI表示名は「クリップ」を使う（docs/design.md 1章）
- 新規作成・編集は専用ページではなくダイアログで実装する（docs/design-web.md 6章・8章）
