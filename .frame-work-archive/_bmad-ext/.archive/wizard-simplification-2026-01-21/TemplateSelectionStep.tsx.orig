/**
 * @fileoverview Template Selection Step
 * @module presentation/components/project/steps/TemplateSelectionStep
 * @governance S-042
 * @created 2026-01-06T16:00:00+07:00
 *
 * Step 1.5 of project creation wizard: Select project template.
 * Browse templates, view details, and customize options.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TemplateGallery } from '@/presentation/components/templates/TemplateGallery';
import { TemplateCustomization } from '@/presentation/components/templates/TemplateCustomization';
import { useProjectTemplates } from '@/hooks/useProjectTemplates';
import type { WizardFormData } from '../ProjectCreationWizard';

// ============================================================================
// Types
// ============================================================================

export interface TemplateSelectionStepProps {
  formData: WizardFormData;
  updateFormData: <K extends keyof WizardFormData>(
    key: K,
    value: WizardFormData[K]
  ) => void;
  error?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * TemplateSelectionStep - Step 1.5: Select and customize project template
 *
 * Features:
 * - Template gallery with search and filter
 * - Template customization options
 * - Package manager selection
 * - Two-panel layout (gallery left, customization right)
 * - Mobile-optimized with collapsible panels
 * - Touch targets ≥44px
 * - i18n strings via t() function
 * - 8-bit gaming style (no glassmorphism)
 *
 * @example
 * ```tsx
 * <TemplateSelectionStep
 *   formData={formData}
 *   updateFormData={updateFormData}
 * />
 * ```
 */
export const TemplateSelectionStep: React.FC<TemplateSelectionStepProps> = ({
  formData,
  updateFormData,
  error,
}) => {
  const { t } = useTranslation();

  // Template management hook
  const {
    template,
    packageManager,
    customizations,
    selectTemplate,
    updatePackageManager,
    updateCustomization,
    validate,
  } = useProjectTemplates();

  // UI state
  const [showCustomization, setShowCustomization] = useState(false);

  // FIX: Use refs to stabilize callback access and prevent infinite useEffect loops
  // Initialize with null, will be updated after callbacks are defined
  const updateFormDataRef = useRef(updateFormData);
  const handleValidateRef = useRef<(() => string | undefined) | null>(null);

  // Update refs when callbacks change
  useEffect(() => {
    updateFormDataRef.current = updateFormData;
  }, [updateFormData]);

  // Initialize with selected template if available
  React.useEffect(() => {
    if (formData.template && !template) {
      selectTemplate(formData.template);
    }
  }, [formData.template, template]); // selectTemplate is stable from useProjectTemplates

  // Handle template selection
  const handleTemplateSelect = useCallback(
    (selectedTemplate: any) => {
      selectTemplate(selectedTemplate.id);
      updateFormData('template', selectedTemplate.id);
      setShowCustomization(true);
    },
    [selectTemplate, updateFormData]
  );

  // Handle validation before proceeding
  const handleValidate = useCallback(() => {
    const validation = validate();
    if (!validation.valid) {
      return validation.errors.join(', ');
    }
    return undefined;
  }, [validate]);

  // Sync handleValidate ref after definition
  useEffect(() => {
    handleValidateRef.current = handleValidate;
  }, [handleValidate]);

  // Validate step on render (parent will call this)
  React.useEffect(() => {
    if (template && showCustomization) {
      const validationError = handleValidateRef.current?.();
      if (validationError && error !== validationError) {
        // Pass error to parent via formData callback
        updateFormDataRef.current('templateValidationError', validationError as any);
      }
    }
  }, [template, showCustomization, error]);

  // Sync handleValidate ref after definition
  useEffect(() => {
    handleValidateRef.current = handleValidate;
  }, [handleValidate]);

  return (
    <div className="space-y-6">
      {/* Step Title */}
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          {t('wizard.steps.templateSelection')}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t('wizard.stepDescriptions.templateSelection')}
        </p>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Template Gallery */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">
              {t('templates.gallery.title')}
            </h4>
            {template && (
              <button
                type="button"
                onClick={() => setShowCustomization(!showCustomization)}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 text-sm border-2 rounded-[4px]",
                  "transition-colors duration-150",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                  "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
                  showCustomization
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:bg-muted"
                )}
              >
                {t('templates.customization.button')}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <TemplateGallery
            selectedTemplateId={template?.id}
            onSelectTemplate={handleTemplateSelect}
            featuredOnly={false}
            showPreview={false}
          />
        </div>

        {/* Right Panel: Template Customization */}
        {template && (
          <div
            className={cn(
              "space-y-4 transition-all duration-300",
              showCustomization
                ? "opacity-100"
                : "opacity-50 pointer-events-none lg:pointer-events-auto"
            )}
          >
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                {t('templates.customization.title')}
              </h4>
            </div>

            <TemplateCustomization
              template={template}
              customizations={customizations}
              onCustomizationChange={(updates) => {
                Object.entries(updates).forEach(([key, value]) => {
                  updateCustomization(key, value);
                });
              }}
              packageManager={packageManager}
              onPackageManagerChange={(pm) => {
                updatePackageManager(pm);
                updateFormData('packageManager', pm as any);
              }}
            />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 border-2 border-destructive bg-destructive/10 rounded-[4px]">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Selection Summary */}
      {template && !showCustomization && (
        <div className="border-2 border-primary bg-primary/5 rounded-[4px] p-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-1">
                {t('templates.selection.selected')}
              </h4>
              <p className="text-base font-medium text-primary">{template.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {template.description}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCustomization(true)}
              className={cn(
                "px-4 py-2 min-h-[44px]",
                "bg-primary text-primary-foreground font-medium text-sm",
                "hover:bg-primary/90 transition-colors rounded-[4px]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
              )}
            >
              {t('templates.selection.customize')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
