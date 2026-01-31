/**
 * @fileoverview Workspace Setup Step
 * @module spike/components/project/steps/WorkspaceSetupStep
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
import { cn } from '@/spike/lib/utils';
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

// Workspace binding options
const WORKSPACE_BINDINGS = [
  { key: 'ide' as const, labelKey: 'wizard.workspaceBindings.ide', descriptionKey: 'wizard.workspaceBindings.ideDesc', requiresFSA: true },
  { key: 'knowledge' as const, labelKey: 'wizard.workspaceBindings.knowledge', descriptionKey: 'wizard.workspaceBindings.knowledgeDesc', requiresFSA: false },
  { key: 'notes' as const, labelKey: 'wizard.workspaceBindings.notes', descriptionKey: 'wizard.workspaceBindings.notesDesc', requiresFSA: false },
  { key: 'study' as const, labelKey: 'wizard.workspaceBindings.study', descriptionKey: 'wizard.workspaceBindings.studyDesc', requiresFSA: false },
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

          {/* Workspace Bindings */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              {t('wizard.fields.workspaceBindings.label')}
            </label>
            <div className="text-xs text-muted-foreground mb-2">
              {t('wizard.fields.workspaceBindings.description')}
            </div>
            <div className="grid grid-cols-1 gap-2">
              {WORKSPACE_BINDINGS.map((binding) => {
                const isDisabled = binding.requiresFSA && formData.storageType !== 'fsa';
                const isChecked = formData.workspaceBindings[binding.key] === true;

                return (
                  <div
                    key={binding.key}
                    className={cn(
                      "flex items-start gap-3 p-3 border-2 rounded-[4px]",
                      "transition-all duration-150",
                      isDisabled
                        ? "border-border bg-muted/30 opacity-50 cursor-not-allowed"
                        : "border-border bg-background hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                    )}
                    onClick={() => {
                      if (!isDisabled) {
                        updateFormData('workspaceBindings', {
                          ...formData.workspaceBindings,
                          [binding.key]: !isChecked,
                        });
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      id={`binding-${binding.key}`}
                      checked={isChecked}
                      disabled={isDisabled}
                      onChange={() => {
                        if (!isDisabled) {
                          updateFormData('workspaceBindings', {
                            ...formData.workspaceBindings,
                            [binding.key]: !isChecked,
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
                        htmlFor={`binding-${binding.key}`}
                        className={cn(
                          "font-medium text-foreground text-sm cursor-pointer",
                          isDisabled && "cursor-not-allowed"
                        )}
                      >
                        {t(binding.labelKey)}
                      </label>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {t(binding.descriptionKey)}
                      </div>
                      {isDisabled && (
                        <div className="text-xs text-muted-foreground mt-1 text-destructive">
                          {t('wizard.workspaceBindings.requiresFSA')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
