/**
 * Feature Discovery Guide Component
 *
 * @epic Epic-23 Story P1.3
 * @description
 * Interactive feature discovery guide with on-demand help.
 * Uses 8-bit design system styling and CVA patterns from P1.2.
 * Supports i18n for internationalization.
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, ChevronLeft, ChevronRight, Sparkles, CheckCircle2, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import "@/styles/design-tokens.css";

/**
 * Guide variants using CVA
 */
const guideVariants = cva(
  [
    "fixed inset-0 z-50",
    "bg-background/95 backdrop-blur-sm",
    "border-2 border-border",
    "rounded-none shadow-lg",
    "max-w-3xl max-h-[85vh]",
    "overflow-hidden",
  ],
  {
    variants: {
      default: {},
    },
  }
);

export interface FeatureStep {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  category: string;
  action?: () => void;
}

export interface FeatureDiscoveryGuideProps {
  isOpen: boolean;
  onClose: () => void;
  steps: FeatureStep[];
  startStep?: number;
  onComplete?: () => void;
  className?: string;
}

/**
 * Default feature discovery steps
 */
const defaultSteps: FeatureStep[] = [
  {
    id: "welcome",
    title: "discovery.welcome.title",
    description: "discovery.welcome.description",
    icon: <Sparkles className="w-8 h-8 text-primary" />,
    category: "overview",
  },
  {
    id: "file-explorer",
    title: "discovery.fileExplorer.title",
    description: "discovery.fileExplorer.description",
    category: "sidebar",
  },
  {
    id: "editor",
    title: "discovery.editor.title",
    description: "discovery.editor.description",
    category: "editor",
  },
  {
    id: "terminal",
    title: "discovery.terminal.title",
    description: "discovery.terminal.description",
    category: "terminal",
  },
  {
    id: "ai-agent",
    title: "discovery.aiAgent.title",
    description: "discovery.aiAgent.description",
    category: "ai",
  },
  {
    id: "keyboard-shortcuts",
    title: "discovery.keyboardShortcuts.title",
    description: "discovery.keyboardShortcuts.description",
    category: "navigation",
  },
  {
    id: "settings",
    title: "discovery.settings.title",
    description: "discovery.settings.description",
    category: "settings",
  },
  {
    id: "complete",
    title: "discovery.complete.title",
    description: "discovery.complete.description",
    icon: <CheckCircle2 className="w-8 h-8 text-primary" />,
    category: "overview",
  },
];

/**
 * FeatureDiscoveryGuide - Interactive feature discovery guide
 *
 * Provides on-demand help and interactive tour of IDE features.
 * Maintains 8-bit aesthetic with smooth animations.
 */
export function FeatureDiscoveryGuide({
  isOpen,
  onClose,
  steps = defaultSteps,
  startStep = 0,
  onComplete,
  className,
}: FeatureDiscoveryGuideProps) {
  const [currentStep, setCurrentStep] = React.useState(startStep);
  const [completedSteps, setCompletedSteps] = React.useState<Set<string>>(new Set());

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    setCompletedSteps((prev) => new Set([...prev, currentStepData.id]));
    if (isLastStep) {
      onComplete?.();
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };

  const isStepCompleted = (stepId: string) => completedSteps.has(stepId);

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <DialogPrimitive.Content
          className={cn(guideVariants(), className)}
          onPointerDownOutside={(e) => {
            if (e.target === e.currentTarget) return;
            onClose();
          }}
          onEscapeKeyDown={onClose}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-secondary/30">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                discovery.title
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X className="w-5 h-5" />
              <span className="text-sm">discovery.close</span>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-3 bg-secondary/20 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                discovery.progress
              </span>
              <span className="text-sm font-medium text-foreground">
                {currentStep + 1} / {steps.length}
              </span>
            </div>
            <div className="w-full h-2 bg-background border border-border rounded-none overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step Navigation */}
          <div className="flex gap-2 px-6 py-3 border-b border-border overflow-x-auto">
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = isStepCompleted(step.id);

              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  className={cn(
                    "flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-none border-2 transition-colors",
                    "hover:bg-accent/50",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : isCompleted
                      ? "bg-secondary/30 text-foreground border-border"
                      : "text-muted-foreground border-transparent hover:border-border"
                  )}
                >
                  {isCompleted && !isActive && (
                    <CheckCircle2 className="w-3 h-3" />
                  )}
                  <span className="text-xs font-medium">
                    {index + 1}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[50vh] overflow-y-auto">
            {/* Icon */}
            {currentStepData.icon && (
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-secondary/30 border-2 border-border rounded-none">
                  {currentStepData.icon}
                </div>
              </div>
            )}

            {/* Title */}
            <h3 className="text-2xl font-bold text-foreground text-center mb-4">
              {currentStepData.title}
            </h3>

            {/* Description */}
            <p className="text-base text-muted-foreground text-center mb-6 leading-relaxed">
              {currentStepData.description}
            </p>

            {/* Category Badge */}
            <div className="flex justify-center">
              <span className="px-3 py-1 bg-accent/20 border border-border rounded-none text-xs font-medium text-foreground">
                {currentStepData.category}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-secondary/30">
            <button
              onClick={handlePrevious}
              disabled={isFirstStep}
              className={cn(
                "flex items-center gap-2 px-4 py-2 border-2 rounded-none transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isFirstStep
                  ? "opacity-50 cursor-not-allowed border-border text-muted-foreground"
                  : "border-border hover:bg-accent/50 text-foreground"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm font-medium">
                discovery.previous
              </span>
            </button>

            <button
              onClick={handleNext}
              className={cn(
                "flex items-center gap-2 px-4 py-2 border-2 rounded-none transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isLastStep
                  ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                  : "border-border hover:bg-accent/50 text-foreground"
              )}
            >
              <span className="text-sm font-medium">
                {isLastStep ? "discovery.finish" : "discovery.next"}
              </span>
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

FeatureDiscoveryGuide.displayName = "FeatureDiscoveryGuide";
