import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { type FreeformElement, makeFreeformElement } from "@/lib/freeform-types";
import {
  Wand2, Send, X, Loader2, Bot, User, Sparkles, Zap,
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
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = "www-studio-gemini-config";
const STORAGE_MODEL_KEY = "www-studio-selected-model";

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

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

  // Default response
  return {
    text: `I can help you with:\n• "Add floating shapes" — add decorative elements\n• "Make this more chaotic" — add random elements\n• "Apply design tokens" — use wellness colors\n• "Optimize for mobile" — responsive suggestions\n• "Create a hero section" — add hero layout\n• "Add a gradient background" — gradient tips\n• "Make it more minimal" — cleanup tips\n\nWhat would you like to do?`,
    actions: [],
  };
}

// ─── Gemini API ─────────────────────────────────────────────────────────────

interface GeminiConfig {
  key: string;
  baseUrl: string;
}

function loadConfig(): GeminiConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

async function callGemini(
  apiKey: string,
  prompt: string,
  systemContext: string,
): Promise<string> {
  const res = await fetch(
    `${GEMINI_BASE_URL}/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: `${systemContext}\n\nUser: ${prompt}` }] },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
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
      text: "I'm your freeform canvas AI! I can suggest layouts, add elements, apply design tokens, and optimize your design. What would you like?",
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

    const config = loadConfig();
    const systemContext = `You are an AI design assistant for a freeform canvas editor. The canvas is ${canvasWidth}x${canvasHeight}px. Current elements: ${elements.length}. Element types: ${elements.map((e) => e.type).join(", ") || "none"}.

You can suggest actions like adding elements, applying design tokens, creating layouts, optimizing for mobile, etc. Respond conversationally with design advice.`;

    try {
      let response: string;
      if (config?.key) {
        response = await callGemini(config.key, input.trim(), systemContext);
      } else {
        // Use local AI
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
          Gemini API key required for advanced AI • Falls back to local AI
        </p>
      </div>
    </div>
  );
}
