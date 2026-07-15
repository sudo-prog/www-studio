// ESLint flat config — WWW Studio frontend.
// SCOPE: this config ONLY enforces the audit guardrail against regressions of the
// "bypass API base URL" bug (bare fetch("/api/...") calls that resolve against the
// static frontend origin instead of the separately-deployed api-server in prod).
//
// It deliberately does NOT enable the recommended rule sets (no-undef, no-unused-vars,
// etc.) — those flag pre-existing code (React globals, browser APIs) and would turn
// `pnpm lint` red without catching anything actionable. The single rule below is a
// targeted regression gate: it reports 0 problems on the current codebase and will
// fail CI only if a future change reintroduces a bare `/api` fetch.
import parser from "@typescript-eslint/parser";
import plugin from "@typescript-eslint/eslint-plugin";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "e2e/**",
      "**/*.config.ts",
      "**/*.config.mjs",
    ],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
      globals: {
        // Browser + common globals so the guardrail rule can run without
        // pulling in the full recommended set that flags pre-existing code.
        window: "readonly",
        document: "readonly",
        fetch: "readonly",
        URL: "readonly",
        Blob: "readonly",
        setTimeout: "readonly",
        React: "readonly",
      },
    },
    plugins: { "@typescript-eslint": plugin },
    rules: {
      // AUDIT GUARDRAIL (re-audit 2026-07-15, Claim 2): never call fetch() with a
      // string/template starting with "/api" — it bypasses VITE_API_SERVER_URL and
      // resolves against the static frontend origin in prod. Use apiFetch()
      // (src/lib/apiFetch.ts) or the generated @workspace/api-client-react hooks instead.
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.name='fetch'] > Literal[value=/^\\/api/]",
          message:
            "Bare fetch('/api/...') bypasses the API base URL. Use apiFetch() from '@/lib/apiFetch' instead.",
        },
        {
          selector:
            "CallExpression[callee.name='fetch'] > TemplateLiteral Literal[value=/^\\/api/]",
          message:
            "Bare fetch(`/api/...`) bypasses the API base URL. Use apiFetch() from '@/lib/apiFetch' instead.",
        },
      ],
    },
  },
];
