import { redirect } from "next/navigation";

// 一覧＋プレビューの2カラムレイアウトは/adminへ統合済み（旧β版URL）。
export default function AdminClipsPage() {
  redirect("/admin");
}
