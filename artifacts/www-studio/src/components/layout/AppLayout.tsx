import { Navbar } from "@/components/layout/Navbar";
import { cn } from "@/lib/utils";

/**
 * AppLayout provides a consistent shell for every route:
 *  - `default` variant renders the global <Navbar/> (hamburger menu on mobile) so the
 *    user can always navigate home. Page content goes in a flex-1 region.
 *  - `bare` variant is for full-screen tools (editors, share/preview screens) that
 *    render their OWN header with a back control. We still wrap in an overflow-safe
 *    root so nothing can push past the viewport width.
 *
 * The root uses `overflow-x-hidden` so a wide toolbar on a 390px phone can never force
 * horizontal page scroll.
 */
export function AppLayout({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "bare";
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      {variant === "default" && <Navbar />}
      {variant === "bare" ? (
        <>{children}</>
      ) : (
        <div className={cn("flex-1 w-full min-w-0")}>{children}</div>
      )}
    </div>
  );
}
