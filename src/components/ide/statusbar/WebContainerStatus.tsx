/**
 * @fileoverview WebContainer Status Segment
 * @module components/ide/statusbar/WebContainerStatus
 * 
 * @epic Epic-28 Story 28-18
 * @listens webcontainer:status
 * 
 * Displays WebContainer boot status in StatusBar.
 */

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Cloud, CloudOff, Loader2 } from 'lucide-react';
import { useStatusBarStore } from '@/lib/state/statusbar-store';
import { StatusBarSegment } from './StatusBarSegment';

// ============================================================================
// Component
// ============================================================================

/**
 * WebContainerStatus - Shows WebContainer boot state
 * 
 * States:
 * - idle: Not started
 * - booting: Spinner with "Booting..."
 * - ready: Check with "Ready"
 * - error: Warning with "Error"
 */
export function WebContainerStatus() {
    const { t } = useTranslation();
    const status = useStatusBarStore((s) => s.webContainerStatus);

    const getIcon = () => {
        switch (status) {
            case 'booting':
                return <Loader2 className="w-3 h-3 animate-spin" />;
            case 'ready':
                return <Cloud className="w-3 h-3" />;
            case 'error':
                return <CloudOff className="w-3 h-3 text-red-400" />;
            default:
                return <Cloud className="w-3 h-3 opacity-50" />;
        }
    };

    const getLabel = () => {
        switch (status) {
            case 'booting':
                return t('statusBar.wcBooting');
            case 'ready':
                return t('statusBar.wcReady');
            case 'error':
                return t('statusBar.wcError');
            default:
                return 'WC';
        }
    };

    const getTextColor = () => {
        switch (status) {
            case 'ready':
                return 'text-emerald-400';
            case 'error':
                return 'text-red-400';
            default:
                return 'text-white/80';
        }
    };

    return (
        <StatusBarSegment className={getTextColor()}>
            {getIcon()}
            <span>{getLabel()}</span>
        </StatusBarSegment>
    );
}
