import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCloneFromUrl } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { WandSparkles, Link as LinkIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function NewProject() {
  const [url, setUrl] = useState("");
  const cloneMutation = useCloneFromUrl();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleClone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    cloneMutation.mutate(
      { data: { url } },
      {
        onSuccess: (result) => {
          toast({ title: "Clone successful!" });
          setLocation(`/editor/${result.projectId}`);
        },
        onError: () => {
          toast({ title: "Failed to clone URL", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Create New Project</h1>
            <p className="text-muted-foreground">Clone an existing website or start from a template.</p>
          </div>

          <Card className="border-muted bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WandSparkles className="w-5 h-5 text-primary" />
                Clone from URL
              </CardTitle>
              <CardDescription>
                Paste any URL to generate an editable React + Tailwind codebase instantly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleClone} className="space-y-4">
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="pl-10 h-12 text-base"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-medium" 
                  disabled={cloneMutation.isPending || !url}
                >
                  {cloneMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Cloning...
                    </>
                  ) : (
                    "Generate Codebase"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
