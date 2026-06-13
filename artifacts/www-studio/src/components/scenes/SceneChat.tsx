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

    try {
      const res = await fetch(`/api/scenes/${sceneId}/chat`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message:    text.trim(),
          elements:   elements.map((el) => ({
            id: el.id, type: el.type, name: el.name,
            x: el.x, y: el.y, width: el.width, height: el.height,
            fill: el.fill, opacity: el.opacity, blur: el.blur,
            animation: el.animation,
          })),
          selectedId,
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json() as { text: string; actions: SceneAction[] };

      const assistantMsg: ChatMsg = {
        id:      crypto.randomUUID(),
        role:    "assistant",
        text:    data.text,
        actions: data.actions ?? [],
        applied: false,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id:      crypto.randomUUID(),
          role:    "assistant",
          text:    "Couldn't reach the AI right now. Make sure your LLM is running (see LLM_BASE_URL env var).",
          actions: [],
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
          Requires a running LLM — set LLM_BASE_URL env var
        </p>
      </div>
    </div>
  );
}
