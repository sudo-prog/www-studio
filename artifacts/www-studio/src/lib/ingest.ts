// ─── ingest.ts ──────────────────────────────────────────────────────────────
// GitHub URL → ComponentItem[] pipeline.
//
// Architecture:
//   1. Accept a GitHub URL (repo, folder, or file).
//   2. Clone the repo shallowly (depth=1) via child_process.
//   3. Walk the tree looking for: .tsx, .jsx, .glsl, .vert, .frag, .html files.
//   4. Classify each file by technology (React, Three.js, WebGL, GSAP, etc.)
//      and visual style (animation, 3D, interactive, etc.).
//   5. Return structured ComponentItem[] objects ready to insert into the
//      component library.
//
// Vite/SSR context: child_process.execSync is Node.js-only. The ingest
// function is only called from UI event handlers in the browser, never
// during server-side rendering. No API route is needed for a pure-Vite SPA.

import type { ComponentItem } from "@/data/component-library";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IngestOptions {
  /** Owner/repo or full GitHub URL. e.g. "owner/repo" or "https://github.com/owner/repo" */
  url: string;
  /** Only ingest files under this path within the repo. Default: entire repo. */
  path?: string;
  /** Branches to try in order. Default: ['main', 'master']. */
  branches?: string[];
  /** Skip cloning and use an already-cloned local path (for testing). */
  localPath?: string;
}

export interface IngestResult {
  components: ComponentItem[];
  errors: string[];
  clonedPath: string;
}

export interface FileClassification {
  path: string;
  technology: string[];
  visualStyle: string[];
  componentType: string[];
  detectedKind: ComponentItem["kind"];
  description: string;
}

// ─── Technology classifiers ────────────────────────────────────────────────────

const TECH_PATTERNS: ReadonlyArray<{ readonly pattern: RegExp; readonly tech: string }> = [
  { pattern: /\bthree\b/i, tech: "three" },
  { pattern: /\b(@react-three|@react-three\/fiber|@react-three\/drei)\b/i, tech: "three" },
  { pattern: /\b(motion|framer-motion|gsap|animejs)\b/i, tech: "animation" },
  { pattern: /\b(prism|highlight\.js|shiki|codehike)\b/i, tech: "code-highlight" },
  { pattern: /\b(vaul|@radix-ui|sheet|drawer|popover|dropdown)\b/i, tech: "ui-system" },
  { pattern: /\b(flubber|@tweenjs|spline)\b/i, tech: "interpolation" },
  { pattern: /\b(canvas|webgl|gl-matrix|regl)\b/i, tech: "webgl" },
  { pattern: /\b(shader|glsl|frag|vert|wgsl|@shader\w*)\b/i, tech: "shader" },
  { pattern: /\b(gsap|tween|tweenjs|anime)\b/i, tech: "gsap" },
  { pattern: /\b(blob|shape|circle|polygon)\b/i, tech: "geometry" },
  { pattern: /\b(svg|path|circle|rect|line|gradient)\b/i, tech: "svg" },
];

const STYLE_PATTERNS: ReadonlyArray<{ readonly pattern: RegExp; readonly style: string }> = [
  { pattern: /\b(animate|motion|transition|keyframes|keyframes)\b/i, style: "animation" },
  { pattern: /3d|three|scene|orbit|perspective/i, style: "3d" },
  { pattern: /\b(interactive|hover|click|drag|pointer)\b/i, style: "interactive" },
  { pattern: /\b(modal|drawer|sheet|sidebar|nav)\b/i, style: "navigation" },
  { pattern: /\b(form|input|select|toggle|checkbox|radio)\b/i, style: "form" },
  { pattern: /\b(card|tile|panel|box)\b/i, style: "card" },
  { pattern: /\b(badge|chip|tag|pill|indicator)\b/i, style: "badge" },
  { pattern: /\b(loading|spinner|skeleton|progress|pulse)\b/i, style: "loading" },
  { pattern: /\b(blur|glass|frosted|backdrop|translucent)\b/i, style: "glassmorphism" },
  { pattern: /\b(gradient|mesh|neon|glow|shine)\b/i, style: "gradient" },
  { pattern: /\b(dark|light|theme)\b/i, style: "theming" },
];

