"use client";

import { useDrag } from "react-dnd";
import type { DraggableItemProps } from "@/lib/types";

export function DraggableItem({ type, label, icon }: DraggableItemProps) {
  const [{ isDragging }, drag] = useDrag({
    type: "element",
    item: () => ({ type }), // Use a function to return the item
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`flex cursor-grab items-center gap-2 rounded-md border border-border bg-background p-3 transition-colors hover:bg-accent ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}
