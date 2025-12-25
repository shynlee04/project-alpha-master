import { cn } from '@/lib/utils'
import { StatusDot } from '@/components/ui'
import { Bot, MoreVertical, Play, Pause, Settings, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTranslation } from 'react-i18next'

/**
 * AgentCard - Individual agent display card for dashboard
 * 
 * Features:
 * - Status indicator with pulse animation
 * - Agent metadata display
 * - Quick action menu
 * - Pixel aesthetic styling
 */

interface AgentCardProps {
    id: string
    name: string
    status: 'online' | 'offline' | 'busy' | 'error'
    model?: string
    description?: string
    lastActive?: Date
    messagesCount?: number
    onStart?: () => void
    onStop?: () => void
    onSettings?: () => void
    onDelete?: () => void
    onClick?: () => void
    className?: string
}

export function AgentCard({
    id,
    name,
    status,
    model,
    description,
    lastActive,
    messagesCount,
    onStart,
    onStop,
    onSettings,
    onDelete,
    onClick,
    className
}: AgentCardProps) {
    const { t } = useTranslation()

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative p-4 bg-card border border-border rounded-none",
                "hover:border-primary/50 hover:bg-secondary/30 transition-all cursor-pointer",
                "shadow-sm",
                className
            )}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 bg-secondary flex items-center justify-center rounded-none">
                        <Bot className="w-5 h-5 text-primary" />
                        <StatusDot
                            status={status}
                            size="md"
                            className="absolute -bottom-0.5 -right-0.5 ring-2 ring-card"
                        />
                    </div>
                    <div>
                        <h3 className="font-pixel text-base text-foreground">{name}</h3>
                        {model && (
                            <p className="text-xs text-muted-foreground">{model}</p>
                        )}
                    </div>
                </div>

                {/* Actions dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-none">
                        {status === 'online' || status === 'busy' ? (
                            <DropdownMenuItem onClick={onStop}>
                                <Pause className="w-4 h-4 mr-2" />
                                {t('actions.stop', 'Stop')}
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem onClick={onStart}>
                                <Play className="w-4 h-4 mr-2" />
                                {t('actions.start', 'Start')}
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={onSettings}>
                            <Settings className="w-4 h-4 mr-2" />
                            {t('settings.title', 'Settings')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onDelete} className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('actions.delete', 'Delete')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Description */}
            {description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {description}
                </p>
            )}

            {/* Footer stats */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {lastActive && (
                    <span>
                        {t('agent.lastActive', 'Last active')}: {formatTimeAgo(lastActive)}
                    </span>
                )}
                {messagesCount !== undefined && (
                    <span>
                        {messagesCount} {t('agent.messages', 'messages')}
                    </span>
                )}
            </div>
        </div>
    )
}

/**
 * MetricsCard - Dashboard metrics display
 */
interface MetricsCardProps {
    title: string
    value: string | number
    change?: {
        value: number
        type: 'increase' | 'decrease' | 'neutral'
    }
    icon?: React.ReactNode
    className?: string
}

export function MetricsCard({
    title,
    value,
    change,
    icon,
    className
}: MetricsCardProps) {
    return (
        <div
            className={cn(
                "p-4 bg-card border border-border rounded-none",
                "shadow-sm",
                className
            )}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-pixel uppercase tracking-wider text-muted-foreground">
                    {title}
                </span>
                {icon && (
                    <span className="text-primary">{icon}</span>
                )}
            </div>
            <div className="flex items-end gap-2">
                <span className="text-2xl font-pixel text-foreground">
                    {value}
                </span>
                {change && (
                    <span className={cn(
                        "text-xs font-medium mb-0.5",
                        change.type === 'increase' && "text-green-500",
                        change.type === 'decrease' && "text-red-500",
                        change.type === 'neutral' && "text-muted-foreground"
                    )}>
                        {change.type === 'increase' && '+'}
                        {change.value}%
                    </span>
                )}
            </div>
        </div>
    )
}

// Helper function - simple time ago
function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
}

export type { AgentCardProps, MetricsCardProps }
