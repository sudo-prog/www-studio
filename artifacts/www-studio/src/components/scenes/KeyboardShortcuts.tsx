import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open:    boolean;
  onClose: () => void;
}

const SECTIONS = [
  {
    title: "History",
    shortcuts: [
      { keys: ["Ctrl", "Z"],       label: "Undo" },
      { keys: ["Ctrl", "Y"],       label: "Redo" },
      { keys: ["Ctrl", "Shift","Z"],label: "Redo (alt)" },
      { keys: ["Ctrl", "S"],       label: "Save scene" },
    ],
  },
  {
    title: "Elements",
    shortcuts: [
      { keys: ["Delete"],    label: "Delete selected element" },
      { keys: ["Backspace"], label: "Delete selected element" },
      { keys: ["Escape"],    label: "Deselect" },
      { keys: ["Ctrl", "D"], label: "Duplicate selected" },
    ],
  },
  {
    title: "View & Panels",
    shortcuts: [
      { keys: ["?"],              label: "Toggle this help" },
      { keys: ["Space"],          label: "Open AI Chat" },
      { keys: ["Ctrl", "1"],      label: "Layers tab" },
      { keys: ["Ctrl", "2"],      label: "Properties tab" },
      { keys: ["Ctrl", "3"],      label: "Animation tab" },
      { keys: ["Ctrl", "4"],      label: "Export tab" },
    ],
  },
  {
    title: "Scene",
    shortcuts: [
      { keys: ["Ctrl", "Enter"],  label: "Enhance with AI" },
      { keys: ["Ctrl", "K"],      label: "Send to Cursor" },
      { keys: ["Ctrl", "P"],      label: "Preview scene" },
    ],
  },
];

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[24px] px-1.5 py-0.5 text-[10px] font-mono font-medium bg-muted border border-border rounded-md text-muted-foreground leading-none">
      {children}
    </kbd>
  );
}

export function KeyboardShortcuts({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ⌨️ Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <div className="space-y-2">
                {section.shortcuts.map(({ keys, label }) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <span className="text-xs text-foreground">{label}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {keys.map((k, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <Kbd>{k}</Kbd>
                          {i < keys.length - 1 && <span className="text-[10px] text-muted-foreground">+</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground text-center pt-4">
          Press <Kbd>?</Kbd> anytime to toggle this panel
        </p>
      </DialogContent>
    </Dialog>
  );
}
