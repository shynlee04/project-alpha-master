/**
 * @fileoverview Project Creation Wizard
 * @module presentation/components/project/ProjectCreationWizard
 * @governance S-023
 * @created 2026-01-06T09:30:00+07:00
 *
 * Multi-step wizard for creating new projects with workspace configuration,
 * agent selection, and initial file setup.
 *
 * Pattern: Follows ProjectPickerDialog structure with multi-step navigation
 * Size target: ≤300 lines
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/infrastructure/persistence/stores/project/useProjectStore';
import type { CreateProjectInput } from '@/infrastructure/persistence/stores/project/project-types';
import type { WorkspaceBindings } from '@/infrastructure/persistence/dexie-db-core-types';

// Wizard Steps
import { ProjectDetailsStep } from './steps/ProjectDetailsStep';
import { WorkspaceSetupStep } from './steps/WorkspaceSetupStep';
import { AgentSelectionStep } from './steps/AgentSelectionStep';
import { FileSetupStep } from './steps/FileSetupStep';
import { ReviewStep } from './steps/ReviewStep';

// Import shared wizard types
import type { WizardFormData } from './wizard-types';

// ============================================================================
// Types
// ============================================================================

export interface ProjectCreationWizardProps {
  /** Dialog open state */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Callback when project is created successfully */
  onProjectCreated?: (projectId: string) => void;
}

/** Wizard step configuration */
interface WizardStep {
  id: number;
  titleKey: string;
  optional: boolean;
}

// Re-export WizardFormData for backwards compatibility
export type { WizardFormData } from './wizard-types';

// ============================================================================
// Constants
// ============================================================================

const WIZARD_STEPS: WizardStep[] = [
  { id: 1, titleKey: 'wizard.steps.projectDetails', optional: false },
  { id: 2, titleKey: 'wizard.steps.workspaceSetup', optional: true },
  { id: 3, titleKey: 'wizard.steps.agentSelection', optional: true },
  { id: 4, titleKey: 'wizard.steps.fileSetup', optional: true },
  { id: 5, titleKey: 'wizard.steps.review', optional: false },
];

const INITIAL_FORM_DATA: WizardFormData = {
  projectName: '',
  projectDescription: '',
  projectType: 'app',
  projectIcon: '📁',
  template: '',

  storageType: 'indexeddb',
  workspaceBindings: {
    knowledge: true,
    notes: true,
    study: true,
    // ide binding is set to false initially, will be enabled only for fsa
    ide: false,
  },

  workspaceEnabled: false,
  workspaceName: '',
  workspaceType: 'webcontainer',
  workspaceTemplate: 'blank',

  agentEnabled: false,
  selectedAgent: 'claude',
  agentPermissions: {
    read: true,
    write: false,
    execute: false,
  },

  fileSetupEnabled: false,
  createReadme: true,
  createGitignore: true,
  initialFiles: [],

  templateValidationError: undefined,
  packageManager: undefined,
};

// ============================================================================
// Component
// ============================================================================

/**
 * ProjectCreationWizard - Multi-step project creation wizard
 *
 * Features:
 * - 5-step wizard with progress indicator
 * - Back/Next navigation with keyboard shortcuts (Arrow Left/Right)
 * - Step validation before proceeding
 * - Can skip optional steps (2, 3, 4)
 * - Mobile-optimized layout (touch targets ≥44px)
 * - i18n strings via t() function
 * - 8-bit gaming style (no glassmorphism)
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 *
 * <ProjectCreationWizard
 *   open={open}
 *   onOpenChange={setOpen}
 *   onProjectCreated={(projectId) => navigate({
 *     to: '/ide/$projectId',
 *     params: { projectId }
 *   })}
 * />
 * ```
 */
