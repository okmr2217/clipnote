export default async function AdminPageDetailPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;

  return (
    <main>
      <h1>クリップ詳細</h1>
      <p>{uuid}</p>
    </main>
  );
}
