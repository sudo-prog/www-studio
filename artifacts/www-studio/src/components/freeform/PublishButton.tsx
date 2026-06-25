import { useState } from "react";
import { FreeformPage } from "@/lib/freeform-types";
import { publishToGitHubPages } from "@/lib/github-storage";
import { exportFreeformToHTML } from "@/lib/freeformStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Globe,
  Loader2,
  Check,
  AlertCircle,
  Link,
  Settings,
  Copy,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Props {
  page: FreeformPage;
  onPublish?: (url: string) => void;
}

type PublishStatus = "idle" | "publishing" | "published" | "error";

export function PublishButton({ page, onPublish }: Props) {
  const [status, setStatus] = useState<PublishStatus>("idle");
  const [url, setUrl] = useState<string>("");
  const [customDomain, setCustomDomain] = useState(page.customDomain || "");
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handlePublish = async () => {
    setStatus("publishing");
    try {
      const html = exportFreeformToHTML(page);
      const result = await publishToGitHubPages({
        id: page.id,
        name: page.name,
        slug: page.slug || page.id,
        html,
        customDomain: customDomain || undefined,
      });

      if (result.success) {
        setStatus("published");
        setUrl(result.url || "");
        toast({ title: "Published!", description: `Live at ${result.url}` });
        onPublish?.(result.url || "");
      } else {
        setStatus("error");
        toast({ title: "Publish failed", description: result.error || "Unknown error", variant: "destructive" });
      }
    } catch (e: any) {
      setStatus("error");
      toast({ title: "Publish failed", description: e.message, variant: "destructive" });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1">
      {/* Publish dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            title="Publish to web"
          >
            <Globe className="w-3.5 h-3.5" />
            Publish
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Publish to Web
            </DialogTitle>
            <DialogDescription>
              Deploy your page to GitHub Pages or a custom domain.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Custom domain input */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Custom Domain (optional)
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="mysite.com"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="h-8 text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => setShowSettings(!showSettings)}
                  title="DNS settings"
                >
                  <Settings className="w-3.5 h-3.5" />
                </Button>
              </div>
              {showSettings && (
                <div className="mt-2 p-3 rounded-lg bg-muted/50 text-[11px] text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">DNS Configuration</p>
                  <p>Apex: Add A records → <code className="text-primary">185.199.108.153</code>, <code className="text-primary">185.199.109.153</code>, <code className="text-primary">185.199.110.153</code>, <code className="text-primary">185.199.111.153</code></p>
                  <p>WWW: Add CNAME → <code className="text-primary">sudo-prog.github.io</code></p>
                  <p className="text-[10px] mt-1">Then enable enforce HTTPS in repo settings.</p>
                </div>
              )}
            </div>

            {/* Publish button */}
            <Button
              className="w-full gap-2"
              onClick={handlePublish}
              disabled={status === "publishing"}
            >
              {status === "publishing" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing...
                </>
              ) : status === "published" ? (
                <>
                  <Check className="w-4 h-4" />
                  Published
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  Publish Now
                </>
              )}
            </Button>

            {/* Result URL */}
            {status === "published" && url && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <Link className="w-4 h-4 text-green-400 shrink-0" />
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-400 hover:underline truncate flex-1"
                >
                  {url}
                </a>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={handleCopy} title="Copy URL">
                  {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                </Button>
                <a href={url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </a>
              </div>
            )}

            {status === "error" && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Publish failed. Check your GitHub token and repo permissions.
              </div>
            )}

            {/* Share link section */}
            {status === "published" && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Share link (no login required)</p>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={`${window.location.origin}/freeform/${page.id}/share`}
                    className="h-8 text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/freeform/${page.id}/share`);
                      toast({ title: "Share link copied!" });
                    }}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PublishButton;
