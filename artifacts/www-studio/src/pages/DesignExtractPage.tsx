// ─── DesignExtractPage.tsx ────────────────────────────────────────────────────
// Main page for the Design Intelligence Module — state machine driving:
//   input → processing → complete | error
// Two-column layout: left (input/progress/md) right (token editor/history)

import { useReducer, useEffect, useCallback, useRef } from "react";
import { useRoute } from "wouter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, AlertCircle } from "lucide-react";
import DesignExtractInput, { type Reference } from "@/components/design-extract/DesignExtractInput";
import ExtractionProgress from "@/components/design-extract/ExtractionProgress";
import DesignMdPreview from "@/components/design-extract/DesignMdPreview";
import DesignTokenEditor, { type TokenData } from "@/components/design-extract/DesignTokenEditor";
import ExportPanel from "@/components/design-extract/ExportPanel";
import ExtractionHistory, { type ExtractionSummary } from "@/components/design-extract/ExtractionHistory";
import { listResults, getResult, saveResult, isStaticMode, extractDesignFromReferences } from "@/lib/designExtractClient";

// ─── State ───────────────────────────────────────────────────────────────────

type Phase = "input" | "processing" | "complete" | "error";

interface State {
  phase: Phase;
  extractionId: string | null;
  url: string;
  tokens: TokenData | null;
  markdown: string | null;
  error: string | null;
  references: Reference[];
  history: ExtractionSummary[];
}

type Action =
  | { type: "SUBMIT"; url: string; references: Reference[] }
  | { type: "POLL_RESULT"; tokens: TokenData; markdown: string }
  | { type: "SET_ERROR"; error: string }
  | { type: "RESET" }
  | { type: "LOAD_EXISTING"; extractionId: string; url: string; tokens: TokenData; markdown: string }
  | { type: "UPDATE_HISTORY"; history: ExtractionSummary[] };

const initialState: State = {
  phase: "input",
  extractionId: null,
  url: "",
  tokens: null,
  markdown: null,
  error: null,
  references: [],
  history: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SUBMIT":
      return {
        ...state,
        phase: "processing",
        url: action.url,
        references: action.references,
        error: null,
        extractionId: null,
        tokens: null,
        markdown: null,
      };
    case "POLL_RESULT":
      return {
        ...state,
        phase: "complete",
        tokens: action.tokens,
        markdown: action.markdown,
      };
    case "SET_ERROR":
      return { ...state, phase: "error", error: action.error };
    case "RESET":
      return { ...initialState, history: state.history };
    case "LOAD_EXISTING":
      return {
        ...state,
        phase: "complete",
        extractionId: action.extractionId,
        url: action.url,
        tokens: action.tokens,
        markdown: action.markdown,
        error: null,
      };
    case "UPDATE_HISTORY":
      return { ...state, history: action.history };
    default:
      return state;
  }
}

// ─── Default tokens ──────────────────────────────────────────────────────────

