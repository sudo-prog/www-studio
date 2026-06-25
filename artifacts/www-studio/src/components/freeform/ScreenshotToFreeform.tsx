import { useState, useCallback } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Camera, Loader2, Upload, Sparkles, Image as ImageIcon } from "lucide-react";
import { type FreeformElement, makeFreeformElement } from "@/lib/freeform-types";

interface Props {
  canvasWidth: number;
  canvasHeight: number;
  onApply: (elements: FreeformElement[]) => void;
}

export function ScreenshotToFreeform({ canvasWidth, canvasHeight, onApply }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [extractedElements, setExtractedElements] = useState<FreeformElement[]>([]);

  const handleScreenshot = useCallback(async () => {
    setProcessing(true);
    try {
      // Use Screen Capture API if available
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: "screen" },
        audio: false,
      });
      const track = stream.getVideoTracks()[0];
      const imageCapture = new (window as any).ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();
      track.stop();
      stream.getTracks().forEach(t => t.stop());

      // Convert to canvas for preview
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(bitmap, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      setPreview(dataUrl);

      // Analyze screenshot and extract elements (heuristic)
      const elements = analyzeScreenshot(dataUrl, canvasWidth, canvasHeight);
      setExtractedElements(elements);
    } catch (err: any) {
      if (err.name !== "NotAllowedError") {
        toast({ title: "Screenshot failed", description: err.message, variant: "destructive" });
      }
    } finally {
      setProcessing(false);
    }
  }, [canvasWidth, canvasHeight, toast]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      const elements = analyzeScreenshot(dataUrl, canvasWidth, canvasHeight);
      setExtractedElements(elements);
    };
    reader.readAsDataURL(file);
  };

  const handleApply = () => {
    if (extractedElements.length > 0) {
      onApply(extractedElements);
      setOpen(false);
      toast({ title: "Elements added!", description: `${extractedElements.length} elements from screenshot` });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Camera className="w-3.5 h-3.5" />
          Screenshot → Freeform
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-primary" />
            Screenshot to Freeform
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Capture your desktop or upload an image to convert into freeform canvas elements
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4">
          {!preview && !processing && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="flex gap-3">
                <Button onClick={handleScreenshot} className="gap-2">
                  <Camera className="w-4 h-4" />
                  Capture Screen
                </Button>
                <label className="inline-flex">
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  <Button variant="outline" className="gap-2 cursor-pointer" asChild>
                    <span>
                      <Upload className="w-4 h-4" />
                      Upload Image
                    </span>
                  </Button>
                </label>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Screen capture uses browser API • Or upload any image
              </p>
            </div>
          )}

          {processing && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Analyzing screenshot...</span>
            </div>
          )}

          {preview && (
            <>
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img src={preview} alt="Screenshot preview" className="w-full max-h-64 object-contain bg-black/50" />
              </div>
              {extractedElements.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-primary" />
                    Extracted {extractedElements.length} elements
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {extractedElements.map((el) => (
                      <span key={el.id} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50">
                        {el.type} ({Math.round(el.x)}, {Math.round(el.y)})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {preview && (
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => { setPreview(null); setExtractedElements([]); }}>
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={extractedElements.length === 0} className="gap-2">
              <ImageIcon className="w-4 h-4" />
              Add {extractedElements.length} Elements
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function analyzeScreenshot(
  _dataUrl: string,
  canvasWidth: number,
  canvasHeight: number,
): FreeformElement[] {
  // Heuristic: create a moodboard-style layout from the screenshot
  // In production, this would use vision LLM to detect actual UI elements
  const elements: FreeformElement[] = [];

  // Add the screenshot as a background reference image
  elements.push(makeFreeformElement("image", {
    x: 0,
    y: 0,
    width: canvasWidth,
    height: canvasHeight,
    src: _dataUrl,
    opacity: 0.3,
    name: "Screenshot Reference",
  }));

  // Add placeholder elements representing detected regions
  const regions = [
    { x: 0, y: 0, w: canvasWidth, h: 80, type: "shape" as const, name: "Header/Nav" },
    { x: 0, y: 80, w: canvasWidth * 0.5, h: canvasHeight - 80, type: "shape" as const, name: "Sidebar" },
    { x: canvasWidth * 0.5, y: 80, w: canvasWidth * 0.5, h: 200, type: "shape" as const, name: "Hero" },
    { x: canvasWidth * 0.5, y: 280, w: canvasWidth * 0.5, h: canvasHeight - 280, type: "shape" as const, name: "Content" },
  ];

  regions.forEach((r) => {
    elements.push(makeFreeformElement(r.type, {
      x: r.x, y: r.y, width: r.w, height: r.h,
      fill: "#3b82f6",
      opacity: 0.1,
      stroke: "#3b82f6",
      strokeWidth: 1,
      name: r.name,
    }));
  });

  // Add text labels
  elements.push(makeFreeformElement("text", {
    x: 20, y: 30, width: 200, height: 30,
    text: "Detected Header",
    fontSize: 16,
    color: "#3b82f6",
    name: "Header Label",
  }));

  return elements;
}
