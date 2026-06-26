// ─── ExportPanel.tsx ─────────────────────────────────────────────────────────
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Download,
  FolderDown,
  Save,
  Link,
  Check,
  Archive,
  Copy,
  CheckCheck,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExportPanelProps {
  extractionId: string | null;
  onSave: () => void;
  onApplyToProject: (projectId: string) => void;
  projects?: { id: string; name: string }[];
}

export default function ExportPanel({
  extractionId,
  onSave,
  onApplyToProject,
  projects = [],
}: ExportPanelProps) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/#/design-extract/${extractionId}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDraw = (format: string) => {
    if (!extractionId) return;
    window.open(`/#/design-extract/${extractionId}/download/${format}`, "_blank");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sticky bottom-0 border-t border-[#27272a] bg-[#18181b]/95 backdrop-blur supports-[backdrop-filter]:bg-[#18181b]/60 p-4 space-y-3 -mx-4 md:-mx-6">
      {/* Download buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs border-[#27272a] bg-[#0a0a0b] hover:bg-[#27272a]"
          onClick={() => handleDownload("md")}
          disabled={!extractionId}
        >
          <Download className="h-3 w-3 mr-1" />
          design.md
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs border-[#27272a] bg-[#0a0a0b] hover:bg-[#27272a]"
          onClick={() => handleDownload("tailwind")}
          disabled={!extractionId}
        >
          <Download className="h-3 w-3 mr-1" />
          tailwind.config.ts
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs border-[#27272a] bg-[#0a0a0b] hover:bg-[#27272a]"
          onClick={() => handleDownload("css")}
          disabled={!extractionId}
        >
          <Download className="h-3 w-3 mr-1" />
          tokens.css
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs border-[#27272a] bg-[#0a0a0b] hover:bg-[#27272a]"
          onClick={() => handleDownload("zip")}
          disabled={!extractionId}
        >
          <Archive className="h-3 w-3 mr-1" />
          All files (.zip)
        </Button>
      </div>

      {/* Apply to project */}
      <div className="flex gap-2">
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="flex-1 h-8 text-xs bg-[#0a0a0b] border border-[#27272a] rounded-md px-2 text-foreground"
        >
          <option value="">Apply to Current Project…</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs border-[#27272a] bg-[#0a0a0b] hover:bg-[#27272a]"
          disabled={!selectedProject || !extractionId}
          onClick={() => selectedProject && onApplyToProject(selectedProject)}
        >
          <FolderDown className="h-3 w-3 mr-1" />
          Apply
        </Button>
      </div>

      {/* Save & Copy */}
      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1 bg-[#3b82f6] hover:bg-[#3b82f6]/90 text-white h-8 text-xs"
          onClick={handleSave}
          disabled={!extractionId || saving}
        >
          {saving ? (
            <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
          ) : (
            <Save className="h-3 w-3 mr-1.5" />
          )}
          Save extraction
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs border-[#27272a] bg-[#0a0a0b] hover:bg-[#27272a]"
          onClick={handleCopyLink}
          disabled={!extractionId}
        >
          {copied ? (
            <CheckCheck className="h-3 w-3 text-[#22c55e]" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {copied ? "Copied!" : "Copy link"}
        </Button>
      </div>
    </div>
  );
}
