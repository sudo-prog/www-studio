import { useState, useEffect, useCallback } from "react";
import type { AuthUser } from "@workspace/api-client-react";

export type { AuthUser };

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  loginWithGitHub: () => void;
  logout: () => void;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/user", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ user: AuthUser | null }>;
      })
      .then((data) => {
        if (!cancelled) {
          setUser(data.user ?? null);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(() => {
    // Redirect to the login page (to be implemented as a UI page in the web app)
    window.location.href = "/login";
  }, []);

  const loginWithGitHub = useCallback(() => {
    // GitHub OAuth requires a backend server. On static hosting (GitHub Pages),
    // show a notice. When running with the API server, this redirects correctly.
    const hasBackend = !window.location.hostname.includes("github.io");
    if (hasBackend) {
      const returnTo = window.location.pathname;
      window.location.href = `/api/auth/github?returnTo=${encodeURIComponent(returnTo)}`;
    } else {
      // Static hosting — show a temporary notice
      const el = document.createElement("div");
      el.className = "fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-zinc-900 border border-zinc-700 text-white text-sm px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3";
      el.innerHTML = `<span>GitHub login requires the backend server. Run locally with <code class="bg-black/30 px-1.5 py-0.5 rounded text-xs">pnpm --filter @workspace/api-server run dev</code> + <code class="bg-black/30 px-1.5 py-0.5 rounded text-xs">bash scripts/start-gemini-proxy.sh</code></span>`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 6000);
    }
  }, []);

  const logout = useCallback(() => {
    window.location.href = "/api/logout";
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginWithGitHub,
    logout,
  };
}
