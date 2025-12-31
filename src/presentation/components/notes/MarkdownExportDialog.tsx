/**
 * MarkdownExportDialog.tsx
 * 
 * Export notes to Markdown files with format preservation.
 * Part of NR-08: Markdown Import/Export UI
 */

import React, { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { ProgressIndicator } from "../ui/progress-indicator"
import { FileDown, FolderOpen, Check, X, AlertCircle } from "lucide-react"
import { createNoteFileSyncService, type NoteSyncResult } from "@/lib/notes"
import type { NoteRecord } from "@/lib/notes/types"

interface MarkdownExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  notes: NoteRecord[]
  syncService?: ReturnType<typeof createNoteFileSyncService>
}

export function MarkdownExportDialog({
  open,
  onOpenChange,
  notes,
  syncService: providedSyncService,
}: MarkdownExportDialogProps) {
  const { t } = useTranslation()
  const [exportPath, setExportPath] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<"idle" | "exporting" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const [exportResult, setExportResult] = useState<NoteSyncResult | null>(null)

  const syncService = providedSyncService ?? createNoteFileSyncService()

  const handleExportToDirectory = useCallback(async () => {
    if (!exportPath.trim()) {
      setError(t("notes.export.error"))
      return
    }

    setIsLoading(true)
    setStatus("exporting")
    setProgress(0)
    setError(null)

    try {
      const result = await syncService.exportAllNotes(notes, exportPath, (p) => setProgress(p))
      setExportResult(result)
      
      if (result.success) {
        setStatus("success")
      } else {
        setStatus("error")
        setError(result.errors[0]?.message || t("notes.export.error"))
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

    setIsLoading(true)
    setStatus("exporting")
    setProgress(0)
    setError(null)

    try {
      const result = await syncService.exportNote(note, exportPath)
      setExportResult(result)
      
      if (result.success) {
        setStatus("success")
      } else {
        setStatus("error")
        setError(result.errors[0]?.message || t("notes.export.error"))
      }
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
          {/* Export Path Input */}
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
                size="icon"
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

          {/* Notes Selection Info */}
          <div className="p-3 bg-zinc-800/50 rounded-md">
            <div className="text-sm text-zinc-400">
              {t("notes.export.all")}: {notes.length} {notes.length === 1 ? t("notes.note") : t("notes.notes")}
            </div>
          </div>

          {/* Progress Indicator */}
          {status === "exporting" && (
            <ProgressIndicator
              value={progress}
              label={t("notes.export.inProgress")}
            />
          )}

          {/* Success State */}
          {status === "success" && exportResult && (
            <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-800 rounded-md">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-400">
                {t("notes.export.success", { count: exportResult.exported })}
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
                    disabled={isLoading || notes.length !== 1}
                    title={notes.length === 1 ? "" : t("notes.export.all")}
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    {t("notes.export.single")}
                  </Button>
                  <Button
                    onClick={handleExportToDirectory}
                    disabled={isLoading || !exportPath.trim() || notes.length === 0}
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
