/**
 * @fileoverview File Setup Step (Simplified)
 * @module presentation/components/project/steps/FileSetupStep
 * @governance S-023
 * @updated 2026-01-21 ARCH-01-04
 *
 * Simplified step 4: Initial file setup (optional).
 *
 * Changes from original:
 * - Removed: fileSetupEnabled toggle (always show this section when enabled)
 * - Removed: createGitignore (rarely needed, can be added later)
 * - Simplified: single createReadme toggle (default: true)
 *
 * Size target: ≤100 lines
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { WizardFormData } from '../wizard-types';

// ============================================================================
// Types
// ============================================================================

export interface FileSetupStepProps {
  formData: WizardFormData;
  updateFormData: <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) => void;
  error?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * FileSetupStep - Simplified file configuration
 *
 * Simplified Features:
 * - Single "Create README.md" toggle (default: true)
 * - Removed fileSetupEnabled toggle (section always visible in step 4)
 * - Removed createGitignore (can be added via Settings later)
 *
 * @example
 * ```tsx
 * <FileSetupStep
 *   formData={formData}
 *   updateFormData={updateFormData}
 *   error={stepErrors[4]}
 * />
 * ```
 */
export const FileSetupStep: React.FC<FileSetupStepProps> = ({
  formData,
  updateFormData,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Step Title */}
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          {t('wizard.steps.fileSetup')}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({t('wizard.optional')})
          </span>
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t('wizard.stepDescriptions.fileSetup')}
        </p>
      </div>

      {/* Create README Toggle */}
      <div className="flex items-center gap-3 p-4 border-2 border-border rounded-[4px] bg-background hover:border-primary/50 transition-colors">
        <input
          id="createReadme"
          type="checkbox"
          checked={formData.createReadme}
          onChange={(e) => updateFormData('createReadme', e.target.checked)}
          className="w-5 h-5 min-w-[20px] min-h-[20px] border-2 border-border rounded-[4px]
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]
                     focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]
                     checked:bg-primary checked:border-primary
                     cursor-pointer"
        />
        <label
          htmlFor="createReadme"
          className="flex-1 cursor-pointer"
        >
          <div className="font-medium text-foreground">
            {t('wizard.fileOptions.readme.label', 'Create README.md')}
          </div>
          <div className="text-sm text-muted-foreground">
            {t('wizard.fileOptions.readme.description',
              'Adds a basic README file with project name and description')}
          </div>
        </label>
      </div>

      {/* File Preview */}
      <div className="p-3 border-2 border-dashed border-border rounded-[4px] bg-muted/20">
        <div className="text-xs text-muted-foreground mb-2">
          {t('wizard.fields.filesPreview.description', 'Files to be created:')}
        </div>
        <div className="space-y-1">
          {formData.createReadme && (
            <div className="flex items-center gap-2 text-sm text-foreground">
              <span className="text-muted-foreground">📄</span>
              <code className="px-2 py-1 bg-muted rounded-[2px] text-xs">
                README.md
              </code>
            </div>
          )}
          {!formData.createReadme && (
            <div className="text-sm text-muted-foreground italic">
              {t('wizard.fields.filesPreview.noFiles', 'No files will be created')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