const TYPE_PATTERNS: ReadonlyArray<{ readonly pattern: RegExp; readonly ctype: string }> = [
  { pattern: /\b(button|btn)\b/i, ctype: "button" },
  { pattern: /\b(input|form|field|select|otp|toggle)\b/i, ctype: "form" },
  { pattern: /\b(card|pricing|testimonial|stats|feature)\b/i, ctype: "card" },
  { pattern: /\b(modal|confirm|alert|notification|toast|snackbar)\b/i, ctype: "modal" },
  { pattern: /\b(nav|menu|sidebar|drawer|sheet|tabs)\b/i, ctype: "navigation" },
  { pattern: /\b(badge|chip|tag|label|status|pill)\b/i, ctype: "badge" },
  { pattern: /\b(loader|spinner|skeleton|progress|bar)\b/i, ctype: "loading" },
  { pattern: /\b(animation|transition|effect)\b/i, ctype: "animation" },
  { pattern: /\b3d|three|scene|mesh|model/i, ctype: "3d-scene" },
  { pattern: /\bshader|glsl|fragment|vertex|ray|raymarch/i, ctype: "shader" },
  { pattern: /\b(svg|icon|illustration|diagram)\b/i, ctype: "svg-graphic" },
  { pattern: /\b(effect|particle|gooey|liquid|noise)\b/i, ctype: "visual-effect" },
];

function classifyFile(filename: string, content: string): FileClassification {
  const lower = content.toLowerCase();
  const technologies: string[] = [];
  const styles: string[] = [];
  const componentTypes: string[] = [];

  for (const { pattern, tech } of TECH_PATTERNS) {
    if (pattern.test(content) || pattern.test(lower)) {
      if (!technologies.includes(tech)) technologies.push(tech);
    }
  }

  for (const { pattern, style } of STYLE_PATTERNS) {
    if (pattern.test(content) || pattern.test(lower)) {
      if (!styles.includes(style)) styles.push(style);
    }
  }

  for (const { pattern, ctype } of TYPE_PATTERNS) {
    if (pattern.test(content) || pattern.test(filename)) {
      if (!componentTypes.includes(ctype)) componentTypes.push(ctype);
    }
  }

  // Default
  if (technologies.length === 0) technologies.push("html");
  if (styles.length === 0) styles.push("static");
  if (componentTypes.length === 0) componentTypes.push("component");

  // Detect kind
  let detectedKind: ComponentItem["kind"] = "html";
  if (technologies.includes("three")) detectedKind = "three";
  else if (technologies.includes("shader")) detectedKind = "shader";
  else if (technologies.includes("webgl")) detectedKind = "shader";
  else if (
    technologies.includes("animation") ||
    technologies.includes("ui-system") ||
    technologies.some((t) => ["react", "three", "gsap"].includes(t))
  ) {
    detectedKind = "react";
  }

  // Derive description from filename
  const name = filename
    .replace(/\.(tsx|jsx|ts|js|glsl|vert|frag|html)$/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    path: filename,
    technology: technologies,
    visualStyle: styles,
    componentType: componentTypes,
    detectedKind,
    description: name,
  };
}

// ─── ComponentItem builder ────────────────────────────────────────────────────

function buildComponentItem(
  cls: FileClassification,
  sourceUrl: string,
): ComponentItem {
  return {
    id: `ingest-${cls.path.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`,
    name: cls.description,
    category: mapToCategory(cls),
    tags: [...cls.technology, ...cls.visualStyle, ...cls.componentType].slice(0, 8),
    code: "", // filled from file content below
    sourceUrl,
    kind: cls.detectedKind,
    component:
      cls.detectedKind === "react"
        ? guessComponentExport(cls.path)
        : undefined,
    description: `From GitHub ingest — ${cls.technology.join(", ")} · ${cls.visualStyle.join(", ")}`,
  };
}

