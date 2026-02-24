/**
 * @fileoverview SystemRail - Bottom status bar with expandable terminal drawer
 * @module presentation/components/layout/SystemRail
 *
 * **UX-05**: Implement System Rail
 *
 * Fixed bottom rail displaying:
 * - Left: Agent status with Lucide icon
 * - Center: Editor info (Line, Column)
 * - Right: Problems count, Sync status
 *
 * Expandable drawer for terminal output (200px height).
 *
 * @epic EPIC-UX-GLOBAL-UI
 * @story UX-05
 * @team Team B
 * @created 2026-01-26
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bot,
  Loader2,
  AlertTriangle,
  AlertCircle,
  Check,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Terminal,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

type AgentStatus = 'idle' | 'working' | 'error';
type SyncStatus = 'synced' | 'syncing' | 'error';

interface SystemRailProps {
  /** Agent status */
  agentStatus?: AgentStatus;
  /** Agent error message (if status is 'error') */
  agentError?: string;
  /** Current editor line number */
  line?: number;
  /** Current editor column number */
  column?: number;
  /** Number of problems/errors */
  problemsCount?: number;
  /** Sync status */
  syncStatus?: SyncStatus;
  /** Custom class name */
  className?: string;
}

// ============================================================================
// SystemRail Component
// ============================================================================

/**
 * SystemRail Component
 *
 * @remarks
 * Bottom status bar with:
 * - Agent status indicator
 * - Editor cursor position
 * - Problems count
 * - Sync status
 * - Expandable terminal drawer
 *
 * 8-Bit Design:
 * - Sharp corners (rounded-none)
 * - Solid colors
 * - Pixel shadows when expanded
 */
export function SystemRail({
  agentStatus = 'idle',
  agentError,
  line = 0,
  column = 0,
  problemsCount = 0,
  syncStatus = 'synced',
  className = '',
}: SystemRailProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Toggle terminal drawer
  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // ========================================================================
  // Agent Status Icon
  // ========================================================================

  const renderAgentStatus = () => {
    switch (agentStatus) {
      case 'working':
        return (
          <div className="flex items-center gap-2 text-primary">
            <Loader2 size={14} className="animate-spin" />
            <span className="text-xs font-mono">
              {t('systemRail.agent.working')}
            </span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle size={14} />
            <span className="text-xs font-mono truncate max-w-[150px]">
              {agentError || t('systemRail.agent.error')}
            </span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Bot size={14} />
            <span className="text-xs font-mono">
              {t('systemRail.agent.ready')}
            </span>
          </div>
        );
    }
  };

  // ========================================================================
  // Sync Status Icon
  // ========================================================================

  const renderSyncStatus = () => {
    switch (syncStatus) {
      case 'syncing':
        return (
          <div className="flex items-center gap-1 text-primary">
            <RefreshCw size={12} className="animate-spin" />
            <span className="text-xs font-mono hidden sm:inline">
              {t('systemRail.sync.syncing')}
            </span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-1 text-destructive">
            <AlertCircle size={12} />
            <span className="text-xs font-mono hidden sm:inline">
              {t('systemRail.sync.error')}
            </span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 text-success">
            <Check size={12} />
            <span className="text-xs font-mono hidden sm:inline">
              {t('systemRail.sync.synced')}
            </span>
          </div>
        );
    }
  };

  // ========================================================================
  // Main Render
  // ========================================================================

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-40
        flex flex-col
        bg-card border-t-2 border-structural
        transition-all duration-200 ease-in-out
        ${isExpanded ? 'h-[232px]' : 'h-8'}
        ${className}
      `}
    >
      {/* ========================================================================
          Rail Bar (always visible)
         ======================================================================== */}
      <button
        onClick={handleToggle}
        className="h-8 px-3 flex items-center justify-between shrink-0 w-full hover:bg-canvas/50 transition-colors"
        aria-expanded={isExpanded}
        aria-controls="system-rail-drawer"
      >
        {/* Left Section: Agent Status */}
        <div className="flex items-center gap-4">
          {renderAgentStatus()}
        </div>

        {/* Center Section: Editor Info */}
        <div className="flex items-center gap-4 text-muted-foreground">
          <span className="text-xs font-mono hidden md:inline">
            {t('systemRail.editor.position', { line, column })}
          </span>
          <span className="text-xs font-mono md:hidden">
            Ln {line}
          </span>
        </div>

        {/* Right Section: Problems + Sync + Expand Toggle */}
        <div className="flex items-center gap-4">
          {/* Problems Count */}
          <div
            className={`
              flex items-center gap-1
              ${problemsCount > 0 ? 'text-destructive' : 'text-muted-foreground'}
            `}
          >
            <AlertCircle size={12} />
            <span className="text-xs font-mono">{problemsCount}</span>
          </div>

          {/* Sync Status */}
          {renderSyncStatus()}

          {/* Expand/Collapse Toggle */}
          <div className="flex items-center gap-1 text-muted-foreground">
            <Terminal size={12} />
            {isExpanded ? (
              <ChevronDown size={12} />
            ) : (
              <ChevronUp size={12} />
            )}
          </div>
        </div>
      </button>

      {/* ========================================================================
          Terminal Drawer (expandable)
         ======================================================================== */}
      <div
        id="system-rail-drawer"
        className={`
          flex-1 overflow-hidden
          bg-background border-t border-structural
          transition-all duration-200 ease-in-out
          ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
      >
        {/* Terminal placeholder - integrate with actual terminal component */}
        <div className="h-full w-full p-2 font-mono text-xs text-muted-foreground overflow-auto">
          <div className="flex items-center gap-2 mb-2 text-foreground">
            <Terminal size={14} />
            <span>{t('systemRail.terminal.title')}</span>
          </div>
          <div className="text-muted-foreground/70">
            {t('systemRail.terminal.placeholder')}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Default Export
// ============================================================================

export default SystemRail;
