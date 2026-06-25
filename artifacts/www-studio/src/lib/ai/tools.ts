// ── AI Canvas Manipulation Tools ────────────────────────────────────────────
// These tools allow the AI chat to directly manipulate the freeform canvas.

import { FreeformElement, makeFreeformElement } from "@/lib/freeform-types";

export interface CanvasTool {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, { type: string; description: string }>;
    required: string[];
  };
  execute: (params: Record<string, any>) => CanvasToolResult;
}

export interface CanvasToolResult {
  success: boolean;
  message: string;
  action?: {
    type: "add" | "update" | "delete" | "move" | "style" | "layout" | "clear";
    elementId?: string;
    updates?: Partial<FreeformElement>;
    element?: FreeformElement;
    elements?: FreeformElement[];
  };
}

// ── Tool: addElement ───────────────────────────────────────────────────────

export const addElementTool: CanvasTool = {
  name: "addElement",
  description: "Add a new element to the canvas. Types: text, image, shape, button, sticker, embed, draw, link-card.",
  parameters: {
    type: "object",
    properties: {
      type: { type: "string", description: "Element type: text, image, shape, button, sticker, embed, draw, link-card" },
      x: { type: "number", description: "X position in pixels" },
      y: { type: "number", description: "Y position in pixels" },
      width: { type: "number", description: "Width in pixels" },
      height: { type: "number", description: "Height in pixels" },
      text: { type: "string", description: "Text content (for text elements)" },
      src: { type: "string", description: "Image URL (for image elements)" },
      fill: { type: "string", description: "Fill color (hex)" },
      label: { type: "string", description: "Button label (for button elements)" },
      href: { type: "string", description: "Link URL (for button elements)" },
      shapeKind: { type: "string", description: "Shape kind: rectangle, circle, triangle, star, diamond, line" },
      borderRadius: { type: "number", description: "Border radius in pixels" },
      color: { type: "string", description: "Text color (hex)" },
      fontSize: { type: "number", description: "Font size in pixels" },
      name: { type: "string", description: "Element name for layer panel" },
    },
    required: ["type"],
  },
  execute: (params) => {
    const el = makeFreeformElement(params.type, {
      x: params.x ?? 100,
      y: params.y ?? 100,
      width: params.width,
      height: params.height,
      text: params.text,
      src: params.src,
      fill: params.fill,
      label: params.label,
      href: params.href,
      shapeKind: params.shapeKind,
      borderRadius: params.borderRadius,
      color: params.color,
      fontSize: params.fontSize,
      name: params.name,
    });
    return {
      success: true,
      message: `Added ${params.type} element "${el.id.slice(0, 8)}"`,
      action: { type: "add", element: el },
    };
  },
};

// ── Tool: removeElement ────────────────────────────────────────────────────

export const removeElementTool: CanvasTool = {
  name: "removeElement",
  description: "Remove an element from the canvas by its ID.",
  parameters: {
    type: "object",
    properties: {
      id: { type: "string", description: "The element ID to remove" },
    },
    required: ["id"],
  },
  execute: (params) => ({
    success: true,
    message: `Removed element "${params.id.slice(0, 8)}"`,
    action: { type: "delete", elementId: params.id },
  }),
};

// ── Tool: moveElement ──────────────────────────────────────────────────────

export const moveElementTool: CanvasTool = {
  name: "moveElement",
  description: "Move an element to a new position.",
  parameters: {
    type: "object",
    properties: {
      id: { type: "string", description: "The element ID to move" },
      x: { type: "number", description: "New X position in pixels" },
      y: { type: "number", description: "New Y position in pixels" },
    },
    required: ["id", "x", "y"],
  },
  execute: (params) => ({
    success: true,
    message: `Moved element to (${params.x}, ${params.y})`,
    action: { type: "move", elementId: params.id, updates: { x: params.x, y: params.y } },
  }),
};

