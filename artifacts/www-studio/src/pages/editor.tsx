import { useParams } from "wouter";
import { useGetProject, useGetChatHistory, useSendChatMessage, getGetProjectQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Undo, Redo, Monitor, Tablet, Smartphone, Palette, Wand2, Send, Save, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQueryClient } from "@tanstack/react-query";

export default function Editor() {
  const { projectId } = useParams();
  const { data: project, isLoading: isProjectLoading } = useGetProject(projectId!, {
    query: { enabled: !!projectId, queryKey: getGetProjectQueryKey(projectId!) }
  });
  
  const [chatInput, setChatInput] = useState("");
  const sendMessage = useSendChatMessage();

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !projectId) return;

    sendMessage.mutate({
      data: { message: chatInput, projectId }
    }, {
      onSuccess: () => setChatInput("")
    });
  };

  if (isProjectLoading || !project) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading editor...</div>;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Top Toolbar */}
      <header className="h-14 border-b border-border/50 bg-card/50 backdrop-blur flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/projects"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <div className="font-medium text-sm">{project.name}</div>
        </div>
        
        <div className="flex items-center gap-1 border border-border/50 rounded-md p-1 bg-background/50">
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-sm"><Monitor className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-sm text-muted-foreground"><Tablet className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-sm text-muted-foreground"><Smartphone className="w-4 h-4" /></Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon"><Undo className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon"><Redo className="w-4 h-4" /></Button>
          <div className="w-px h-6 bg-border mx-2" />
          <Button variant="outline" size="sm" className="gap-2"><Palette className="w-4 h-4" /> Theme</Button>
          <Button variant="outline" size="sm" className="gap-2"><Wand2 className="w-4 h-4" /> Variants</Button>
          <Button size="sm" className="gap-2"><Save className="w-4 h-4" /> Publish</Button>
        </div>
      </header>

      {/* Main Studio Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Layers/Tree */}
        <aside className="w-64 border-r border-border/50 bg-card/30 flex flex-col shrink-0">
          <div className="h-10 border-b border-border/50 flex items-center px-4 font-medium text-xs text-muted-foreground uppercase tracking-wider">
            Layers
          </div>
          <ScrollArea className="flex-1 p-2">
            <div className="text-sm space-y-1">
              {/* Dummy tree for now */}
              <div className="px-2 py-1.5 rounded bg-primary/10 text-primary font-mono text-xs">Body</div>
              <div className="px-2 py-1.5 rounded hover:bg-muted font-mono text-xs pl-6">Header</div>
              <div className="px-2 py-1.5 rounded hover:bg-muted font-mono text-xs pl-6">Main</div>
              <div className="px-2 py-1.5 rounded hover:bg-muted font-mono text-xs pl-10">HeroSection</div>
              <div className="px-2 py-1.5 rounded hover:bg-muted font-mono text-xs pl-6">Footer</div>
            </div>
          </ScrollArea>
        </aside>

        {/* Center Canvas */}
        <main className="flex-1 bg-muted/20 relative flex flex-col overflow-hidden">
          <div className="flex-1 p-8 flex items-center justify-center overflow-auto">
            <div className="w-full max-w-4xl h-full min-h-[600px] bg-background border border-border/50 rounded-lg shadow-xl shadow-black/20 overflow-hidden flex items-center justify-center">
              <span className="text-muted-foreground">Canvas Preview Area</span>
            </div>
          </div>
          
          {/* Bottom AI Chat Bar */}
          <div className="h-16 border-t border-border/50 bg-card/50 backdrop-blur flex items-center px-4 shrink-0">
            <form onSubmit={handleSendChat} className="flex-1 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary shrink-0" />
              <Input 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask AI to modify the design..." 
                className="flex-1 bg-transparent border-0 focus-visible:ring-0 shadow-none px-2 h-full text-base"
              />
              <Button type="submit" size="icon" variant="ghost" disabled={!chatInput.trim() || sendMessage.isPending}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </main>

        {/* Right Inspector */}
        <aside className="w-72 border-l border-border/50 bg-card/30 flex flex-col shrink-0">
          <div className="h-10 border-b border-border/50 flex items-center px-4 font-medium text-xs text-muted-foreground uppercase tracking-wider">
            Properties
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Layout</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Width</label>
                    <Input className="h-8 text-xs font-mono" defaultValue="100%" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Height</label>
                    <Input className="h-8 text-xs font-mono" defaultValue="auto" />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Typography</h4>
                <div className="space-y-2">
                  <select className="w-full h-8 px-2 text-xs rounded-md border border-input bg-background">
                    <option>Inter</option>
                    <option>JetBrains Mono</option>
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <Input className="h-8 text-xs font-mono" defaultValue="16px" />
                    <select className="w-full h-8 px-2 text-xs rounded-md border border-input bg-background">
                      <option>Normal (400)</option>
                      <option>Medium (500)</option>
                      <option>Bold (700)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </aside>
      </div>
    </div>
  );
}
