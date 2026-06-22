import { create } from "zustand";
import type { SceneElement, SceneData, ScrollConfig } from "@/lib/scene-types";

export interface SceneEditorState {
  scene: SceneData;
  selectedId: string | null;
  isDirty: boolean;
  timelinePlayhead: number;
  isPlaying: boolean;
  debugOverlay: boolean;
  lenisEnabled: boolean;
}

export interface SceneEditorActions {
  loadScene: (s: SceneData) => void;
  setName: (name: string) => void;
  addElement: (el: SceneElement) => void;
  addElements: (els: SceneElement[]) => void;
  updateElement: (id: string, updates: Partial<SceneElement>) => void;
  deleteElement: (id: string) => void;
  moveElement: (id: string, x: number, y: number) => void;
  reorderUp: (id: string) => void;
  reorderDown: (id: string) => void;
  select: (id: string | null) => void;
  setTimelinePlayhead: (t: number) => void;
  setIsPlaying: (p: boolean) => void;
  toggleDebugOverlay: () => void;
  toggleLenis: () => void;
  resetDirty: () => void;
}

const MAX_HISTORY = 30;

export const useSceneStore = create<SceneEditorState & SceneEditorActions>((set, get) => ({
  scene: {
    id: "",
    name: "Untitled",
    canvasWidth: 1440,
    canvasHeight: 900,
    elements: [],
    background: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)",
    themeTokens: { sage: "#7FB5A0", lavender: "#B39DC2", coral: "#E8957A", sky: "#87BBDB", peach: "#F4C5A1", forest: "#4A7C6B", mist: "#C8D8E0", sand: "#E8DDD0" },
    status: "draft",
    updatedAt: "",
  },
  selectedId: null,
  isDirty: false,
  timelinePlayhead: 0,
  isPlaying: false,
  debugOverlay: false,
  lenisEnabled: true,

  loadScene: (s) => set({ scene: s, selectedId: null, isDirty: false }),

  setName: (name) => set((st) => ({ scene: { ...st.scene, name }, isDirty: true })),

  addElement: (el) => set((st) => {
    const withZ = { ...el, zIndex: st.scene.elements.length };
    return {
      scene: { ...st.scene, elements: [...st.scene.elements, withZ] },
      selectedId: withZ.id,
      isDirty: true,
    };
  }),

  addElements: (els) => set((st) => {
    const base = st.scene.elements.length;
    const withZ = els.map((el, i) => ({ ...el, zIndex: base + i }));
    return {
      scene: { ...st.scene, elements: [...st.scene.elements, ...withZ] },
      selectedId: withZ[withZ.length - 1]?.id ?? st.selectedId,
      isDirty: true,
    };
  }),

  updateElement: (id, updates) => set((st) => ({
    scene: {
      ...st.scene,
      elements: st.scene.elements.map((el) => el.id === id ? { ...el, ...updates } : el),
    },
    isDirty: true,
  })),

  deleteElement: (id) => set((st) => ({
    scene: { ...st.scene, elements: st.scene.elements.filter((el) => el.id !== id) },
    selectedId: st.selectedId === id ? null : st.selectedId,
    isDirty: true,
  })),

  moveElement: (id, x, y) => set((st) => ({
    scene: {
      ...st.scene,
      elements: st.scene.elements.map((el) => el.id === id ? { ...el, x, y } : el),
    },
    isDirty: true,
  })),

  reorderUp: (id) => set((st) => {
    const els = [...st.scene.elements];
    const idx = els.findIndex((el) => el.id === id);
    if (idx < els.length - 1) {
      [els[idx], els[idx + 1]] = [els[idx + 1], els[idx]];
      els.forEach((el, i) => { el.zIndex = i; });
    }
    return { scene: { ...st.scene, elements: els }, isDirty: true };
  }),

  reorderDown: (id) => set((st) => {
    const els = [...st.scene.elements];
    const idx = els.findIndex((el) => el.id === id);
    if (idx > 0) {
      [els[idx], els[idx - 1]] = [els[idx - 1], els[idx]];
      els.forEach((el, i) => { el.zIndex = i; });
    }
    return { scene: { ...st.scene, elements: els }, isDirty: true };
  }),

  select: (id) => set({ selectedId: id }),
  setTimelinePlayhead: (t) => set({ timelinePlayhead: t }),
  setIsPlaying: (p) => set({ isPlaying: p }),
  toggleDebugOverlay: () => set((st) => ({ debugOverlay: !st.debugOverlay })),
  toggleLenis: () => set((st) => ({ lenisEnabled: !st.lenisEnabled })),
  resetDirty: () => set({ isDirty: false }),
}));
