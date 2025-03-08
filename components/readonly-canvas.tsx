"use client";

import type React from "react";
import type { ElementType, PageElement } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ReadOnlyCanvasProps {
  elements: PageElement[];
  className?: string; // Optional className for custom styling
}

interface ReadOnlyElementRendererProps {
  element: PageElement;
  index: number;
}

// Read-only version of ElementRenderer
function ReadOnlyElementRenderer({
  element,
  index,
}: ReadOnlyElementRendererProps) {
  const { id, type, content, styles, children, params } = element;

  // Simplified renderParam function without edit-mode logic
  const renderParam = (str: string) => {
    const match = str.match(/\{\{(\w+)\.(\w+)\}\}/);
    if (params && match) {
      const [_, , property] = match; // Ignore the object part since we know it's params
      return params[property] || str; // Fallback to original string if param not found
    }
    return str;
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
          <div style={styles} className="relative w-full flex-1">
            {children && children.length > 0 ? (
              <div
                className="grid"
                style={{
                  gridTemplateColumns:
                    styles.gridTemplateColumns || "repeat(2, 1fr)",
                }}
              >
                {children.map((child, childIndex) => (
                  <ReadOnlyElementRenderer
                    key={child.id}
                    element={child}
                    index={childIndex}
                  />
                ))}
              </div>
            ) : null}
          </div>
        );
      case "row":
        return (
          <div style={styles} className="relative w-full flex-1">
            {children && children.length > 0 ? (
              <div
                className="flex flex-row w-full"
                style={{ gap: styles.gap || "1rem" }}
              >
                {children.map((child, childIndex) => (
                  <ReadOnlyElementRenderer
                    key={child.id}
                    element={child}
                    index={childIndex}
                  />
                ))}
              </div>
            ) : null}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "relative mb-2 w-full",
        !element.parentId && (type !== "grid" || type !== "row") ? "p-4" : ""
      )}
    >
      <div className="w-full">{renderElement()}</div>
    </div>
  );
}

// Main ReadOnlyCanvas component
export function ReadOnlyCanvas({ elements, className }: ReadOnlyCanvasProps) {
  return (
    <div
      className={cn(
        "flex flex-1 overflow-auto bg-muted/40 p-6 md:p-0", // Full-screen preview styling
        className
      )}
    >
      <div className="mx-auto flex flex-col items-center justify-start w-full">
        <div className="relative h-svh w-full">
          <div
            id="canvas"
            className={cn(
              "relative overflow-y-auto bg-background flex flex-col size-full" // Full height and width
            )}
          >
            {elements.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground p-4 text-center">
                No content to display
              </div>
            ) : (
              <>
                {elements.map((element, index) => (
                  <ReadOnlyElementRenderer
                    key={element.id}
                    element={element}
                    index={index}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
