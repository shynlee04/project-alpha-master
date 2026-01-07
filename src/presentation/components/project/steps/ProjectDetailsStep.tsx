/**
 * @fileoverview Project Details Step
 * @module presentation/components/project/steps/ProjectDetailsStep
 * @governance S-023
 * @created 2026-01-06T09:45:00+07:00
 *
 * Step 1 of project creation wizard: Basic project information.
 * Collects project name, description, type, and icon.
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

export interface ProjectDetailsStepProps {
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

const PROJECT_ICONS = ['📁', '💻', '🎮', '🚀', '⚡', '🔥', '💎', '🎨', '📊', '🔧'];

const PROJECT_TYPES = [
  { value: 'app', labelKey: 'wizard.projectTypes.app' },
  { value: 'library', labelKey: 'wizard.projectTypes.library' },
  { value: 'experiment', labelKey: 'wizard.projectTypes.experiment' },
  { value: 'learning', labelKey: 'wizard.projectTypes.learning' },
] as const;

const STORAGE_TYPES = [
  {
    value: 'indexeddb' as const,
    labelKey: 'wizard.storageTypes.indexeddb',
    descriptionKey: 'wizard.storageTypes.indexeddbDesc',
  },
  {
    value: 'fsa' as const,
    labelKey: 'wizard.storageTypes.fsa',
    descriptionKey: 'wizard.storageTypes.fsaDesc',
  },
] as const;

// ============================================================================
// Component
// ============================================================================

/**
 * ProjectDetailsStep - Step 1: Basic project information
 *
 * Features:
 * - Project name input (2-50 chars, required)
 * - Description textarea (optional, max 500 chars)
 * - Project type dropdown (app, library, experiment, learning)
 * - Icon selection (emoji picker)
 *
 * @example
 * ```tsx
 * <ProjectDetailsStep
 *   formData={formData}
 *   updateFormData={updateFormData}
 *   error={stepErrors[1]}
 * />
 * ```
 */
export const ProjectDetailsStep: React.FC<ProjectDetailsStepProps> = ({
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
          {t('wizard.steps.projectDetails')}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t('wizard.stepDescriptions.projectDetails')}
        </p>
      </div>

      {/* Project Name */}
      <div className="space-y-2">
        <label
          htmlFor="projectName"
          className="block text-sm font-medium text-foreground"
        >
          {t('wizard.fields.projectName.label')}
          <span className="text-destructive ml-1" aria-label="required">
            *
          </span>
        </label>
        <input
          id="projectName"
          type="text"
          value={formData.projectName}
          onChange={(e) => updateFormData('projectName', e.target.value)}
          placeholder={t('wizard.fields.projectName.placeholder')}
          maxLength={50}
          className={cn(
            "w-full px-3 py-2 min-h-[44px]",
            "border-2 border-border bg-background text-foreground",
            "rounded-[4px] placeholder:text-muted-foreground",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
            "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-destructive focus-visible:ring-destructive"
          )}
          aria-invalid={!!error}
          aria-describedby={error ? 'projectName-error' : undefined}
        />
        <div className="flex justify-between text-xs">
          <span className={cn(error ? "text-destructive" : "text-muted-foreground")}>
            {error || t('wizard.fields.projectName.help')}
          </span>
          <span className="text-muted-foreground">
            {formData.projectName.length}/50
          </span>
        </div>
      </div>

      {/* Project Description */}
      <div className="space-y-2">
        <label
          htmlFor="projectDescription"
          className="block text-sm font-medium text-foreground"
        >
          {t('wizard.fields.projectDescription.label')}
        </label>
        <textarea
          id="projectDescription"
          value={formData.projectDescription}
          onChange={(e) => updateFormData('projectDescription', e.target.value)}
          placeholder={t('wizard.fields.projectDescription.placeholder')}
          maxLength={500}
          rows={3}
          className={cn(
            "w-full px-3 py-2 min-h-[44px]",
            "border-2 border-border bg-background text-foreground",
            "rounded-[4px] placeholder:text-muted-foreground",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
            "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
            "disabled:opacity-50 disabled:cursor-not-allowed resize-y"
          )}
        />
        <div className="text-xs text-muted-foreground text-right">
          {formData.projectDescription.length}/500
        </div>
      </div>

      {/* Project Type */}
      <div className="space-y-2">
        <label
          htmlFor="projectType"
          className="block text-sm font-medium text-foreground"
        >
          {t('wizard.fields.projectType.label')}
        </label>
        <div className="relative">
          <select
            id="projectType"
            value={formData.projectType}
            onChange={(e) =>
              updateFormData('projectType', e.target.value as WizardFormData['projectType'])
            }
            className={cn(
              "w-full px-3 py-2 min-h-[44px]",
              "border-2 border-border bg-background text-foreground",
              "rounded-[4px] appearance-none",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
              "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "cursor-pointer"
            )}
          >
            {PROJECT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {t(type.labelKey)}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
            ▼
          </div>
        </div>
      </div>

      {/* Storage Type */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          {t('wizard.fields.storageType.label')}
        </label>
        <div className="grid grid-cols-1 gap-2">
          {STORAGE_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() =>
                updateFormData('storageType', type.value)
              }
              className={cn(
                "p-3 min-h-[44px] border-2 rounded-[4px]",
                "text-left transition-all duration-150",
                "hover:border-primary/50 hover:bg-primary/5",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
                formData.storageType === type.value
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background"
              )}
              aria-pressed={formData.storageType === type.value}
            >
              <div className="font-medium text-foreground text-sm">
                {t(type.labelKey)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {t(type.descriptionKey)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Project Icon */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          {t('wizard.fields.projectIcon.label')}
        </label>
        <div className="flex flex-wrap gap-2">
          {PROJECT_ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => updateFormData('projectIcon', icon)}
              className={cn(
                "w-12 h-12 min-w-[48px] min-h-[48px]",
                "flex items-center justify-center",
                "border-2 rounded-[4px] text-2xl",
                "transition-all duration-150",
                "hover:bg-muted hover:scale-110",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
                formData.projectIcon === icon
                  ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                  : "border-border bg-background"
              )}
              aria-label={`Select icon ${icon}`}
              aria-pressed={formData.projectIcon === icon}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
