import { useParams } from "wouter";
import {
  useGetProject,
  useSendChatMessage,
  useGenerateImage,
  usePublishProject,
  useListSnapshots,
  useCreateSnapshot,
  useRestoreSnapshot,
  getGetProjectQueryKey,
  getListSnapshotsQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Undo, Redo, Monitor, Tablet, Smartphone, Palette, Wand2, Send,
  ArrowLeft, Download, Globe, Copy, Check, X, Loader2, Image,
  Sparkles, ExternalLink, ChevronRight, ChevronDown, Save,
  History, Clock, RotateCcw, Wifi, WifiOff, Cloud, CloudOff,
} from "lucide-react";
import { Link } from "wouter";
import { useState, useRef, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useOfflineSync } from "@/hooks/use-offline-sync";

type DeviceMode = "desktop" | "tablet" | "mobile";
type RightPanel = "properties" | "images" | "history";

const DEVICE_WIDTHS: Record<DeviceMode, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return "just now";
}

function LayerItem({ name, depth, selected }: { name: string; depth: number; selected?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer font-mono text-xs transition-colors",
        selected ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground/70 hover:text-foreground"
      )}
      style={{ paddingLeft: `${8 + depth * 12}px` }}
    >
      <ChevronRight className="w-3 h-3 shrink-0 text-muted-foreground" />
      {name}
    </div>
  );
}

