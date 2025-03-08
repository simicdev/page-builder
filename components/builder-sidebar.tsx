"use client";

import {
  LayoutGrid,
  Type,
  Text,
  SplitSquareVertical,
  BoxIcon as ButtonIcon,
  Image,
} from "lucide-react";
import { DraggableItem } from "./draggable-item";
import type { ElementType } from "@/lib/types";

// Add editMode prop to the component
interface BuilderSidebarProps {
  editMode: boolean;
}

const elements = [
  {
    type: "heading" as ElementType,
    label: "Heading",
    icon: <Type className="h-4 w-4" />,
  },
  {
    type: "text" as ElementType,
    label: "Text",
    icon: <Text className="h-4 w-4" />,
  },
  {
    type: "button" as ElementType,
    label: "Button",
    icon: <ButtonIcon className="h-4 w-4" />,
  },
  {
    type: "image" as ElementType,
    label: "Image",
    icon: <Image className="h-4 w-4" />,
  },
  {
    type: "grid" as ElementType,
    label: "Grid",
    icon: <LayoutGrid className="h-4 w-4" />,
  },
  {
    type: "row" as ElementType,
    label: "Row",
    icon: <SplitSquareVertical className="h-4 w-4" />,
  },
];

export function BuilderSidebar({ editMode }: BuilderSidebarProps) {
  // Only render the sidebar content if in edit mode
  if (!editMode) {
    return <div className="w-0 overflow-hidden"></div>;
  }

  return (
    <div className="w-64 border-r border-border bg-card p-4">
      <h2 className="mb-4 text-lg font-semibold">Elements</h2>
      <div className="space-y-2">
        {elements.map((element) => (
          <DraggableItem
            key={element.type}
            type={element.type}
            label={element.label}
            icon={element.icon}
          />
        ))}
      </div>
    </div>
  );
}
