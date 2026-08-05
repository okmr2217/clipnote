"use client";

import { useState } from "react";
import { ArrowDownIcon, ArrowUpIcon, TriangleAlertIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormatBadge } from "@/components/clips/format-badge";
import type { CollectionMemberClip } from "@/components/collections/types";

export function MobileMemberList({
  members,
  collectionId,
  onReorder,
  onRemove,
  onModeChange,
}: {
  members: CollectionMemberClip[];
  collectionId: string;
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
      <ul className="flex flex-col gap-2">
        {list.map((member, index) => {
          const isPrivate = member.visibility === "private";
          return (
            <li
              key={member.id}
              className={`flex items-center gap-3 rounded-xl border bg-card px-4 py-3 ${
                isPrivate ? "border-accent" : "border-border"
              }`}
            >
              <FormatBadge contentType={member.contentType} />
              {reordering ? (
                <span className="flex-1 truncate font-semibold">{member.title}</span>
              ) : (
                <Link
                  href={`/admin/pages/${member.id}?from=${collectionId}`}
                  className="flex-1 truncate font-semibold hover:text-primary"
                >
                  {member.title}
                </Link>
              )}
              {reordering ? (
                <div className="flex gap-1">
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
                <>
                  <Badge
                    variant="secondary"
                    className={isPrivate ? "text-accent-foreground" : "text-primary"}
                  >
                    {isPrivate && <TriangleAlertIcon className="size-3" />}
                    {isPrivate ? "非公開" : "公開"}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => onRemove(member.id)}
                    title="外す"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <XIcon className="size-4" />
                  </button>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
