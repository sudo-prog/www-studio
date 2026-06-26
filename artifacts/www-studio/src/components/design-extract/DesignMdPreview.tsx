// ─── DesignMdPreview.tsx ─────────────────────────────────────────────────────
import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TokenData {
  colors: Record<string, string>;
  typography: {
    display: { family: string; weights: number[] };
    body: { family: string; weights: number[] };
    mono: { family: string; weights: number[] };
  };
  spacing: Record<string, number>;
  radius: Record<string, number>;
  shadows: Record<string, string>;
}

interface DesignMdPreviewProps {
  tokens: TokenData;
}

type TabKey = "design-doc" | "tailwind-config" | "tokens-css" | "design-tokens-json";

export default function DesignMdPreview({ tokens }: DesignMdPreviewProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("design-doc");
  const [copied, setCopied] = useState(false);

  const designDoc = useMemo(() => {
    const lines: string[] = [];
    lines.push("# Design System Documentation\n");
    lines.push("## Colors\n");
    Object.entries(tokens.colors).forEach(([name, hex]) => {
      lines.push(`- **${name}**: \`${hex}\``);
    });
    lines.push("");
    lines.push("## Typography\n");
    lines.push("| Role | Family | Weights |");
    lines.push("|------|--------|---------|");
    lines.push(`| Display | ${tokens.typography.display.family || "—"} | ${(tokens.typography.display.weights.length > 0 ? tokens.typography.display.weights : [400]).join(", ")} |`);
    lines.push(`| Body | ${tokens.typography.body.family || "—"} | ${(tokens.typography.body.weights.length > 0 ? tokens.typography.body.weights : [400]).join(", ")} |`);
    lines.push(`| Mono | ${tokens.typography.mono.family || "—"} | ${(tokens.typography.mono.weights.length > 0 ? tokens.typography.mono.weights : [400]).join(", ")} |`);
    lines.push("");
    lines.push("## Spacing\n");
    lines.push("| Token | Value |");
    lines.push("|-------|-------|");
    Object.entries(tokens.spacing).forEach(([name, value]) => {
      lines.push(`| ${name} | ${value}px |`);
    });
    lines.push("");
    lines.push("## Border Radius\n");
    lines.push("| Token | Value |");
    lines.push("|-------|-------|");
    Object.entries(tokens.radius).forEach(([name, value]) => {
      lines.push(`| ${name} | ${value >= 9999 ? "9999px (full)" : `${value}px`} |`);
    });
    return lines.join("\n");
  }, [tokens]);

  const tailwindConfig = useMemo(() => {
    const lines: string[] = [];
    lines.push("export default {");
    lines.push("  theme: {");
    lines.push("    extend: {");
    lines.push("      colors: {");
    Object.entries(tokens.colors).forEach(([name, hex]) => {
      lines.push(`        "${name}": "${hex}",`);
    });
    lines.push("      },");
    lines.push("      fontFamily: {");
    if (tokens.typography.display.family) {
      lines.push(`        display: ["${tokens.typography.display.family}", "sans-serif"],`);
    }
    if (tokens.typography.body.family) {
      lines.push(`        body: ["${tokens.typography.body.family}", "sans-serif"],`);
    }
    if (tokens.typography.mono.family) {
      lines.push(`        mono: ["${tokens.typography.mono.family}", "monospace"],`);
    }
    lines.push("      },");
    lines.push("      spacing: {");
    Object.entries(tokens.spacing).forEach(([name, value]) => {
      lines.push(`        "${name}": "${value}px",`);
    });
    lines.push("      },");
    lines.push("      borderRadius: {");
    Object.entries(tokens.radius).forEach(([name, value]) => {
      lines.push(`        "${name}": "${value >= 9999 ? "9999px" : `${value}px`}",`);
    });
    lines.push("      },");
    lines.push("      boxShadow: {");
    Object.entries(tokens.shadows).forEach(([name, value]) => {
      lines.push(`        "${name}": "${value || "none"}",`);
    });
    lines.push("      },");
    lines.push("    },");
    lines.push("  },");
    lines.push("};");
    return lines.join("\n");
  }, [tokens]);

  const tokensCss = useMemo(() => {
    const lines: string[] = [];
    lines.push(":root {");
    Object.entries(tokens.colors).forEach(([name, hex]) => {
      const varName = name.replace(/([A-Z])/g, "-$1").toLowerCase();
      lines.push(`  --color-${varName}: ${hex};`);
    });
    lines.push("");
    if (tokens.typography.display.family) {
      lines.push(`  --font-display: "${tokens.typography.display.family}", sans-serif;`);
    }
    if (tokens.typography.body.family) {
      lines.push(`  --font-body: "${tokens.typography.body.family}", sans-serif;`);
    }
    if (tokens.typography.mono.family) {
      lines.push(`  --font-mono: "${tokens.typography.mono.family}", monospace;`);
    }
    lines.push("");
    Object.entries(tokens.spacing).forEach(([name, value]) => {
      lines.push(`  --spacing-${name}: ${value}px;`);
    });
    lines.push("");
    Object.entries(tokens.radius).forEach(([name, value]) => {
      lines.push(`  --radius-${name}: ${value >= 9999 ? "9999px" : `${value}px`};`);
    });
    lines.push("");
    Object.entries(tokens.shadows).forEach(([name, value]) => {
      lines.push(`  --shadow-${name}: ${value || "none"};`);
    });
    lines.push("}");
    return lines.join("\n");
  }, [tokens]);

  const designTokensJson = useMemo(() => {
    return JSON.stringify(tokens, null, 2);
  }, [tokens]);

  const codeMap: Record<TabKey, string> = {
    "design-doc": designDoc,
    "tailwind-config": tailwindConfig,
    "tokens-css": tokensCss,
    "design-tokens-json": designTokensJson,
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeMap[activeTab]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const tabItems: { key: TabKey; label: string }[] = [
    { key: "design-doc", label: "Design Doc" },
    { key: "tailwind-config", label: "tailwind.config.ts" },
    { key: "tokens-css", label: "tokens.css" },
    { key: "design-tokens-json", label: "design-tokens.json" },
  ];

  return (
    <div className="space-y-2">
      <Tabs value={activeTab} onValue={(v) => setActiveTab(v as TabKey)}>
        <div className="flex items-center justify-between">
          <TabsList className="bg-[#0a0a0b] border border-[#27272a]">
            {tabItems.map(({ key, label }) => (
              <TabsTrigger
                key={key}
                value={key}
                className="data-[state=active]:bg-[#18181b] text-xs"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 gap-1 text-xs"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-[#22c55e]" />
                <span className="text-[#22c55e]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </Button>
        </div>

        {tabItems.map(({ key }) => (
          <TabsContent key={key} value={key} className="mt-2">
            <pre
              className={cn(
                "p-4 rounded-lg border border-[#27272a] bg-[#0a0a0b] overflow-auto max-h-[400px] text-xs font-mono leading-relaxed",
                key === "design-doc" ? "text-foreground whitespace-pre-wrap" : "text-muted-foreground"
              )}
            >
              {codeMap[key]}
            </pre>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
