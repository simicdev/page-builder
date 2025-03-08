"use client";

import type React from "react";

import { useState } from "react";
import { Trash2, Upload } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

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
  const [imageUrl, setImageUrl] = useState(element.imageUrl || "");

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

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    onUpdate(element.id, { imageUrl: url });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload to a server and get a URL back
      // For this demo, we'll use a local object URL
      const url = URL.createObjectURL(file);
      handleImageUrlChange(url);
    }
  };

  const fontFamilies = [
    { value: "Arial, sans-serif", label: "Arial" },
    { value: "Helvetica, sans-serif", label: "Helvetica" },
    { value: "Georgia, serif", label: "Georgia" },
    { value: "Times New Roman, serif", label: "Times New Roman" },
    { value: "Courier New, monospace", label: "Courier New" },
    { value: "Verdana, sans-serif", label: "Verdana" },
    { value: "system-ui, sans-serif", label: "System UI" },
  ];

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

      <Tabs defaultValue="content" className="mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
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

          {element.type === "image" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="imageUpload">Upload Image</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("imageUpload")?.click()
                    }
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </Button>
                </div>
              </div>
              {imageUrl && (
                <div className="mt-2">
                  <Label>Preview</Label>
                  <div className="mt-1 rounded-md border border-border overflow-hidden">
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt="Preview"
                      className="max-w-full h-auto"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="style" className="space-y-4">
          {(element.type === "heading" || element.type === "text") && (
            <>
              <div>
                <Label htmlFor="fontFamily" className="text-xs">
                  Font Family
                </Label>
                <Select
                  value={element.styles.fontFamily || "Arial, sans-serif"}
                  onValueChange={(value) =>
                    handleStyleChange("fontFamily", value)
                  }
                >
                  <SelectTrigger className="mt-1 h-8">
                    <SelectValue placeholder="Select font family" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontFamilies.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fontSize" className="text-xs">
                  Font Size
                </Label>
                <Input
                  id="fontSize"
                  value={
                    element.styles.fontSize
                      ?.replace("rem", "")
                      .replace("px", "") || "1"
                  }
                  onChange={(e) =>
                    handleStyleChange("fontSize", `${e.target.value}rem`)
                  }
                  className="mt-1 h-8"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Bold</Label>
                  <div className="mt-1">
                    <Switch
                      checked={element.styles.fontWeight === "bold"}
                      onCheckedChange={(checked) =>
                        handleStyleChange(
                          "fontWeight",
                          checked ? "bold" : "normal"
                        )
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Italic</Label>
                  <div className="mt-1">
                    <Switch
                      checked={element.styles.fontStyle === "italic"}
                      onCheckedChange={(checked) =>
                        handleStyleChange(
                          "fontStyle",
                          checked ? "italic" : "normal"
                        )
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Underline</Label>
                  <div className="mt-1">
                    <Switch
                      checked={element.styles.textDecoration === "underline"}
                      onCheckedChange={(checked) =>
                        handleStyleChange(
                          "textDecoration",
                          checked ? "underline" : "none"
                        )
                      }
                    />
                  </div>
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
                    value={element.styles.color || "#000000"}
                    onChange={(e) => handleStyleChange("color", e.target.value)}
                    className="mt-1 h-8 w-12"
                  />
                  <Input
                    value={element.styles.color || "#000000"}
                    onChange={(e) => handleStyleChange("color", e.target.value)}
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
          )}

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
                    onChange={(e) => handleStyleChange("color", e.target.value)}
                    className="mt-1 h-8 w-12"
                  />
                  <Input
                    value={element.styles.color || "#ffffff"}
                    onChange={(e) => handleStyleChange("color", e.target.value)}
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
                      ?.replace("rem", "")
                      .replace("px", "") || "0.25"
                  }
                  onChange={(e) =>
                    handleStyleChange("borderRadius", `${e.target.value}rem`)
                  }
                  type="number"
                  step="0.05"
                  min="0"
                  max="2"
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
                <Label htmlFor="gap" className="text-xs">
                  Gap
                </Label>
                <Input
                  id="gap"
                  value={element.styles.gap?.replace("rem", "") || "1"}
                  onChange={(e) =>
                    handleStyleChange("gap", `${e.target.value}rem`)
                  }
                  className="mt-1 h-8"
                />
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
                <Label htmlFor="backgroundImage" className="text-xs">
                  Background Image URL
                </Label>
                <Input
                  id="backgroundImage"
                  value={
                    element.styles.backgroundImage
                      ?.replace('url("', "")
                      .replace('")', "") || ""
                  }
                  onChange={(e) => {
                    const url = e.target.value
                      ? `url("${e.target.value}")`
                      : "";
                    handleStyleChange("backgroundImage", url);
                  }}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1 h-8"
                />
              </div>
              <div>
                <Label htmlFor="backgroundSize" className="text-xs">
                  Background Size
                </Label>
                <Select
                  value={element.styles.backgroundSize || "cover"}
                  onValueChange={(value) =>
                    handleStyleChange("backgroundSize", value)
                  }
                >
                  <SelectTrigger className="mt-1 h-8">
                    <SelectValue placeholder="Select background size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cover">Cover</SelectItem>
                    <SelectItem value="contain">Contain</SelectItem>
                    <SelectItem value="100%">100%</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
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

          {element.type === "image" && (
            <>
              <div>
                <Label htmlFor="objectFit" className="text-xs">
                  Object Fit
                </Label>
                <Select
                  value={element.styles.objectFit || "cover"}
                  onValueChange={(value) =>
                    handleStyleChange("objectFit", value)
                  }
                >
                  <SelectTrigger className="mt-1 h-8">
                    <SelectValue placeholder="Select object fit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cover">Cover</SelectItem>
                    <SelectItem value="contain">Contain</SelectItem>
                    <SelectItem value="fill">Fill</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="scale-down">Scale Down</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="borderRadius" className="text-xs">
                  Height
                </Label>
                <Input
                  id="borderRadius"
                  value={
                    element.styles.height
                      ?.replace("px", "")
                      .replace("px", "") || "0"
                  }
                  onChange={(e) =>
                    handleStyleChange("height", `${e.target.value}px`)
                  }
                  type="number"
                  step="1"
                  min="10"
                  max="500"
                  className="mt-1 h-8"
                />
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
                      .replace("px", "") || "0"
                  }
                  onChange={(e) =>
                    handleStyleChange("borderRadius", `${e.target.value}px`)
                  }
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  className="mt-1 h-8"
                />
              </div>
            </>
          )}

          {/* Common styles for all elements */}
          <div>
            <Label htmlFor="padding" className="text-xs">
              Padding
            </Label>
            <Input
              id="padding"
              value={element.styles.padding?.replace("rem", "") || "1"}
              onChange={(e) =>
                handleStyleChange("padding", `${e.target.value}rem`)
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
              value={element.styles.margin?.replace("rem", "") || "0"}
              onChange={(e) =>
                handleStyleChange("margin", `${e.target.value}rem`)
              }
              className="mt-1 h-8"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
