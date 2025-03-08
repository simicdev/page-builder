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

      // Calculate position in the list based on Y coordinate
      const elementHeight = 60; // Approximate height of an element
      const relativeY = clientOffset.y - canvasRect.top;
      const index = Math.floor(relativeY / elementHeight);
      const maxIndex = elements.length;

      // Clamp index to valid range
      const clampedIndex = Math.max(0, Math.min(index, maxIndex));
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

  console.log("selectedElement", { selectedElementData, selectedElement });

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
                className={`relative w-[990px] h-[844px] overflow-y-auto overflow-hidden rounded-2xl bg-background flex flex-col ${
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
                        onClick={handleElementClick}
                        selectedElement={selectedElement}
                        onDrop={onDrop}
                        onReorder={onReorder}
                        editMode={editMode}
                      />
                    ))}

                    {/* Drop indicator */}
                    {editMode && isOver && dropIndicatorIndex !== null && (
                      <div
                        className="absolute left-0 right-0 h-1 bg-primary z-10 transition-all"
                        style={{
                          top: dropIndicatorIndex * 60, // Approximate element height
                          transform: "translateY(-50%)",
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
