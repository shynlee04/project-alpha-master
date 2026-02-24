/**
 * @fileoverview Workspace Setup Step (Simplified)
 * @module presentation/components/project/steps/WorkspaceSetupStep
 * @governance S-023
 * @updated 2026-01-21 ARCH-01-04
 *
 * Simplified step 2: Workspace configuration (optional).
 *
 * Changes from original:
 * - Removed: workspaceName (auto-generated from project name)
 * - Removed: workspaceType (always 'local' for simplified UX)
 * - Templates: 4 options → 3 options (removed node-lib)
 * - Bindings: Updated to use simplified WorkspaceBindings type
 *
 * Size target: ≤150 lines
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
  updateFormData: <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) => void;
  error?: string;
}

// ============================================================================
// Constants
// ============================================================================

/** Simplified workspace templates (removed node-lib) */
const WORKSPACE_TEMPLATES = [
  { value: 'blank', labelKey: 'wizard.workspaceTemplates.blank', descriptionKey: 'wizard.workspaceTemplates.blankDesc' },
  { value: 'react-app', labelKey: 'wizard.workspaceTemplates.reactApp', descriptionKey: 'wizard.workspaceTemplates.reactAppDesc' },
  { value: 'next-app', labelKey: 'wizard.workspaceTemplates.nextApp', descriptionKey: 'wizard.workspaceTemplates.nextAppDesc' },
] as const;

// ============================================================================
// Component
// ============================================================================

/**
 * WorkspaceSetupStep - Simplified workspace configuration
 *
 * Simplified Features:
 * - Toggle to enable/disable workspace setup
 * - Template selection (3 options, down from 4)
 * - Auto-generated workspace name (from project name)
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

          {/* Workspace Bindings - Simplified (only notes/ide) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              {t('wizard.fields.workspaceBindings.label')}
            </label>
            <div className="text-xs text-muted-foreground mb-2">
              {t('wizard.fields.workspaceBindings.description')}
            </div>
            <div className="grid grid-cols-1 gap-2">
              {/* IDE Binding */}
              <div
                className={cn(
                  "flex items-start gap-3 p-3 border-2 rounded-[4px]",
                  formData.storageType !== 'fsa'
                    ? "border-border bg-muted/30 opacity-50 cursor-not-allowed"
                    : "border-border bg-background hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                )}
                onClick={() => {
                  if (formData.storageType === 'fsa') {
                    updateFormData('workspaceBindings', {
                      ...formData.workspaceBindings,
                      ide: !formData.workspaceBindings.ide,
                    });
                  }
                }}
              >
                <input
                  type="checkbox"
                  id="binding-ide"
                  checked={formData.workspaceBindings.ide}
                  disabled={formData.storageType !== 'fsa'}
                  onChange={() => {
                    if (formData.storageType === 'fsa') {
                      updateFormData('workspaceBindings', {
                        ...formData.workspaceBindings,
                        ide: !formData.workspaceBindings.ide,
                      });
                    }
                  }}
                  className="mt-0.5 w-4 h-4 min-w-[16px] min-h-[16px] border-2 border-border rounded-[4px]
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]
                             focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]
                             checked:bg-primary checked:border-primary
                             cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="flex-1">
                  <label
                    htmlFor="binding-ide"
                    className={cn(
                      "font-medium text-foreground text-sm cursor-pointer",
                      formData.storageType !== 'fsa' && "cursor-not-allowed"
                    )}
                  >
                    {t('wizard.workspaceBindings.ide')}
                  </label>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {t('wizard.workspaceBindings.ideDesc')}
                  </div>
                  {formData.storageType !== 'fsa' && (
                    <div className="text-xs text-muted-foreground mt-1 text-destructive">
                      {t('wizard.workspaceBindings.requiresFSA')}
                    </div>
                  )}
                </div>
              </div>

              {/* Notes Binding */}
              <div
                className="flex items-start gap-3 p-3 border-2 border-border rounded-[4px] bg-background hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                onClick={() => {
                  updateFormData('workspaceBindings', {
                    ...formData.workspaceBindings,
                    notes: !formData.workspaceBindings.notes,
                  });
                }}
              >
                <input
                  type="checkbox"
                  id="binding-notes"
                  checked={formData.workspaceBindings.notes}
                  onChange={() => {
                    updateFormData('workspaceBindings', {
                      ...formData.workspaceBindings,
                      notes: !formData.workspaceBindings.notes,
                    });
                  }}
                  className="mt-0.5 w-4 h-4 min-w-[16px] min-h-[16px] border-2 border-border rounded-[4px]
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]
                             focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]
                             checked:bg-primary checked:border-primary
                             cursor-pointer"
                />
                <div className="flex-1">
                  <label
                    htmlFor="binding-notes"
                    className="font-medium text-foreground text-sm cursor-pointer"
                  >
                    {t('wizard.workspaceBindings.notes')}
                  </label>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {t('wizard.workspaceBindings.notesDesc')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
