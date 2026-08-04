"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VisibilityField } from "@/components/clips/visibility-field";
import { CollectionMultiselect } from "@/components/clips/collection-multiselect";
import type { Visibility } from "@clipnote/pages/validation";
import type { ClipRow, CollectionOption } from "@/components/clips/types";

export function EditMetadataDialog({
  clip,
  onOpenChange,
  collectionOptions,
  onUpdated,
}: {
  clip: ClipRow | null;
  onOpenChange: (open: boolean) => void;
  collectionOptions: CollectionOption[];
  onUpdated: () => void;
}) {
  // 呼び出し側（ClipList）がclip.idをkeyにして描画するため、開くたびにこの
  // コンポーネント自体が再マウントされる。そのためuseStateの初期値だけで
  // クリップごとの初期表示ができ、リセット用のuseEffectは不要。
  const [title, setTitle] = useState(clip?.title ?? "");
  const [visibility, setVisibility] = useState<Visibility>(clip?.visibility ?? "private");
  const [collectionIds, setCollectionIds] = useState<string[]>(
    clip?.collections.map((c) => c.id) ?? [],
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!clip) return;
    setError(null);

    if (title.trim().length === 0) {
      setError("タイトルを入力してください。");
      return;
    }

    setSubmitting(true);
    const response = await fetch(`/api/pages/${clip.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, visibility, collectionIds }),
    });
    setSubmitting(false);

    if (!response.ok) {
      setError("保存に失敗しました。");
      return;
    }

    onOpenChange(false);
    onUpdated();
  }

  return (
    <Dialog open={clip !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 rounded-3xl p-6 sm:max-w-md sm:p-8">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-xl font-extrabold">クリップ情報を編集</DialogTitle>
        </DialogHeader>

        <div className="mb-5 flex flex-col gap-2">
          <Label htmlFor="edit-clip-title" className="text-sm font-bold">
            タイトル
          </Label>
          <Input
            id="edit-clip-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-auto rounded-md bg-background px-3.5 py-3"
          />
        </div>

        <div className="mb-5 flex flex-col gap-2">
          <Label className="text-sm font-bold">公開設定</Label>
          <VisibilityField value={visibility} onChange={setVisibility} />
        </div>

        <div className="mb-[22px] flex flex-col gap-2">
          <Label className="text-sm font-bold">コレクション</Label>
          <CollectionMultiselect
            options={collectionOptions}
            value={collectionIds}
            onChange={setCollectionIds}
          />
        </div>

        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

        <DialogFooter className="mx-0 mb-0 border-none bg-transparent p-0">
          <Button
            type="button"
            variant="outline"
            className="h-auto px-6 py-3"
            onClick={() => onOpenChange(false)}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            className="h-auto px-6 py-3 shadow-[var(--shadow-accent)]"
            onClick={handleSubmit}
            disabled={submitting}
          >
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
