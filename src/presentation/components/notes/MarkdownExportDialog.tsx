/**
 * MarkdownExportDialog.tsx
 * 
 * Export notes to Markdown files with format preservation.
 * Part of NR-08: Markdown Import/Export UI
 */

import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { ProgressIndicator } from "../ui/progress-indicator"
import { FileDown, FolderOpen, Check, X, AlertCircle, Loader2 } from "lucide-react"
import { createNoteFileSyncService, type NoteSyncResult } from "@/lib/notes"
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
  syncService,
  onInitialize,
  isInitializing = false,
  error: initError,
  isReady = false,
  isSupported = true,
}: MarkdownExportDialogProps) {
  const { t } = useTranslation()
  const [exportPath, setExportPath] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<"idle" | "exporting" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const [exportResult, setExportResult] = useState<NoteSyncResult | null>(null)

  const handleExportToDirectory = useCallback(async () => {
    if (!exportPath.trim()) {
      setError(t("notes.export.error"))
      return
    }

    if (!syncService) {
      setError("File sync service not available. This feature requires additional dependencies.")
      return
    }

    setIsLoading(true)
    setStatus("exporting")
    setProgress(0)
    setError(null)

    try {
      const result = await syncService.exportAllNotes(notes)
      setExportResult(result)

      if (result.failureCount === 0) {
        setStatus("success")
        setProgress(notes.length)
      } else {
        setStatus("error")
        setError(`${result.failureCount} ${t("notes.export.error")}`)
      }
    } catch (err) {
      setStatus("error")
      setError(err instanceof Error ? err.message : t("notes.export.error"))
    } finally {
      setIsLoading(false)
    }
  }, [exportPath, notes, syncService, t])

  const handleExportSingle = useCallback(async (note: NoteRecord) => {
    if (!exportPath.trim()) {
      setError(t("notes.export.error"))
      return
    }

    if (!syncService) {
      setError("File sync service not available. This feature requires additional dependencies.")
      return
    }

    setIsLoading(true)
    setStatus("exporting")
    setProgress(0)
    setError(null)

    try {
      const filePath = await syncService.exportNote(note, exportPath)
      // Create a mock result for single note export
      const result: NoteSyncResult = {
        totalNotes: 1,
        successCount: 1,
        failureCount: 0,
        operations: [{
          noteId: note.id,
          noteTitle: note.title || 'Untitled',
          filePath,
          success: true,
        }]
      }
      setExportResult(result)
      setStatus("success")
      setProgress(1)
    } catch (err) {
      setStatus("error")
      setError(err instanceof Error ? err.message : t("notes.export.error"))
    } finally {
      setIsLoading(false)
    }
  }, [exportPath, syncService, t])

  const handleReset = useCallback(() => {
    setExportPath("")
    setStatus("idle")
    setProgress(0)
    setError(null)
    setExportResult(null)
  }, [])

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      handleReset()
    }
    onOpenChange(newOpen)
  }, [onOpenChange, handleReset])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="w-5 h-5" />
            {t("notes.export.title")}
          </DialogTitle>
          <DialogDescription>
            {t("notes.export.toMarkdown")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mobile/Unsupported Browser Fallback */}
          {!isSupported && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                File sync requires a desktop browser (Chrome, Edge, Opera). Mobile browsers are not supported.
              </p>
            </div>
          )}

          {/* Initialization Section */}
          {isSupported && !isReady && (
            <div className="flex flex-col items-center justify-center p-6 border rounded-lg space-y-4">
              <FolderOpen className="w-12 h-12 text-muted-foreground" />
              <div className="text-center">
                <p className="font-medium mb-1">Initialize File Sync</p>
                <p className="text-sm text-muted-foreground">
                  Select a directory to enable note export functionality
                </p>
              </div>
              <Button onClick={onInitialize} disabled={isInitializing}>
                {isInitializing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isInitializing ? 'Initializing...' : 'Select Directory'}
              </Button>
              {initError && (
                <p className="text-xs text-destructive text-center">{initError}</p>
              )}
            </div>
          )}

          {/* Export Path Input */}
          {isReady && (
            <div className="space-y-2">
              <Label htmlFor="export-path">{t("notes.export.directory")}</Label>
              <div className="flex gap-2">
                <Input
                  id="export-path"
                  value={exportPath}
                  onChange={(e) => setExportPath(e.target.value)}
                  placeholder="/path/to/export"
                  disabled={isLoading}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // In a real implementation, this would open a directory picker
                    const path = prompt(t("notes.export.directory"))
                    if (path) setExportPath(path)
                  }}
                  disabled={isLoading}
                  title={t("notes.export.directory")}
                >
                  <FolderOpen className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Notes Selection Info */}
          <div className="p-3 bg-zinc-800/50 rounded-md">
            <div className="text-sm text-zinc-400">
              {t("notes.export.all")}: {notes.length} {notes.length === 1 ? t("notes.note") : t("notes.notes")}
            </div>
          </div>

          {/* Progress Indicator */}
          {status === "exporting" && (
            <ProgressIndicator
              current={progress}
              total={notes.length}
              loadingText={t("notes.export.inProgress")}
              status="loading"
            />
          )}

          {/* Success State */}
          {status === "success" && exportResult && (
            <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-800 rounded-md">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-400">
                {t("notes.export.success", { count: exportResult.successCount })}
              </span>
            </div>
          )}

          {/* Error State */}
          {status === "error" && error && (
            <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-800 rounded-md">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            {status === "idle" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  {t("common.cancel")}
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleExportSingle(notes[0])}
                    disabled={isLoading || notes.length !== 1 || !syncService}
                    title={notes.length === 1 ? "" : t("notes.export.all")}
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    {t("notes.export.single")}
                  </Button>
                  <Button
                    onClick={handleExportToDirectory}
                    disabled={isLoading || !exportPath.trim() || notes.length === 0 || !syncService}
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    {t("notes.export.all")}
                  </Button>
                </div>
              </>
            )}
            
            {status === "success" && (
              <Button
                onClick={() => handleOpenChange(false)}
              >
                <Check className="w-4 h-4 mr-2" />
                {t("common.done")}
              </Button>
            )}

            {status === "error" && (
              <Button
                variant="outline"
                onClick={handleReset}
              >
                {t("common.retry")}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
