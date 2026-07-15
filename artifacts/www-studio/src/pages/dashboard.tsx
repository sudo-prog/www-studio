import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useGetProjects, useDeleteProject, getGetProjectsQueryKey, useGetScenes } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Plus, MoreVertical, Trash2, Clock, Play, Globe, Layers, Download, BarChart3, FolderOpen, Sparkles, Zap, ArrowRight, PenLine } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@workspace/auth-web";
import { AiChatWidget } from "@/components/AiChatWidget";

export default function Dashboard() {
  const { data: projects = [], isLoading } = useGetProjects();
  const { data: scenes = [] } = useGetScenes();
  const deleteProject = useDeleteProject();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const publishedCount = (projects as any[]).filter((p: any) => p.status === "published").length;
  const scenesCount = (scenes as any[]).length;
  const publishedScenes = (scenes as any[]).filter((s: any) => s.status === "published").length;

  const handleDelete = (id: string) => {
    deleteProject.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProjectsQueryKey() });
        toast({ title: "Project deleted" });
      },
    });
  };

  if (authLoading) return <div className="min-h-screen bg-background" />;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">Please log in to view your projects</h2>
        </main>
      </div>
    );
  }

  function downloadProjectHtml(projectId: string, projectName: string) {
    const url = `/api/projects/${projectId}/export`;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, "-")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { icon: <FolderOpen className="h-4 w-4" />, label: "Projects", value: (projects as any[]).length, color: "text-blue-400" },
            { icon: <Globe className="h-4 w-4" />,       label: "Published", value: publishedCount,              color: "text-green-400" },
            { icon: <Layers className="h-4 w-4" />,      label: "Scenes",    value: scenesCount,                  color: "text-purple-400" },
            { icon: <BarChart3 className="h-4 w-4" />,   label: "Live Scenes", value: publishedScenes,           color: "text-orange-400" },
          ].map(({ icon, label, value, color }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className={`${color} shrink-0`}>{icon}</div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Scenes strip */}
        {(scenes as any[]).length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-purple-400" />Recent Scenes
              </h2>
              <Link href="/scenes" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(scenes as any[]).slice(0, 4).map((scene: any) => {
                let elements: any[] = [];
                try { elements = JSON.parse(scene.elements ?? "[]"); } catch {}
                const colors = elements.slice(0, 4).map((e: any) => e.fill).filter(Boolean);
                return (
                  <Link key={scene.id} href={`/scenes/${scene.id}`}>
                    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-colors group cursor-pointer">
                      <div
                        className="h-16 relative"
                        style={colors.length ? {
                          background: `linear-gradient(135deg, ${colors.join(",")})`
                        } : { background: "hsl(var(--muted))" }}
                      >
                        {scene.status === "published" && (
                          <span className="absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">Live</span>
                        )}
                      </div>
                      <div className="px-2.5 py-2">
                        <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{scene.name}</p>
                        <p className="text-[10px] text-muted-foreground">{elements.length} elements</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { icon: <Plus className="h-4 w-4" />,       label: "New Project",       sub: "Blank canvas",           href: "/editor/new",        color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
            { icon: <Zap className="h-4 w-4" />,         label: "AI Scene",          sub: "Generate with AI",       href: "/scenes",            color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
            { icon: <Globe className="h-4 w-4" />,       label: "Public Gallery",    sub: "Browse community",       href: "/scenes/gallery",    color: "bg-green-500/10 text-green-400 border-green-500/20" },
            { icon: <PenLine className="h-4 w-4" />,     label: "Freeform Canvas",   sub: "Visual editor",          href: "/freeform",          color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
          ].map(({ icon, label, sub, href, color }) => (
            <Link key={label} href={href}>
              <div className={`border rounded-xl p-4 hover:opacity-90 transition-all cursor-pointer h-full ${color}`}>
                <div className="mb-2">{icon}</div>
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs opacity-70">{sub}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
            <p className="text-muted-foreground mt-1">
              {(projects as any[]).length} project{(projects as any[]).length !== 1 ? "s" : ""} — manage and edit your websites.
            </p>
          </div>
          <Button asChild>
            <Link href="/editor/new" className="gap-2">
              <Plus className="h-4 w-4" />New Project
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border rounded-xl border-dashed border-border/50">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground max-w-sm mb-6 text-sm">
              Create your first project by cloning a website, generating from a prompt, or converting a screenshot.
            </p>
            <Button asChild>
              <Link href="/editor/new">Create Project</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="overflow-hidden group hover:border-primary/50 transition-colors flex flex-col">
                <div className="aspect-video bg-muted relative overflow-hidden flex-shrink-0">
                  {project.thumbnailUrl ? (
                    <img src={project.thumbnailUrl} alt={project.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">No Preview</div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button variant="secondary" size="sm" asChild>
                      <Link href={`/editor/${project.id}`}>
                        <Play className="w-4 h-4 mr-2" />Open Editor
                      </Link>
                    </Button>
                  </div>
                  {project.status === "published" && (
                    <div className="absolute top-2 left-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                        <Globe className="w-2.5 h-2.5" />Live
                      </span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate mb-1" title={project.name}>{project.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/editor/${project.id}`}>
                            <Play className="w-4 h-4 mr-2" />Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => downloadProjectHtml(project.id, project.name)}>
                          <Download className="w-4 h-4 mr-2" />Download HTML
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(project.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 text-xs text-muted-foreground flex justify-between">
                  <span className="capitalize">{project.status}</span>
                  {project.slug && <span className="font-mono truncate max-w-[80px]">/{project.slug}</span>}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
      <AiChatWidget context="my projects dashboard" onNavigate={setLocation} />
    </div>
  );
}
