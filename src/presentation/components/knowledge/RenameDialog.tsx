/**
 * @fileoverview Rename Dialog Component
 * @module components/knowledge/RenameDialog
 * @governance EPIC-6-3
 *
 * Dialog for renaming knowledge sources with validation.
 * Uses Radix UI Dialog for accessibility.
 */

import { useState, useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

export interface RenameDialogProps {
    /** Whether dialog is open */
    isOpen: boolean;

    /** Current title of the source */
    currentTitle: string;

    /** Callback when save is clicked */
    onSave: (newTitle: string) => void;

    /** Callback when cancel is clicked */
    onCancel: () => void;
}

const MAX_TITLE_LENGTH = 100;

/**
 * RenameDialog Component
 *
 * Modal dialog for renaming a knowledge source.
 *
 * Features:
 * - Auto-focus on input mount
 * - Select all text on mount
 * - Real-time validation
 * - Trim whitespace
 * - Max length enforcement (100 chars)
 * - Disabled save until valid
 *
 * Uses Radix Dialog for focus management and accessibility.
 */
export function RenameDialog({
    isOpen,
    currentTitle,
    onSave,
    onCancel,
}: RenameDialogProps) {
    const [title, setTitle] = useState(currentTitle);
    const [error, setError] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Reset state when dialog opens/closes
    useEffect(() => {
        if (isOpen) {
            setTitle(currentTitle);
            setError('');
            // Focus and select text after render
            setTimeout(() => {
                inputRef.current?.focus();
                inputRef.current?.select();
            }, 0);
        }
    }, [isOpen, currentTitle]);

    const handleSave = () => {
        const trimmed = title.trim();

        // Validation
        if (!trimmed) {
            setError('Title is required');
            return;
        }

        if (trimmed.length > MAX_TITLE_LENGTH) {
            setError(`Title must be less than ${MAX_TITLE_LENGTH} characters`);
            return;
        }

        onSave(trimmed);
    };

    const handleChange = (value: string) => {
        // Trim whitespace for display
        const trimmed = value.trim();
        setTitle(trimmed);

        // Clear error when user starts typing
        if (error) {
            setError('');
        }

        // Validate max length
        if (trimmed.length > MAX_TITLE_LENGTH) {
            setError(`Title must be less than ${MAX_TITLE_LENGTH} characters`);
        }
    };

    const hasChanges = title !== currentTitle && title.length > 0;
    const isValid = hasChanges && title.length <= MAX_TITLE_LENGTH && !error;

    if (!isOpen) {
        return null;
    }

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onCancel()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-background/80 z-50" />
                <Dialog.Content
                    className={cn(
                        'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
                        'bg-surface-dark border border-border-dark shadow-pixel',
                        'p-6 rounded-none',
                        'max-w-md w-full',
                        'focus:outline-none'
                    )}
                >
                    {/* Header */}
                    <Dialog.Title className="text-lg font-medium text-foreground mb-4">
                        Rename Source
                    </Dialog.Title>

                    {/* Input */}
                    <div className="mb-4">
                        <label htmlFor="rename-input" className="block text-sm font-medium text-foreground mb-2">
                            New Title
                        </label>
                        <input
                            ref={inputRef}
                            id="rename-input"
                            type="text"
                            value={title}
                            onChange={(e) => handleChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && isValid) {
                                    handleSave();
                                }
                            }}
                            className={cn(
                                'w-full px-3 py-2',
                                'bg-background border border-border-dark',
                                'text-foreground',
                                'focus:outline-none focus:ring-2 focus:ring-primary',
                                'rounded-none',
                                error && 'border-destructive'
                            )}
                            maxLength={MAX_TITLE_LENGTH + 1}
                            aria-invalid={!!error}
                            aria-describedby={error ? 'rename-error' : undefined}
                        />
                        {error && (
                            <p id="rename-error" className="text-sm text-destructive mt-1">
                                {error}
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                            {title.length}/{MAX_TITLE_LENGTH} characters
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className={cn(
                                'px-4 py-2 text-sm',
                                'border border-border-dark hover:bg-surface-darker',
                                'text-foreground',
                                'rounded-none',
                                'focus:outline-none focus:ring-2 focus:ring-primary'
                            )}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!isValid}
                            className={cn(
                                'px-4 py-2 text-sm',
                                'bg-primary text-background',
                                'hover:bg-primary/90',
                                'disabled:opacity-50 disabled:cursor-not-allowed',
                                'rounded-none',
                                'focus:outline-none focus:ring-2 focus:ring-primary'
                            )}
                        >
                            Save
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
