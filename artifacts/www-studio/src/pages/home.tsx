import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useGetGalleryTemplates } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Heart, Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Home() {
  const { data: templates = [], isLoading } = useGetGalleryTemplates();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-4 py-24 md:py-32 flex flex-col items-center text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Clone any website. <span className="text-primary">Edit like magic.</span> Own the code.
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
            WWW Studio is the visual UI builder for developers. Paste a URL, get an editable React + Tailwind codebase, and reshape it instantly.
          </p>
          <div className="flex items-center gap-4">
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link href="/editor/new">Start Building</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base">
              Browse Gallery
            </Button>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="px-4 md:px-6 pb-24 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">Community Templates</h2>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search templates..." className="pl-9" />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-[300px] rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="overflow-hidden group border-muted bg-card hover:border-primary/50 transition-colors">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {template.thumbnailUrl ? (
                      <img src={template.thumbnailUrl} alt={template.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        No Preview
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="secondary" size="sm" asChild>
                        <Link href={`/editor/new?templateId=${template.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          Fork Template
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-1 mb-1">{template.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3">by {template.creator}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.tags?.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between items-center text-xs text-muted-foreground">
                    <span className="capitalize">{template.style}</span>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{template.likes}</span>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
