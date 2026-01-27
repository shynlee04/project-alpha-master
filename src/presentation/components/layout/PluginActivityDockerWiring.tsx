/**
 * @fileoverview PluginActivityDockerWiring - ActivityBar + PluginDocker Integration
 * @module presentation/components/layout/PluginActivityDockerWiring
 *
 * **UXUI-02-05**: Wire ActivityBar + Docker
 *
 * This component demonstrates how to wire ActivityBar and PluginDocker together
 * with synchronized state using the usePluginPlacement hook.
 *
 * Key behaviors:
 * - ActivityBar click toggles plugin visibility in Docker
 * - ActivityBar shows "active" state when plugin is open
 * - Docker shows plugin content when active
 * - Single instance constraint enforced (from UXUI-02-04b)
 *
 * Layout integration:
 * ┌────────┬────────┬──────────┬────────────────┬──────────┬────────┐
 * │Global  │Activity│Plugin    │Main Content    │Plugin    │Activity│
 * │Sidebar │Bar LEFT│LEFT      │(Notes/Monaco)  │RIGHT     │Bar     │
 * │ 48px   │ 48px   │200-320px │   400px+       │250-400px │ 48px   │
 * └────────┴────────┴──────────┴────────────────┴──────────┴────────┘
 *
 * @epic EPIC-UXUI-02
 * @story UXUI-02-05
 * @team Team A
 * @created 2026-01-28
 */

import { useCallback, type ReactNode } from 'react';
import { ActivityBar, type ActivityBarItem } from './ActivityBar';
import { PluginDocker } from './PluginDocker';
import type { PluginId } from '@/domain/types/plugin-types';
import type { PanelPosition } from '@/presentation/hooks/usePluginPlacement';

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Plugin Renderer Props
 *
 * @remarks
 * Props passed to the plugin renderer function.
 * Used to render plugin content based on the active plugin ID.
 */
export interface PluginRendererProps {
  /** Active plugin ID to render */
  pluginId: PluginId;
  /** Panel position (left or right) */
  position: 'left' | 'right';
}

/**
 * PluginActivityDockerWiring Props
 *
 * @remarks
 * Props for the wiring component that integrates ActivityBar and PluginDocker.
 * Designed to be reusable for both left and right sides of the workspace.
 */
export interface PluginActivityDockerWiringProps {
  /** Position of the wiring (left or right) */
  position: 'left' | 'right';

  /** Activity bar items to display */
  items: ActivityBarItem[];

  /** Minimum width for the Docker panel */
  minWidth?: number;

  /** Maximum width for the Docker panel */
  maxWidth?: number;

  /** Default width for the Docker panel */
  defaultWidth?: number;

  // -- Placement Hook Functions --
  // These come from usePluginPlacement hook (lifted to parent)

  /** Get the current panel for a plugin */
  getPluginPanel: (pluginId: PluginId) => PanelPosition;

  /** Move a plugin to a target panel */
  movePluginToPanel: (pluginId: PluginId, targetPanel: 'left' | 'right') => boolean;

  /** Close a plugin (remove from any panel) */
  closePlugin: (pluginId: PluginId) => void;

  /** Get all plugins in a specific panel */
  getPluginsInPanel: (panel: 'left' | 'right') => PluginId[];

  /** Optional plugin renderer function */
  renderPlugin?: (props: PluginRendererProps) => ReactNode;

  /** Additional class name for the ActivityBar */
  activityBarClassName?: string;

  /** Additional class name for the PluginDocker */
  dockerClassName?: string;
}

/**
 * Wiring Result - Output from the wiring component
 *
 * @remarks
 * Returns both the ActivityBar and PluginDocker elements
 * for placement in WorkspaceLayout slots.
 */
export interface WiringResult {
  /** ActivityBar element to render */
  activityBar: ReactNode;
  /** PluginDocker element to render */
  docker: ReactNode;
}

// ============================================================================
// PluginActivityDockerWiring Component
// ============================================================================

/**
 * PluginActivityDockerWiring Component
 *
 * Wires ActivityBar and PluginDocker together with synchronized state.
 *
 * @param props - PluginActivityDockerWiringProps
 * @returns WiringResult with activityBar and docker elements
 *
 * @remarks
 * Usage pattern:
 * 1. Parent component (e.g., $projectId route) creates usePluginPlacement hook
 * 2. Parent passes hook functions to this component
 * 3. This component returns ActivityBar and Docker elements
 * 4. Parent places elements in WorkspaceLayout slots
 *
 * @example
 * ```tsx
 * const { getPluginPanel, movePluginToPanel, closePlugin, getPluginsInPanel } = usePluginPlacement();
 *
 * const leftWiring = usePluginActivityDockerWiring({
 *   position: 'left',
 *   items: leftItems,
 *   getPluginPanel,
 *   movePluginToPanel,
 *   closePlugin,
 *   getPluginsInPanel,
 * });
 *
 * return (
 *   <WorkspaceLayout
 *     activityBarLeft={leftWiring.activityBar}
 *     pluginLeft={leftWiring.docker}
 *   />
 * );
 * ```
 */
