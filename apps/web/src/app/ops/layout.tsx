import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { verifyOpsAccess } from "@/lib/ops-auth";

// `/ops`はユーザー向け`/admin`とは別系統の、運営者専用の内部管理画面。
// better-authのセッションは一切使わず、Cloudflare Accessが検証したJWTの
// みを認可根拠にする（詳細は@/lib/ops-auth.ts）。未認可の場合は`/ops`の
// 存在自体を明かさないためnotFound()（404）にする。
//
// /adminと同様、セッション（この場合はAccessの認可結果）に依存する内容を
// 静的にプリレンダリングしないためforce-dynamicにする。
export const dynamic = "force-dynamic";

export default async function OpsLayout({ children }: { children: React.ReactNode }) {
  const authorized = await verifyOpsAccess(await headers());
  if (!authorized) notFound();

  return <div className="min-h-dvh bg-background">{children}</div>;
}
