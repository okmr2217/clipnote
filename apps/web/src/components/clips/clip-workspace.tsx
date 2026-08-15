"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  EllipsisIcon,
  EyeIcon,
  EyeOffIcon,
  Link2Icon,
  PinIcon,
  PinOffIcon,
  PlusIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { FormatBadge } from "@/components/clips/format-badge";
import { VisibilityBadge } from "@/components/clips/visibility-badge";
import { CollectionChips } from "@/components/clips/collection-chips";
import { CopyButton } from "@/components/ui/copy-button";
import { ContentFrame } from "@/components/public/content-frame";
import { NewClipDialog } from "@/components/clips/new-clip-dialog";
import { EditMetadataDialog } from "@/components/clips/edit-metadata-dialog";
import { UpdateContentDialog } from "@/components/clips/update-content-dialog";
import { ClipOverflowMenu } from "@/components/clips/clip-overflow-menu";
import { useClipToggles } from "@/components/clips/use-clip-toggles";
import { downloadAsFile, sanitizeForFileName } from "@/lib/content-file";
import type { ClipRow, CollectionOption } from "@/components/clips/types";
import type { ContentType } from "@clipnote/pages/validation";

const shortDateFormatter = new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric" });
const fullDateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

type DialogState =
  | { type: "new" }
  | { type: "edit-metadata"; clip: ClipRow }
  | { type: "update-content"; clip: ClipRow }
  | null;

