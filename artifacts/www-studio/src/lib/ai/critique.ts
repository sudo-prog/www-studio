// ── Design Critique Engine ──────────────────────────────────────────────────
// Audits current design for contrast, spacing, alignment, and accessibility.

import { FreeformElement } from "@/lib/freeform-types";

export interface CritiqueIssue {
  id: string;
  category: "contrast" | "spacing" | "alignment" | "accessibility" | "typography" | "performance";
  severity: "info" | "warning" | "error";
  message: string;
  elementId?: string;
  suggestion?: string;
}

export interface CritiqueReport {
  timestamp: string;
  score: number; // 0-100
  issues: CritiqueIssue[];
  summary: string;
}

// ── Color contrast helpers ─────────────────────────────────────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  if (!rgb1 || !rgb2) return 1;
  const l1 = relativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = relativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ── Main critique function ─────────────────────────────────────────────────

export function critiqueDesign(elements: FreeformElement[], canvasBackground?: string): CritiqueReport {
  const issues: CritiqueIssue[] = [];
  const bgColor = canvasBackground || "#0d1117";

  for (const el of elements) {
    // ── Contrast check ──
    if (el.type === "text" && el.color) {
      const ratio = contrastRatio(el.color, bgColor);
      if (ratio < 3) {
        issues.push({
          id: `contrast-${el.id}`,
          category: "contrast",
          severity: "error",
          message: `Text contrast ratio ${ratio.toFixed(2)}:1 fails WCAG AAA (needs 7:1)`,
          elementId: el.id,
          suggestion: `Change text color from ${el.color} to #ffffff for better contrast`,
        });
      } else if (ratio < 4.5) {
        issues.push({
          id: `contrast-${el.id}`,
          category: "contrast",
          severity: "warning",
          message: `Text contrast ratio ${ratio.toFixed(2)}:1 fails WCAG AA (needs 4.5:1)`,
          elementId: el.id,
          suggestion: `Consider using a lighter text color for better readability`,
        });
      }
    }

    // ── Accessibility: alt text for images ──
    if (el.type === "image" && !el.name) {
      issues.push({
        id: `a11y-img-${el.id}`,
        category: "accessibility",
        severity: "warning",
        message: "Image element is missing alt text (name property)",
        elementId: el.id,
        suggestion: "Set a descriptive name/alt text for the image",
      });
    }

    // ── Accessibility: button labels ──
    if (el.type === "button" && !el.label) {
      issues.push({
        id: `a11y-btn-${el.id}`,
        category: "accessibility",
        severity: "error",
        message: "Button element is missing a label",
        elementId: el.id,
        suggestion: "Add descriptive button text for screen readers",
      });
    }

    // ── Spacing: overlapping elements ──
    for (const other of elements) {
      if (other.id === el.id) continue;
      const overlapX = el.x < other.x + other.width && el.x + el.width > other.x;
      const overlapY = el.y < other.y + other.height && el.y + el.height > other.y;
      if (overlapX && overlapY && el.zIndex === other.zIndex) {
        // Only report once per pair
        if (el.id < other.id) {
          issues.push({
            id: `overlap-${el.id}-${other.id}`,
            category: "spacing",
            severity: "info",
            message: `Elements "${el.name || el.id.slice(0, 8)}" and "${other.name || other.id.slice(0, 8)}" overlap at the same z-index`,
            elementId: el.id,
            suggestion: "Adjust positions or z-index to clarify stacking",
          });
        }
      }
    }

    // ── Typography: font size too small ──
    if (el.type === "text" && el.fontSize && el.fontSize < 12) {
      issues.push({
        id: `font-${el.id}`,
        category: "typography",
        severity: "warning",
        message: `Font size ${el.fontSize}px may be too small for readability`,
        elementId: el.id,
        suggestion: "Use at least 14px for body text",
      });
    }
  }

  // ── Alignment: check for elements not aligned to grid ──
  const positions = elements.map((e) => ({ x: e.x, y: e.y }));
  const commonX = new Set(positions.filter((p) => p.x % 10 !== 0).map((p) => p.x));
  if (commonX.size > 3) {
    issues.push({
      id: "alignment-grid",
      category: "alignment",
      severity: "info",
      message: "Many elements are not aligned to a consistent grid",
      suggestion: "Enable snap-to-grid for cleaner alignment",
    });
  }

  // ── Performance: too many elements ──
  if (elements.length > 50) {
    issues.push({
      id: "perf-count",
      category: "performance",
      severity: "warning",
      message: `Canvas has ${elements.length} elements which may impact performance`,
      suggestion: "Consider grouping elements or using artboards for complex scenes",
    });
  }

  // ── Calculate score ──
  const deductions = issues.reduce((sum, issue) => {
    if (issue.severity === "error") return sum + 15;
    if (issue.severity === "warning") return sum + 5;
    return sum + 1;
  }, 0);
  const score = Math.max(0, Math.min(100, 100 - deductions));

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  return {
    timestamp: new Date().toISOString(),
    score,
    issues,
    summary: errorCount > 0
      ? `Found ${errorCount} errors and ${warningCount} warnings. Fix errors first for better accessibility.`
      : warningCount > 0
      ? `Design looks good with ${warningCount} minor suggestions.`
      : "Design looks great! No issues found.",
  };
}
