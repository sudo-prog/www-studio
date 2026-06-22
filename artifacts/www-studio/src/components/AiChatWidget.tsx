import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Wand2, Send, X, Loader2, Bot, User, Minimize2, Maximize2,
  AlertCircle, Settings, Key, ChevronDown, Sparkles, Zap,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
  isError?: boolean;
}

interface OpenRouterModel {
  id: string;
  name: string;
  context_length: number;
  pricing: { prompt: string; completion: string };
  top_provider: { max_completion_tokens: number };
}

interface ApiKeyConfig {
  key: string;
  baseUrl: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const STORAGE_KEY = "www-studio-openrouter-config";
const STORAGE_MODEL_KEY = "www-studio-selected-model";

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm your AI design assistant. I can help you:\n\n• Generate pages from prompts\n• Style components with Tailwind\n• Add animations and effects\n• Suggest design improvements\n\nEnter your OpenRouter API key to get started, or use the free tier.",
  suggestions: [
    "Generate a dark SaaS landing page",
    "Make a glassmorphism pricing section",
    "Add animated scroll effects",
    "Create a minimalist portfolio",
  ],
};

const FALLBACK_MODELS: OpenRouterModel[] = [
  { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash (Free)", context_length: 1048576, pricing: { prompt: "0", completion: "0" }, top_provider: { max_completion_tokens: 8192 } },
  { id: "google/gemini-2.5-flash:free", name: "Gemini 2.5 Flash (Free)", context_length: 1048576, pricing: { prompt: "0", completion: "0" }, top_provider: { max_completion_tokens: 8192 } },
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B (Free)", context_length: 131072, pricing: { prompt: "0", completion: "0" }, top_provider: { max_completion_tokens: 8192 } },
  { id: "qwen/qwen3-235b-a22b-instruct-2507:free", name: "Qwen3 235B (Free)", context_length: 131072, pricing: { prompt: "0", completion: "0" }, top_provider: { max_completion_tokens: 16384 } },
  { id: "deepseek/deepseek-chat:free", name: "DeepSeek V3 (Free)", context_length: 131072, pricing: { prompt: "0", completion: "0" }, top_provider: { max_completion_tokens: 8192 } },
  { id: "openrouter/free", name: "Auto-Select Free (Random)", context_length: 131072, pricing: { prompt: "0", completion: "0" }, top_provider: { max_completion_tokens: 8192 } },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function isFreeModel(model: OpenRouterModel): boolean {
  return model.pricing.prompt === "0" && model.pricing.completion === "0";
}

function sortModelsByFreeFirst(models: OpenRouterModel[]): OpenRouterModel[] {
  return [...models].sort((a, b) => {
    const aFree = isFreeModel(a) ? 0 : 1;
    const bFree = isFreeModel(b) ? 0 : 1;
    if (aFree !== bFree) return aFree - bFree;
    return b.context_length - a.context_length;
  });
}

function loadConfig(): ApiKeyConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function saveConfig(config: ApiKeyConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function loadSelectedModel(): string | null {
  return localStorage.getItem(STORAGE_MODEL_KEY);
}

function saveSelectedModel(modelId: string) {
  localStorage.setItem(STORAGE_MODEL_KEY, modelId);
}

// ─── API ─────────────────────────────────────────────────────────────────────

async function fetchModels(apiKey: string, baseUrl: string): Promise<OpenRouterModel[]> {
  const res = await fetch(`${baseUrl}/models`, {
    headers: {
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Invalid API key");
    throw new Error(`HTTP ${res.status}`);
  }
  const data = await res.json();
  return (data.data || FALLBACK_MODELS) as OpenRouterModel[];
}

async function callChat(
  messages: { role: string; content: string }[],
  model: string,
  apiKey: string,
  baseUrl: string,
): Promise<string> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      "HTTP-Referer": window.location.origin,
      "X-Title": "WWW Studio",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.";
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
  const [config, setConfig] = useState<ApiKeyConfig | null>(loadConfig);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(config?.key ?? "");
  const [baseUrlInput, setBaseUrlInput] = useState(config?.baseUrl ?? OPENROUTER_BASE_URL);

  // Models
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(loadSelectedModel() || "");
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fetchedRef = useRef(false);

  // Auto-scroll
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Fetch models when opened
  const handleOpen = useCallback(() => {
    setOpen(true);
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      if (config?.key) {
        setModelsLoading(true);
        fetchModels(config.key, config.baseUrl)
          .then((m) => {
            const sorted = sortModelsByFreeFirst(m);
            setModels(sorted);
            if (!selectedModel) {
              const freeModels = sorted.filter(isFreeModel);
              setSelectedModel(freeModels[0]?.id ?? sorted[0]?.id ?? "");
            }
          })
          .catch(() => {
            setModels(sortModelsByFreeFirst(FALLBACK_MODELS));
            setSelectedModel(FALLBACK_MODELS[0].id);
          })
          .finally(() => setModelsLoading(false));
      } else {
        // No key — show free models as defaults
        const freeDefaults = sortModelsByFreeFirst(FALLBACK_MODELS);
        setModels(freeDefaults);
        if (!selectedModel) setSelectedModel(freeDefaults[0].id);
      }
    }
  }, [config, selectedModel]);

  // Save config
  const handleSaveConfig = () => {
    const newConfig = { key: apiKeyInput.trim(), baseUrl: baseUrlInput.trim() || OPENROUTER_BASE_URL };
    setConfig(newConfig);
    saveConfig(newConfig);
    setShowSettings(false);
    fetchedRef.current = false; // re-fetch with new key
    if (apiKeyInput.trim()) {
      setModelsLoading(true);
      fetchModels(newConfig.key, newConfig.baseUrl)
        .then((m) => {
          const sorted = sortModelsByFreeFirst(m);
          setModels(sorted);
          setSelectedModel(sorted[0]?.id ?? "");
        })
        .catch(() => {
          setModels(sortModelsByFreeFirst(FALLBACK_MODELS));
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

    if (!selectedModel) {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: "Please select a model first. Click the settings icon to configure.", isError: true },
      ]);
      return;
    }

    setLoading(true);
    try {
      const apiMessages = messages
        .filter((m) => !m.isError)
        .map((m) => ({ role: m.role, content: m.content }));
      apiMessages.push({ role: "user", content: msg });

      const reply = await callChat(apiMessages, selectedModel, config?.key ?? "", config?.baseUrl ?? OPENROUTER_BASE_URL);

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: reply, suggestions: ["Make it more colorful", "Add a pricing section", "Make it responsive"] },
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
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: `Error: ${errMsg}`, isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const currentModel = models.find((m) => m.id === selectedModel);
  const freeModels = models.filter(isFreeModel);

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-110 transition-transform group"
        >
          <Wand2 className="w-6 h-6 text-white" />
          <span className="absolute -top-8 right-0 text-xs bg-zinc-800 text-white px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            AI Assistant
          </span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 w-80 bg-card border border-border/50 rounded-2xl shadow-2xl shadow-black/40 flex flex-col overflow-hidden transition-all duration-200",
            minimized ? "h-14" : "h-[480px]"
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
                  {currentModel
                    ? `${currentModel.name.split("(")[0].trim()} ${isFreeModel(currentModel) ? "• Free" : ""}`
                    : "Select model..."}
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
                      <Key className="w-3 h-3" /> API Key (optional — free tier works without)
                    </label>
                    <Input
                      type="password"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="sk-or-v1-... (get free at openrouter.ai)"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground block mb-1">
                      Base URL
                    </label>
                    <Input
                      value={baseUrlInput}
                      onChange={(e) => setBaseUrlInput(e.target.value)}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <Button size="sm" className="w-full h-7 text-xs" onClick={handleSaveConfig}>
                    Save & Fetch Models
                  </Button>
                  <p className="text-[9px] text-muted-foreground leading-relaxed">
                    No key needed for free tier. Get a free key at{" "}
                    <a href="https://openrouter.ai/settings/keys" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                      openrouter.ai
                    </a>{" "}
                    for higher rate limits.
                  </p>
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
                    {modelsLoading ? "Loading models..." : currentModel?.name || "Select model"}
                    {currentModel && isFreeModel(currentModel) && (
                      <span className="px-1.5 py-0.5 bg-green-500/10 text-green-500 rounded text-[9px] font-medium">FREE</span>
                    )}
                  </span>
                  <ChevronDown className={cn("w-3 h-3 transition-transform", showModelPicker && "rotate-180")} />
                </button>

                {showModelPicker && (
                  <div className="mt-1 max-h-32 overflow-y-auto rounded-lg border border-border/50 bg-card">
                    {models.length === 0 ? (
                      <p className="text-[10px] text-muted-foreground p-2">
                        No models loaded. Click settings to configure or use defaults.
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
                          <span className="truncate">{m.name}</span>
                          {isFreeModel(m) && (
                            <span className="ml-1 px-1 py-0.5 bg-green-500/10 text-green-500 rounded text-[8px] font-medium shrink-0">FREE</span>
                          )}
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
                    placeholder={selectedModel ? "Ask anything..." : "Select model first..."}
                    className="flex-1 border-0 bg-transparent p-0 h-7 text-xs shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60"
                    disabled={!selectedModel}
                  />
                  <Button type="submit" size="icon" variant="ghost" className="h-6 w-6 shrink-0" disabled={!input.trim() || loading || !selectedModel}>
                    <Send className="w-3 h-3" />
                  </Button>
                </form>
                <p className="text-[9px] text-muted-foreground mt-1.5 text-center flex items-center justify-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Powered by OpenRouter • {freeModels.length} free models available
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
