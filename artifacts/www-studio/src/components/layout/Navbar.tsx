import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@workspace/auth-web";
import { Code2, WandSparkles, LogOut, User, Blocks, Layers, Globe, Sun, Moon, Menu, X, PenLine, Github } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { useState } from "react";

export function Navbar() {
  const { user, isAuthenticated, logout, githubAvailable, loginWithGitHub } = useAuth();
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/scenes", label: "Scenes" },
    { href: "/scenes/gallery", label: "Scene Gallery" },
    { href: "/gallery", label: "Gallery" },
    { href: "/ui-library", label: "Components" },
    { href: "/design-extract", label: "Design Extract" },
    { href: "/freeform", label: "Freeform" },
    ...(isAuthenticated ? [{ href: "/projects", label: "My Projects" }] : []),
  ];

  const NavLink = ({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) => (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "text-sm transition-colors block w-full py-2",
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
      <div className="flex h-14 items-center px-4 md:px-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 mr-4 md:mr-6 font-semibold tracking-tight shrink-0">
          <Code2 className="h-5 w-5 text-primary" />
          <span>WWW Studio</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex flex-1 items-center gap-5 text-sm">
          {navLinks.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </div>

        <div className="flex flex-1 lg:flex-none items-center justify-end gap-1.5 md:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:h-8 md:w-8"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="sm" className="hidden md:inline-flex" asChild>
            <Link href="/gallery" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Gallery</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex px-3" asChild>
            <Link href="/editor/new" className="flex items-center gap-2">
              <WandSparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Create</span>
            </Link>
          </Button>

          {/* Mobile login entry — visible on mobile/tablet so password login is reachable without the menu */}
          {!isAuthenticated && (
            <Button
              size="sm"
              className="lg:hidden"
              onClick={() => { window.location.href = "/profile"; }}
            >
              Log in
            </Button>
          )}

          {/* Mobile menu trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-9 w-9"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 p-0" showClose={false}>
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between px-4 h-14 border-b border-border/50">
                  <span className="font-semibold text-sm">Menu</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close menu"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.href}
                      href={link.href}
                      label={link.label}
                      onClick={() => setMobileOpen(false)}
                    />
                  ))}
                  {!isAuthenticated && (
                    <div className="pt-3 border-t border-border/50 mt-3 space-y-2">
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => { window.location.href = "/profile"; setMobileOpen(false); }}
                      >
                        Log in
                      </Button>
                      {githubAvailable && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full gap-1.5"
                          onClick={() => { loginWithGitHub(); setMobileOpen(false); }}
                        >
                          <Github className="h-4 w-4" />
                          Log in with GitHub
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Auth actions - desktop only */}
          <div className="hidden lg:flex items-center gap-2">
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
              <Button size="sm" className="hidden sm:inline-flex" onClick={() => { window.location.href = "/profile"; }}>Log in</Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
