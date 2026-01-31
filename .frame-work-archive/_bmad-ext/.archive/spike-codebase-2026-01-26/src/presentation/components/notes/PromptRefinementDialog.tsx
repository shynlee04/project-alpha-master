/**
 * @fileoverview Prompt Refinement Dialog
 * @module components/notes/PromptRefinementDialog
 * @created 2026-01-13
 * @story 43-03: 2-step prompt refinement workflow
 *
 * Provides a 2-step UI for Vietnamese users to refine prompts before AI generation:
 * Step 1: Fill in variable values
 * Step 2: Preview and edit the final prompt before execution
 */

import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { create } from 'zustand';
import type { BlockNoteEditor } from '@blocknote/core';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { ArrowRight, ArrowLeft, Sparkles, Edit3, Play, X } from 'lucide-react';
import {
    type CustomSlashCommand,
    type PromptVariable,
    extractVariablesFromPrompt,
    substituteVariables,
    getLocalizedCommand,
    getLocalizedVariableLabel,
} from '@/lib/notes/slash-command-store';

// ============================================================================
// Refinement Store
// ============================================================================

interface RefinementState {
    isOpen: boolean;
    command: CustomSlashCommand | null;
    editor: BlockNoteEditor | null;
    step: 1 | 2; // Step 1: Fill variables, Step 2: Preview & Edit
    variableValues: Record<string, string>;
    refinedPrompt: string;
    noteContext: string; // Context from the note
    onExecute: ((prompt: string) => Promise<void>) | null;
}

interface RefinementActions {
    openRefinement: (
        command: CustomSlashCommand,
        editor: BlockNoteEditor,
        noteContext: string,
        onExecute: (prompt: string) => Promise<void>
    ) => void;
    closeRefinement: () => void;
    setVariableValue: (name: string, value: string) => void;
    setRefinedPrompt: (prompt: string) => void;
    goToStep: (step: 1 | 2) => void;
    nextStep: () => void;
    prevStep: () => void;
    executePrompt: () => Promise<void>;
}

export const usePromptRefinementStore = create<RefinementState & RefinementActions>(
    (set, get) => ({
        isOpen: false,
        command: null,
        editor: null,
        step: 1,
        variableValues: {},
        refinedPrompt: '',
        noteContext: '',
        onExecute: null,

        openRefinement: (command, editor, noteContext, onExecute) => {
            // Initialize variable values from defaults
            const initialValues: Record<string, string> = {};
            if (command.variables) {
                command.variables.forEach((v) => {
                    initialValues[v.name] = v.defaultValue || '';
                });
            }
            // Also check for auto-detected variables in the prompt
            const autoVars = extractVariablesFromPrompt(command.prompt);
            autoVars.forEach((name) => {
                if (!(name in initialValues)) {
                    initialValues[name] = '';
                }
            });

            set({
                isOpen: true,
                command,
                editor,
                step: 1,
                variableValues: initialValues,
                refinedPrompt: command.prompt,
                noteContext,
                onExecute,
            });
        },

        closeRefinement: () => {
            set({
                isOpen: false,
                command: null,
                editor: null,
                step: 1,
                variableValues: {},
                refinedPrompt: '',
                noteContext: '',
                onExecute: null,
            });
        },

        setVariableValue: (name, value) => {
            set((state) => ({
                variableValues: { ...state.variableValues, [name]: value },
            }));
        },

        setRefinedPrompt: (prompt) => {
            set({ refinedPrompt: prompt });
        },

        goToStep: (step) => {
            const { command, variableValues } = get();
            if (step === 2 && command) {
                // When going to step 2, substitute variables in prompt
                const refined = substituteVariables(command.prompt, variableValues);
                set({ step, refinedPrompt: refined });
            } else {
                set({ step });
            }
        },

        nextStep: () => {
            const { step } = get();
            if (step === 1) {
                get().goToStep(2);
            }
        },

        prevStep: () => {
            const { step } = get();
            if (step === 2) {
                set({ step: 1 });
            }
        },

        executePrompt: async () => {
            const { refinedPrompt, noteContext, onExecute, closeRefinement } = get();
            
            // Build final prompt with context
            let finalPrompt = refinedPrompt;
            if (noteContext && noteContext.trim().length > 0) {
                finalPrompt = `${refinedPrompt}\n\n---\nContext from note:\n${noteContext}`;
            }

            if (onExecute) {
                closeRefinement();
                await onExecute(finalPrompt);
            }
        },
    })
);

// ============================================================================
// Dialog Component
// ============================================================================

