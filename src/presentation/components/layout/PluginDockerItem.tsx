/**
 * @fileoverview PluginDockerItem - Individual plugin item for the docker
 * @module presentation/components/layout/PluginDockerItem
 *
 * EPIC-UXUI-04: Plugin Docker Component
 * Displays a single plugin in the docker with drag-drop support preparation
 *
 * @story UXUI-04-04
 * @created 2026-01-30
 */

import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { DockerPluginDefinition } from './docker-types';
import { DOCKER_ICON_SIZE } from './docker-types';
import './PluginDockerItem.css';

// ============================================================================
// Props Interface
// ============================================================================

export interface PluginDockerItemProps {
  /** Plugin definition to display */
  plugin: DockerPluginDefinition;

  /** Whether the item is being dragged */
  isDragging?: boolean;

  /** Whether the item is disabled */
  isDisabled?: boolean;

  /** Callback when item is clicked */
  onClick?: (plugin: DockerPluginDefinition) => void;

  /** Callback when drag starts */
  onDragStart?: (plugin: DockerPluginDefinition) => void;

  /** Callback when drag ends */
  onDragEnd?: () => void;

  /** Additional CSS class names */
  className?: string;

  /** Animation delay for staggered entrance */
  animationDelay?: number;
}

// ============================================================================
// Component
// ============================================================================

/**
 * PluginDockerItem Component
 *
 * Displays a single plugin in the docker. Shows plugin icon and name.
 * Prepares for drag-drop functionality (Story 6).
 *
 * @param props - Component props
 * @returns React component
 */
export const PluginDockerItem: React.FC<PluginDockerItemProps> = ({
  plugin,
  isDragging = false,
  isDisabled = false,
  onClick,
  onDragStart,
  onDragEnd,
  className,
  animationDelay = 0,
}) => {
  const Icon = plugin.icon;

  /**
   * Handle click event
   */
  const handleClick = useCallback(() => {
    if (!isDisabled && onClick) {
      onClick(plugin);
    }
  }, [isDisabled, onClick, plugin]);

  /**
   * Handle drag start (preparation for Story 6)
   */
  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (isDisabled) {
        e.preventDefault();
        return;
      }

      // Set drag data
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('application/json', JSON.stringify({
        type: 'plugin',
        pluginId: plugin.id,
        pluginName: plugin.name,
      }));

      // Notify parent
      onDragStart?.(plugin);
    },
    [isDisabled, onDragStart, plugin]
  );

  /**
   * Handle drag end
   */
  const handleDragEnd = useCallback(() => {
    onDragEnd?.();
  }, [onDragEnd]);

  /**
   * Build tooltip content
   */
  const tooltipContent = React.useMemo(() => {
    const parts = [plugin.name];
    if (plugin.description) {
      parts.push(plugin.description);
    }
    if (plugin.shortcut) {
      parts.push(`(${plugin.shortcut})`);
    }
    return parts.join(' - ');
  }, [plugin]);

  return (
    <div
      className={cn(
        'plugin-docker-item',
        isDragging && 'plugin-docker-item--dragging',
        isDisabled && 'plugin-docker-item--disabled',
        className
      )}
      onClick={handleClick}
      draggable={!isDisabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      aria-label={tooltipContent}
      aria-disabled={isDisabled}
      title={tooltipContent}
      style={{
        animationDelay: `${animationDelay}ms`,
      }}
    >
      {/* Icon Container */}
      <div className="plugin-docker-item__icon-wrapper">
        <Icon
          size={DOCKER_ICON_SIZE}
          className="plugin-docker-item__icon"
          aria-hidden="true"
        />
      </div>

      {/* Plugin Name */}
      <span className="plugin-docker-item__name">
        {plugin.name}
      </span>

      {/* Drag Handle Indicator (visible on hover) */}
      <div className="plugin-docker-item__drag-handle" aria-hidden="true">
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="3" cy="3" r="1" fill="currentColor" />
          <circle cx="9" cy="3" r="1" fill="currentColor" />
          <circle cx="3" cy="9" r="1" fill="currentColor" />
          <circle cx="9" cy="9" r="1" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
};

export default PluginDockerItem;
