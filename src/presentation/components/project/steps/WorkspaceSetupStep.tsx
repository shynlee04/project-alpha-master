/**
 * @fileoverview Workspace Setup Step
 * @module presentation/components/project/steps/WorkspaceSetupStep
 * @governance S-023
 * @created 2026-01-06T09:50:00+07:00
 *
 * Step 2 of project creation wizard: Workspace configuration (optional).
 * Collects workspace name, type, and template selection.
 *
 * Size target: ≤200 lines
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { WizardFormData } from '../wizard-types';

// ============================================================================
// Types
// ============================================================================

export interface WorkspaceSetupStepProps {
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

const WORKSPACE_TYPES = [
  { value: 'webcontainer', labelKey: 'wizard.workspaceTypes.webcontainer' },
  { value: 'local', labelKey: 'wizard.workspaceTypes.local' },
] as const;

const WORKSPACE_TEMPLATES = [
  { value: 'blank', labelKey: 'wizard.workspaceTemplates.blank', descriptionKey: 'wizard.workspaceTemplates.blankDesc' },
  { value: 'react-app', labelKey: 'wizard.workspaceTemplates.reactApp', descriptionKey: 'wizard.workspaceTemplates.reactAppDesc' },
  { value: 'next-app', labelKey: 'wizard.workspaceTemplates.nextApp', descriptionKey: 'wizard.workspaceTemplates.nextAppDesc' },
  { value: 'node-lib', labelKey: 'wizard.workspaceTemplates.nodeLib', descriptionKey: 'wizard.workspaceTemplates.nodeLibDesc' },
] as const;

// ============================================================================
// Component
// ============================================================================

/**
 * WorkspaceSetupStep - Step 2: Workspace configuration (optional)
 *
 * Features:
 * - Toggle to enable/disable workspace setup
 * - Workspace name input (required if enabled)
 * - Workspace type (local or WebContainer)
 * - Template selection (blank, react-app, next-app, node-lib)
 *
 * @example
 * ```tsx
 * <WorkspaceSetupStep
 *   formData={formData}
 *   updateFormData={updateFormData}
 *   error={stepErrors[2]}
 * />
 * ```
 */
export const WorkspaceSetupStep: React.FC<WorkspaceSetupStepProps> = ({
  formData,
  updateFormData,
  error,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Step Title */}
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          {t('wizard.steps.workspaceSetup')}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({t('wizard.optional')})
          </span>
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t('wizard.stepDescriptions.workspaceSetup')}
        </p>
      </div>

      {/* Enable Workspace Toggle */}
      <div className="flex items-center gap-3 p-4 border-2 border-border rounded-[4px] bg-muted/30">
        <input
          id="workspaceEnabled"
          type="checkbox"
          checked={formData.workspaceEnabled}
          onChange={(e) => updateFormData('workspaceEnabled', e.target.checked)}
          className="w-5 h-5 min-w-[20px] min-h-[20px] border-2 border-border rounded-[4px]
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]
                     focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]
                     checked:bg-primary checked:border-primary
                     cursor-pointer"
        />
        <label
          htmlFor="workspaceEnabled"
          className="flex-1 cursor-pointer"
        >
          <div className="font-medium text-foreground">
            {t('wizard.fields.enableWorkspace.label')}
          </div>
          <div className="text-sm text-muted-foreground">
            {t('wizard.fields.enableWorkspace.description')}
          </div>
        </label>
      </div>

      {formData.workspaceEnabled && (
        <div className="space-y-4 pl-4 border-l-2 border-primary/30">
          {/* Workspace Name */}
          <div className="space-y-2">
            <label
              htmlFor="workspaceName"
              className="block text-sm font-medium text-foreground"
            >
              {t('wizard.fields.workspaceName.label')}
            </label>
            <input
              id="workspaceName"
              type="text"
              value={formData.workspaceName}
              onChange={(e) => updateFormData('workspaceName', e.target.value)}
              placeholder={t('wizard.fields.workspaceName.placeholder')}
              className={cn(
                "w-full px-3 py-2 min-h-[44px]",
                "border-2 border-border bg-background text-foreground",
                "rounded-[4px] placeholder:text-muted-foreground",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
                error && "border-destructive focus-visible:ring-destructive"
              )}
              aria-invalid={!!error}
              aria-describedby={error ? 'workspaceName-error' : undefined}
            />
            {error && (
              <p id="workspaceName-error" className="text-xs text-destructive">
                {error}
              </p>
            )}
          </div>

          {/* Workspace Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              {t('wizard.fields.workspaceType.label')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {WORKSPACE_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() =>
                    updateFormData('workspaceType', type.value as WizardFormData['workspaceType'])
                  }
                  className={cn(
                    "p-3 min-h-[44px] border-2 rounded-[4px]",
                    "text-left transition-all duration-150",
                    "hover:border-primary/50 hover:bg-primary/5",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                    "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
                    formData.workspaceType === type.value
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background"
                  )}
                  aria-pressed={formData.workspaceType === type.value}
                >
                  <div className="font-medium text-foreground text-sm">
                    {t(type.labelKey)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Workspace Template */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              {t('wizard.fields.workspaceTemplate.label')}
            </label>
            <div className="grid grid-cols-1 gap-2">
              {WORKSPACE_TEMPLATES.map((template) => (
                <button
                  key={template.value}
                  type="button"
                  onClick={() =>
                    updateFormData('workspaceTemplate', template.value as WizardFormData['workspaceTemplate'])
                  }
                  className={cn(
                    "p-3 min-h-[44px] border-2 rounded-[4px]",
                    "text-left transition-all duration-150",
                    "hover:border-primary/50 hover:bg-primary/5",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                    "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
                    formData.workspaceTemplate === template.value
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background"
                  )}
                  aria-pressed={formData.workspaceTemplate === template.value}
                >
                  <div className="font-medium text-foreground text-sm">
                    {t(template.labelKey)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {t(template.descriptionKey)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
