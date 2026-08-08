import { PublicNotFound } from "@/components/public/public-not-found";

export default function NotFound() {
  return (
    <PublicNotFound
      heading="クリップが見つかりません"
      description="このクリップは存在しないか、非公開に設定されています。"
    />
  );
}
