import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Wand2, Send, X, Loader2, Bot, User, Minimize2, Maximize2,
  AlertCircle, ChevronDown, Sparkles, Zap,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
  isError?: boolean;
}

interface GeminiModel {
  id: string;
  name: string;
  displayName: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_MODEL_KEY = "www-studio-selected-model";

const WEB2API_PROXY = "https://saint-examine-clearance-growth.trycloudflare.com/v1/chat/completions";

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm your AI design assistant powered by Gemini.\n\nI can help you:\n• Generate pages from prompts\n• Style components with Tailwind\n• Add animations and effects\n• Suggest design improvements\n\nNo API key needed — just start chatting!",
  suggestions: [
    "Generate a dark SaaS landing page",
    "Make a glassmorphism pricing section",
    "Add animated scroll effects",
    "Create a minimalist portfolio",
  ],
};

// Web2API proxy models
const GEMINI_MODELS: GeminiModel[] = [
  { id: "gemini-3.5-flash", name: "gemini-3.5-flash", displayName: "Gemini 3.5 Flash" },
  { id: "gemini-3.5-flash-thinking", name: "gemini-3.5-flash-thinking", displayName: "Gemini 3.5 Flash Thinking" },
  { id: "gemini-3.1-pro", name: "gemini-3.1-pro", displayName: "Gemini 3.1 Pro" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function loadSelectedModel(): string | null {
  return localStorage.getItem(STORAGE_MODEL_KEY);
}

function saveSelectedModel(modelId: string) {
  localStorage.setItem(STORAGE_MODEL_KEY, modelId);
}

async function callGeminiChat(
  messages: { role: string; content: string }[],
  model: string
): Promise<string> {
  // Build system + user messages in OpenAI format
  const openaiMessages: { role: string; content: string }[] = [];

  // Add system instruction as system message
  const systemMsg = messages.find((m) => m.role === "system");
  if (systemMsg) {
    openaiMessages.push({ role: "system", content: systemMsg.content });
  }

  // Add user/assistant messages
  for (const m of messages) {
    if (m.role === "system") continue;
    openaiMessages.push({ role: m.role, content: m.content });
  }

  const res = await fetch(WEB2API_PROXY, {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(30000),
    body: JSON.stringify({
      model,
      messages: openaiMessages,
      max_tokens: 4096,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const errMsg = (err as any)?.error?.message || `HTTP ${res.status}`;
    throw new Error(errMsg);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.";
}

// ─── Component ───────────────────────────────────────────────────────────────

interface AiChatWidgetProps {
  context?: string;
  onNavigate?: (path: string) => void;
}

export function AiChatWidget({ context, onNavigate }: AiChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Models
  const [models] = useState<GeminiModel[]>(GEMINI_MODELS);
  const [selectedModel, setSelectedModel] = useState<string>(
    loadSelectedModel() || "gemini-3.5-flash"
  );
  const [showModelPicker, setShowModelPicker] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Open handler
  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  // Select model
  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    saveSelectedModel(modelId);
    setShowModelPicker(false);
  };

  // Send message
  const send = async (text?: string) => {
    const msg = text ?? input.trim();
    if (!msg || loading) return;
    setInput("");
    setError(null);

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);

    setLoading(true);
    try {
      const apiMessages = messages
        .filter((m) => !m.isError)
        .map((m) => ({ role: m.role, content: m.content }));
      apiMessages.push({ role: "user", content: msg });

      const reply = await callGeminiChat(apiMessages, selectedModel);

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply,
          suggestions: ["Make it more colorful", "Add a pricing section", "Make it responsive"],
        },
      ]);

      // Navigation intents
      if (onNavigate) {
        const lower = msg.toLowerCase();
        if (lower.includes("new project") || lower.includes("create") || lower.includes("generate")) {
          onNavigate("/editor/new");
        } else if (lower.includes("my project") || lower.includes("dashboard")) {
          onNavigate("/projects");
        } else if (lower.includes("component") || lower.includes("library")) {
          onNavigate("/components");
        }
      }
    } catch (err: any) {
      const errMsg = err.message || "Unknown error";
      setError(errMsg);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: `Error: ${errMsg}`, isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const currentModel = models.find((m) => m.id === selectedModel);

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button
          onClick={handleOpen}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-110 transition-transform group"
        >
          <Wand2 className="w-6 h-6 text-white" />
          <span className="absolute -top-8 right-0 text-xs bg-zinc-800 text-white px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:block">
            AI Assistant
          </span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className={cn(
            "fixed z-50 bg-card border border-border/50 rounded-2xl shadow-2xl shadow-black/40 flex flex-col overflow-hidden transition-all duration-200",
            "bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 sm:w-80",
            minimized ? "h-14" : "h-[400px] sm:h-[480px]"
          )}
        >
          {/* Header */}
          <div className="h-14 flex items-center justify-between px-4 border-b border-border/50 bg-muted/30 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                <Wand2 className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium leading-none">AI Assistant</p>
                <p className="text-[10px] text-muted-foreground">
                  {currentModel?.displayName || selectedModel}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMinimized((m) => !m)}>
                {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Model selector */}
              <div className="px-3 py-2 border-b border-border/50">
                <button
                  onClick={() => setShowModelPicker((s) => !s)}
                  className="w-full flex items-center justify-between text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3 h-3" />
                    {currentModel?.displayName || selectedModel}
                    <span className="px-1.5 py-0.5 bg-green-500/10 text-green-500 rounded text-[9px] font-medium">
                      FREE
                    </span>
                  </span>
                  <ChevronDown className={cn("w-3 h-3 transition-transform", showModelPicker && "rotate-180")} />
                </button>

                {showModelPicker && (
                  <div className="mt-1 max-h-32 overflow-y-auto rounded-lg border border-border/50 bg-card">
                    {models.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleSelectModel(m.id)}
                        className={cn(
                          "w-full text-left px-2.5 py-1.5 text-[10px] hover:bg-muted/50 transition-colors flex items-center justify-between",
                          selectedModel === m.id && "bg-primary/10 text-primary"
                        )}
                      >
                        <span className="truncate">{m.displayName}</span>
                        <span className="ml-1 px-1 py-0.5 bg-green-500/10 text-green-500 rounded text-[8px] font-medium shrink-0">
                          FREE
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Error banner */}
              {error && (
                <div className="px-3 py-2 bg-red-500/10 border-b border-red-500/20 flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-red-600 dark:text-red-400 leading-relaxed">{error}</p>
                </div>
              )}

              {/* Messages */}
              <ScrollArea className="flex-1 px-3 py-2">
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex gap-2", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5", msg.role === "user" ? "bg-primary/20" : "bg-muted")}>
                        {msg.role === "user" ? <User className="w-3 h-3 text-primary" /> : <Bot className="w-3 h-3 text-muted-foreground" />}
                      </div>
                      <div className={cn("max-w-[200px] rounded-2xl px-3 py-2 text-xs leading-relaxed", msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : msg.isError ? "bg-red-500/10 text-red-700 dark:text-red-300 rounded-tl-sm" : "bg-muted text-foreground rounded-tl-sm")}>
                        {msg.content.split("\n").map((line, i) => (
                          <span key={i}>{line}{i < msg.content.split("\n").length - 1 && <br />}</span>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Suggestions */}
                  {messages.at(-1)?.role === "assistant" && messages.at(-1)?.suggestions?.length && !messages.at(-1)?.isError ? (
                    <div className="flex flex-wrap gap-1.5 pl-8">
                      {messages.at(-1)!.suggestions!.map((s) => (
                        <button
                          key={s}
                          onClick={() => send(s)}
                          className="text-[10px] px-2 py-1 rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors text-left"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {loading && (
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <Bot className="w-3 h-3 text-muted-foreground" />
                      </div>
                      <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2">
                        <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-3 border-t border-border/50">
                <form
                  onSubmit={(e) => { e.preventDefault(); send(); }}
                  className="flex items-center gap-2 bg-muted/40 rounded-xl px-3 py-1.5"
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything..."
                    className="flex-1 border-0 bg-transparent p-0 h-7 text-xs shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60"
                  />
                  <Button type="submit" size="icon" variant="ghost" className="h-6 w-6 shrink-0" disabled={!input.trim() || loading}>
                    <Send className="w-3 h-3" />
                  </Button>
                </form>
                <p className="text-[9px] text-muted-foreground mt-1.5 text-center flex items-center justify-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  AI Chat powered by Gemini (no API key needed) • {models.length} models
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
