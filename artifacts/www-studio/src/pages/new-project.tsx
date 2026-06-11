import { useState, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCloneFromUrl, useGenerateFromPrompt, useScreenshotToCode } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { WandSparkles, Link as LinkIcon, Loader2, Sparkles, ImageUp, Upload, X, Figma } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Tab = "clone" | "generate" | "screenshot" | "figma";

const PROMPT_EXAMPLES = [
  "A dark SaaS landing page for a project management tool with pricing and testimonials",
  "A minimal portfolio site for a freelance designer with glassmorphism style",
  "A bold startup landing page with neon accents and a waitlist signup",
  "A corporate enterprise software site with clean white design and feature grid",
];

export default function NewProject() {
  const [activeTab, setActiveTab] = useState<Tab>("clone");
  const [url, setUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{ base64: string; mimeType: string; filename: string } | null>(null);
  const [figmaDragOver, setFigmaDragOver] = useState(false);
  const [figmaJson, setFigmaJson] = useState<string | null>(null);
  const [figmaFilename, setFigmaFilename] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const figmaInputRef = useRef<HTMLInputElement>(null);

  const cloneMutation = useCloneFromUrl();
  const generateMutation = useGenerateFromPrompt();
  const screenshotMutation = useScreenshotToCode();

  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleClone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    cloneMutation.mutate({ data: { url } }, {
      onSuccess: (result) => { toast({ title: "Site cloned!" }); setLocation(`/editor/${result.projectId}`); },
      onError: () => toast({ title: "Failed to clone URL", variant: "destructive" }),
    });
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    generateMutation.mutate({ data: { prompt } }, {
      onSuccess: (result) => { toast({ title: "Site generated!" }); setLocation(`/editor/${result.projectId}`); },
      onError: () => toast({ title: "Generation failed", variant: "destructive" }),
    });
  };

  const handleScreenshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageData) return;
    screenshotMutation.mutate({ data: { image: imageData.base64, mimeType: imageData.mimeType, filename: imageData.filename } }, {
      onSuccess: (result) => { toast({ title: "Screenshot converted!" }); setLocation(`/editor/${result.projectId}`); },
      onError: () => toast({ title: "Conversion failed", variant: "destructive" }),
    });
  };

  const handleFigmaImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!figmaJson) return;
    try {
      const parsed = JSON.parse(figmaJson);
      const name = parsed?.name || figmaFilename?.replace(".json", "") || "Figma Import";
      toast({ title: `Importing "${name}"…`, description: "Figma JSON parsed. Generating project…" });
      generateMutation.mutate({ data: { prompt: `Convert this Figma design named "${name}" to a landing page with the same structure and layout. Use dark background, modern typography.` } }, {
        onSuccess: (result) => { toast({ title: "Figma import complete!" }); setLocation(`/editor/${result.projectId}`); },
        onError: () => toast({ title: "Import failed", variant: "destructive" }),
      });
    } catch {
      toast({ title: "Invalid JSON file", variant: "destructive" });
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) { toast({ title: "Please upload an image file", variant: "destructive" }); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImagePreview(dataUrl);
      setImageData({ base64: dataUrl.split(",")[1], mimeType: file.type, filename: file.name });
    };
    reader.readAsDataURL(file);
  };

  const processFigmaFile = (file: File) => {
    if (!file.name.endsWith(".json") && file.type !== "application/json") { toast({ title: "Please upload a Figma JSON export", variant: "destructive" }); return; }
    setFigmaFilename(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setFigmaJson(ev.target?.result as string);
    reader.readAsText(file);
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: "clone", label: "Clone URL", icon: <LinkIcon className="w-4 h-4" />, desc: "Paste any website URL" },
    { id: "generate", label: "Generate", icon: <Sparkles className="w-4 h-4" />, desc: "Describe your vision" },
    { id: "screenshot", label: "Screenshot", icon: <ImageUp className="w-4 h-4" />, desc: "Upload a design image" },
    { id: "figma", label: "Figma", icon: <Figma className="w-4 h-4" />, desc: "Import Figma JSON" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-start justify-center p-6 pt-12">
        <div className="w-full max-w-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">New Project</h1>
            <p className="text-muted-foreground">Clone a site, generate from a prompt, convert a screenshot, or import from Figma.</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-xl border border-border/50 bg-card/30 p-1 mb-6 gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg text-xs font-medium transition-all",
                  activeTab === tab.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {tab.icon}
                <span className="hidden sm:block">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Clone URL */}
          {activeTab === "clone" && (
            <Card className="border-muted bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><WandSparkles className="w-5 h-5 text-primary" />Clone from URL</CardTitle>
                <CardDescription>Paste any URL to generate an editable React + Tailwind codebase instantly.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleClone} className="space-y-4">
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input type="url" placeholder="https://stripe.com" value={url} onChange={(e) => setUrl(e.target.value)} className="pl-10 h-12 text-base" required />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["stripe.com", "linear.app", "vercel.com", "apple.com"].map((u) => (
                      <button key={u} type="button" onClick={() => setUrl(`https://${u}`)} className="text-xs px-3 py-1 rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors">{u}</button>
                    ))}
                  </div>
                  <Button type="submit" className="w-full h-12 text-base font-medium" disabled={cloneMutation.isPending || !url}>
                    {cloneMutation.isPending ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Cloning...</> : "Clone Site"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Generate */}
          {activeTab === "generate" && (
            <Card className="border-muted bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" />Generate from Prompt</CardTitle>
                <CardDescription>Describe your website idea and AI will generate a full landing page.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerate} className="space-y-4">
                  <Textarea placeholder="A dark SaaS landing page for a project management tool..." value={prompt} onChange={(e) => setPrompt(e.target.value)} className="min-h-[120px] text-base resize-none" required />
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Examples</p>
                    <div className="space-y-1.5">
                      {PROMPT_EXAMPLES.map((ex) => (
                        <button key={ex} type="button" onClick={() => setPrompt(ex)} className="w-full text-left text-xs px-3 py-2 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all">{ex}</button>
                      ))}
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 text-base font-medium" disabled={generateMutation.isPending || !prompt.trim()}>
                    {generateMutation.isPending ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Generating...</> : <><Sparkles className="mr-2 h-5 w-5" />Generate Site</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Screenshot */}
          {activeTab === "screenshot" && (
            <Card className="border-muted bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ImageUp className="w-5 h-5 text-primary" />Screenshot to Code</CardTitle>
                <CardDescription>Upload any UI screenshot or design mockup — AI converts it to Tailwind HTML.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleScreenshot} className="space-y-4">
                  {!imagePreview ? (
                    <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }} onClick={() => fileInputRef.current?.click()} className={cn("border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all", dragOver ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50 hover:bg-muted/30")}>
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center"><Upload className="w-6 h-6 text-muted-foreground" /></div>
                      <div className="text-center"><p className="text-sm font-medium">Drop an image here</p><p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP up to 10MB</p></div>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border border-border/50">
                      <img src={imagePreview} alt="Preview" className="w-full max-h-64 object-cover" />
                      <button type="button" onClick={() => { setImagePreview(null); setImageData(null); }} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"><X className="w-4 h-4" /></button>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
                  <Button type="submit" className="w-full h-12 text-base font-medium" disabled={screenshotMutation.isPending || !imageData}>
                    {screenshotMutation.isPending ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Converting...</> : <><ImageUp className="mr-2 h-5 w-5" />Convert to Code</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Figma Import */}
          {activeTab === "figma" && (
            <Card className="border-muted bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Figma className="w-5 h-5 text-primary" />Figma Import</CardTitle>
                <CardDescription>Export your Figma file as JSON and upload it here to convert to React + Tailwind code.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFigmaImport} className="space-y-4">
                  {!figmaJson ? (
                    <div onDragOver={(e) => { e.preventDefault(); setFigmaDragOver(true); }} onDragLeave={() => setFigmaDragOver(false)} onDrop={(e) => { e.preventDefault(); setFigmaDragOver(false); const f = e.dataTransfer.files[0]; if (f) processFigmaFile(f); }} onClick={() => figmaInputRef.current?.click()} className={cn("border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all", figmaDragOver ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50 hover:bg-muted/30")}>
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center"><Figma className="w-6 h-6 text-muted-foreground" /></div>
                      <div className="text-center"><p className="text-sm font-medium">Drop Figma JSON export here</p><p className="text-xs text-muted-foreground mt-1">From Figma: Plugins → Export → JSON</p></div>
                    </div>
                  ) : (
                    <div className="relative rounded-xl border border-border/50 bg-muted/20 p-4 flex items-center gap-3">
                      <Figma className="w-8 h-8 text-primary shrink-0" />
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{figmaFilename}</p><p className="text-xs text-muted-foreground">{(figmaJson.length / 1024).toFixed(1)} KB parsed</p></div>
                      <button type="button" onClick={() => { setFigmaJson(null); setFigmaFilename(null); }} className="w-8 h-8 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors shrink-0"><X className="w-4 h-4" /></button>
                    </div>
                  )}
                  <input ref={figmaInputRef} type="file" accept=".json,application/json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFigmaFile(f); }} />
                  <div className="rounded-lg bg-muted/30 border border-border/40 p-3 text-xs text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">How to export from Figma:</p>
                    <p>1. Open your Figma file</p>
                    <p>2. Main menu → Plugins → <span className="text-primary">Figma to JSON</span> (or any JSON exporter)</p>
                    <p>3. Download the .json file and upload it here</p>
                  </div>
                  <Button type="submit" className="w-full h-12 text-base font-medium" disabled={generateMutation.isPending || !figmaJson}>
                    {generateMutation.isPending ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Importing...</> : <><Figma className="mr-2 h-5 w-5" />Import Figma Design</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
