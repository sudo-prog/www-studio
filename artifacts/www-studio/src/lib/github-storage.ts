/**
 * GitHub Backup System (Browser-compatible)
 * 
 * Stores project backups as JSON files in a GitHub repository.
 * Uses the GitHub REST API directly via fetch (no server required).
 * Requires a GitHub personal access token with 'repo' scope.
 */

const GITHUB_REPO = "sudo-prog/www-studio-backup";
const BRANCH = "main";
const BACKUP_FOLDER = "projects";

export interface ProjectBackup {
  id: string;
  name: string;
  userId: string;
  componentTree: string | null;
  themeTokens: string | null;
  status: string;
  slug: string;
  thumbnailUrl?: string | null;
  type?: "structured" | "scene" | "freeform";
  freeformData?: string | null;
  savedAt: string;
}

export interface FreeformBackup {
  id: string;
  name: string;
  userId: string;
  elements: string;
  background: string;
  canvasWidth: number;
  canvasHeight: number;
  status: string;
  slug: string;
  savedAt: string;
}

export type BackupEntry = ProjectBackup | FreeformBackup;

// ── Token management ────────────────────────────────────────────────────────

function getToken(): string | null {
  return localStorage.getItem("github_token");
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// ── GitHub API helpers ──────────────────────────────────────────────────────

async function githubFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const url = path.startsWith("http") ? path : `https://api.github.com${path}`;
  const headers = { ...getHeaders(), ...(init.headers as Record<string, string> || {}) };
  return fetch(url, { ...init, headers });
}

async function fileExistsOnGitHub(path: string): Promise<boolean> {
  try {
    const res = await githubFetch(`/repos/${GITHUB_REPO}/contents/${path}`);
    return res.ok;
  } catch {
    return false;
  }
}

async function getFileFromGitHub(path: string): Promise<string | null> {
  try {
    const res = await githubFetch(`/repos/${GITHUB_REPO}/contents/${path}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.content) return null;
    return atob(data.content);
  } catch {
    return null;
  }
}

async function getShaForFile(path: string): Promise<string | null> {
  try {
    const res = await githubFetch(`/repos/${GITHUB_REPO}/contents/${path}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.sha || null;
  } catch {
    return null;
  }
}

async function retry<T>(fn: () => Promise<T>, attempts = 2, delayMs = 2000): Promise<T> {
  let lastError: Error | null = null;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e: any) {
      lastError = e;
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }
  throw lastError;
}

// ── Public API ──────────────────────────────────────────────────────────────

export async function saveProject(project: ProjectBackup): Promise<{ success: boolean; sha?: string }> {
  const path = `${BACKUP_FOLDER}/projects/${project.id}.json`;
  const content = btoa(JSON.stringify(project, null, 2));
  const message = `Backup project: ${project.name}`;

  const sha = await getShaForFile(path);
  const body: any = {
    message,
    content,
    branch: BRANCH,
  };
  if (sha) body.sha = sha;

  const res = await githubFetch(`/repos/${GITHUB_REPO}/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Save failed: ${res.status}`);
  }

  projectCache.delete(project.id);
  listCache = null;
  return { success: true };
}

export async function saveFreeformProject(project: FreeformBackup): Promise<{ success: boolean }> {
  const path = `${BACKUP_FOLDER}/freeform/${project.id}.json`;
  const content = btoa(JSON.stringify(project, null, 2));
  const message = `Backup freeform: ${project.name}`;

  const sha = await getShaForFile(path);
  const body: any = {
    message,
    content,
    branch: BRANCH,
  };
  if (sha) body.sha = sha;

  const res = await githubFetch(`/repos/${GITHUB_REPO}/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Save failed: ${res.status}`);
  }

  projectCache.delete(project.id);
  listCache = null;
  return { success: true };
}

// Cache to avoid redundant API calls
const projectCache = new Map<string, BackupEntry>();
let listCache: BackupEntry[] | null = null;

export async function loadProject(id: string): Promise<BackupEntry | null> {
  if (projectCache.has(id)) return projectCache.get(id)!;

  // Try project backup
  const projectData = await getFileFromGitHub(`${BACKUP_FOLDER}/projects/${id}.json`);
  if (projectData) {
    const parsed = JSON.parse(projectData) as BackupEntry;
    projectCache.set(id, parsed);
    return parsed;
  }

  // Try freeform backup
  const freeformData = await getFileFromGitHub(`${BACKUP_FOLDER}/freeform/${id}.json`);
  if (freeformData) {
    const parsed = JSON.parse(freeformData) as BackupEntry;
    projectCache.set(id, parsed);
    return parsed;
  }

  return null;
}

