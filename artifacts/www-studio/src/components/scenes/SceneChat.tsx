import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { type SceneElement } from "@/lib/scene-types";
import { cn } from "@/lib/utils";
import {
  Wand2,
  Send,
  X,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Loader2,
  Bot,
  User,
} from "lucide-react";

export interface SceneAction {
  type: "add" | "update" | "delete";
  element?: Partial<SceneElement>;
  id?: string;
  updates?: Partial<SceneElement>;
}

interface ChatMsg {
  id:       string;
  role:     "user" | "assistant";
  text:     string;
  actions:  SceneAction[];
  applied:  boolean;
}

// ─── Provider configuration ──────────────────────────────────────────────────
// Nous/Hermes inference API (OpenRouter-compatible) — primary
const NOUS_BASE_URL = "https://inference-api.nousresearch.com/v1";
const NOUS_MODEL = "openrouter/owl-alpha";
const NOUS_API_KEY = import.meta.env.VITE_NOUS_API_KEY || "";

// Gemini Web2API fallback proxy
const WEB2API_FALLBACK = "https://navigator-aim-disciplinary-couples.trycloudflare.com/v1/chat/completions";

// Provider fallback helper — tries each URL+model combo, throws after last one fails
async function callAiProvider(
  url: string,
  model: string,
  messages: { role: string; content: string }[],
  options: { max_tokens?: number; temperature?: number; authToken?: string } = {},
): Promise<string> {
  const { max, temperature = 0.8, authToken } = options;
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
  return data?.choices?.[0]?.message?.content || "";
}

const SUGGESTION_CHIPS = [
  "Add a floating sage orb",
  "Add a lavender blob background",
  "Make everything more muted",
  "Add a coral accent shape",
  "Clear the canvas",
  "Add text in the center",
  "Make a serene ocean scene",
  "Add depth with blurred orbs",
];

// ─── Local AI fallback (no API key needed) ─────────────────────────────────

const WELLNESS_PALETTE = ["#7FB5A0", "#B39DC2", "#E8957A", "#87BBDB", "#F4C5A1", "#4A7C6B", "#C8D8E0", "#E8DDD0"];
const ANIM_PRESETS = ["none", "gentle-float", "gradient-breathe", "scale-pulse", "fade-in-out", "spin-slow", "drift"];

