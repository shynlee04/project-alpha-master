/**
 * @fileoverview PluginSidebar - Tabbed sidebar for FileTree and Chat plugins
 * @module presentation/components/sidebar/PluginSidebar
 *
 * **EPIC-0.5-05**: FileTree as Sidebar Tab
 *
 * Sidebar component with vertical icon tabs on left side.
 * Renders FileTree or Chat plugin content based on active tab.
 * 8-bit design: sharp corners, solid colors, pixel shadows.
 *
 * Layout:
 * ┌────────┬─────────────────┐
 * │[📁]   │                  │
 * │[💬]   │  Plugin Content  │
 * │       │                  │
 * └────────┴─────────────────┘
 *
 * @epic EPIC-0.5
 * @story EPIC-0.5-05
 * @team Team A
 * @created 2026-01-27
 */

import React, { useState, useCallback } from 'react';
import { FolderTree, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Plugins
import { fileTreePlugin } from '@/plugins/filetree';
import { chatPlugin } from '@/plugins/chat';

// ============================================================================
// Types
// ============================================================================

/**
 * Available sidebar tabs
 */
type SidebarTab = 'filetree' | 'chat';

/**
 * Tab configuration
 */
interface TabConfig {
  id: SidebarTab;
  icon: React.ReactNode;
  label: string;
  labelKey: string;
}

/**
 * PluginSidebar Props
 */
export interface PluginSidebarProps {
  /** Width of the content area (excluding icon bar) */
  width?: number;
  /** Minimum width when content is visible */
  minWidth?: number;
  /** Maximum width for resize */
  maxWidth?: number;
  /** Callback when width changes (for persist) */
  onWidthChange?: (width: number) => void;
}

// ============================================================================
// Constants
// ============================================================================

const ICON_BAR_WIDTH = 48;
const DEFAULT_CONTENT_WIDTH = 256;
const MIN_CONTENT_WIDTH = 200;
const MAX_CONTENT_WIDTH = 400;

/**
 * Tab configurations
 */
const TABS: TabConfig[] = [
  {
    id: 'filetree',
    icon: <FolderTree size={20} />,
    label: 'File Explorer',
    labelKey: 'ide.fileExplorer',
  },
  {
    id: 'chat',
    icon: <MessageSquare size={20} />,
    label: 'Chat',
    labelKey: 'ide.chat',
  },
];

// ============================================================================
// Component
// ============================================================================

/**
 * PluginSidebar Component
 *
 * Tabbed sidebar with FileTree and Chat plugins.
 * - Vertical icon bar on left (always visible)
 * - Content panel on right (collapsible)
 * - 8-bit design compliance
 *
 * @param props - PluginSidebarProps
 * @returns PluginSidebar JSX element
 */
export function PluginSidebar({
  width = DEFAULT_CONTENT_WIDTH,
  minWidth = MIN_CONTENT_WIDTH,
  maxWidth = MAX_CONTENT_WIDTH,
  onWidthChange,
}: PluginSidebarProps) {
  const { t } = useTranslation();

  // ========================================================================
  // State
  // ========================================================================

  const [activeTab, setActiveTab] = useState<SidebarTab>('filetree');
  const [collapsed, setCollapsed] = useState(false);
  const [contentWidth, setContentWidth] = useState(width);
  const [isDragging, setIsDragging] = useState(false);

  // ========================================================================
  // Handlers
  // ========================================================================

  /**
   * Handle tab click
   * - If clicking active tab, toggle collapse
   * - If clicking different tab, switch and expand if collapsed
   */
  const handleTabClick = useCallback((tabId: SidebarTab) => {
    if (tabId === activeTab) {
      // Toggle collapse on same tab click
      setCollapsed((prev) => !prev);
    } else {
      // Switch tab and ensure expanded
      setActiveTab(tabId);
      if (collapsed) {
        setCollapsed(false);
      }
    }
  }, [activeTab, collapsed]);

  /**
   * Handle collapse toggle button
   */
  const handleCollapseToggle = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  /**
   * Handle resize drag start
   */
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const startX = e.clientX;
    const startWidth = contentWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(
        minWidth,
        Math.min(maxWidth, startWidth + deltaX)
      );
      setContentWidth(newWidth);
      onWidthChange?.(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [contentWidth, minWidth, maxWidth, onWidthChange]);

  // ========================================================================
  // Computed values
  // ========================================================================

  const totalWidth = collapsed ? ICON_BAR_WIDTH : ICON_BAR_WIDTH + contentWidth;

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <div
      className="plugin-sidebar flex h-full border-r-2 border-border bg-background"
      style={{ width: totalWidth }}
    >
      {/* ================================================================
          Icon Bar (Always Visible)
         ================================================================ */}
      <div className="flex flex-col w-12 border-r border-border/50 bg-muted/20 shrink-0">
        {/* Tab Icons */}
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={`
                flex items-center justify-center w-12 h-12
                transition-colors duration-100
                ${isActive ? 'bg-accent text-accent-foreground border-l-2 border-primary' : 'hover:bg-muted/50 text-muted-foreground'}
              `}
              title={t(tab.labelKey, tab.label)}
              aria-label={t(tab.labelKey, tab.label)}
              aria-selected={isActive}
              role="tab"
            >
              {tab.icon}
            </button>
          );
        })}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Collapse Toggle */}
        <button
          type="button"
          onClick={handleCollapseToggle}
          className="flex items-center justify-center w-12 h-10 hover:bg-muted/50 text-muted-foreground transition-colors"
          title={collapsed ? t('ide.expandSidebar', 'Expand sidebar') : t('ide.collapseSidebar', 'Collapse sidebar')}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* ================================================================
          Content Area (Collapsible)
         ================================================================ */}
      {!collapsed && (
        <div
          className="flex-1 overflow-hidden relative"
          style={{ width: contentWidth }}
        >
          {/* FileTree Tab Content */}
          {activeTab === 'filetree' && (
            <fileTreePlugin.MainComponent
              width={contentWidth}
              height={window.innerHeight}
            />
          )}

          {/* Chat Tab Content */}
          {activeTab === 'chat' && (
            <chatPlugin.MainComponent
              width={contentWidth}
              height={window.innerHeight}
            />
          )}

          {/* ============================================================
              Resize Handle
             ============================================================ */}
          <div
            className={`
              absolute top-0 right-0 w-1 h-full cursor-col-resize
              transition-colors hover:bg-primary
              ${isDragging ? 'bg-primary' : 'bg-transparent'}
            `}
            onMouseDown={handleResizeStart}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize sidebar"
          />
        </div>
      )}

      {/* Width indicator during drag */}
      {isDragging && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-gray-800 text-white text-xs font-mono z-50">
          {Math.round(contentWidth)}px
        </div>
      )}
    </div>
  );
}

// ============================================================================
// No additional exports
// ============================================================================
