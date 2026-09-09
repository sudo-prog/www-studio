import * as React from "react"
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import { X } from "lucide-react"

interface FloatingPreviewWindowProps {
  isOpen: boolean
  onClose: () => void
  previewUrl: string
  templateName: string
}

export function FloatingPreviewWindow({
  isOpen,
  onClose,
  previewUrl,
  templateName,
}: FloatingPreviewWindowProps) {
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = React.useState(false)
  const titleBarRef = React.useRef<HTMLDivElement>(null)

  const handleTitleBarMouseDown = (e: React.MouseEvent) => {
    if (titleBarRef.current) {
      const rect = titleBarRef.current.getBoundingClientRect()
      setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      setIsDragging(true)
    }
  }

  React.useEffect(() => {
    if (!isDragging) return
    const onMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    }
    const onUp = () => setIsDragging(false)
    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
    return () => {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
    }
  }, [isDragging, dragStart])

  React.useEffect(() => {
    if (!isOpen) setPosition({ x: 0, y: 0 })
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="z-50 bg-black/95 border border-zinc-800 p-0 overflow-hidden"
        style={{
          maxWidth: "90vw",
          maxHeight: "80vh",
          width: "90vw",
          height: "80vh",
          transform:
            position.x !== 0 || position.y !== 0
              ? `translate(${position.x}px, ${position.y}px)`
              : undefined,
        }}
      >
        {/* Title bar — draggable */}
        <div
          ref={titleBarRef}
          className="flex items-center h-10 px-4 bg-zinc-950 border-b border-zinc-800 cursor-move select-none"
          onMouseDown={handleTitleBarMouseDown}
        >
          <div className="flex gap-1.5 mr-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
          <h3 className="text-white text-sm font-medium truncate flex-1">
            {templateName}
          </h3>
          <DialogClose className="ml-auto rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground min-w-[44px] min-h-[44px] flex items-center justify-center">
            <X className="h-4 w-4 text-white" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        {/* iframe body */}
        <div className="w-full" style={{ height: "calc(80vh - 40px)" }}>
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            title={templateName}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
            allow="fullscreen"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}