function mapToCategory(cls: FileClassification): string {
  const cats: Record<string, string> = {
    "3d-scene": "3D",
    shader: "Shaders",
    animation: "Animation",
    "visual-effect": "Effects",
    navigation: "Navigation",
    modal: "Modals",
    badge: "Badges",
    button: "Buttons",
    form: "Forms",
    card: "Cards",
    loading: "Loading UI",
  };
  for (const ct of cls.componentType) {
    if (cats[ct]) return cats[ct];
  }
  return "Effects";
}

function guessComponentExport(path: string): string | undefined {
  const name = path
    .replace(/\.(tsx|jsx)$/i, "")
    .replace(/[-_](\w)/g, (_, c) => c.toUpperCase())
    .replace(/^./, (c) => c.toUpperCase());
  return name;
}

// ─── GitHub helpers ───────────────────────────────────────────────────────────

function parseGithubUrl(url: string): {
  owner: string;
  repo: string;
  tree: string;
  branch: string;
} {
  // Accept: https://github.com/owner/repo, https://github.com/owner/repo/tree/branch/path, owner/repo
  const httpMatch = url.match(
    /github\.com\/([^/]+)\/([^/]+?)(?:\/tree\/([^/]+))?(?:\/(.+))?$/,
  );
  if (httpMatch) {
    const [, owner, repo, branch = "main", tree = ""] = httpMatch;
    return { owner, repo, tree, branch };
  }
  const shortMatch = url.match(/^([^/]+)\/([^/]+)$/);
  if (shortMatch) {
    const [, owner, repo] = shortMatch;
    return { owner, repo, tree: "", branch: "main" };
  }
  throw new Error(`Invalid GitHub URL: ${url}`);
}

// ─── Main ingest function ─────────────────────────────────────────────────────

/**
 * Ingest React / Three.js / WebGL / HTML components from a GitHub repository.
 *
 * Usage:
 * ```ts
 * const { components, errors, clonedPath } = await extractFromUrl({
 *   url: "https://github.com/user/repo",
 * });
 * ```
 *
 * For client-side use in a Vite SPA. Internally uses child_process to
 * clone the repo; no API route needed.
 */
