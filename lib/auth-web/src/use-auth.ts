import { useState, useEffect, useCallback } from "react";
import type { AuthUser } from "@workspace/api-client-react";

export type { AuthUser };

const PASSWORD_STORAGE_KEY = "www-studio-saved-password";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  loginWithGitHub: () => void;
  loginWithPassword: (password: string) => Promise<boolean>;
  logout: () => void;
  hasSavedPassword: boolean;
  clearSavedPassword: () => void;
  passwordSet: boolean;
  githubAvailable: boolean;
  setPassword: (password: string) => Promise<boolean>;
  resetPassword: (current: string, newPassword: string) => Promise<boolean>;
}

function getSavedPassword(): string | null {
  try {
    const raw = localStorage.getItem(PASSWORD_STORAGE_KEY);
    if (!raw) return null;
    // Simple atob obfuscation
    return atob(raw);
  } catch {
    return null;
  }
}

function savePassword(password: string): void {
  try {
    localStorage.setItem(PASSWORD_STORAGE_KEY, btoa(password));
  } catch {
    // localStorage unavailable
  }
}

export function clearSavedPassword(): void {
  try {
    localStorage.removeItem(PASSWORD_STORAGE_KEY);
  } catch {
    // localStorage unavailable
  }
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [methods, setMethods] = useState<{ passwordSet: boolean; githubAvailable: boolean }>({ passwordSet: false, githubAvailable: false });

  const API_BASE = import.meta.env.VITE_API_SERVER_URL || "";
  const hasBackend = !!API_BASE;

  useEffect(() => {
    let cancelled = false;

    if (!hasBackend) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/auth/user`, { credentials: "include" })
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
  }, [API_BASE, hasBackend]);

  // Fetch available auth methods (password set? github available?)
  useEffect(() => {
    if (!hasBackend) return;
    fetch(`${API_BASE}/api/auth/methods`, { credentials: "include" })
      .then((res) => res.json() as Promise<{ passwordSet: boolean; githubAvailable: boolean }>)
      .then((data) => setMethods(data))
      .catch(() => setMethods({ passwordSet: false, githubAvailable: false }));
  }, [API_BASE, hasBackend]);

  const login = useCallback(() => {
    // Redirect to the login page (to be implemented as a UI page in the web app)
    window.location.href = "/login";
  }, []);

  const loginWithGitHub = useCallback(async () => {
    if (!hasBackend) {
      // No backend configured — show a temporary notice and STAY on the page.
      const el = document.createElement("div");
      el.className = "fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-zinc-900 border border-zinc-700 text-white text-sm px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3";
      el.innerHTML = `<span>GitHub login requires the backend server. Set <code class="bg-black/30 px-1.5 py-0.5 rounded text-xs">VITE_API_SERVER_URL</code> in your environment.</span>`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 6000);
      return;
    }

    const returnTo = window.location.pathname;
    const endpoint = `${API_BASE}/api/auth/github?returnTo=${encodeURIComponent(returnTo)}`;

    // Verify the endpoint is reachable / configured before navigating away.
    // If it errors (e.g. GitHub OAuth not configured, server down), show an
    // inline notice and STAY on the current page instead of bouncing home.
    try {
      const res = await fetch(endpoint, { method: "GET", redirect: "manual" });
      // A successful OAuth start returns a 3xx redirect (opaque with redirect:manual).
      // 2xx (HTML), 3xx, or 4xx that isn't a network error are all "handled" by the
      // server, so we proceed with the real navigation. A network failure throws.
      window.location.href = endpoint;
    } catch (err) {
      const el = document.createElement("div");
      el.className = "fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-zinc-900 border border-zinc-700 text-white text-sm px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3";
      el.innerHTML = `<span>GitHub sign-in is unavailable right now. Please try again later.</span>`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 6000);
    }
  }, [API_BASE, hasBackend]);

  const loginWithPassword = useCallback(async (password: string): Promise<boolean> => {
    if (!hasBackend || !API_BASE) return false;
    try {
      const res = await fetch(`${API_BASE}/api/auth/password-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include",
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        savePassword(password);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [API_BASE, hasBackend]);

  const setPassword = useCallback(async (password: string): Promise<boolean> => {
    if (!hasBackend || !API_BASE) return false;
    try {
      const res = await fetch(`${API_BASE}/api/auth/password-set`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include",
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        savePassword(password);
        setMethods((m) => ({ ...m, passwordSet: true }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [API_BASE, hasBackend]);

  const resetPassword = useCallback(async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!hasBackend || !API_BASE) return false;
    try {
      const res = await fetch(`${API_BASE}/api/auth/password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: "include",
      });
      if (!res.ok) return false;
      return true;
    } catch {
      return false;
    }
  }, [API_BASE, hasBackend]);

  // Auto-login with saved password on mount
  useEffect(() => {
    if (!hasBackend || !API_BASE) return;
    const savedPw = getSavedPassword();
    if (savedPw && !user) {
      loginWithPassword(savedPw).catch(() => {
        clearSavedPassword();
      });
    }
  }, [API_BASE, hasBackend, user, loginWithPassword]);

  const logout = useCallback(() => {
    if (hasBackend) {
      window.location.href = `${API_BASE}/api/logout`;
    }
  }, [API_BASE, hasBackend]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginWithGitHub,
    loginWithPassword,
    logout,
    hasSavedPassword: !!getSavedPassword(),
    clearSavedPassword,
    passwordSet: methods.passwordSet,
    githubAvailable: methods.githubAvailable,
    setPassword,
    resetPassword,
  };
}
