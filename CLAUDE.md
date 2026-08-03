# CLAUDE.md（プロジェクトルートに配置）

## プロジェクト概要
Clipnote: AI生成のHTML/Markdownを保存・公開管理するツール

## 必読ドキュメント
- 要件定義: docs/requirements.md
- 詳細設計: docs/design.md
実装前に必ずこの2つを確認すること。特にセキュリティ設計（設計書4章）は絶対に省略しない。

## 技術スタック
- Next.js (App Router) + TypeScript
- Cloudflare Worker (@opennextjs/cloudflare) + D1
- shadcn/ui + Tailwind CSS（管理画面）
- better-auth（メール/パスワード）

## 規約
- DB内部名は`pages`のまま。UI表示名は「クリップ」を使う（設計書0章）
- 新規作成・編集は専用ページではなくダイアログで実装する（設計書6章・7章）
