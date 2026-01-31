/**
 * ProjectMetadataDialog Component
 *
 * Dialog for editing project metadata (name, auto-sync, exclusions).
 * Uses Radix UI Dialog with form validation and i18n support.
 *
 * @file ProjectMetadataDialog.tsx
 * @created 2026-01-02T14:30:00+07:00
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

export interface ProjectMetadata {
  /** Project name */
  name: string;
  /** Auto-sync flag */
  autoSync: boolean;
  /** Path exclusion patterns (glob patterns) */
  exclusions: string[];
}

export interface ProjectMetadataDialogProps {
  /** Project ID */
  projectId: string;
  /** Current project metadata */
  metadata: ProjectMetadata;
  /** Callback when metadata is saved */
  onSave?: (projectId: string, metadata: ProjectMetadata) => void;
  /** Dialog open state */
  open?: boolean;
  /** Callback when dialog open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Dialog for editing project configuration.
 *
 * Features:
 * - Form validation (required name, valid glob patterns)
 * - i18n support for labels and error messages
 * - ARIA labels for accessibility
 * - Auto-sync toggle with Switch component
 * - Path exclusions management (array of glob patterns)
 *
 * @example
 * ```tsx
 * <ProjectMetadataDialog
 *   projectId="proj-123"
 *   metadata={{ name: "My Project", autoSync: true, exclusions: ["node_modules"] }}
 *   onSave={(id, metadata) => updateProjectMetadata(id, metadata)}
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 * />
 * ```
 */
export const ProjectMetadataDialog: React.FC<ProjectMetadataDialogProps> = ({
  projectId,
  metadata,
  onSave,
  open,
  onOpenChange,
  className: _className,
}) => {
  const { t } = useTranslation();

  // Form state
  const [name, setName] = React.useState(metadata.name);
  const [autoSync, setAutoSync] = React.useState(metadata.autoSync);
  const [exclusions, setExclusions] = React.useState(metadata.exclusions.join(', '));
  const [errors, setErrors] = React.useState<{
    name?: string;
    exclusions?: string;
  }>({});

  // Reset form when metadata changes
  React.useEffect(() => {
    setName(metadata.name);
    setAutoSync(metadata.autoSync);
    setExclusions(metadata.exclusions.join(', '));
    setErrors({});
  }, [metadata]);

  /**
   * Validate glob patterns (simple validation)
   * Checks for common glob pattern characters: *, ?, [], {}
   */
  const isValidGlob = (pattern: string): boolean => {
    if (!pattern.trim()) return true; // Empty patterns are valid
    const globChars = ['*', '?', '[', ']'];
    return globChars.some(char => pattern.includes(char)) || pattern.includes('/');
  };

  /**
   * Validate form fields
   */
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Name validation (required)
    if (!name.trim()) {
      newErrors.name = t('hub.project.metadata.errors.nameRequired', 'Project name is required');
    }

    // Exclusions validation (valid glob patterns)
    const exclusionPatterns = exclusions.split(',').map(p => p.trim()).filter(Boolean);
    const invalidPatterns = exclusionPatterns.filter(p => !isValidGlob(p));

    if (invalidPatterns.length > 0) {
      newErrors.exclusions = t('hub.project.metadata.errors.invalidGlob', 'Invalid glob patterns: {{patterns}}', {
        patterns: invalidPatterns.join(', ')
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle save action
   */
  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const updatedMetadata: ProjectMetadata = {
      name: name.trim(),
      autoSync,
      exclusions: exclusions.split(',').map(p => p.trim()).filter(Boolean),
    };

    onSave?.(projectId, updatedMetadata);
    onOpenChange?.(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 bg-[var(--color-overlay)]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "z-50"
          )}
        />
        <Dialog.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%]",
            "bg-background border border-border rounded-lg shadow-lg p-6",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
          )}
        >
          {/* Header */}
          <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
              {t('hub.project.metadata.title', 'Edit Project')}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground">
              {t('hub.project.metadata.description', 'Update project configuration and settings')}
            </Dialog.Description>
          </div>

          {/* Form */}
          <div className="grid gap-4 py-4">
            {/* Project Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="project-name" className="text-sm font-medium text-right">
                {t('hub.project.metadata.nameLabel', 'Name')}
              </label>
              <div className="col-span-3">
                <input
                  id="project-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2",
                    "text-sm placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                  placeholder={t('hub.project.metadata.namePlaceholder', 'My Project')}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="text-sm text-destructive mt-1">
                    {errors.name}
                  </p>
                )}
              </div>
            </div>

            {/* Auto-Sync Toggle */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="auto-sync" className="text-sm font-medium text-right">
                {t('hub.project.metadata.autoSyncLabel', 'Auto Sync')}
              </label>
              <div className="col-span-3 flex items-center gap-2">
                <button
                  id="auto-sync"
                  type="button"
                  role="switch"
                  aria-checked={autoSync}
                  onClick={() => setAutoSync(!autoSync)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    autoSync ? "bg-primary" : "bg-input"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
                      autoSync ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
                <span className="text-sm text-muted-foreground">
                  {t('hub.project.metadata.autoSyncDescription', 'Automatically sync project changes')}
                </span>
              </div>
            </div>

            {/* Exclusions */}
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="exclusions" className="text-sm font-medium text-right pt-2">
                {t('hub.project.metadata.exclusionsLabel', 'Exclusions')}
              </label>
              <div className="col-span-3">
                <textarea
                  id="exclusions"
                  value={exclusions}
                  onChange={(e) => setExclusions(e.target.value)}
                  rows={3}
                  className={cn(
                    "flex w-full rounded-md border border-input bg-background px-3 py-2",
                    "text-sm placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "resize-none"
                  )}
                  placeholder={t('hub.project.metadata.exclusionsPlaceholder', 'node_modules, .git, dist')}
                  aria-invalid={!!errors.exclusions}
                  aria-describedby={errors.exclusions ? 'exclusions-error' : 'exclusions-description'}
                />
                <p id="exclusions-description" className="text-sm text-muted-foreground mt-1">
                  {t('hub.project.metadata.exclusionsHint', 'Comma-separated glob patterns (e.g., *.log, node_modules)')}
                </p>
                {errors.exclusions && (
                  <p id="exclusions-error" className="text-sm text-destructive mt-1">
                    {errors.exclusions}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
            <Dialog.Close asChild>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center justify-center rounded-md text-sm font-medium",
                  "px-4 py-2 hover:bg-muted transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                )}
              >
                {t('hub.project.metadata.cancel', 'Cancel')}
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={handleSave}
              className={cn(
                "inline-flex items-center justify-center rounded-md text-sm font-medium",
                "px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90",
                "transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {t('hub.project.metadata.save', 'Save Changes')}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
