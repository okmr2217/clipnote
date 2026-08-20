import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OpsNav } from "@/components/ops/ops-nav";
import { PublicClipsSortSelect } from "@/components/ops/public-clips-sort-select";
import {
  OPS_PUBLIC_CLIPS_DEFAULT_SORT,
  OPS_PUBLIC_CLIPS_SORTS,
  loadOpsPublicClips,
  type OpsPublicClipsSort,
} from "@/lib/ops";

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

export default async function OpsClipsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort: sortParam } = await searchParams;
  const sort = parseSort(sortParam);
  const clips = await loadOpsPublicClips(sort);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <OpsNav current="clips" />
      <h1 className="text-xl font-bold">公開クリップ一覧</h1>
      <div className="mt-1 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">全{clips.length}件</p>
        <PublicClipsSortSelect sort={sort} />
      </div>
      <div className="mt-6 overflow-x-auto">
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead>タイトル</TableHead>
              <TableHead>所有者</TableHead>
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
                </TableCell>
                <TableCell className="text-muted-foreground">{clip.ownerEmail}</TableCell>
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
