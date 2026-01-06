/**
 * @fileoverview File Setup Step
 * @module presentation/components/project/steps/FileSetupStep
 * @governance S-023
 * @created 2026-01-06T10:00:00+07:00
 *
 * Step 4 of project creation wizard: Initial file setup (optional).
 * Collects options for creating initial files like README.md and .gitignore.
 *
 * Size target: ≤200 lines
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { WizardFormData } from '../ProjectCreationWizard';

// ============================================================================
// Types
// ============================================================================

export interface FileSetupStepProps {
  formData: WizardFormData;
  updateFormData: <K extends keyof WizardFormData>(
    key: K,
    value: WizardFormData[K]
  ) => void;
  error?: string;
}

// ============================================================================
// Constants
// ============================================================================

const FILE_OPTIONS = [
  {
    key: 'createReadme',
    labelKey: 'wizard.fileOptions.readme.label',
    descriptionKey: 'wizard.fileOptions.readme.description',
  },
  {
    key: 'createGitignore',
    labelKey: 'wizard.fileOptions.gitignore.label',
    descriptionKey: 'wizard.fileOptions.gitignore.description',
  },
] as const;

// ============================================================================
// Component
// ============================================================================

/**
 * FileSetupStep - Step 4: Initial file setup (optional)
 *
 * Features:
 * - Toggle to enable/disable file setup
 * - Create README.md option
 * - Create .gitignore option
 * - Preview of files to be created
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

  const handleFileOptionChange = (option: 'createReadme' | 'createGitignore', value: boolean) => {
    updateFormData(option, value);
  };

  // Build list of files to be created
  const filesToCreate: string[] = [];
  if (formData.fileSetupEnabled) {
    if (formData.createReadme) filesToCreate.push('README.md');
    if (formData.createGitignore) filesToCreate.push('.gitignore');
  }

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

      {/* Enable File Setup Toggle */}
      <div className="flex items-center gap-3 p-4 border-2 border-border rounded-[4px] bg-muted/30">
        <input
          id="fileSetupEnabled"
          type="checkbox"
          checked={formData.fileSetupEnabled}
          onChange={(e) => updateFormData('fileSetupEnabled', e.target.checked)}
          className="w-5 h-5 min-w-[20px] min-h-[20px] border-2 border-border rounded-[4px]
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]
                     focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]
                     checked:bg-primary checked:border-primary
                     cursor-pointer"
        />
        <label
          htmlFor="fileSetupEnabled"
          className="flex-1 cursor-pointer"
        >
          <div className="font-medium text-foreground">
            {t('wizard.fields.enableFileSetup.label')}
          </div>
          <div className="text-sm text-muted-foreground">
            {t('wizard.fields.enableFileSetup.description')}
          </div>
        </label>
      </div>

      {formData.fileSetupEnabled && (
        <div className="space-y-4 pl-4 border-l-2 border-primary/30">
          {/* File Options */}
          <div className="space-y-3">
            {FILE_OPTIONS.map((option) => (
              <div
                key={option.key}
                className="flex items-start gap-3 p-3 border-2 border-border rounded-[4px] bg-background"
              >
                <input
                  id={`fileOption-${option.key}`}
                  type="checkbox"
                  checked={formData[option.key]}
                  onChange={(e) =>
                    handleFileOptionChange(
                      option.key,
                      e.target.checked
                    )
                  }
                  className="mt-1 w-4 h-4 min-w-[16px] min-h-[16px] border-2 border-border rounded-[4px]
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]
                             focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]
                             checked:bg-primary checked:border-primary
                             cursor-pointer"
                />
                <label
                  htmlFor={`fileOption-${option.key}`}
                  className="flex-1 cursor-pointer"
                >
                  <div className="font-medium text-foreground text-sm">
                    {t(option.labelKey)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {t(option.descriptionKey)}
                  </div>
                </label>
              </div>
            ))}
          </div>

          {/* Preview of files to be created */}
          {filesToCreate.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                {t('wizard.fields.filesPreview.label')}
              </label>
              <div className="p-3 border-2 border-dashed border-border rounded-[4px] bg-muted/20">
                <div className="text-xs text-muted-foreground mb-2">
                  {t('wizard.fields.filesPreview.description')}
                </div>
                <div className="space-y-1">
                  {filesToCreate.map((fileName) => (
                    <div
                      key={fileName}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <span className="text-muted-foreground">📄</span>
                      <code className="px-2 py-1 bg-muted rounded-[2px] text-xs">
                        {fileName}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Empty state message */}
          {filesToCreate.length === 0 && (
            <div className="p-4 border-2 border-dashed border-border rounded-[4px] bg-muted/20 text-center">
              <div className="text-sm text-muted-foreground">
                {t('wizard.fields.filesPreview.noFiles')}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