export const ProjectCreationWizard: React.FC<ProjectCreationWizardProps> = ({
  open,
  onOpenChange,
  onProjectCreated,
}) => {
  const { t } = useTranslation();
  const createProject = useProjectStore((s) => s.createProject);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<WizardFormData>(INITIAL_FORM_DATA);
  const [stepErrors, setStepErrors] = useState<Record<number, string>>({});
  const [isCreating, setIsCreating] = useState(false);

  // Reset wizard when opened
  useEffect(() => {
    if (open) {
      setCurrentStep(1);
      setFormData(INITIAL_FORM_DATA);
      setStepErrors({});
      setIsCreating(false);
    }
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Arrow Left: Go back
      if (e.key === 'ArrowLeft' && currentStep > 1) {
        e.preventDefault();
        handleBack();
      }
      // Arrow Right: Go next (if valid)
      if (e.key === 'ArrowRight' && currentStep < 5) {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, currentStep, formData]);

  // Validate current step
  const validateStep = useCallback((step: number): boolean => {
    const errors: Record<number, string> = {};

    switch (step) {
      case 1: // Project Details
        if (!formData.projectName.trim()) {
          errors[1] = t('wizard.validation.projectNameRequired');
        } else if (formData.projectName.length < 2) {
          errors[1] = t('wizard.validation.projectNameTooShort');
        } else if (formData.projectName.length > 50) {
          errors[1] = t('wizard.validation.projectNameTooLong');
        }
        break;

      case 2: // Workspace Setup
        if (formData.workspaceEnabled && !formData.workspaceName.trim()) {
          errors[2] = t('wizard.validation.workspaceNameRequired');
        }
        break;

      // Steps 3, 4, 5 have no required validation
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, t]);

  // Handle back button
  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setStepErrors((prev) => {
        const { [currentStep]: _, ...rest } = prev;
        return rest;
      });
    }
  }, [currentStep]);

  // Handle next button
  const handleNext = useCallback(() => {
    if (!validateStep(currentStep)) return;

    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, validateStep]);

  // Handle step skip
  const handleSkip = useCallback(() => {
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
      setStepErrors((prev) => {
        const { [currentStep]: _, ...rest } = prev;
        return rest;
      });
    }
  }, [currentStep]);

  // Handle form data update
  const updateFormData = useCallback(<K extends keyof WizardFormData>(
    key: K,
    value: WizardFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Clear error for current step when data changes
    if (stepErrors[currentStep]) {
      setStepErrors((prev) => {
        const { [currentStep]: _, ...rest } = prev;
        return rest;
      });
    }
  }, [currentStep, stepErrors]);

  // Handle project creation
  const handleCreate = useCallback(async () => {
    if (!validateStep(5)) return;

    setIsCreating(true);

    try {
      // IDE workspace requires FSA storage type - force ide to false for indexeddb
      const finalBindings: WorkspaceBindings = {
        ...formData.workspaceBindings,
        ide: formData.storageType === 'fsa' && formData.workspaceBindings.ide === true,
      };

      // Create project input from wizard data
      const projectInput: CreateProjectInput = {
        name: formData.projectName,
        folderPath: formData.projectName.toLowerCase().replace(/\s+/g, '-'),
        storageType: formData.storageType,
        fsaHandle: formData.storageType === 'fsa' ? null : undefined,
        description: formData.projectDescription || undefined,
        tags: [formData.projectType],
        bindings: finalBindings,
      };

      // Create project
      const projectId = createProject(projectInput);

      // Close wizard
      onOpenChange(false);

      // Call success callback
      if (onProjectCreated) {
        onProjectCreated(projectId);
      }
    } catch (error) {
      console.error('[ProjectCreationWizard] Failed to create project:', error);
      setStepErrors({ 5: t('wizard.error.createFailed') });
    } finally {
      setIsCreating(false);
    }
  }, [formData, createProject, onOpenChange, onProjectCreated, validateStep, t]);

  // Check if current step is valid
  const isStepValid = useCallback(() => {
    return !stepErrors[currentStep];
  }, [stepErrors, currentStep]);

  // Check if we can skip current step
  const canSkipStep = useCallback(() => {
    const stepConfig = WIZARD_STEPS.find((s) => s.id === currentStep);
    return stepConfig?.optional && currentStep < 5;
  }, [currentStep]);

  // Render current step content
  const renderStep = () => {
    const props = {
      formData,
      updateFormData,
      error: stepErrors[currentStep],
    };

    switch (currentStep) {
      case 1:
        return <ProjectDetailsStep {...props} />;
      case 2:
        return <WorkspaceSetupStep {...props} />;
      case 3:
        return <AgentSelectionStep {...props} />;
      case 4:
        return <FileSetupStep {...props} />;
      case 5:
        return <ReviewStep {...props} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-background/95",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        !open && "hidden"
      )}
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className={cn(
            "w-full max-w-2xl border-2 border-border bg-card text-card-foreground",
            "shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] rounded-[4px]",
            "max-h-[90vh] overflow-y-auto"
          )}
        >
          {/* Header */}
          <div className="border-b-2 border-border p-6">
            <h2 className="text-2xl font-bold text-foreground">
              {t('wizard.title')}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t('wizard.description')}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="border-b-2 border-border px-6 py-4">
            <div className="flex items-center justify-between">
              {WIZARD_STEPS.map((step, index) => (
                <React.Fragment key={step.id}>
                  {/* Step indicator */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-10 h-10 min-w-[40px] min-h-[40px]",
                        "flex items-center justify-center",
                        "border-2 rounded-[4px] font-semibold text-sm",
                        "transition-colors duration-150",
                        currentStep === step.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : currentStep > step.id
                          ? "bg-success text-success-foreground border-success"
                          : "bg-muted text-muted-foreground border-border"
                      )}
                    >
                      {currentStep > step.id ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs mt-1 hidden sm:block",
                        currentStep === step.id
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      {t(step.titleKey)}
                    </span>
                  </div>

                  {/* Connector line */}
                  {index < WIZARD_STEPS.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 mx-2",
                        currentStep > step.id
                          ? "bg-success"
                          : "bg-border"
                      )}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="p-6 min-h-[300px]">{renderStep()}</div>

          {/* Footer Actions */}
          <div className="border-t-2 border-border p-6">
            <div className="flex justify-between items-center">
              {/* Back button */}
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 min-h-[44px]",
                  "border-2 border-border bg-background text-foreground",
                  "hover:bg-muted transition-colors rounded-[4px]",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                  "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                )}
              >
                <ArrowLeft className="w-4 h-4" />
                {t('wizard.actions.back')}
              </button>

              {/* Step info */}
              <div className="text-sm text-muted-foreground hidden sm:block">
                {t('wizard.stepProgress', {
                  current: currentStep,
                  total: WIZARD_STEPS.length,
                })}
              </div>

              {/* Next/Skip/Create button */}
              {currentStep === 5 ? (
                <button
                  onClick={handleCreate}
                  disabled={isCreating || !isStepValid()}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2 min-h-[44px]",
                    "bg-primary text-primary-foreground font-medium",
                    "hover:bg-primary/90 transition-colors rounded-[4px]",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                    "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                  )}
                >
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      {t('wizard.actions.creating')}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {t('wizard.actions.create')}
                    </>
                  )}
                </button>
              ) : (
                <div className="flex gap-2">
                  {canSkipStep() && (
                    <button
                      onClick={handleSkip}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 min-h-[44px]",
                        "border-2 border-border bg-background text-foreground",
                        "hover:bg-muted transition-colors rounded-[4px]",
                        "focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                        "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                      )}
                    >
                      {t('wizard.actions.skip')}
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    disabled={!isStepValid()}
                    className={cn(
                      "flex items-center gap-2 px-6 py-2 min-h-[44px]",
                      "bg-primary text-primary-foreground font-medium",
                      "hover:bg-primary/90 transition-colors rounded-[4px]",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                      "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                    )}
                  >
                    {t('wizard.actions.next')}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Keyboard hint */}
            <div className="mt-4 text-center text-xs text-muted-foreground">
              {t('wizard.keyboardHint')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
