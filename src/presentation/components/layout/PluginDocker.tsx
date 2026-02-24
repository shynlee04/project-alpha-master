/**
 * @fileoverview PluginDocker - Plugin source panel for activity bars
 * @module presentation/components/layout/PluginDocker
 *
 * EPIC-UXUI-04: Plugin Docker Component
 * Shows all available plugins (filtered by device type).
 * Plugins already in activity bars are hidden.
 * Acts as drag source for activity bars.
 *
 * @story UXUI-04-04
 * @created 2026-01-30
 */

import React, { useCallback, useState } from 'react';
import { ChevronLeft, ChevronRight, Puzzle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePluginDocker } from '@/presentation/hooks/usePluginDocker';
import { PluginDockerItem } from './PluginDockerItem';
import type { DockerPluginDefinition } from './docker-types';
import {
  DOCKER_EXPANDED_WIDTH,
  DOCKER_COLLAPSED_WIDTH,
} from './docker-types';
import './PluginDocker.css';

// ============================================================================
// Props Interface
// ============================================================================

export interface PluginDockerProps {
  /** Additional CSS class names */
  className?: string;

  /** Callback when expand/collapse state changes */
  onExpandedChange?: (isExpanded: boolean) => void;

  /** Callback when a plugin drag starts */
  onPluginDragStart?: (plugin: DockerPluginDefinition) => void;

  /** Callback when a plugin drag ends */
  onPluginDragEnd?: () => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * PluginDocker Component
 *
 * A collapsible panel that displays all available plugins.
 * - Shows plugins filtered by device type (PC vs non-PC)
 * - Hides plugins already assigned to activity bars
 * - Acts as drag source for activity bars (drag-drop in Story 6)
 * - 8-bit styled with pixel shadows and sharp corners
 *
 * @param props - Component props
 * @returns React component
 */
export const PluginDocker: React.FC<PluginDockerProps> = ({
  className,
  onExpandedChange,
  onPluginDragStart,
  onPluginDragEnd,
}) => {
  // ============================================================================
  // State & Hooks
  // ============================================================================

  const {
    state,
    toggleExpanded,
    getFilteredPlugins,
  } = usePluginDocker();

  const [isDragging, setIsDragging] = useState(false);
  const [draggedPlugin, setDraggedPlugin] = useState<DockerPluginDefinition | null>(null);

  const { isExpanded } = state;
  const availablePlugins = getFilteredPlugins();

  // ============================================================================
  // Callbacks
  // ============================================================================

  /**
   * Handle toggle button click
   */
  const handleToggle = useCallback(() => {
    toggleExpanded();
    onExpandedChange?.(!isExpanded);
  }, [toggleExpanded, onExpandedChange, isExpanded]);

  /**
   * Handle plugin drag start
   */
  const handleDragStart = useCallback((plugin: DockerPluginDefinition) => {
    setIsDragging(true);
    setDraggedPlugin(plugin);
    onPluginDragStart?.(plugin);
  }, [onPluginDragStart]);

  /**
   * Handle plugin drag end
   */
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedPlugin(null);
    onPluginDragEnd?.();
  }, [onPluginDragEnd]);

  /**
   * Handle plugin click (for accessibility and touch devices)
   */
  const handlePluginClick = useCallback((plugin: DockerPluginDefinition) => {
    // For now, just log - actual assignment will be in Story 6
    // eslint-disable-next-line no-console
    console.log('Plugin clicked:', plugin.id);
  }, []);

  // ============================================================================
  // Render Helpers
  // ============================================================================

  /**
   * Get current width based on expanded state
   */
  const currentWidth = isExpanded ? DOCKER_EXPANDED_WIDTH : DOCKER_COLLAPSED_WIDTH;

  /**
   * Get toggle button icon
   */
  const ToggleIcon = isExpanded ? ChevronLeft : ChevronRight;

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div
      className={cn(
        'plugin-docker',
        isExpanded && 'plugin-docker--expanded',
        !isExpanded && 'plugin-docker--collapsed',
        isDragging && 'plugin-docker--dragging',
        className
      )}
      style={{ width: currentWidth }}
      role="complementary"
      aria-label="Plugin Docker"
      aria-expanded={isExpanded}
    >
      {/* Header */}
      <div className="plugin-docker__header">
        {isExpanded && (
          <>
            <div className="plugin-docker__title">
              <Puzzle size={20} aria-hidden="true" />
              <span>Plugins</span>
            </div>
            <span className="plugin-docker__count">
              {availablePlugins.length}
            </span>
          </>
        )}

        {/* Toggle Button */}
        <button
          type="button"
          className="plugin-docker__toggle"
          onClick={handleToggle}
          aria-label={isExpanded ? 'Collapse plugin docker' : 'Expand plugin docker'}
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          <ToggleIcon size={20} aria-hidden="true" />
        </button>
      </div>

      {/* Plugin List */}
      {isExpanded && (
        <div className="plugin-docker__content">
          {availablePlugins.length === 0 ? (
            <div className="plugin-docker__empty">
              <Puzzle size={32} aria-hidden="true" />
              <p>No available plugins</p>
              <span>All plugins are in use</span>
            </div>
          ) : (
            <div className="plugin-docker__list" role="list">
              {availablePlugins.map((plugin, index) => (
                <PluginDockerItem
                  key={plugin.id}
                  plugin={plugin}
                  isDragging={draggedPlugin?.id === plugin.id}
                  onClick={handlePluginClick}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  animationDelay={index * 50}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Collapsed State - Icon Only */}
      {!isExpanded && (
        <div className="plugin-docker__collapsed">
          <button
            type="button"
            className="plugin-docker__collapsed-button"
            onClick={handleToggle}
            aria-label="Expand plugin docker"
            title="Plugins"
          >
            <Puzzle size={24} aria-hidden="true" />
            {availablePlugins.length > 0 && (
              <span className="plugin-docker__collapsed-badge">
                {availablePlugins.length}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default PluginDocker;
