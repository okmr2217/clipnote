"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormatBadge } from "@/components/clips/format-badge";
import type { CollectionMemberClip } from "@/components/collections/types";

function SortableRow({
  member,
  onRemove,
}: {
  member: CollectionMemberClip;
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

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-muted-foreground outline-none"
        title="ドラッグして並び替え"
      >
        <GripVerticalIcon className="size-4" />
      </button>
      <FormatBadge contentType={member.contentType} />
      <a
        href={`/p/${member.id}`}
        target="_blank"
        rel="noreferrer"
        className="flex-1 truncate font-semibold text-foreground hover:text-primary"
      >
        {member.title}
      </a>
      <Button type="button" variant="outline" size="sm" onClick={onRemove}>
        外す
      </Button>
    </li>
  );
}

export function DesktopMemberList({
  members,
  onReorder,
  onRemove,
}: {
  members: CollectionMemberClip[];
  onReorder: (orderedIds: string[]) => void;
  onRemove: (pageId: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = members.findIndex((member) => member.id === active.id);
    const newIndex = members.findIndex((member) => member.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onReorder(arrayMove(members, oldIndex, newIndex).map((member) => member.id));
  }

  return (
    <div className="hidden md:block">
      {/* dnd-kitはaria-describedby用のidを自動採番するため、指定しないとSSR/CSR
          間でid値がずれてハイドレーションエラーになる（Next.js特有の既知の問題）。
          固定文字列を渡すことで両者を一致させる。 */}
      <DndContext
        id="collection-member-dnd"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={members.map((member) => member.id)} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-2">
            {members.map((member) => (
              <SortableRow key={member.id} member={member} onRemove={() => onRemove(member.id)} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}
