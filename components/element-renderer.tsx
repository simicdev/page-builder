"use client";

import type React from "react";
import { useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { GripVertical } from "lucide-react";
import type { ElementType, PageElement } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ElementRendererProps {
  element: PageElement;
  index: number;
  isSelected?: boolean;
  selectedElement?: string;
  onClick: (id: string, e?: React.MouseEvent) => void;
  onDrop: (
    item: { type: ElementType; id?: string },
    position: number,
    targetId?: string
  ) => void;
  onReorder: (id: string, newIndex: number, targetId?: string) => void;
  editMode: boolean;
}

export function ElementRenderer({
  element,
  index,
  isSelected,
  selectedElement,
  onClick,
  onDrop,
  onReorder,
  editMode,
}: ElementRendererProps) {
  const { id, type, content, styles, children, params } = element;
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(
    null
  );
  const [dropIndicatorPosition, setDropIndicatorPosition] = useState<
    "left" | "right" | null
  >(null);
  const ref = useRef<HTMLDivElement>(null);
  console.log("params", params);

  const renderParam = (str: string) => {
    const match = str.match(/\{\{(\w+)\.(\w+)\}\}/);

    if (params && match) {
      const [_, object, property] = match;
      console.log("Object:", object); // "params"
      console.log("Property:", property); // "name"
      return params[property];
    } else {
      return str;
    }
  };

  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: "placed-element",
    item: () => ({
      type: element.type,
      id: element.id,
    }),
    canDrag: () => editMode,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: ["element", "placed-element"],
    hover: (item, monitor) => {
      if (!editMode || (type !== "grid" && type !== "row")) return;
      if (!ref.current) return;

      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const containerRect = ref.current.getBoundingClientRect();
      if (
        clientOffset.x < containerRect.left ||
        clientOffset.x > containerRect.right ||
        clientOffset.y < containerRect.top ||
        clientOffset.y > containerRect.bottom
      ) {
        setDropIndicatorIndex(null);
        setDropIndicatorPosition(null);
        return;
      }

      if (type === "row") {
        const childWidth = containerRect.width / (children?.length || 1);
        const relativeX = clientOffset.x - containerRect.left;
        const hoverIndex = Math.floor(relativeX / childWidth);
        const maxIndex = children?.length || 0;

        const positionInElement = (relativeX % childWidth) / childWidth;
        const position = positionInElement < 0.5 ? "left" : "right";

        const clampedIndex = Math.max(0, Math.min(hoverIndex, maxIndex));
        setDropIndicatorIndex(clampedIndex);
        setDropIndicatorPosition(position);
      } else {
        const elementHeight = 60;
        const relativeY = clientOffset.y - containerRect.top;
        const hoverIndex = Math.floor(relativeY / elementHeight);
        const maxIndex = children?.length || 0;

        const clampedIndex = Math.max(0, Math.min(hoverIndex, maxIndex));
        setDropIndicatorIndex(clampedIndex);
        setDropIndicatorPosition(null);
      }
    },
    drop: (item: { type: ElementType; id?: string }, monitor) => {
      if (!editMode || (type !== "grid" && type !== "row")) return;

      const clientOffset = monitor.getClientOffset();
      if (!clientOffset || !ref.current) return;

      const containerRect = ref.current.getBoundingClientRect();
      if (
        clientOffset.x < containerRect.left ||
        clientOffset.x > containerRect.right ||
        clientOffset.y < containerRect.top ||
        clientOffset.y > containerRect.bottom
      ) {
        return;
      }

      let finalIndex =
        dropIndicatorIndex !== null
          ? dropIndicatorIndex
          : children?.length || 0;

      if (
        type === "row" &&
        dropIndicatorPosition === "right" &&
        dropIndicatorIndex !== null
      ) {
        finalIndex += 1;
      }

      if (!item.id) {
        onDrop(item, finalIndex, id);
      } else {
        onReorder(item.id, finalIndex, id);
      }

      setDropIndicatorIndex(null);
      setDropIndicatorPosition(null);
      return { id };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
    }),
  });

  const dragDropRef = (node: HTMLDivElement | null) => {
    drag(node);
    drop(node);
    ref.current = node;
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(id, e);
  };

  const renderElement = () => {
    switch (type) {
      case "heading":
        return (
          <h2 className="p-4" style={styles}>
            {renderParam(content)}
          </h2>
        );
      case "text":
        return <p style={styles}>{content}</p>;
      case "button":
        return (
          <button className="whitespace-nowrap" style={styles}>
            {content}
          </button>
        );
      case "grid":
        return (
          <div
            style={{
              ...styles,
              backgroundColor:
                editMode && isOver ? "rgba(59, 130, 246, 0.1)" : undefined,
              transition: "background-color 0.2s",
              border: editMode ? styles.border || "1px dashed #e2e8f0" : "none",
            }}
            className="relative w-full flex-1"
          >
            {children && children.length > 0 ? (
              <div
                className="grid"
                style={{
                  gridTemplateColumns:
                    styles.gridTemplateColumns || "repeat(2, 1fr)",
                }}
              >
                {children.map((child, childIndex) => (
                  <ElementRenderer
                    key={child.id}
                    element={child}
                    index={childIndex}
                    selectedElement={selectedElement}
                    isSelected={selectedElement === child.id} // Pass the selection state down
                    onClick={onClick}
                    onDrop={onDrop}
                    onReorder={onReorder}
                    editMode={editMode}
                  />
                ))}
              </div>
            ) : (
              <>
                {editMode ? (
                  <div className="flex h-full min-h-[50px] items-center justify-center text-sm text-muted-foreground">
                    Drop elements here
                  </div>
                ) : (
                  <></>
                )}
              </>
            )}

            {editMode && isOver && dropIndicatorIndex !== null && (
              <div
                className="absolute left-0 right-0 h-1 bg-primary z-10 transition-all"
                style={{
                  top: dropIndicatorIndex * 60,
                  transform: "translateY(-50%)",
                }}
              />
            )}
          </div>
        );
      case "row":
        return (
          <div
            style={{
              ...styles,
              backgroundColor:
                editMode && isOver ? "rgba(59, 130, 246, 0.1)" : undefined,
              transition: "background-color 0.2s",
              border: editMode ? styles.border || "1px dashed #e2e8f0" : "none",
            }}
            className="relative w-full flex-1"
          >
            {children && children.length > 0 ? (
              <div
                className="flex flex-row"
                style={{ gap: styles.gap || "1rem" }}
              >
                {children.map((child, childIndex) => (
                  <ElementRenderer
                    key={child.id}
                    element={child}
                    index={childIndex}
                    selectedElement={selectedElement}
                    isSelected={selectedElement === child.id} // Pass the selection state down
                    onClick={onClick}
                    onDrop={onDrop}
                    onReorder={onReorder}
                    editMode={editMode}
                  />
                ))}
              </div>
            ) : (
              <>
                {editMode ? (
                  <div className="flex h-full min-h-[50px] items-center justify-center text-sm text-muted-foreground">
                    Drop elements here
                  </div>
                ) : (
                  <></>
                )}
              </>
            )}

            {editMode && isOver && dropIndicatorIndex !== null && (
              <div
                className="absolute top-0 bottom-0 w-1 bg-primary z-10 transition-all"
                style={{
                  left:
                    dropIndicatorPosition === "right"
                      ? `calc(${
                          (dropIndicatorIndex + 1) *
                          (100 / (children?.length || 1))
                        }% - 2px)`
                      : `${
                          dropIndicatorIndex * (100 / (children?.length || 1))
                        }%`,
                  transform: "translateX(-50%)",
                }}
              />
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={dragDropRef}
      className={cn(
        "relative mb-2 w-full",
        editMode && selectedElement === element.id
          ? "cursor-move"
          : "cursor-pointer",
        isDragging ? "opacity-50" : ""
      )}
      onClick={handleClick}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {/* Element content with border only if THIS element is selected */}
      <div
        className={cn(
          !element.parentId && (type !== "grid" || type !== "row") ? "p-4" : "",
          !isSelected && "hover:opacity-80 duration-200",
          // Apply border only if this specific element is selected
          editMode &&
            selectedElement === element.id &&
            "border border-dashed border-slate-800"
        )}
      >
        {renderElement()}
      </div>

      {/* Only show element type label in edit mode when THIS element is selected */}
      {editMode && selectedElement === element.id && (
        <div className="absolute -top-2 -right-2 rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground z-10">
          {type}
        </div>
      )}
    </div>
  );
}
