/**
 * @fileoverview Sync Status Segment
 * @module components/ide/statusbar/SyncStatusSegment
 * 
 * @epic Epic-28 Story 28-18
 * @integrates Epic-10 Story 10-7 - Subscribes to sync:progress events
 * @listens sync:progress, sync:error
 * 
 * Displays file sync status in StatusBar with progress during active sync.
 */

import { useTranslation } from 'react-i18next';
import { Check, RefreshCw, AlertTriangle, CloudOff } from 'lucide-react';
import { useStatusBarStore } from '@/lib/state/statusbar-store';
import { StatusBarSegment } from './StatusBarSegment';

// ============================================================================
// Types
// ============================================================================

interface SyncStatusSegmentProps {
    /** Callback when user clicks to retry sync */
    onRetry?: () => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * SyncStatusSegment - Shows file sync state
 * 
 * States:
 * - idle: "Not synced"
 * - syncing: "Syncing: 45/120" with spinner
 * - synced: "Synced" with check
 * - error: "Sync Error" clickable to retry
 */
export function SyncStatusSegment({ onRetry }: SyncStatusSegmentProps) {
    const { t } = useTranslation();
    // Select individual primitives to avoid re-render loops
    const status = useStatusBarStore((s) => s.syncStatus);
    const progress = useStatusBarStore((s) => s.syncProgress);
    const error = useStatusBarStore((s) => s.syncError);

    const handleClick = () => {
        if (status === 'error' && onRetry) {
            onRetry();
        }
    };

    const renderContent = () => {
        switch (status) {
            case 'syncing':
                return (
                    <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>
                            {progress
                                ? t('statusBar.syncing', { current: progress.current, total: progress.total })
                                : t('statusBar.syncing', { current: '...', total: '...' })}
                        </span>
                    </>
                );
            case 'synced':
                return (
                    <>
                        <Check className="w-3 h-3" />
                        <span>{t('statusBar.synced')}</span>
                    </>
                );
            case 'error':
                return (
                    <>
                        <AlertTriangle className="w-3 h-3" />
                        <span title={error || undefined}>{t('statusBar.syncError')}</span>
                    </>
                );
            default:
                return (
                    <>
                        <CloudOff className="w-3 h-3 opacity-50" />
                        <span className="opacity-70">{t('status.notSynced')}</span>
                    </>
                );
        }
    };

    const getTextColor = () => {
        switch (status) {
            case 'synced':
                return 'text-emerald-400';
            case 'error':
                return 'text-red-400';
            case 'syncing':
                return 'text-yellow-400';
            default:
                return 'text-white/60';
        }
    };

    return (
        <StatusBarSegment
            className={getTextColor()}
            dividerLeft
            clickable={status === 'error'}
            onClick={handleClick}
            title={status === 'error' ? t('errors.syncRetry') : undefined}
        >
            {renderContent()}
        </StatusBarSegment>
    );
}
