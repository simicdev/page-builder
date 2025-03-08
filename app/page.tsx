"use client";

import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { BuilderSidebar } from "@/components/builder-sidebar";
import { BuilderCanvas } from "@/components/builder-canvas";
import { catBlogData, type ElementType, type PageElement } from "@/lib/types";
import { ElementRenderer } from "@/components/element-renderer";
import { ReadOnlyCanvas } from "@/components/readonly-canvas";

export default function PageBuilder() {
  const [elements, setElements] = useState<PageElement[]>(catBlogData.elements);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<boolean>(true);
  const [livePreview, setLivePreview] = useState(false);
  const [showSidebar, setShowSidebar] = useState<boolean>(true); // New state for sidebar visibility

  // Load saved layout on initial render
  useEffect(() => {
    const savedLayout = localStorage.getItem("pageBuilderLayout");
    if (savedLayout) {
      try {
        setElements(JSON.parse(savedLayout));
      } catch (e) {
        console.error("Failed to load saved layout:", e);
      }
    }
  }, []);

  // Handle dropping an element onto the canvas or container
  const handleDrop = (
    item: { type: ElementType; id?: string },
    position: number,
    targetId?: string
  ) => {
    const newElement: PageElement = {
      id: `element-${Date.now()}`,
      type: item.type,
      position: { x: 0, y: 0 }, // We don't use absolute positioning anymore
      content: getDefaultContent(item.type),
      styles: getDefaultStyles(item.type),
      parentId: targetId,
      children: item.type === "grid" || item.type === "row" ? [] : undefined,
    };

    if (targetId) {
      // Add to a container element (recursive function)
      const addToContainer = (elements: PageElement[]): PageElement[] => {
        return elements.map((el) => {
          if (el.id === targetId) {
            // Insert at the specified position
            const newChildren = [...(el.children || [])];
            newChildren.splice(position, 0, newElement);
            return {
              ...el,
              children: newChildren,
            };
          }
          if (el.children?.length) {
            return {
              ...el,
              children: addToContainer(el.children),
            };
          }
          return el;
        });
      };

      setElements(addToContainer(elements));
    } else {
      // Add to the root canvas at the specified position
      const newElements = [...elements];
      newElements.splice(position, 0, newElement);
      setElements(newElements);
    }
  };

  // Handle reordering elements
  const handleReorder = (id: string, newIndex: number, targetId?: string) => {
    // First, find and remove the element
    let elementToMove: PageElement | undefined;
    let sourceParentId: string | undefined;

    // Recursive function to find and remove the element
    const removeElement = (
      elements: PageElement[],
      parentId?: string
    ): PageElement[] => {
      const result = [];

      for (const el of elements) {
        if (el.id === id) {
          elementToMove = el;
          sourceParentId = parentId;
          continue; // Skip this element (remove it)
        }

        if (el.children?.length) {
          const newChildren = removeElement(el.children, el.id);
          result.push({
            ...el,
            children: newChildren,
          });
        } else {
          result.push(el);
        }
      }

      return result;
    };

    // Remove the element from its current position
    const newElements = removeElement(elements);

    if (!elementToMove) return; // Element not found

    // Now insert the element at the new position
    if (targetId) {
      // Moving to a container
      const insertIntoContainer = (elements: PageElement[]): PageElement[] => {
        return elements.map((el) => {
          if (el.id === targetId) {
            // Insert at the specified position
            const newChildren = [...(el.children || [])];
            newChildren.splice(newIndex, 0, {
              ...elementToMove!,
              parentId: targetId,
            });
            return {
              ...el,
              children: newChildren,
            };
          }
          if (el.children?.length) {
            return {
              ...el,
              children: insertIntoContainer(el.children),
            };
          }
          return el;
        });
      };

      setElements(insertIntoContainer(newElements));
    } else {
      // Moving to the root canvas
      const result = [...newElements];
      result.splice(newIndex, 0, {
        ...elementToMove,
        parentId: undefined,
      });
      setElements(result);
    }
  };

  const handleSelect = (id: string) => {
    // Always set the selected element to the clicked element
    setSelectedElement(id);
  };

  // New handler for deselecting elements
  const handleDeselect = () => {
    setSelectedElement(null);
  };

  const handleUpdate = (id: string, updates: Partial<PageElement>) => {
    // Recursive function to update nested elements
    const updateElement = (elements: PageElement[]): PageElement[] => {
      return elements.map((el) => {
        if (el.id === id) {
          return { ...el, ...updates };
        }
        if (el.children?.length) {
          return {
            ...el,
            children: updateElement(el.children),
          };
        }
        return el;
      });
    };

    setElements(updateElement(elements));
  };

  const handleDelete = (id: string) => {
    // Recursive function to remove an element
    const removeElement = (elements: PageElement[]): PageElement[] => {
      return elements
        .filter((el) => el.id !== id)
        .map((el) => {
          if (el.children?.length) {
            return {
              ...el,
              children: removeElement(el.children),
            };
          }
          return el;
        });
    };

    setElements(removeElement(elements));

    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  // Function to save the current layout
  const handleSave = () => {
    localStorage.setItem("pageBuilderLayout", JSON.stringify(elements));
    alert("Layout saved successfully!");
  };

  // Function to load a saved layout
  const handleLoad = () => {
    const savedLayout = localStorage.getItem("pageBuilderLayout");
    if (savedLayout) {
      try {
        setElements(JSON.parse(savedLayout));
        alert("Layout loaded successfully!");
      } catch (e) {
        alert("Failed to load layout: Invalid format");
      }
    } else {
      alert("No saved layout found!");
    }
  };

  console.log(elements);

  // Toggle sidebar visibility
  const handleToggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen flex-col bg-background">
        <div className="flex items-center justify-between border-b p-4">
          <h1 className="text-lg font-semibold">Mobile Page Builder</h1>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground"
            >
              Save Layout
            </button>
            <button
              onClick={handleLoad}
              className="rounded-md bg-secondary px-3 py-1 text-sm text-secondary-foreground"
            >
              Load Layout
            </button>
            <button
              onClick={() => setEditMode(!editMode)}
              className={`rounded-md px-3 py-1 text-sm ${
                editMode
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {editMode ? "Preview Mode" : "Edit Mode"}
            </button>
            <button
              onClick={() => setLivePreview(!livePreview)}
              className={`rounded-md px-3 py-1 text-sm ${
                !livePreview
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              Live Preview
            </button>
          </div>
        </div>

        {livePreview ? (
          <ReadOnlyCanvas elements={elements} />
        ) : (
          <div className="flex flex-1">
            <BuilderSidebar editMode={editMode} />
            <BuilderCanvas
              elements={elements}
              selectedElement={selectedElement}
              onDrop={handleDrop}
              onSelect={handleSelect}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onReorder={handleReorder}
              editMode={editMode}
              onDeselect={handleDeselect}
              showSidebar={showSidebar}
              onToggleSidebar={handleToggleSidebar}
            />
          </div>
        )}
      </div>
    </DndProvider>
  );
}

function getDefaultContent(type: ElementType): string {
  switch (type) {
    case "heading":
      return "Heading";
    case "text":
      return "Text paragraph";
    case "button":
      return "Button";
    case "grid":
      return "";
    case "row":
      return "";
    default:
      return "";
  }
}

function getDefaultStyles(type: ElementType): Record<string, string> {
  const baseStyles = {
    width: "100%",
    padding: "1rem",
  };

  switch (type) {
    case "heading":
      return {
        ...baseStyles,
        fontSize: "1.5rem",
        fontWeight: "bold",
        textAlign: "left",
      };
    case "text":
      return {
        ...baseStyles,
        fontSize: "1rem",
        lineHeight: "1.5",
      };
    case "button":
      return {
        ...baseStyles,
        backgroundColor: "#3b82f6",
        color: "white",
        padding: "0.5rem 1rem",
        borderRadius: "0.25rem",
        textAlign: "center",
        fontWeight: "500",
      };
    case "grid":
      return {
        ...baseStyles,
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "1rem",
        minHeight: "100px",
        padding: "0.5rem",
      };
    case "row":
      return {
        ...baseStyles,
        display: "flex",
        flexDirection: "row",
        gap: "1rem",
        minHeight: "50px",
        padding: "0.5rem",
      };
    default:
      return baseStyles;
  }
}
