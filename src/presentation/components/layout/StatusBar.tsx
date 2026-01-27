/**
 * @fileoverview StatusBar - 24px Bottom Status Bar Component
 * @module presentation/components/layout/StatusBar
 *
 * **STATUS BAR COMPONENT**
 *
 * A 24px tall horizontal bar fixed at the bottom of the viewport.
 * Displays system status information in three sections:
 * - Left: Agent status
 * - Center: Editor cursor position
 * - Right: Problems count, Sync status, Terminal toggle
 *
 * Layout position in WorkspaceLayout:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                        Main Content Area                         │
 * ├─────────────────────────────────────────────────────────────────┤
 * │  [Agent Status]     [Ln X, Col Y]      [Problems] [Sync] [Term] │
 * │   24px height - spans full width                                 │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * Responsive Behavior:
 * - Mobile (<768px): Hidden entirely
 * - Tablet (768-1023px): Icons only, compact mode
 * - Desktop (>=1024px): Full layout with all information
 *
 * @epic EPIC-UXUI-02
 * @story UXUI-02-06
 * @team Team B
 * @created 2026-01-28
 */

import { useTranslation } from 'react-i18next';
import { Bot, Loader2, AlertCircle, RefreshCw, TriangleAlert, Terminal, Cloud, CloudOff } from 'lucide-react';

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Agent status states
 */
export type AgentStatus = 'idle' | 'working' | 'error';

/**
 * Sync status states
 */
export type SyncStatus = 'synced' | 'syncing' | 'error';

/**
 * StatusBar Props
 */
export interface StatusBarProps {
  /** Current agent status */
  agentStatus?: AgentStatus;
  /** Optional error message when agentStatus is 'error' */
  agentError?: string;
  /** Current line number in editor */
  line?: number;
  /** Current column number in editor */
  column?: number;
  /** Number of problems/warnings */
  problemsCount?: number;
  /** Current sync status */
  syncStatus?: SyncStatus;
  /** Callback when terminal toggle is clicked */
  onTerminalToggle?: () => void;
  /** Callback when sync retry is clicked (only shown when syncStatus is 'error') */
  onSyncRetry?: () => void;
  /** Additional CSS class names */
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Renders the appropriate agent icon based on status
 */
function renderAgentIcon(status: AgentStatus): React.ReactNode {
  switch (status) {
    case 'working':
      return <Loader2 className="status-bar__icon status-bar__icon--spin" aria-hidden="true" />;
    case 'error':
      return <AlertCircle className="status-bar__icon status-bar__icon--error" aria-hidden="true" />;
    case 'idle':
    default:
      return <Bot className="status-bar__icon" aria-hidden="true" />;
  }
}

/**
 * Renders the appropriate sync icon based on status
 */
function renderSyncIcon(status: SyncStatus): React.ReactNode {
  switch (status) {
    case 'syncing':
      return <RefreshCw className="status-bar__icon status-bar__icon--spin" aria-hidden="true" />;
    case 'error':
      return <CloudOff className="status-bar__icon status-bar__icon--error" aria-hidden="true" />;
    case 'synced':
    default:
      return <Cloud className="status-bar__icon" aria-hidden="true" />;
  }
}

/**
 * Gets the agent status text key for i18n
 */
function getAgentStatusKey(status: AgentStatus): string {
  switch (status) {
    case 'working':
      return 'statusBar.agentWorking';
    case 'error':
      return 'statusBar.agentError';
    case 'idle':
    default:
      return 'statusBar.agentReady';
  }
}

/**
 * Gets the sync status text key for i18n
 */
function getSyncStatusKey(status: SyncStatus): string {
  switch (status) {
    case 'syncing':
      return 'statusBar.syncing';
    case 'error':
      return 'statusBar.syncError';
    case 'synced':
    default:
      return 'statusBar.synced';
  }
}

// ============================================================================
// StatusBar Component
// ============================================================================

/**
 * StatusBar Component - 24px Bottom Status Bar
 *
 * @param props - StatusBarProps
 * @returns Status bar JSX element
 *
 * @remarks
 * 8-Bit Design Features:
 * - Sharp corners (border-radius: 0)
 * - 24px fixed height
 * - CSS variable-based theming
 * - Three-section layout (left/center/right)
 * - Responsive: hidden on mobile, icons-only on tablet
 */
export function StatusBar({
  agentStatus = 'idle',
  agentError,
  line = 1,
  column = 1,
  problemsCount = 0,
  syncStatus = 'synced',
  onTerminalToggle,
  onSyncRetry,
  className = '',
}: StatusBarProps) {
  const { t } = useTranslation();

  const handleSyncClick = () => {
    if (syncStatus === 'error' && onSyncRetry) {
      onSyncRetry();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, callback?: () => void) => {
    if (!callback) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  };

  return (
    <footer
      className={`status-bar ${className}`}
      role="status"
      aria-label={t('statusBar.ariaLabel', 'Status bar')}
    >
      {/* Left Section - Agent Status */}
      <div className="status-bar__section status-bar__section--left">
        <div
          className={`status-bar__item status-bar__item--agent status-bar__item--${agentStatus}`}
          title={agentError || t(getAgentStatusKey(agentStatus))}
        >
          {renderAgentIcon(agentStatus)}
          <span className="status-bar__text status-bar__text--desktop">
            {t(getAgentStatusKey(agentStatus))}
          </span>
        </div>
      </div>

      {/* Center Section - Cursor Position */}
      <div className="status-bar__section status-bar__section--center">
        <div className="status-bar__item">
          <span className="status-bar__text">
            {t('statusBar.cursorPosition', { line, column })}
          </span>
        </div>
      </div>

      {/* Right Section - Problems, Sync, Terminal */}
      <div className="status-bar__section status-bar__section--right">
        {/* Problems Count */}
        <div
          className={`status-bar__item status-bar__item--problems ${problemsCount > 0 ? 'status-bar__item--warning' : ''}`}
          title={t('statusBar.problems', { count: problemsCount })}
        >
          <TriangleAlert className="status-bar__icon" aria-hidden="true" />
          <span className="status-bar__text status-bar__text--desktop">
            {problemsCount}
          </span>
        </div>

        {/* Sync Status */}
        <div
          className={`status-bar__item status-bar__item--sync status-bar__item--${syncStatus}`}
          onClick={handleSyncClick}
          onKeyDown={(e) => handleKeyDown(e, handleSyncClick)}
          role={syncStatus === 'error' ? 'button' : undefined}
          tabIndex={syncStatus === 'error' ? 0 : undefined}
          title={t(getSyncStatusKey(syncStatus))}
        >
          {renderSyncIcon(syncStatus)}
          <span className="status-bar__text status-bar__text--desktop">
            {t(getSyncStatusKey(syncStatus))}
          </span>
        </div>

        {/* Terminal Toggle */}
        {onTerminalToggle && (
          <div
            className="status-bar__item status-bar__item--terminal"
            onClick={onTerminalToggle}
            onKeyDown={(e) => handleKeyDown(e, onTerminalToggle)}
            role="button"
            tabIndex={0}
            title={t('statusBar.toggleTerminal', 'Toggle Terminal')}
          >
            <Terminal className="status-bar__icon" aria-hidden="true" />
            <span className="status-bar__text status-bar__text--desktop">
              {t('statusBar.terminal', 'Terminal')}
            </span>
          </div>
        )}
      </div>
    </footer>
  );
}

// ============================================================================
// Default Export
// ============================================================================

export default StatusBar;
