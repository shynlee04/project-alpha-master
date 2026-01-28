/**
 * @fileoverview MainContentRenderer - Main Content Plugin Switcher
 * @module presentation/components/layout/MainContentRenderer
 *
 * **MAIN CONTENT RENDERER COMPONENT**
 *
 * Renders the Activity Bar TOP + active plugin content in the main content area.
 * Replaces the hardcoded MonacoMain with a dynamic plugin switching system.
 *
 * Layout structure:
 * ┌──────────────────────────────────────────────────────────────┐
 * │  [ACTIVITY BAR TOP - 48px]                                  │
 * │  [Notes] [Monaco] [Preview]                                  │
 * ├──────────────────────────────────────────────────────────────┤
 * │                                                              │
 * │              ACTIVE PLUGIN CONTENT                           │
 * │              (Notes / Monaco / Preview)                      │
 * │                                                              │
 * └──────────────────────────────────────────────────────────────┘
 *
 * Features:
 * - ActivityBarTop for plugin tab switching
 * - Dynamic plugin rendering via registry
 * - Error boundary for plugin crashes
 * - Empty state fallback
 * - 8-bit design compliance
 *
 * @epic EPIC-UXUI-03
 * @story UXUI-03-04
 * @team Team A
 * @created 2026-01-28
 */

import type { ReactNode, ComponentType } from 'react';
import { useCallback, useMemo, useEffect, Component } from 'react';
import { StickyNote, Code, Eye } from 'lucide-react';

// Local components
import { ActivityBarTop } from './ActivityBarTop';
import type { ActivityBarTopItem } from './ActivityBarTop';

// Domain types
import type { PluginId } from '@/domain/types/plugin-types';

// Plugin registry
import { getPlugin } from '@/infrastructure/plugins/plugin-registry';

// CSS is imported globally from src/styles.css

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Plugin Main Component Props
 * Standard props passed to all plugin main components
 */
interface PluginMainProps {
  width: number;
  height: number;
}

/**
 * MainContentRenderer Props
 */
export interface MainContentRendererProps {
  /** Currently active plugin ID (null = empty state) */
  activePluginId: PluginId | null;
  /** Callback when user clicks a different plugin tab */
  onPluginChange: (pluginId: PluginId) => void;
  /** Optional callback when a plugin throws an error */
  onPluginError?: (pluginId: PluginId, error: Error) => void;
  /** Optional fallback UI when no plugin is active */
  fallback?: ReactNode;
  /** Optional additional CSS class names */
  className?: string;
}

/**
 * Error boundary state
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary props
 */
interface PluginErrorBoundaryProps {
  pluginId: PluginId;
  onError?: (pluginId: PluginId, error: Error) => void;
  children: ReactNode;
}

// ============================================================================
// Default Activity Bar Items (per UX Spec 08-activity-bar-docker.md)
// ============================================================================

/**
 * Top Activity Bar Items for Main Content Area
 *
 * @remarks
 * Per UX specification, the main content area supports:
 * - Notes: BlockNote markdown editor
 * - Monaco: Code editor (default)
 * - Preview: Live preview
 */
const MAIN_ACTIVITY_ITEMS: ActivityBarTopItem[] = [
  { pluginId: 'notes', icon: <StickyNote size={20} />, label: 'Notes', shortcut: 'Cmd+1' },
  { pluginId: 'monaco', icon: <Code size={20} />, label: 'Code', shortcut: 'Cmd+2' },
  { pluginId: 'preview', icon: <Eye size={20} />, label: 'Preview', shortcut: 'Cmd+3' },
];

// ============================================================================
// Plugin Error Boundary Component
// ============================================================================

/**
 * Error Boundary for Plugin Rendering
 *
 * Catches errors thrown by plugin components and displays fallback UI.
 * Reports errors via onError callback for logging/analytics.
 */
