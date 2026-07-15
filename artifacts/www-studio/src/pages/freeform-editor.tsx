import { useState, useCallback, useReducer } from "react";
import { Link, useParams } from "wouter";
import {
  freeformReducer,
  createInitialFreeformState,
  exportFreeformToHTML,
} from "@/lib/freeformStore";
import FreeformCanvas from "@/components/freeform/FreeformCanvas";
import FreeformToolbar from "@/components/freeform/FreeformToolbar";
import FreeformPropertiesPanel from "@/components/freeform/FreeformPropertiesPanel";
import FreeformAIChat, { type FreeformAIAction } from "@/components/freeform/FreeformAIChat";
import { ScreenshotToFreeform } from "@/components/freeform/ScreenshotToFreeform";
import CustomCodePanel from "@/components/freeform/CustomCodePanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, Download, Save, Cloud, CloudOff, Eye,
  Undo, Redo, ZoomIn, ZoomOut, Grid3x3, Ruler,
  Plus, Layers, Palette, Component, Sparkles, Camera,
  Smartphone, FileCode, SlidersHorizontal, Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { makeFreeformElement, Artboard, ComponentMaster, type FreeformElement, type FreeformPage } from "@/lib/freeform-types";
import { DEFAULT_TOKENS, tokensToCSS } from "@/lib/design-tokens";
import { GitHubSaveButton } from "@/components/freeform/GitHubSaveButton";
import { loadProject, backupToFreeformPage } from "@/lib/github-storage";
import { useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function FreeformEditor() {
  const { projectId } = useParams();
  const [state, dispatch] = useReducer(freeformReducer, {}, () =>
    createInitialFreeformState(
      projectId ? { id: projectId, slug: projectId } : undefined
    )
  );
  const [pageName, setPageName] = useState(state.page.name);
  const [showPreview, setShowPreview] = useState(false);
  const [showTokenPanel, setShowTokenPanel] = useState(false);
  const [showComponentPanel, setShowComponentPanel] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [showCssJsPanel, setShowCssJsPanel] = useState(false);
  const [showScreenshotDialog, setShowScreenshotDialog] = useState(false);
  const [mobileWidth, setMobileWidth] = useState(375);
  const [editingColor, setEditingColor] = useState<string | null>(null);
  const [editingColorDraft, setEditingColorDraft] = useState("");

  const [drawingId, setDrawingId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const [mobilePanelsOpen, setMobilePanelsOpen] = useState(false);

  const selectedEl = state.page.elements.find((e) => e.id === state.selectedId) ?? null;

  const handleAddElement = useCallback(
    (el: ReturnType<typeof makeFreeformElement>) => {
      dispatch({ type: "ADD_ELEMENT", el });
    },
    []
  );

  const handleSelect = useCallback((id: string | null) => {
    dispatch({ type: "SELECT", id });
  }, []);

  const handleMove = useCallback((id: string, x: number, y: number) => {
    dispatch({ type: "MOVE_ELEMENT", id, x, y });
  }, []);

  const handleResize = useCallback((id: string, w: number, h: number) => {
    dispatch({ type: "RESIZE_ELEMENT", id, width: w, height: h });
  }, []);

  const handleUpdate = useCallback((id: string, updates: any) => {
    dispatch({ type: "UPDATE_ELEMENT", id, updates });
  }, []);

  const handleDelete = useCallback(() => {
    if (state.selectedId) dispatch({ type: "DELETE_ELEMENT", id: state.selectedId });
  }, [state.selectedId]);

  const handleDrawComplete = useCallback((id: string, drawData: string) => {
    dispatch({ type: "UPDATE_ELEMENT", id, updates: { drawData } });
    setDrawingId(null);
  }, []);

  // Load existing project on mount
  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    loadProject(projectId).then((entry) => {
      if (cancelled || !entry || !("elements" in entry)) return;
      try {
        const page = backupToFreeformPage(entry);
        dispatch({ type: "LOAD_PAGE", page });
      } catch {
        // ignore malformed backup
      }
    });
    return () => { cancelled = true; };
  }, [projectId]);

  const handleExport = () => {
    const html = exportFreeformToHTML(state.page);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${state.page.slug || "freeform"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Artboard helpers ──
  const handleAddArtboard = () => {
    const id = crypto.randomUUID();
    const num = (state.page.artboards?.length || 0) + 1;
    dispatch({
      type: "ADD_ARTBOARD",
      artboard: { id, name: `Artboard ${num}`, x: 0, y: 0, width: 1440, height: 900 },
    });
  };

  // ── Component helpers ──
  const handleCreateComponent = () => {
    if (!state.selectedId) return;
    const id = crypto.randomUUID();
    dispatch({
      type: "ADD_COMPONENT",
      component: { id, name: "Component", elementId: state.selectedId, variants: [] },
    });
  };

  const handleCreateInstance = (componentId: string) => {
    const master = (state.page.components || []).find((c) => c.id === componentId);
    if (!master) return;
    const masterEl = state.page.elements.find((e) => e.id === master.elementId);
    if (!masterEl) return;
    const instance = makeFreeformElement(masterEl.type, {
      ...masterEl,
      id: crypto.randomUUID(),
      x: masterEl.x + 50,
      y: masterEl.y + 50,
      masterId: master.id,
      name: `${master.name} instance`,
    });
    dispatch({ type: "ADD_ELEMENT", el: instance as any });
  };

  // ── AI Chat actions ──
  const handleAIApplyActions = useCallback((actions: FreeformAIAction[]) => {
    for (const action of actions) {
      switch (action.type) {
        case "add":
          if (action.element) {
            dispatch({ type: "ADD_ELEMENT", el: action.element as FreeformElement });
          }
          break;
        case "update":
          if (action.id && action.updates) {
            dispatch({ type: "UPDATE_ELEMENT", id: action.id, updates: action.updates });
          }
          break;
        case "delete":
          if (action.id) {
            dispatch({ type: "DELETE_ELEMENT", id: action.id });
          }
          break;
        case "clear":
          // Clear all elements — dispatch a batch by dispatching delete for each
          state.page.elements.forEach((el) => {
            dispatch({ type: "DELETE_ELEMENT", id: el.id });
          });
          break;
        case "style":
          if (action.id && action.updates) {
            dispatch({ type: "UPDATE_ELEMENT", id: action.id, updates: action.updates });
          }
          break;
        case "layout":
          if (action.elements) {
            // Batch replace — add each element
            action.elements.forEach((el) => {
              dispatch({ type: "ADD_ELEMENT", el: el as FreeformElement });
            });
          }
          break;
      }
    }
  }, [state.page.elements]);

  // ── Screenshot to freeform ──
  const handleScreenshotApply = useCallback((elements: FreeformElement[]) => {
    elements.forEach((el) => {
      dispatch({ type: "ADD_ELEMENT", el });
    });
  }, []);

  const tokens = state.page.tokens || DEFAULT_TOKENS;

  const rightPanelsContent = (
    <>
      <FreeformPropertiesPanel
        selectedEl={selectedEl}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onDuplicate={() => {
          if (state.selectedId)
            dispatch({ type: "DUPLICATE_ELEMENT", id: state.selectedId });
        }}
        onSendForward={() => {
          if (state.selectedId)
            dispatch({ type: "SEND_FORWARD", id: state.selectedId });
        }}
        onSendBackward={() => {
          if (state.selectedId)
            dispatch({ type: "SEND_BACKWARD", id: state.selectedId });
        }}
        className={isMobile ? "w-full" : undefined}
      />
      {showTokenPanel && !showPreview && (
        <div className={cn("shrink-0 border-l border-border bg-background overflow-y-auto p-3 space-y-3", isMobile ? "w-full border-l-0 border-t" : "w-64")}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Design Tokens</span>
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setShowTokenPanel(false)}>×</Button>
          </div>

          {/* Colors */}
          <div>
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Colors</Label>
            <div className="grid grid-cols-6 gap-1">
              {Object.entries(tokens.colors).map(([name, value]) => (
                <div key={name} className="relative">
                  <button
                    title={name}
                    className="w-8 h-8 rounded border border-border hover:ring-1 hover:ring-primary"
                    style={{ background: value as string }}
                    onClick={() => {
                      setEditingColor(name);
                      setEditingColorDraft(String(value));
                    }}
                  />
                  {editingColor === name && (
                    <div className="absolute z-50 top-full mt-1 left-0 bg-background border border-border rounded shadow-lg p-2 flex gap-1">
                      <input
                        type="color"
                        value={editingColorDraft}
                        onChange={(e) => setEditingColorDraft(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                      />
                      <input
                        type="text"
                        value={editingColorDraft}
                        onChange={(e) => setEditingColorDraft(e.target.value)}
                        onBlur={() => {
                          dispatch({ type: "UPDATE_TOKEN", category: "colors", key: name, value: editingColorDraft });
                          setEditingColor(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            dispatch({ type: "UPDATE_TOKEN", category: "colors", key: name, value: editingColorDraft });
                            setEditingColor(null);
                          }
                          if (e.key === 'Escape') setEditingColor(null);
                        }}
                        className="text-[10px] w-20 rounded border border-border bg-background px-1"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div>
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Font Sizes</Label>
            <div className="space-y-1">
              {Object.entries(tokens.typography.fontSize).map(([name, value]) => (
                <div key={name} className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">{name}</span>
                  <span>{value as string}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Radii */}
          <div>
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Radii</Label>
            <div className="flex flex-wrap gap-1">
              {Object.entries(tokens.radii).map(([name, value]) => (
                <div key={name} className="text-[10px] bg-muted/50 px-2 py-0.5 rounded">
                  {name}: {value as number}px
                </div>
              ))}
            </div>
          </div>

          {/* Export CSS */}
          <Button
            variant="outline"
            size="sm"
            className="w-full h-7 text-xs"
            onClick={() => {
              const css = tokensToCSS(tokens);
              navigator.clipboard.writeText(css);
              alert("CSS variables copied to clipboard!");
            }}
          >
            Copy CSS Variables
          </Button>
        </div>
      )}

      {showComponentPanel && !showPreview && (
        <div className={cn("shrink-0 border-l border-border bg-background overflow-y-auto p-3 space-y-3", isMobile ? "w-full border-l-0 border-t" : "w-64")}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Components</span>
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setShowComponentPanel(false)}>×</Button>
          </div>

          {selectedEl && (
            <Button variant="outline" size="sm" className="w-full h-7 text-xs gap-1" onClick={handleCreateComponent}>
              <Component className="w-3 h-3" /> Create Component from Selection
            </Button>
          )}

          {(state.page.components || []).length === 0 ? (
            <p className="text-[10px] text-muted-foreground">
              No components yet. Select an element and click "Create Component" to create a master component.
            </p>
          ) : (
            <div className="space-y-2">
              {(state.page.components || []).map((comp) => (
                <div key={comp.id} className="border border-border rounded-lg p-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium">{comp.name}</span>
                    <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => dispatch({ type: "DELETE_COMPONENT", id: comp.id })}>×</Button>
                  </div>
                  <Button variant="outline" size="sm" className="w-full h-6 text-[10px]" onClick={() => handleCreateInstance(comp.id)}>
                    + Create Instance
                  </Button>
                  {comp.variants.length > 0 && (
                    <div className="text-[9px] text-muted-foreground">
                      {comp.variants.length} variant(s)
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showAIChat && !showPreview && (
        <FreeformAIChat
          elements={state.page.elements}
          canvasWidth={state.page.canvasWidth}
          canvasHeight={state.page.canvasHeight}
          onApplyActions={handleAIApplyActions}
          onClose={() => setShowAIChat(false)}
        />
      )}

      {showCssJsPanel && !showPreview && (
        <CustomCodePanel
          customCss={state.page.customCss || ""}
          customJs={state.page.customJs || ""}
          onCssChange={(css) => dispatch({ type: "SET_CUSTOM_CSS", css })}
          onJsChange={(js) => dispatch({ type: "SET_CUSTOM_JS", js })}
          onClose={() => setShowCssJsPanel(false)}
        />
      )}

      {showMobilePreview && !showPreview && (
        <div className={cn("shrink-0 border-l border-border bg-background overflow-y-auto p-3 space-y-3", isMobile ? "w-full border-l-0 border-t" : "w-80")}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Mobile Preview</span>
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setShowMobilePreview(false)}>×</Button>
          </div>

          <div className="flex gap-1">
            {[
              { label: "iPhone SE", w: 375 },
              { label: "iPad Mini", w: 768 },
              { label: "Pixel 7", w: 412 },
            ].map((device) => (
              <button
                key={device.w}
                className={cn(
                  "text-[10px] px-2 py-1 rounded-lg transition-colors",
                  mobileWidth === device.w ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setMobileWidth(device.w)}
              >
                {device.label}
              </button>
            ))}
          </div>

          <div className="flex justify-center py-4">
            <div
              className="border-2 border-border rounded-2xl overflow-hidden bg-[#0d0d14] shadow-xl"
              style={{ width: Math.min(mobileWidth, 360), height: 500 }}
            >
              <div
                className="relative mx-auto"
                style={{
                  width: mobileWidth,
                  height: 500,
                  background:
                    state.page.background.type === "color"
                      ? state.page.background.value
                      : state.page.background.type === "gradient"
                      ? state.page.background.value
                      : `url(${state.page.background.value})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  overflow: "hidden",
                  transform: `scale(${Math.min(1, 340 / mobileWidth)})`,
                  transformOrigin: "top center",
                }}
                dangerouslySetInnerHTML={{
                  __html: exportFreeformToHTML({ ...state.page, canvasWidth: mobileWidth }),
                }}
              />
            </div>
          </div>

          <p className="text-[9px] text-muted-foreground text-center">
            Preview at {mobileWidth}px width • Touch handles enabled
          </p>
        </div>
      )}
    </>
  );

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0f] text-foreground overflow-hidden">
      {/* Top bar */}
      <header className="h-12 shrink-0 border-b border-border bg-background flex items-center justify-between px-4 gap-3 z-50 overflow-x-auto">
        <div className="flex items-center gap-3">
          <Link href="/projects" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Link href="/" className="flex items-center gap-1.5 font-semibold text-sm tracking-tight hover:text-primary transition-colors shrink-0">
            <Code2 className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">WWW Studio</span>
          </Link>
          <Input
            value={pageName}
            onChange={(e) => {
              setPageName(e.target.value);
              dispatch({ type: "SET_NAME", name: e.target.value });
            }}
            className="h-7 text-sm w-48 min-w-0 flex-1 sm:w-48 sm:flex-none bg-transparent border-transparent hover:border-border focus:border-border"
          />
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => dispatch({ type: "UNDO" })} disabled={state.past.length === 0} title="Undo">
            <Undo className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => dispatch({ type: "REDO" })} disabled={state.future.length === 0} title="Redo">
            <Redo className="w-3.5 h-3.5" />
          </Button>

          <div className="w-px h-5 bg-border mx-1" />

          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => dispatch({ type: "SET_ZOOM", zoom: Math.max(0.25, state.zoom - 0.1) })} title="Zoom out">
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <span className="text-[10px] text-muted-foreground w-10 text-center tabular-nums">
            {Math.round(state.zoom * 100)}%
          </span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => dispatch({ type: "SET_ZOOM", zoom: Math.min(3, state.zoom + 0.1) })} title="Zoom in">
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>

          <div className="w-px h-5 bg-border mx-1" />

          <Button variant="ghost" size="icon" className={cn("h-7 w-7", state.snapGrid && "text-primary")} onClick={() => dispatch({ type: "TOGGLE_SNAP" })} title="Snap to grid">
            <Grid3x3 className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className={cn("h-7 w-7", state.showGuides && "text-primary")} onClick={() => dispatch({ type: "TOGGLE_GUIDES" })} title="Alignment guides">
            <Ruler className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className={cn("h-7 w-7", state.showRulers && "text-primary")} onClick={() => dispatch({ type: "TOGGLE_RULERS" })} title="Rulers">
            <Layers className="w-3.5 h-3.5" />
          </Button>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Artboard button */}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleAddArtboard} title="Add artboard">
            <Plus className="w-3.5 h-3.5" />
          </Button>

          {/* Design tokens */}
          <Button variant="ghost" size="icon" className={cn("h-7 w-7", showTokenPanel && "text-primary")} onClick={() => { setShowTokenPanel(!showTokenPanel); setShowComponentPanel(false); }} title="Design tokens">
            <Palette className="w-3.5 h-3.5" />
          </Button>

          {/* Components */}
          <Button variant="ghost" size="icon" className={cn("h-7 w-7", showComponentPanel && "text-primary")} onClick={() => { setShowComponentPanel(!showComponentPanel); setShowTokenPanel(false); }} title="Components">
            <Component className="w-3.5 h-3.5" />
          </Button>

          <div className="w-px h-5 bg-border mx-1" />

          {/* AI Chat */}
          <Button variant="ghost" size="icon" className={cn("h-7 w-7", showAIChat && "text-primary")} onClick={() => setShowAIChat(!showAIChat)} title="AI Chat">
            <Sparkles className="w-3.5 h-3.5" />
          </Button>

          {/* Screenshot to Freeform */}
          <ScreenshotToFreeform
            canvasWidth={state.page.canvasWidth}
            canvasHeight={state.page.canvasHeight}
            onApply={handleScreenshotApply}
            open={showScreenshotDialog}
            onOpenChange={setShowScreenshotDialog}
            hideTrigger
          />

          {/* Mobile Preview */}
          <Button variant="ghost" size="icon" className={cn("h-7 w-7", showMobilePreview && "text-primary")} onClick={() => setShowMobilePreview(!showMobilePreview)} title="Mobile Preview">
            <Smartphone className="w-3.5 h-3.5" />
          </Button>

          {/* Custom CSS/JS */}
          <Button variant="ghost" size="icon" className={cn("h-7 w-7", showCssJsPanel && "text-primary")} onClick={() => setShowCssJsPanel(!showCssJsPanel)} title="Custom CSS/JS">
            <FileCode className="w-3.5 h-3.5" />
          </Button>

          <div className="w-px h-5 bg-border mx-1" />

          <GitHubSaveButton page={state.page} onLoad={(page) => dispatch({ type: "LOAD_PAGE", page })} />

          {isMobile && (
            <Sheet open={mobilePanelsOpen} onOpenChange={setMobilePanelsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Panels">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[75vh] overflow-y-auto">
                <div className="space-y-6 mt-6">
                  {rightPanelsContent}
                </div>
              </SheetContent>
            </Sheet>
          )}

          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowPreview(!showPreview)} title="Preview">
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={handleExport}>
            <Download className="w-3.5 h-3.5" />
            Export
          </Button>
        </div>
      </header>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left toolbar */}
        {!showPreview && <FreeformToolbar onAddElement={handleAddElement} onStartDraw={setDrawingId} />}

        {/* Canvas */}
        {showPreview ? (
          <div className="flex-1 overflow-auto p-8 bg-[#0d0d14]">
            <div
              className="relative mx-auto shadow-2xl"
              style={{
                width: state.page.canvasWidth,
                height: state.page.canvasHeight,
                background:
                  state.page.background.type === "color"
                    ? state.page.background.value
                    : state.page.background.type === "gradient"
                    ? state.page.background.value
                    : `url(${state.page.background.value})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              dangerouslySetInnerHTML={{
                __html: exportFreeformToHTML(state.page),
              }}
            />
          </div>
        ) : (
          <FreeformCanvas
            elements={state.page.elements}
            selectedId={state.selectedId}
            canvasWidth={state.page.canvasWidth}
            canvasHeight={state.page.canvasHeight}
            background={state.page.background}
            zoom={state.zoom}
            snapGrid={state.snapGrid}
            showGuides={state.showGuides}
            showRulers={state.showRulers}
            artboards={state.page.artboards}
            activeArtboardId={state.activeArtboardId}
            isInfiniteCanvas={state.page.artboards && state.page.artboards.length > 1}
            drawingId={drawingId}
            onDrawComplete={handleDrawComplete}
            onSelect={handleSelect}
            onMove={handleMove}
            onResize={handleResize}
          />
        )}

        {/* Right panels — desktop side columns */}
        {!showPreview && !isMobile && rightPanelsContent}
      </div>

      {/* Status bar */}
      <footer className="h-6 shrink-0 border-t border-border bg-background flex items-center justify-between px-3 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>{state.page.elements.length} elements</span>
          <span>Canvas: {state.page.canvasWidth}×{state.page.canvasHeight}</span>
          {state.page.artboards && state.page.artboards.length > 0 && (
            <span>{state.page.artboards.length} artboard(s)</span>
          )}
          {state.isDirty && (
            <span className="flex items-center gap-1 text-yellow-500">
              <CloudOff className="w-3 h-3" /> Unsaved
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span>Zoom: {Math.round(state.zoom * 100)}%</span>
          {state.snapGrid && <span className="text-primary">Snap: {state.gridSize}px</span>}
          {state.showRulers && <span className="text-primary">Rulers</span>}
        </div>
      </footer>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={cn("text-[10px] text-muted-foreground uppercase tracking-wider", className)}>{children}</label>;
}
