/**
 * @fileoverview ConfirmDialog Component
 * S-024: Confirmation dialog for destructive operations (delete)
 *
 * Features:
 * - Warning message for destructive operations
 * - 8-bit gaming style (error variant for emphasis)
 * - i18n support via t() function
 * - Keyboard navigation (Enter to confirm, Escape to cancel)
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';

/**
 * Props for ConfirmDialog
 */
export interface ConfirmDialogProps {
    /** Whether the dialog is open */
    open: boolean;
    /** Type of operation (for customization) */
    operation: 'delete' | 'delete-folder';
    /** Name of the file/folder being deleted */
    itemName: string;
    /** Whether it's a directory */
    isDirectory: boolean;
    /** Callback when operation is confirmed */
    onConfirm: () => Promise<void>;
    /** Callback when dialog is closed/cancelled */
    onClose: () => void;
    /** Optional class name */
    className?: string;
}

/**
 * ConfirmDialog - Confirmation dialog for destructive file operations
 */
export function ConfirmDialog({
    open,
    operation: _operation,
    itemName,
    isDirectory,
    onConfirm,
    onClose,
    className,
}: ConfirmDialogProps): React.JSX.Element | null {
    const { t } = useTranslation();

    // Handle keyboard shortcuts
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onConfirm();
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
                variant="error"
                className={className}
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
                onKeyDown={handleKeyDown}
            >
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="text-destructive" size={20} />
                        <DialogTitle>
                            {isDirectory
                                ? t('fileTree.confirm.deleteFolderTitle', { defaultValue: 'Delete Folder?' })
                                : t('fileTree.confirm.deleteFileTitle', { defaultValue: 'Delete File?' })}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="py-4">
                    <DialogDescription className="text-base">
                        {isDirectory
                            ? t('fileTree.confirm.deleteFolderMessage', {
                                defaultValue: 'Are you sure you want to delete "{{name}}" and all its contents? This action cannot be undone.',
                                name: itemName,
                              })
                            : t('fileTree.confirm.deleteFileMessage', {
                                defaultValue: 'Are you sure you want to delete "{{name}}"? This action cannot be undone.',
                                name: itemName,
                              })}
                    </DialogDescription>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        type="button"
                    >
                        {t('common.cancel', { defaultValue: 'Cancel' })}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        type="button"
                    >
                        {t('fileTree.confirm.deleteButton', { defaultValue: 'Delete' })}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
