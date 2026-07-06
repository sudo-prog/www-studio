import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@workspace/auth-web";
import { useGetProjects } from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Code2, FolderGit2, Github, Key, Lock } from "lucide-react";
import { useState } from "react";
import { setGitHubToken, hasGitHubToken } from "@/lib/github-storage";
import { useToast } from "@/hooks/use-toast";
import { PasswordLogin } from "@/components/PasswordLogin";

export default function Profile() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: projects = [] } = useGetProjects();
  const { toast } = useToast();
  const [ghToken, setGhToken] = useState(() => {
    try { return localStorage.getItem("github_token") || ""; } catch { return ""; }
  });
  const [showToken, setShowToken] = useState(false);

  if (authLoading) return <div className="min-h-screen bg-background" />;

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto w-full">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Log in to WWW Studio</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Enter the master password to access your profile and projects.
          </p>
          <div className="w-full">
            <PasswordLogin />
          </div>
        </main>
      </div>
    );
  }

  const publishedProjects = projects.filter(p => p.status === 'published');

  const handleSaveToken = () => {
    setGitHubToken(ghToken.trim());
    toast({ title: ghToken.trim() ? "GitHub token saved" : "GitHub token removed" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full">
        <div className="flex items-start gap-6 mb-12">
          <Avatar className="w-24 h-24 border-2 border-primary/20">
            <AvatarImage src={user.profileImageUrl || ""} alt={[user.firstName, user.lastName].filter(Boolean).join(" ") || "User"} />
            <AvatarFallback className="text-2xl">{user.firstName?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{[user.firstName, user.lastName].filter(Boolean).join(" ") || "User"}</h1>
            <p className="text-muted-foreground text-lg mb-4">@{user.id || "user"}</p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-sm">
                <FolderGit2 className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{projects.length}</span> Projects
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Code2 className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{publishedProjects.length}</span> Published
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold border-b pb-2">Settings</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Github className="h-4 w-4" />
                GitHub Backup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Connect a GitHub Personal Access Token to enable Save, Load, and Publish for Freeform pages.
                The token is stored locally in your browser.
              </p>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="ghp_..."
                  value={ghToken}
                  onChange={(e) => setGhToken(e.target.value)}
                  className="h-8 text-xs"
                />
                <Button size="sm" className="h-8 text-xs gap-1" onClick={handleSaveToken}>
                  <Key className="h-3 w-3" />
                  {hasGitHubToken() ? "Update" : "Save"}
                </Button>
              </div>
              {hasGitHubToken() && (
                <p className="text-[10px] text-green-400 flex items-center gap-1">
                  ✓ Token connected
                  <button
                    className="text-muted-foreground hover:text-foreground underline ml-2"
                    onClick={() => { setGhToken(""); handleSaveToken(); }}
                  >
                    Remove
                  </button>
                </p>
              )}
            </CardContent>
          </Card>

          <h2 className="text-xl font-semibold border-b pb-2">Published Clones</h2>
          {publishedProjects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
              You haven't published any projects yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publishedProjects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      Published on {new Date(project.updatedAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
