import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@workspace/auth-web";
import { useGetProjects } from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, FolderGit2 } from "lucide-react";

export default function Profile() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: projects = [] } = useGetProjects();

  if (authLoading) return <div className="min-h-screen bg-background" />;

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">Please log in to view your profile</h2>
        </main>
      </div>
    );
  }

  const publishedProjects = projects.filter(p => p.status === 'published');

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