function defaultTokens(): TokenData {
  return {
    colors: {
      primary: "#3b82f6",
      secondary: "#8b5cf6",
      accent: "#f59e0b",
      background: "#0a0a0b",
      surface: "#18181b",
      text: "#fafafa",
      textMuted: "#a1a1aa",
      border: "#27272a",
      success: "#22c55e",
    },
    typography: {
      display: { family: "Inter", weights: [400, 600, 700] },
      body: { family: "Inter", weights: [400, 500] },
      mono: { family: "JetBrains Mono", weights: [400] },
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, "2xl": 48, "3xl": 64, "4xl": 96 },
    radius: { sm: 4, md: 8, lg: 12, xl: 16, full: 9999 },
    shadows: {
      sm: "0 1px 2px rgba(0,0,0,0.05)",
      md: "0 4px 6px rgba(0,0,0,0.1)",
      lg: "0 10px 15px rgba(0,0,0,0.1)",
      xl: "0 20px 25px rgba(0,0,0,0.15)",
      "2xl": "0 25px 50px rgba(0,0,0,0.25)",
    },
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function DesignExtractPage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [match, params] = useRoute("/design-extract/:id?");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const extractionIdRef = useRef<string | null>(null);

  // Load history on mount
  useEffect(() => {
    if (isStaticMode()) {
      const results = listResults();
      const summaries: ExtractionSummary[] = results.map((r) => ({
        id: r.id,
        url: r.url,
        status: r.status,
        createdAt: r.createdAt,
        primaryColor: r.tokens?.colors?.primary,
        error: r.error,
      }));
      dispatch({ type: "UPDATE_HISTORY", history: summaries });
    }
  }, []);

  // Handle /:id route — load existing extraction
  useEffect(() => {
    if (!params?.id) return;

    const id = params.id;

    if (isStaticMode()) {
      const result = getResult(id);
      if (result) {
        dispatch({
          type: "LOAD_EXISTING",
          extractionId: id,
          url: result.url,
          tokens: result.tokens,
          markdown: result.markdown,
        });
      } else {
        dispatch({ type: "SET_ERROR", error: "Extraction not found" });
      }
      return;
    }

    // API mode: fetch from server
    fetch(`/api/design-extract/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        dispatch({
          type: "LOAD_EXISTING",
          extractionId: id,
          url: data.url,
          tokens: data.tokens,
          markdown: data.markdown,
        });
      })
      .catch((err) => {
        dispatch({ type: "SET_ERROR", error: err.message || "Failed to load extraction" });
      });
  }, [params?.id]);

  // Poll for results during processing
  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (state.phase !== "processing") {
      stopPolling();
      return;
    }

    const poll = async () => {
      const id = extractionIdRef.current;
      if (!id) return;

      try {
        const res = await fetch(`/api/design-extract/${id}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === "complete") {
          stopPolling();
          dispatch({
            type: "POLL_RESULT",
            tokens: data.tokens,
            markdown: data.markdown,
          });
        } else if (data.status === "error") {
          stopPolling();
          dispatch({ type: "SET_ERROR", error: data.error || "Extraction failed" });
        }
      } catch {
        // Will retry on next poll
      }
    };

    pollRef.current = setInterval(poll, 2000);
    return stopPolling;
  }, [state.phase, stopPolling]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (url: string, references: Reference[]) => {
      dispatch({ type: "SUBMIT", url, references });

      if (isStaticMode()) {
        // Browser mode: call Gemini directly
        try {
          const result = await extractDesignFromReferences(references);
          extractionIdRef.current = result.id;
          dispatch({
            type: "POLL_RESULT",
            tokens: result.tokens,
            markdown: result.markdown,
          });
          // Update history
          const results = listResults();
          const summaries: ExtractionSummary[] = results.map((r) => ({
            id: r.id,
            url: r.url,
            status: r.status,
            createdAt: r.createdAt,
            primaryColor: r.tokens?.colors?.primary,
            error: r.error,
          }));
          dispatch({ type: "UPDATE_HISTORY", history: summaries });
        } catch (err: any) {
          dispatch({ type: "SET_ERROR", error: err.message || "Extraction failed" });
        }
        return;
      }

      // API mode: POST to server
      try {
        const res = await fetch("/api/design-extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, references }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        extractionIdRef.current = data.id;
        // URL sync
        window.location.hash = `/design-extract/${data.id}`;
      } catch (err: any) {
        dispatch({ type: "SET_ERROR", error: err.message || "Failed to start extraction" });
      }
    },
    []
  );

  // Handle token change
  const handleTokenChange = useCallback(
    (tokens: TokenData) => {
      dispatch({ type: "POLL_RESULT", tokens, markdown: state.markdown });
      // Persist to localStorage in static mode
      if (isStaticMode() && state.extractionId) {
        const result = getResult(state.extractionId);
        if (result) {
          saveResult({ ...result, tokens });
        }
      }
    },
    [state.markdown, state.extractionId]
  );

  // Handle save
  const handleSave = useCallback(async () => {
    if (!state.extractionId || isStaticMode()) return;
    try {
      await fetch(`/api/design-extract/${state.extractionId}/save`, {
        method: "POST",
      });
    } catch {
      // ignore
    }
  }, [state.extractionId]);

  // Handle apply to project
  const handleApplyToProject = useCallback(
    async (_projectId: string) => {
      // Implementation would POST to API to apply tokens to a project
      if (!state.tokens) return;
      try {
        await fetch("/api/design-extract/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId: _projectId, tokens: state.tokens }),
        });
      } catch {
        // ignore in static mode
      }
    },
    [state.tokens]
  );

  const handleHistorySelect = useCallback((id: string) => {
    window.location.hash = `/design-extract/${id}`;
  }, []);

  const isProcessing = state.phase === "processing";
  const showEditor = state.phase === "complete" && state.tokens;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-foreground">
      {/* Header */}
      <div className="border-b border-[#27272a] px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-[#3b82f6]" />
          <h1 className="text-lg font-semibold">Design Extract</h1>
          <span className="text-xs text-muted-foreground">
            {isStaticMode() ? "Browser Mode" : "Server Mode"}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {isStaticMode() && (
          <Alert className="mb-4 border-[#3b82f6]/30 bg-[#3b82f6]/5">
            <AlertCircle className="h-4 w-4 text-[#3b82f6]" />
            <AlertDescription className="text-xs text-[#3b82f6]">
              Browser mode — using Gemini API directly. Results stored locally.
            </AlertDescription>
          </Alert>
        )}

        {state.phase === "error" && (
          <Alert className="mb-4 border-red-500/30 bg-red-500/5" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {state.error}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-4">
            {state.phase === "input" && (
              <DesignExtractInput onSubmit={handleSubmit} isProcessing={false} />
            )}

            {state.phase === "processing" && (
              <ExtractionProgress url={state.url} startedAt={Date.now()} />
            )}

            {state.phase === "complete" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-mono text-xs bg-[#27272a] px-2 py-1 rounded">
                    {state.url}
                  </span>
                </div>
                {state.markdown && (
                  <ScrollArea className="h-[500px] border border-[#27272a] rounded-lg bg-[#18181b] p-4">
                    <DesignMdPreview tokens={state.tokens!} />
                  </ScrollArea>
                )}
                <ExportPanel
                  extractionId={state.extractionId}
                  onSave={handleSave}
                  onApplyToProject={handleApplyToProject}
                />
              </div>
            )}

            {state.phase === "error" && (
              <div className="space-y-4">
                <p className="text-sm text-red-400">{state.error}</p>
                <button
                  onClick={() => dispatch({ type: "RESET" })}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Try again
                </button>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {showEditor && (
              <div className="border border-[#27272a] rounded-lg bg-[#18181b] p-4">
                <h2 className="text-sm font-medium mb-3 text-muted-foreground">
                  Token Editor
                </h2>
                <DesignTokenEditor tokens={state.tokens!} onChange={handleTokenChange} />
              </div>
            )}

            <div className="border border-[#27272a] rounded-lg bg-[#18181b] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#27272a]">
                <h2 className="text-sm font-medium text-muted-foreground">
                  Extraction History
                </h2>
              </div>
              <ExtractionHistory
                extractions={state.history}
                currentId={state.extractionId ?? undefined}
                onSelect={handleHistorySelect}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