function generateLocalSceneResponse(userText: string, elements: SceneElement[]): { text: string; actions: SceneAction[] } {
  const lower = userText.toLowerCase();
  const actions: SceneAction[] = [];

  if (lower.includes("add") && lower.includes("orb")) {
    const count = lower.match(/(\d+)/);
    const n = count ? Math.min(parseInt(count[1]), 5) : 1;
    for (let i = 0; i < n; i++) {
      const size = 150 + Math.random() * 200;
      actions.push({
        type: "add",
        element: {
          id: crypto.randomUUID(),
          name: `Orb ${elements.length + i + 1}`,
          type: "circle",
          x: Math.floor(Math.random() * 1000),
          y: Math.floor(Math.random() * 600),
          width: Math.floor(size),
          height: Math.floor(size),
          fill: WELLNESS_PALETTE[Math.floor(Math.random() * WELLNESS_PALETTE.length)],
          fillOpacity: 1,
          opacity: 0.3 + Math.random() * 0.3,
          rotation: 0,
          blur: 40 + Math.floor(Math.random() * 60),
          visible: true,
          locked: false,
          zIndex: elements.length + i,
          stroke: "transparent",
          strokeWidth: 0,
          strokeOpacity: 1,
          mixBlendMode: "normal",
          backdropBlur: 0,
          animation: {
            preset: ANIM_PRESETS[1 + Math.floor(Math.random() * (ANIM_PRESETS.length - 1))],
            duration: 5 + Math.floor(Math.random() * 6),
            delay: Math.random() * 2,
            easing: "ease-in-out",
            loop: true,
          },
          tags: [],
        },
      });
    }
    return { text: `Added ${n} floating orb${n > 1 ? "s" : ""} to the scene. Click "Apply" to see them on the canvas.`, actions };
  }

  if (lower.includes("lavender") || lower.includes("purple")) {
    actions.push({
      type: "add",
      element: {
        id: crypto.randomUUID(),
        name: "Lavender Blob",
        type: "circle",
        x: Math.floor(Math.random() * 800),
        y: Math.floor(Math.random() * 500),
        width: 300,
        height: 300,
        fill: "#B39DC2",
        fillOpacity: 1,
        opacity: 0.25,
        rotation: 0,
        blur: 60,
        visible: true,
        locked: false,
        zIndex: elements.length,
        stroke: "transparent",
        strokeWidth: 0,
        strokeOpacity: 1,
        mixBlendMode: "normal",
        backdropBlur: 0,
        animation: { preset: "gradient-breathe", duration: 8, delay: 0, easing: "ease-in-out", loop: true },
        tags: [],
      },
    });
    return { text: "Added a soft lavender blob background element.", actions };
  }

  if (lower.includes("muted") || lower.includes("softer") || lower.includes("gentle")) {
    return {
      text: "I've adjusted the scene to be more muted and serene. The existing elements now have reduced opacity and softer blur.",
      actions: elements.slice(0, 3).map((el) => ({
        type: "update" as const,
        id: el.id,
        updates: { opacity: Math.max(0.1, (el.opacity ?? 0.5) - 0.15), blur: (el.blur ?? 0) + 10 },
      })),
    };
  }

  if (lower.includes("coral") || lower.includes("warm") || lower.includes("peach")) {
    actions.push({
      type: "add",
      element: {
        id: crypto.randomUUID(),
        name: "Coral Accent",
        type: "circle",
        x: 200 + Math.floor(Math.random() * 600),
        y: 200 + Math.floor(Math.random() * 400),
        width: 200,
        height: 200,
        fill: "#E8957A",
        fillOpacity: 1,
        opacity: 0.4,
        rotation: 0,
        blur: 30,
        visible: true,
        locked: false,
        zIndex: elements.length,
        stroke: "transparent",
        strokeWidth: 0,
        strokeOpacity: 1,
        mixBlendMode: "normal",
        backdropBlur: 0,
        animation: { preset: "gentle-float", duration: 7, delay: 0, easing: "ease-in-out", loop: true },
        tags: [],
      },
    });
    return { text: "Added a warm coral accent shape to bring energy to the scene.", actions };
  }

  if (lower.includes("clear") || lower.includes("delete all") || lower.includes("remove all")) {
    return {
      text: "Cleared all elements from the scene. You can add new elements from the toolbar or ask me to generate something.",
      actions: elements.map((el) => ({ type: "delete" as const, id: el.id })),
    };
  }

  if (lower.includes("ocean") || lower.includes("blue") || lower.includes("serene")) {
    actions.push({
      type: "add",
      element: {
        id: crypto.randomUUID(),
        name: "Ocean Wave",
        type: "rect",
        x: 0,
        y: 600,
        width: 1440,
        height: 300,
        fill: "#87BBDB",
        fillOpacity: 1,
        opacity: 0.2,
        rotation: 0,
        blur: 20,
        visible: true,
        locked: false,
        zIndex: elements.length,
        stroke: "transparent",
        strokeWidth: 0,
        strokeOpacity: 1,
        mixBlendMode: "normal",
        backdropBlur: 0,
        animation: { preset: "drift", duration: 12, delay: 0, easing: "ease-in-out", loop: true },
        tags: [],
      },
    });
    return { text: "Added a serene ocean wave at the bottom of the scene.", actions };
  }

  if (lower.includes("depth") || lower.includes("blur") || lower.includes("layered")) {
    actions.push({
      type: "add",
      element: {
        id: crypto.randomUUID(),
        name: "Depth Orb",
        type: "circle",
        x: Math.floor(Math.random() * 1000),
        y: Math.floor(Math.random() * 600),
        width: 400,
        height: 400,
        fill: WELLNESS_PALETTE[Math.floor(Math.random() * WELLNESS_PALETTE.length)],
        fillOpacity: 1,
        opacity: 0.15,
        rotation: 0,
        blur: 100,
        visible: true,
        locked: false,
        zIndex: 0,
        stroke: "transparent",
        strokeWidth: 0,
        strokeOpacity: 1,
        mixBlendMode: "normal",
        backdropBlur: 0,
        animation: { preset: "gradient-breathe", duration: 10, delay: 0, easing: "ease-in-out", loop: true },
        tags: [],
      },
    });
    return { text: "Added a deep blurred orb for depth and atmosphere.", actions };
  }

  // Default response
  return {
    text: `I understand you want to "${userText}". Try: "add orb", "add lavender", "add coral", "make muted", "add text in center", or "clear canvas".`,
    actions: [],
  };
}

interface Props {
  sceneId:      string;
  elements:     SceneElement[];
  selectedId:   string | null;
  onApply:      (actions: SceneAction[]) => void;
  onClose:      () => void;
}

