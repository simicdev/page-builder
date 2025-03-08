"use client";

import type React from "react";
import { useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import type { ElementType, PageElement } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
  const { id, type, content, styles, children, imageUrl } = element;
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(
    null
  );
  const [dropIndicatorPosition, setDropIndicatorPosition] = useState<
    "left" | "right" | null
  >(null);
  const ref = useRef<HTMLDivElement>(null);

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

      // Get mouse position
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      // Get container bounds
      const containerRect = ref.current.getBoundingClientRect();

      // Check if mouse is within container bounds
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
        // For rows, calculate horizontal position
        const childCount = children?.length || 1;
        const childWidth = containerRect.width / childCount;
        const relativeX = clientOffset.x - containerRect.left;

        // Special handling for the leftmost area
        if (relativeX < 10) {
          setDropIndicatorIndex(0);
          setDropIndicatorPosition("left");
          return;
        }

        // Special handling for the rightmost area
        if (relativeX > containerRect.width - 10) {
          setDropIndicatorIndex(childCount);
          setDropIndicatorPosition("right");
          return;
        }

        // Calculate which child element we're hovering over
        const hoverIndex = Math.floor(relativeX / childWidth);

        // Calculate position within the child element (0-1)
        const positionInElement =
          (relativeX - hoverIndex * childWidth) / childWidth;

        // Create more distinct drop zones - left third, middle third, right third
        let position: "left" | "right" = "left";
        let targetIndex = hoverIndex;

        if (positionInElement < 0.33) {
          // Left third of the element - drop before
          position = "left";
          targetIndex = hoverIndex;
        } else if (positionInElement > 0.66) {
          // Right third of the element - drop after
          position = "right";
          targetIndex = hoverIndex;
        } else {
          // Middle of the element - highlight the gap
          // For middle, we'll use the right side of the current element
          position = "right";
          targetIndex = hoverIndex;
        }

        // Clamp index to valid range
        const maxIndex = children?.length || 0;
        const clampedIndex = Math.max(0, Math.min(targetIndex, maxIndex));

        setDropIndicatorIndex(clampedIndex);
        setDropIndicatorPosition(position);
      } else {
        // For grids and other containers, calculate vertical position
        const childCount = children?.length || 1;
        const relativeY = clientOffset.y - containerRect.top;

        // Special handling for the top area
        if (relativeY < 10) {
          setDropIndicatorIndex(0);
          setDropIndicatorPosition(null);
          return;
        }

        // Special handling for the bottom area
        if (relativeY > containerRect.height - 10) {
          setDropIndicatorIndex(childCount);
          setDropIndicatorPosition(null);
          return;
        }

        // Calculate row height based on container height and number of rows
        // This is an approximation - in a real grid, you'd need to account for the actual layout
        const rowCount = Math.ceil(childCount / 2); // Assuming 2 columns
        const rowHeight = containerRect.height / rowCount;

        // Calculate which row we're hovering over
        const hoverRow = Math.floor(relativeY / rowHeight);

        // Calculate position within the row (0-1)
        const positionInRow = (relativeY - hoverRow * rowHeight) / rowHeight;

        // Create more distinct drop zones - top third, middle third, bottom third
        let targetIndex = hoverRow * 2; // Convert row to index (assuming 2 columns)

        if (positionInRow < 0.33) {
          // Top third of the row - drop before
          targetIndex = hoverRow * 2;
        } else if (positionInRow > 0.66) {
          // Bottom third of the row - drop after
          targetIndex = (hoverRow + 1) * 2;
        } else {
          // Middle of the row - drop after current row
          targetIndex = (hoverRow + 1) * 2;
        }

        // Clamp index to valid range
        const maxIndex = children?.length || 0;
        const clampedIndex = Math.max(0, Math.min(targetIndex, maxIndex));

        setDropIndicatorIndex(clampedIndex);
        setDropIndicatorPosition(null);
      }
    },
    drop: (item: { type: ElementType; id?: string }, monitor) => {
      if (!editMode || (type !== "grid" && type !== "row")) return;

      // Check if mouse is within container bounds
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

      // Calculate final drop index based on position
      let finalIndex =
        dropIndicatorIndex !== null
          ? dropIndicatorIndex
          : children?.length || 0;

      // For rows with right position, increment the index
      if (
        type === "row" &&
        dropIndicatorPosition === "right" &&
        dropIndicatorIndex !== null
      ) {
        finalIndex += 1;
      }

      // If it's a new element
      if (!item.id) {
        onDrop(item, finalIndex, id);
      }
      // If it's an existing element being reordered
      else {
        onReorder(item.id, finalIndex, id);
      }

      setDropIndicatorIndex(null);
      setDropIndicatorPosition(null);
      return { id }; // Indicate that we handled the drop
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
            {content}
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
      case "image":
        return (
          <div>
            {imageUrl ? (
              <Image
                src={imageUrl || "/placeholder.svg"}
                alt={content || "Image"}
                width={500}
                height={500}
                style={{ ...styles, width: "100%" }}
              />
            ) : (
              <div className="flex h-32 w-full items-center justify-center bg-muted text-muted-foreground">
                No image selected
              </div>
            )}
          </div>
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
              backgroundImage: styles.backgroundImage || "none",
              backgroundSize: styles.backgroundSize || "cover",
              backgroundPosition: "center",
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

            {/* Enhanced drop indicators for grid */}
            {editMode && isOver && dropIndicatorIndex !== null && (
              <div
                className="absolute left-0 right-0 h-2 bg-primary z-10 transition-all"
                style={{
                  top:
                    dropIndicatorIndex === 0
                      ? 0 // Position at the very top when index is 0
                      : dropIndicatorIndex >= (children?.length || 0)
                      ? "100%" // Position at the very bottom when at the end
                      : `${
                          (dropIndicatorIndex / (children?.length || 1)) * 100
                        }%`,
                  transform:
                    dropIndicatorIndex === 0 ||
                    dropIndicatorIndex >= (children?.length || 0)
                      ? "translateY(0)" // No transform needed at the edges
                      : "translateY(-50%)", // Center on other positions
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
              backgroundImage: styles.backgroundImage || "none",
              backgroundSize: styles.backgroundSize || "cover",
              backgroundPosition: "center",
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

            {/* Enhanced drop indicators for row */}
            {editMode && isOver && dropIndicatorIndex !== null && (
              <div
                className="absolute top-0 bottom-0 w-2 bg-primary z-10 transition-all"
                style={{
                  left:
                    dropIndicatorIndex === 0 && dropIndicatorPosition === "left"
                      ? 0 // Position at the very left when index is 0
                      : dropIndicatorPosition === "right"
                      ? `calc(${
                          (dropIndicatorIndex + 1) *
                          (100 / (children?.length || 1))
                        }%)`
                      : `${
                          dropIndicatorIndex * (100 / (children?.length || 1))
                        }%`,
                  transform:
                    dropIndicatorIndex === 0 && dropIndicatorPosition === "left"
                      ? "translateX(0)" // No transform needed at the left edge
                      : "translateX(-50%)", // Center on other positions
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
          // !element.parentId && (type !== "grid" || type !== "row") ? "p-4" : "",
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
