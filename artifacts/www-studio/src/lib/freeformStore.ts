import { useReducer } from "react";
import {
  FreeformElement,
  FreeformPage,
  FreeformBackground,
  Artboard,
  ComponentMaster,
  DEFAULT_BACKGROUND,
  makeFreeformElement,
} from "./freeform-types";
import { DEFAULT_TOKENS } from "./design-tokens";
import type { DesignTokens } from "./design-tokens";

// ── State ────────────────────────────────────────────────────────────────────

export interface FreeformState {
  page:      FreeformPage;
  selectedId: string | null;
  past:       FreeformPage[];
  future:     FreeformPage[];
  isDirty:    boolean;
  snapGrid:   boolean;
  gridSize:   number;
  showGuides: boolean;
  zoom:       number;
  // ── Artboards ─────────────────────
  activeArtboardId: string | null;
  // ── Rulers ────────────────────────
  showRulers: boolean;
}

export type FreeformAction =
  | { type: "LOAD_PAGE";     page: FreeformPage }
  | { type: "SET_NAME";       name: string }
  | { type: "SET_BACKGROUND"; background: FreeformBackground }
  | { type: "ADD_ELEMENT";    el: FreeformElement }
  | { type: "UPDATE_ELEMENT"; id: string; updates: Partial<FreeformElement> }
  | { type: "DELETE_ELEMENT"; id: string }
  | { type: "DUPLICATE_ELEMENT"; id: string }
  | { type: "MOVE_ELEMENT";    id: string; x: number; y: number }
  | { type: "RESIZE_ELEMENT";  id: string; width: number; height: number }
  | { type: "ROTATE_ELEMENT";  id: string; rotation: number }
  | { type: "SET_ZINDEX";      id: string; zIndex: number }
  | { type: "SEND_FORWARD";    id: string }
  | { type: "SEND_BACKWARD";   id: string }
  | { type: "SELECT";          id: string | null }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "TOGGLE_SNAP" }
  | { type: "TOGGLE_GUIDES" }
  | { type: "TOGGLE_RULERS" }
  | { type: "SET_ZOOM";       zoom: number }
  | { type: "CANVAS_SIZE";    width: number; height: number }
  | { type: "SET_CUSTOM_CSS";  css: string }
  | { type: "SET_CUSTOM_JS";   js: string }
  | { type: "CLEAR_DIRTY" }
  // ── Artboards ─────────────────────
  | { type: "ADD_ARTBOARD";   artboard: Artboard }
  | { type: "DELETE_ARTBOARD"; id: string }
  | { type: "SET_ACTIVE_ARTBOARD"; id: string | null }
  | { type: "UPDATE_ARTBOARD"; id: string; updates: Partial<Artboard> }
  // ── Design tokens ─────────────────
  | { type: "SET_TOKENS";     tokens: DesignTokens }
  | { type: "UPDATE_TOKEN";   category: string; key: string; value: any }
  // ── Components ────────────────────
  | { type: "ADD_COMPONENT";   component: ComponentMaster }
  | { type: "DELETE_COMPONENT"; id: string }
  | { type: "ADD_VARIANT";    componentId: string; variant: import("./freeform-types").ComponentVariant }
  | { type: "SYNC_INSTANCE";  instanceId: string };

function pushHistory(past: FreeformPage[], page: FreeformPage): FreeformPage[] {
  return [...past.slice(-29), page];
}

function applyZoomToCanvas(zoom: number): { width: number; height: number } {
  // Base canvas dimensions — scale with zoom for responsive
  const base = 1440;
  const height = 900;
  return { width: Math.round(base / zoom * 1) , height: Math.round(height / zoom * 1) };
}

