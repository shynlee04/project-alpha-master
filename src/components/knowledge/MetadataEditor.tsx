/**
 * @fileoverview Metadata Editor Component (Story 6.4)
 * @module components/knowledge/MetadataEditor
 * @governance EPIC-6-4
 *
 * Inline editor for correcting AI-generated metadata:
 * - Summary text editor
 * - Key concepts tag editor (add/remove)
 * - Suggested questions editor
 * - Save/Cancel buttons
 * - Validation (summary max 500 chars, concepts max 20 chars each)
 */

import { useState, useEffect } from 'react';
import { Check, X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { SourceRecord } from '@/lib/state/dexie-db';
import type { SourceMetadataFields } from '@/lib/state/knowledge-store';

export interface MetadataEditorProps {
    /** The source to edit metadata for */
    source: SourceRecord;
    /** Callback when metadata is saved */
    onSave: (metadata: SourceMetadataFields) => Promise<void>;
    /** Callback when editing is cancelled */
    onCancel: () => void;
}

const MAX_SUMMARY_LENGTH = 500;
const MAX_CONCEPT_LENGTH = 20;

/**
 * MetadataEditor Component
 *
 * Inline editor for correcting AI-generated metadata:
 * - Edit summary text (max 500 chars)
 * - Add/remove key concepts (max 20 chars each)
 * - Edit suggested questions
 * - Save/Cancel buttons
 * - Shows character count for summary
 * - Validates input before saving
 */
export function MetadataEditor({ source, onSave, onCancel }: MetadataEditorProps) {
    const [summary, setSummary] = useState(source.summary || '');
    const [keyConcepts, setKeyConcepts] = useState<string[]>(source.keyConcepts || []);
    const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(
        source.suggestedQuestions || []
    );
    const [newConcept, setNewConcept] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Reset form when source changes
    useEffect(() => {
        setSummary(source.summary || '');
        setKeyConcepts(source.keyConcepts || []);
        setSuggestedQuestions(source.suggestedQuestions || []);
        setNewConcept('');
    }, [source]);

    const handleSave = async () => {
        // Validate summary length
        if (summary.length > MAX_SUMMARY_LENGTH) {
            toast.error(`Summary must be ${MAX_SUMMARY_LENGTH} characters or less`);
            return;
        }

        // Validate concept lengths
        const invalidConcept = keyConcepts.find(c => c.length > MAX_CONCEPT_LENGTH);
        if (invalidConcept) {
            toast.error(`Concept "${invalidConcept}" must be ${MAX_CONCEPT_LENGTH} characters or less`);
            return;
        }

        setIsSaving(true);
        try {
            await onSave({
                summary: summary || undefined,
                keyConcepts: keyConcepts.length > 0 ? keyConcepts : undefined,
                suggestedQuestions: suggestedQuestions.length > 0 ? suggestedQuestions : undefined,
            });
            toast.success('Metadata saved successfully');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to save metadata');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddConcept = () => {
        const trimmed = newConcept.trim();
        if (!trimmed) return;

        if (trimmed.length > MAX_CONCEPT_LENGTH) {
            toast.error(`Concept must be ${MAX_CONCEPT_LENGTH} characters or less`);
            return;
        }

        if (keyConcepts.includes(trimmed)) {
            toast.error('Concept already exists');
            return;
        }

        setKeyConcepts([...keyConcepts, trimmed]);
        setNewConcept('');
    };

    const handleRemoveConcept = (concept: string) => {
        setKeyConcepts(keyConcepts.filter(c => c !== concept));
    };

    const handleQuestionChange = (index: number, value: string) => {
        const updated = [...suggestedQuestions];
        updated[index] = value;
        setSuggestedQuestions(updated);
    };

    const handleAddQuestion = () => {
        setSuggestedQuestions([...suggestedQuestions, '']);
    };

    const handleRemoveQuestion = (index: number) => {
        setSuggestedQuestions(suggestedQuestions.filter((_, i) => i !== index));
    };

    return (
        <div className="border-t border-border-dark bg-surface-darker">
            <div className="p-4 space-y-4">
                {/* Header with Save/Cancel buttons */}
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-foreground">Edit Metadata</h3>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSaving}
                            className="p-1.5 hover:bg-surface-dark rounded transition-colors disabled:opacity-50"
                            aria-label="Cancel"
                        >
                            <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="p-1.5 bg-primary hover:bg-primary/90 rounded transition-colors disabled:opacity-50"
                            aria-label="Save"
                        >
                            <Check className="w-4 h-4 text-background" />
                        </button>
                    </div>
                </div>

                {/* Summary Editor */}
                <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                        Summary
                    </label>
                    <textarea
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        maxLength={MAX_SUMMARY_LENGTH}
                        rows={3}
                        className="w-full px-3 py-2 bg-surface-dark border border-border-dark rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
                        placeholder="Enter a 3-sentence summary..."
                    />
                    <div className="flex justify-between mt-1">
                        <span className="text-xs text-muted-foreground">
                            {summary.length} / {MAX_SUMMARY_LENGTH} characters
                        </span>
                    </div>
                </div>

                {/* Key Concepts Editor */}
                <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                        Key Concepts
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {keyConcepts.map((concept) => (
                            <span
                                key={concept}
                                className="px-2 py-1 text-xs rounded bg-primary/20 text-primary border border-primary/30 flex items-center gap-1"
                            >
                                {concept}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveConcept(concept)}
                                    className="hover:text-destructive transition-colors"
                                    aria-label={`Remove ${concept}`}
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newConcept}
                            onChange={(e) => setNewConcept(e.target.value)}
                            maxLength={MAX_CONCEPT_LENGTH}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddConcept()}
                            className="flex-1 px-3 py-1.5 bg-surface-dark border border-border-dark rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                            placeholder="Add a key concept..."
                        />
                        <button
                            type="button"
                            onClick={handleAddConcept}
                            className="px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded transition-colors"
                            aria-label="Add concept"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Suggested Questions Editor */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-foreground">
                            Suggested Questions
                        </label>
                        <button
                            type="button"
                            onClick={handleAddQuestion}
                            className="text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                            + Add Question
                        </button>
                    </div>
                    <div className="space-y-2">
                        {suggestedQuestions.map((question, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={question}
                                    onChange={(e) => handleQuestionChange(index, e.target.value)}
                                    className="flex-1 px-3 py-1.5 bg-surface-dark border border-border-dark rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                                    placeholder={`Question ${index + 1}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveQuestion(index)}
                                    className="p-1.5 hover:bg-destructive/20 text-destructive rounded transition-colors"
                                    aria-label={`Remove question ${index + 1}`}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {suggestedQuestions.length === 0 && (
                            <p className="text-sm text-muted-foreground italic">
                                No suggested questions. Add one above.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
