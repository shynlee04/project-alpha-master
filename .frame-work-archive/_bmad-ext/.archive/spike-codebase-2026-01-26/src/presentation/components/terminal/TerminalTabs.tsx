/**
 * @fileoverview Terminal Tabs Component
 * @module presentation/components/terminal/TerminalTabs
 *
 * Tab management for multiple terminals with split view support.
 *
 * @story S-036 Terminal/Console Integration
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X, Minus, MoveHorizontal, Maximize2 } from 'lucide-react';
import { useTerminalStore } from '@/infrastructure/persistence/stores/terminal-store';
import { TerminalPanel } from './TerminalPanel';
import { cn } from '@/lib/utils';

/**
 * Terminal Tabs Props
 */
export interface TerminalTabsProps {
  /** Initial working directory */
  cwd?: string;
  /** Initial sync completed flag */
  initialSyncCompleted?: boolean;
  /** Permission state */
  permissionState?: 'prompt' | 'granted' | 'denied';
}

/**
 * Split direction
 */
type SplitDirection = 'none' | 'horizontal' | 'vertical';

/**
 * Terminal Tabs Component
 *
 * Manages multiple terminal tabs with:
 * - Tab creation and deletion
 * - Tab switching
 * - Tab renaming
 * - Split view (horizontal/vertical)
 * - Maximize terminal
 *
 * @example
 * ```tsx
 * <TerminalTabs
 *   cwd="/project"
 *   initialSyncCompleted={true}
 *   permissionState="granted"
 * />
 * ```
 */