export function freeformReducer(state: FreeformState, action: FreeformAction): FreeformState {
  const snap = (n: number) => state.snapGrid ? Math.round(n / state.gridSize) * state.gridSize : n;

  switch (action.type) {
    case "LOAD_PAGE":
      return { ...state, page: action.page, selectedId: null, past: [], future: [], isDirty: false };

    case "SET_NAME":
      return { ...state, page: { ...state.page, name: action.name }, isDirty: true };

    case "SET_BACKGROUND":
      return { ...state, page: { ...state.page, background: action.background }, isDirty: true };

    case "ADD_ELEMENT": {
      const maxZ = state.page.elements.length > 0
        ? Math.max(...state.page.elements.map((e) => e.zIndex)) + 1
        : 0;
      const el = { ...action.el, zIndex: maxZ };
      const next = { ...state.page, elements: [...state.page.elements, el] };
      return {
        ...state,
        page: next,
        selectedId: el.id,
        past: pushHistory(state.past, state.page),
        future: [],
        isDirty: true,
      };
    }

    case "UPDATE_ELEMENT": {
      const next = {
        ...state.page,
        elements: state.page.elements.map((el) =>
          el.id === action.id ? { ...el, ...action.updates } : el
        ),
      };
      return {
        ...state,
        page: next,
        past: pushHistory(state.past, state.page),
        future: [],
        isDirty: true,
      };
    }

    case "DELETE_ELEMENT": {
      const next = {
        ...state.page,
        elements: state.page.elements.filter((el) => el.id !== action.id),
      };
      return {
        ...state,
        page: next,
        selectedId: state.selectedId === action.id ? null : state.selectedId,
        past: pushHistory(state.past, state.page),
        future: [],
        isDirty: true,
      };
    }

    case "DUPLICATE_ELEMENT": {
      const orig = state.page.elements.find((e) => e.id === action.id);
      if (!orig) return state;
      const dup: FreeformElement = {
        ...orig,
        id: crypto.randomUUID(),
        x: orig.x + 20,
        y: orig.y + 20,
        name: `${orig.name} copy`,
      };
      return freeformReducer(state, { type: "ADD_ELEMENT", el: dup });
    }

    case "MOVE_ELEMENT": {
      const next = {
        ...state.page,
        elements: state.page.elements.map((el) =>
          el.id === action.id ? { ...el, x: snap(action.x), y: snap(action.y) } : el
        ),
      };
      return { ...state, page: next, isDirty: true };
    }

    case "RESIZE_ELEMENT": {
      const next = {
        ...state.page,
        elements: state.page.elements.map((el) =>
          el.id === action.id
            ? { ...el, width: Math.max(20, snap(action.width)), height: Math.max(20, snap(action.height)) }
            : el
        ),
      };
      return {
        ...state,
        page: next,
        past: pushHistory(state.past, state.page),
        future: [],
        isDirty: true,
      };
    }

    case "ROTATE_ELEMENT": {
      const next = {
        ...state.page,
        elements: state.page.elements.map((el) =>
          el.id === action.id ? { ...el, rotation: action.rotation } : el
        ),
      };
      return {
        ...state,
        page: next,
        past: pushHistory(state.past, state.page),
        future: [],
        isDirty: true,
      };
    }

    case "SET_ZINDEX": {
      const next = {
        ...state.page,
        elements: state.page.elements.map((el) =>
          el.id === action.id ? { ...el, zIndex: action.zIndex } : el
        ),
      };
      return {
        ...state,
        page: next,
        past: pushHistory(state.past, state.page),
        future: [],
        isDirty: true,
      };
    }

    case "SEND_FORWARD": {
      const els = [...state.page.elements].sort((a, b) => a.zIndex - b.zIndex);
      const idx = els.findIndex((el) => el.id === action.id);
      if (idx >= els.length - 1) return state;
      const currentZ = els[idx].zIndex;
      const nextZ = els[idx + 1].zIndex;
      const next = {
        ...state.page,
        elements: state.page.elements.map((el) => {
          if (el.id === action.id) return { ...el, zIndex: nextZ };
          if (el.zIndex === nextZ && el.id !== action.id) return { ...el, zIndex: currentZ };
          return el;
        }),
      };
      return {
        ...state,
        page: next,
        past: pushHistory(state.past, state.page),
        future: [],
        isDirty: true,
      };
    }

    case "SEND_BACKWARD": {
      const els = [...state.page.elements].sort((a, b) => a.zIndex - b.zIndex);
      const idx = els.findIndex((el) => el.id === action.id);
      if (idx <= 0) return state;
      const currentZ = els[idx].zIndex;
      const prevZ = els[idx - 1].zIndex;
      const next = {
        ...state.page,
        elements: state.page.elements.map((el) => {
          if (el.id === action.id) return { ...el, zIndex: prevZ };
          if (el.zIndex === prevZ && el.id !== action.id) return { ...el, zIndex: currentZ };
          return el;
        }),
      };
      return {
        ...state,
        page: next,
        past: pushHistory(state.past, state.page),
        future: [],
        isDirty: true,
      };
    }

    case "SELECT":
      return { ...state, selectedId: action.id };

    case "UNDO": {
      if (!state.past.length) return state;
      const prev = state.past[state.past.length - 1];
      return {
        ...state,
        page: prev,
        past: state.past.slice(0, -1),
        future: [state.page, ...state.future],
        isDirty: true,
      };
    }

    case "REDO": {
      if (!state.future.length) return state;
      const next = state.future[0];
      return {
        ...state,
        page: next,
        future: state.future.slice(1),
        past: pushHistory(state.past, state.page),
        isDirty: true,
      };
    }

    case "TOGGLE_SNAP":
      return { ...state, snapGrid: !state.snapGrid };

    case "TOGGLE_GUIDES":
      return { ...state, showGuides: !state.showGuides };

    case "SET_ZOOM":
      return { ...state, zoom: action.zoom };

    case "CANVAS_SIZE":
      return {
        ...state,
        page: { ...state.page, canvasWidth: action.width, canvasHeight: action.height },
        past: pushHistory(state.past, state.page),
        future: [],
        isDirty: true,
      };

    case "CLEAR_DIRTY":
      return { ...state, isDirty: false };

    // ── Custom CSS/JS ──────────────────
    case "SET_CUSTOM_CSS":
      return { ...state, page: { ...state.page, customCss: action.css }, isDirty: true };
    case "SET_CUSTOM_JS":
      return { ...state, page: { ...state.page, customJs: action.js }, isDirty: true };

    // ── Rulers ────────────────────────
    case "TOGGLE_RULERS":
      return { ...state, showRulers: !state.showRulers };

    // ── Artboards ─────────────────────
    case "ADD_ARTBOARD": {
      const artboards = state.page.artboards || [];
      return {
        ...state,
        page: { ...state.page, artboards: [...artboards, action.artboard] },
        activeArtboardId: action.artboard.id,
        isDirty: true,
      };
    }
    case "DELETE_ARTBOARD": {
      const artboards = (state.page.artboards || []).filter((a) => a.id !== action.id);
      return {
        ...state,
        page: { ...state.page, artboards },
        activeArtboardId: state.activeArtboardId === action.id ? (artboards[0]?.id ?? null) : state.activeArtboardId,
        isDirty: true,
      };
    }
    case "SET_ACTIVE_ARTBOARD":
      return { ...state, activeArtboardId: action.id };
    case "UPDATE_ARTBOARD": {
      const artboards = (state.page.artboards || []).map((a) =>
        a.id === action.id ? { ...a, ...action.updates } : a
      );
      return { ...state, page: { ...state.page, artboards }, isDirty: true };
    }

    // ── Design tokens ─────────────────
    case "SET_TOKENS":
      return { ...state, page: { ...state.page, tokens: action.tokens }, isDirty: true };
    case "UPDATE_TOKEN": {
      const tokens = state.page.tokens || DEFAULT_TOKENS;
      const category = action.category as keyof typeof tokens;
      const updated = { ...tokens } as any;
      if (category === "colors") updated.colors = { ...updated.colors, [action.key]: action.value };
      else if (category === "typography") {
        const sub = action.key.split("-");
        const subKey = sub[0] as "fontFamily" | "fontSize" | "fontWeight" | "lineHeight";
        const subField = sub.length > 1 ? sub.slice(1).join("-") : action.key;
        if (subKey === "fontFamily") updated.typography = { ...updated.typography, fontFamily: action.value };
        else {
          const section = { ...updated.typography[subKey] };
          section[subField] = action.value;
          updated.typography = { ...updated.typography, [subKey]: section };
        }
      } else if (category === "shadows") updated.shadows = { ...updated.shadows, [action.key]: action.value };
      else if (category === "radii") updated.radii = { ...updated.radii, [action.key]: action.value };
      else if (category === "spacing") updated.spacing = { ...updated.spacing, [action.key]: action.value };
      return { ...state, page: { ...state.page, tokens: updated }, isDirty: true };
    }

    // ── Components ────────────────────
    case "ADD_COMPONENT": {
      const components = state.page.components || [];
      return { ...state, page: { ...state.page, components: [...components, action.component] }, isDirty: true };
    }
    case "DELETE_COMPONENT": {
      const components = (state.page.components || []).filter((c) => c.id !== action.id);
      return { ...state, page: { ...state.page, components }, isDirty: true };
    }
    case "ADD_VARIANT": {
      const components = (state.page.components || []).map((c) =>
        c.id === action.componentId ? { ...c, variants: [...c.variants, action.variant] } : c
      );
      return { ...state, page: { ...state.page, components }, isDirty: true };
    }
    case "SYNC_INSTANCE": {
      const master = (state.page.components || []).find((c) => c.elementId === action.instanceId) ||
                     (state.page.components || []).find((c) => c.id === action.instanceId);
      if (!master) return state;
      const masterEl = state.page.elements.find((e) => e.id === master.elementId);
      if (!masterEl) return state;
      const next = {
        ...state.page,
        elements: state.page.elements.map((el) => {
          if (el.id !== action.instanceId || !el.masterId) return el;
          const variant = master.variants.find((v) => v.name === el.variant);
          const base = { ...masterEl, id: el.id, x: el.x, y: el.y, masterId: el.masterId, variant: el.variant };
          return variant ? { ...base, ...variant.overrides } : base;
        }),
      };
      return { ...state, page: next, isDirty: true };
    }

    default:
      return state;
  }
}