export function PromptRefinementDialog() {
    const { t, i18n } = useTranslation();
    const locale = i18n.language;
    const {
        isOpen,
        command,
        step,
        variableValues,
        refinedPrompt,
        noteContext,
        closeRefinement,
        setVariableValue,
        setRefinedPrompt,
        nextStep,
        prevStep,
        executePrompt,
    } = usePromptRefinementStore();

    const [isExecuting, setIsExecuting] = useState(false);

    // Get all variables (defined + auto-detected)
    const allVariables = useMemo(() => {
        if (!command) return [];
        
        const definedVars = command.variables || [];
        const autoVarNames = extractVariablesFromPrompt(command.prompt);
        
        // Merge: use defined if exists, otherwise create auto variable
        const result: PromptVariable[] = [];
        const definedNames = new Set(definedVars.map((v) => v.name));
        
        // Add defined variables
        result.push(...definedVars);
        
        // Add auto-detected variables that aren't defined
        autoVarNames.forEach((name) => {
            if (!definedNames.has(name)) {
                result.push({
                    name,
                    label: name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' '),
                    type: 'text',
                    required: true,
                });
            }
        });
        
        return result;
    }, [command]);

    // Check if all required fields are filled
    const canProceed = useMemo(() => {
        return allVariables
            .filter((v) => v.required !== false)
            .every((v) => variableValues[v.name]?.trim().length > 0);
    }, [allVariables, variableValues]);

    const handleExecute = useCallback(async () => {
        setIsExecuting(true);
        try {
            await executePrompt();
        } finally {
            setIsExecuting(false);
        }
    }, [executePrompt]);

    if (!command) return null;

    const localized = getLocalizedCommand(command, locale);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeRefinement()}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        {localized.title}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 1
                            ? t('notes.refinement.step1.description', 'Fill in the details to customize your prompt')
                            : t('notes.refinement.step2.description', 'Review and edit your prompt before generating')}
                    </DialogDescription>
                </DialogHeader>

                {/* Step Indicator */}
                <div className="flex items-center gap-2 px-1">
                    <div
                        className={`flex items-center justify-center w-6 h-6 rounded-none border-2 text-xs font-bold ${
                            step === 1
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-muted text-muted-foreground border-border'
                        }`}
                    >
                        1
                    </div>
                    <div className="flex-1 h-0.5 bg-border" />
                    <div
                        className={`flex items-center justify-center w-6 h-6 rounded-none border-2 text-xs font-bold ${
                            step === 2
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-muted text-muted-foreground border-border'
                        }`}
                    >
                        2
                    </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 overflow-y-auto py-4 space-y-4">
                    {step === 1 ? (
                        /* Step 1: Variable Inputs */
                        <div className="space-y-4">
                            {allVariables.map((variable) => (
                                <div key={variable.name} className="space-y-1.5">
                                    <label className="text-sm font-medium flex items-center gap-1">
                                        {getLocalizedVariableLabel(variable, locale)}
                                        {variable.required !== false && (
                                            <span className="text-destructive">*</span>
                                        )}
                                    </label>
                                    
                                    {variable.type === 'select' && variable.options ? (
                                        <select
                                            value={variableValues[variable.name] || ''}
                                            onChange={(e) => setVariableValue(variable.name, e.target.value)}
                                            className="w-full px-3 py-2 bg-background border border-border rounded-none text-sm"
                                        >
                                            <option value="">
                                                {t('common.select', '-- Select --')}
                                            </option>
                                            {variable.options.map((opt) => (
                                                <option key={opt} value={opt}>
                                                    {opt}
                                                </option>
                                            ))}
                                        </select>
                                    ) : variable.type === 'textarea' ? (
                                        <textarea
                                            value={variableValues[variable.name] || ''}
                                            onChange={(e) => setVariableValue(variable.name, e.target.value)}
                                            placeholder={variable.placeholder}
                                            className="w-full px-3 py-2 bg-background border border-border rounded-none text-sm min-h-[80px] resize-y"
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={variableValues[variable.name] || ''}
                                            onChange={(e) => setVariableValue(variable.name, e.target.value)}
                                            placeholder={variable.placeholder}
                                            className="w-full px-3 py-2 bg-background border border-border rounded-none text-sm"
                                        />
                                    )}
                                </div>
                            ))}

                            {/* Show note context preview */}
                            {noteContext && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                                        {t('notes.refinement.context', 'Note Context')}
                                    </label>
                                    <div className="p-3 bg-muted/30 border border-border rounded-none text-xs text-muted-foreground max-h-[100px] overflow-y-auto">
                                        {noteContext.slice(0, 300)}
                                        {noteContext.length > 300 && '...'}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Step 2: Preview & Edit */
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium flex items-center gap-1">
                                    <Edit3 className="w-4 h-4" />
                                    {t('notes.refinement.finalPrompt', 'Final Prompt')}
                                </label>
                                <p className="text-xs text-muted-foreground">
                                    {t('notes.refinement.editHint', 'Edit below to make final adjustments before generating')}
                                </p>
                                <textarea
                                    value={refinedPrompt}
                                    onChange={(e) => setRefinedPrompt(e.target.value)}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-none text-sm min-h-[150px] resize-y font-mono"
                                />
                            </div>

                            {/* Show substituted values preview */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                                    {t('notes.refinement.values', 'Your Values')}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(variableValues)
                                        .filter(([, value]) => value)
                                        .map(([name, value]) => (
                                            <span
                                                key={name}
                                                className="px-2 py-1 text-xs bg-primary/10 border border-primary/20 rounded-md"
                                            >
                                                <span className="font-mono text-muted-foreground">{name}:</span>{' '}
                                                <span className="text-foreground">{value}</span>
                                            </span>
                                        ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex gap-2">
                    {step === 2 && (
                        <Button variant="outline" onClick={prevStep}>
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            {t('common.back', 'Back')}
                        </Button>
                    )}
                    <Button variant="outline" onClick={closeRefinement}>
                        <X className="w-4 h-4 mr-1" />
                        {t('common.cancel', 'Cancel')}
                    </Button>
                    {step === 1 ? (
                        <Button onClick={nextStep} disabled={!canProceed}>
                            {t('notes.refinement.preview', 'Preview')}
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    ) : (
                        <Button onClick={handleExecute} disabled={isExecuting || !refinedPrompt.trim()}>
                            <Play className="w-4 h-4 mr-1" />
                            {isExecuting
                                ? t('notes.ai.generating', 'Generating...')
                                : t('notes.refinement.generate', 'Generate')}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default PromptRefinementDialog;
