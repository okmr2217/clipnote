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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { VisibilityField } from "@/components/clips/visibility-field";
import type { Visibility } from "@clipnote/pages/validation";
import type { CollectionDetail } from "@/components/collections/types";

export function EditCollectionDialog({
  collection,
  open,
  onOpenChange,
  onUpdated,
}: {
  collection: CollectionDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (next: { name: string; description: string | null; visibility: Visibility }) => void;
}) {
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description ?? "");
  const [visibility, setVisibility] = useState<Visibility>(collection.visibility);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (name.trim().length === 0) {
      setError("名前を入力してください。");
      return;
    }

    setSubmitting(true);
    const response = await fetch(`/api/collections/${collection.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, visibility }),
    });
    setSubmitting(false);

    if (!response.ok) {
      setError("保存に失敗しました。");
      return;
    }

    onUpdated({
      name: name.trim(),
      description: description.trim().length > 0 ? description.trim() : null,
      visibility,
    });
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setName(collection.name);
          setDescription(collection.description ?? "");
          setVisibility(collection.visibility);
          setError(null);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md gap-5 rounded-3xl p-6 sm:max-w-md sm:p-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">コレクション情報を編集</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-collection-name" className="text-sm font-bold">
            名前
          </Label>
          <Input
            id="edit-collection-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-auto rounded-md bg-background px-3.5 py-3"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-collection-description" className="text-sm font-bold">
            説明
          </Label>
          <Textarea
            id="edit-collection-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-20 rounded-md bg-background px-3.5 py-3"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm font-bold">公開設定</Label>
          <VisibilityField value={visibility} onChange={setVisibility} />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

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