export function SceneChat({ sceneId, elements, selectedId, onApply, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id:      "welcome",
      role:    "assistant",
      text:    "Hi! I can modify your scene using natural language. Try: \"add three floating orbs\" or \"make everything more muted and serene\".",
      actions: [],
      applied: false,
    },
  ]);
  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: ChatMsg = { id: crypto.randomUUID(), role: "user", text: text.trim(), actions: [], applied: false };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Build a scene-aware prompt
    const sceneContext = elements.map((el) => `${el.name} (${el.type}) at (${el.x},${el.y}) — ${el.width}×${el.height}px, fill: ${el.fill}, opacity: ${el.opacity}, blur: ${el.blur}px, animation: ${el.animation?.preset || "none"}`).join("\n");
    const fullPrompt = `You are a scene design AI. The current scene has these elements:\n${sceneContext}\n\nUser request: ${text}\n\nRespond with a brief description of what you'd like to do, and then provide a JSON object with { "text": "...", "actions": [...] }`;

    try {
      // Build messages for AI providers
      const aiMessages = [
        { role: "system", content: "You are a wellness scene design AI. Given a scene description and user request, suggest modifications. Respond ONLY with JSON: { \"text\": \"...\", \"actions\": [...] }" },
        { role: "user", content: fullPrompt },
      ];

      let data: { text: string; actions: SceneAction[] } | null = null;

      // Try Nous/Hermes first
      try {
        const result = await callAiProvider(
          `${NOUS_BASE_URL}/chat/completions`,
          NOUS_MODEL,
          aiMessages,
          { max_tokens: 1500, temperature: 0.8, authToken: NOUS_API_KEY }
        );
        const cleaned = result.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
        data = JSON.parse(cleaned);
      } catch {
        // Fallback: Gemini Web2API proxy (no API key needed)
        try {
          const result = await callAiProvider(
            WEB2API_FALLBACK,
            "gemini-3.5-flash",
            aiMessages,
            { max_tokens: 1500, temperature: 0.8 }
          );
          const cleaned = result.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
          data = JSON.parse(cleaned);
        } catch {
          // Pure local fallback if both providers fail
          data = generateLocalSceneResponse(text, elements);
        }
      }

      data ??= generateLocalSceneResponse(text, elements);

      const assistantMsg: ChatMsg = {
        id:      crypto.randomUUID(),
        role:    "assistant",
        text:    data.text || "I've processed your request.",
        actions: data.actions ?? [],
        applied: false,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      // Final fallback: local generation
      const data = generateLocalSceneResponse(text, elements);
      setMessages((prev) => [
        ...prev,
        {
          id:      crypto.randomUUID(),
          role:    "assistant",
          text:    data.text,
          actions: data.actions,
          applied: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function applyActions(msgId: string, actions: SceneAction[]) {
    onApply(actions);
    setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, applied: true } : m));
    toast({ title: `Applied ${actions.length} change${actions.length !== 1 ? "s" : ""} to canvas` });
  }

  const actionLabel = (a: SceneAction) => {
    if (a.type === "add")    return `+ Add ${(a.element as any)?.name ?? (a.element as any)?.type ?? "element"}`;
    if (a.type === "update") return `✎ Update element`;
    if (a.type === "delete") return `− Remove element`;
    return a.type;
  };

  return (
    <div className="flex flex-col h-full bg-background border-l border-border">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border shrink-0">
        <Wand2 className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-medium flex-1">AI Scene Assistant</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex gap-2", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
              msg.role === "assistant" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
            )}>
              {msg.role === "assistant" ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
            </div>

            <div className={cn("flex flex-col gap-1.5 max-w-[82%]", msg.role === "user" ? "items-end" : "items-start")}>
              <div className={cn(
                "px-3 py-2 rounded-2xl text-sm leading-relaxed",
                msg.role === "assistant"
                  ? "bg-muted/60 text-foreground rounded-tl-sm"
                  : "bg-primary text-primary-foreground rounded-tr-sm"
              )}>
                {msg.text}
              </div>

              {/* Action preview cards */}
              {msg.actions.length > 0 && !msg.applied && (
                <div className="w-full space-y-1">
                  <div className="flex flex-wrap gap-1">
                    {msg.actions.map((a, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                        {actionLabel(a)}
                      </span>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    className="w-full h-7 text-xs gap-1.5"
                    onClick={() => applyActions(msg.id, msg.actions)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Apply {msg.actions.length} change{msg.actions.length !== 1 ? "s" : ""} to canvas
                  </Button>
                </div>
              )}

              {msg.actions.length > 0 && msg.applied && (
                <span className="text-[10px] text-green-500 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />Applied
                </span>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 items-start">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Bot className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="px-3 py-2 bg-muted/60 rounded-2xl rounded-tl-sm">
              <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestion chips */}
      <div className="px-3 py-2 border-t border-border shrink-0">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {SUGGESTION_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => sendMessage(chip)}
              disabled={loading}
              className="shrink-0 text-[10px] px-2.5 py-1 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-full transition-colors whitespace-nowrap flex items-center gap-1"
            >
              <Sparkles className="h-2.5 w-2.5" />
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-1.5 shrink-0">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe a change…"
            className="h-8 text-sm flex-1"
            disabled={loading}
          />
          <Button type="submit" size="icon" className="h-8 w-8 shrink-0" disabled={!input.trim() || loading}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </Button>
        </form>
        <p className="text-[9px] text-muted-foreground mt-1.5 text-center">
          Works offline • Powered by Gemini (no API key needed)
        </p>
      </div>
    </div>
  );
}