function PublishModal({ projectId, projectSlug, onClose }: { projectId: string; projectSlug: string; onClose: () => void }) {
  const publishMutation = usePublishProject();
  const [liveUrl, setLiveUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handlePublish = () => {
    publishMutation.mutate({ id: projectId }, {
      onSuccess: (result) => setLiveUrl(result.liveUrl),
      onError: () => toast({ title: "Publish failed", variant: "destructive" }),
    });
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border/50 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Globe className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-semibold text-lg">Publish Project</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>

        {!liveUrl ? (
          <>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Publishing makes your project live at a public URL. Your site will be rendered as HTML with Tailwind CSS.
            </p>
            <div className="bg-muted/30 rounded-lg p-3 mb-6 font-mono text-xs text-muted-foreground break-all">
              /api/s/{projectSlug}
            </div>
            <Button className="w-full h-11 gap-2" onClick={handlePublish} disabled={publishMutation.isPending}>
              {publishMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Publishing...</> : <><Globe className="w-4 h-4" />Publish Now</>}
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-green-500">Live</span>
            </div>
            <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-3 mb-4">
              <code className="flex-1 text-xs font-mono text-foreground break-all">{liveUrl}</code>
              <Button variant="ghost" size="icon" className="shrink-0 h-7 w-7" onClick={() => copy(liveUrl)}>
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-2" asChild>
                <a href={liveUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4" />Open Site</a>
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => copy(liveUrl)}>
                {copied ? "Copied!" : "Copy URL"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ExportButton({ projectId }: { projectId: string }) {
  return (
    <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open(`/api/projects/${projectId}/export`, "_blank")}>
      <Download className="w-4 h-4" /> Export HTML
    </Button>
  );
}

function AIImagesPanel({ projectId }: { projectId: string }) {
  const [imgPrompt, setImgPrompt] = useState("");
  const generateImage = useGenerateImage();
  const [images, setImages] = useState<Array<{ url: string; prompt: string }>>([]);
  const { toast } = useToast();

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imgPrompt.trim()) return;
    generateImage.mutate({ data: { prompt: imgPrompt } }, {
      onSuccess: (result) => {
        if (result.url) setImages((prev) => [{ url: result.url!, prompt: result.prompt }, ...prev]);
        setImgPrompt("");
      },
      onError: () => toast({ title: "Image generation failed", variant: "destructive" }),
    });
  };

  return (
    <div className="flex flex-col h-full">
      <form onSubmit={handleGenerate} className="p-3 border-b border-border/50 space-y-2">
        <Textarea value={imgPrompt} onChange={(e) => setImgPrompt(e.target.value)} placeholder="Describe an image to generate..." className="text-xs resize-none min-h-[60px]" />
        <Button type="submit" size="sm" className="w-full gap-1.5" disabled={generateImage.isPending || !imgPrompt.trim()}>
          {generateImage.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}Generate
        </Button>
      </form>
      <ScrollArea className="flex-1 p-3">
        {images.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground">
            <Image className="w-8 h-8 mx-auto mb-2 opacity-30" />
            Generated images appear here
          </div>
        ) : (
          <div className="space-y-3">
            {images.map((img, i) => (
              <div key={i} className="rounded-lg overflow-hidden border border-border/40 group relative">
                <img src={img.url} alt={img.prompt} className="w-full aspect-video object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="secondary" className="h-7 text-xs gap-1" onClick={() => navigator.clipboard.writeText(img.url)}>
                    <Copy className="w-3 h-3" />Copy URL
                  </Button>
                  <Button size="sm" variant="secondary" className="h-7 text-xs gap-1" asChild>
                    <a href={img.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3 h-3" />Open</a>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground truncate px-2 py-1">{img.prompt}</p>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

function HistoryPanel({ projectId, componentTree, themeTokens }: {
  projectId: string;
  componentTree?: string | null;
  themeTokens?: string | null;
}) {
  const { data: snapshots, isLoading } = useListSnapshots(projectId);
  const restoreMutation = useRestoreSnapshot();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const handleRestore = (snapshotId: string, label: string) => {
    setRestoringId(snapshotId);
    restoreMutation.mutate({ id: projectId, snapshotId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
        toast({ title: `Restored to "${label}"` });
        setRestoringId(null);
      },
      onError: () => {
        toast({ title: "Restore failed", variant: "destructive" });
        setRestoringId(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!snapshots || snapshots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
          <History className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">No saves yet</p>
          <p className="text-xs text-muted-foreground mt-1">Auto-saves appear here every 30 seconds while editing. Hit Save to capture a named version.</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-1">
        {snapshots.map((snap) => (
          <div
            key={snap.id}
            className="group flex items-start gap-2.5 rounded-lg px-2.5 py-2 hover:bg-muted/50 transition-colors"
          >
            <div className="shrink-0 mt-0.5">
              {snap.label === "Auto-save" ? (
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <Save className="w-3.5 h-3.5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{snap.label}</p>
              <p className="text-xs text-muted-foreground">{timeAgo(snap.createdAt)}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Restore this version"
              onClick={() => handleRestore(snap.id, snap.label)}
              disabled={restoringId === snap.id}
            >
              {restoringId === snap.id ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RotateCcw className="w-3 h-3" />
              )}
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

function CanvasPreview({ projectId, deviceMode }: { projectId: string; deviceMode: DeviceMode }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  return (
    <div className="flex-1 p-6 flex items-center justify-center overflow-auto bg-muted/10">
      <div
        className="bg-background border border-border/50 rounded-lg shadow-2xl shadow-black/30 overflow-hidden transition-all duration-300"
        style={{ width: DEVICE_WIDTHS[deviceMode], maxWidth: "100%", height: "calc(100vh - 200px)" }}
      >
        <iframe
          ref={iframeRef}
          src={`/api/projects/${projectId}/preview-html`}
          className="w-full h-full border-0"
          title="Project Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}

export default function Editor() {
  const { projectId } = useParams();
  const { data: project, isLoading: isProjectLoading } = useGetProject(projectId!, {
    query: { enabled: !!projectId, queryKey: getGetProjectQueryKey(projectId!) }
  });

  const [chatInput, setChatInput] = useState("");
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [rightPanel, setRightPanel] = useState<RightPanel>("properties");
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastAutoSaveRef = useRef<string | null>(null);

  const sendMessage = useSendChatMessage();
  const createSnapshot = useCreateSnapshot();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isOnline, pendingCount, enqueue } = useOfflineSync();

  const saveSnapshot = useCallback((label: string, silent = false) => {
    if (!projectId || !project) return;
    setIsSaving(true);
    enqueue({
      projectId,
      label,
      componentTree: project.componentTree ?? null,
      themeTokens: project.themeTokens ?? null,
    });
    setLastSaved(new Date());
    queryClient.invalidateQueries({ queryKey: getListSnapshotsQueryKey(projectId) });
    setTimeout(() => setIsSaving(false), 600);
    if (!silent) toast({ title: `Saved: "${label}"` });
  }, [projectId, project, enqueue, queryClient, toast]);

  // Auto-save every 30 seconds when the project changes
  useEffect(() => {
    if (!project) return;
    const currentTree = project.componentTree ?? "";
    if (lastAutoSaveRef.current === null) {
      lastAutoSaveRef.current = currentTree;
    }
    if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setInterval(() => {
      const nowTree = project.componentTree ?? "";
      if (nowTree !== lastAutoSaveRef.current) {
        lastAutoSaveRef.current = nowTree;
        saveSnapshot("Auto-save", true);
      }
    }, 30_000);
    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, [project, saveSnapshot]);

  const layers = (() => {
    if (!project?.componentTree) return [];
    try {
      const tree = JSON.parse(project.componentTree);
      const items: Array<{ name: string; depth: number }> = [];
      const walk = (node: any, depth: number) => {
        if (!node) return;
        items.push({ name: node.name || node.type || "node", depth });
        (node.children ?? []).slice(0, 8).forEach((c: any) => walk(c, depth + 1));
      };
      walk(tree, 0);
      return items.slice(0, 30);
    } catch { return [{ name: "Body", depth: 0 }]; }
  })();

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !projectId) return;
    sendMessage.mutate({ data: { message: chatInput, projectId } }, {
      onSuccess: () => {
        setChatInput("");
        queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId!) });
      },
    });
  };

  if (isProjectLoading || !project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const RIGHT_TABS: { id: RightPanel; icon: React.ReactNode; label: string }[] = [
    { id: "properties", icon: <ChevronDown className="w-3.5 h-3.5" />, label: "Properties" },
    { id: "images", icon: <Image className="w-3.5 h-3.5" />, label: "AI Images" },
    { id: "history", icon: <History className="w-3.5 h-3.5" />, label: "History" },
  ];

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      {showPublishModal && (
        <PublishModal
          projectId={project.id}
          projectSlug={project.slug}
          onClose={() => setShowPublishModal(false)}
        />
      )}

      {/* Top Toolbar */}
      <header className="h-14 border-b border-border/50 bg-card/50 backdrop-blur flex items-center justify-between px-4 shrink-0 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/projects"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <div className="font-medium text-sm truncate max-w-[180px]">{project.name}</div>
          {project.status === "published" && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 shrink-0">Live</span>
          )}
        </div>

        <div className="flex items-center gap-1 border border-border/50 rounded-md p-1 bg-background/50 shrink-0">
          {(["desktop", "tablet", "mobile"] as DeviceMode[]).map((mode) => (
            <Button
              key={mode}
              variant="ghost"
              size="icon"
              className={cn("w-8 h-8 rounded-sm", deviceMode === mode ? "bg-primary/15 text-primary" : "text-muted-foreground")}
              onClick={() => setDeviceMode(mode)}
            >
              {mode === "desktop" && <Monitor className="w-4 h-4" />}
              {mode === "tablet" && <Tablet className="w-4 h-4" />}
              {mode === "mobile" && <Smartphone className="w-4 h-4" />}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="icon" className="w-8 h-8"><Undo className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="w-8 h-8"><Redo className="w-4 h-4" /></Button>
          <div className="w-px h-5 bg-border mx-1" />

          {/* Online/sync status */}
          <div
            className={cn(
              "flex items-center gap-1.5 text-xs px-2 py-1 rounded-md",
              isOnline
                ? pendingCount > 0 ? "text-amber-500" : "text-muted-foreground"
                : "text-rose-500"
            )}
            title={!isOnline ? "Offline — saves queued locally" : pendingCount > 0 ? `${pendingCount} saves queued` : "All changes synced"}
          >
            {isOnline ? (
              pendingCount > 0 ? <Cloud className="w-3.5 h-3.5" /> : <Cloud className="w-3.5 h-3.5" />
            ) : (
              <CloudOff className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {!isOnline ? "Offline" : pendingCount > 0 ? `${pendingCount} queued` : lastSaved ? `Saved ${timeAgo(lastSaved.toISOString())}` : ""}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => saveSnapshot("Manual save")}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </Button>

          <Button variant="outline" size="sm" className="gap-2 hidden md:flex">
            <Palette className="w-4 h-4" /> Theme
          </Button>
          <ExportButton projectId={project.id} />
          <Button size="sm" className="gap-2" onClick={() => setShowPublishModal(true)}>
            <Globe className="w-4 h-4" /> Publish
          </Button>
        </div>
      </header>

      {/* Main Studio Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Layers */}
        <aside className="w-56 border-r border-border/50 bg-card/30 flex flex-col shrink-0">
          <div className="h-9 border-b border-border/50 flex items-center px-3 font-medium text-xs text-muted-foreground uppercase tracking-wider shrink-0">
            Layers
          </div>
          <ScrollArea className="flex-1 py-1">
            {layers.length > 0 ? (
              layers.map((layer, i) => <LayerItem key={i} name={layer.name} depth={layer.depth} selected={i === 0} />)
            ) : (
              <div className="text-xs text-muted-foreground text-center py-6 px-3">No layers yet</div>
            )}
          </ScrollArea>
        </aside>

        {/* Center Canvas */}
        <main className="flex-1 bg-muted/10 relative flex flex-col overflow-hidden">
          <CanvasPreview projectId={project.id} deviceMode={deviceMode} />

          {/* Bottom AI Chat Bar */}
          <div className="h-14 border-t border-border/50 bg-card/50 backdrop-blur flex items-center px-4 shrink-0 gap-3">
            <Wand2 className="w-4 h-4 text-primary shrink-0" />
            <form onSubmit={handleSendChat} className="flex-1 flex items-center gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask AI to modify the design..."
                className="flex-1 bg-transparent border-0 focus-visible:ring-0 shadow-none px-0 h-full text-sm"
              />
              <Button type="submit" size="icon" variant="ghost" className="h-8 w-8 shrink-0" disabled={!chatInput.trim() || sendMessage.isPending}>
                {sendMessage.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          </div>
        </main>

        {/* Right Inspector */}
        <aside className="w-64 border-l border-border/50 bg-card/30 flex flex-col shrink-0">
          {/* Panel Tabs */}
          <div className="flex border-b border-border/50 shrink-0">
            {RIGHT_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRightPanel(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1 h-9 text-xs font-medium transition-colors border-b-2",
                  rightPanel === tab.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {rightPanel === "properties" && (
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-5">
                <div className="space-y-2.5">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Layout</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1"><label className="text-xs text-muted-foreground">Width</label><Input className="h-8 text-xs font-mono" defaultValue="100%" /></div>
                    <div className="space-y-1"><label className="text-xs text-muted-foreground">Height</label><Input className="h-8 text-xs font-mono" defaultValue="auto" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1"><label className="text-xs text-muted-foreground">Padding X</label><Input className="h-8 text-xs font-mono" defaultValue="24px" /></div>
                    <div className="space-y-1"><label className="text-xs text-muted-foreground">Padding Y</label><Input className="h-8 text-xs font-mono" defaultValue="16px" /></div>
                  </div>
                </div>
                <div className="w-full h-px bg-border/50" />
                <div className="space-y-2.5">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Typography</h4>
                  <select className="w-full h-8 px-2 text-xs rounded-md border border-input bg-background text-foreground">
                    <option>Inter</option><option>JetBrains Mono</option><option>Geist</option><option>Satoshi</option>
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <Input className="h-8 text-xs font-mono" defaultValue="16px" />
                    <select className="w-full h-8 px-2 text-xs rounded-md border border-input bg-background text-foreground">
                      <option>Regular (400)</option><option>Medium (500)</option><option>Semibold (600)</option><option>Bold (700)</option>
                    </select>
                  </div>
                  <div className="space-y-1"><label className="text-xs text-muted-foreground">Line Height</label><Input className="h-8 text-xs font-mono" defaultValue="1.5" /></div>
                </div>
                <div className="w-full h-px bg-border/50" />
                <div className="space-y-2.5">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Colors</h4>
                  {[{ label: "Background", value: "#09090b" }, { label: "Foreground", value: "#fafafa" }, { label: "Primary", value: "#3b82f6" }].map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded border border-border/50 shrink-0" style={{ backgroundColor: value }} />
                      <span className="text-xs flex-1">{label}</span>
                      <span className="text-xs font-mono text-muted-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}

          {rightPanel === "images" && <AIImagesPanel projectId={project.id} />}

          {rightPanel === "history" && (
            <HistoryPanel
              projectId={project.id}
              componentTree={project.componentTree}
              themeTokens={project.themeTokens}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