export function ClipWorkspace({
  clips,
  collectionOptions,
  initialSelectedId,
  initialToken,
  contentOrigin,
}: {
  clips: ClipRow[];
  collectionOptions: CollectionOption[];
  initialSelectedId: string | null;
  initialToken: string | null;
  contentOrigin: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [archiveFilter, setArchiveFilter] = useState<"active" | "archived" | "all">("active");
  const [formatFilter, setFormatFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [collectionFilter, setCollectionFilter] = useState("all");
  const [dialog, setDialog] = useState<DialogState>(null);
  const [selected, setSelected] = useState<{ id: string; token: string } | null>(
    initialSelectedId && initialToken ? { id: initialSelectedId, token: initialToken } : null,
  );
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [previewNonce, setPreviewNonce] = useState(0);
  // モバイル（md未満）では一覧とプレビューを1カラムで出し分ける。デスクトップ
  // では両ペインを常時表示するため、この状態は`md:`側のクラスでは参照しない。
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const { resolvedClips, handleToggleVisibility, handleTogglePin, handleToggleArchive, handleTrash } =
    useClipToggles(clips);

  function refresh() {
    router.refresh();
  }

  const visibleClips = useMemo(() => {
    return resolvedClips.filter((clip) => {
      if (search && !clip.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (formatFilter !== "all" && clip.contentType !== formatFilter) return false;
      if (visibilityFilter !== "all" && clip.visibility !== visibilityFilter) return false;
      if (collectionFilter !== "all" && !clip.collections.some((c) => c.id === collectionFilter)) {
        return false;
      }
      if (archiveFilter === "active" && clip.archivedAt !== null) return false;
      if (archiveFilter === "archived" && clip.archivedAt === null) return false;
      return true;
    });
  }, [resolvedClips, search, formatFilter, visibilityFilter, collectionFilter, archiveFilter]);

  const pinnedClips = useMemo(() => visibleClips.filter((clip) => clip.pinned), [visibleClips]);
  const otherClips = useMemo(() => visibleClips.filter((clip) => !clip.pinned), [visibleClips]);

  const selectedClip = selected ? (resolvedClips.find((clip) => clip.id === selected.id) ?? null) : null;

  async function handleSelect(clip: ClipRow) {
    setMobileDetailOpen(true);
    if (selected?.id === clip.id || loadingId === clip.id) return;
    setLoadingId(clip.id);
    try {
      const response = await fetch("/api/content-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid: clip.id }),
      });
      if (!response.ok) return;
      const data = (await response.json()) as { token: string };
      setSelected({ id: clip.id, token: data.token });
    } finally {
      setLoadingId(null);
    }
  }

  function handleUpdated() {
    refresh();
  }

  function handleContentUpdated() {
    setPreviewNonce((n) => n + 1);
    refresh();
  }

  async function fetchClipContent(clip: ClipRow) {
    const response = await fetch(`/api/pages/${clip.id}/content`);
    if (!response.ok) return null;
    const data = (await response.json()) as { content: string; contentType: ContentType };
    return data;
  }

  async function handleCopyContent(clip: ClipRow) {
    const data = await fetchClipContent(clip);
    if (!data) return;
    await navigator.clipboard.writeText(data.content);
  }

  async function handleDownloadContent(clip: ClipRow) {
    const data = await fetchClipContent(clip);
    if (!data) return;
    downloadAsFile(sanitizeForFileName(clip.title), data.contentType, data.content);
  }

  async function handleDelete(clip: ClipRow) {
    if (selected?.id === clip.id) {
      setSelected(null);
      setMobileDetailOpen(false);
    }
    await handleTrash(clip);
  }

  return (
    <div className="flex flex-col md:h-full">
      <div className="flex flex-col md:min-h-0 md:flex-1 md:flex-row md:overflow-hidden">
        {/* 左ペイン：探すための軽量な索引。モバイルではプレビュー表示中のみ隠す */}
        <div
          className={cn(
            "flex-col bg-muted/40 md:min-h-0 md:w-[340px] md:shrink-0 md:overflow-hidden md:border-r md:border-border",
            mobileDetailOpen ? "hidden md:flex" : "flex",
          )}
        >
          <div className="flex flex-col gap-2.5 border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div className="text-[15px] font-extrabold">
                クリップ<span className="ml-1.5 text-xs font-semibold text-muted-foreground">{clips.length}件</span>
              </div>
              <Button
                variant="secondary"
                size="icon"
                aria-label="新規クリップ"
                className="size-8 rounded-md text-primary shadow-none"
                onClick={() => setDialog({ type: "new" })}
              >
                <PlusIcon className="size-4" />
              </Button>
            </div>
            <Input
              placeholder="タイトルで検索"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-9 rounded-md bg-background px-3 text-sm"
            />
            <div className="flex flex-wrap gap-2">
              <Select
                value={archiveFilter}
                onValueChange={(value) => setArchiveFilter((value as typeof archiveFilter) ?? "active")}
              >
                <SelectTrigger className="h-8! shrink-0 rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
                  状態
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">アクティブのみ</SelectItem>
                  <SelectItem value="archived">アーカイブ済みのみ</SelectItem>
                  <SelectItem value="all">すべて</SelectItem>
                </SelectContent>
              </Select>
              <Select value={formatFilter} onValueChange={(value) => setFormatFilter(value ?? "all")}>
                <SelectTrigger className="h-8! shrink-0 rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
                  形式
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">形式: すべて</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="markdown">Markdown</SelectItem>
                  <SelectItem value="plaintext">プレーンテキスト</SelectItem>
                </SelectContent>
              </Select>
              <Select value={visibilityFilter} onValueChange={(value) => setVisibilityFilter(value ?? "all")}>
                <SelectTrigger className="h-8! shrink-0 rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
                  公開設定
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">公開設定: すべて</SelectItem>
                  <SelectItem value="private">非公開</SelectItem>
                  <SelectItem value="public">公開</SelectItem>
                </SelectContent>
              </Select>
              {collectionOptions.length > 0 && (
                <Select
                  value={collectionFilter}
                  onValueChange={(value) => setCollectionFilter(value ?? "all")}
                >
                  <SelectTrigger className="h-8! shrink-0 rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
                    コレクション
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">コレクション: すべて</SelectItem>
                    {collectionOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="scrollbar-minimal flex-1 overflow-y-auto p-2 md:min-h-0">
            {visibleClips.length === 0 ? (
              <p className="px-2 py-10 text-center text-xs text-muted-foreground">
                {clips.length === 0 ? "まだクリップがありません。" : "条件に一致するクリップがありません。"}
              </p>
            ) : (
              <>
                {pinnedClips.length > 0 && (
                  <>
                    <div className="px-2.5 pt-2 pb-1.5 text-[11px] font-extrabold tracking-wide text-muted-foreground uppercase">
                      固定
                    </div>
                    {pinnedClips.map((clip) => (
                      <ClipIndexRow
                        key={clip.id}
                        clip={clip}
                        selected={selected?.id === clip.id}
                        onSelect={() => handleSelect(clip)}
                        onToggleVisibility={() => handleToggleVisibility(clip)}
                        onTogglePin={() => handleTogglePin(clip)}
                        onToggleArchive={() => handleToggleArchive(clip)}
                        onDelete={() => handleDelete(clip)}
                      />
                    ))}
                  </>
                )}
                <div className="px-2.5 pt-3 pb-1.5 text-[11px] font-extrabold tracking-wide text-muted-foreground uppercase">
                  {pinnedClips.length > 0 ? "すべてのクリップ" : "クリップ"}
                </div>
                {otherClips.map((clip) => (
                  <ClipIndexRow
                    key={clip.id}
                    clip={clip}
                    selected={selected?.id === clip.id}
                    onSelect={() => handleSelect(clip)}
                    onToggleVisibility={() => handleToggleVisibility(clip)}
                    onTogglePin={() => handleTogglePin(clip)}
                    onToggleArchive={() => handleToggleArchive(clip)}
                    onDelete={() => handleDelete(clip)}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        {/* 右ペイン：読む・操作するためのプレビュー。モバイルでは一覧の代わりに全画面で表示する */}
        <div
          className={cn(
            "min-w-0 flex-1 flex-col md:min-h-0 md:overflow-hidden",
            mobileDetailOpen ? "flex" : "hidden md:flex",
          )}
        >
          {selectedClip ? (
            <>
              <div className="border-b border-border px-4 py-4 md:px-6">
                <button
                  type="button"
                  onClick={() => setMobileDetailOpen(false)}
                  className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-secondary-foreground hover:text-foreground md:hidden"
                >
                  <ArrowLeftIcon className="size-3.5" /> 一覧に戻る
                </button>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <h1 className="text-lg font-extrabold tracking-tight text-balance">{selectedClip.title}</h1>
                  <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                    <Button
                      variant={selectedClip.visibility === "public" ? "default" : "outline"}
                      size="sm"
                      className="h-auto gap-1.5 rounded-full px-3 py-1.5 text-xs"
                      onClick={() => handleToggleVisibility(selectedClip)}
                    >
                      {selectedClip.visibility === "public" ? (
                        <EyeOffIcon className="size-3.5" />
                      ) : (
                        <EyeIcon className="size-3.5" />
                      )}
                      {selectedClip.visibility === "public" ? "非公開にする" : "公開する"}
                    </Button>
                    <Button
                      variant={selectedClip.pinned ? "default" : "outline"}
                      size="sm"
                      className="h-auto gap-1.5 rounded-full px-3 py-1.5 text-xs"
                      onClick={() => handleTogglePin(selectedClip)}
                    >
                      {selectedClip.pinned ? <PinOffIcon className="size-3.5" /> : <PinIcon className="size-3.5" />}
                      {selectedClip.pinned ? "固定を解除" : "固定する"}
                    </Button>
                    <ClipOverflowMenu
                      clip={selectedClip}
                      onEditMetadata={() => setDialog({ type: "edit-metadata", clip: selectedClip })}
                      onUpdateContent={() => setDialog({ type: "update-content", clip: selectedClip })}
                      onCopyContent={() => handleCopyContent(selectedClip)}
                      onDownloadContent={() => handleDownloadContent(selectedClip)}
                      onToggleArchive={() => handleToggleArchive(selectedClip)}
                      onDelete={() => handleDelete(selectedClip)}
                    />
                  </div>
                </div>
                {/* 状態：形式・公開設定・所属コレクションはすべて同じ見た目のバッジで揃え、クリック操作を持たない
                    純粋な情報表示にする。公開設定の切替はタイトル行の専用トグルボタンでのみ行う */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <FormatBadge contentType={selectedClip.contentType} />
                  <VisibilityBadge visibility={selectedClip.visibility} />
                  <CollectionChips collections={selectedClip.collections} />
                </div>
                {/* 操作・メタ情報：この画面から動かせる二次的な操作と更新日時 */}
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  {selectedClip.visibility === "public" && (
                    <CopyButton
                      getValue={() => `${window.location.origin}/p/${selectedClip.id}`}
                      label="公開URLをコピー"
                      icon={<Link2Icon className="size-3.5" />}
                      showLabel
                    />
                  )}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {fullDateFormatter.format(selectedClip.updatedAt)} 更新
                  </span>
                </div>
              </div>
              <div className="flex-1 p-1.5 md:min-h-0 md:overflow-y-auto">
                <ContentFrame
                  key={`${selected!.id}:${previewNonce}`}
                  uuid={selected!.id}
                  initialToken={selected!.token}
                  contentOrigin={contentOrigin}
                  title={selectedClip.title}
                  className="h-full min-h-[60vh] rounded-lg border border-border"
                />
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <p className="text-sm">
                {clips.length === 0
                  ? "まだクリップがありません。"
                  : "左の一覧からクリップを選ぶとここにプレビューが表示されます。"}
              </p>
              {clips.length === 0 && (
                <Button
                  className="h-auto px-5 py-3 shadow-[var(--shadow-accent)]"
                  onClick={() => setDialog({ type: "new" })}
                >
                  <PlusIcon /> 新規クリップ
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <NewClipDialog
        open={dialog?.type === "new"}
        onOpenChange={(open) => !open && setDialog(null)}
        collectionOptions={collectionOptions}
        onCreated={handleUpdated}
      />
      <EditMetadataDialog
        key={dialog?.type === "edit-metadata" ? dialog.clip.id : "edit-metadata-empty"}
        clip={dialog?.type === "edit-metadata" ? dialog.clip : null}
        onOpenChange={(open) => !open && setDialog(null)}
        collectionOptions={collectionOptions}
        onUpdated={handleUpdated}
      />
      <UpdateContentDialog
        key={dialog?.type === "update-content" ? dialog.clip.id : "update-content-empty"}
        clip={dialog?.type === "update-content" ? dialog.clip : null}
        onOpenChange={(open) => !open && setDialog(null)}
        onUpdated={handleContentUpdated}
      />
    </div>
  );
}

function ClipIndexRow({
  clip,
  selected,
  onSelect,
  onToggleVisibility,
  onTogglePin,
  onToggleArchive,
  onDelete,
}: {
  clip: ClipRow;
  selected: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onTogglePin: () => void;
  onToggleArchive: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "flex w-full items-start gap-2.5 rounded-xl border border-transparent px-2.5 py-2 text-left",
        "cursor-pointer hover:bg-background",
        selected && "border-primary/30 bg-primary/10",
        clip.archivedAt && "opacity-60",
      )}
    >
      <span className="mt-2.5 shrink-0 rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-extrabold text-muted-foreground uppercase">
        {clip.contentType === "html" ? "HTML" : clip.contentType === "markdown" ? "MD" : "TXT"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start gap-1">
          {clip.pinned && <PinIcon className="mt-0.5 size-3 shrink-0 text-primary" aria-label="固定済み" />}
          <span className="line-clamp-2 text-[13.5px] font-bold">{clip.title}</span>
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
          <span
            className={cn(
              "size-1.5 rounded-full",
              clip.visibility === "public" ? "bg-primary" : "bg-muted-foreground/50",
            )}
          />
          {clip.visibility === "public" ? "公開" : "非公開"}・{shortDateFormatter.format(clip.updatedAt)}更新
          {clip.archivedAt && "・アーカイブ済み"}
        </span>
        {clip.collections.length > 0 && (
          <span className="mt-1 block">
            <CollectionChips collections={clip.collections} />
          </span>
        )}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              onClick={(event) => event.stopPropagation()}
              className="mt-1 flex size-6 shrink-0 items-center justify-center self-start rounded-md text-muted-foreground hover:bg-muted"
              aria-label="操作"
              title="操作"
            >
              <EllipsisIcon className="size-4" />
            </button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              onToggleVisibility();
            }}
          >
            {clip.visibility === "public" ? "非公開にする" : "公開にする"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              onTogglePin();
            }}
          >
            {clip.pinned ? "固定を解除" : "固定する"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              onToggleArchive();
            }}
          >
            {clip.archivedAt ? "アーカイブを解除" : "アーカイブする"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
          >
            削除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
