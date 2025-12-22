/**
 * @fileoverview Provider Status Segment
 * @module components/ide/statusbar/ProviderStatus
 * 
 * @epic Epic-28 Story 28-18
 * @integrates Epic-26 Story 26-5 - Will wire to real provider validation
 * 
 * Displays LLM provider connection status in StatusBar.
 * Currently mocked - will be wired to Epic 26 provider management.
 * 
 * @roadmap
 * - Epic 26: Wire to real API key validation service
 * - Epic 26-5: Show provider selection dropdown on click
 */

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Cpu, CpuIcon } from 'lucide-react';
import { useStatusBarStore } from '@/lib/state/statusbar-store';
import { StatusBarSegment } from './StatusBarSegment';

// ============================================================================
// Component
// ============================================================================

/**
 * ProviderStatus - Shows LLM provider connection state (MOCK)
 * 
 * States:
 * - connected: Green "{Provider}: Connected"
 * - disconnected: Gray "{Provider}: Not Configured"
 */
export function ProviderStatus() {
    const { t } = useTranslation();
    const providerInfo = useStatusBarStore((s) => s.providerInfo);

    return (
        <StatusBarSegment
            className={providerInfo.connected ? 'text-emerald-400' : 'text-white/50'}
            dividerLeft
        >
            <Cpu className="w-3 h-3" />
            <span>
                {providerInfo.name}:{' '}
                {providerInfo.connected
                    ? t('statusBar.connected')
                    : t('statusBar.notConfigured')}
            </span>
        </StatusBarSegment>
    );
}
