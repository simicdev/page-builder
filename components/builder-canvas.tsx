"use client";

import type React from "react";

import { useState, useRef, createContext } from "react";
import { useDrop } from "react-dnd";
import type { ElementType, PageElement } from "@/lib/types";
import { ElementRenderer } from "./element-renderer";
import { PropertiesPanel } from "./properties-panel";
import { X } from "lucide-react";

// Create a context to share the selected element ID
export const SelectedElementContext = createContext<string | null>(null);

interface BuilderCanvasProps {
  elements: PageElement[];
  selectedElement: string | null;
  onDrop: (
    item: { type: ElementType; id?: string },
    position: number,
    targetId?: string
  ) => void;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<PageElement>) => void;
  onDelete: (id: string) => void;
  onReorder: (id: string, newIndex: number, targetId?: string) => void;
  editMode: boolean;
  onDeselect: () => void;
  showSidebar: boolean;
  onToggleSidebar: () => void;
}

export function BuilderCanvas({
  elements,
  selectedElement,
  onDrop,
  onSelect,
  onUpdate,
  onDelete,
  onReorder,
  editMode,
  onDeselect,
  showSidebar,
  onToggleSidebar,
}: BuilderCanvasProps) {
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(
    null
  );
  const canvasRef = useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop({
    accept: ["element", "placed-element"],
    hover: (item, monitor) => {
      if (!editMode || !canvasRef.current) return;

      // Get mouse position
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      // Get canvas bounds
      const canvasRect = canvasRef.current.getBoundingClientRect();

      // Check if mouse is within canvas bounds
      if (
        clientOffset.x < canvasRect.left ||
        clientOffset.x > canvasRect.right ||
        clientOffset.y < canvasRect.top ||
        clientOffset.y > canvasRect.bottom
      ) {
        setDropIndicatorIndex(null);
        return;
      }

      const relativeY = clientOffset.y - canvasRect.top;
      const elementCount = elements.length || 1;

      // Special handling for the top area
      if (relativeY < 10) {
        setDropIndicatorIndex(0);
        return;
      }

      // Special handling for the bottom area
      if (relativeY > canvasRect.height - 10) {
        setDropIndicatorIndex(elementCount);
        return;
      }

      // Calculate which element we're hovering over
      const elementHeight = canvasRect.height / elementCount;
      const hoverIndex = Math.floor(relativeY / elementHeight);

      // Calculate position within the element (0-1)
      const positionInElement =
        (relativeY - hoverIndex * elementHeight) / elementHeight;

      // Create more distinct drop zones - top third, middle third, bottom third
      let targetIndex = hoverIndex;

      if (positionInElement < 0.33) {
        // Top third of the element - drop before
        targetIndex = hoverIndex;
      } else if (positionInElement > 0.66) {
        // Bottom third of the element - drop after
        targetIndex = hoverIndex + 1;
      } else {
        // Middle of the element - drop after
        targetIndex = hoverIndex + 1;
      }

      // Clamp index to valid range
      const maxIndex = elements.length;
      const clampedIndex = Math.max(0, Math.min(targetIndex, maxIndex));

      setDropIndicatorIndex(clampedIndex);
    },
    drop: (item: { type: ElementType; id?: string }, monitor) => {
      if (!editMode) return;

      // Check if dropped on a nested target
      if (monitor.didDrop()) {
        return;
      }

      // Check if mouse is within canvas bounds
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset || !canvasRef.current) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      if (
        clientOffset.x < canvasRect.left ||
        clientOffset.x > canvasRect.right ||
        clientOffset.y < canvasRect.top ||
        clientOffset.y > canvasRect.bottom
      ) {
        return;
      }

      // If it's a new element
      if (!item.id) {
        onDrop(
          item,
          dropIndicatorIndex !== null ? dropIndicatorIndex : elements.length
        );
      }
      // If it's an existing element being reordered
      else {
        onReorder(
          item.id,
          dropIndicatorIndex !== null ? dropIndicatorIndex : elements.length
        );
      }

      setDropIndicatorIndex(null);
      return undefined;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
    }),
  });

  const selectedElementData = findElementById(elements, selectedElement);

  // Recursive function to find an element by ID
  function findElementById(
    elements: PageElement[],
    id: string | null
  ): PageElement | undefined {
    if (!id) return undefined;

    for (const element of elements) {
      if (element.id === id) {
        return element;
      }
      if (element.children?.length) {
        const found = findElementById(element.children, id);
        if (found) return found;
      }
    }
    return undefined;
  }

  // Handle click on canvas background to deselect
  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on the canvas, not on an element
    if (e.target === canvasRef.current) {
      onDeselect();
    }
  };

  // Handle element click - this will be passed down to all elements
  const handleElementClick = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onSelect(id);
  };

  return (
    <SelectedElementContext.Provider value={selectedElement}>
      <div className="flex flex-1">
        <div className="relative flex-1 overflow-auto p-8 bg-muted/40">
          <div
            ref={drop}
            className="mx-auto flex flex-col items-center justify-start"
          >
            {/* Canvas with iPhone dimensions but no frame */}
            <div className="relative shadow-lg">
              {/* Actual canvas */}
              <div
                id="canvas"
                ref={canvasRef}
                onClick={handleCanvasClick}
                className={`relative p-6 w-[990px] h-[844px] overflow-y-auto overflow-hidden rounded-2xl bg-background flex flex-col gap-10 ${
                  isOver ? "ring-2 ring-primary" : ""
                }`}
              >
                {elements.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground p-4 text-center">
                    Drag and drop elements here to build your mobile page
                  </div>
                ) : (
                  <>
                    {elements.map((element, index) => (
                      <ElementRenderer
                        key={element.id}
                        element={element}
                        index={index}
                        selectedElement={selectedElement!}
                        isSelected={element.id === selectedElement}
                        onClick={handleElementClick}
                        onDrop={onDrop}
                        onReorder={onReorder}
                        editMode={editMode}
                      />
                    ))}

                    {/* Enhanced drop indicator */}
                    {editMode && isOver && dropIndicatorIndex !== null && (
                      <div
                        className="absolute left-0 right-0 h-2 bg-primary z-10 transition-all"
                        style={{
                          top:
                            dropIndicatorIndex === 0
                              ? 0 // Position at the very top when index is 0
                              : dropIndicatorIndex >= elements.length
                              ? "100%" // Position at the very bottom when at the end
                              : `${
                                  (dropIndicatorIndex /
                                    Math.max(1, elements.length)) *
                                  100
                                }%`,
                          transform:
                            dropIndicatorIndex === 0 ||
                            dropIndicatorIndex >= elements.length
                              ? "translateY(0)" // No transform needed at the edges
                              : "translateY(-50%)", // Center on other positions
                        }}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Always show properties panel with toggle button */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            showSidebar ? "w-72" : "w-0"
          } relative`}
        >
          {showSidebar && selectedElementData && editMode ? (
            <PropertiesPanel
              element={selectedElementData}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ) : null}

          {/* Toggle button for sidebar */}
          <button
            onClick={onToggleSidebar}
            className="absolute -left-8 top-4 bg-card border border-border rounded-l-md p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </SelectedElementContext.Provider>
  );
}