export function TerminalTabs({
  cwd = '/project',
  initialSyncCompleted = false,
  permissionState = 'granted',
}: TerminalTabsProps) {
  const { t } = useTranslation();
  // const containerRefs = useRef<Map<string, HTMLDivElement>>(new Map()); // TODO: For future implementation

  // Store state
  const tabs = useTerminalStore((s) => s.tabs);
  const activeTabId = useTerminalStore((s) => s.activeTabId);
  const createTab = useTerminalStore((s) => s.createTab);
  const closeTab = useTerminalStore((s) => s.closeTab);
  const setActiveTab = useTerminalStore((s) => s.setActiveTab);
  const toggleMaximize = useTerminalStore((s) => s.toggleMaximize);
  const isMaximized = useTerminalStore((s) => s.isMaximized);

  // Local state
  const [splitDirection, setSplitDirection] = useState<SplitDirection>('none');
  const [selectedTabIds, setSelectedTabIds] = useState<string[]>([]);

  /**
   * Get container ref for tab
   */
  /* const _getContainerRef = (tabId: string) => {
    if (!containerRefs.current.has(tabId)) {
      containerRefs.current.set(tabId, document.createElement('div'));
    }
    return containerRefs.current.get(tabId)!;
  }; */ // TODO: For future implementation

  /**
   * Handle create new tab
   */
  const handleCreateTab = () => {
    const newTabId = createTab(cwd);
    setActiveTab(newTabId);
  };

  /**
   * Handle close tab
   */
  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const tab = tabs.find((t) => t.id === tabId);
    if (tab?.isShellStarted) {
      if (confirm(t('terminal.confirmCloseShell'))) {
        closeTab(tabId);
      }
    } else {
      if (tabs.length === 1) {
        // Don't close last tab
        return;
      }
      closeTab(tabId);
    }
  };

  /**
   * Handle switch tab
   */
  const handleSwitchTab = (tabId: string) => {
    setActiveTab(tabId);
  };

  /**
   * Handle rename tab
   */
  const handleRenameTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const tab = tabs.find((t) => t.id === tabId);
    if (!tab) return;

    const newName = prompt(t('terminal.renameTabPrompt'), tab.name);
    if (newName && newName.trim()) {
      useTerminalStore.getState().renameTab(tabId, newName.trim());
    }
  };

  /**
   * Handle split view toggle
   */
  const handleToggleSplit = (direction: 'horizontal' | 'vertical') => {
    if (splitDirection === direction) {
      setSplitDirection('none');
      setSelectedTabIds([]);
    } else {
      // Select two tabs to split
      if (tabs.length >= 2) {
        setSplitDirection(direction);
        setSelectedTabIds([tabs[0].id, tabs[1].id]);
      }
    }
  };

  /**
   * Handle maximize
   */
  const handleMaximize = () => {
    toggleMaximize();
  };

  return (
    <div
      className={cn(
        'flex flex-col bg-background border-t border-border',
        isMaximized && 'fixed inset-0 z-50'
      )}
    >
      {/* Terminal Header with Tabs */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted border-b border-border">
        {/* Tabs */}
        <div className="flex items-center gap-1 flex-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={cn(
                'group flex items-center gap-2 px-3 py-1.5 rounded-t text-sm whitespace-nowrap transition-colors border',
                activeTabId === tab.id
                  ? 'bg-background border-border border-b-0 text-foreground'
                  : 'border-transparent hover:bg-muted text-muted-foreground'
              )}
              onClick={() => handleSwitchTab(tab.id)}
              onDoubleClick={(e) => handleRenameTab(tab.id, e)}
            >
              <span className="font-medium">{tab.name}</span>
              {tab.isShellStarted && (
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              )}
              <X
                className="h-3 w-3 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                onClick={(e) => handleCloseTab(tab.id, e)}
              />
            </button>
          ))}

          {/* New Tab Button */}
          <button
            className="flex items-center gap-1 px-2 py-1 rounded text-sm hover:bg-muted transition-colors text-muted-foreground"
            onClick={handleCreateTab}
            title={t('terminal.newTab')}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Split Controls */}
        <div className="flex items-center gap-1 ml-2">
          {/* Split Horizontal */}
          <button
            className={cn(
              'p-1.5 rounded transition-colors',
              splitDirection === 'horizontal'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-muted-foreground'
            )}
            onClick={() => handleToggleSplit('horizontal')}
            title={t('terminal.splitHorizontal')}
          >
            <MoveHorizontal className="h-4 w-4" />
          </button>

          {/* Split Vertical */}
          <button
            className={cn(
              'p-1.5 rounded transition-colors',
              splitDirection === 'vertical'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-muted-foreground'
            )}
            onClick={() => handleToggleSplit('vertical')}
            title={t('terminal.splitVertical')}
          >
            <Minus className="h-4 w-4 rotate-90" />
          </button>

          <div className="w-px h-4 bg-border mx-1" />

          {/* Maximize */}
          <button
            className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground"
            onClick={handleMaximize}
            title={isMaximized ? t('terminal.restore') : t('terminal.maximize')}
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 relative overflow-hidden">
        {splitDirection === 'none' ? (
          // Single terminal view
          <div className="h-full w-full">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={cn(
                  'h-full w-full',
                  activeTabId !== tab.id && 'hidden'
                )}
              >
                <TerminalPanel
                  cwd={tab.cwd}
                  initialSyncCompleted={initialSyncCompleted}
                  permissionState={permissionState}
                />
              </div>
            ))}
          </div>
        ) : (
          // Split view
          <div
            className={cn(
              'h-full w-full',
              splitDirection === 'horizontal'
                ? 'flex flex-row'
                : 'flex flex-col'
            )}
          >
            {selectedTabIds.slice(0, 2).map((tabId, index) => {
              const tab = tabs.find((t) => t.id === tabId);
              if (!tab) return null;

              return (
                <div
                  key={tabId}
                  className={cn(
                    'flex-1 min-w-0 min-h-0',
                    index === 0 && splitDirection === 'horizontal' && 'border-r border-border',
                    index === 0 && splitDirection === 'vertical' && 'border-b border-border'
                  )}
                >
                  <TerminalPanel
                    cwd={tab.cwd}
                    initialSyncCompleted={initialSyncCompleted}
                    permissionState={permissionState}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
