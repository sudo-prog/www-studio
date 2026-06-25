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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, Download, Save, Cloud, CloudOff, Eye,
  Undo, Redo, ZoomIn, ZoomOut, Grid3x3, Ruler,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { makeFreeformElement } from "@/lib/freeform-types";
import { GitHubSaveButton } from "@/components/freeform/GitHubSaveButton";

export default function FreeformEditor() {
  const { projectId } = useParams();
  const [state, dispatch] = useReducer(freeformReducer, {}, () =>
    createInitialFreeformState(
      projectId ? { id: projectId, slug: projectId } : undefined
    )
  );
  const [pageName, setPageName] = useState(state.page.name);
  const [showPreview, setShowPreview] = useState(false);

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

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0f] text-foreground overflow-hidden">
      {/* Top bar */}
      <header className="h-12 shrink-0 border-b border-border bg-background flex items-center justify-between px-4 gap-3 z-50">
        <div className="flex items-center gap-3">
          <Link href="/projects" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Input
            value={pageName}
            onChange={(e) => {
              setPageName(e.target.value);
              dispatch({ type: "SET_NAME", name: e.target.value });
            }}
            className="h-7 text-sm w-48 bg-transparent border-transparent hover:border-border focus:border-border"
          />
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => dispatch({ type: "UNDO" })}
            disabled={state.past.length === 0}
            title="Undo"
          >
            <Undo className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => dispatch({ type: "REDO" })}
            disabled={state.future.length === 0}
            title="Redo"
          >
            <Redo className="w-3.5 h-3.5" />
          </Button>

          <div className="w-px h-5 bg-border mx-1" />

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => dispatch({ type: "SET_ZOOM", zoom: Math.max(0.25, state.zoom - 0.1) })}
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <span className="text-[10px] text-muted-foreground w-10 text-center tabular-nums">
            {Math.round(state.zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => dispatch({ type: "SET_ZOOM", zoom: Math.min(3, state.zoom + 0.1) })}
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>

          <div className="w-px h-5 bg-border mx-1" />

          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7", state.snapGrid && "text-primary")}
            onClick={() => dispatch({ type: "TOGGLE_SNAP" })}
            title="Snap to grid"
          >
            <Grid3x3 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7", state.showGuides && "text-primary")}
            onClick={() => dispatch({ type: "TOGGLE_GUIDES" })}
            title="Alignment guides"
          >
            <Ruler className="w-3.5 h-3.5" />
          </Button>

          <div className="w-px h-5 bg-border mx-1" />

          <GitHubSaveButton page={state.page} />

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowPreview(!showPreview)}
            title="Preview"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={handleExport}
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </Button>
        </div>
      </header>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left toolbar */}
        {!showPreview && <FreeformToolbar onAddElement={handleAddElement} />}

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
            onSelect={handleSelect}
            onMove={handleMove}
            onResize={handleResize}
          />
        )}

        {/* Right properties panel */}
        {!showPreview && (
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
          />
        )}
      </div>

      {/* Status bar */}
      <footer className="h-6 shrink-0 border-t border-border bg-background flex items-center justify-between px-3 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>{state.page.elements.length} elements</span>
          <span>Canvas: {state.page.canvasWidth}×{state.page.canvasHeight}</span>
          {state.isDirty && (
            <span className="flex items-center gap-1 text-yellow-500">
              <CloudOff className="w-3 h-3" /> Unsaved
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span>Zoom: {Math.round(state.zoom * 100)}%</span>
          {state.snapGrid && <span className="text-primary">Snap: {state.gridSize}px</span>}
        </div>
      </footer>
    </div>
  );
}
