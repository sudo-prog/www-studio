import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@workspace/auth-web";
import { Code2, WandSparkles, LogOut, User, Blocks, Layers, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const [location] = useLocation();

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={cn(
        "text-sm transition-colors",
        location === href || location.startsWith(href + "/")
          ? "text-foreground font-medium"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </Link>
  );

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-14 items-center px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 mr-6 font-semibold tracking-tight shrink-0">
          <Code2 className="h-5 w-5 text-primary" />
          <span>WWW Studio</span>
        </Link>
        <div className="flex flex-1 items-center gap-5 text-sm">
          {navLink("/", "Gallery")}
          {navLink("/scenes", "Scenes")}
          {navLink("/scenes/gallery", "Scene Gallery")}
          {navLink("/gallery", "Projects")}
          {navLink("/ui-library", "Components")}
          {isAuthenticated && navLink("/projects", "My Projects")}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/gallery" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Gallery</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/editor/new" className="flex items-center gap-2">
              <WandSparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Create</span>
            </Link>
          </Button>
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {user ? [user.firstName, user.lastName].filter(Boolean).join(" ") || "Account" : "Account"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/ui-library">
                    <Blocks className="h-4 w-4 mr-2" />Component Library
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={loginWithGitHub}>Log in</Button>
          )}
        </div>
      </div>
    </nav>
  );
}