export function createInitialFreeformState(page?: Partial<FreeformPage>): FreeformState {
  const defaultPage: FreeformPage = {
    id:          "",
    userId:      "guest",
    name:        "Untitled Freeform",
    slug:        "",
    description: "",
    canvasWidth:  1440,
    canvasHeight: 900,
    elements:    [],
    background:  DEFAULT_BACKGROUND,
    status:      "draft",
    isPrivate:   false,
    likes:       0,
    viewCount:   0,
    tags:        [],
    createdAt:   new Date().toISOString(),
    updatedAt:   new Date().toISOString(),
    ...page,
  };
  return {
    page:      defaultPage,
    selectedId: null,
    past:       [],
    future:     [],
    isDirty:    false,
    snapGrid:   false,
    gridSize:   10,
    showGuides: true,
    zoom:       1,
    activeArtboardId: null,
    showRulers: false,
  };
}

// ── Export to HTML ───────────────────────────────────────────────────────────

export function exportFreeformToHTML(page: FreeformPage): string {
  const els = [...page.elements].sort((a, b) => a.zIndex - b.zIndex);

  const elementsHTML = els.map((el) => {
    if (!el.visible) return "";
    const style = [
      `position:absolute`,
      `left:${el.x}px`,
      `top:${el.y}px`,
      `width:${el.width}px`,
      `height:${el.height}px`,
      `z-index:${el.zIndex}`,
      `opacity:${el.opacity}`,
      el.rotation ? `transform:rotate(${el.rotation}deg)` : "",
      el.scale && el.scale !== 1 ? `scale(${el.scale})` : "",
      el.borderRadius ? `border-radius:${el.borderRadius}px` : "",
      el.boxShadow ? `box-shadow:${el.boxShadow}` : "",
      el.background ? `background:${el.background}` : "",
    ].filter(Boolean).join(";");

    switch (el.type) {
      case "text":
        return `<div style="${style};color:${el.color || "#fff"};font-size:${el.fontSize || 24}px;font-weight:${el.fontWeight || 400};text-align:${el.textAlign || "left"};line-height:1.3;display:flex;align-items:center">${escapeHtml(el.text || "")}</div>`;
      case "image":
        return `<img style="${style}" src="${el.src || ""}" alt="${el.name || ""}" />`;
      case "shape":
        return `<div style="${style};background:${el.fill || "#7FB5A0"};border:${el.strokeWidth ? el.strokeWidth + "px solid " + el.stroke : "none"}${el.shapeKind === "circle" ? ";border-radius:50%" : ""}"></div>`;
      case "button":
        return `<a style="${style};background:${el.fill || "#3b82f6"};color:#fff;text-decoration:none;display:flex;align-items:center;justify-content:center;font-weight:600;cursor:pointer" href="${el.href || "#"}">${escapeHtml(el.label || "Button")}</a>`;
      case "sticker":
        return `<img style="${style}" src="${el.stickerUrl || ""}" alt="sticker" />`;
      case "embed":
        return `<iframe style="${style}" src="${el.embedUrl || ""}" frameborder="0" allowfullscreen title="${el.embedType || "embed"}"></iframe>`;
      case "draw":
        return `<svg style="${style}" viewBox="0 0 ${el.width} ${el.height}"><path d="${escapeHtml(el.drawData || "")}" fill="none" stroke="${el.color || "#ffffff"}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      case "link-card":
        return `<a style="${style};display:flex;flex-direction:column;justify-content:center;background:${el.background || "rgba(255,255,255,0.05)"};border-radius:${(el.borderRadius || 12)}px;border:1px solid rgba(255,255,255,0.1);padding:12px;text-decoration:none;color:#fff" href="${el.href || "#"}"><span style="font-size:14px;font-weight:600">${escapeHtml(el.label || "Link Card")}</span>${el.href ? `<span style="font-size:11px;color:#888;margin-top:4px">${escapeHtml(el.href)}</span>` : ""}</a>`;
      case "form": {
        const fields = parseFormFields(el.formFields);
        const fieldsHtml = fields.map((f) => {
          if (f.type === "text" || f.type === "email") {
            return `<div style="display:flex;flex-direction:column;gap:4px"><label style="font-size:12px;color:#aaaaaa;font-weight:500">${escapeHtml(f.label)}${f.required ? `<span style="color:#ef4444;margin-left:2px">*</span>` : ""}</label><input type="${f.type}" placeholder="${escapeHtml(f.placeholder || "")}" ${f.required ? "required" : ""} style="padding:6px 10px;font-size:13px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:6px;color:#ffffff;outline:none" /></div>`;
          } else if (f.type === "textarea") {
            return `<div style="display:flex;flex-direction:column;gap:4px"><label style="font-size:12px;color:#aaaaaa;font-weight:500">${escapeHtml(f.label)}${f.required ? `<span style="color:#ef4444;margin-left:2px">*</span>` : ""}</label><textarea placeholder="${escapeHtml(f.placeholder || "")}" rows="3" ${f.required ? "required" : ""} style="padding:6px 10px;font-size:13px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:6px;color:#ffffff;outline:none;resize:vertical"></textarea></div>`;
          } else if (f.type === "select") {
            const opts = (f.options || []).map((o) => `<option value="${escapeHtml(o)}" style="background:#1a1a2e">${escapeHtml(o)}</option>`).join("");
            return `<div style="display:flex;flex-direction:column;gap:4px"><label style="font-size:12px;color:#aaaaaa;font-weight:500">${escapeHtml(f.label)}${f.required ? `<span style="color:#ef4444;margin-left:2px">*</span>` : ""}</label><select style="padding:6px 10px;font-size:13px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:6px;color:#ffffff;outline:none">${opts}</select></div>`;
          } else if (f.type === "submit") {
            return `<button type="submit" style="padding:8px 16px;font-size:13px;font-weight:600;background:#3b82f6;color:#ffffff;border:none;border-radius:8px;cursor:pointer;margin-top:4px">${escapeHtml(f.label)}</button>`;
          }
          return "";
        }).join("");
        return `<form style="${style}" onsubmit="return false;"><div style="font-size:16px;font-weight:600;color:#ffffff;margin-bottom:8px">${escapeHtml(el.text || "Contact Form")}</div>${fieldsHtml}</form>`;
      }
      default:
        return `<div style="${style}"></div>`;
    }
  }).join("\n  ");

  const bgStyle = page.background.type === "color"
    ? `background:${page.background.value}`
    : page.background.type === "gradient"
    ? `background:${page.background.value}`
    : `background:url(${page.background.value});background-size:cover;background-position:center`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${escapeHtml(page.name)}</title>
  <style>
    *,*::before,*::after { box-sizing:border-box;margin:0;padding:0; }
    body { font-family:system-ui,-apple-system,sans-serif; }
    .freeform-page {
      position:relative;
      width:100%;
      max-width:${page.canvasWidth}px;
      min-height:${page.canvasHeight}px;
      margin:0 auto;
      ${bgStyle};
    }
    @media (max-width: ${page.canvasWidth}px) {
      .freeform-page { max-width:100%; }
    }
    ${page.customCss || ""}
  </style>
  ${page.customJs ? `<script>${page.customJs}</script>` : ""}
</head>
<body>
  <div class="freeform-page">
    ${elementsHTML}
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

interface FormField {
  type: "text" | "email" | "textarea" | "select" | "checkbox" | "submit";
  label: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

function parseFormFields(formFields?: string): FormField[] {
  try {
    if (formFields) {
      const fields = JSON.parse(formFields);
      if (Array.isArray(fields)) return fields;
    }
  } catch { /* use defaults */ }
  return [
    { type: "text", label: "Name", placeholder: "Your name", required: true },
    { type: "email", label: "Email", placeholder: "you@example.com", required: true },
    { type: "textarea", label: "Message", placeholder: "Your message..." },
    { type: "submit", label: "Submit" },
  ];
}
