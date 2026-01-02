/**
 * MarkdownImportDialog.tsx
 * 
 * Import notes from Markdown files with format preservation.
 * Part of NR-08: Markdown Import/Export UI
 */

import React, { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { ProgressIndicator } from "../ui/progress-indicator"
import { FileUp, FolderOpen, Check, X, AlertCircle } from "lucide-react"
import { createNoteFileSyncService, type NoteImportResult } from "@/lib/notes"
import type { NoteRecord } from "@/lib/notes/types"

interface MarkdownImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete: (notes: NoteRecord[]) => void
  syncService?: ReturnType<typeof createNoteFileSyncService>
}

export function MarkdownImportDialog({
  open,
  onOpenChange,
  onImportComplete,
  syncService: providedSyncService,
}: MarkdownImportDialogProps) {
  const { t } = useTranslation()
  const [importPath, setImportPath] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<"idle" | "importing" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<NoteImportResult | null>(null)

  const syncService = providedSyncService ?? createNoteFileSyncService()

  const handleImportFromDirectory = useCallback(async () => {
    if (!importPath.trim()) {
      setError(t("notes.import.error"))
      return
    }

    setIsLoading(true)
    setStatus("importing")
    setProgress(0)
    setError(null)

    try {
      const result = await syncService.importAllNotes(importPath, (p: number) => setProgress(p))
      setImportResult(result)
      
      if (result.success) {
        setStatus("success")
        onImportComplete(result.notes)
      } else {
        setStatus("error")
        setError(result.errors[0]?.message || t("notes.import.error"))
      }
    } catch (err) {
      setStatus("error")
      setError(err instanceof Error ? err.message : t("notes.import.error"))
    } finally {
      setIsLoading(false)
    }
  }, [importPath, syncService, t, onImportComplete])

  const handleReset = useCallback(() => {
    setImportPath("")
    setStatus("idle")
    setProgress(0)
    setError(null)
    setImportResult(null)
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
            <FileUp className="w-5 h-5" />
            {t("notes.import.title")}
          </DialogTitle>
          <DialogDescription>
            {t("notes.import.fromMarkdown")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Import Path Input */}
          <div className="space-y-2">
            <Label htmlFor="import-path">{t("notes.export.directory")}</Label>
            <div className="flex gap-2">
              <Input
                id="import-path"
                value={importPath}
                onChange={(e) => setImportPath(e.target.value)}
                placeholder="/path/to/markdown/files"
                disabled={isLoading}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  // In a real implementation, this would open a directory picker
                  // For now, we'll use a simple prompt
                  const path = prompt(t("notes.import.files"))
                  if (path) setImportPath(path)
                }}
                disabled={isLoading}
                title={t("notes.import.files")}
              >
                <FolderOpen className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Import Options */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="overwrite-existing"
              className="rounded border-zinc-600 bg-zinc-800 text-accent-primary focus:ring-accent-primary"
            />
            <Label htmlFor="overwrite-existing" className="text-sm cursor-pointer">
              {t("notes.import.overwrite")}
            </Label>
          </div>

          {/* Progress Indicator */}
          {status === "importing" && (
            <ProgressIndicator
              value={progress}
              label={t("notes.import.inProgress")}
            />
          )}

          {/* Success State */}
          {status === "success" && importResult && (
            <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-800 rounded-md">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-400">
                {t("notes.import.success", { count: importResult.notes.length })}
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
                <Button
                  onClick={handleImportFromDirectory}
                  disabled={isLoading || !importPath.trim()}
                >
                  <FileUp className="w-4 h-4 mr-2" />
                  {t("notes.import.fromMarkdown")}
                </Button>
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
