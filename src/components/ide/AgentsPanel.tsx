import { useState, useCallback } from 'react'
import { SidebarHeader } from './IconSidebar'
import { useTranslation } from 'react-i18next'
import { Bot, Plus, RefreshCw, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusDot } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useAgents } from '@/hooks/useAgents'
import { useAgentSelection } from '@/stores/agent-selection-store'
import { AgentConfigDialog } from '@/components/agent/AgentConfigDialog'
import type { Agent } from '@/mocks/agents'

/**
 * AgentsPanel - Agent management sidebar panel
 * 
 * @epic Epic-28 Story 28-15, 28-16
 * @integration Uses useAgents hook with mock data
 * @roadmap Replace mock with TanStack Query in Epic 25
 * 
 * Shows when 'agents' is active in the activity bar.
 * Displays available agents and their status.
 */

export function AgentsPanel({
    onSelectAgent
}: {
    onSelectAgent?: (agent: Agent) => void
}) {
    const { t } = useTranslation()
    const { agents, isLoading, refreshAgents, addAgent } = useAgents()
    const { activeAgentId, setActiveAgent } = useAgentSelection()

    // Dialog state for agent configuration
    const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false)

    const handleAddAgent = useCallback(() => {
        setIsConfigDialogOpen(true)
    }, [])

    return (
        <div className="flex flex-col h-full">
            <SidebarHeader
                title={t('sidebar.agents', 'Agents')}
                actions={
                    <>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={handleAddAgent}
                            title={t('actions.addAgent', 'Add Agent')}
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={refreshAgents}
                            disabled={isLoading}
                            title={t('actions.refresh', 'Refresh')}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4" />
                            )}
                        </Button>
                    </>
                }
            />
            <div className="flex-1 overflow-auto scrollbar-thin">
                {isLoading && agents.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : agents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <Bot className="w-12 h-12 text-muted-foreground/50 mb-4" />
                        <p className="text-sm text-muted-foreground">
                            {t('sidebar.noAgents', 'No agents configured')}
                        </p>
                        <Button
                            variant="pixel-outline"
                            size="sm"
                            className="mt-4"
                            onClick={handleAddAgent}
                        >
                            <Plus className="w-4 h-4" />
                            {t('actions.addAgent', 'Add Agent')}
                        </Button>
                    </div>
                ) : (
                    <div className="p-1 space-y-0.5">
                        {agents.map((agent) => (
                            <AgentItem
                                key={agent.id}
                                agent={agent}
                                isSelected={activeAgentId === agent.id}
                                onClick={() => {
                                    setActiveAgent(agent.id)
                                    onSelectAgent?.(agent)
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Agent Configuration Dialog */}
            <AgentConfigDialog
                open={isConfigDialogOpen}
                onOpenChange={setIsConfigDialogOpen}
                onSubmit={addAgent}
            />
        </div>
    )
}

function AgentItem({
    agent,
    isSelected,
    onClick
}: {
    agent: Agent
    isSelected?: boolean
    onClick?: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-left rounded-none",
                "hover:bg-secondary transition-colors group",
                isSelected && "bg-primary/10 border-l-2 border-primary"
            )}
        >
            <div className="relative">
                <Bot className={cn(
                    "w-5 h-5",
                    isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} />
                <StatusDot
                    status={agent.status}
                    size="sm"
                    className="absolute -bottom-0.5 -right-0.5"
                />
            </div>
            <div className="flex-1 min-w-0">
                <p className={cn(
                    "text-sm font-medium truncate",
                    isSelected ? "text-primary" : "text-foreground"
                )}>
                    {agent.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                    {agent.role} • {agent.model}
                </p>
            </div>
            {isSelected && (
                <Check className="w-4 h-4 text-primary" />
            )}
        </button>
    )
}

export type { Agent }

