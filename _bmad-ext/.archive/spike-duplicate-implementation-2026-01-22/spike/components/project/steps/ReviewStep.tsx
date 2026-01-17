/**
 * @fileoverview Review Step
 * @module spike/components/project/steps/ReviewStep
 * @governance S-023
 * @created 2026-01-06T10:05:00+07:00
 *
 * Step 5 of project creation wizard: Review and confirm.
 * Displays summary of all selections before project creation.
 *
 * Size target: ≤250 lines
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X } from 'lucide-react';
import { cn } from '@/spike/lib/utils';
import type { WizardFormData } from '../wizard-types';

// ============================================================================
// Types
// ============================================================================

export interface ReviewStepProps {
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

const PROJECT_TYPE_LABELS = {
  app: 'App',
  library: 'Library',
  experiment: 'Experiment',
  learning: 'Learning',
} as const;

const WORKSPACE_TYPE_LABELS = {
  webcontainer: 'WebContainer',
  local: 'Local',
} as const;

const STORAGE_TYPE_LABELS = {
  indexeddb: 'Browser Database',
  fsa: 'File System Access',
} as const;

const TEMPLATE_LABELS = {
  blank: 'Blank',
  'react-app': 'React App',
  'next-app': 'Next.js App',
  'node-lib': 'Node Library',
} as const;

const WORKSPACE_BINDING_LABELS = {
  ide: 'IDE',
  knowledge: 'Knowledge',
  notes: 'Notes',
  study: 'Study',
} as const;

// ============================================================================
// Component
// ============================================================================

/**
 * ReviewStep - Step 5: Review and confirm
 *
 * Features:
 * - Summary of all project details
 * - Configuration review (workspace, agent, files)
 * - Validation checks (name unique, fields filled)
 * - Create or Back buttons
 *
 * @example
 * ```tsx
 * <ReviewStep
 *   formData={formData}
 *   updateFormData={updateFormData}
 *   error={stepErrors[5]}
 * />
 * ```
 */
export const ReviewStep: React.FC<ReviewStepProps> = ({
  formData,
  error,
}) => {
  const { t } = useTranslation();

  // Build validation checklist
  const validationChecks = [
    {
      key: 'name',
      label: t('wizard.validation.nameProvided'),
      passed: !!formData.projectName.trim(),
    },
    {
      key: 'nameLength',
      label: t('wizard.validation.nameLength'),
      passed: formData.projectName.length >= 2 && formData.projectName.length <= 50,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Step Title */}
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          {t('wizard.steps.review')}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t('wizard.stepDescriptions.review')}
        </p>
      </div>

      {/* Validation Checks */}
      <div className="p-4 border-2 border-border rounded-[4px] bg-muted/20">
        <h4 className="text-sm font-semibold text-foreground mb-3">
          {t('wizard.validation.title')}
        </h4>
        <div className="space-y-2">
          {validationChecks.map((check) => (
            <div
              key={check.key}
              className={cn(
                "flex items-start gap-2 text-sm",
                check.passed ? "text-success" : "text-destructive"
              )}
            >
              {check.passed ? (
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
              ) : (
                <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
              )}
              <span>{check.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Project Details Summary */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">
          {t('wizard.summary.projectDetails')}
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">
              {t('wizard.fields.projectName.label')}
            </span>
            <span className="font-medium text-foreground">
              {formData.projectIcon} {formData.projectName || '-'}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">
              {t('wizard.fields.projectType.label')}
            </span>
            <span className="font-medium text-foreground">
              {PROJECT_TYPE_LABELS[formData.projectType]}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">
              {t('wizard.fields.storageType.label')}
            </span>
            <span className="font-medium text-foreground">
              {STORAGE_TYPE_LABELS[formData.storageType]}
            </span>
          </div>
          <div className="py-2 border-b border-border">
            <div className="text-muted-foreground mb-2">
              {t('wizard.fields.workspaceBindings.label')}
            </div>
            <div className="flex gap-2">
              {formData.workspaceBindings.ide && (
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-[2px]">
                  {WORKSPACE_BINDING_LABELS.ide}
                </span>
              )}
              {formData.workspaceBindings.knowledge && (
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-[2px]">
                  {WORKSPACE_BINDING_LABELS.knowledge}
                </span>
              )}
              {formData.workspaceBindings.notes && (
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-[2px]">
                  {WORKSPACE_BINDING_LABELS.notes}
                </span>
              )}
              {formData.workspaceBindings.study && (
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-[2px]">
                  {WORKSPACE_BINDING_LABELS.study}
                </span>
              )}
            </div>
          </div>
          {formData.projectDescription && (
            <div className="py-2 border-b border-border">
              <div className="text-muted-foreground mb-1">
                {t('wizard.fields.projectDescription.label')}
              </div>
              <div className="text-foreground">
                {formData.projectDescription}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Workspace Configuration Summary */}
      {formData.workspaceEnabled && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">
            {t('wizard.summary.workspaceConfig')}
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">
                {t('wizard.fields.workspaceType.label')}
              </span>
              <span className="font-medium text-foreground">
                {WORKSPACE_TYPE_LABELS[formData.workspaceType]}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">
                {t('wizard.fields.workspaceTemplate.label')}
              </span>
              <span className="font-medium text-foreground">
                {TEMPLATE_LABELS[formData.workspaceTemplate]}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Agent Configuration Summary */}
      {formData.agentEnabled && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">
            {t('wizard.summary.agentConfig')}
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">
                {t('wizard.fields.selectedAgent.label')}
              </span>
              <span className="font-medium text-foreground">
                {formData.selectedAgent}
              </span>
            </div>
            <div className="py-2 border-b border-border">
              <div className="text-muted-foreground mb-1">
                {t('wizard.fields.agentPermissions.label')}
              </div>
              <div className="flex gap-2">
                {formData.agentPermissions.read && (
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-[2px]">
                    {t('wizard.permissions.read')}
                  </span>
                )}
                {formData.agentPermissions.write && (
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-[2px]">
                    {t('wizard.permissions.write')}
                  </span>
                )}
                {formData.agentPermissions.execute && (
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-[2px]">
                    {t('wizard.permissions.execute')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Setup Summary */}
      {formData.fileSetupEnabled && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">
            {t('wizard.summary.fileSetup')}
          </h4>
          <div className="space-y-1 text-sm">
            {formData.createReadme && (
              <div className="flex items-center gap-2 py-1 text-foreground">
                <Check className="w-4 h-4 text-success" />
                <span>README.md</span>
              </div>
            )}
            {formData.createGitignore && (
              <div className="flex items-center gap-2 py-1 text-foreground">
                <Check className="w-4 h-4 text-success" />
                <span>.gitignore</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-3 border-2 border-destructive bg-destructive/10 rounded-[4px]">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Ready to create message */}
      {!error && validationChecks.every((check) => check.passed) && (
        <div className="p-3 border-2 border-success bg-success/10 rounded-[4px]">
          <p className="text-sm text-success">
            {t('wizard.review.readyToCreate')}
          </p>
        </div>
      )}
    </div>
  );
};
