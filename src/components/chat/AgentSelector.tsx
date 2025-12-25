/**
 * AgentSelector - 8-bit styled agent dropdown
 * 
 * Dropdown for selecting AI agents in chat.
 * Shows agent name, model, and status (online/offline/busy).
 * 
 * @epic MVP - AI Coding Agent Vertical Slice
 * @story MVP-2 - Chat Interface with Rich Streaming
 */

import { useState } from 'react';
import { ChevronDown, Bot, Circle, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Agent } from '@/mocks/agents';
import { useTranslation } from 'react-i18next';

interface AgentSelectorProps {
    agents: Agent[];
    selectedAgent: Agent | null;
    onSelectAgent: (agent: Agent) => void;
    disabled?: boolean;
    className?: string;
}

/**
 * Get status color class
 */
function getStatusColor(status: Agent['status']): string {
    switch (status) {
        case 'online':
            return 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]';
        case 'busy':
            return 'bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.5)]';
        case 'offline':
            return 'bg-slate-500';
        case 'error':
            return 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]';
        default:
            return 'bg-slate-500';
    }
}

/**
 * Get status text
 */
function getStatusText(status: Agent['status']): string {
    const statusMap: Record<Agent['status'], string> = {
        online: 'ONLINE',
        busy: 'BUSY',
        offline: 'OFFLINE',
        error: 'ERROR',
    };
    return statusMap[status] || 'UNKNOWN';
}

/**
 * AgentSelector Component
 */
export function AgentSelector({
    agents,
    selectedAgent,
    onSelectAgent,
    disabled = false,
    className,
}: AgentSelectorProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    // Sort agents: online first, then by name
    const sortedAgents = [...agents].sort((a, b) => {
        if (a.status === 'online' && b.status !== 'online') return -1;
        if (b.status === 'online' && a.status !== 'online') return 1;
        return a.name.localeCompare(b.name);
    });

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    disabled={disabled}
                    className={cn(
                        'h-10 px-3 gap-2 font-mono',
                        // 8-bit styling
                        'border-2 border-slate-600 dark:border-slate-500',
                        'bg-slate-800/60 hover:bg-slate-700/80',
                        'shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]',
                        'hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)]',
                        'hover:translate-x-[2px] hover:translate-y-[2px]',
                        'transition-all duration-100',
                        className
                    )}
                >
                    {selectedAgent ? (
                        <>
                            {/* Status indicator */}
                            <Circle className={cn(
                                'h-2.5 w-2.5 fill-current',
                                getStatusColor(selectedAgent.status)
                            )} />

                            {/* Agent info */}
                            <div className="flex flex-col items-start">
                                <span className="text-xs font-bold text-slate-100 truncate max-w-[120px]">
                                    {selectedAgent.name}
                                </span>
                                <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                                    {selectedAgent.model.split('/').pop()}
                                </span>
                            </div>
                        </>
                    ) : (
                        <>
                            <Bot className="h-4 w-4" />
                            <span className="text-sm">
                                {t('chat.selectAgent', 'Select Agent')}
                            </span>
                        </>
                    )}
                    <ChevronDown className={cn(
                        'h-4 w-4 transition-transform',
                        open && 'rotate-180'
                    )} />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="start"
                className={cn(
                    'w-64 p-1 font-mono',
                    // 8-bit dropdown styling
                    'border-2 border-slate-600 dark:border-slate-500',
                    'bg-slate-800 dark:bg-slate-900',
                    'shadow-[4px_4px_0px_0px_rgba(0,0,0,0.4)]'
                )}
            >
                {sortedAgents.length === 0 ? (
                    <div className="px-3 py-4 text-center text-slate-500 text-sm">
                        {t('chat.noAgents', 'No agents configured')}
                    </div>
                ) : (
                    sortedAgents.map((agent) => (
                        <DropdownMenuItem
                            key={agent.id}
                            onClick={() => {
                                onSelectAgent(agent);
                                setOpen(false);
                            }}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2 cursor-pointer',
                                'hover:bg-slate-700 focus:bg-slate-700',
                                'rounded-sm',
                                // Highlight selected
                                selectedAgent?.id === agent.id && 'bg-blue-900/30 border border-blue-500/30'
                            )}
                        >
                            {/* Status dot */}
                            <div className={cn(
                                'w-2.5 h-2.5 rounded-full flex-shrink-0',
                                getStatusColor(agent.status)
                            )} />

                            {/* Agent details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-100 truncate">
                                        {agent.name}
                                    </span>
                                    <span className={cn(
                                        'text-[9px] px-1.5 py-0.5 rounded-sm font-bold',
                                        agent.status === 'online' && 'bg-green-900/50 text-green-400',
                                        agent.status === 'busy' && 'bg-yellow-900/50 text-yellow-400',
                                        agent.status === 'offline' && 'bg-slate-700 text-slate-400',
                                        agent.status === 'error' && 'bg-red-900/50 text-red-400'
                                    )}>
                                        {getStatusText(agent.status)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                    <Cpu className="h-3 w-3" />
                                    <span className="truncate">{agent.model}</span>
                                </div>
                                <div className="text-[10px] text-slate-500">
                                    {agent.provider}
                                </div>
                            </div>
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default AgentSelector;
