import { useState, useCallback } from "react";

export interface ProjectAsset {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  addedAt: number;
}

const STORAGE_KEY = (projectId: string) => `www-studio:assets:${projectId}`;

function load(projectId: string): ProjectAsset[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY(projectId)) ?? "[]");
  } catch {
    return [];
  }
}

function save(projectId: string, assets: ProjectAsset[]) {
  localStorage.setItem(STORAGE_KEY(projectId), JSON.stringify(assets));
}

export function useProjectAssets(projectId: string) {
  const [assets, setAssets] = useState<ProjectAsset[]>(() => load(projectId));

  const addAsset = useCallback(
    (file: File): Promise<ProjectAsset> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result as string;
          const asset: ProjectAsset = {
            id: crypto.randomUUID(),
            name: file.name,
            url,
            size: file.size,
            type: file.type,
            addedAt: Date.now(),
          };
          setAssets((prev) => {
            const next = [asset, ...prev];
            save(projectId, next);
            return next;
          });
          resolve(asset);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },
    [projectId]
  );

  const removeAsset = useCallback(
    (id: string) => {
      setAssets((prev) => {
        const next = prev.filter((a) => a.id !== id);
        save(projectId, next);
        return next;
      });
    },
    [projectId]
  );

  return { assets, addAsset, removeAsset };
}
