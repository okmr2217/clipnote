import { PublicNotFound } from "@/components/public/public-not-found";

export default function NotFound() {
  return (
    <PublicNotFound
      heading="コレクションが見つかりません"
      description="このコレクションは存在しないか、非公開に設定されています。"
    />
  );
}
