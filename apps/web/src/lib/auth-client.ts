import { createAuthClient } from "better-auth/react";

// baseURLは指定しない。better-authはbaseURL未指定時、ブラウザの現在オリジンを
// 自動的に使う（authサーバーとクライアントが同一オリジンのため）。以前は
// NEXT_PUBLIC_BETTER_AUTH_URL（未設定時"http://localhost:3000"にフォールバック）
// を指定していたが、NEXT_PUBLIC_*はビルド時にバンドルへ埋め込まれる値であり、
// 本番ビルド環境にこの変数を設定し忘れるとlocalhost:3000宛にリクエストが飛ぶ
// バグを生んでいた（ログアウト等、認証系エンドポイント全般に影響）。
export const authClient = createAuthClient();