// ── Tool: styleElement ─────────────────────────────────────────────────────

export const styleElementTool: CanvasTool = {
  name: "styleElement",
  description: "Apply styles to an element (color, opacity, rotation, scale, etc).",
  parameters: {
    type: "object",
    properties: {
      id: { type: "string", description: "The element ID to style" },
      fill: { type: "string", description: "Fill/background color (hex)" },
      color: { type: "string", description: "Text color (hex)" },
      opacity: { type: "number", description: "Opacity (0-1)" },
      rotation: { type: "number", description: "Rotation in degrees" },
      scale: { type: "number", description: "Scale factor" },
      borderRadius: { type: "number", description: "Border radius in pixels" },
      fontSize: { type: "number", description: "Font size in pixels" },
      fontWeight: { type: "number", description: "Font weight (100-900)" },
      width: { type: "number", description: "New width" },
      height: { type: "number", description: "New height" },
      text: { type: "string", description: "Update text content" },
      src: { type: "string", description: "Update image source" },
      href: { type: "string", description: "Update link URL" },
      label: { type: "string", description: "Update button label" },
    },
    required: ["id"],
  },
  execute: (params) => {
    const { id, ...updates } = params;
    const filtered = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined));
    return {
      success: true,
      message: `Applied styles to element "${id.slice(0, 8)}"`,
      action: { type: "style", elementId: id, updates: filtered },
    };
  },
};

// ── Tool: layoutElement ────────────────────────────────────────────────────

export const layoutElementTool: CanvasTool = {
  name: "layoutElement",
  description: "Set layout mode for an element (absolute, flex-row, flex-col, grid).",
  parameters: {
    type: "object",
    properties: {
      id: { type: "string", description: "The element ID" },
      layoutMode: { type: "string", description: "Layout mode: absolute, flex-row, flex-col, grid" },
      gap: { type: "number", description: "Gap between children in px" },
      padding: { type: "number", description: "Padding inside container in px" },
      gridColumns: { type: "number", description: "Grid columns (for grid mode)" },
    },
    required: ["id", "layoutMode"],
  },
  execute: (params) => {
    const { id, ...updates } = params;
    return {
      success: true,
      message: `Set layout to "${params.layoutMode}" for element "${id.slice(0, 8)}"`,
      action: { type: "layout", elementId: id, updates },
    };
  },
};

// ── Tool: clearCanvas ──────────────────────────────────────────────────────

export const clearCanvasTool: CanvasTool = {
  name: "clearCanvas",
  description: "Remove all elements from the canvas.",
  parameters: {
    type: "object",
    properties: {},
    required: [],
  },
  execute: () => ({
    success: true,
    message: "Cleared all elements from canvas",
    action: { type: "clear" },
  }),
};

// ── Tool: addText ──────────────────────────────────────────────────────────

export const addTextTool: CanvasTool = {
  name: "addText",
  description: "Add a text element to the canvas.",
  parameters: {
    type: "object",
    properties: {
      text: { type: "string", description: "The text content" },
      x: { type: "number", description: "X position" },
      y: { type: "number", description: "Y position" },
      fontSize: { type: "number", description: "Font size in px" },
      color: { type: "string", description: "Text color (hex)" },
      fontWeight: { type: "number", description: "Font weight" },
    },
    required: ["text"],
  },
  execute: (params) => {
    const el = makeFreeformElement("text", {
      x: params.x ?? 100,
      y: params.y ?? 100,
      text: params.text,
      fontSize: params.fontSize ?? 24,
      color: params.color ?? "#ffffff",
      fontWeight: params.fontWeight ?? 400,
    });
    return {
      success: true,
      message: `Added text: "${params.text.slice(0, 30)}${params.text.length > 30 ? "..." : ""}"`,
      action: { type: "add", element: el },
    };
  },
};

// ── Tool: addImage ─────────────────────────────────────────────────────────

