/**
 * MarkdownExportDialog.tsx
 *
 * Export notes to Markdown files with format preservation.
 * Part of NR-08: Markdown Import/Export UI
 *
 * TEMPORARY: This dialog is disabled until export methods are implemented
 * in NotesFileSyncService. Users should use NotesFilePicker for sync functionality.
 */

import { useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog"
import { Button } from "../ui/button"
import { FileDown, Info } from "lucide-react"
import type { NoteRecord } from "@/lib/notes/types"
import type { FileSyncService } from "@/lib/filesync/file-sync-service"

interface MarkdownExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  notes: NoteRecord[]
  syncService?: FileSyncService | null
  onInitialize?: () => Promise<void>
  isInitializing?: boolean
  error?: string | null
  isReady?: boolean
  isSupported?: boolean
}

export function MarkdownExportDialog({
  open,
  onOpenChange,
  notes,
}: MarkdownExportDialogProps) {
  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={handleClose} modal={false}>
      <DialogContent className="sm:max-w-md shadow-2xl border-2" hideOverlay>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="w-5 h-5" />
            Export Notes
          </DialogTitle>
          <DialogDescription>
            Export notes to Markdown files
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info Message */}
          <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <Info className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Export via File Sync</p>
              <p className="text-sm text-muted-foreground">
                Note export is now handled through the File Sync feature. Use the "File Sync" button
                in the notes sidebar to enable automatic Markdown export.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Notes are automatically synced as Markdown files when file sync is enabled.
              </p>
            </div>
          </div>

          {/* Notes Count Info */}
          <div className="p-3 bg-zinc-800/50 rounded-md">
            <div className="text-sm text-zinc-400">
              Total notes: {notes.length}
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end">
            <Button onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
