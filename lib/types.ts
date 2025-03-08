import type React from "react";
export type ElementType =
  | "heading"
  | "text"
  | "button"
  | "grid"
  | "row"
  | "image";

export interface PageElement {
  id: string;
  type: ElementType;
  position: {
    x: number;
    y: number;
  };
  content: string;
  styles: Record<string, string>;
  children?: PageElement[]; // Add support for child elements
  parentId?: string; // Track parent element
  imageUrl?: string; // For image elements
}

export interface DraggableItemProps {
  type: ElementType;
  label: string;
  icon: React.ReactNode;
}

export const catBlogData: {
  params: Record<string, string>;
  elements: PageElement[];
} = {
  params: {
    name: "Stefan Simic",
  },
  elements: [
    {
      id: "hero-heading",
      type: "heading",
      position: {
        x: 0,
        y: 0,
      },
      content: "CodeCraft Solutions",
      styles: {
        fontSize: "3rem",
        fontWeight: "700",
        color: "#1a202c",
        textAlign: "center",
        marginTop: "2rem",
        marginBottom: "1rem",
        textTransform: "uppercase",
        letterSpacing: "1px",
      },
    },
    {
      id: "hero-text",
      type: "text",
      position: {
        x: 0,
        y: 1,
      },
      content:
        "Building cutting-edge software solutions with passion and precision. From web apps to enterprise systems, we craft code that powers your success.",
      styles: {
        fontSize: "1.25rem",
        color: "#4a5568",
        textAlign: "center",
        maxWidth: "700px",
        marginLeft: "auto",
        marginRight: "auto",
        marginBottom: "2rem",
        lineHeight: "1.8",
      },
    },
    {
      id: "hero-cta",
      type: "button",
      position: {
        x: 0,
        y: 2,
      },
      content: "Get a Free Quote",
      styles: {
        padding: "1rem 2rem",
        backgroundColor: "#2b6cb0",
        color: "#ffffff",
        borderRadius: "8px",
        fontSize: "1.2rem",
        fontWeight: "600",
        border: "none",
        cursor: "pointer",
        display: "block",
        marginLeft: "auto",
        marginRight: "auto",
        marginBottom: "3rem",
        transition: "background-color 0.3s",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      },
    },
    {
      id: "services-grid",
      type: "grid",
      position: {
        x: 0,
        y: 3,
      },
      content: "",
      styles: {
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "2rem",
        padding: "2rem",
        maxWidth: "1200px",
        marginLeft: "auto",
        marginRight: "auto",
        backgroundColor: "#f7fafc",
      },
      children: [
        {
          id: "service-1",
          type: "text",
          position: {
            x: 0,
            y: 0,
          },
          content:
            "Web Development\nCustom websites built with modern tech stacks.",
          styles: {
            fontSize: "1rem",
            color: "#2d3748",
            backgroundColor: "#ffffff",
            padding: "1.5rem",
            borderRadius: "12px",
            textAlign: "center",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
            whiteSpace: "pre-line",
          },
          parentId: "services-grid",
        },
        {
          id: "service-2",
          type: "text",
          position: {
            x: 1,
            y: 0,
          },
          content: "Mobile Apps\nNative and cross-platform app solutions.",
          styles: {
            fontSize: "1rem",
            color: "#2d3748",
            backgroundColor: "#ffffff",
            padding: "1.5rem",
            borderRadius: "12px",
            textAlign: "center",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
            whiteSpace: "pre-line",
          },
          parentId: "services-grid",
        },
        {
          id: "service-3",
          type: "text",
          position: {
            x: 2,
            y: 0,
          },
          content:
            "Cloud Solutions\nScalable infrastructure for your business.",
          styles: {
            fontSize: "1rem",
            color: "#2d3748",
            backgroundColor: "#ffffff",
            padding: "1.5rem",
            borderRadius: "12px",
            textAlign: "center",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
            whiteSpace: "pre-line",
          },
          parentId: "services-grid",
        },
      ],
    },
    {
      id: "testimonials-row",
      type: "row",
      position: {
        x: 0,
        y: 4,
      },
      content: "",
      styles: {
        gap: "2rem",
        padding: "2rem",
        maxWidth: "1200px",
        marginLeft: "auto",
        marginRight: "auto",
        backgroundColor: "#edf2f7",
      },
      children: [
        {
          id: "testimonial-1",
          type: "text",
          position: {
            x: 0,
            y: 0,
          },
          content:
            '"CodeCraft delivered an amazing app on time and exceeded our expectations!" - TechCorp',
          styles: {
            fontSize: "1rem",
            color: "#4a5568",
            fontStyle: "italic",
            backgroundColor: "#ffffff",
            padding: "1.5rem",
            borderRadius: "10px",
            flex: "1",
            textAlign: "center",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
          },
          parentId: "testimonials-row",
        },
        {
          id: "testimonial-2",
          type: "text",
          position: {
            x: 1,
            y: 0,
          },
          content:
            '"Their team transformed our vision into a robust cloud platform." - InnovateLabs',
          styles: {
            fontSize: "1rem",
            color: "#4a5568",
            fontStyle: "italic",
            backgroundColor: "#ffffff",
            padding: "1.5rem",
            borderRadius: "10px",
            flex: "1",
            textAlign: "center",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
          },
          parentId: "testimonials-row",
        },
      ],
    },
  ],
};
