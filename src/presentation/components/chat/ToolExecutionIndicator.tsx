/**
 * @fileoverview Tool Execution Indicator Component
 * @module presentation/components/chat/ToolExecutionIndicator
 *
 * Inline tool execution status indicator for chat message stream
 * Shows real-time status of tool execution with animated transitions
 *
 * ARCH-01.4 - Agent Tool Permission Matrix
 *
 * Features:
 * - Tool name, icon, and status display
 * - Progress spinner for long-running operations
 * - Animated status transitions (using animations.css)
 * - Inline in chat message stream
 * - Compact design for chat UI
 */

import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';

/**
 * Tool execution status
 */
export type ToolExecutionStatus = 'pending' | 'executing' | 'completed' | 'failed';

/**
 * Props for ToolExecutionIndicator component
 */
export interface ToolExecutionIndicatorProps {
  /** Tool name being executed */
  toolName: string;
  /** Current execution status */
  status: ToolExecutionStatus;
  /** Optional error message */
  error?: string | null;
  /** Optional duration in milliseconds */
  duration?: number;
  /** Optional className for styling */
  className?: string;
  /** Compact mode (smaller size) */
  compact?: boolean;
}

/**
 * Tool category to icon mapping
 */
const TOOL_ICONS: Record<string, string> = {
  read_file: '📄',
  write_file: '💾',
  create_directory: '📁',
  delete_file: '🗑️',
  execute_command: '⌨️',
  search_knowledge: '🧠',
  add_to_knowledge: '➕',
  analyze_image: '👁️',
  capture_screen: '📸',
  web_search: '🔍',
  search_files: '🔍',
  fetch_url: '🌐',
  browse_web: '🌐',
  default: '🔧',
};

/**
 * Get tool icon
 */
function getToolIcon(toolName: string): string {
  return TOOL_ICONS[toolName] || TOOL_ICONS.default;
}

/**
 * Status icon component
 */
function StatusIcon({ status, compact }: { status: ToolExecutionStatus; compact: boolean }) {
  const size = compact ? 'w-3 h-3' : 'w-4 h-4';

  switch (status) {
    case 'pending':
      return <Clock className={cn(size, 'text-muted-foreground')} />;
    case 'executing':
      return <Loader2 className={cn(size, 'text-info animate-spin')} />;
    case 'completed':
      return <CheckCircle2 className={cn(size, 'text-success')} />;
    case 'failed':
      return <XCircle className={cn(size, 'text-destructive')} />;
    default:
      return null;
  }
}

/**
 * Status text mapping
 */
function getStatusText(status: ToolExecutionStatus): string {
  switch (status) {
    case 'pending':
      return 'Queued';
    case 'executing':
      return 'Running';
    case 'completed':
      return 'Done';
    case 'failed':
      return 'Failed';
    default:
      return '';
  }
}

/**
 * Status-based styling classes
 */
function getStatusClasses(status: ToolExecutionStatus): string {
  const base = 'border rounded transition-all duration-200';
  const size = 'px-2 py-1';

  switch (status) {
    case 'pending':
      return cn(base, size, 'bg-muted/50 border-border text-muted-foreground');
    case 'executing':
      return cn(base, size, 'bg-info/30 border-info/50 text-info anim-status-pulse');
    case 'completed':
      return cn(base, size, 'bg-success/20 border-success/30 text-success anim-tool-call-appear');
    case 'failed':
      return cn(base, size, 'bg-destructive/20 border-destructive/30 text-destructive');
    default:
      return base;
  }
}

/**
 * Tool Execution Indicator Component
 *
 * Inline indicator showing tool execution status in chat messages
 * Displays tool name, icon, status, and optional error/duration
 */
export function ToolExecutionIndicator({
  toolName,
  status,
  error,
  duration,
  className,
  compact = true,
}: ToolExecutionIndicatorProps) {
  const icon = getToolIcon(toolName);
  const statusText = getStatusText(status);
  const statusClasses = getStatusClasses(status);
  const textSize = compact ? 'text-xs' : 'text-sm';
  const iconSize = compact ? 'text-sm' : 'text-base';

  return (
    <div className={cn('inline-flex items-center gap-2', statusClasses, className)}>
      {/* Tool icon */}
      <span className={iconSize} role="img" aria-label={toolName}>
        {icon}
      </span>

      {/* Tool name */}
      <span className={cn('font-medium', textSize)}>
        {toolName}
      </span>

      {/* Separator */}
      <span className="text-muted-foreground">·</span>

      {/* Status icon */}
      <StatusIcon status={status} compact={compact} />

      {/* Status text */}
      <span className={cn(textSize, 'text-muted-foreground')}>
        {statusText}
      </span>

      {/* Duration */}
      {duration !== undefined && status === 'completed' && (
        <>
          <span className="text-muted-foreground">·</span>
          <span className={cn(textSize, 'text-muted-foreground')}>
            {duration}ms
          </span>
        </>
      )}

      {/* Error message */}
      {error && status === 'failed' && (
        <span className={cn(textSize, 'text-destructive ml-1')}>
          : {error}
        </span>
      )}
    </div>
  );
}

/**
 * Compact version for inline chat use
 */
export function CompactToolExecutionIndicator(props: Omit<ToolExecutionIndicatorProps, 'compact'>) {
  return <ToolExecutionIndicator {...props} compact />;
}

/**
 * Group of tool execution indicators
 */
export interface ToolExecutionIndicatorGroupProps {
  /** Tool executions to display */
  executions: Array<{
    toolName: string;
    status: ToolExecutionStatus;
    error?: string | null;
    duration?: number;
  }>;
  /** Optional className */
  className?: string;
  /** Compact mode */
  compact?: boolean;
}

export function ToolExecutionIndicatorGroup({
  executions,
  className,
  compact = true,
}: ToolExecutionIndicatorGroupProps) {
  if (executions.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {executions.map((execution, index) => (
        <ToolExecutionIndicator
          key={`${execution.toolName}-${index}`}
          toolName={execution.toolName}
          status={execution.status}
          error={execution.error}
          duration={execution.duration}
          compact={compact}
        />
      ))}
    </div>
  );
}

export default ToolExecutionIndicator;
