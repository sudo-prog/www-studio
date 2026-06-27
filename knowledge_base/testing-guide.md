# WWW Studio — Testing Guide

Overview of existing tests, how to run them, and testing patterns used.

---

## Test Infrastructure

- **Test framework:** Vitest
- **Test runner command:** `pnpm --filter @workspace/api-server run test` (which runs `vitest run`)
- **Config location:** `artifacts/api-server/vitest.config.ts`
- **Frontend tests:** No vitest config exists yet for the frontend (tests exist but aren't wired into a runner)

### Vitest Configuration (`artifacts/api-server/vitest.config.ts`)

```typescript
export default defineConfig({
  test: {
    globals: true,          // describe, it, expect available without import
    environment: "node",    // Node environment (not jsdom)
    include: ["src/**/*.test.ts"],
    exclude: ["node_modules", "dist"],
    typecheck: {
      enabled: false,       // Typecheck handled by tsc separately
    },
  },
});
```

---

## Existing Test Files

### Frontend Tests (`artifacts/www-studio/src/__tests__/`)

#### `tokenLinter.test.ts` (195 lines)
Tests for the design token linting system (`lib/tokenLinter.ts`).

**Test suites:**
- **WCAG contrast** — Detects low-contrast text combinations, flags severe failures as errors, passes good contrast
- **Font count** — Flags >2 distinct font families, deduplicates case-insensitively
- **Near-duplicate colors** — Detects similar colors in HSL space
- **Missing semantic colors** — Flags missing required colors (primary, background, foreground) and recommended ones (muted, border, surface)

**Pattern:**
```typescript
import { describe, it, expect } from "vitest";
import { lintDesignTokens } from "../lib/tokenLinter";

describe("lintDesignTokens — WCAG contrast", () => {
  it("detects WCAG AA contrast failure for low-contrast text", () => {
    const warnings = lintDesignTokens({
      colors: { background: "#FFFFFF", foreground: "#CCCCCC" },
    });
    const contrastWarnings = warnings.filter((w) => w.category === "contrast");
    expect(contrastWarnings.length).toBeGreaterThan(0);
  });
});
```

#### `colorHarmony.test.ts` (127 lines)
Tests for HSL color harmony math (`lib/colorHarmony.ts`).

**Test suites:**
- **generateHarmony** — Generates 7-color palette, valid hex codes, complementary ~180° apart, analogous ±30° apart, triadic ~120° apart, neutral/surface lightness, deterministic output, edge cases (white, black, red)
- **HSL round-trip accuracy** — Hue preservation in triadic offsets

**Pattern:**
```typescript
import { describe, it, expect } from "vitest";
import { generateHarmony } from "../lib/colorHarmony";

describe("generateHarmony", () => {
  it("complementary color is ~180° apart in HSL", () => {
    const hslPrimary = hexToHsl(primary);
    const hslComp = hexToHsl(generateHarmony(primary).complementary);
    const diff = Math.abs(hslPrimary.h - hslComp.h);
    expect(normalizedDiff).toBeGreaterThanOrEqual(150);
    expect(normalizedDiff).toBeLessThanOrEqual(210);
  });
});
```

### API Server Tests (`artifacts/api-server/src/__tests__/`)

#### `intentParser.test.ts` (109 lines)
Tests for annotation intent parsing (`lib/intentParser.ts`).

**Test suites:**
- Typography detection ("I love this font" → intent: typography, weight: 0.9)
- Color detection ("Use this colour" → intent: color, weight: 0.9)
- Mobile layout detection ("Use mobile layout from this" → intent: mobile-layout)
- Blend detection ("Mix with primary" → intent: blend, weight: 0.5)
- Base detection ("Use as base" → intent: base, weight: 1.0)
- Animation detection ("Love these animations" → intent: animation)
- Component detection ("Use these cards/buttons" → intent: component)
- Default/inspiration for empty input
- Various keyword variants (typeface, foundation, combine, nav)

#### `designPrompts.test.ts` (215 lines)
Tests for design output generation (`lib/designPrompts.ts`).

**Test suites:**
- **buildDesignMdFromTokens** — 8-section markdown, includes URL, includes colors, valid JSON block
- **buildTailwindConfigFromTokens** — Valid TypeScript, includes colors, fonts, breakpoints
- **buildTokensCssFromTokens** — CSS custom properties, font sizes, spacing/radius/shadow vars, dark mode block
- **buildDesignTokensJsonFromTokens** — DTCG-format JSON, preserves colors, typography, pretty-printed

#### `designExtract.test.ts` (217 lines)
Integration test for the full design extraction pipeline.

**Test suites:**
- Full pipeline with mocked LLM, screenshot, RAG, and DB
- Token update regenerates all 4 outputs (md, tailwind, css, json)
- Export content-type mapping validation
- Undo restores previous tokens from history
- History capped at 20 entries

**Mocking pattern:**
```typescript
vi.mock("../lib/llm", () => ({
  visionComplete: (...args: unknown[]) => mockVisionComplete(...args),
}));
vi.mock("@workspace/db", () => ({ db: mockDb, ... }));
```

---

## How to Run Tests

### API Server Tests
```bash
pnpm --filter @workspace/api-server run test
```

### Frontend Tests
Currently no test runner is configured for the frontend. To run frontend tests, you would need to:

1. Add a vitest config to `artifacts/www-studio/`:
   ```typescript
   // artifacts/www-studio/vitest.config.ts
   import { defineConfig } from "vitest/config";
   export default defineConfig({
     test: {
       globals: true,
       environment: "node",
       include: ["src/**/*.test.ts"],
     },
   });
   ```

2. Add a test script to `artifacts/www-studio/package.json`:
   ```json
   "test": "vitest run"
   ```

3. Run:
   ```bash
   pnpm --filter @workspace/www-studio run test
   ```

---

## Test Patterns

### 1. Pure Function Testing
Most tests are for pure utility functions — no React rendering needed:
```typescript
import { lintDesignTokens } from "../lib/tokenLinter";
const warnings = lintDesignTokens({ colors: { ... } });
expect(warnings.filter(w => w.category === "contrast").length).toBeGreaterThan(0);
```

### 2. Mock External Dependencies
API server tests mock LLM, screenshot, RAG, and DB:
```typescript
vi.mock("../lib/llm", () => ({ visionComplete: vi.fn() }));
vi.mock("../lib/screenshot", () => ({ screenshotUrl: vi.fn() }));
vi.mock("../lib/ragIngest", () => ({ ingestExtractionIntoRag: vi.fn() }));
vi.mock("@workspace/db", () => ({ db: mockDb }));
```

### 3. Integration Testing
The `designExtract.test.ts` tests the full pipeline end-to-end with all external services mocked.

### 4. Edge Case Testing
Tests cover edge cases like white/black primary colors, empty inputs, and boundary conditions.

---

## Test Coverage Summary

| Module | File | Tests | Status |
|--------|------|-------|--------|
| Token linting | `tokenLinter.test.ts` | 10 | ✅ Exists, no runner |
| Color harmony | `colorHarmony.test.ts` | 11 | ✅ Exists, no runner |
| Intent parser | `intentParser.test.ts` | 12 | ✅ Runnable |
| Design prompts | `designPrompts.test.ts` | 12 | ✅ Runnable |
| Design extract pipeline | `designExtract.test.ts` | 9 | ✅ Runnable |

**Total: 54 test cases across 5 files**

---

## Recommendations for Adding Tests

1. **Frontend test runner** — Add vitest config to `artifacts/www-studio/`
2. **Component tests** — Use `@testing-library/react` for component rendering tests
3. **E2E tests** — Consider Playwright for critical user flows (create project, publish)
4. **API integration tests** — Use supertest for HTTP route testing without mocking