export async function listProjects(): Promise<BackupEntry[]> {
  if (listCache) return listCache;

  try {
    const entries: BackupEntry[] = [];

    // List projects folder
    const projectsRes = await githubFetch(`/repos/${GITHUB_REPO}/contents/${BACKUP_FOLDER}/projects`);
    if (projectsRes.ok) {
      const projects = await projectsRes.json();
      if (Array.isArray(projects)) {
        for (const file of projects) {
          if (file.name.endsWith(".json")) {
            const id = file.name.replace(".json", "");
            const entry = projectCache.get(id);
            if (entry) entries.push(entry);
          }
        }
      }
    }

    // List freeform folder
    const freeformRes = await githubFetch(`/repos/${GITHUB_REPO}/contents/${BACKUP_FOLDER}/freeform`);
    if (freeformRes.ok) {
      const freeform = await freeformRes.json();
      if (Array.isArray(freeform)) {
        for (const file of freeform) {
          if (file.name.endsWith(".json")) {
            const id = file.name.replace(".json", "");
            const entry = projectCache.get(id);
            if (entry) entries.push(entry);
          }
        }
      }
    }

    listCache = entries;
    return entries;
  } catch (e: any) {
    console.warn("Could not list projects:", e.message);
    return [];
  }
}

export async function deleteProject(id: string): Promise<{ success: boolean }> {
  const path = `${BACKUP_FOLDER}/projects/${id}.json`;
  const freeformPath = `${BACKUP_FOLDER}/freeform/${id}.json`;

  const sha = await getShaForFile(path);
  if (sha) {
    await githubFetch(`/repos/${GITHUB_REPO}/contents/${path}`, {
      method: "DELETE",
      body: JSON.stringify({ message: "Delete backup", sha, branch: BRANCH }),
    });
  }

  const freeformSha = await getShaForFile(freeformPath);
  if (freeformSha) {
    await githubFetch(`/repos/${GITHUB_REPO}/contents/${freeformPath}`, {
      method: "DELETE",
      body: JSON.stringify({ message: "Delete freeform backup", sha: freeformSha, branch: BRANCH }),
    });
  }

  projectCache.delete(id);
  listCache = null;
  return { success: true };
}

export function clearCache(): void {
  projectCache.clear();
  listCache = null;
}

export function setGitHubToken(token: string): void {
  localStorage.setItem("github_token", token);
}

export function hasGitHubToken(): boolean {
  return !!getToken();
}

// ── GitHub Pages Publishing ────────────────────────────────────────────────

const PAGES_REPO = "sudo-prog/www-studio-pages";

/**
 * Deploy a freeform page to GitHub Pages.
 * Creates/updates the HTML file in the gh-pages branch of the pages repo.
 */
export async function publishToGitHubPages(
  pageData: { id: string; name: string; slug: string; html: string; customDomain?: string }
): Promise<{ success: boolean; url?: string; error?: string }> {
  const { id, name, slug, html, customDomain } = pageData;
  const path = `freeform/${slug || id}.html`;
  const content = btoa(html);
  const message = `Publish freeform: ${name}`;

  let sha: string | null = null;
  try {
    const shaRes = await githubFetch(`/repos/${PAGES_REPO}/contents/${path}?ref=gh-pages`);
    if (shaRes.ok) {
      const shaData = await shaRes.json();
      sha = shaData.sha || null;
    }
  } catch { /* file doesn't exist yet */ }

  const body: any = {
    message,
    content,
    branch: "gh-pages",
  };
  if (sha) body.sha = sha;

  const res = await githubFetch(`/repos/${PAGES_REPO}/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { success: false, error: err.message || `Publish failed: ${res.status}` };
  }

  // Write CNAME if custom domain is set
  if (customDomain) {
    const cnamePath = "CNAME";
    const cnameContent = btoa(customDomain);
    try {
      const cnameShaRes = await githubFetch(`/repos/${PAGES_REPO}/contents/${cnamePath}?ref=gh-pages`);
      let cnameSha: string | null = null;
      if (cnameShaRes.ok) {
        const cnameData = await cnameShaRes.json();
        cnameSha = cnameData.sha || null;
      }
      await githubFetch(`/repos/${PAGES_REPO}/contents/${cnamePath}`, {
        method: "PUT",
        body: JSON.stringify({
          message: `Set custom domain: ${customDomain}`,
          content: cnameContent,
          branch: "gh-pages",
          ...(cnameSha ? { sha: cnameSha } : {}),
        }),
      });
    } catch { /* CNAME write is best-effort */ }
    return { success: true, url: `https://${customDomain}` };
  }

  const pagesUrl = `https://sudo-prog.github.io/www-studio-pages/freeform/${slug || id}.html`;
  return { success: true, url: pagesUrl };
}

/**
 * Get the shareable URL for a freeform page.
 */
export function getShareUrl(pageId: string, slug?: string): string {
  const base = window.location.origin;
  return `${base}/freeform/${pageId}/share`;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function backupToFreeformPage(entry: BackupEntry): import("@/lib/freeform-types").FreeformPage {
  if ("elements" in entry) {
    return {
      id: entry.id,
      name: entry.name,
      userId: entry.userId,
      elements: JSON.parse(entry.elements),
      background: JSON.parse(entry.background),
      canvasWidth: entry.canvasWidth,
      canvasHeight: entry.canvasHeight,
      status: entry.status,
      slug: entry.slug,
    };
  }
  throw new Error("Not a freeform backup");
}
