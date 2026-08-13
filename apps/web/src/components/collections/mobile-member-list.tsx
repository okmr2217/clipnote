"use client";

import { useState } from "react";
import { ArrowDownIcon, ArrowUpIcon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FormatBadge } from "@/components/clips/format-badge";
import type { CollectionMemberClip } from "@/components/collections/types";

export function MobileMemberList({
  members,
  collectionId,
  showPrivateWarning,
  onReorder,
  onRemove,
  onModeChange,
}: {
  members: CollectionMemberClip[];
  collectionId: string;
  showPrivateWarning: boolean;
  onReorder: (orderedIds: string[]) => void;
  onRemove: (pageId: string) => void;
  onModeChange?: (reordering: boolean) => void;
}) {
  const [reordering, setReordering] = useState(false);
  const [draft, setDraft] = useState<CollectionMemberClip[]>(members);

  function startReordering() {
    setDraft(members);
    setReordering(true);
    onModeChange?.(true);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= draft.length) return;
    const next = [...draft];
    [next[index], next[target]] = [next[target], next[index]];
    setDraft(next);
  }

  function finish() {
    setReordering(false);
    onModeChange?.(false);
    onReorder(draft.map((member) => member.id));
  }

  const list = reordering ? draft : members;

  return (
    <div className="md:hidden">
      <div className="mb-3 flex items-center justify-between">
        {reordering ? (
          <>
            <span className="text-sm font-bold">並び替え中</span>
            <Button type="button" variant="secondary" size="sm" onClick={finish}>
              完了
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={startReordering}
            disabled={members.length < 2}
          >
            並び替え
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-3">
        {list.map((member, index) => {
          const isPrivate = member.visibility === "private";
          const isWarning = isPrivate && showPrivateWarning;
          return (
            <div
              key={member.id}
              className={cn("rounded-xl border p-4", isWarning ? "border-accent" : "border-border")}
            >
              <div className="mb-2.5 flex items-center gap-2">
                <FormatBadge contentType={member.contentType} />
                <Badge
                  variant="secondary"
                  className={cn(
                    isPrivate ? "bg-muted text-secondary-foreground" : "bg-secondary text-primary",
                    isWarning && "gap-1 text-accent-foreground",
                  )}
                >
                  {isWarning && <TriangleAlertIcon className="size-3" />}
                  {isPrivate ? "非公開" : "公開"}
                </Badge>
              </div>
              {reordering ? (
                <span className="mb-2 block text-base font-bold leading-snug">{member.title}</span>
              ) : (
                <a
                  href={`/p/${member.id}?from=${collectionId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mb-2 block text-base font-bold leading-snug"
                >
                  {member.title}
                </a>
              )}
              {reordering ? (
                <div className="flex justify-end gap-1 border-t border-border pt-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                  >
                    <ArrowUpIcon />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    onClick={() => move(index, 1)}
                    disabled={index === list.length - 1}
                  >
                    <ArrowDownIcon />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-4 border-t border-border pt-2.5">
                  <Link
                    href={`/admin/pages/${member.id}?from=${collectionId}`}
                    className="text-sm font-semibold text-secondary-foreground"
                  >
                    履歴を見る
                  </Link>
                  <button
                    type="button"
                    onClick={() => onRemove(member.id)}
                    className="ml-auto text-sm font-semibold text-muted-foreground hover:text-foreground"
                  >
                    外す
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