export const addImageTool: CanvasTool = {
  name: "addImage",
  description: "Add an image element to the canvas.",
  parameters: {
    type: "object",
    properties: {
      src: { type: "string", description: "Image URL" },
      x: { type: "number", description: "X position" },
      y: { type: "number", description: "Y position" },
      width: { type: "number", description: "Width in px" },
      height: { type: "number", description: "Height in px" },
      borderRadius: { type: "number", description: "Border radius in px" },
    },
    required: ["src"],
  },
  execute: (params) => {
    const el = makeFreeformElement("image", {
      x: params.x ?? 100,
      y: params.y ?? 100,
      src: params.src,
      width: params.width ?? 300,
      height: params.height ?? 200,
      borderRadius: params.borderRadius ?? 8,
    });
    return {
      success: true,
      message: `Added image element`,
      action: { type: "add", element: el },
    };
  },
};

// ── Tool: addShape ─────────────────────────────────────────────────────────

export const addShapeTool: CanvasTool = {
  name: "addShape",
  description: "Add a shape element (rectangle, circle, star, diamond, triangle).",
  parameters: {
    type: "object",
    properties: {
      shapeKind: { type: "string", description: "Shape type: rectangle, circle, triangle, star, diamond" },
      x: { type: "number", description: "X position" },
      y: { type: "number", description: "Y position" },
      width: { type: "number", description: "Width in px" },
      height: { type: "number", description: "Height in px" },
      fill: { type: "string", description: "Fill color (hex)" },
      borderRadius: { type: "number", description: "Border radius in px" },
    },
    required: ["shapeKind"],
  },
  execute: (params) => {
    const el = makeFreeformElement("shape", {
      x: params.x ?? 100,
      y: params.y ?? 100,
      shapeKind: params.shapeKind,
      width: params.width ?? 120,
      height: params.height ?? 120,
      fill: params.fill ?? "#7FB5A0",
      borderRadius: params.borderRadius ?? 12,
    });
    return {
      success: true,
      message: `Added ${params.shapeKind} shape`,
      action: { type: "add", element: el },
    };
  },
};

// ── Tool: addButton ────────────────────────────────────────────────────────

export const addButtonTool: CanvasTool = {
  name: "addButton",
  description: "Add a button element to the canvas.",
  parameters: {
    type: "object",
    properties: {
      label: { type: "string", description: "Button text" },
      href: { type: "string", description: "Link URL" },
      x: { type: "number", description: "X position" },
      y: { type: "number", description: "Y position" },
      fill: { type: "string", description: "Background color (hex)" },
      color: { type: "string", description: "Text color (hex)" },
    },
    required: ["label"],
  },
  execute: (params) => {
    const el = makeFreeformElement("button", {
      x: params.x ?? 100,
      y: params.y ?? 100,
      label: params.label,
      href: params.href ?? "#",
      fill: params.fill ?? "#3b82f6",
      color: params.color ?? "#ffffff",
    });
    return {
      success: true,
      message: `Added button: "${params.label}"`,
      action: { type: "add", element: el },
    };
  },
};

// ── All tools export ───────────────────────────────────────────────────────

export const ALL_CANVAS_TOOLS: CanvasTool[] = [
  addElementTool,
  removeElementTool,
  moveElementTool,
  styleElementTool,
  layoutElementTool,
  clearCanvasTool,
  addTextTool,
  addImageTool,
  addShapeTool,
  addButtonTool,
];

export function findTool(name: string): CanvasTool | undefined {
  return ALL_CANVAS_TOOLS.find((t) => t.name === name);
}

export function executeToolCall(name: string, params: Record<string, any>): CanvasToolResult {
  const tool = findTool(name);
  if (!tool) {
    return { success: false, message: `Unknown tool: ${name}` };
  }
  try {
    return tool.execute(params);
  } catch (err: any) {
    return { success: false, message: `Tool error: ${err.message}` };
  }
}
