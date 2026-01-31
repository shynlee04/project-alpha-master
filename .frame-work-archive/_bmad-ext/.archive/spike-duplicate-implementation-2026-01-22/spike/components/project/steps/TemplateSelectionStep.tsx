/**
 * @fileoverview Template Selection Step
 * @module spike/components/project/steps/TemplateSelectionStep
 * @governance S-042
 * @created 2026-01-06T16:00:00+07:00
 *
 * Step 1.5 of project creation wizard: Select project template.
 * Browse templates, view details, and customize options.
 */

import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/spike/lib/utils';
// Note: TemplateGallery and TemplateCustomization may not exist in spike yet
// For now, this is a placeholder for the template selection step
// import { TemplateGallery } from '@/presentation/components/templates/TemplateGallery';
// import { TemplateCustomization } from '@/presentation/components/templates/TemplateCustomization';
// import { useProjectTemplates } from '@/hooks/useProjectTemplates';
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

  // Placeholder implementation - templates not yet available in spike
  const [showCustomization, setShowCustomization] = useState(false);

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

      {/* Placeholder for template gallery */}
      <div className="p-6 border-2 border-dashed border-border rounded-[4px] bg-muted/20 text-center">
        <p className="text-sm text-muted-foreground">
          Template selection coming soon in Phase 2
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          (Templates will be imported from @/presentation/components/templates/)
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 border-2 border-destructive bg-destructive/10 rounded-[4px]">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
};
