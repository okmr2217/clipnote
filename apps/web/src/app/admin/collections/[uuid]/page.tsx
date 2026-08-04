export default async function AdminCollectionDetailPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;

  return (
    <main className="px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-extrabold tracking-tight">コレクション詳細</h1>
        <p className="mt-2 text-sm text-muted-foreground">{uuid}</p>
      </div>
    </main>
  );
}
