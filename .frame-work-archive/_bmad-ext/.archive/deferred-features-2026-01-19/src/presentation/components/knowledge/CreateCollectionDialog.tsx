/**
 * @fileoverview Create Collection Dialog Component
 * @module components/knowledge/CreateCollectionDialog
 * @governance EPIC-6-3
 *
 * Dialog for creating new collections with validation.
 * Uses Radix UI Dialog for accessibility.
 */

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

export interface CreateCollectionDialogProps {
    /** Whether dialog is open */
    isOpen: boolean;

    /** Callback when save is clicked */
    onSave: (name: string) => void;

    /** Callback when cancel is clicked */
    onCancel: () => void;
}

const MAX_NAME_LENGTH = 50;

/**
 * CreateCollectionDialog Component
 *
 * Modal dialog for creating a new collection.
 *
 * Features:
 * - Auto-focus on input mount
 * - Real-time validation
 * - Trim whitespace
 * - Max length enforcement (50 chars)
 * - Disabled save until valid
 *
 * Uses Radix Dialog for focus management and accessibility.
 */
export function CreateCollectionDialog({
    isOpen,
    onSave,
    onCancel,
}: CreateCollectionDialogProps) {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [error, setError] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Reset state when dialog opens/closes
    useEffect(() => {
        if (isOpen) {
            setName('');
            setError('');
            // Focus after render
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        }
    }, [isOpen]);

    const handleSave = () => {
        const trimmed = name.trim();

        // Validation
        if (!trimmed) {
            setError(t('knowledge.collections.nameRequired'));
            return;
        }

        if (trimmed.length > MAX_NAME_LENGTH) {
            setError(t('knowledge.collections.nameTooLong', { max: MAX_NAME_LENGTH }));
            return;
        }

        onSave(trimmed);
    };

    const handleChange = (value: string) => {
        const trimmed = value.trim();
        setName(trimmed);

        // Clear error when user starts typing
        if (error) {
            setError('');
        }

        // Validate max length
        if (trimmed.length > MAX_NAME_LENGTH) {
            setError(`Name must be less than ${MAX_NAME_LENGTH} characters`);
        }
    };

    const isValid = name.length > 0 && name.length <= MAX_NAME_LENGTH && !error;

    if (!isOpen) {
        return null;
    }

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onCancel()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-background z-50" />
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
                        New Collection
                    </Dialog.Title>

                    {/* Input */}
                    <div className="mb-4">
                        <label htmlFor="collection-name-input" className="block text-sm font-medium text-foreground mb-2">
                            Collection Name
                        </label>
                        <input
                            ref={inputRef}
                            id="collection-name-input"
                            type="text"
                            value={name}
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
                            maxLength={MAX_NAME_LENGTH + 1}
                            aria-invalid={!!error}
                            aria-describedby={error ? 'collection-error' : undefined}
                        />
                        {error && (
                            <p id="collection-error" className="text-sm text-destructive mt-1">
                                {error}
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                            {name.length}/{MAX_NAME_LENGTH} characters
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
                            Create
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
