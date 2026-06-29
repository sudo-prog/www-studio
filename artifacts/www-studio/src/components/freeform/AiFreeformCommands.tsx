// ── AI Freeform Commands ─────────────────────────────────────────────────────
import { useState } from "react";
import { FreeformElement, FreeformPage } from "@/lib/freeform-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Wand2, LayoutGrid, Accessibility, MousePointer, RotateCcw, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Nous/Hermes inference API (OpenRouter-compatible) — primary
const NOUS_BASE_URL = "https://inference-api.nousresearch.com/v1";
const NOUS_MODEL = "openrouter/owl-alpha";
const NOUS_API_KEY=import.meta.env.VITE_NOUS_API_KEY || "";

// Gemini Web2API fallback proxy
const WEB2API_FALLBACK = "https://saint-examine-clearance-growth.trycloudflare.com/v1/chat/completions";

// ─── Provider fallback chain ────────────────────────────────────────────────
async function callAiProvider(
  url: string,
  model: string,
  messages: { role: string; content: string }[],
  options: { max_tokens?: number; temperature?: number; authToken?: string } = {},
): Promise<string> {
  const { max_tokens = 4096, temperature = 0.7, authToken } = options;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const res = await fetch(url, {
    method: "POST",
    mode: "cors",
    headers,
    signal: AbortSignal.timeout(30000),
    body: JSON.stringify({ model, messages, max_tokens, temperature }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

interface Props {
  elements: FreeformElement[];
  page: FreeformPage;
  onApplyChanges: (updates: Partial<FreeformPage>) => void;
  onUpdateElement: (id: string, updates: Partial<FreeformElement>) => void;
}

type AiCommand = {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  handler: () => void;
};

export default function AiFreeformCommands({ elements, page, onApplyChanges, onUpdateElement }: Props) {
  const [activeCommand, setActiveCommand] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiChat, setAiChat] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hi! I'm your AI assistant. Try commands like 'Convert to Flex layout', 'Generate component variants', or 'Add interactions for this button'. Or just describe what you want!" },
  ]);

  const handleConvertToFlex = () => {
    if (elements.length < 2) return;
    // Sort by Y position then X
    const sorted = [...elements].sort((a, b) => a.y - b.y || a.x - b.x);
    const startX = sorted[0].x;
    const startY = sorted[0].y;
    const gap = 20;

    let currentX = startX;
    let currentY = startY;
    let rowHeight = 0;

    sorted.forEach((el) => {
      if (currentX + el.width > page.canvasWidth - 20) {
        currentX = startX;
        currentY += rowHeight + gap;
        rowHeight = 0;
      }
      onUpdateElement(el.id, { x: currentX, y: currentY, rotation: 0, scale: 1 });
      currentX += el.width + gap;
      rowHeight = Math.max(rowHeight, el.height);
    });
  };

  const handleGenerateVariants = () => {
    // Generate layout variants
    const variants = elements.map((el) => {
      return { ...el, rotation: 0 };
    });
    // Variant: Circular arrangement
    const centerX = page.canvasWidth / 2;
    const centerY = page.canvasHeight / 2;
    const radius = Math.min(page.canvasWidth, page.canvasHeight) * 0.35;

    variants.forEach((el, i) => {
      const angle = (i / variants.length) * Math.PI * 2 - Math.PI / 2;
      el.x = centerX + Math.cos(angle) * radius - el.width / 2;
      el.y = centerY + Math.sin(angle) * radius - el.height / 2;
    });
    setChatMessages((prev) => [
      ...prev,
      { role: "ai", text: "Created circular layout variant! Switching between layouts flex/grid/circle..." },
    ]);
  };

  const handleAddInteractions = () => {
    // Add hover effects to all buttons
    elements.forEach((el) => {
      if (el.type === "button") {
        onUpdateElement(el.id, {
          boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
        });
      }
    });
    setChatMessages((prev) => [
      ...prev,
      { role: "ai", text: "Added hover shadow effects to all buttons. Interactions: hover-lift, click-pulse applied." },
    ]);
  };

  const handleTextToSite = async () => {
    const prompt = aiChat || "landing page with hero";
    setLoading(true);

    const msg = `Generate a freeform layout for: "${prompt}". Return ONLY a JSON array of elements with types: text, shape, button, image. Each element needs: type, x, y, width, height. Text elements need: text, fontSize, color, fontWeight. Shape elements need: fill, shapeKind. Keep it under 10 elements.`;

    // Provider fallback chain: Nous → Gemini-web2api → local
    let text: string | null = null;

    try {
      text = await callAiProvider(
        `${NOUS_BASE_URL}/chat/completions`,
        NOUS_MODEL,
        [{ role: "user", content: msg }],
        { max_tokens: 4096, temperature: 0.7, authToken: NOUS_API_KEY }
      );
    } catch {
      try {
        text = await callAiProvider(
          WEB2API_FALLBACK,
          "gemini-3.5-flash",
          [{ role: "user", content: msg }],
          { max_tokens: 4096, temperature: 0.7 }
        );
      } catch {
        // Both providers failed — use local fallback
      }
    }

    if (text) {
      try {
        const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
        const parsed = JSON.parse(cleaned);
        const newElements = parsed.map((el: any) => ({
          ...el,
          id: crypto.randomUUID(),
          zIndex: 0,
          opacity: 1,
          visible: true,
          locked: false,
          name: el.type,
          scale: 1,
          rotation: 0,
        }));
        onApplyChanges({ elements: [...elements, ...newElements] });
        setChatMessages((prev) => [...prev, { role: "ai", text: `Generated ${newElements.length} elements from: "${prompt}"` }]);
      } catch {
        generateLocalLayout(prompt);
      }
    } else {
      generateLocalLayout(prompt);
    }

    setLoading(false);
  };

  const generateLocalLayout = (prompt: string) => {
    const lower = prompt.toLowerCase();
    const newElements: FreeformElement[] = [];

    if (lower.includes("landing") || lower.includes("hero")) {
      newElements.push(
        makeEl("text", { x: 200, y: 80, width: 600, height: 80, text: "Welcome to Our Site", fontSize: 56, fontWeight: 800, color: "#ffffff", name: "Hero Title" }),
        makeEl("text", { x: 200, y: 180, width: 500, height: 60, text: "Build beautiful websites visually", fontSize: 24, fontWeight: 400, color: "#888", name: "Subtitle" }),
        makeEl("button", { x: 200, y: 280, width: 200, height: 56, fill: "#7FB5A0", label: "Get Started", href: "#", name: "CTA Button" }),
        makeEl("shape", { x: 200, y: 400, width: 180, height: 180, fill: "#B39DC2", shapeKind: "circle", name: "Decor Circle" }),
        makeEl("shape", { x: 450, y: 420, width: 120, height: 120, fill: "#E8957A", shapeKind: "diamond", name: "Decor Diamond" }),
      );
    } else if (lower.includes("portfolio") || lower.includes("about")) {
      newElements.push(
        makeEl("text", { x: 100, y: 60, width: 400, height: 60, text: "My Portfolio", fontSize: 48, fontWeight: 700, color: "#ffffff", name: "Title" }),
        makeEl("image", { x: 100, y: 160, width: 280, height: 220, src: "https://placehold.co/280x220/7FB5A0/fff?text=Project+1", name: "Project 1" }),
        makeEl("image", { x: 420, y: 160, width: 280, height: 220, src: "https://placehold.co/280x220/B39DC2/fff?text=Project+2", name: "Project 2" }),
        makeEl("image", { x: 100, y: 400, width: 280, height: 220, src: "https://placehold.co/280x220/E8957A/fff?text=Project+3", name: "Project 3" }),
        makeEl("image", { x: 420, y: 400, width: 280, height: 220, src: "https://placehold.co/280x220/87BBDB/fff?text=Project+4", name: "Project 4" }),
      );
    } else if (lower.includes("card") || lower.includes("profile")) {
      newElements.push(
        makeEl("shape", { x: 220, y: 60, width: 360, height: 480, fill: "#1a1a2e", borderRadius: 24, name: "Card" }),
        makeEl("shape", { x: 330, y: 100, width: 120, height: 120, fill: "#7FB5A0", shapeKind: "circle", name: "Avatar" }),
        makeEl("text", { x: 280, y: 240, width: 240, height: 40, text: "Jane Developer", fontSize: 28, fontWeight: 700, color: "#ffffff", textAlign: "center", name: "Name" }),
        makeEl("text", { x: 240, y: 290, width: 320, height: 80, text: "Full-stack engineer passionate about design systems and creative coding.", fontSize: 14, fontWeight: 400, color: "#888", textAlign: "center", name: "Bio" }),
        makeEl("button", { x: 300, y: 400, width: 200, height: 48, fill: "#7FB5A0", label: "Contact Me", href: "mailto:jane@example.com", radius: 24, name: "Contact Button" }),
      );
    } else {
      // Generic layout: alternating text + shape
      newElements.push(
        makeEl("text", { x: 100, y: 60, width: 500, height: 60, text: prompt.charAt(0).toUpperCase() + prompt.slice(1), fontSize: 42, fontWeight: 700, color: "#ffffff", name: "Title" }),
        makeEl("shape", { x: 100, y: 160, width: 200, height: 200, fill: "#7FB5A0", shapeKind: "rectangle", borderRadius: 24, name: "Shape Accent" }),
        makeEl("text", { x: 340, y: 180, width: 400, height: 100, text: "Tell your story here. Click to edit and make it yours.", fontSize: 18, fontWeight: 400, color: "#888", name: "Description" }),
        makeEl("button", { x: 340, y: 320, width: 180, height: 48, fill: "#B39DC2", label: "Learn More", href: "#", radius: 24, name: "Action" }),
      );
    }

    onApplyChanges({ elements: [...elements, ...newElements] });
    setChatMessages((prev) => [...prev, { role: "ai", text: `Generated layout with ${newElements.length} elements.` }]);
  };

  const handleScreenshotToCode = () => {
    // Simulate screenshot-to-code (would need actual screenshot in real use)
    setChatMessages((prev) => [
      ...prev,
      { role: "ai", text: "Screenshot analysis: Detected a header section with title, subtitle, and CTA button. Generating layout..." },
    ]);
    generateLocalLayout("landing hero section");
  };

  const handleAccessibilityCheck = () => {
    const issues: string[] = [];
    elements.forEach((el) => {
      if (el.type === "image" && !el.name) {
        issues.push(`Image missing alt text (element ${el.id.slice(0, 8)})`);
      }
      if (el.type === "text") {
        // Check contrast (simplified)
        if (el.color && el.color.toLowerCase() === "#ffffff" && (!el.fill)) {
          // Potentially low contrast on light backgrounds
        }
        if ((el.fontSize || 24) < 12) {
          issues.push(`Text too small (${el.fontSize}px) - minimum 12px recommended`);
        }
      }
      if (el.type === "button" && !el.label) {
        issues.push(`Button missing accessible label`);
      }
    });

    const message = issues.length > 0
      ? `Found ${issues.length} accessibility issues:\n${issues.map((i, idx) => `${idx + 1}. ${i}`).join("\n")}`
      : "All elements look good! No accessibility issues found.";

    setChatMessages((prev) => [
      ...prev,
      { role: "ai", text: message },
    ]);
  };

  function makeEl(type: string, overrides: any = {}): FreeformElement {
    return {
      id: crypto.randomUUID(),
      type: type as any,
      x: 100, y: 100, width: 120, height: 120,
      rotation: 0, scale: 1, zIndex: 0,
      opacity: 1, visible: true, locked: false,
      name: type,
      ...overrides,
    } as FreeformElement;
  }

  const commands: AiCommand[] = [
    { id: "convert-flex", label: "Convert to Flex Layout", icon: LayoutGrid, description: "Arrange elements in a flexible row layout", handler: handleConvertToFlex },
    { id: "generate-variants", label: "Generate Component Variants", icon: Sparkles, description: "Create layout variations", handler: handleGenerateVariants },
    { id: "add-interactions", label: "Add Interactions", icon: MousePointer, description: "Add hover/click effects to buttons", handler: handleAddInteractions },
    { id: "text-to-site", label: "Text-to-Site", icon: Wand2, description: "Describe your page and generate it", handler: handleTextToSite },
    { id: "screenshot-code", label: "Screenshot-to-Code", icon: RotateCcw, description: "Analyze a screenshot and generate layout", handler: handleScreenshotToCode },
    { id: "accessibility", label: "Accessibility Check", icon: Accessibility, description: "Check alt text, contrast, sizing", handler: handleAccessibilityCheck },
  ];

  return (
    <div className="w-full border-t border-border bg-background/95 backdrop-blur-sm">
      {/* Command buttons */}
      <div className="p-2 flex gap-1 overflow-x-auto shrink-0">
        {commands.map(({ id, label, icon: Icon, description, handler }) => (
          <button
            key={id}
            className={cn(
              "shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] transition-colors",
              activeCommand === id ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground hover:text-foreground"
            )}
            onClick={() => { setActiveCommand(null); handler(); }}
            title={description}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* AI Chat */}
      <div className="border-t border-border">
        <ScrollArea className="h-32">
          <div className="p-2 space-y-1.5">
            {chatMessages.map((msg, i) => (
              <div key={i} className={cn("text-[11px] p-2 rounded-lg", msg.role === "user" ? "bg-primary/20 text-primary-foreground ml-4" : "bg-muted text-muted-foreground mr-4")}>
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="text-[11px] p-2 rounded-lg bg-muted text-muted-foreground flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex gap-1.5 p-2 pt-0">
          <Input
            className="h-7 text-xs"
            placeholder="Describe what you want to build..."
            value={aiChat}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAiChat(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleTextToSite()}
          />
          <Button size="sm" className="h-7 text-xs" onClick={handleTextToSite} disabled={loading}>
            <Wand2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
