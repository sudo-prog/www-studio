import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Rows3, Type, Image, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Layer } from "./layer-utils";

export type { Layer };

const TAG_ICONS: Record<string, React.ReactNode> = {
  section: <Rows3 className="w-3 h-3 text-blue-400" />,
  header: <Rows3 className="w-3 h-3 text-violet-400" />,
  footer: <Rows3 className="w-3 h-3 text-zinc-400" />,
  nav: <Rows3 className="w-3 h-3 text-amber-400" />,
  main: <Rows3 className="w-3 h-3 text-green-400" />,
  article: <Rows3 className="w-3 h-3 text-teal-400" />,
  p: <Type className="w-3 h-3 text-muted-foreground" />,
  img: <Image className="w-3 h-3 text-pink-400" />,
  div: <Square className="w-3 h-3 text-zinc-500" />,
};

function SortableLayerItem({
  layer,
  selected,
  onSelect,
}: {
  layer: Layer;
  selected: boolean;
  onSelect: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: layer.id });

  const mergedStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
    paddingLeft: `${8 + (layer.depth ?? 0) * 10}px`,
  };

  const icon = TAG_ICONS[layer.tag] ?? <Square className="w-3 h-3 text-zinc-500" />;

  return (
    <div
      ref={setNodeRef}
      style={mergedStyle}
      className={cn(
        "flex items-center gap-1.5 py-1.5 pr-2 rounded-md cursor-pointer text-xs transition-colors group select-none",
        selected
          ? "bg-primary/10 text-primary"
          : "hover:bg-muted/70 text-foreground/70 hover:text-foreground"
      )}
      onClick={onSelect}
    >
      <button
        className="shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-opacity p-0.5 rounded"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-2.5 h-2.5" />
      </button>
      <span className="shrink-0">{icon}</span>
      <span className="truncate font-mono">{layer.name}</span>
    </div>
  );
}

interface SortableLayersProps {
  layers: Layer[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onReorder: (layers: Layer[]) => void;
}

export function SortableLayers({
  layers,
  selectedId,
  onSelect,
  onReorder,
}: SortableLayersProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = layers.findIndex((l) => l.id === active.id);
      const newIdx = layers.findIndex((l) => l.id === over.id);
      onReorder(arrayMove(layers, oldIdx, newIdx));
    }
  };

  if (layers.length === 0) {
    return (
      <div className="text-xs text-muted-foreground text-center py-6 px-3">
        No layers yet
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={layers.map((l) => l.id)}
        strategy={verticalListSortingStrategy}
      >
        {layers.map((layer) => (
          <SortableLayerItem
            key={layer.id}
            layer={layer}
            selected={layer.id === selectedId}
            onSelect={() => onSelect(layer.id)}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}
