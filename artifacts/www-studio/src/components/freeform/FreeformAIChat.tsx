import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { type FreeformElement, makeFreeformElement } from "@/lib/freeform-types";
import { critiqueDesign, type CritiqueReport } from "@/lib/ai/critique";
import { analyzeCodebase, type SelfEditReport } from "@/lib/ai/self-edit";
import { executeToolCall, type CanvasToolResult } from "@/lib/ai/tools";
import { executeWorkflow } from "@/ai/workflows";
import {
  Wand2, Send, X, Loader2, Bot, User, Sparkles, Zap,
  ScanSearch, Code2, CheckCircle2, AlertTriangle, Info,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface FreeformAIAction {
  type: "add" | "update" | "delete" | "clear" | "style" | "layout";
  element?: Partial<FreeformElement>;
  id?: string;
  updates?: Partial<FreeformElement>;
  elements?: FreeformElement[];
  styleType?: string;
}

interface ChatMsg {
  id:       string;
  role:     "user" | "assistant";
  text:     string;
  actions:  FreeformAIAction[];
  applied:  boolean;
  suggestions?: string[];
  critique?: CritiqueReport;
  selfEdit?: SelfEditReport;
  toolResult?: CanvasToolResult;
}

// ─── Constants ───────────────────────────────────────────────────────────────

// Nous/Hermes inference API (OpenRouter-compatible) — primary
const NOUS_BASE_URL = "https://inference-api.nousresearch.com/v1";
const NOUS_MODEL = "openrouter/owl-alpha";
const NOUS_API_KEY = import.meta.env.VITE_NOUS_API_KEY || "";

// Gemini Web2API fallback proxy
const WEB2API_PROXY = "/api/chat";

// ─── Provider fallback helper ───────────────────────────────────────────────
// Try Nous/Hermes first, then fall back to gemini-web2api on failure.

async function callAiProvider(
  url: string,
  model: string,
  messages: { role: string; content: string }[],
  options: { max_tokens?: number; temperature?: number; authToken?: string } = {},
): Promise<string> {
  const { max_tokens = 1024, temperature = 0.7, authToken } = options;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const res = await fetch(url, {
    method: "POST",
    mode: "cors",
    headers,
    signal: AbortSignal.timeout(30000),
    body: JSON.stringify({ model, messages, max_tokens, temperature }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const errMsg = (err as any)?.error?.message || `HTTP ${res.status}`;
    throw new Error(errMsg);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "No response";
}

const SUGGESTION_CHIPS = [
  "Make this more chaotic",
  "Apply design tokens",
  "Optimize for mobile",
  "Add a gradient background",
  "Create a hero section",
  "Add floating shapes",
  "Make it more minimal",
  "Add animation hints",
];

// ─── Local AI fallback ─────────────────────────────────────────────────────

function generateLocalFreeformResponse(
  userText: string,
  elements: FreeformElement[],
  canvasWidth: number,
  canvasHeight: number,
): { text: string; actions: FreeformAIAction[] } {
  const lower = userText.toLowerCase();
  const actions: FreeformAIAction[] = [];

  if (lower.includes("chaos") || lower.includes("chaotic")) {
    const colors = ["#7FB5A0", "#B39DC2", "#E8957A", "#87BBDB", "#F4C5A1", "#4A7C6B"];
    for (let i = 0; i < 5; i++) {
      actions.push({
        type: "add",
        element: {
          ...makeFreeformElement("shape", {
            x: Math.random() * canvasWidth * 0.7,
            y: Math.random() * canvasHeight * 0.7,
            width: 60 + Math.random() * 120,
            height: 60 + Math.random() * 120,
            fill: colors[Math.floor(Math.random() * colors.length)],
            shapeKind: (["rectangle", "circle", "star"][Math.floor(Math.random() * 3)] as any),
            rotation: Math.random() * 360,
            opacity: 0.5 + Math.random() * 0.5,
            name: "Chaos shape",
          }),
        },
      });
    }
    return { text: "Added 5 random shapes to shake things up! 🎪", actions };
  }

  if (lower.includes("design token") || lower.includes("apply token") || lower.includes("wellness")) {
    const tokenColors = ["#7FB5A0", "#B39DC2", "#E8957A", "#87BBDB", "#F4C5A1", "#4A7C6B", "#C8D8E0", "#E8DDD0"];
    elements.forEach((el) => {
      if (el.type === "shape" || el.type === "text" || el.type === "button") {
        const randomColor = tokenColors[Math.floor(Math.random() * tokenColors.length)];
        actions.push({
          type: "update",
          id: el.id,
          updates: { fill: el.fill ? randomColor : undefined, color: el.type === "text" ? randomColor : undefined },
        });
      }
    });
    return { text: `Applied wellness design tokens to ${actions.length} elements 🎨`, actions };
  }

  if (lower.includes("mobile") || lower.includes("responsive")) {
    return {
      text: "Mobile optimization tips:\n• Reduce canvas width to 375–768px\n• Stack elements vertically\n• Increase touch target sizes (min 44px)\n• Use larger fonts (16px+)\n\nI've added a mobile frame guide.",
      actions: [
        {
          type: "add",
          element: {
            ...makeFreeformElement("shape", {
              x: (canvasWidth - 375) / 2,
              y: 20,
              width: 375,
              height: canvasHeight - 40,
              fill: "transparent",
              stroke: "#3b82f6",
              strokeWidth: 2,
              borderRadius: 24,
              name: "Mobile Frame",
            }),
          },
        },
      ],
    };
  }

  if (lower.includes("hero") || lower.includes("hero section")) {
    actions.push({
      type: "add",
      element: {
        ...makeFreeformElement("text", {
          x: canvasWidth / 2 - 200,
          y: canvasHeight / 2 - 60,
          width: 400,
          height: 80,
          text: "Welcome to Your Brand",
          fontSize: 48,
          fontWeight: 700,
          color: "#ffffff",
          textAlign: "center",
          name: "Hero Title",
        }),
      },
    });
    actions.push({
      type: "add",
      element: {
        ...makeFreeformElement("text", {
          x: canvasWidth / 2 - 150,
          y: canvasHeight / 2 + 30,
          width: 300,
          height: 40,
          text: "Subheading goes here",
          fontSize: 18,
          fontWeight: 400,
          color: "#94a3b8",
          textAlign: "center",
          name: "Hero Subtitle",
        }),
      },
    });
    actions.push({
      type: "add",
      element: {
        ...makeFreeformElement("button", {
          x: canvasWidth / 2 - 80,
          y: canvasHeight / 2 + 90,
          width: 160,
          height: 48,
          fill: "#3b82f6",
          label: "Get Started",
          name: "CTA Button",
        }),
      },
    });
    return { text: "Created a hero section with title, subtitle, and CTA button 🚀", actions };
  }

  if (lower.includes("gradient") || lower.includes("background")) {
    return {
      text: "Try setting a gradient background! Click the canvas, then in the properties panel use:\nlinear-gradient(135deg, #667eea 0%, #764ba2 100%)\n\nOr use the background picker in the toolbar.",
      actions: [],
    };
  }

  if (lower.includes("floating") || lower.includes("float") || lower.includes("shape")) {
    const colors = ["#7FB5A0", "#B39DC2", "#E8957A", "#87BBDB"];
    for (let i = 0; i < 3; i++) {
      const size = 80 + Math.random() * 100;
      actions.push({
        type: "add",
        element: {
          ...makeFreeformElement("shape", {
            x: Math.random() * (canvasWidth - size),
            y: Math.random() * (canvasHeight - size),
            width: size,
            height: size,
            fill: colors[Math.floor(Math.random() * colors.length)],
            shapeKind: "circle",
            opacity: 0.6,
            borderRadius: 999,
            name: "Floating Shape",
          }),
        },
      });
    }
    return { text: "Added 3 floating shapes to your canvas ✨", actions };
  }

  if (lower.includes("minimal") || lower.includes("clean") || lower.includes("simple")) {
    return {
      text: "Minimalism tips:\n• Remove unnecessary elements\n• Use whitespace generously\n• Stick to 2–3 colors max\n• Limit to 1–2 font sizes\n\nSelect elements and press Delete to clean up.",
      actions: [],
    };
  }

  if (lower.includes("clear") || lower.includes("reset") || lower.includes("delete all")) {
    return {
      text: "This will remove all elements from the canvas. Click 'Apply' to confirm.",
      actions: [{ type: "clear" }],
    };
  }

  if (lower.includes("animation") || lower.includes("animate")) {
    return {
      text: "Animation tips:\n• Use CSS keyframes for smooth motion\n• GSAP + ScrollTrigger for scroll-based animations\n• Framer Motion for React components\n• Keep animations under 300ms for UI, 1-3s for ambient effects\n\nExport as React + Framer or GSAP for production animations.",
      actions: [],
    };
  }

  // Tool-calling: "add a text element"
  if (lower.includes("add text") || lower.includes("add a text") || lower.includes("text element")) {
    const el = makeFreeformElement("text", {
      x: canvasWidth / 2 - 100,
      y: canvasHeight / 2 - 20,
      text: "New text element",
      name: "AI Text",
    });
    actions.push({ type: "add", element: el });
    return { text: "Added a new text element to the canvas 📝", actions };
  }

  // Tool-calling: "make the background blue"
  if (lower.includes("background blue") || lower.includes("make the background blue")) {
    const el = makeFreeformElement("shape", {
      x: 0, y: 0, width: canvasWidth, height: canvasHeight,
      fill: "#3b82f6", name: "Background Layer", zIndex: -1,
    });
    actions.push({ type: "add", element: el });
    return { text: "Added a blue background layer 🔵", actions };
  }

  // Tool-calling: "add button"
  if (lower.includes("add button") || lower.includes("add a button")) {
    const el = makeFreeformElement("button", {
      x: canvasWidth / 2 - 80,
      y: canvasHeight / 2 + 40,
      label: "New Button",
      name: "AI Button",
    });
    actions.push({ type: "add", element: el });
    return { text: "Added a button element to the canvas 🔘", actions };
  }

  // Default response
  return {
    text: `I can help you with:\n• "Add floating shapes" — add decorative elements\n• "Make this more chaotic" — add random elements\n• "Apply design tokens" — use wellness colors\n• "Optimize for mobile" — responsive suggestions\n• "Create a hero section" — add hero layout\n• "Add a gradient background" — gradient tips\n• "Make it more minimal" — cleanup tips\n• "Add a text element" — adds text to canvas\n• "Make the background blue" — adds blue bg\n\nWhat would you like to do?`,
    actions: [],
  };
}

// ─── Gemini API ─────────────────────────────────────────────────────────────

async function callGemini(
  prompt: string,
  systemContext: string,
): Promise<string> {
  const messages = [
    { role: "system", content: systemContext },
    { role: "user", content: prompt },
  ];

  // Provider fallback chain: Nous/Hermes → gemini-web2api
  const providers = [
    { url: `${NOUS_BASE_URL}/chat/completions`, model: NOUS_MODEL, authToken: NOUS_API_KEY },
    { url: WEB2API_PROXY, model: "gemini-3.5-flash", authToken: undefined },
  ];

  let lastError: Error | null = null;
  for (const provider of providers) {
    try {
      return await callAiProvider(provider.url, provider.model, messages, {
        max_tokens: 1024,
        authToken: provider.authToken,
      });
    } catch (err: any) {
      lastError = err;
      // Try next provider
    }
  }

  throw lastError || new Error("All AI providers failed");
}

// ─── Component ──────────────────────────────────────────────────────────────

interface Props {
  elements:      FreeformElement[];
  canvasWidth:   number;
  canvasHeight:  number;
  onApplyActions: (actions: FreeformAIAction[]) => void;
  onClose:       () => void;
}

export default function FreeformAIChat({ elements, canvasWidth, canvasHeight, onApplyActions, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "I'm your freeform canvas AI! I can add elements, apply designs, critique your layout, and suggest code improvements. What would you like?",
      suggestions: SUGGESTION_CHIPS,
      actions: [],
      applied: false,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMsg = {
      id: crypto.randomUUID(),
      role: "user",
      text: input.trim(),
      actions: [],
      applied: false,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const systemContext = `You are an AI design assistant for a freeform canvas editor. The canvas is ${canvasWidth}x${canvasHeight}px. Current elements: ${elements.length}. Element types: ${elements.map((e) => e.type).join(", ") || "none"}.

You can suggest actions like adding elements, applying design tokens, creating layouts, optimizing for mobile, etc. Respond conversationally with design advice.`;

    try {
      let response: string;
      // Always try the web2api proxy first (no API key needed)
      try {
        response = await callGemini(input.trim(), systemContext);
      } catch {
        // Use local AI if proxy fails
        const local = generateLocalFreeformResponse(input.trim(), elements, canvasWidth, canvasHeight);
        response = local.text;
        // Apply local actions
        if (local.actions.length > 0) {
          const aiMsg: ChatMsg = {
            id: crypto.randomUUID(),
            role: "assistant",
            text: response,
            actions: local.actions,
            applied: false,
          };
          setMessages((prev) => [...prev, aiMsg]);
          setLoading(false);
          return;
        }
      }

      const aiMsg: ChatMsg = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: response,
        actions: [],
        applied: false,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      // Fallback to local
      const local = generateLocalFreeformResponse(input.trim(), elements, canvasWidth, canvasHeight);
      const aiMsg: ChatMsg = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: local.text,
        actions: local.actions,
        applied: false,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, elements, canvasWidth, canvasHeight]);

  const handleApply = (msg: ChatMsg) => {
    if (msg.actions.length > 0) {
      onApplyActions(msg.actions);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, applied: true } : m))
      );
    }
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
  };

  // ── Critique handler ──
  const handleCritique = useCallback(() => {
    const report = critiqueDesign(elements);
    const aiMsg: ChatMsg = {
      id: crypto.randomUUID(),
      role: "assistant",
      text: `Design audit complete! Score: ${report.score}/100`,
      actions: [],
      applied: false,
      critique: report,
    };
    setMessages((prev) => [...prev, aiMsg]);
  }, [elements]);

  // ── Self-edit handler ──
  const handleSelfEdit = useCallback(() => {
    const report = analyzeCodebase();
    const aiMsg: ChatMsg = {
      id: crypto.randomUUID(),
      role: "assistant",
      text: report.summary,
      actions: [],
      applied: false,
      selfEdit: report,
    };
    setMessages((prev) => [...prev, aiMsg]);
  }, []);

  // ── Tool execution handler ──
  const handleToolExecute = useCallback((toolName: string, params: Record<string, any>) => {
    const result = executeToolCall(toolName, params);
    const aiMsg: ChatMsg = {
      id: crypto.randomUUID(),
      role: "assistant",
      text: result.message,
      actions: result.action ? [result.action as FreeformAIAction] : [],
      applied: false,
      toolResult: result,
    };
    setMessages((prev) => [...prev, aiMsg]);
    if (result.success && result.action) {
      onApplyActions([result.action as FreeformAIAction]);
    }
  }, [onApplyActions]);

  return (
    <div className="w-80 shrink-0 border-l border-border bg-background flex flex-col">
      {/* Header */}
      <div className="h-10 border-b border-border flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium">Canvas AI</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action buttons */}
      <div className="px-3 py-2 border-b border-border flex gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[10px] gap-1 flex-1"
          onClick={handleCritique}
          disabled={loading}
        >
          <ScanSearch className="w-3 h-3" />
          Critique
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[10px] gap-1 flex-1"
          onClick={handleSelfEdit}
          disabled={loading}
        >
          <Code2 className="w-3 h-3" />
          Suggest Improvement
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-3 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex gap-2", msg.role === "user" && "flex-row-reverse")}>
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
              msg.role === "assistant" ? "bg-primary/20" : "bg-blue-500/20"
            )}>
              {msg.role === "assistant" ? (
                <Bot className="w-3.5 h-3.5 text-primary" />
              ) : (
                <User className="w-3.5 h-3.5 text-blue-400" />
              )}
            </div>
            <div className={cn(
              "rounded-xl px-3 py-2 max-w-[85%] text-xs leading-relaxed",
              msg.role === "assistant" ? "bg-muted/50" : "bg-blue-500/20"
            )}>
              <p className="whitespace-pre-wrap">{msg.text}</p>

              {/* Apply actions button */}
              {msg.actions.length > 0 && !msg.applied && (
                <Button
                  size="sm"
                  className="mt-2 h-7 text-xs gap-1"
                  onClick={() => handleApply(msg)}
                >
                  <Zap className="w-3 h-3" />
                  Apply {msg.actions.length} changes
                </Button>
              )}
              {msg.applied && (
                <p className="mt-2 text-[10px] text-green-400">✓ Applied</p>
              )}

              {/* Critique report */}
              {msg.critique && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    {msg.critique.score >= 80 ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    ) : msg.critique.score >= 50 ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    )}
                    <span className="text-[10px] font-medium">Score: {msg.critique.score}/100</span>
                  </div>
                  {msg.critique.issues.slice(0, 5).map((issue) => (
                    <div key={issue.id} className="flex items-start gap-1.5 text-[10px]">
                      <Info className="w-3 h-3 shrink-0 mt-0.5 text-muted-foreground" />
                      <span className={cn(
                        issue.severity === "error" && "text-red-300",
                        issue.severity === "warning" && "text-yellow-300",
                        issue.severity === "info" && "text-blue-300",
                      )}>
                        {issue.message}
                      </span>
                    </div>
                  ))}
                  <p className="text-[10px] text-muted-foreground italic">{msg.critique.summary}</p>
                </div>
              )}

              {/* Self-edit report */}
              {msg.selfEdit && (
                <div className="mt-2 space-y-1.5">
                  <p className="text-[10px] font-medium text-muted-foreground">Code Improvements:</p>
                  {msg.selfEdit.suggestions.slice(0, 3).map((s) => (
                    <div key={s.filePath} className="bg-black/20 rounded-lg p-2 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Code2 className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-mono">{s.filePath}</span>
                        <span className={cn(
                          "text-[8px] px-1 py-0.5 rounded-full",
                          s.severity === "high" && "bg-red-500/20 text-red-300",
                          s.severity === "medium" && "bg-yellow-500/20 text-yellow-300",
                          s.severity === "low" && "bg-blue-500/20 text-blue-300",
                        )}>{s.severity}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{s.description}</p>
                      <div className="bg-black/30 rounded p-1.5 font-mono text-[9px]">
                        <div className="text-red-400">- {s.diff.oldCode.slice(0, 60)}...</div>
                        <div className="text-green-400">+ {s.diff.newCode.slice(0, 60)}...</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="bg-muted/50 rounded-xl px-3 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Suggestion chips */}
      <div className="px-3 pb-2 flex flex-wrap gap-1">
        {SUGGESTION_CHIPS.slice(0, 4).map((chip) => (
          <button
            key={chip}
            onClick={() => handleSuggestion(chip)}
            className="text-[10px] px-2 py-1 rounded-full bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask AI..."
            className="h-8 text-xs"
            disabled={loading}
          />
          <Button
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </Button>
        </div>
        <p className="text-[9px] text-muted-foreground mt-1.5">
          Powered by Gemini (no API key needed) • Falls back to local AI
        </p>
      </div>
    </div>
  );
}