export function usePluginActivityDockerWiring({
  position,
  items,
  minWidth,
  maxWidth,
  defaultWidth,
  getPluginPanel,
  movePluginToPanel,
  closePlugin,
  getPluginsInPanel,
  renderPlugin,
  activityBarClassName = '',
  dockerClassName = '',
}: PluginActivityDockerWiringProps): WiringResult {
  // ========================================================================
  // Derived State
  // ========================================================================

  // Get the active plugin for this side
  const pluginsInPanel = getPluginsInPanel(position);
  // Only ONE plugin can be active per side (single instance rule)
  const activePluginId = pluginsInPanel[0] ?? null;

  // Find the active item's label for Docker title
  const activeItem = items.find(item => item.id === activePluginId);
  const dockerTitle = activeItem?.label;

  // Docker is open if there's an active plugin
  const isDockerOpen = activePluginId !== null;

  // ========================================================================
  // Event Handlers
  // ========================================================================

  /**
   * Handle ActivityBar item click
   *
   * @remarks
   * Click behavior:
   * - If Docker is closed and plugin clicked → Open Docker with that plugin
   * - If Docker is open with same plugin → Close Docker
   * - If Docker is open with different plugin → Switch to clicked plugin
   */
  const handleItemClick = useCallback((id: string) => {
    const pluginId = id as PluginId;
    const currentPanel = getPluginPanel(pluginId);

    if (currentPanel === position) {
      // Same panel, same plugin → close it (toggle off)
      closePlugin(pluginId);
      console.log(`[PluginActivityDockerWiring] Closed ${pluginId} from ${position}`);
    } else {
      // Different panel or not placed → open here
      // This also handles the case of switching plugins
      movePluginToPanel(pluginId, position);
      console.log(`[PluginActivityDockerWiring] Opened ${pluginId} in ${position}`);
    }
  }, [position, getPluginPanel, movePluginToPanel, closePlugin]);

  /**
   * Handle Docker close button click
   *
   * @remarks
   * Closes the currently active plugin in the Docker.
   */
  const handleDockerClose = useCallback(() => {
    if (activePluginId) {
      closePlugin(activePluginId);
      console.log(`[PluginActivityDockerWiring] Docker closed, removed ${activePluginId}`);
    }
  }, [activePluginId, closePlugin]);

  /**
   * Handle plugin drop from drag-and-drop
   *
   * @remarks
   * Receives a plugin ID dropped from another panel.
   * Uses movePluginToPanel which enforces single instance rule.
   */
  const handlePluginDrop = useCallback((pluginId: string) => {
    movePluginToPanel(pluginId as PluginId, position);
    console.log(`[PluginActivityDockerWiring] Plugin ${pluginId} dropped into ${position}`);
  }, [position, movePluginToPanel]);

  // ========================================================================
  // Default Width Configuration
  // ========================================================================

  const calculatedMinWidth = minWidth ?? (position === 'left' ? 200 : 250);
  const calculatedMaxWidth = maxWidth ?? (position === 'left' ? 320 : 400);
  const calculatedDefaultWidth = defaultWidth ?? (position === 'left' ? 240 : 300);

  // ========================================================================
  // Render Plugin Content
  // ========================================================================

  const renderPluginContent = () => {
    if (!activePluginId) return null;

    // Use custom renderer if provided
    if (renderPlugin) {
      return renderPlugin({ pluginId: activePluginId, position });
    }

    // Default placeholder content
    return (
      <div className="p-4 font-mono text-sm text-muted-foreground">
        <div className="mb-2 font-semibold text-foreground">
          Plugin: {activePluginId}
        </div>
        <div className="text-xs opacity-75">
          Panel: {position}
        </div>
      </div>
    );
  };

  // ========================================================================
  // Return Wiring Result
  // ========================================================================

  return {
    activityBar: (
      <ActivityBar
        position={position}
        items={items}
        activeItem={activePluginId ?? undefined}
        onItemClick={handleItemClick}
        draggable={true}
        className={activityBarClassName}
      />
    ),
    docker: (
      <PluginDocker
        position={position}
        minWidth={calculatedMinWidth}
        maxWidth={calculatedMaxWidth}
        defaultWidth={calculatedDefaultWidth}
        isOpen={isDockerOpen}
        title={dockerTitle}
        onClose={handleDockerClose}
        onPluginDrop={handlePluginDrop}
        className={dockerClassName}
      >
        {renderPluginContent()}
      </PluginDocker>
    ),
  };
}

// ============================================================================
// Standalone Component Variant
// ============================================================================

/**
 * PluginActivityDockerWiring Standalone Component
 *
 * A wrapper component that uses the hook internally.
 * Useful when you want to render both ActivityBar and Docker in a single element.
 *
 * @remarks
 * This is primarily for demonstration/testing purposes.
 * In production, prefer using the hook directly for more flexibility
 * in placing ActivityBar and Docker in separate WorkspaceLayout slots.
 */
export function PluginActivityDockerWiringStandalone(
  props: PluginActivityDockerWiringProps
) {
  const { activityBar, docker } = usePluginActivityDockerWiring(props);

  return (
    <>
      {activityBar}
      {docker}
    </>
  );
}

// ============================================================================
// Default Export
// ============================================================================

export default usePluginActivityDockerWiring;
