import { useEffect, useRef, useCallback, useState } from "react";

interface PendingSave {
  projectId: string;
  componentTree: string | null;
  themeTokens: string | null;
  label: string;
  queuedAt: number;
}

const QUEUE_KEY = "www-studio:offline-queue";

function loadQueue(): PendingSave[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveQueue(q: PendingSave[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(() => loadQueue().length);
  const syncingRef = useRef(false);

  const flush = useCallback(async () => {
    if (syncingRef.current || !navigator.onLine) return;
    const queue = loadQueue();
    if (queue.length === 0) return;

    syncingRef.current = true;
    const failed: PendingSave[] = [];

    for (const item of queue) {
      try {
        await fetch(`/api/projects/${item.projectId}/snapshots`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            label: item.label,
            componentTree: item.componentTree,
            themeTokens: item.themeTokens,
          }),
        });
      } catch {
        failed.push(item);
      }
    }

    saveQueue(failed);
    setPendingCount(failed.length);
    syncingRef.current = false;
  }, []);

  const enqueue = useCallback((item: Omit<PendingSave, "queuedAt">) => {
    if (navigator.onLine) {
      fetch(`/api/projects/${item.projectId}/snapshots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          label: item.label,
          componentTree: item.componentTree,
          themeTokens: item.themeTokens,
        }),
      }).catch(() => {
        const q = loadQueue();
        q.push({ ...item, queuedAt: Date.now() });
        saveQueue(q);
        setPendingCount(q.length);
      });
    } else {
      const q = loadQueue();
      const existing = q.findIndex((i) => i.projectId === item.projectId && i.label === item.label);
      if (existing >= 0) {
        q[existing] = { ...item, queuedAt: Date.now() };
      } else {
        q.push({ ...item, queuedAt: Date.now() });
      }
      saveQueue(q);
      setPendingCount(q.length);
    }
  }, []);

  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true);
      flush();
    };
    const onOffline = () => setIsOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [flush]);

  return { isOnline, pendingCount, enqueue, flush };
}
