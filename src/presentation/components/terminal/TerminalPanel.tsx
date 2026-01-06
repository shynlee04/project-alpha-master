/**
 * @fileoverview Terminal Panel Component
 * @module presentation/components/terminal/TerminalPanel
 *
 * Terminal panel with xterm.js integration, command execution,
 * and shell support.
 *
 * @story S-036 Terminal/Console Integration
 */

import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { XTerminal } from '@/presentation/components/ide/XTerminal';
import { useTerminalStore } from '@/infrastructure/persistence/stores/terminal-store';
import { cn } from '@/lib/utils';

/**
 * Terminal Panel Props
 */
export interface TerminalPanelProps {
  /** Initial working directory */
  cwd?: string;
  /** Initial sync completed flag */
  initialSyncCompleted?: boolean;
  /** Permission state */
  permissionState?: 'prompt' | 'granted' | 'denied';
  /** Additional class names */
  className?: string;
}

/**
 * Terminal Panel Component
 *
 * Enhanced terminal panel that wraps XTerminal with:
 * - Multiple terminal tabs support
 * - Terminal settings persistence
 * - Tab management
 *
 * @example
 * ```tsx
 * <TerminalPanel
 *   cwd="/project"
 *   initialSyncCompleted={true}
 *   permissionState="granted"
 * />
 * ```
 */
export function TerminalPanel({
  cwd = '/project',
  initialSyncCompleted = false,
  permissionState = 'granted',
  className,
}: TerminalPanelProps) {
  const { t } = useTranslation();

  // Store state
  const tabs = useTerminalStore((s) => s.tabs);
  const activeTabId = useTerminalStore((s) => s.activeTabId);
  const createTab = useTerminalStore((s) => s.createTab);
  const closeTab = useTerminalStore((s) => s.closeTab);
  const setActiveTab = useTerminalStore((s) => s.setActiveTab);

  // Create initial tab if none exist
  useEffect(() => {
    if (tabs.length === 0) {
      createTab(cwd);
    }
  }, []);

  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* Terminal Tabs */}
      {tabs.length > 0 && (
        <div className="flex items-center gap-1 px-2 py-1 bg-muted border-b border-border overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={cn(
                'group flex items-center gap-2 px-3 py-1.5 rounded-t text-sm whitespace-nowrap transition-colors border',
                activeTabId === tab.id
                  ? 'bg-background border-border border-b-0 text-foreground'
                  : 'border-transparent hover:bg-muted text-muted-foreground'
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="font-medium">{tab.name}</span>
              {tab.isShellStarted && (
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Terminal Content */}
      <div className="flex-1 relative">
        <XTerminal
          initialSyncCompleted={initialSyncCompleted}
          permissionState={permissionState}
        />
      </div>
    </div>
  );
}
