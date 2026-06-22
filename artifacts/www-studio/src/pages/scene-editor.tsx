import { useState, useReducer, useCallback, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { SceneCanvas }       from "@/components/scenes/SceneCanvas";
import { WellnessLibrary }   from "@/components/scenes/WellnessLibrary";
import { AnimationPresets }  from "@/components/scenes/AnimationPresets";
import { SceneExport }       from "@/components/scenes/SceneExport";
import { SceneChat, type SceneAction } from "@/components/scenes/SceneChat";
import { SceneEnhancer }     from "@/components/scenes/SceneEnhancer";
import { SendToCursor }      from "@/components/scenes/SendToCursor";
import { KeyboardShortcuts } from "@/components/scenes/KeyboardShortcuts";
import { OnboardingTour, useOnboarding } from "@/components/scenes/OnboardingTour";
import { VersionHistory }    from "@/components/scenes/VersionHistory";
import { SceneEmbedCode }   from "@/components/scenes/SceneEmbedCode";
import { InfoTab }          from "@/components/scenes/InfoTab";
import { AnimationTimeline } from "@/components/scenes/AnimationTimeline";
import { ScrollTriggerConfig, type ScrollConfig } from "@/components/scenes/ScrollTriggerConfig";
import { CommandPalette } from "@/components/scenes/CommandPalette";
import { ScrollDebugOverlay } from "@/components/scenes/ScrollDebugOverlay";
import { PerformanceAuditor } from "@/components/scenes/PerformanceAuditor";
import { useGSAPCanvas } from "@/lib/use-gsap-canvas";
import { useLenis } from "@/lib/use-lenis";
import { useGetScene, useUpdateScene } from "@workspace/api-client-react";
import { type SceneElement, type SceneData, DEFAULT_WELLNESS_TOKENS } from "@/lib/scene-types";
import {
  ArrowLeft, Save, Undo2, Redo2, Trash2,
  Eye, EyeOff, Lock, Unlock,
  ChevronUp, ChevronDown, Copy,
  Layers, Palette, Play, Download, MessageSquare,
  Sparkles, Terminal, Keyboard, History, ExternalLink,
  Globe, Code2, Info, Tag, X, Timer, MousePointer2, Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";

type RightTab = "layers" | "properties" | "animation" | "timeline" | "scroll" | "export" | "history" | "embed" | "info" | "performance";

interface EditorState {
  scene:      SceneData;
  selectedId: string | null;
  past:       SceneData[];
  future:     SceneData[];
  isDirty:    boolean;
}

type Action =
  | { type: "LOAD_SCENE";     scene: SceneData }
  | { type: "RESTORE_SCENE";  scene: SceneData }
  | { type: "SET_NAME";       name: string }
  | { type: "ADD_ELEMENT";    el: SceneElement }
  | { type: "ADD_ELEMENTS";   els: SceneElement[] }
  | { type: "UPDATE_ELEMENT"; id: string; updates: Partial<SceneElement> }
  | { type: "DELETE_ELEMENT"; id: string }
  | { type: "MOVE_ELEMENT";   id: string; x: number; y: number }
  | { type: "REORDER_UP";     id: string }
  | { type: "REORDER_DOWN";   id: string }
  | { type: "SELECT";         id: string | null }
  | { type: "REPLACE_ELEMENTS"; elements: SceneElement[] }
  | { type: "UNDO" }
  | { type: "REDO" };

function pushHistory(past: SceneData[], scene: SceneData): SceneData[] {
  return [...past.slice(-29), scene];
}

function reducer(state: EditorState, action: Action): EditorState {
  switch (action.type) {
    case "LOAD_SCENE":
      return { ...state, scene: action.scene, past: [], future: [], isDirty: false };

    case "RESTORE_SCENE":
      return { ...state, scene: action.scene, past: pushHistory(state.past, state.scene), future: [], isDirty: true };

    case "SET_NAME":
      return { ...state, scene: { ...state.scene, name: action.name }, isDirty: true };

    case "ADD_ELEMENT": {
      const next = { ...state.scene, elements: [...state.scene.elements, { ...action.el, zIndex: state.scene.elements.length }] };
      return { ...state, scene: next, selectedId: action.el.id, past: pushHistory(state.past, state.scene), future: [], isDirty: true };
    }

    case "ADD_ELEMENTS": {
      const base = state.scene.elements.length;
      const news = action.els.map((el, i) => ({ ...el, zIndex: base + i }));
      const next = { ...state.scene, elements: [...state.scene.elements, ...news] };
      return { ...state, scene: next, selectedId: news[news.length - 1]?.id ?? state.selectedId, past: pushHistory(state.past, state.scene), future: [], isDirty: true };
    }

    case "UPDATE_ELEMENT": {
      const next = { ...state.scene, elements: state.scene.elements.map((el) => el.id === action.id ? { ...el, ...action.updates } : el) };
      return { ...state, scene: next, past: pushHistory(state.past, state.scene), future: [], isDirty: true };
    }

    case "DELETE_ELEMENT": {
      const next = { ...state.scene, elements: state.scene.elements.filter((el) => el.id !== action.id) };
      return { ...state, scene: next, selectedId: state.selectedId === action.id ? null : state.selectedId, past: pushHistory(state.past, state.scene), future: [], isDirty: true };
    }

    case "MOVE_ELEMENT": {
      const next = { ...state.scene, elements: state.scene.elements.map((el) => el.id === action.id ? { ...el, x: action.x, y: action.y } : el) };
      return { ...state, scene: next, isDirty: true };
    }

    case "REORDER_UP": {
      const els = [...state.scene.elements];
      const idx = els.findIndex((el) => el.id === action.id);
      if (idx < els.length - 1) { [els[idx], els[idx + 1]] = [els[idx + 1], els[idx]]; els.forEach((el, i) => { el.zIndex = i; }); }
      return { ...state, scene: { ...state.scene, elements: els }, isDirty: true };
    }

    case "REORDER_DOWN": {
      const els = [...state.scene.elements];
      const idx = els.findIndex((el) => el.id === action.id);
      if (idx > 0) { [els[idx], els[idx - 1]] = [els[idx - 1], els[idx]]; els.forEach((el, i) => { el.zIndex = i; }); }
      return { ...state, scene: { ...state.scene, elements: els }, isDirty: true };
    }

    case "REPLACE_ELEMENTS": {
      const next = { ...state.scene, elements: action.elements };
      return { ...state, scene: next, past: pushHistory(state.past, state.scene), future: [], isDirty: true };
    }

    case "SELECT":
      return { ...state, selectedId: action.id };

    case "UNDO": {
      if (!state.past.length) return state;
      const prev = state.past[state.past.length - 1];
      return { ...state, scene: prev, past: state.past.slice(0, -1), future: [state.scene, ...state.future], isDirty: true };
    }

    case "REDO": {
      if (!state.future.length) return state;
      const next = state.future[0];
      return { ...state, scene: next, future: state.future.slice(1), past: pushHistory(state.past, state.scene), isDirty: true };
    }

    default: return state;
  }
}

function parseScene(raw: any): SceneData {
  let elements: SceneElement[] = [];
  try { elements = JSON.parse(raw.elements ?? "[]"); } catch { /* */ }
  let themeTokens = DEFAULT_WELLNESS_TOKENS;
  try { themeTokens = { ...DEFAULT_WELLNESS_TOKENS, ...JSON.parse(raw.themeTokens ?? "{}") }; } catch { /* */ }
  return {
    id: raw.id, name: raw.name,
    canvasWidth: raw.canvasWidth ?? 1440, canvasHeight: raw.canvasHeight ?? 900,
    elements, background: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)",
    themeTokens, status: raw.status ?? "draft", updatedAt: raw.updatedAt,
  };
}

function getAutoSaveLabel(savedAt: Date | null): string {
  if (!savedAt) return "";
  const secs = Math.round((Date.now() - savedAt.getTime()) / 1000);
  if (secs < 5)  return "Just saved";
  if (secs < 60) return `Saved ${secs}s ago`;
  return `Saved ${Math.floor(secs / 60)}m ago`;
}

export default function SceneEditor() {
  const [, params]   = useRoute("/scenes/:sceneId");
  const [, navigate] = useLocation();
  const { toast }    = useToast();
  const sceneId      = params?.sceneId ?? "";

  const [rightTab,     setRightTab]     = useState<RightTab>("layers");
  const [showChat,     setShowChat]     = useState(false);
  const [showEnhancer, setShowEnhancer] = useState(false);
  const [showCursor,   setShowCursor]   = useState(false);
  const [showShortcuts,setShowShortcuts]= useState(false);
  const [showCommand,  setShowCommand]  = useState(false);
  const [autoSavedAt,  setAutoSavedAt]  = useState<Date | null>(null);
  const [autoSaveLabel, setAutoSaveLabel] = useState("");

  const { data: rawScene, isLoading } = useGetScene(sceneId);
  const updateScene = useUpdateScene();
  const onboarding  = useOnboarding();

  const [state, dispatch] = useReducer(reducer, {
    scene: { id: sceneId, name: "Loading…", canvasWidth: 1440, canvasHeight: 900, elements: [], background: "#0d1117", themeTokens: DEFAULT_WELLNESS_TOKENS, status: "draft", updatedAt: "" },
    selectedId: null, past: [], future: [], isDirty: false,
  });

  // Load scene from API
  useEffect(() => {
    if (rawScene) dispatch({ type: "LOAD_SCENE", scene: parseScene(rawScene) });
  }, [rawScene]);

  // Auto-save every 30s when dirty
  const isDirtyRef = useRef(state.isDirty);
  const sceneRef   = useRef(state.scene);
  useEffect(() => { isDirtyRef.current = state.isDirty; sceneRef.current = state.scene; }, [state]);

  useEffect(() => {
    const timer = setInterval(async () => {
      if (!isDirtyRef.current) return;
      try {
        await updateScene.mutateAsync({
          id: sceneId,
          data: { name: sceneRef.current.name, elements: JSON.stringify(sceneRef.current.elements), themeTokens: JSON.stringify(sceneRef.current.themeTokens), status: sceneRef.current.status },
        });
        setAutoSavedAt(new Date());
        dispatch({ type: "LOAD_SCENE", scene: sceneRef.current });
      } catch { /* silent */ }
    }, 30_000);
    return () => clearInterval(timer);
  }, [sceneId]);

  // Auto-save display label
  useEffect(() => {
    if (!autoSavedAt) { setAutoSaveLabel(""); return; }
    const label = getAutoSaveLabel(autoSavedAt);
    setAutoSaveLabel(label);
    const id = setInterval(() => setAutoSaveLabel(getAutoSaveLabel(autoSavedAt)), 5000);
    return () => clearInterval(id);
  }, [autoSavedAt]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isInput = (e.target as HTMLElement).closest("input, textarea");
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); dispatch({ type: "UNDO" }); }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); dispatch({ type: "REDO" }); }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); handleSave(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setShowCursor(true); }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); setShowEnhancer(true); }
      if ((e.ctrlKey || e.metaKey) && e.key === "p") { e.preventDefault(); window.open(`/scenes/${sceneId}/preview`, "_blank"); }
      if ((e.ctrlKey || e.metaKey) && e.key === "/") { e.preventDefault(); setShowCommand((v) => !v); }
      if (!isInput && e.key === "?") { e.preventDefault(); setShowShortcuts(v => !v); }
      if (!isInput && e.key === "Escape") { dispatch({ type: "SELECT", id: null }); }
      if (!isInput && (e.key === "Delete" || e.key === "Backspace") && state.selectedId) {
        e.preventDefault(); dispatch({ type: "DELETE_ELEMENT", id: state.selectedId });
      }
      if (!isInput && (e.ctrlKey || e.metaKey) && e.key === "d" && state.selectedId) {
        e.preventDefault();
        const el = state.scene.elements.find(el => el.id === state.selectedId);
        if (el) dispatch({ type: "ADD_ELEMENT", el: { ...el, id: crypto.randomUUID(), x: el.x + 20, y: el.y + 20, name: el.name + " copy" } });
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "1") { e.preventDefault(); setRightTab("layers"); }
      if ((e.ctrlKey || e.metaKey) && e.key === "2") { e.preventDefault(); setRightTab("properties"); }
      if ((e.ctrlKey || e.metaKey) && e.key === "3") { e.preventDefault(); setRightTab("animation"); }
      if ((e.ctrlKey || e.metaKey) && e.key === "4") { e.preventDefault(); setRightTab("export"); }
      if ((e.ctrlKey || e.metaKey) && e.key === "5") { e.preventDefault(); setRightTab("timeline"); }
      if ((e.ctrlKey || e.metaKey) && e.key === "6") { e.preventDefault(); setRightTab("scroll"); }
      if (!isInput && e.key === " ") { e.preventDefault(); setShowChat(v => !v); }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state.selectedId, state.scene, sceneId]);

  function buildThumbnailDataUrl(scene: SceneData): string {
    const { elements, canvasWidth = 1440, canvasHeight = 900 } = scene;
    const svgEls = elements.filter(el => el.visible).map((el) => {
      const op = el.opacity ?? 0.7;
      const blurStr = (el.blur ?? 0) > 0 ? ` filter="url(#b${el.id})"` : "";
      const filterDef = (el.blur ?? 0) > 0
        ? `<filter id="b${el.id}"><feGaussianBlur stdDeviation="${el.blur}" /></filter>`
        : "";
      if (el.type === "circle") return `${filterDef}<circle cx="${el.x + el.width/2}" cy="${el.y + el.height/2}" r="${el.width/2}" fill="${el.fill}" opacity="${op}"${blurStr}/>`;
      if (el.type === "rect")   return `${filterDef}<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="12" fill="${el.fill}" opacity="${op}"${blurStr}/>`;
      return "";
    }).join("\n");
    const svgStr = `<svg viewBox="0 0 ${canvasWidth} ${canvasHeight}" xmlns="http://www.w3.org/2000/svg" style="background:linear-gradient(135deg,#0d0d1a,#1a1a2e)">${svgEls}</svg>`;
    try { return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgStr)))}`; } catch { return ""; }
  }

  async function handleSave() {
    try {
      const thumbnail = state.scene.elements.length > 0 ? buildThumbnailDataUrl(state.scene) : undefined;
      await updateScene.mutateAsync({
        id: sceneId,
        data: {
          name: state.scene.name,
          elements: JSON.stringify(state.scene.elements),
          themeTokens: JSON.stringify(state.scene.themeTokens),
          status: state.scene.status,
          ...(thumbnail ? { thumbnailUrl: thumbnail } : {}),
        },
      });
      toast({ title: "Saved!" });
      setAutoSavedAt(new Date());
      dispatch({ type: "LOAD_SCENE", scene: state.scene });
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    }
  }

  const handleChatApply = useCallback((actions: SceneAction[]) => {
    for (const action of actions) {
      if (action.type === "add"    && action.element) dispatch({ type: "ADD_ELEMENT",    el: action.element as SceneElement });
      if (action.type === "update" && action.id && action.updates) dispatch({ type: "UPDATE_ELEMENT", id: action.id, updates: action.updates });
      if (action.type === "delete" && action.id)    dispatch({ type: "DELETE_ELEMENT", id: action.id });
    }
  }, []);

  const handleEnhancerApply = useCallback((elements: SceneElement[]) => {
    dispatch({ type: "REPLACE_ELEMENTS", elements });
  }, []);

  const handleAdd    = useCallback((el: SceneElement)                          => dispatch({ type: "ADD_ELEMENT",    el }),       []);
  const handleSelect = useCallback((id: string | null)                         => dispatch({ type: "SELECT",         id }),       []);
  const handleMove   = useCallback((id: string, x: number, y: number)         => dispatch({ type: "MOVE_ELEMENT",   id, x, y }), []);
  const handleUpdate = useCallback((id: string, updates: Partial<SceneElement>)=> dispatch({ type: "UPDATE_ELEMENT", id, updates }),[]);

  const selectedEl = state.scene.elements.find((el) => el.id === state.selectedId) ?? null;

  // Complexity meter values
  const complexity = Math.min(100, Math.round((state.scene.elements.length / 12) * 50 + (state.scene.elements.filter(el => el.animation?.preset !== "none").length / Math.max(1, state.scene.elements.length)) * 50));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <span className="text-sm">Loading scene…</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {onboarding.show && <OnboardingTour onDone={onboarding.done} />}

      <KeyboardShortcuts open={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <SceneEnhancer open={showEnhancer} onClose={() => setShowEnhancer(false)} sceneId={sceneId} onApply={handleEnhancerApply} />
      <SendToCursor  open={showCursor}   onClose={() => setShowCursor(false)}   scene={state.scene} />
      <CommandPalette open={showCommand} onClose={() => setShowCommand(false)} onCommand={(cmd) => {
        if (cmd.id === "save") handleSave();
        else if (cmd.id === "undo") dispatch({ type: "UNDO" });
        else if (cmd.id === "redo") dispatch({ type: "REDO" });
        else if (cmd.id === "duplicate" && state.selectedId) {
          const el = state.scene.elements.find(el => el.id === state.selectedId);
          if (el) dispatch({ type: "ADD_ELEMENT", el: { ...el, id: crypto.randomUUID(), x: el.x + 20, y: el.y + 20, name: el.name + " copy" } });
        }
        else if (cmd.id === "delete" && state.selectedId) dispatch({ type: "DELETE_ELEMENT", id: state.selectedId });
        else if (cmd.id === "preview") window.open(`/scenes/${sceneId}/preview`, "_blank");
        else if (cmd.id === "chat") setShowChat((v) => !v);
        else if (cmd.id === "enhance") setShowEnhancer(true);
      }} />

      <div className="h-screen flex flex-col bg-background overflow-hidden">
        {/* ── Top bar ── */}
        <div className="h-12 flex items-center gap-1.5 px-2 border-b border-border shrink-0 bg-background/95 backdrop-blur">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => navigate("/scenes")} title="Back to Scenes">
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <Input
            value={state.scene.name}
            onChange={(e) => dispatch({ type: "SET_NAME", name: e.target.value })}
            className="h-8 w-44 text-sm font-medium border-transparent bg-transparent hover:bg-muted focus:bg-muted focus:border-border shrink-0"
          />

          {state.isDirty && !autoSavedAt && (
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">unsaved</span>
          )}
          {autoSavedAt && (
            <span className="text-[10px] text-green-500/70 shrink-0 hidden sm:block">✓ auto-saved</span>
          )}

          <div className="flex-1" />

          {/* Complexity meter */}
          <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-muted-foreground shrink-0" title={`Scene complexity: ${complexity}%`}>
            <span>Complexity</span>
            <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", complexity < 40 ? "bg-green-500" : complexity < 70 ? "bg-yellow-500" : "bg-red-400")}
                style={{ width: `${complexity}%` }}
              />
            </div>
          </div>

          <div className="w-px h-5 bg-border mx-0.5 hidden sm:block" />

          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => dispatch({ type: "UNDO" })} disabled={!state.past.length} title="Undo (Ctrl+Z)">
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => dispatch({ type: "REDO" })} disabled={!state.future.length} title="Redo (Ctrl+Y)">
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-px h-5 bg-border mx-0.5" />

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowShortcuts(true)} title="Keyboard shortcuts (?)">
            <Keyboard className="h-3.5 w-3.5" />
          </Button>

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowCommand(true)} title="Command palette (Ctrl+/)">
            <Terminal className="h-3.5 w-3.5" />
          </Button>

          {/* View/like stats */}
          {rawScene && (
            <div className="hidden lg:flex items-center gap-2 text-[10px] text-muted-foreground shrink-0">
              <span className="flex items-center gap-0.5"><span>👁</span>{(rawScene as any).viewCount ?? 0}</span>
              <span className="flex items-center gap-0.5"><span>♥</span>{(rawScene as any).likes ?? 0}</span>
            </div>
          )}

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(`/scenes/${sceneId}/preview`, "_blank")} title="Preview (Ctrl+P)">
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(`/scenes/${sceneId}/share`, "_blank")} title="Share scene">
            <Globe className="h-3.5 w-3.5" />
          </Button>

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowCursor(true)} title="Send to Cursor (Ctrl+K)">
            <Terminal className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant={showEnhancer ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setShowEnhancer(true)}
            className="gap-1.5 h-8 hidden sm:flex"
            title="AI Enhance (Ctrl+Enter)"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-xs hidden md:inline">Enhance</span>
          </Button>

          <Button
            variant={showChat ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setShowChat((v) => !v)}
            className="gap-1.5 h-8"
            title="AI Chat (Space)"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">AI Chat</span>
          </Button>

          {/* Publish toggle */}
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-1.5 h-8 hidden sm:flex",
              state.scene.status === "published" ? "text-green-400 border-green-500/30 hover:bg-green-500/10" : ""
            )}
            onClick={() => {
              const newStatus = state.scene.status === "published" ? "draft" : "published";
              dispatch({ type: "LOAD_SCENE", scene: { ...state.scene, status: newStatus } });
              updateScene.mutateAsync({ id: sceneId, data: { status: newStatus } })
                .then(() => toast({ title: newStatus === "published" ? "Scene published!" : "Scene unpublished" }))
                .catch(() => toast({ title: "Update failed", variant: "destructive" }));
            }}
          >
            <Globe className="h-3.5 w-3.5" />
            <span className="text-xs hidden md:inline">{state.scene.status === "published" ? "Published" : "Publish"}</span>
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={!state.isDirty || updateScene.isPending}
            className="gap-1.5 h-8"
          >
            <Save className="h-3.5 w-3.5" />
            {updateScene.isPending ? "Saving…" : "Save"}
          </Button>
        </div>

        {/* ── Main area ── */}
        <div className="flex flex-1 min-h-0 relative">
          {/* ── Left: Element Library ── */}
          <div className="w-[210px] shrink-0 border-r border-border bg-background flex flex-col overflow-hidden">
            <WellnessLibrary onAdd={handleAdd} />
          </div>

          {/* ── Center: Canvas ── */}
          <div className="flex-1 min-w-0 relative">
            <SceneCanvas
              elements={state.scene.elements}
              selectedId={state.selectedId}
              canvasWidth={state.scene.canvasWidth}
              canvasHeight={state.scene.canvasHeight}
              background={state.scene.background}
              onSelect={handleSelect}
              onMove={handleMove}
              onDropNew={handleAdd}
            />
            <div className="absolute bottom-2 left-2 flex items-center gap-2 text-[10px] text-white/40 bg-black/40 px-2 py-1 rounded-md pointer-events-none backdrop-blur-sm">
              <span>{state.scene.canvasWidth}×{state.scene.canvasHeight}</span>
              <span>·</span>
              <span>{state.scene.elements.length} elements</span>
              {state.selectedId && (
                <><span>·</span><span className="text-primary/70">{selectedEl?.name} selected</span></>
              )}
              <span>·</span>
              <span className={cn(complexity < 40 ? "text-green-400/70" : complexity < 70 ? "text-yellow-400/70" : "text-red-400/70")}>
                {complexity < 40 ? "simple" : complexity < 70 ? "moderate" : "complex"}
              </span>
            </div>

            {/* Press ? hint */}
            <div className="absolute bottom-2 right-2 text-[10px] text-white/20 pointer-events-none">
              Press <kbd className="text-[9px] bg-white/10 px-1 rounded">?</kbd> for shortcuts
            </div>
          </div>

          {/* ── Right panel: Inspector ── */}
          <div className={cn(
            "shrink-0 border-l border-border bg-background flex flex-col overflow-hidden transition-all duration-200",
            showChat ? "w-0 opacity-0 overflow-hidden" : "w-[260px]"
          )}>
            {/* Tab bar */}
            <div className="flex border-b border-border shrink-0 overflow-x-auto">
              {(["layers","properties","animation","timeline","scroll","export","history","embed","info","performance"] as RightTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setRightTab(tab)}
                  className={cn(
                    "px-2 py-2 transition-colors whitespace-nowrap",
                    rightTab === tab ? "text-foreground border-b-2 border-primary -mb-px" : "text-muted-foreground hover:text-foreground"
                  )}
                  title={tab}
                >
                  {tab === "layers"     && <Layers        className="h-3.5 w-3.5 mx-auto" />}
                  {tab === "properties" && <Palette       className="h-3.5 w-3.5 mx-auto" />}
                  {tab === "animation"  && <Play          className="h-3.5 w-3.5 mx-auto" />}
                  {tab === "timeline"   && <Timer         className="h-3.5 w-3.5 mx-auto" />}
                  {tab === "scroll"     && <MousePointer2 className="h-3.5 w-3.5 mx-auto" />}
                  {tab === "export"     && <Download      className="h-3.5 w-3.5 mx-auto" />}
                  {tab === "history"    && <History       className="h-3.5 w-3.5 mx-auto" />}
                  {tab === "embed"      && <Code2         className="h-3.5 w-3.5 mx-auto" />}
                  {tab === "info"       && <Info          className="h-3.5 w-3.5 mx-auto" />}
                  {tab === "performance" && <Gauge       className="h-3.5 w-3.5 mx-auto" />}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Layers */}
              {rightTab === "layers" && (
                <div className="p-2 space-y-1">
                  {state.scene.elements.length === 0 && (
                    <div className="text-center py-8 space-y-2">
                      <Layers className="h-10 w-10 mx-auto text-muted-foreground/30" />
                      <p className="text-xs text-muted-foreground">No elements yet</p>
                      <p className="text-[10px] text-muted-foreground/70">Click shapes in the left panel</p>
                    </div>
                  )}
                  {[...state.scene.elements].reverse().map((el) => (
                    <div
                      key={el.id}
                      onClick={() => { handleSelect(el.id); setRightTab("properties"); }}
                      className={cn(
                        "group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-sm transition-colors",
                        state.selectedId === el.id ? "bg-primary/15 text-foreground" : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className="w-3 h-3 rounded-full shrink-0 border border-white/10" style={{ background: el.fill }} />
                      <span className="flex-1 truncate text-xs">{el.name}</span>
                      {el.animation?.preset !== "none" && (
                        <span className="text-[8px] text-primary/60 shrink-0 hidden group-hover:hidden">anim</span>
                      )}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                        <button onClick={(e) => { e.stopPropagation(); dispatch({ type: "REORDER_UP",   id: el.id }); }} className="p-0.5 hover:text-foreground" title="Move up"><ChevronUp   className="h-3 w-3" /></button>
                        <button onClick={(e) => { e.stopPropagation(); dispatch({ type: "REORDER_DOWN", id: el.id }); }} className="p-0.5 hover:text-foreground" title="Move down"><ChevronDown className="h-3 w-3" /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleUpdate(el.id, { visible: !el.visible }); }} className="p-0.5 hover:text-foreground" title={el.visible?"Hide":"Show"}>{el.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}</button>
                        <button onClick={(e) => { e.stopPropagation(); handleUpdate(el.id, { locked: !el.locked }); }} className="p-0.5 hover:text-foreground" title={el.locked?"Unlock":"Lock"}>{el.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}</button>
                        <button onClick={(e) => { e.stopPropagation(); dispatch({ type: "DELETE_ELEMENT", id: el.id }); }} className="p-0.5 hover:text-destructive" title="Delete"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Properties */}
              {rightTab === "properties" && (
                <div className="p-3 space-y-4">
                  {!selectedEl ? (
                    <div className="text-center py-8 space-y-2">
                      <Palette className="h-10 w-10 mx-auto text-muted-foreground/30" />
                      <p className="text-xs text-muted-foreground">Select an element</p>
                      <p className="text-[10px] text-muted-foreground/70">Click any shape to edit its properties</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Name</Label>
                        <Input value={selectedEl.name} onChange={(e) => handleUpdate(selectedEl.id, { name: e.target.value })} className="h-7 text-xs" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {(["x","y","width","height"] as const).map((field) => (
                          <div key={field} className="space-y-1">
                            <Label className="text-xs text-muted-foreground">{field === "width" ? "W" : field === "height" ? "H" : field.toUpperCase()}</Label>
                            <Input type="number" value={(selectedEl as any)[field]} onChange={(e) => handleUpdate(selectedEl.id, { [field]: Number(e.target.value) })} className="h-7 text-xs" />
                          </div>
                        ))}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Fill</Label>
                        <div className="flex gap-2 items-center">
                          <input type="color" value={selectedEl.fill} onChange={(e) => handleUpdate(selectedEl.id, { fill: e.target.value })} className="w-8 h-7 rounded border border-border cursor-pointer bg-transparent" />
                          <Input value={selectedEl.fill} onChange={(e) => handleUpdate(selectedEl.id, { fill: e.target.value })} className="h-7 text-xs font-mono flex-1" />
                        </div>
                      </div>
                      {[
                        { label:"Opacity",  field:"opacity",  min:0,   max:1,   step:0.05, fmt:(v:number)=>`${Math.round(v*100)}%` },
                        { label:"Blur",     field:"blur",     min:0,   max:120, step:2,    fmt:(v:number)=>`${v}px` },
                        { label:"Rotation", field:"rotation", min:0,   max:360, step:1,    fmt:(v:number)=>`${v}°`  },
                      ].map(({ label, field, min, max, step, fmt }) => (
                        <div key={field} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs text-muted-foreground">{label}</Label>
                            <span className="text-xs text-muted-foreground font-mono">{fmt((selectedEl as any)[field] ?? 0)}</span>
                          </div>
                          <Slider min={min} max={max} step={step} value={[(selectedEl as any)[field] ?? 0]} onValueChange={([v]) => handleUpdate(selectedEl.id, { [field]: v })} />
                        </div>
                      ))}
                      {selectedEl.type === "text" && (
                        <>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Text</Label>
                            <Input value={selectedEl.text ?? ""} onChange={(e) => handleUpdate(selectedEl.id, { text: e.target.value })} className="h-7 text-xs" />
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs text-muted-foreground">Font Size</Label>
                              <span className="text-xs text-muted-foreground font-mono">{selectedEl.fontSize ?? 24}px</span>
                            </div>
                            <Slider min={8} max={120} step={2} value={[selectedEl.fontSize ?? 24]} onValueChange={([v]) => handleUpdate(selectedEl.id, { fontSize: v })} />
                          </div>
                        </>
                      )}
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">Visible</Label>
                        <Switch checked={selectedEl.visible} onCheckedChange={(v) => handleUpdate(selectedEl.id, { visible: v })} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">Locked</Label>
                        <Switch checked={selectedEl.locked} onCheckedChange={(v) => handleUpdate(selectedEl.id, { locked: v })} />
                      </div>
                      <div className="pt-2 flex gap-2">
                        <Button variant="ghost" size="sm" className="flex-1 gap-1.5 text-xs h-8" onClick={() => {
                          const dup = { ...selectedEl, id: crypto.randomUUID(), x: selectedEl.x + 20, y: selectedEl.y + 20, name: selectedEl.name + " copy" };
                          dispatch({ type: "ADD_ELEMENT", el: dup });
                        }} title="Duplicate (Ctrl+D)">
                          <Copy className="h-3.5 w-3.5" />Duplicate
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1 gap-1.5 text-xs h-8 text-destructive hover:text-destructive" onClick={() => dispatch({ type: "DELETE_ELEMENT", id: selectedEl.id })} title="Delete (Del)">
                          <Trash2 className="h-3.5 w-3.5" />Delete
                        </Button>
                      </div>
                      <div className="pt-1">
                        <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs h-7" onClick={() => { setShowEnhancer(true); }}>
                          <Sparkles className="h-3 w-3" />AI Enhance scene
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Animation */}
              {rightTab === "animation" && (
                <div className="p-3">
                  {!selectedEl ? (
                    <div className="text-center py-8 space-y-2">
                      <Play className="h-10 w-10 mx-auto text-muted-foreground/30" />
                      <p className="text-xs text-muted-foreground">Select an element to animate</p>
                    </div>
                  ) : (
                    <AnimationPresets element={selectedEl} onChange={(updates) => handleUpdate(selectedEl.id, updates)} />
                  )}
                </div>
              )}

              {/* Timeline */}
              {rightTab === "timeline" && (
                <div className="flex flex-col h-full overflow-hidden">
                  <AnimationTimeline
                    elements={state.scene.elements}
                    selectedId={state.selectedId}
                    onSelect={(id) => dispatch({ type: "SELECT", id })}
                    onUpdateElement={(id, updates) => handleUpdate(id, updates)}
                  />
                </div>
              )}

              {/* Scroll */}
              {rightTab === "scroll" && (
                <div className="overflow-y-auto">
                  {!selectedEl ? (
                    <div className="text-center py-8 space-y-2 p-3">
                      <MousePointer2 className="h-10 w-10 mx-auto text-muted-foreground/30" />
                      <p className="text-xs text-muted-foreground">Select an element</p>
                      <p className="text-[10px] text-muted-foreground/70">Configure GSAP ScrollTrigger per element</p>
                    </div>
                  ) : (
                    <ScrollTriggerConfig
                      element={selectedEl}
                      onChange={(cfg: ScrollConfig) => handleUpdate(selectedEl.id, { scrollConfig: cfg } as any)}
                    />
                  )}
                </div>
              )}

              {/* Export */}
              {rightTab === "export" && (
                <div className="p-3">
                  <SceneExport sceneId={sceneId} />
                </div>
              )}

              {/* History */}
              {rightTab === "history" && (
                <div className="p-3">
                  <VersionHistory
                    scene={state.scene}
                    onRestore={(restoredScene) => dispatch({ type: "RESTORE_SCENE", scene: restoredScene })}
                  />
                </div>
              )}

              {/* Embed */}
              {rightTab === "embed" && (
                <div className="p-3">
                  <p className="text-xs font-medium mb-3">Embed / Share</p>
                  <SceneEmbedCode
                    sceneId={sceneId}
                    sceneName={state.scene.name}
                    isPublished={state.scene.status === "published"}
                  />
                </div>
              )}

              {/* Info */}
              {rightTab === "info" && (
                <InfoTab
                  scene={state.scene}
                  onUpdate={(patch) => dispatch({ type: "LOAD_SCENE", scene: { ...state.scene, ...patch } })}
                  onSave={(patch) => updateScene.mutateAsync({ id: sceneId, data: patch }).then(() => toast({ title: "Saved!" }))}
                />
              )}

              {/* Performance */}
              {rightTab === "performance" && (
                <PerformanceAuditor
                  elements={state.scene.elements}
                  onOptimize={(fixes) => {
                    toast({ title: `${fixes.length} optimization(s) found`, description: fixes.join("; ") });
                  }}
                />
              )}
            </div>
          </div>

          {/* ── AI Chat panel ── */}
          <div className={cn(
            "shrink-0 border-l border-border bg-background flex flex-col overflow-hidden transition-all duration-200",
            showChat ? "w-[300px]" : "w-0 opacity-0 overflow-hidden"
          )}>
            {showChat && (
              <SceneChat
                sceneId={sceneId}
                elements={state.scene.elements}
                selectedId={state.selectedId}
                onApply={handleChatApply}
                onClose={() => setShowChat(false)}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
