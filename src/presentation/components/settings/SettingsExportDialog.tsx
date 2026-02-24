/**
 * Settings Export Dialog - Export Settings UI
 *
 * Dialog for exporting application settings to JSON file or clipboard.
 * Provides export options and displays export statistics.
 *
 * @module presentation/components/settings/SettingsExportDialog
 * @story S-028: Export/Import Project Settings
 */

import { useState, useCallback } from 'react';
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
import { DownloadIcon, CopyIcon, Loader2Icon, CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  exportAndDownload,
  exportAndCopy,
  getExportStats,
  formatFileSize,
} from '@/lib/settings/settings-exporter';

// ============================================================================
// TYPES
// ============================================================================

export interface SettingsExportDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Called when dialog should close */
  onOpenChange: (open: boolean) => void;
  /** Projects from store */
  projects: Array<any>;
  /** Providers from store */
  providers: Array<any>;
  /** Active project ID */
  activeProjectId?: string | null;
  /** UI preferences */
  preferences?: Record<string, any>;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SettingsExportDialog({
  open,
  onOpenChange,
  projects,
  providers,
  activeProjectId,
  preferences,
}: SettingsExportDialogProps) {
  const { t } = useTranslation();

  // State
  const [isExporting, setIsExporting] = useState(false);
  const [exportAction, setExportAction] = useState<'download' | 'clipboard' | null>(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Export options
  const [includeProjects, setIncludeProjects] = useState(true);
  const [includeProviders, setIncludeProviders] = useState(true);
  const [includePreferences, setIncludePreferences] = useState(true);

  // Calculate export stats
  const stats = getExportStats({
    projects,
    providers,
    preferences,
  });

  // Handle download
  const handleDownload = useCallback(async () => {
    setIsExporting(true);
    setExportAction('download');

    try {
      await exportAndDownload(
        {
          projects,
          activeProjectId,
          providers,
          preferences,
        },
        {
          includeProjects,
          includeProviders,
          includePreferences,
          minify: false,
        }
      );

      // Close dialog after successful export
      setTimeout(() => {
        onOpenChange(false);
        setIsExporting(false);
        setExportAction(null);
      }, 500);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      setExportAction(null);
    }
  }, [
    projects,
    activeProjectId,
    providers,
    preferences,
    includeProjects,
    includeProviders,
    includePreferences,
    onOpenChange,
  ]);

  // Handle copy to clipboard
  const handleCopyToClipboard = useCallback(async () => {
    setIsExporting(true);
    setExportAction('clipboard');

    try {
      await exportAndCopy(
        {
          projects,
          activeProjectId,
          providers,
          preferences,
        },
        {
          includeProjects,
          includeProviders,
          includePreferences,
          minify: false,
        }
      );

      setCopiedToClipboard(true);

      // Reset copied state after delay
      setTimeout(() => {
        setCopiedToClipboard(false);
        setIsExporting(false);
        setExportAction(null);
      }, 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      setIsExporting(false);
      setExportAction(null);
    }
  }, [
    projects,
    activeProjectId,
    providers,
    preferences,
    includeProjects,
    includeProviders,
    includePreferences,
  ]);

  // Check if anything to export
  const hasContent = stats.projectCount > 0 || stats.providerCount > 0 || stats.hasPreferences;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t('settings.export.title', { defaultValue: 'Export Settings' })}
          </DialogTitle>
          <DialogDescription>
            {t('settings.export.description', {
              defaultValue: 'Export your settings to a JSON file for backup or sharing.',
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Statistics */}
          <div className="border-2 border-border rounded-none p-4 bg-[var(--muted)]">
            <h3 className="font-semibold text-foreground mb-3">
              {t('settings.export.stats', { defaultValue: 'Export Statistics' })}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">
                  {t('settings.export.projects', { defaultValue: 'Projects' })}:
                </span>{' '}
                <span className="font-mono font-bold">{stats.projectCount}</span>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {t('settings.export.providers', { defaultValue: 'Providers' })}:
                </span>{' '}
                <span className="font-mono font-bold">{stats.providerCount}</span>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {t('settings.export.preferences', { defaultValue: 'Preferences' })}:
                </span>{' '}
                <span className="font-mono font-bold">
                  {stats.hasPreferences ? t('common.yes', { defaultValue: 'Yes' }) : t('common.no', { defaultValue: 'No' })}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {t('settings.export.estimatedSize', { defaultValue: 'Est. Size' })}:
                </span>{' '}
                <span className="font-mono font-bold">{formatFileSize(stats.estimatedSize)}</span>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">
              {t('settings.export.options', { defaultValue: 'Export Options' })}
            </h3>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeProjects}
                onChange={e => setIncludeProjects(e.target.checked)}
                className="w-4 h-4 rounded-none border-2 border-border"
                disabled={stats.projectCount === 0}
              />
              <span className={cn(
                'text-sm',
                stats.projectCount === 0 && 'text-muted-foreground'
              )}>
                {t('settings.export.includeProjects', {
                  defaultValue: 'Include projects ({{count}})',
                  count: stats.projectCount,
                })}
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeProviders}
                onChange={e => setIncludeProviders(e.target.checked)}
                className="w-4 h-4 rounded-none border-2 border-border"
                disabled={stats.providerCount === 0}
              />
              <span className={cn(
                'text-sm',
                stats.providerCount === 0 && 'text-muted-foreground'
              )}>
                {t('settings.export.includeProviders', {
                  defaultValue: 'Include providers ({{count}}, API keys excluded)',
                  count: stats.providerCount,
                })}
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includePreferences}
                onChange={e => setIncludePreferences(e.target.checked)}
                className="w-4 h-4 rounded-none border-2 border-border"
                disabled={!stats.hasPreferences}
              />
              <span className={cn(
                'text-sm',
                !stats.hasPreferences && 'text-muted-foreground'
              )}>
                {t('settings.export.includePreferences', {
                  defaultValue: 'Include UI preferences',
                })}
              </span>
            </label>
          </div>

          {/* Notice about API keys */}
          {includeProviders && stats.providerCount > 0 && (
            <div className="border-2 border-[var(--warning)] bg-[var(--warning)]/10 p-3 text-sm">
              <p className="text-[var(--warning)]">
                {t('settings.export.apiKeysNotice', {
                  defaultValue: 'Note: API keys are never exported. You will need to re-enter them after importing.',
                })}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            {t('actions.cancel', { defaultValue: 'Cancel' })}
          </Button>

          <Button
            variant="outline"
            onClick={handleCopyToClipboard}
            disabled={isExporting || !hasContent}
            className="gap-2"
          >
            {copiedToClipboard ? (
              <>
                <CheckIcon className="w-4 h-4" />
                {t('settings.export.copied', { defaultValue: 'Copied!' })}
              </>
            ) : isExporting && exportAction === 'clipboard' ? (
              <>
                <Loader2Icon className="w-4 h-4 animate-spin" />
                {t('settings.export.copying', { defaultValue: 'Copying...' })}
              </>
            ) : (
              <>
                <CopyIcon className="w-4 h-4" />
                {t('settings.export.copyToClipboard', { defaultValue: 'Copy to Clipboard' })}
              </>
            )}
          </Button>

          <Button
            variant="primary"
            onClick={handleDownload}
            disabled={isExporting || !hasContent}
            className="gap-2"
          >
            {isExporting && exportAction === 'download' ? (
              <>
                <Loader2Icon className="w-4 h-4 animate-spin" />
                {t('settings.export.downloading', { defaultValue: 'Downloading...' })}
              </>
            ) : (
              <>
                <DownloadIcon className="w-4 h-4" />
                {t('settings.export.download', { defaultValue: 'Download File' })}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