class PluginErrorBoundary extends Component<PluginErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: PluginErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    const { pluginId, onError } = this.props;
    console.error(`[MainContentRenderer] Plugin "${pluginId}" crashed:`, error);
    onError?.(pluginId, error);
  }

  render() {
    if (this.state.hasError) {
      const { pluginId } = this.props;
      return (
        <div className="main-content-renderer__error">
          <div className="main-content-renderer__error-icon">⚠️</div>
          <div className="main-content-renderer__error-title">
            Plugin Error
          </div>
          <div className="main-content-renderer__error-message">
            The <code>{pluginId}</code> plugin encountered an error.
          </div>
          <button
            type="button"
            className="main-content-renderer__error-retry"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// Plugin Content Renderer Helper
// ============================================================================

/**
 * Renders plugin content by ID using the plugin registry
 *
 * @param pluginId - Plugin to render
 * @returns React element for the plugin or null
 */
function renderPluginById(pluginId: PluginId): ReactNode {
  const plugin = getPlugin(pluginId);

  if (!plugin) {
    console.warn(`[MainContentRenderer] Plugin not found in registry: ${pluginId}`);
    return (
      <div className="main-content-renderer__not-found">
        <div className="main-content-renderer__not-found-icon">📦</div>
        <div className="main-content-renderer__not-found-message">
          Plugin <code>{pluginId}</code> is not available.
        </div>
      </div>
    );
  }

  // Get the MainComponent from the plugin
  const MainComponent = plugin.MainComponent as ComponentType<PluginMainProps>;

  // Render with standard dimensions (0,0 = fill available space)
  return <MainComponent width={0} height={0} />;
}

// ============================================================================
// Empty State Component
// ============================================================================

/**
 * Default empty state when no plugin is selected
 */
function DefaultEmptyState() {
  return (
    <div className="main-content-renderer__empty">
      <div className="main-content-renderer__empty-icon">📝</div>
      <div className="main-content-renderer__empty-title">
        No Plugin Selected
      </div>
      <div className="main-content-renderer__empty-message">
        Click a tab above to open a plugin.
      </div>
    </div>
  );
}

// ============================================================================
// MainContentRenderer Component
// ============================================================================

/**
 * MainContentRenderer Component
 *
 * Renders Activity Bar TOP + active plugin in the main content area.
 * Supports dynamic plugin switching between Notes, Monaco, and Preview.
 *
 * @param props - MainContentRendererProps
 * @returns Main content renderer JSX element
 *
 * @remarks
 * 8-Bit Design Features:
 * - Sharp corners (border-radius: 0)
 * - No transparency or blur effects
 * - Flat design with solid backgrounds
 *
 * Accessibility:
 * - ActivityBarTop handles keyboard navigation
 * - Error states are screen reader accessible
 * - Focus management on plugin switch
 */
export function MainContentRenderer({
  activePluginId,
  onPluginChange,
  onPluginError,
  fallback,
  className = '',
}: MainContentRendererProps) {
  // ========================================================================
  // Keyboard Shortcut Handler for Plugin Switching
  // ========================================================================

  useEffect(() => {
    const handleSwitchPlugin = (event: CustomEvent<{ index: number }>) => {
      const { index } = event.detail;
      const items = MAIN_ACTIVITY_ITEMS;
      if (index >= 0 && index < items.length) {
        onPluginChange(items[index].pluginId as PluginId);
      }
    };

    window.addEventListener('ide.switch-plugin', handleSwitchPlugin as EventListener);
    return () => {
      window.removeEventListener('ide.switch-plugin', handleSwitchPlugin as EventListener);
    };
  }, [onPluginChange]);

  // ========================================================================
  // Event Handlers
  // ========================================================================

  const handleItemClick = useCallback(
    (pluginId: string) => {
      // Type assertion safe: ActivityBarTopItem.pluginId matches PluginId
      onPluginChange(pluginId as PluginId);
    },
    [onPluginChange]
  );

  // ========================================================================
  // Memoized Plugin Content
  // ========================================================================

  const pluginContent = useMemo(() => {
    if (!activePluginId) {
      return fallback ?? <DefaultEmptyState />;
    }

    return (
      <PluginErrorBoundary
        pluginId={activePluginId}
        onError={onPluginError}
      >
        {renderPluginById(activePluginId)}
      </PluginErrorBoundary>
    );
  }, [activePluginId, fallback, onPluginError]);

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <div className={`main-content-renderer ${className}`}>
      {/* Activity Bar TOP - 48px horizontal bar */}
      <ActivityBarTop
        items={MAIN_ACTIVITY_ITEMS}
        activePluginId={activePluginId}
        onItemClick={handleItemClick}
        className="main-content-renderer__activity-bar"
      />

      {/* Plugin Content Area - fills remaining space */}
      <div className="main-content-renderer__content">
        {pluginContent}
      </div>
    </div>
  );
}

// ============================================================================
// Default Export
// ============================================================================

export default MainContentRenderer;
