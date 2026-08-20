import Link from "next/link";

// /ops配下の簡易ナビゲーション。better-authのセッションを使わない別系統の
// 画面（design-web.md 4-9節）のため、/adminのAdminHeaderとは別に最小限の
// ものを用意する。
export function OpsNav({ current }: { current: "users" | "clips" }) {
  return (
    <nav className="mb-6 flex gap-4 border-b border-border pb-3 text-sm font-semibold">
      <Link
        href="/ops"
        className={current === "users" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}
      >
        ユーザー一覧
      </Link>
      <Link
        href="/ops/clips"
        className={current === "clips" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}
      >
        公開クリップ一覧
      </Link>
    </nav>
  );
}
