import { SidebarHeader } from './IconSidebar'
import { useTranslation } from 'react-i18next'
import { Bot, Plus, RefreshCw, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusDot } from '@/components/ui'
import { cn } from '@/lib/utils'

/**
 * AgentsPanel - Agent management sidebar panel
 * 
 * Shows when 'agents' is active in the activity bar.
 * Displays available agents and their status.
 */

interface Agent {
    id: string
    name: string
    status: 'online' | 'offline' | 'busy' | 'error'
    description?: string
}

export function AgentsPanel({
    agents = [],
    onAddAgent,
    onRefresh,
    onSelectAgent
}: {
    agents?: Agent[]
    onAddAgent?: () => void
    onRefresh?: () => void
    onSelectAgent?: (agent: Agent) => void
}) {
    const { t } = useTranslation()

    return (
        <div className="flex flex-col h-full">
            <SidebarHeader
                title={t('sidebar.agents', 'Agents')}
                actions={
                    <>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={onAddAgent}
                            title={t('actions.addAgent', 'Add Agent')}
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={onRefresh}
                            title={t('actions.refresh', 'Refresh')}
                        >
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </>
                }
            />
            <div className="flex-1 overflow-auto">
                {agents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <Bot className="w-12 h-12 text-muted-foreground/50 mb-4" />
                        <p className="text-sm text-muted-foreground">
                            {t('sidebar.noAgents', 'No agents configured')}
                        </p>
                        <Button
                            variant="pixel-outline"
                            size="sm"
                            className="mt-4"
                            onClick={onAddAgent}
                        >
                            <Plus className="w-4 h-4" />
                            {t('actions.addAgent', 'Add Agent')}
                        </Button>
                    </div>
                ) : (
                    <div className="p-1">
                        {agents.map((agent) => (
                            <AgentItem
                                key={agent.id}
                                agent={agent}
                                onClick={() => onSelectAgent?.(agent)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function AgentItem({
    agent,
    onClick
}: {
    agent: Agent
    onClick?: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-left rounded-none",
                "hover:bg-secondary transition-colors group"
            )}
        >
            <div className="relative">
                <Bot className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                <StatusDot
                    status={agent.status}
                    size="sm"
                    className="absolute -bottom-0.5 -right-0.5"
                />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                    {agent.name}
                </p>
                {agent.description && (
                    <p className="text-xs text-muted-foreground truncate">
                        {agent.description}
                    </p>
                )}
            </div>
        </button>
    )
}

export type { Agent }
