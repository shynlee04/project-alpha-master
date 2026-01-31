/**
 * @fileoverview Agent Config Dialog Footer
 * @module components/agent/AgentConfigDialogFooter
 *
 * Dialog footer with cancel and save/create buttons.
 * Extracted from AgentConfigDialog for better separation of concerns.
 */

import { useTranslation } from 'react-i18next';
import { Button } from '@/presentation/components/ui/button';
import { DialogFooter } from '@/presentation/components/ui/dialog';

interface AgentConfigDialogFooterProps {
    agentId: string | undefined;
    isSubmitting: boolean;
    isValid: boolean;
    onCancel: () => void;
    onSubmit: () => void;
}

export function AgentConfigDialogFooter({
    agentId,
    isSubmitting,
    isValid,
    onCancel,
    onSubmit,
}: AgentConfigDialogFooterProps) {
    const { t } = useTranslation();

    return (
        <DialogFooter>
            <Button
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="rounded-none font-pixel"
            >
                {t('actions.cancel', 'Cancel')}
            </Button>
            <Button
                onClick={onSubmit}
                disabled={isSubmitting || !isValid}
                className="rounded-none font-pixel"
            >
                {isSubmitting
                    ? t('actions.saving', 'Saving...')
                    : agentId
                        ? t('actions.save', 'Save')
                        : t('actions.create', 'Create')
                }
            </Button>
        </DialogFooter>
    );
}
