import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Wand2, Send, X, Loader2, Bot, User, Minimize2, Maximize2,
  AlertCircle, Settings, Key, ChevronDown, Sparkles, Zap, Info,
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

interface ApiConfig {
  key: string;
  baseUrl: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = "www-studio-gemini-config";
const STORAGE_MODEL_KEY = "www-studio-selected-model";

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm your AI design assistant powered by Google Gemini.\n\nI can help you:\n• Generate pages from prompts\n• Style components with Tailwind\n• Add animations and effects\n• Suggest design improvements\n\nEnter your free Gemini API key to get started.",
  suggestions: [
    "Generate a dark SaaS landing page",
    "Make a glassmorphism pricing section",
    "Add animated scroll effects",
    "Create a minimalist portfolio",
  ],
};

// Free tier Gemini models (1500 req/day free)
const GEMINI_FREE_MODELS: GeminiModel[] = [
  { id: "gemini-2.0-flash", name: "gemini-2.0-flash", displayName: "Gemini 2.0 Flash (Free)" },
  { id: "gemini-2.0-flash-lite", name: "gemini-2.0-flash-lite", displayName: "Gemini 2.0 Flash Lite (Free)" },
  { id: "gemini-2.5-flash", name: "gemini-2.5-flash", displayName: "Gemini 2.5 Flash (Free)" },
  { id: "gemini-2.5-flash-preview", name: "gemini-2.5-flash-preview", displayName: "Gemini 2.5 Flash Preview (Free)" },
  { id: "gemini-2.0-flash-exp", name: "gemini-2.0-flash-exp", displayName: "Gemini 2.0 Flash Exp (Free)" },
  { id: "gemini-1.5-flash", name: "gemini-1.5-flash", displayName: "Gemini 1.5 Flash (Free)" },
  { id: "gemini-1.5-pro", name: "gemini-1.5-pro", displayName: "Gemini 1.5 Pro (Free Tier)" },
  { id: "gemma-3-27b-it", name: "gemma-3-27b-it", displayName: "Gemma 3 27B (Free)" },
  { id: "gemma-3-12b-it", name: "gemma-3-12b-it", displayName: "Gemma 3 12B (Free)" },
  { id: "gemma-3-4b-it", name: "gemma-3-4b-it", displayName: "Gemma 3 4B (Free)" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function loadConfig(): ApiConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function saveConfig(config: ApiConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function loadSelectedModel(): string | null {
  return localStorage.getItem(STORAGE_MODEL_KEY);
}

function saveSelectedModel(modelId: string) {
  localStorage.setItem(STORAGE_MODEL_KEY, modelId);
}

async function fetchGeminiModels(apiKey: string): Promise<GeminiModel[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
  );
  if (!res.ok) {
    if (res.status === 400 || res.status === 401 || res.status === 403) {
      throw new Error("Invalid API key");
    }
    throw new Error(`HTTP ${res.status}`);
  }
  const data = await res.json();
  const freeModels: GeminiModel[] = [];
  for (const m of data.models || []) {
    const modelId = m.name.replace("models/", "");
    // Filter to only free tier models
    const isFree = GEMINI_FREE_MODELS.some(
      (fm) => modelId.includes(fm.id) || fm.id.includes(modelId)
    );
    if (isFree) {
      freeModels.push({
        id: modelId,
        name: modelId,
        displayName: m.displayName || modelId,
      });
    }
  }
  return freeModels.length > 0 ? freeModels : GEMINI_FREE_MODELS;
}

async function callGeminiChat(
  messages: { role: string; content: string }[],
  model: string,
  apiKey: string,
): Promise<string> {
  // Convert OpenAI format to Gemini format
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  // Add system instruction if present
  const systemMsg = messages.find((m) => m.role === "system");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: systemMsg
          ? { parts: [{ text: systemMsg.content }] }
          : undefined,
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          topP: 0.8,
          topK: 40,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const errMsg = (err as any)?.error?.message || `HTTP ${res.status}`;
    if (errMsg.includes("API key")) throw new Error("Invalid API key");
    throw new Error(errMsg);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I couldn't generate a response.";
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

  // API config
  const [config, setConfig] = useState<ApiConfig | null>(loadConfig);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(config?.key ?? "");

  // Models
  const [models, setModels] = useState<GeminiModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(
    loadSelectedModel() || "gemini-2.0-flash"
  );
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fetchedRef = useRef(false);

  // Auto-scroll
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Fetch models when opened (if key exists)
  const handleOpen = useCallback(() => {
    setOpen(true);
    if (!fetchedRef.current && config?.key) {
      fetchedRef.current = true;
      setModelsLoading(true);
      fetchGeminiModels(config.key)
        .then((m) => {
          setModels(m);
          const currentValid = m.some((x) => x.id === selectedModel);
          if (!currentValid && m.length > 0) {
            setSelectedModel(m[0].id);
            saveSelectedModel(m[0].id);
          }
        })
        .catch(() => {
          setModels(GEMINI_FREE_MODELS);
        })
        .finally(() => setModelsLoading(false));
    } else if (!fetchedRef.current) {
      fetchedRef.current = true;
      setModels(GEMINI_FREE_MODELS);
    }
  }, [config, selectedModel]);

  // Save config
  const handleSaveConfig = () => {
    const newConfig = { key: apiKeyInput.trim(), baseUrl: GEMINI_BASE_URL };
    setConfig(newConfig);
    saveConfig(newConfig);
    setShowSettings(false);
    fetchedRef.current = false;
    if (apiKeyInput.trim()) {
      setModelsLoading(true);
      fetchGeminiModels(newConfig.key)
        .then((m) => {
          setModels(m);
          setSelectedModel(m[0]?.id ?? "gemini-2.0-flash");
        })
        .catch(() => {
          setModels(GEMINI_FREE_MODELS);
        })
        .finally(() => setModelsLoading(false));
    }
  };

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

    if (!config?.key) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "⚠️ Please set your Gemini API key first.\n\nClick the settings icon and paste your free key from aistudio.google.com/apikey",
          isError: true,
        },
      ]);
      return;
    }

    setLoading(true);
    try {
      const apiMessages = messages
        .filter((m) => !m.isError)
        .map((m) => ({ role: m.role, content: m.content }));
      apiMessages.push({ role: "user", content: msg });

      const reply = await callGeminiChat(apiMessages, selectedModel, config.key);

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
  const hasKey = !!config?.key;

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
                  {hasKey
                    ? currentModel?.displayName || selectedModel
                    : "Set API key to start"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowSettings((s) => !s)}>
                <Settings className="w-3.5 h-3.5" />
              </Button>
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
              {/* Settings panel */}
              {showSettings && (
                <div className="px-3 py-3 border-b border-border/50 bg-muted/20 space-y-3">
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1 mb-1">
                      <Key className="w-3 h-3" /> Gemini API Key
                    </label>
                    <Input
                      type="password"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="AIza..."
                      className="h-8 text-xs"
                    />
                  </div>
                  <Button size="sm" className="w-full h-7 text-xs" onClick={handleSaveConfig}>
                    Save & Load Models
                  </Button>
                  <div className="flex items-start gap-1.5 p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                    <Info className="w-3 h-3 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-muted-foreground leading-relaxed">
                      Get a <strong>free</strong> API key from{" "}
                      <a
                        href="https://aistudio.google.com/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        aistudio.google.com/apikey
                      </a>
                      . Free tier: 1500 requests/day. No credit card needed.
                    </p>
                  </div>
                </div>
              )}

              {/* Model selector */}
              <div className="px-3 py-2 border-b border-border/50">
                <button
                  onClick={() => setShowModelPicker((s) => !s)}
                  className="w-full flex items-center justify-between text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3 h-3" />
                    {modelsLoading
                      ? "Loading models..."
                      : currentModel?.displayName || selectedModel}
                    <span className="px-1.5 py-0.5 bg-green-500/10 text-green-500 rounded text-[9px] font-medium">
                      FREE
                    </span>
                  </span>
                  <ChevronDown className={cn("w-3 h-3 transition-transform", showModelPicker && "rotate-180")} />
                </button>

                {showModelPicker && (
                  <div className="mt-1 max-h-32 overflow-y-auto rounded-lg border border-border/50 bg-card">
                    {models.length === 0 ? (
                      <p className="text-[10px] text-muted-foreground p-2">
                        No models loaded. Enter your API key first.
                      </p>
                    ) : (
                      models.map((m) => (
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
                      ))
                    )}
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
                    placeholder={hasKey ? "Ask anything..." : "Set API key first..."}
                    className="flex-1 border-0 bg-transparent p-0 h-7 text-xs shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60"
                    disabled={!hasKey}
                  />
                  <Button type="submit" size="icon" variant="ghost" className="h-6 w-6 shrink-0" disabled={!input.trim() || loading || !hasKey}>
                    <Send className="w-3 h-3" />
                  </Button>
                </form>
                <p className="text-[9px] text-muted-foreground mt-1.5 text-center flex items-center justify-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Powered by Google Gemini • {models.length} free models
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
