import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { loadClipWorkspaceData } from "@/lib/clips";
import { ClipList } from "@/components/clips/clip-list";

export default async function AdminPage() {
  // AdminLayoutが未認証を弾いているため、ここではセッションは存在する前提。
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session!.user.id;

  const { clips, collectionOptions } = await loadClipWorkspaceData(userId);

  return (
    <main className="px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-6xl">
        <ClipList clips={clips} collectionOptions={collectionOptions} />
      </div>
    </main>
  );
}
