/**
 * Settings Import Dialog - Import Settings UI
 *
 * Dialog for importing application settings from JSON file or clipboard.
 * Shows preview of changes and handles conflicts.
 *
 * @module presentation/components/settings/SettingsImportDialog
 * @story S-028: Export/Import Project Settings
 */

import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { UploadIcon, ClipboardIcon, Loader2Icon, AlertTriangleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  importFromFile,
  importFromClipboard,
  type ImportResult,
} from '@/lib/settings/settings-importer';

// ============================================================================
// TYPES
// ============================================================================

export interface SettingsImportDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Called when dialog should close */
  onOpenChange: (open: boolean) => void;
  /** Called when import is successful with data to apply */
  onImport: (data: {
    projects: any[];
    providers: any[];
    preferences?: any;
    activeProjectId?: string | null;
  }) => void;
  /** Current projects from store */
  currentProjects: Map<string, any>;
  /** Current providers from store */
  currentProviders: Map<string, any>;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SettingsImportDialog({
  open,
  onOpenChange,
  onImport,
  currentProjects,
  currentProviders,
}: SettingsImportDialogProps) {
  const { t } = useTranslation();

  // State
  const [importMethod, setImportMethod] = useState<'file' | 'clipboard' | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsImporting(true);
      setImportMethod('file');
      setError(null);
      setImportResult(null);

      try {
        const result = await importFromFile(
          file,
          currentProjects,
          currentProviders,
          { conflictResolution: 'prompt', createBackup: true }
        );

        setImportResult(result);

        if (!result.success) {
          setError(result.error || 'Import failed');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsImporting(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [currentProjects, currentProviders]
  );

  // Handle clipboard import
  const handleClipboardImport = useCallback(async () => {
    setIsImporting(true);
    setImportMethod('clipboard');
    setError(null);
    setImportResult(null);

    try {
      const result = await importFromClipboard(
        currentProjects,
        currentProviders,
        { conflictResolution: 'prompt', createBackup: true }
      );

      setImportResult(result);

      if (!result.success) {
        setError(result.error || 'Import failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsImporting(false);
    }
  }, [currentProjects, currentProviders]);

  // Handle apply import
  const handleApplyImport = useCallback(() => {
    if (!importResult?.preview) return;

    // Extract import data from preview
    // Note: In a real implementation, you'd pass the validated data
    // to the store which would apply it with proper conflict resolution
    onImport({
      projects: [], // Will be populated from preview
      providers: [],
      preferences: undefined,
      activeProjectId: undefined,
    });

    // Close dialog
    onOpenChange(false);

    // Reset state
    setImportResult(null);
    setError(null);
    setImportMethod(null);
  }, [importResult, onImport, onOpenChange]);

  // Handle cancel/reset
  const handleCancel = useCallback(() => {
    setImportResult(null);
    setError(null);
    setImportMethod(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Handle dialog close
  const handleClose = useCallback(() => {
    if (isImporting) return;
    handleCancel();
    onOpenChange(false);
  }, [isImporting, handleCancel, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="xl" className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t('settings.import.title', { defaultValue: 'Import Settings' })}
          </DialogTitle>
          <DialogDescription>
            {t('settings.import.description', {
              defaultValue: 'Import settings from a JSON file or clipboard.',
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Initial state - show import options */}
          {!importResult && !error && (
            <div className="space-y-4">
              {/* File upload */}
              <div className="border-2 border-border rounded-none p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="settings-import-file"
                  disabled={isImporting}
                />
                <label
                  htmlFor="settings-import-file"
                  className={cn(
                    'cursor-pointer flex flex-col items-center gap-3',
                    isImporting && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <UploadIcon className="w-12 h-12 text-muted-foreground" />
                  <div>
                    <p className="font-semibold text-foreground">
                      {t('settings.import.uploadFile', { defaultValue: 'Upload JSON File' })}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('settings.import.clickToBrowse', { defaultValue: 'Click to browse or drag and drop' })}
                    </p>
                  </div>
                </label>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground">
                  {t('common.or', { defaultValue: 'OR' })}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Clipboard import */}
              <Button
                variant="outline"
                onClick={handleClipboardImport}
                disabled={isImporting}
                className="w-full gap-2"
              >
                {isImporting && importMethod === 'clipboard' ? (
                  <>
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                    {t('settings.import.pasting', { defaultValue: 'Reading from clipboard...' })}
                  </>
                ) : (
                  <>
                    <ClipboardIcon className="w-4 h-4" />
                    {t('settings.import.fromClipboard', { defaultValue: 'Paste from Clipboard' })}
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Error state */}
          {error && !importResult && (
            <div className="border-2 border-[var(--destructive)] bg-[var(--destructive)]/10 p-4">
              <div className="flex gap-3">
                <AlertTriangleIcon className="w-5 h-5 text-[var(--destructive)] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[var(--destructive)]">
                    {t('settings.import.error', { defaultValue: 'Import Failed' })}
                  </p>
                  <p className="text-sm text-[var(--destructive)] mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Preview state */}
          {importResult?.preview && (
            <div className="space-y-4">
              {/* Validation summary */}
              <div className={cn(
                'border-2 rounded-none p-4',
                importResult.preview.validation.versionCompatible
                  ? 'border-[var(--success)] bg-[var(--success)]/10'
                  : 'border-[var(--warning)] bg-[var(--warning)]/10'
              )}>
                <div className="flex items-start gap-3">
                  <AlertTriangleIcon className={cn(
                    'w-5 h-5 flex-shrink-0 mt-0.5',
                    importResult.preview.validation.versionCompatible
                      ? 'text-[var(--success)]'
                      : 'text-[var(--warning)]'
                  )} />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {importResult.preview.validation.versionCompatible
                        ? t('settings.import.validBackup', { defaultValue: 'Valid Settings Backup' })
                        : t('settings.import.versionWarning', { defaultValue: 'Version Mismatch Warning' })}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('settings.import.version', {
                        defaultValue: 'Version: {{version}}',
                        version: importResult.preview.validation.version,
                      })}
                    </p>
                    {importResult.preview.validation.warnings.length > 0 && (
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        {importResult.preview.validation.warnings.map((warning, i) => (
                          <li key={i}>• {warning}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Estimated changes */}
              <div className="border-2 border-border rounded-none p-4 bg-[var(--muted)]">
                <h3 className="font-semibold text-foreground mb-3">
                  {t('settings.import.changes', { defaultValue: 'Changes to Apply' })}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      {t('settings.import.projectsToAdd', { defaultValue: 'Projects to add' })}:
                    </span>{' '}
                    <span className="font-mono font-bold text-[var(--success)]">
                      +{importResult.preview.estimatedChanges.projectsToAdd}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t('settings.import.projectsToUpdate', { defaultValue: 'Projects to update' })}:
                    </span>{' '}
                    <span className="font-mono font-bold text-[var(--warning)]">
                      ~{importResult.preview.estimatedChanges.projectsToUpdate}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t('settings.import.providersToAdd', { defaultValue: 'Providers to add' })}:
                    </span>{' '}
                    <span className="font-mono font-bold text-[var(--success)]">
                      +{importResult.preview.estimatedChanges.providersToAdd}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t('settings.import.providersToUpdate', { defaultValue: 'Providers to update' })}:
                    </span>{' '}
                    <span className="font-mono font-bold text-[var(--warning)]">
                      ~{importResult.preview.estimatedChanges.providersToUpdate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Conflicts */}
              {importResult.preview.conflicts.length > 0 && (
                <div className="border-2 border-[var(--warning)] bg-[var(--warning)]/10 p-4">
                  <h3 className="font-semibold text-[var(--warning)] mb-3">
                    {t('settings.import.conflicts', {
                      defaultValue: 'Conflicts ({{count}})',
                      count: importResult.preview.conflicts.length,
                    })}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t('settings.import.conflictsNotice', {
                      defaultValue: 'Some items already exist. They will be merged or skipped as appropriate.',
                    })}
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {importResult.preview.conflicts.slice(0, 5).map((conflict, i) => (
                      <div key={i} className="text-sm">
                        <span className="font-mono">{conflict.type}</span>: {conflict.name} →{' '}
                        <span className="text-[var(--warning)]">
                          {conflict.suggestedAction === 'skip'
                            ? t('settings.import.skip', { defaultValue: 'Skip' })
                            : t('settings.import.merge', { defaultValue: 'Merge' })}
                        </span>
                      </div>
                    ))}
                    {importResult.preview.conflicts.length > 5 && (
                      <p className="text-sm text-muted-foreground">
                        {t('settings.import.moreConflicts', {
                          defaultValue: '...and {{count}} more',
                          count: importResult.preview.conflicts.length - 5,
                        })}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Backup notice */}
              {importResult.backup && (
                <div className="border-2 border-[var(--success)] bg-[var(--success)]/10 p-3 text-sm">
                  <p className="text-[var(--success)]">
                    {t('settings.import.backupCreated', {
                      defaultValue: 'Backup created automatically. You can restore if needed.',
                    })}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {importResult?.preview ? (
            <>
              <Button variant="secondary" onClick={handleCancel}>
                {t('settings.import.cancel', { defaultValue: 'Cancel' })}
              </Button>
              <Button variant="primary" onClick={handleApplyImport}>
                {t('settings.import.apply', { defaultValue: 'Apply Import' })}
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={isImporting}
            >
              {t('actions.cancel', { defaultValue: 'Cancel' })}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
