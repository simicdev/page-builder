"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { PageElement } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PropertiesPanelProps {
  element: PageElement;
  onUpdate: (id: string, updates: Partial<PageElement>) => void;
  onDelete: (id: string) => void;
}

export function PropertiesPanel({
  element,
  onUpdate,
  onDelete,
}: PropertiesPanelProps) {
  const [content, setContent] = useState(element.content);

  const handleContentChange = (value: string) => {
    setContent(value);
    onUpdate(element.id, { content: value });
  };

  const handleStyleChange = (property: string, value: string) => {
    onUpdate(element.id, {
      styles: {
        ...element.styles,
        [property]: value,
      },
    });
  };

  return (
    <div className="w-72 border-l border-border bg-card p-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold capitalize">
          {element.type} Properties
        </h3>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => onDelete(element.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 space-y-4">
        {(element.type === "heading" ||
          element.type === "text" ||
          element.type === "button") && (
          <div>
            <Label htmlFor="content">Content</Label>
            {element.type === "text" ? (
              <Textarea
                id="content"
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                className="mt-1"
              />
            ) : (
              <Input
                id="content"
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                className="mt-1"
              />
            )}
          </div>
        )}

        <div>
          <Label>Styles</Label>
          <div className="mt-2 space-y-2">
            {element.type === "heading" || element.type === "text" ? (
              <>
                <div>
                  <Label htmlFor="fontSize" className="text-xs">
                    Font Size
                  </Label>
                  <Input
                    id="fontSize"
                    type="number"
                    min={4}
                    max={80}
                    value={element.styles.fontSize?.replace("px", "") || ""}
                    onChange={(e) =>
                      handleStyleChange(
                        "fontSize",
                        `${e.target.valueAsNumber}px`
                      )
                    }
                    className="mt-1 h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="color" className="text-xs">
                    Color
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={element.styles.color || "#000000"}
                      onChange={(e) =>
                        handleStyleChange("color", e.target.value)
                      }
                      className="mt-1 h-8 w-12"
                    />
                    <Input
                      value={element.styles.color || "#000000"}
                      onChange={(e) =>
                        handleStyleChange("color", e.target.value)
                      }
                      className="mt-1 h-8 flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="textAlign" className="text-xs">
                    Text Align
                  </Label>
                  <Select
                    value={element.styles.textAlign || "left"}
                    onValueChange={(value) =>
                      handleStyleChange("textAlign", value)
                    }
                  >
                    <SelectTrigger className="mt-1 h-8">
                      <SelectValue placeholder="Select alignment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                      <SelectItem value="justify">Justify</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : null}

            {element.type === "button" && (
              <>
                <div>
                  <Label htmlFor="backgroundColor" className="text-xs">
                    Background Color
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={element.styles.backgroundColor || "#3b82f6"}
                      onChange={(e) =>
                        handleStyleChange("backgroundColor", e.target.value)
                      }
                      className="mt-1 h-8 w-12"
                    />
                    <Input
                      value={element.styles.backgroundColor || "#3b82f6"}
                      onChange={(e) =>
                        handleStyleChange("backgroundColor", e.target.value)
                      }
                      className="mt-1 h-8 flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="color" className="text-xs">
                    Text Color
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={element.styles.color || "#ffffff"}
                      onChange={(e) =>
                        handleStyleChange("color", e.target.value)
                      }
                      className="mt-1 h-8 w-12"
                    />
                    <Input
                      value={element.styles.color || "#ffffff"}
                      onChange={(e) =>
                        handleStyleChange("color", e.target.value)
                      }
                      className="mt-1 h-8 flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="borderRadius" className="text-xs">
                    Border Radius
                  </Label>
                  <Input
                    id="borderRadius"
                    value={
                      element.styles.borderRadius
                        ?.replace("px", "")
                        .replace("px", "") || "0.25"
                    }
                    onChange={(e) =>
                      handleStyleChange("borderRadius", `${e.target.value}px`)
                    }
                    type="number"
                    step="0.05"
                    min="0"
                    max="100"
                    className="mt-1 h-8"
                  />
                </div>
              </>
            )}

            {(element.type === "grid" || element.type === "row") && (
              <>
                {element.type === "grid" && (
                  <div>
                    <Label htmlFor="gridColumns" className="text-xs">
                      Grid Columns
                    </Label>
                    <Input
                      id="gridColumns"
                      value={
                        element.styles.gridTemplateColumns
                          ?.replace("repeat(", "")
                          .replace(", 1fr)", "") || "2"
                      }
                      onChange={(e) =>
                        handleStyleChange(
                          "gridTemplateColumns",
                          `repeat(${e.target.value}, 1fr)`
                        )
                      }
                      type="number"
                      min="1"
                      max="12"
                      className="mt-1 h-8"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="gap" className="text-xs">
                    Gap
                  </Label>
                  <Input
                    id="gap"
                    value={element.styles.gap?.replace("px", "") || "1"}
                    onChange={(e) =>
                      handleStyleChange("gap", `${e.target.value}px`)
                    }
                    className="mt-1 h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="gap" className="text-xs">
                    Justify content
                  </Label>
                  <div className="mt-1">
                    <Button
                      onClick={() => {
                        handleStyleChange("justifyContent", `start`);
                      }}
                    >
                      Start
                    </Button>{" "}
                    <Button
                      onClick={() => {
                        handleStyleChange("justifyContent", `center`);
                      }}
                    >
                      Center
                    </Button>{" "}
                    <Button
                      onClick={() => {
                        handleStyleChange("justifyContent", `end`);
                      }}
                    >
                      End
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="backgroundColor" className="text-xs">
                    Background Color
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={element.styles.backgroundColor || "#ffffff"}
                      onChange={(e) =>
                        handleStyleChange("backgroundColor", e.target.value)
                      }
                      className="mt-1 h-8 w-12"
                    />
                    <Input
                      value={element.styles.backgroundColor || "#ffffff"}
                      onChange={(e) =>
                        handleStyleChange("backgroundColor", e.target.value)
                      }
                      className="mt-1 h-8 flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="borderStyle" className="text-xs">
                    Border Style
                  </Label>
                  <Select
                    value={element.styles.borderStyle || "dashed"}
                    onValueChange={(value) =>
                      handleStyleChange("borderStyle", value)
                    }
                  >
                    <SelectTrigger className="mt-1 h-8">
                      <SelectValue placeholder="Select border style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="dashed">Dashed</SelectItem>
                      <SelectItem value="dotted">Dotted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="padding" className="text-xs">
                Padding
              </Label>
              <Input
                id="padding"
                type="number"
                value={element.styles.padding?.replace("px", "") || "1"}
                onChange={(e) =>
                  handleStyleChange("padding", `${e.target.value}px`)
                }
                className="mt-1 h-8"
              />
            </div>

            <div>
              <Label htmlFor="margin" className="text-xs">
                Margin
              </Label>
              <Input
                id="margin"
                type="number"
                min={0}
                max={60}
                value={element.styles.margin?.replace("px", "") || "0"}
                onChange={(e) =>
                  handleStyleChange("margin", `${e.target.valueAsNumber}px`)
                }
                className="mt-1 h-8"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
