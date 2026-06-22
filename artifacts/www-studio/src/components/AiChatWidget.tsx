import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Wand2, Send, X, Loader2, Bot, User, Minimize2, Maximize2, AlertCircle } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
  codeChanges?: string | null;
  isError?: boolean;
}

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hi! I'm your AI design assistant. I can help you:\n\n• Generate pages from prompts\n• Style components with Tailwind\n• Add animations and effects\n• Convert screenshots to code\n• Suggest design improvements\n\nWhat would you like to build?",
  suggestions: [
    "Generate a dark SaaS landing page",
    "Make a glassmorphism pricing section",
    "Add animated scroll effects",
    "Create a minimalist portfolio",
  ],
};

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_MODEL = "gemini-2.0-flash";

async function callGeminiAPI(messages: { role: string; content: string }[]): Promise<{ reply: string; suggestions?: string[] }> {
  const apiKey = localStorage.getItem("www-studio-gemini-key") || "";
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const systemInstruction = messages.find((m) => m.role === "system")
    ? { parts: [{ text: messages.find((m) => m.role === "system")!.content }] }
    : undefined;

  const body: Record<string, unknown> = {
    generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    contents,
  };
  if (systemInstruction) body.systemInstruction = systemInstruction;

  const res = await fetch(`${GEMINI_API_URL}/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I couldn't generate a response.";
  const suggestions = [
    "Make it more colorful",
    "Add a pricing section",
    "Make it responsive",
  ];
  return { reply, suggestions };
}

function hasGeminiKey(): boolean {
  return !!localStorage.getItem("www-studio-gemini-key");
}

function setGeminiKey(key: string) {
  localStorage.setItem("www-studio-gemini-key", key);
}

interface AiChatWidgetProps {
  context?: string;
  onNavigate?: (path: string) => void;
}

export function AiChatWidget({ context, onNavigate }: AiChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open && !hasGeminiKey()) {
      setShowKeyInput(true);
    }
  }, [open]);

  const send = async (text?: string) => {
    const msg = text ?? input.trim();
    if (!msg) return;
    setInput("");

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);

    if (!hasGeminiKey()) {
      setShowKeyInput(true);
      return;
    }

    try {
      const apiMessages = messages
        .filter((m) => !m.isError)
        .map((m) => ({ role: m.role, content: m.content }));
      apiMessages.push({ role: "user", content: msg });

      const { reply, suggestions } = await callGeminiAPI(apiMessages);

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply,
          suggestions: suggestions ?? [],
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
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, the AI assistant encountered an error. Check your Gemini API key and try again.",
          isError: true,
        },
      ]);
    }
  };

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
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
                  {hasGeminiKey() ? "Gemini Connected" : "API Key Required"}
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
              {/* API key input */}
              {showKeyInput && (
                <div className="px-3 py-2 bg-yellow-500/10 border-b border-yellow-500/20">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertCircle className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-yellow-600 dark:text-yellow-400 leading-relaxed">
                      Enter your Gemini API key to enable the AI assistant. Get one free at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" className="underline">Google AI Studio</a>.
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <Input
                      type="password"
                      value={keyInput}
                      onChange={(e) => setKeyInput(e.target.value)}
                      placeholder="AIza..."
                      className="flex-1 h-7 text-xs border-yellow-500/30 bg-transparent"
                    />
                    <Button
                      size="sm"
                      className="h-7 text-xs px-2"
                      onClick={() => {
                        if (keyInput.trim()) {
                          setGeminiKey(keyInput.trim());
                          setShowKeyInput(false);
                          setKeyInput("");
                        }
                      }}
                    >
                      Save
                    </Button>
                  </div>
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
                      <div className={cn("max-w-[200px] rounded-2xl px-3 py-2 text-xs leading-relaxed", msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : msg.isError ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 rounded-tl-sm" : "bg-muted text-foreground rounded-tl-sm")}>
                        {msg.content.split("\n").map((line, i) => (
                          <span key={i}>{line}{i < msg.content.split("\n").length - 1 && <br />}</span>
                        ))}
                        {msg.codeChanges && (
                          <pre className="mt-2 p-2 rounded bg-black/30 text-[10px] font-mono overflow-x-auto whitespace-pre-wrap">{msg.codeChanges}</pre>
                        )}
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

                  {hasGeminiKey() && (
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
                    placeholder={hasGeminiKey() ? "Ask anything..." : "Set API key first..."}
                    className="flex-1 border-0 bg-transparent p-0 h-7 text-xs shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60"
                  />
                  <Button type="submit" size="icon" variant="ghost" className="h-6 w-6 shrink-0" disabled={!input.trim() || !hasGeminiKey()}>
                    <Send className="w-3 h-3" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
