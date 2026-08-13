"use client";

import { Fragment, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon, HistoryIcon, TriangleAlertIcon, XIcon } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FormatBadge } from "@/components/clips/format-badge";
import type { CollectionMemberClip } from "@/components/collections/types";

function SortableRow({
  member,
  collectionId,
  showPrivateWarning,
  onRemove,
}: {
  member: CollectionMemberClip;
  collectionId: string;
  showPrivateWarning: boolean;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: member.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isPrivate = member.visibility === "private";
  const isWarning = isPrivate && showPrivateWarning;

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-8">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-muted-foreground outline-none"
          title="ドラッグして並び替え"
        >
          <GripVerticalIcon className="size-4" />
        </button>
      </TableCell>
      <TableCell>
        <FormatBadge contentType={member.contentType} />
      </TableCell>
      <TableCell>
        <a
          href={`/p/${member.id}?from=${collectionId}`}
          target="_blank"
          rel="noreferrer"
          className="text-[15px] font-semibold text-foreground hover:text-primary"
        >
          {member.title}
        </a>
      </TableCell>
      <TableCell>
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
      </TableCell>
      <TableCell className="text-center">
        <Link
          href={`/admin/pages/${member.id}?from=${collectionId}`}
          title="更新履歴を見る"
          className="text-muted-foreground hover:text-foreground"
        >
          <HistoryIcon className="size-4" />
        </Link>
      </TableCell>
      <TableCell className="text-center">
        <button
          type="button"
          onClick={onRemove}
          title="外す"
          className="text-muted-foreground hover:text-foreground"
        >
          <XIcon className="size-4" />
        </button>
      </TableCell>
    </TableRow>
  );
}

export function DesktopMemberList({
  members,
  collectionId,
  showPrivateWarning,
  onReorder,
  onRemove,
}: {
  members: CollectionMemberClip[];
  collectionId: string;
  showPrivateWarning: boolean;
  onReorder: (orderedIds: string[]) => void;
  onRemove: (pageId: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const activeIndex = activeId ? members.findIndex((member) => member.id === activeId) : -1;
  const overIndex = overId ? members.findIndex((member) => member.id === overId) : -1;
  const showIndicatorBefore = overIndex !== -1 && activeIndex !== -1 && overIndex < activeIndex;
  const showIndicatorAfter = overIndex !== -1 && activeIndex !== -1 && overIndex > activeIndex;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    setOverId(over && over.id !== active.id ? String(over.id) : null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = members.findIndex((member) => member.id === active.id);
    const newIndex = members.findIndex((member) => member.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onReorder(arrayMove(members, oldIndex, newIndex).map((member) => member.id));
  }

  function handleDragCancel() {
    setActiveId(null);
    setOverId(null);
  }

  return (
    <div className="hidden overflow-x-auto md:block">
      {/* dnd-kitはaria-describedby用のidを自動採番するため、指定しないとSSR/CSR
          間でid値がずれてハイドレーションエラーになる（Next.js特有の既知の問題）。
          固定文字列を渡すことで両者を一致させる。 */}
      <DndContext
        id="collection-member-dnd"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={members.map((member) => member.id)} strategy={verticalListSortingStrategy}>
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>形式</TableHead>
                <TableHead>タイトル</TableHead>
                <TableHead>公開設定</TableHead>
                <TableHead className="w-11" />
                <TableHead className="w-11" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <Fragment key={member.id}>
                  {member.id === overId && showIndicatorBefore && <DropIndicatorRow />}
                  <SortableRow
                    member={member}
                    collectionId={collectionId}
                    showPrivateWarning={showPrivateWarning}
                    onRemove={() => onRemove(member.id)}
                  />
                  {member.id === overId && showIndicatorAfter && <DropIndicatorRow />}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function DropIndicatorRow() {
  return (
    <TableRow aria-hidden className="border-0 hover:bg-transparent">
      <TableCell colSpan={6} className="h-1.5 p-0">
        <div className="h-0.5 rounded-full bg-primary" />
      </TableCell>
    </TableRow>
  );
}
