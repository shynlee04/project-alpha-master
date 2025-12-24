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
import { useTranslation } from 'react-i18next';
import { Bot, Loader2, Zap, AlertCircle } from 'lucide-react';
import { useStatusBarStore } from '@/lib/state/statusbar-store';
import { StatusBarSegment } from './StatusBarSegment';
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';

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
    const { eventBus } = useWorkspace();
    const agentStatus = useStatusBarStore((s) => s.agentStatus);
    const setAgentStatus = useStatusBarStore((s) => s.setAgentStatus);

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
                return 'text-blue-400';
            case 'executing':
                return 'text-yellow-400';
            case 'error':
                return 'text-red-400';
            default:
                return 'text-white/60';
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