export async function extractFromUrl(
  options: IngestOptions,
): Promise<IngestResult> {
  const {
    url,
    path: filterPath = "",
    branches = ["main", "master"],
    localPath,
  } = options;

  const errors: string[] = [];
  const components: ComponentItem[] = [];
  let clonedPath = localPath ?? "";

  try {
    // ── Step 1: Resolve GitHub URL ───────────────────────────────────────────
    const { owner, repo, branch } = parseGithubUrl(url);

    // ── Step 2: Clone (or reuse local path) ─────────────────────────────────
    if (!localPath) {
      const tmpDir = `/tmp/ingest-${owner}-${repo}-${Date.now()}`;
      clonedPath = tmpDir;

      try {
        // Try each branch — execFileSync avoids shell injection since
        // owner/repo are derived from the URL, not from user input.
        const { execFileSync } = await import("child_process");
        let cloned = false;
        for (const br of branches) {
          const gitUrl = `https://github.com/${owner}/${repo}.git`;
          try {
            execFileSync(
              "git",
              ["clone", "--depth=1", "--branch=" + br, gitUrl, tmpDir],
              { stdio: "pipe" },
            );
            cloned = true;
            break;
          } catch {
            // Branch not found, try next
          }
        }
        if (!cloned) {
          errors.push(
            `Could not clone ${owner}/${repo} — no suitable branch found (tried: ${branches.join(", ")})`,
          );
        }
      } catch (e: unknown) {
        errors.push(`Git clone failed: ${e instanceof Error ? e.message : String(e)}`);
        return { components, errors, clonedPath };
      }
    }

    // ── Step 3: Walk file tree ───────────────────────────────────────────────
    const { readdirSync, statSync, readFileSync, rmSync } = await import("fs");
    const { join, extname, relative } = await import("path");

    const scanDir = (dir: string, baseDir: string): void => {
      try {
        const entries = readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = join(dir, entry.name);
          if (entry.isDirectory()) {
            // Skip node_modules, .git, dist, build, etc.
            if (
              !["node_modules", ".git", "dist", "build", "__pycache__", ".next", ".nuxt"].includes(entry.name)
            ) {
              scanDir(fullPath, baseDir);
            }
          } else if (entry.isFile()) {
            const ext = extname(entry.name).toLowerCase();
            if (
              [".tsx", ".jsx", ".ts", ".js", ".glsl", ".vert", ".frag", ".html", ".svg"].includes(ext)
            ) {
              // Apply optional path filter
              if (filterPath && !fullPath.includes(filterPath)) return;

              try {
                const content = readFileSync(fullPath, "utf-8");
                const relPath = relative(baseDir, fullPath);
                const cls = classifyFile(relPath, content);

                // Skip files that look like configs/tests/non-components
                if (
                  relPath.includes(".test.") ||
                  relPath.includes(".spec.") ||
                  relPath.includes("__tests__") ||
                  relPath.includes("stories.") ||
                  relPath.includes(".config.") ||
                  relPath.includes(".types.")
                ) {
                  continue;
                }

                // Build source URL
                const sourceUrl = `https://github.com/${owner}/${repo}/blob/${branch}/${relPath}`;
                const item = buildComponentItem(cls, sourceUrl);

                // For React/TSX files, extract the actual code
                if ([".tsx", ".jsx", ".ts", ".js"].includes(ext)) {
                  item.code = content;
                  // Set kind based on technology
                  if (cls.technology.includes("three")) item.kind = "three";
                  else if (cls.technology.includes("shader") || cls.technology.includes("webgl"))
                    item.kind = "shader";
                  else if (
                    cls.technology.includes("animation") ||
                    cls.technology.includes("ui-system") ||
                    cls.technology.some((t) => ["react", "gsap"].includes(t))
                  ) {
                    item.kind = "react";
                    item.component = guessComponentExport(relPath);
                  } else {
                    item.kind = "html";
                  }
                } else if ([".glsl", ".vert", ".frag"].includes(ext)) {
                  item.kind = "shader";
                  item.code = JSON.stringify({
                    vertex: `attribute vec4 position;\nvoid main() { gl_Position = projectionMatrix * modelViewMatrix * position; }`,
                    fragment: content,
                  });
                } else if (ext === ".html") {
                  item.kind = "html";
                  item.code = content;
                  item.previewHtml = content;
                } else {
                  item.kind = "html";
                  item.code = content;
                }

                components.push(item);
              } catch (e: unknown) {
                errors.push(`Failed to read ${fullPath}: ${e instanceof Error ? e.message : String(e)}`);
              }
            }
          }
        }
      } catch (e: unknown) {
        errors.push(`Failed to scan directory ${dir}: ${e instanceof Error ? e.message : String(e)}`);
      }
    };

    scanDir(clonedPath, clonedPath);
  } catch (e: unknown) {
    errors.push(`Ingest failed: ${e instanceof Error ? e.message : String(e)}`);
  }

  return { components, errors, clonedPath };
}

// ─── Cleanup helper ───────────────────────────────────────────────────────────

/** Remove the temporary clone directory created by extractFromUrl. */
export async function cleanupIngest(clonedPath: string): Promise<void> {
  if (!clonedPath.startsWith("/tmp/ingest-")) return;
  try {
    const { rmSync } = await import("fs");
    rmSync(clonedPath, { recursive: true, force: true });
  } catch {
    // Best-effort cleanup
  }
}
