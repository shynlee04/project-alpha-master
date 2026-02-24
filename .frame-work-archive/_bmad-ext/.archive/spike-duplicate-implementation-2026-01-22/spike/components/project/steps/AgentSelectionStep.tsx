/**
 * @fileoverview Agent Selection Step
 * @module spike/components/project/steps/AgentSelectionStep
 * @governance S-023
 * @created 2026-01-06T09:55:00+07:00
 *
 * ═══════════════════════════════════════════════════════════════
 * ⚠️ PHASE 1 DETACHMENT
 * Feature: Agent Selection with Tool Permissions (202 lines)
 * Reason: Agent configuration complexity - P1-08 (Vault Chain) must complete first
 * Re-attach in: Phase 2 (after P1-09: Simplify Agent/Key Flow)
 * Gate: P1-08 DONE, P1-09 DONE (Vault → AI chain working)
 * Tracking: _bmad-output/project-planning-artifacts/phase-1-epics-2026-01-08.md
 * ═══════════════════════════════════════════════════════════════
 *
 * PHASE 1 STATUS: PRESERVED - Step remains optional in wizard
 * Phase 1 uses simplified agent/key flow (settings → API key entry).
 * Full agent selection in project creation available in Phase 2.
 *
 * Step 3 of project creation wizard: Agent configuration (optional).
 * Collects default agent selection and tool permissions.
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

export interface AgentSelectionStepProps {
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

const AGENTS = [
  { value: 'claude', labelKey: 'wizard.agents.claude', icon: '🤖' },
  { value: 'gpt-4', labelKey: 'wizard.agents.gpt4', icon: '🧠' },
  { value: 'gemini', labelKey: 'wizard.agents.gemini', icon: '✨' },
  { value: 'local', labelKey: 'wizard.agents.local', icon: '💻' },
] as const;

const PERMISSIONS = [
  { key: 'read', labelKey: 'wizard.permissions.read', descriptionKey: 'wizard.permissions.readDesc' },
  { key: 'write', labelKey: 'wizard.permissions.write', descriptionKey: 'wizard.permissions.writeDesc' },
  { key: 'execute', labelKey: 'wizard.permissions.execute', descriptionKey: 'wizard.permissions.executeDesc' },
] as const;

// ============================================================================
// Component
// ============================================================================

/**
 * AgentSelectionStep - Step 3: Agent configuration (optional)
 *
 * Features:
 * - Toggle to enable/disable agent selection
 * - Agent selection (Claude, GPT-4, Gemini, Local)
 * - Tool permission toggles (read, write, execute)
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

  const handlePermissionChange = (permission: 'read' | 'write' | 'execute', value: boolean) => {
    updateFormData('agentPermissions', {
      ...formData.agentPermissions,
      [permission]: value,
    });
  };

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
          {/* Agent Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              {t('wizard.fields.selectedAgent.label')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {AGENTS.map((agent) => (
                <button
                  key={agent.value}
                  type="button"
                  onClick={() => updateFormData('selectedAgent', agent.value)}
                  className={cn(
                    "p-3 min-h-[44px] border-2 rounded-[4px]",
                    "text-left transition-all duration-150",
                    "hover:border-primary/50 hover:bg-primary/5",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                    "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
                    formData.selectedAgent === agent.value
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background"
                  )}
                  aria-pressed={formData.selectedAgent === agent.value}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{agent.icon}</span>
                    <div className="font-medium text-foreground text-sm">
                      {t(agent.labelKey)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Agent Permissions */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              {t('wizard.fields.agentPermissions.label')}
            </label>
            <div className="space-y-2">
              {PERMISSIONS.map((permission) => (
                <div
                  key={permission.key}
                  className="flex items-start gap-3 p-3 border-2 border-border rounded-[4px] bg-background"
                >
                  <input
                    id={`permission-${permission.key}`}
                    type="checkbox"
                    checked={formData.agentPermissions[permission.key]}
                    onChange={(e) =>
                      handlePermissionChange(permission.key, e.target.checked)
                    }
                    className="mt-1 w-4 h-4 min-w-[16px] min-h-[16px] border-2 border-border rounded-[4px]
                                   focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]
                                   focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]
                                   checked:bg-primary checked:border-primary
                                   cursor-pointer"
                  />
                  <label
                    htmlFor={`permission-${permission.key}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="font-medium text-foreground text-sm">
                      {t(permission.labelKey)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t(permission.descriptionKey)}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
