/**
 * @fileoverview FileOperationDialog Component
 * S-024: Dialog for rename and duplicate operations with validation
 *
 * Features:
 * - File name validation (no invalid chars, no duplicates)
 * - 8-bit gaming style (no blur effects)
 * - i18n support via t() function
 * - Keyboard navigation (Enter to confirm, Escape to cancel)
 * - Error display with validation feedback
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { validateFileName } from '@/lib/filesystem/file-ops';

/**
 * Props for FileOperationDialog
 */
export interface FileOperationDialogProps {
    /** Whether the dialog is open */
    open: boolean;
    /** Type of operation */
    operation: 'rename' | 'duplicate';
    /** Current file/folder name */
    currentName: string;
    /** Callback when operation is confirmed */
    onConfirm: (newName: string) => Promise<void>;
    /** Callback when dialog is closed */
    onClose: () => void;
    /** Existing names to check for duplicates */
    existingNames?: string[];
    /** Optional class name */
    className?: string;
}

/**
 * FileOperationDialog - Dialog for file rename/duplicate with validation
 */
export function FileOperationDialog({
    open,
    operation,
    currentName,
    onConfirm,
    onClose,
    existingNames = [],
    className,
}: FileOperationDialogProps): React.JSX.Element | null {
    const { t } = useTranslation();
    const inputRef = useRef<HTMLInputElement>(null);

    const [newName, setNewName] = useState('');
    const [error, setError] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset state when dialog opens
    useEffect(() => {
        if (open) {
            const defaultName = operation === 'duplicate'
                ? currentName.includes('.')
                    ? `${currentName.substring(0, currentName.lastIndexOf('.'))} (copy)${currentName.substring(currentName.lastIndexOf('.'))}`
                    : `${currentName} (copy)`
                : currentName;

            setNewName(defaultName);
            setError('');

            // Focus input and select text after a short delay
            setTimeout(() => {
                inputRef.current?.focus();
                inputRef.current?.select();
            }, 100);
        }
    }, [open, operation, currentName]);

    // Validate name on change
    useEffect(() => {
        if (!newName) {
            setError('');
            return;
        }

        // Check for duplicates
        if (newName !== currentName && existingNames.includes(newName)) {
            setError(t('fileTree.dialog.errorDuplicate', { defaultValue: 'A file with this name already exists' }));
            return;
        }

        // Validate file name
        const validation = validateFileName(newName);
        if (!validation.valid) {
            setError(validation.error || t('fileTree.dialog.errorInvalid', { defaultValue: 'Invalid file name' }));
            return;
        }

        setError('');
    }, [newName, currentName, existingNames, t]);

    // Handle confirm
    const handleConfirm = async () => {
        if (error || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onConfirm(newName);
            onClose();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : t('fileTree.dialog.errorOperation', { defaultValue: 'Operation failed' });
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle keyboard shortcuts
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !error && !isSubmitting) {
            e.preventDefault();
            handleConfirm();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
        }
    };

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent
                size="sm"
                className={className}
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>
                        {operation === 'rename'
                            ? t('fileTree.dialog.renameTitle', { defaultValue: 'Rename' })
                            : t('fileTree.dialog.duplicateTitle', { defaultValue: 'Duplicate' })}
                    </DialogTitle>
                    <DialogDescription>
                        {operation === 'rename'
                            ? t('fileTree.dialog.renameDescription', { defaultValue: 'Enter a new name for this file or folder' })
                            : t('fileTree.dialog.duplicateDescription', { defaultValue: 'Enter a name for the duplicate' })}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="file-name-input"
                            className="text-sm font-medium text-foreground"
                        >
                            {t('fileTree.dialog.nameLabel', { defaultValue: 'Name' })}
                        </label>
                        <Input
                            id="file-name-input"
                            ref={inputRef}
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className={error ? 'border-destructive focus-visible:ring-destructive' : ''}
                            aria-invalid={!!error}
                            aria-describedby={error ? 'file-name-error' : undefined}
                        />
                        {error && (
                            <div
                                id="file-name-error"
                                className="flex items-center gap-2 text-sm text-destructive"
                                role="alert"
                                aria-live="polite"
                            >
                                <AlertCircle size={14} />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                        type="button"
                    >
                        {t('common.cancel', { defaultValue: 'Cancel' })}
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!!error || isSubmitting}
                        type="button"
                    >
                        {isSubmitting
                            ? t('common.processing', { defaultValue: 'Processing...' })
                            : operation === 'rename'
                                ? t('fileTree.dialog.rename', { defaultValue: 'Rename' })
                                : t('fileTree.dialog.duplicate', { defaultValue: 'Duplicate' })}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
