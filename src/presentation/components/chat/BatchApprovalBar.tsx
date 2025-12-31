/**
 * BatchApprovalBar - Compact bar for batch tool approval
 * 
 * Shows when multiple tool calls are pending approval.
 * Provides "Allow all" / "Review each" options.
 * 
 * @epic 2 - AI Chat That Just Works
 * @story 2-3 - Streaming Chat with Tool Approval UI
 * @task T4 - Implement Batch Approval UI
 */

import React, { useMemo } from 'react';
import { CheckCircle, XCircle, AlertTriangle, ListOrdered } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import type { PendingApprovalInfo } from '@/lib/agent/hooks/use-agent-chat-with-tools';

export interface BatchApprovalBarProps {
    /** List of pending approvals */
    pendingApprovals: PendingApprovalInfo[];
    /** Called when user approves all tools */
    onApproveAll: () => void;
    /** Called when user rejects all tools */
    onRejectAll: () => void;
    /** Called when user wants to review each tool individually */
    onReviewEach: () => void;
    /** Current mode: batch or individual */
    mode: 'batch' | 'individual';
    /** Index of current item when in individual mode */
    currentIndex?: number;
    /** Optional class name */
    className?: string;
}

/**
 * Compact banner for batch tool approval
 */
export const BatchApprovalBar: React.FC<BatchApprovalBarProps> = ({
    pendingApprovals,
    onApproveAll,
    onRejectAll,
    onReviewEach,
    mode,
    currentIndex = 0,
    className,
}) => {
    const { t } = useTranslation();

    // Calculate risk summary
    const riskSummary = useMemo(() => {
        const counts = { high: 0, medium: 0, low: 0 };
        for (const approval of pendingApprovals) {
            counts[approval.riskLevel]++;
        }
        return counts;
    }, [pendingApprovals]);

    const hasHighRisk = riskSummary.high > 0;
    const totalCount = pendingApprovals.length;

    // Get tool names for display
    const toolNames = useMemo(() => {
        const names = [...new Set(pendingApprovals.map(a => a.toolName))];
        if (names.length <= 3) {
            return names.join(', ');
        }
        return `${names.slice(0, 2).join(', ')} +${names.length - 2} more`;
    }, [pendingApprovals]);

    if (totalCount < 2) {
        return null; // Don't show for single approval
    }

    return (
        <div className={cn(
            'flex items-center justify-between gap-3 p-3 border-b',
            hasHighRisk
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-yellow-500/10 border-yellow-500/30',
            className
        )}>
            {/* Left: Summary */}
            <div className="flex items-center gap-3 min-w-0">
                <div className={cn(
                    'flex items-center justify-center w-8 h-8 rounded',
                    hasHighRisk ? 'bg-red-500/20' : 'bg-yellow-500/20'
                )}>
                    <AlertTriangle className={cn(
                        'w-4 h-4',
                        hasHighRisk ? 'text-red-400' : 'text-yellow-400'
                    )} />
                </div>

                <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                        {mode === 'batch' ? (
                            t('agent.batchApproval.title', { count: totalCount })
                        ) : (
                            t('agent.batchApproval.reviewing', {
                                current: currentIndex + 1,
                                total: totalCount
                            })
                        )}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                        {toolNames}
                    </p>
                </div>

                {/* Risk badges */}
                <div className="hidden sm:flex items-center gap-1.5">
                    {riskSummary.high > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-500/20 text-red-400 rounded">
                            {riskSummary.high} {t('agent.risk.high')}
                        </span>
                    )}
                    {riskSummary.medium > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-yellow-500/20 text-yellow-400 rounded">
                            {riskSummary.medium} {t('agent.risk.medium')}
                        </span>
                    )}
                    {riskSummary.low > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-green-500/20 text-green-400 rounded">
                            {riskSummary.low} {t('agent.risk.low')}
                        </span>
                    )}
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {mode === 'batch' ? (
                    <>
                        <button
                            onClick={onReviewEach}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium',
                                'border border-border-dark rounded-none',
                                'text-muted-foreground hover:text-foreground hover:bg-accent',
                                'transition-colors'
                            )}
                            title={t('agent.batchApproval.reviewEachTooltip')}
                        >
                            <ListOrdered className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">
                                {t('agent.batchApproval.reviewEach')}
                            </span>
                        </button>

                        <button
                            onClick={onRejectAll}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium',
                                'border border-red-500/30 rounded-none',
                                'text-red-400 hover:bg-red-500/10',
                                'transition-colors'
                            )}
                        >
                            <XCircle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">
                                {t('agent.batchApproval.denyAll')}
                            </span>
                        </button>

                        <button
                            onClick={onApproveAll}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium',
                                'bg-primary text-primary-foreground rounded-none',
                                'hover:bg-primary/90 transition-colors',
                                hasHighRisk && 'ring-2 ring-red-500/50'
                            )}
                        >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>
                                {t('agent.batchApproval.allowAll')}
                            </span>
                        </button>
                    </>
                ) : (
                    // In individual review mode, show progress indicator
                    <span className="text-xs text-muted-foreground">
                        {t('agent.batchApproval.useOverlay')}
                    </span>
                )}
            </div>
        </div>
    );
};

export default BatchApprovalBar;
