/**
 * ToolCallBadge - Inline badge showing tool call status in chat
 *
 * @epic Epic-28 Story 28-19
 * @integrates Epic-25 Story 25-1 - TanStack AI ToolCallStreamChunk parsing
 * @integrates Epic-6 Story 6-X - Tool execution events display
 * @integrates Epic-12 Story 12-X - Tool registry definitions
 *
 * @description
 * Premium badge component for displaying AI agent tool calls inline in chat.
 * Uses 8-bit pixel aesthetic with status-based styling and animations.
 *
 * @listens tool:called - Updates badge when tool execution starts
 * @listens tool:completed - Updates badge when tool execution finishes
 *
 * @roadmap
 * - Epic 25: Wire to actual TanStack AI streaming events
 * - Epic 26: Add multi-agent handoff indicators
 *
 * @example
 * ```tsx
 * <ToolCallBadge
 *   name="read_file"
 *   status="running"
 *   arguments={{ path: "src/App.tsx" }}
 * />
 * ```
 */

import { cn } from '@/lib/utils';
import {
    FileText,
    Save,
    FolderOpen,
    Terminal,
    Search,
    Wrench,
    Loader2,
    CheckCircle,
    XCircle,
    Clock,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ToolCallBadgeProps, ToolCallStatus, ToolCategory } from '@/types/tool-call';
import { getToolCategory } from '@/types/tool-call';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * Icon mapping for tool categories
 */
const TOOL_ICONS: Record<ToolCategory, typeof FileText> = {
    read: FileText,
    write: Save,
    execute: Terminal,
    search: Search,
    default: Wrench,
};

/**
 * Status icon mapping
 */
const STATUS_ICONS: Record<ToolCallStatus, typeof Loader2 | null> = {
    pending: Clock,
    running: Loader2,
    success: CheckCircle,
    error: XCircle,
};

/**
 * Status-based styling classes
 */
const STATUS_STYLES: Record<ToolCallStatus, string> = {
    pending: 'bg-muted text-muted-foreground animate-pulse',
    running: 'bg-primary/20 text-primary border-primary/50',
    success: 'bg-green-500/20 text-green-500 border-green-500/50',
    error: 'bg-red-500/20 text-red-500 border-red-500/50',
};

/**
 * Format tool arguments for display
 */
function formatArguments(args: Record<string, unknown> | undefined): string {
    if (!args || Object.keys(args).length === 0) {
        return '';
    }

    try {
        return JSON.stringify(args, null, 2);
    } catch {
        return String(args);
    }
}

/**
 * Truncate long argument values
 */
function truncateValue(value: unknown, maxLength = 30): string {
    const str = String(value);
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + '...';
}

export function ToolCallBadge({
    name,
    status,
    arguments: args,
    duration,
    expanded = false,
    onClick,
    className,
}: ToolCallBadgeProps) {
    const { t } = useTranslation();

    const category = getToolCategory(name);
    const ToolIcon = TOOL_ICONS[category];
    const StatusIcon = STATUS_ICONS[status];

    const tooltipContent = (
        <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center gap-2">
                <span className="font-bold">{name}</span>
                <span className="text-muted-foreground">
                    {t(`chat.tools.${status}`, status)}
                </span>
            </div>

            {args && Object.keys(args).length > 0 && (
                <div className="space-y-1">
                    <span className="text-muted-foreground">
                        {t('chat.tools.arguments', 'Arguments')}:
                    </span>
                    <pre className="bg-background/50 p-2 rounded-none text-[10px] max-w-[200px] overflow-auto">
                        {formatArguments(args)}
                    </pre>
                </div>
            )}

            {duration !== undefined && (
                <div className="text-muted-foreground">
                    {duration}ms
                </div>
            )}
        </div>
    );

    const badge = (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                // Base styles - 8-bit pixel aesthetic
                'inline-flex items-center gap-1 px-1.5 py-0.5',
                'font-mono text-[10px] border rounded-none',
                'shadow-[1px_1px_0px_0px_rgba(0,0,0,0.2)]',
                'transition-all duration-150',
                'hover:brightness-110 active:translate-y-[1px] active:shadow-none',
                // Status-based styling
                STATUS_STYLES[status],
                className
            )}
            aria-label={`${name} - ${t(`chat.tools.${status}`, status)}`}
        >
            {/* Tool icon */}
            <ToolIcon className="w-3 h-3" />

            {/* Tool name */}
            <span className="font-semibold">{name}</span>

            {/* Status icon */}
            {StatusIcon && (
                <StatusIcon
                    className={cn(
                        'w-3 h-3',
                        status === 'running' && 'animate-spin'
                    )}
                />
            )}

            {/* Duration badge */}
            {duration !== undefined && status === 'success' && (
                <span className="text-muted-foreground">{duration}ms</span>
            )}
        </button>
    );

    // Return with or without tooltip
    if (expanded || !args || Object.keys(args).length === 0) {
        return badge;
    }

    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>{badge}</TooltipTrigger>
                <TooltipContent
                    side="top"
                    className="bg-popover border-border rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
                >
                    {tooltipContent}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

/**
 * ToolCallBadgeGroup - Renders multiple tool call badges
 */
export interface ToolCallBadgeGroupProps {
    /** Array of tool calls to display */
    toolCalls: Array<{
        id: string;
        name: string;
        status: ToolCallStatus;
        arguments?: Record<string, unknown>;
        duration?: number;
    }>;
    /** Callback when a badge is clicked */
    onBadgeClick?: (id: string) => void;
    /** Additional CSS classes */
    className?: string;
}

export function ToolCallBadgeGroup({
    toolCalls,
    onBadgeClick,
    className,
}: ToolCallBadgeGroupProps) {
    if (!toolCalls || toolCalls.length === 0) {
        return null;
    }

    return (
        <div className={cn('flex flex-wrap gap-1', className)}>
            {toolCalls.map((call) => (
                <ToolCallBadge
                    key={call.id}
                    name={call.name}
                    status={call.status}
                    arguments={call.arguments}
                    duration={call.duration}
                    onClick={() => onBadgeClick?.(call.id)}
                />
            ))}
        </div>
    );
}

export default ToolCallBadge;
