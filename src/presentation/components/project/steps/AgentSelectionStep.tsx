/**
 * @fileoverview Agent Selection Step (Simplified)
 * @module presentation/components/project/steps/AgentSelectionStep
 * @governance S-023
 * @updated 2026-01-21 ARCH-01-04
 *
 * Simplified step 3: Agent configuration (optional).
 *
 * Changes from original:
 * - Removed: selectedAgent (always use default agent from settings)
 * - Permissions: 3 separate toggles → 1 simplified "Full Access" toggle
 * - Simplified toggle: enabled by default
 *
 * Size target: ≤100 lines
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { WizardFormData } from '../wizard-types';

// ============================================================================
// Types
// ============================================================================

export interface AgentSelectionStepProps {
  formData: WizardFormData;
  updateFormData: <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) => void;
  error?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * AgentSelectionStep - Simplified agent configuration
 *
 * Simplified Features:
 * - Toggle to enable/disable agent (default: true)
 * - Single "Full Access" permission toggle (instead of 3 separate toggles)
 *
 * @example
 * ```tsx
 * <AgentSelectionStep
 *   formData={formData}
 *   updateFormData={updateFormData}
 *   error={stepErrors[3]}
 * />
 * ```
 */
export const AgentSelectionStep: React.FC<AgentSelectionStepProps> = ({
  formData,
  updateFormData,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Step Title */}
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          {t('wizard.steps.agentSelection')}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({t('wizard.optional')})
          </span>
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t('wizard.stepDescriptions.agentSelection')}
        </p>
      </div>

      {/* Enable Agent Toggle */}
      <div className="flex items-center gap-3 p-4 border-2 border-border rounded-[4px] bg-muted/30">
        <input
          id="agentEnabled"
          type="checkbox"
          checked={formData.agentEnabled}
          onChange={(e) => updateFormData('agentEnabled', e.target.checked)}
          className="w-5 h-5 min-w-[20px] min-h-[20px] border-2 border-border rounded-[4px]
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]
                     focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]
                     checked:bg-primary checked:border-primary
                     cursor-pointer"
        />
        <label
          htmlFor="agentEnabled"
          className="flex-1 cursor-pointer"
        >
          <div className="font-medium text-foreground">
            {t('wizard.fields.enableAgent.label')}
          </div>
          <div className="text-sm text-muted-foreground">
            {t('wizard.fields.enableAgent.description')}
          </div>
        </label>
      </div>

      {formData.agentEnabled && (
        <div className="space-y-4 pl-4 border-l-2 border-primary/30">
          {/* Simplified Permission Toggle */}
          <div className="flex items-center gap-3 p-4 border-2 border-border rounded-[4px] bg-background">
            <input
              id="agentFullAccess"
              type="checkbox"
              checked={formData.agentFullAccess}
              onChange={(e) => updateFormData('agentFullAccess', e.target.checked)}
              className="w-5 h-5 min-w-[20px] min-h-[20px] border-2 border-border rounded-[4px]
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]
                         focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]
                         checked:bg-primary checked:border-primary
                         cursor-pointer"
            />
            <label
              htmlFor="agentFullAccess"
              className="flex-1 cursor-pointer"
            >
              <div className="font-medium text-foreground">
                {t('wizard.fields.agentFullAccess.label', 'Full Access')}
              </div>
              <div className="text-sm text-muted-foreground">
                {t('wizard.fields.agentFullAccess.description',
                  formData.agentFullAccess
                    ? 'Agent can read, write, and execute commands'
                    : 'Agent can only read files and suggest changes')}
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
