import { betterAuth } from "better-auth";

// DBアダプタは未接続（packages/dbが存在する後続フェーズで接続する。設計書12-2節）。
// これは設定の形だけを整えるブートストラップであり、実際の認証呼び出しは
// アダプタ接続まで機能しない。
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
});
