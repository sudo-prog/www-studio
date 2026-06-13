import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { History, Save, RotateCcw, Plus, Trash2 } from "lucide-react";
import { type SceneData } from "@/lib/scene-types";
import { cn } from "@/lib/utils";

interface Checkpoint {
  id:        string;
  name:      string;
  createdAt: string;
  elementCount: number;
  scene:     SceneData;
}

function storageKey(sceneId: string) {
  return `www-studio:checkpoints:${sceneId}`;
}

function loadCheckpoints(sceneId: string): Checkpoint[] {
  try {
    const raw = localStorage.getItem(storageKey(sceneId));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveCheckpoints(sceneId: string, cps: Checkpoint[]) {
  localStorage.setItem(storageKey(sceneId), JSON.stringify(cps.slice(-20)));
}

interface Props {
  scene:     SceneData;
  onRestore: (scene: SceneData) => void;
}

export function VersionHistory({ scene, onRestore }: Props) {
  const { toast } = useToast();
  const [cps, setCps]       = useState<Checkpoint[]>([]);
  const [nameInput, setNameInput] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setCps(loadCheckpoints(scene.id));
  }, [scene.id]);

  function createCheckpoint(name: string) {
    const cp: Checkpoint = {
      id:           crypto.randomUUID(),
      name:         name || `Checkpoint ${cps.length + 1}`,
      createdAt:    new Date().toISOString(),
      elementCount: scene.elements.length,
      scene:        JSON.parse(JSON.stringify(scene)),
    };
    const updated = [...cps, cp];
    setCps(updated);
    saveCheckpoints(scene.id, updated);
    setAdding(false);
    setNameInput("");
    toast({ title: "Checkpoint saved!" });
  }

  function removeCheckpoint(id: string) {
    const updated = cps.filter(cp => cp.id !== id);
    setCps(updated);
    saveCheckpoints(scene.id, updated);
  }

  function restore(cp: Checkpoint) {
    onRestore(cp.scene);
    toast({ title: `Restored: ${cp.name}` });
  }

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " · " + d.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <History className="h-3.5 w-3.5" />
          <span>{cps.length} checkpoint{cps.length !== 1 ? "s" : ""}</span>
        </div>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => setAdding(v => !v)}>
          <Plus className="h-3 w-3" />Save Point
        </Button>
      </div>

      {adding && (
        <div className="flex gap-2">
          <input
            autoFocus
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") createCheckpoint(nameInput); if (e.key === "Escape") setAdding(false); }}
            placeholder={`Checkpoint ${cps.length + 1}`}
            className="flex-1 h-7 text-xs bg-muted border border-border rounded-md px-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button size="sm" className="h-7 text-xs gap-1 px-2" onClick={() => createCheckpoint(nameInput)}>
            <Save className="h-3 w-3" />Save
          </Button>
        </div>
      )}

      {cps.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <History className="h-10 w-10 mx-auto mb-2 opacity-20" />
          <p className="text-xs">No checkpoints yet</p>
          <p className="text-[10px] mt-1">Save the current state as a restore point</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {[...cps].reverse().map((cp) => (
            <div
              key={cp.id}
              className={cn(
                "group flex items-center gap-2 px-2.5 py-2 rounded-lg border border-border hover:border-primary/30 transition-colors",
                "bg-card hover:bg-primary/5"
              )}
            >
              <div className="w-2 h-2 rounded-full bg-primary/60 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{cp.name}</p>
                <p className="text-[10px] text-muted-foreground">{formatTime(cp.createdAt)} · {cp.elementCount} elements</p>
              </div>
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => restore(cp)}
                  title="Restore this checkpoint"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 hover:text-destructive"
                  onClick={() => removeCheckpoint(cp.id)}
                  title="Delete checkpoint"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[9px] text-muted-foreground text-center">
        Checkpoints are stored in your browser · max 20
      </p>
    </div>
  );
}
