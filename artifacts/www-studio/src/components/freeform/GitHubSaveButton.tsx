import { useState } from "react";
import { FreeformPage } from "@/lib/freeform-types";
import { saveFreeformProject, listProjects, loadProject, backupToFreeformPage, hasGitHubToken, FreeformBackup } from "@/lib/github-storage";
import { Button } from "@/components/ui/button";
import {
  Github,
  Loader2,
  Check,
  AlertCircle,
  CloudOff,
  FolderOpen,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface Props {
  page: FreeformPage;
  onLoad?: (page: FreeformPage) => void;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function GitHubSaveButton({ page, onLoad }: Props) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [backups, setBackups] = useState<FreeformBackup[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!hasGitHubToken()) {
      toast({ title: "Connect GitHub first", description: "Add a GitHub token in your Profile to enable Save/Load.", variant: "destructive" });
      return;
    }
    setStatus("saving");
    try {
      const backup: FreeformBackup = {
        id: page.id,
        name: page.name,
        userId: page.userId,
        elements: JSON.stringify(page.elements),
        background: JSON.stringify(page.background),
        canvasWidth: page.canvasWidth,
        canvasHeight: page.canvasHeight,
        status: page.status,
        slug: page.slug,
        savedAt: new Date().toISOString(),
      };
      await saveFreeformProject(backup);
      setStatus("saved");
      toast({ title: "Saved to GitHub!" });
      setTimeout(() => setStatus("idle"), 3000);
    } catch (e: any) {
      setStatus("error");
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  const handleLoadBackups = async () => {
    if (!hasGitHubToken()) {
      toast({ title: "Connect GitHub first", description: "Add a GitHub token in your Profile to load backups.", variant: "destructive" });
      return;
    }
    setShowLoadModal(true);
    setLoadingBackups(true);
    try {
      const items = await listProjects();
      const freeformItems = items.filter((item) => "elements" in item) as FreeformBackup[];
      setBackups(freeformItems);
    } catch (e: any) {
      toast({ title: "Could not load backups", description: e.message, variant: "destructive" });
    } finally {
      setLoadingBackups(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 relative"
          onClick={handleSave}
          disabled={status === "saving"}
          title="Save to GitHub"
        >
          {status === "saving" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : status === "saved" ? (
            <Check className="w-3.5 h-3.5 text-green-400" />
          ) : status === "error" ? (
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
          ) : (
            <Github className="w-3.5 h-3.5" />
          )}
        </Button>
        {status === "saving" && (
          <span className="text-[9px] text-muted-foreground">Saving…</span>
        )}
        {status === "saved" && (
          <span className="text-[9px] text-green-400">Saved</span>
        )}
        {status === "error" && (
          <span className="text-[9px] text-red-400">Error</span>
        )}
      </div>

      {/* Load from GitHub modal */}
      <Dialog open={showLoadModal} onOpenChange={setShowLoadModal}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={handleLoadBackups}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Load
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Github className="w-4 h-4" />
              Load from GitHub
            </DialogTitle>
            <DialogDescription>
              Restore a previous freeform backup from GitHub.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-64">
            {loadingBackups ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : backups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CloudOff className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No backups found on GitHub.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {backups.map((backup) => (
                  <button
                    key={backup.id}
                    className="w-full text-left p-3 rounded-lg border border-border/40 hover:border-primary/40 hover:bg-muted/30 transition-colors"
                    onClick={async () => {
                      try {
                        const entry = await loadProject(backup.id);
                        if (entry && "elements" in entry && onLoad) {
                          onLoad(backupToFreeformPage(entry));
                          toast({ title: `Loaded "${entry.name}"` });
                        } else {
                          toast({ title: "Backup not found", variant: "destructive" });
                        }
                      } catch (e: any) {
                        toast({ title: "Load failed", description: e.message, variant: "destructive" });
                      }
                      setShowLoadModal(false);
                    }}
                  >
                    <p className="text-xs font-medium">{backup.id.slice(0, 8)}…</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {backup.savedAt ? new Date(backup.savedAt).toLocaleString() : "Unknown date"}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default GitHubSaveButton;
