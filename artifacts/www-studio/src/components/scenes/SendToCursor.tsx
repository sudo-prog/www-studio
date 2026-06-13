import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, CheckCircle2, Terminal, ExternalLink } from "lucide-react";
import { type SceneData } from "@/lib/scene-types";

interface Props {
  open:    boolean;
  onClose: () => void;
  scene:   SceneData;
}

function buildCursorPrompt(scene: SceneData): string {
  const animationsUsed = [...new Set(scene.elements.map(el => el.animation?.preset ?? "none"))].filter(p => p !== "none");
  const types          = [...new Set(scene.elements.map(el => el.type))];
  const palette        = Object.entries(scene.themeTokens).map(([k, v]) => `${k}: ${v}`).join(" · ");

  const elementTable = scene.elements.map((el, i) =>
    `  ${i + 1}. ${el.name} [${el.type}] pos:(${el.x},${el.y}) size:${el.width}×${el.height}px fill:${el.fill} opacity:${el.opacity} blur:${el.blur}px rotation:${el.rotation}° anim:${el.animation?.preset ?? "none"}(${el.animation?.duration ?? 3}s delay:${el.animation?.delay ?? 0}s ${el.animation?.loop ? "∞" : "1x"})`
  ).join("\n");

  const animationCss = `
/* Wellness CSS Keyframes */
@keyframes gentle-float     { 0%,100%{transform:translateY(0)}     50%{transform:translateY(-12px)} }
@keyframes gradient-breathe { 0%,100%{opacity:1}                   50%{opacity:0.45} }
@keyframes shadow-pulse     { 0%,100%{filter:drop-shadow(0 0 0 transparent)} 50%{filter:drop-shadow(0 0 16px currentColor)} }
@keyframes morph            { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
@keyframes spin-slow        { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes fade-in-out      { 0%,100%{opacity:0.1} 50%{opacity:0.9} }
@keyframes scale-pulse      { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
@keyframes elastic-bounce   { 0%{transform:translateY(0) scaleY(1)} 20%{transform:translateY(-20px) scaleY(0.9)} 40%{transform:translateY(0) scaleY(1.1)} 60%{transform:translateY(-10px) scaleY(0.95)} 100%{transform:translateY(0) scaleY(1)} }`.trim();

  return `# Scene Prompt: ${scene.name}

## Context
Build a React wellness scene component. Canvas: ${scene.canvasWidth}×${scene.canvasHeight}px.

## Elements (${scene.elements.length} total)
${elementTable || "  (empty canvas)"}

## Shape Types Used
${types.map(t => `- ${t}`).join("\n")}

## Animations Used
${animationsUsed.length ? animationsUsed.map(a => `- ${a}`).join("\n") : "- none (static scene)"}

## Wellness Palette
${palette}

## Component Requirements
- Use React with Framer Motion for animations
- All elements absolutely positioned inside a relative container
- Canvas background: dark gradient (#0d1117 → #161b22)
- Match animation presets using the CSS keyframes below OR Framer Motion equivalents
- Make it embeddable as a standalone iframe (no external dependencies)
- Export as named component: \`export function ${scene.name.replace(/\s+/g, "")}Scene()\`

## Animation CSS Reference
\`\`\`css
${animationCss}
\`\`\`

## Full Scene JSON
\`\`\`json
${JSON.stringify({ name: scene.name, canvasWidth: scene.canvasWidth, canvasHeight: scene.canvasHeight, elements: scene.elements, themeTokens: scene.themeTokens }, null, 2)}
\`\`\`

## Framer Motion Mapping
- gentle-float     → \`animate: { y: [0, -12, 0] }\`
- gradient-breathe → \`animate: { opacity: [1, 0.45, 1] }\`
- shadow-pulse     → \`animate: { filter: ["drop-shadow(0 0 0 transparent)", "drop-shadow(0 0 16px ${scene.themeTokens.lavender})", "drop-shadow(0 0 0 transparent)"] }\`
- morph            → use CSS border-radius keyframes
- spin-slow        → \`animate: { rotate: 360 }, transition: { duration: X, repeat: Infinity, ease: "linear" }\`
- scale-pulse      → \`animate: { scale: [1, 1.15, 1] }\`
- elastic-bounce   → \`animate: { y: [0, -20, 0, -10, 0] }, transition: { type: "spring", stiffness: 300, damping: 10 }\`
`;
}

export function SendToCursor({ open, onClose, scene }: Props) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const prompt = buildCursorPrompt(scene);

  function copy() {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    toast({ title: "Cursor prompt copied!" });
  }

  function download() {
    const blob = new Blob([prompt], { type: "text/markdown" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${scene.name.toLowerCase().replace(/\s+/g, "-")}-cursor-prompt.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-5 py-4 border-b border-border shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" />
            Send to Cursor
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Full scene context + JSON + component conventions — paste into Cursor's AI chat
          </p>
        </DialogHeader>

        <pre className="flex-1 overflow-auto p-5 text-[10px] font-mono text-muted-foreground leading-relaxed bg-muted/30 whitespace-pre-wrap break-words">
          {prompt}
        </pre>

        <div className="flex items-center gap-2 px-5 py-4 border-t border-border shrink-0 bg-background">
          <Button onClick={copy} className="flex-1 gap-2">
            {copied
              ? <><CheckCircle2 className="h-4 w-4 text-green-400" />Copied!</>
              : <><Copy className="h-4 w-4" />Copy Prompt</>}
          </Button>
          <Button variant="outline" onClick={download} className="gap-2">
            <ExternalLink className="h-4 w-4" />Download .md
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
