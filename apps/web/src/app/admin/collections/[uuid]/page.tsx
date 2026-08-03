export default async function AdminCollectionDetailPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;

  return (
    <main>
      <h1>コレクション詳細</h1>
      <p>{uuid}</p>
    </main>
  );
}
