import type { Metadata } from "next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { OpsNav } from "@/components/ops/ops-nav";
import { PublicClipsSortSelect } from "@/components/ops/public-clips-sort-select";
import { PublicClipsOwnerSelect } from "@/components/ops/public-clips-owner-select";
import { PublicClipsStatusSelect } from "@/components/ops/public-clips-status-select";
import {
  OPS_PUBLIC_CLIPS_DEFAULT_SORT,
  OPS_PUBLIC_CLIPS_DEFAULT_STATUS,
  OPS_PUBLIC_CLIPS_SORTS,
  OPS_PUBLIC_CLIPS_STATUSES,
  loadOpsPublicClipOwners,
  loadOpsPublicClips,
  type OpsPublicClipsSort,
  type OpsPublicClipsStatus,
} from "@/lib/ops";

export const metadata: Metadata = {
  title: "公開クリップ一覧 | Clipnote Ops",
};

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function parseSort(value: string | undefined): OpsPublicClipsSort {
  return OPS_PUBLIC_CLIPS_SORTS.includes(value as OpsPublicClipsSort)
    ? (value as OpsPublicClipsSort)
    : OPS_PUBLIC_CLIPS_DEFAULT_SORT;
}

function parseStatus(value: string | undefined): OpsPublicClipsStatus {
  return OPS_PUBLIC_CLIPS_STATUSES.includes(value as OpsPublicClipsStatus)
    ? (value as OpsPublicClipsStatus)
    : OPS_PUBLIC_CLIPS_DEFAULT_STATUS;
}

export default async function OpsClipsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; owner?: string; status?: string }>;
}) {
  const { sort: sortParam, owner: ownerParam, status: statusParam } = await searchParams;
  const sort = parseSort(sortParam);
  const status = parseStatus(statusParam);
  const owners = await loadOpsPublicClipOwners();
  // ownerパラメータが実在する所有者と一致しない場合（削除済み・改ざん等）は
  // フィルターなし扱いにする。
  const ownerId = owners.some((owner) => owner.id === ownerParam) ? ownerParam : undefined;
  const clips = await loadOpsPublicClips(sort, ownerId, status);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <OpsNav current="clips" />
      <h1 className="text-xl font-bold">公開クリップ一覧</h1>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">全{clips.length}件</p>
        <div className="flex flex-wrap items-center gap-2">
          <PublicClipsStatusSelect status={status} />
          <PublicClipsOwnerSelect owners={owners} ownerId={ownerId} />
          <PublicClipsSortSelect sort={sort} />
        </div>
      </div>
      <div className="mt-6 overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead>タイトル</TableHead>
              <TableHead>所有者</TableHead>
              <TableHead>作成日時</TableHead>
              <TableHead>更新日時</TableHead>
              <TableHead className="text-right">プレビュー数</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clips.map((clip) => (
              <TableRow key={clip.id}>
                <TableCell>
                  <a
                    href={`/p/${clip.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-foreground hover:text-primary hover:underline"
                  >
                    {clip.title}
                  </a>
                  {clip.archivedAt && (
                    <Badge variant="secondary" className="ml-2 bg-muted font-bold align-middle">
                      アーカイブ済み
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{clip.ownerEmail}</TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {dateFormatter.format(clip.createdAt)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {dateFormatter.format(clip.updatedAt)}
                </TableCell>
                <TableCell className="text-right">{clip.viewCount.toLocaleString("ja-JP")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
