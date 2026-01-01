/**
 * AgentSelector - 8-bit styled agent dropdown
 * 
 * Dropdown for selecting AI agents in chat.
 * Shows agent name, model, and status (online/offline/busy).
 * 
 * @epic MVP - AI Coding Agent Vertical Slice
 * @story MVP-2 - Chat Interface with Rich Streaming
 * @story AC-02 - Agent Selector Unification (Architectural Consolidation)
 * 
 * AC-02: Enhanced with variant support for different workspace presentations
 * FIXED: Now uses real agents store instead of mock data
 */

import { useState } from 'react';
import { ChevronDown, Bot, Circle, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/presentation/components/ui/button';
import { TruncatedText } from '@/presentation/components/ui/truncated-text';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu';
import type { Agent } from '@/mocks/agents';
import { useAgentsStore } from '@/infrastructure/persistence/stores/agents';
import { useTranslation } from 'react-i18next';
import { detectWorkspace } from '@/lib/workspace/workspace-detector';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
import {
    STORE_EVENTS,
    emitStoreEvent,
    type AgentSelectedPayload,
} from '@/lib/events/store-events';

/**
 * Display variants for different contexts
 * - full: Full display with all details (IDE sidebar)
 * - compact: Smaller display for workspace headers
 * - minimal: Icon-only with tooltip (mobile/tight spaces)
 */
export type AgentSelectorVariant = 'full' | 'compact' | 'minimal';

interface AgentSelectorProps {
    /** List of agents to display - defaults to mockAgents if not provided */
    agents?: Agent[];
    /** Currently selected agent */
    selectedAgent?: Agent | null;
    /** Callback when agent is selected */
    onSelectAgent?: (agent: Agent) => void;
    /** Whether the selector is disabled */
    disabled?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Display variant - affects size and detail level */
    variant?: AgentSelectorVariant;
    /** Workspace type for context-aware behavior */
    workspaceType?: WorkspaceType;
}

/**
 * Get status color class
 */
function getStatusColor(status: Agent['status']): string {
    switch (status) {
        case 'online':
            return 'bg-green-500 shadow-colored-success';
        case 'busy':
            return 'bg-yellow-500 shadow-colored-warning';
        case 'offline':
            return 'bg-slate-500';
        case 'error':
            return 'bg-red-500 shadow-colored-error';
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
 * 
 * AC-02: Unified agent selector with variant support and cross-workspace reactivity
 * FIXED: Now uses real agents store instead of mock data
 */
export function AgentSelector({
    agents: propAgents,
    selectedAgent: propSelectedAgent,
    onSelectAgent,
    disabled = false,
    className,
    variant = 'full',
    workspaceType = 'ide',
}: AgentSelectorProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    // TODO: Add config dialog integration in future iteration
    // const [configDialogOpen, setConfigDialogOpen] = useState(false);
    // const [editingAgent, setEditingAgent] = useState<Agent | undefined>(undefined);

    // Ralph Loop Cycle 4 Phase 6: Workspace-aware agent filtering
    const currentWorkspace = detectWorkspace() as WorkspaceType;

    // Use real agents from store instead of mock data
    // Use individual selectors to avoid infinite re-renders
    const storeAgents = useAgentsStore(s => s.agents)
    const activeAgentId = useAgentsStore(s => s.activeAgentId)
    const setActiveAgent = useAgentsStore(s => s.setActiveAgent)
    const getAgentsForWorkspace = useAgentsStore(s => s.getAgentsForWorkspace)

    // Filter agents to only show those available in current workspace
    const workspaceFilteredAgents = getAgentsForWorkspace(currentWorkspace);

    // Allow prop override for backwards compatibility, but default to filtered store agents
    const agents = propAgents ?? workspaceFilteredAgents;

    // Get selected agent from store or from prop
    const selectedAgent = propSelectedAgent ??
        storeAgents.find(a => a.id === activeAgentId) ??
        storeAgents[0] ??
        null;

    // Sort agents: online first, then by name
    const sortedAgents = [...agents].sort((a, b) => {
        if (a.status === 'online' && b.status !== 'online') return -1;
        if (b.status === 'online' && a.status !== 'online') return 1;
        return a.name.localeCompare(b.name);
    });

    /**
     * Handle agent selection with event emission
     * AC-02: Cross-workspace reactivity via event bus + store update
     */
    const handleAgentSelect = (agent: Agent) => {
        // Update store's active agent
        setActiveAgent(agent.id);

        // Call external handler if provided
        onSelectAgent?.(agent);

        // Emit event for cross-workspace synchronization
        emitStoreEvent<AgentSelectedPayload>(STORE_EVENTS.AGENT_SELECTED, {
            agentId: agent.id,
            workspaceType,
            timestamp: Date.now(),
        });

        setOpen(false);
    };

    /**
     * Open agent configuration dialog
     */
    // TODO: Add config dialog integration in future iteration
    // const handleOpenConfig = (agent?: Agent) => {
    //     setEditingAgent(agent);
    //     setConfigDialogOpen(true);
    //     setOpen(false);
    // };

    // Render compact variant
    if (variant === 'compact') {
        return (
            <CompactAgentSelector
                agents={sortedAgents}
                selectedAgent={selectedAgent}
                onSelect={handleAgentSelect}
                disabled={disabled}
                className={className}
            />
        );
    }

    // Render minimal variant
    if (variant === 'minimal') {
        return (
            <MinimalAgentSelector
                agents={sortedAgents}
                selectedAgent={selectedAgent}
                onSelect={handleAgentSelect}
                disabled={disabled}
                className={className}
            />
        );
    }

    // Full variant (default)

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
                        'shadow-md',
                        'hover:shadow-sm',
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
                            <div className="flex flex-col items-start min-w-0 max-w-[120px]">
                                <TruncatedText
                                    text={selectedAgent.name}
                                    className="text-xs font-bold text-slate-100 w-full"
                                />
                                <TruncatedText
                                    text={selectedAgent.modelId.split('/').pop() || ''}
                                    className="text-[10px] text-slate-400 w-full"
                                />
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
                    'shadow-lg'
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
                            onClick={() => handleAgentSelect(agent)}
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
                                    <TruncatedText text={agent.modelId} />
                                </div>
                                <div className="text-[10px] text-slate-500">
                                    {agent.providerId}
                                </div>
                            </div>
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// =============================================================================
// Compact and Minimal Variants
// =============================================================================

interface VariantSelectorProps {
    agents: Agent[];
    selectedAgent: Agent | null;
    onSelect: (agent: Agent) => void;
    disabled?: boolean;
    className?: string;
}

/**
 * Compact variant for workspace headers
 * AC-02: Smaller footprint while still showing essential info
 */
function CompactAgentSelector({
    agents,
    selectedAgent,
    onSelect,
    disabled = false,
    className,
}: VariantSelectorProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    className={cn(
                        'h-8 px-2 gap-1.5 font-mono text-xs',
                        'border border-border',
                        'bg-muted/50 hover:bg-muted',
                        className
                    )}
                >
                    {selectedAgent ? (
                        <>
                            <Circle className={cn(
                                'h-2 w-2 fill-current',
                                getStatusColor(selectedAgent.status)
                            )} />
                            <span className="max-w-[100px] truncate">
                                {selectedAgent.name}
                            </span>
                        </>
                    ) : (
                        <>
                            <Bot className="h-3 w-3" />
                            <span>{t('chat.selectAgent', 'Agent')}</span>
                        </>
                    )}
                    <ChevronDown className={cn(
                        'h-3 w-3 transition-transform',
                        open && 'rotate-180'
                    )} />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-56 font-mono"
            >
                {agents.map((agent) => (
                    <DropdownMenuItem
                        key={agent.id}
                        onClick={() => {
                            onSelect(agent);
                            setOpen(false);
                        }}
                        className={cn(
                            'flex items-center gap-2 text-xs cursor-pointer',
                            selectedAgent?.id === agent.id && 'bg-accent'
                        )}
                    >
                        <Circle className={cn(
                            'h-2 w-2 fill-current flex-shrink-0',
                            getStatusColor(agent.status)
                        )} />
                        <span className="flex-1 truncate">{agent.name}</span>
                        <span className="text-muted-foreground text-[10px]">
                            {agent.providerId}
                        </span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/**
 * Minimal variant - icon only with dropdown
 * AC-02: For mobile/tight spaces
 */
function MinimalAgentSelector({
    agents,
    selectedAgent,
    onSelect,
    disabled = false,
    className,
}: VariantSelectorProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    className={cn('h-8 w-8 p-0 relative', className)}
                    title={selectedAgent?.name || t('chat.selectAgent', 'Select Agent')}
                >
                    <Bot className="h-4 w-4" />
                    {selectedAgent && (
                        <Circle className={cn(
                            'absolute -top-0.5 -right-0.5 h-2 w-2 fill-current',
                            getStatusColor(selectedAgent.status)
                        )} />
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-48 font-mono"
            >
                {agents.map((agent) => (
                    <DropdownMenuItem
                        key={agent.id}
                        onClick={() => {
                            onSelect(agent);
                            setOpen(false);
                        }}
                        className={cn(
                            'flex items-center gap-2 text-xs cursor-pointer',
                            selectedAgent?.id === agent.id && 'bg-accent'
                        )}
                    >
                        <Circle className={cn(
                            'h-2 w-2 fill-current',
                            getStatusColor(agent.status)
                        )} />
                        <span className="truncate">{agent.name}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default AgentSelector;
