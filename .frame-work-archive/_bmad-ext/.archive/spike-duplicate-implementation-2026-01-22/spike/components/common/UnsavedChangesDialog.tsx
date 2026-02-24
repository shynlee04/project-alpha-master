/**
 * @fileoverview Unsaved Changes Warning Dialog
 * @module presentation/components/common/UnsavedChangesDialog
 *
 * Modal dialog to warn users about unsaved changes before navigation.
 * Provides clear actions: Stay (cancel) or Leave (confirm).
 *
 * @December2025Patterns
 * - Accessible modal with focus trap
 * - Clear action buttons with destructive styling
 * - Reusable across all forms
 * - Type-safe with proper interfaces
 */

import { useCallback, useEffect, useRef } from 'react';
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
 * Props for UnsavedChangesDialog component
 */
export interface UnsavedChangesDialogProps {
    /** Whether dialog is open */
    open: boolean;
    /** Called when user chooses to stay (cancel navigation) */
    onStay: () => void;
    /** Called when user chooses to leave (confirm navigation) */
    onLeave: () => void;
    /** Custom warning message */
    message?: string;
    /** Custom title */
    title?: string;
}

/**
 * Unsaved Changes Warning Dialog
 *
 * Shows a modal warning when user tries to navigate away with unsaved changes.
 * Uses accessible dialog pattern with focus management.
 *
 * @example
 * ```tsx
 * function MyForm() {
 *   const [showWarning, setShowWarning] = useState(false);
 *   const navigate = useNavigate();
 *
 *   const handleLeave = () => {
 *     navigate('/other-page');
 *   };
 *
 *   return (
 *     <>
 *       <form>...</form>
 *       <UnsavedChangesDialog
 *         open={showWarning}
 *         onStay={() => setShowWarning(false)}
 *         onLeave={handleLeave}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
export function UnsavedChangesDialog({
    open,
    onStay,
    onLeave,
    message,
    title,
}: UnsavedChangesDialogProps) {
    const { t } = useTranslation();
    const leaveButtonRef = useRef<HTMLButtonElement>(null);

    // Focus leave button on open (destructive action)
    useEffect(() => {
        if (open) {
            // Small delay to ensure dialog is rendered
            const timer = setTimeout(() => {
                leaveButtonRef.current?.focus();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [open]);

    /**
     * Handle stay (cancel) action
     */
    const handleStay = useCallback(() => {
        onStay();
    }, [onStay]);

    /**
     * Handle leave (confirm) action
     */
    const handleLeave = useCallback(() => {
        onLeave();
    }, [onLeave]);

    // Handle keyboard (Escape key closes dialog = stay)
    const handleOpenChange = useCallback(
        (open: boolean) => {
            if (!open) {
                handleStay();
            }
        },
        [handleStay]
    );

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px] rounded-none">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" aria-hidden="true" />
                        <DialogTitle>
                            {title ||
                                t(
                                    'common.unsavedChangesTitle',
                                    'You have unsaved changes'
                                )}
                        </DialogTitle>
                    </div>
                    <DialogDescription>
                        {message ||
                            t(
                                'common.unsavedChangesMessage',
                                'Your changes will be lost if you continue. Are you sure you want to leave?'
                            )}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2">
                    {/* Stay button (cancel navigation) - Secondary action */}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleStay}
                        className="rounded-none"
                    >
                        {t('common.stay', 'Stay')}
                    </Button>

                    {/* Leave button (confirm navigation) - Destructive action */}
                    <Button
                        ref={leaveButtonRef}
                        type="button"
                        variant="destructive"
                        onClick={handleLeave}
                        className="rounded-none"
                    >
                        {t('common.leave', 'Leave')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
