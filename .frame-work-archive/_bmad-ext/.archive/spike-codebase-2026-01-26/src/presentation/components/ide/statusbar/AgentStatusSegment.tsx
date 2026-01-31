/**
 * @fileoverview Agent Status Segment
 * @module components/ide/statusbar/AgentStatusSegment
 * 
 * @story 28-27 - Priority 4: Agent activity in StatusBar
 * @listens agent:activity:changed
 * 
 * Displays AI agent activity status in StatusBar.
 */

import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';
import { Bot, Loader2, Zap, AlertCircle } from 'lucide-react';
import { useStatusBarStore } from '@/infrastructure/persistence/stores/statusbar-store';
import { StatusBarSegment } from './StatusBarSegment';
/**
 * @workspace ide-only
 *
 * This component uses the unified workspace context (IDE-only).
 * Do NOT use this component outside of IDE workspace routes.
 */
import { useWorkspaceSync } from '@/infrastructure/persistence/stores/workspace';

// ============================================================================
// Component
// ============================================================================

/**
 * AgentStatusSegment - Shows AI agent activity state
 * 
 * States:
 * - idle: "Agent Ready" with bot icon
 * - thinking: "Thinking..." with spinner
 * - executing: "Executing" with lightning bolt
 * - error: "Agent Error" with alert icon
 */
export function AgentStatusSegment() {
    const { t } = useTranslation();
    const { eventBus } = useWorkspaceSync();
    // PERF-06: Use useShallow to prevent re-renders on unrelated state changes
    const { agentStatus, setAgentStatus } = useStatusBarStore(
        useShallow((s) => ({
            agentStatus: s.agentStatus,
            setAgentStatus: s.setAgentStatus,
        }))
    );

    // Subscribe to agent activity events
    useEffect(() => {
        if (!eventBus) return;

        const handleActivityChanged = ({ status }: { status: 'idle' | 'thinking' | 'executing' | 'error' }) => {
            setAgentStatus(status);
        };

        eventBus.on('agent:activity:changed', handleActivityChanged as any);

        return () => {
            eventBus.off('agent:activity:changed', handleActivityChanged as any);
        };
    }, [eventBus, setAgentStatus]);

    const renderContent = () => {
        switch (agentStatus) {
            case 'thinking':
                return (
                    <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>{t('statusBar.agentThinking', 'Thinking...')}</span>
                    </>
                );
            case 'executing':
                return (
                    <>
                        <Zap className="w-3 h-3" />
                        <span>{t('statusBar.agentExecuting', 'Executing')}</span>
                    </>
                );
            case 'error':
                return (
                    <>
                        <AlertCircle className="w-3 h-3" />
                        <span>{t('statusBar.agentError', 'Agent Error')}</span>
                    </>
                );
            default:
                return (
                    <>
                        <Bot className="w-3 h-3 opacity-70" />
                        <span className="opacity-70">{t('statusBar.agentReady', 'Agent Ready')}</span>
                    </>
                );
        }
    };

    const getTextColor = () => {
        switch (agentStatus) {
            case 'thinking':
                return 'text-info';
            case 'executing':
                return 'text-warning';
            case 'error':
                return 'text-destructive';
            default:
                return 'text-foreground/60';
        }
    };

    return (
        <StatusBarSegment
            className={getTextColor()}
            dividerLeft
        >
            {renderContent()}
        </StatusBarSegment>
    );
}
