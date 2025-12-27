/**
 * ApprovalOverlay - Modal overlay for tool execution approval
 * 
 * @epic Epic-28 Story 28-22
 * @integrates Epic-25 Story 25-5 - Tool approval flow
 * @integrates Epic-28 Story 28-21 - DiffPreview for change visualization
 * @integrates Epic-28 Story 28-20 - CodeBlock for code display
 * 
 * @listens tool:approval_required - When tool needs user approval
 * @emits tool:approved - When user accepts changes
 * @emits tool:rejected - When user rejects changes
 * 
 * @roadmap Future: Add "Approve All" for batch operations (Epic 26)
 */

import React, { useEffect, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { CodeBlock } from './CodeBlock';
import { DiffPreview } from './DiffPreview';

export interface ApprovalOverlayProps {
  /** Whether the overlay is visible */
  isOpen: boolean;
  /** Called when user approves the changes */
  onApprove: () => void;
  /** Called when user rejects the changes */
  onReject: () => void;
  /** Name of the tool requesting approval */
  toolName: string;
  /** Description of what the tool will do */
  description?: string;
  /** Code to be displayed (for code-related tools) */
  code?: string;
  /** Original code for diff preview */
  oldCode?: string;
  /** New code for diff preview */
  newCode?: string;
  /** Display mode: fullscreen modal or inline */
  mode?: 'fullscreen' | 'inline';
  /** Risk level of the operation */
  riskLevel?: 'low' | 'medium' | 'high';
  /** Additional CSS classes */
  className?: string;
  /** Loading state during approval/rejection */
  isLoading?: boolean;
}

export const ApprovalOverlay: React.FC<ApprovalOverlayProps> = ({
  isOpen,
  onApprove,
  onReject,
  toolName,
  description,
  code,
  oldCode,
  newCode,
  mode = 'fullscreen',
  riskLevel = 'medium',
  className,
  isLoading = false
}) => {
  const { t } = useTranslation();

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        onApprove();
        break;
      case 'Escape':
        event.preventDefault();
        onReject();
        break;
    }
  }, [isOpen, onApprove, onReject]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  const getRiskConfig = (level: string) => {
    switch (level) {
      case 'high':
        return {
          icon: AlertTriangle,
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          label: t('chat.approvalOverlay.risk.high')
        };
      case 'medium':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
          label: t('chat.approvalOverlay.risk.medium')
        };
      case 'low':
      default:
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
          label: t('chat.approvalOverlay.risk.low')
        };
    }
  };

  const riskConfig = getRiskConfig(riskLevel);
  const RiskIcon = riskConfig.icon;

  const hasDiff = oldCode !== undefined && newCode !== undefined;
  const hasCode = code !== undefined && !hasDiff;

  // Dynamic components based on mode to avoid Radix context errors in inline mode
  const OverlayTitle = mode === 'fullscreen' ? Dialog.Title : 'h2';
  const OverlayDescription = mode === 'fullscreen' ? Dialog.Description : 'p';

  const dialogContent = (
    <div className={cn(
      'relative bg-surface-dark border border-border-dark rounded-none shadow-pixel',
      mode === 'fullscreen'
        ? 'w-full max-w-4xl max-h-[90vh] mx-auto my-8'
        : 'w-full',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border-dark bg-surface-darker">
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded',
            riskConfig.bgColor,
            riskConfig.borderColor,
            'border'
          )}>
            <RiskIcon className={cn('w-5 h-5', riskConfig.color)} />
          </div>
          <div>
            <OverlayTitle className="text-lg font-pixel text-primary uppercase tracking-wider">
              {t('chat.approvalOverlay.title')}
            </OverlayTitle>
            <p className="text-sm text-muted-foreground">
              {toolName} • {riskConfig.label}
            </p>
          </div>
        </div>

        {mode === 'fullscreen' && (
          <Dialog.Close asChild>
            <button
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
              aria-label={t('chat.approvalOverlay.close')}
            >
              <X className="w-5 h-5" />
            </button>
          </Dialog.Close>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
        {/* Description */}
        {description && (
          <div className="space-y-2">
            <OverlayDescription className="text-sm font-medium text-foreground">
              {t('chat.approvalOverlay.description')}
            </OverlayDescription>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        )}

        {/* Code Display */}
        {hasCode && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">
              {t('chat.approvalOverlay.codePreview')}
            </h3>
            <CodeBlock
              code={code}
              language="typescript"
              showLineNumbers={true}
              className="border border-border-dark"
            />
          </div>
        )}

        {/* Diff Preview */}
        {hasDiff && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">
              {t('chat.approvalOverlay.changesPreview')}
            </h3>
            <DiffPreview
              oldCode={oldCode}
              newCode={newCode}
              className="border border-border-dark"
            />
          </div>
        )}

        {/* Warning Message */}
        <div className={cn(
          'p-4 rounded border',
          riskConfig.bgColor,
          riskConfig.borderColor
        )}>
          <div className="flex items-start gap-3">
            <RiskIcon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', riskConfig.color)} />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {t('chat.approvalOverlay.warning.title')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('chat.approvalOverlay.warning.message')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 p-6 border-t border-border-dark bg-surface-darker">
        {mode === 'fullscreen' ? (
          <Dialog.Close asChild>
            <button
              onClick={onReject}
              disabled={isLoading}
              className={cn(
                'px-4 py-2 text-sm font-medium border border-border-dark rounded-none',
                'text-muted-foreground hover:text-foreground hover:bg-accent',
                'transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                'focus:outline-none focus:ring-2 focus:ring-primary/50'
              )}
            >
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                {t('chat.approvalOverlay.reject')}
              </div>
            </button>
          </Dialog.Close>
        ) : (
          <button
            onClick={onReject}
            disabled={isLoading}
            className={cn(
              'px-4 py-2 text-sm font-medium border border-border-dark rounded-none',
              'text-muted-foreground hover:text-foreground hover:bg-accent',
              'transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
              'focus:outline-none focus:ring-2 focus:ring-primary/50'
            )}
          >
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              {t('chat.approvalOverlay.reject')}
            </div>
          </button>
        )}

        <button
          onClick={onApprove}
          disabled={isLoading}
          className={cn(
            'px-6 py-2 text-sm font-medium border border-primary/20 rounded-none',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            'transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
            'focus:outline-none focus:ring-2 focus:ring-primary/50',
            'shadow-pixel'
          )}
        >
          <div className="flex items-center gap-2">
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                {t('chat.approvalOverlay.processing')}
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                {t('chat.approvalOverlay.approve')}
              </>
            )}
          </div>
        </button>
      </div>
    </div>
  );

  if (mode === 'inline') {
    return isOpen ? dialogContent : null;
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={() => { }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Content asChild>
            {dialogContent}
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
};