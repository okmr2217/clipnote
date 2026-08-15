import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { loadClipWorkspaceData } from "@/lib/clips";
import { getContentOrigin, issueContentToken } from "@/lib/content-token";
import { ClipWorkspace } from "@/components/clips/clip-workspace";

export default async function AdminPage() {
  // AdminLayoutが未認証を弾いているため、ここではセッションは存在する前提。
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session!.user.id;

  const { clips, collectionOptions } = await loadClipWorkspaceData(userId);

  // 初期選択：アーカイブ済みでない先頭（固定→更新日時降順の並びそのもの）を
  // 自動選択し、空のプレビューを見せない。全件アーカイブ済みなら先頭を選ぶ。
  const initialSelected = clips.find((clip) => clip.archivedAt === null) ?? clips[0] ?? null;
  const initialToken = initialSelected
    ? await issueContentToken(initialSelected.id, userId)
    : null;
  const contentOrigin = getContentOrigin();

  return (
    <ClipWorkspace
      clips={clips}
      collectionOptions={collectionOptions}
      initialSelectedId={initialSelected?.id ?? null}
      initialToken={initialToken}
      contentOrigin={contentOrigin}
    />
  );
}
