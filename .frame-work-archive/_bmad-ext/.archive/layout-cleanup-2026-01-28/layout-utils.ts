/**
 * @fileoverview Layout Utility Functions
 * @module presentation/layouts/layout-utils
 * @created 2026-01-26
 * @epic EPIC-CC-AR02AR03
 * @story CC-AR-16
 * 
 * Utility functions for calculating auto-layout configurations
 * based on active plugin count and container dimensions.
 * 
 * Auto-Layout Logic:
 * - 2 plugins → 30/70 horizontal split
 * - 3 plugins → 25/50/25 horizontal split
 * - 4 plugins → 2x2 grid (50/50 x 50/50)
 * - 5 plugins → 3 top (33/33/33) + 2 bottom (50/50)
 */

import type { PluginId } from '@/domain/types/plugin-types';
import type { LayoutMode } from './PluginLayoutStore';

// ============================================================================
// Types
// ============================================================================

export interface LayoutSlot {
    pluginId: PluginId;
    row: number;
    col: number;
    rowSpan: number;
    colSpan: number;
    width: string;  // CSS percentage or px
    height: string; // CSS percentage or px
}

export interface LayoutGrid {
    rows: number;
    cols: number;
    slots: LayoutSlot[];
    gap: number; // Gap in pixels
}

export interface AutoLayoutConfig {
    mode: LayoutMode;
    grid: LayoutGrid;
    defaultSizes: Record<string, number>; // pluginId → percentage
}

// ============================================================================
// Auto-Layout Calculation
// ============================================================================

/**
 * Calculate the optimal layout mode based on plugin count.
 * 
 * @param pluginCount - Number of active plugins
 * @returns Recommended layout mode
 */
export function getAutoLayoutMode(pluginCount: number): LayoutMode {
    switch (pluginCount) {
        case 0:
        case 1:
            return '1-column';
        case 2:
            return '2-column';
        case 3:
            return '3-column';
        case 4:
        case 5:
        default:
            return '2+1';
    }
}

/**
 * Calculate auto-layout configuration for given plugins.
 * 
 * @param plugins - Array of active plugin IDs
 * @param containerWidth - Container width in pixels (optional)
 * @param containerHeight - Container height in pixels (optional)
 * @returns Auto-layout configuration
 */
export function calculateAutoLayout(
    plugins: PluginId[],
    containerWidth?: number,
    containerHeight?: number
): AutoLayoutConfig {
    const count = plugins.length;
    const mode = getAutoLayoutMode(count);

    let grid: LayoutGrid;
    let defaultSizes: Record<string, number> = {};

    switch (count) {
        case 0:
        case 1:
            // 1-column: Single plugin full width
            grid = {
                rows: 1,
                cols: 1,
                slots: plugins.map((id, i) => ({
                    pluginId: id,
                    row: 0,
                    col: 0,
                    rowSpan: 1,
                    colSpan: 1,
                    width: '100%',
                    height: '100%',
                })),
                gap: 0,
            };
            plugins.forEach(id => defaultSizes[id] = 100);
            break;

        case 2:
            // 2-column: 30/70 split (FileTree typically narrower)
            grid = {
                rows: 1,
                cols: 2,
                slots: [
                    {
                        pluginId: plugins[0],
                        row: 0,
                        col: 0,
                        rowSpan: 1,
                        colSpan: 1,
                        width: '30%',
                        height: '100%',
                    },
                    {
                        pluginId: plugins[1],
                        row: 0,
                        col: 1,
                        rowSpan: 1,
                        colSpan: 1,
                        width: '70%',
                        height: '100%',
                    },
                ],
                gap: 2,
            };
            defaultSizes[plugins[0]] = 30;
            defaultSizes[plugins[1]] = 70;
            break;

        case 3:
            // 3-column: 25/50/25 split
            grid = {
                rows: 1,
                cols: 3,
                slots: [
                    {
                        pluginId: plugins[0],
                        row: 0,
                        col: 0,
                        rowSpan: 1,
                        colSpan: 1,
                        width: '25%',
                        height: '100%',
                    },
                    {
                        pluginId: plugins[1],
                        row: 0,
                        col: 1,
                        rowSpan: 1,
                        colSpan: 1,
                        width: '50%',
                        height: '100%',
                    },
                    {
                        pluginId: plugins[2],
                        row: 0,
                        col: 2,
                        rowSpan: 1,
                        colSpan: 1,
                        width: '25%',
                        height: '100%',
                    },
                ],
                gap: 2,
            };
            defaultSizes[plugins[0]] = 25;
            defaultSizes[plugins[1]] = 50;
            defaultSizes[plugins[2]] = 25;
            break;

        case 4:
            // 2x2 grid: 50/50 x 50/50
            grid = {
                rows: 2,
                cols: 2,
                slots: [
                    {
                        pluginId: plugins[0],
                        row: 0,
                        col: 0,
                        rowSpan: 1,
                        colSpan: 1,
                        width: '50%',
                        height: '50%',
                    },
                    {
                        pluginId: plugins[1],
                        row: 0,
                        col: 1,
                        rowSpan: 1,
                        colSpan: 1,
                        width: '50%',
                        height: '50%',
                    },
                    {
                        pluginId: plugins[2],
                        row: 1,
                        col: 0,
                        rowSpan: 1,
                        colSpan: 1,
                        width: '50%',
                        height: '50%',
                    },
                    {
                        pluginId: plugins[3],
                        row: 1,
                        col: 1,
                        rowSpan: 1,
                        colSpan: 1,
                        width: '50%',
                        height: '50%',
                    },
                ],
                gap: 2,
            };
            plugins.forEach(id => defaultSizes[id] = 50);
            break;

        case 5:
        default:
            // 3+2 layout: 3 top (33/33/33) + 2 bottom (50/50)
            grid = {
                rows: 2,
                cols: 3,
                slots: [
                    // Top row: 3 plugins
                    {
                        pluginId: plugins[0],
                        row: 0,
                        col: 0,
                        rowSpan: 1,
                        colSpan: 1,
                        width: '33.33%',
                        height: '50%',
                    },
                    {
                        pluginId: plugins[1],
                        row: 0,
                        col: 1,
                        rowSpan: 1,
                        colSpan: 1,
                        width: '33.33%',
                        height: '50%',
                    },
                    {
                        pluginId: plugins[2],
                        row: 0,
                        col: 2,
                        rowSpan: 1,
                        colSpan: 1,
                        width: '33.33%',
                        height: '50%',
                    },
                    // Bottom row: 2 plugins spanning 1.5 cols each
                    {
                        pluginId: plugins[3],
                        row: 1,
                        col: 0,
                        rowSpan: 1,
                        colSpan: 1.5,
                        width: '50%',
                        height: '50%',
                    },
                    {
                        pluginId: plugins[4],
                        row: 1,
                        col: 1.5,
                        rowSpan: 1,
                        colSpan: 1.5,
                        width: '50%',
                        height: '50%',
                    },
                ],
                gap: 2,
            };
            plugins.slice(0, 3).forEach(id => defaultSizes[id] = 33);
            plugins.slice(3, 5).forEach(id => defaultSizes[id] = 50);
            break;
    }

    return { mode, grid, defaultSizes };
}

// ============================================================================
// Size Constraints
// ============================================================================

/** Minimum panel width in pixels */
export const MIN_PANEL_WIDTH = 200;

/** Minimum panel height in pixels */
export const MIN_PANEL_HEIGHT = 150;

/** Maximum panel width as percentage of container */
export const MAX_PANEL_WIDTH_PERCENT = 80;

/** Minimum panel width as percentage of container */
export const MIN_PANEL_WIDTH_PERCENT = 15;

/**
 * Constrain a resize value within bounds.
 * 
 * @param newSize - New size to constrain
 * @param minSize - Minimum allowed size
 * @param maxSize - Maximum allowed size
 * @returns Constrained size
 */
export function constrainResize(
    newSize: number,
    minSize: number,
    maxSize: number
): number {
    return Math.max(minSize, Math.min(maxSize, newSize));
}

/**
 * Distribute remaining space when one panel resizes.
 * 
 * @param sizes - Current sizes object (pluginId → percentage)
 * @param changedPluginId - Plugin that was resized
 * @param newSize - New size for changed plugin
 * @param totalSize - Total size (usually 100%)
 * @returns Updated sizes object
 */
export function distributeSizes(
    sizes: Record<string, number>,
    changedPluginId: string,
    newSize: number,
    totalSize: number = 100
): Record<string, number> {
    const pluginIds = Object.keys(sizes);
    const otherPlugins = pluginIds.filter(id => id !== changedPluginId);

    if (otherPlugins.length === 0) {
        return { [changedPluginId]: totalSize };
    }

    // Constrain new size
    const constrainedNewSize = constrainResize(
        newSize,
        MIN_PANEL_WIDTH_PERCENT,
        MAX_PANEL_WIDTH_PERCENT
    );

    // Calculate remaining space for other plugins
    const remainingSpace = totalSize - constrainedNewSize;
    const currentOtherTotal = otherPlugins.reduce((sum, id) => sum + sizes[id], 0);

    // Distribute remaining space proportionally
    const newSizes: Record<string, number> = {
        [changedPluginId]: constrainedNewSize,
    };

    otherPlugins.forEach(id => {
        const proportion = currentOtherTotal > 0
            ? sizes[id] / currentOtherTotal
            : 1 / otherPlugins.length;
        newSizes[id] = constrainResize(
            remainingSpace * proportion,
            MIN_PANEL_WIDTH_PERCENT,
            MAX_PANEL_WIDTH_PERCENT
        );
    });

    return newSizes;
}

// ============================================================================
// Layout Mode Helpers
// ============================================================================

/**
 * Get the number of columns for a layout mode.
 */
export function getLayoutColumns(mode: LayoutMode): number {
    switch (mode) {
        case '1-column':
            return 1;
        case '2-column':
            return 2;
        case '3-column':
            return 3;
        case '2+1':
            return 3; // 3 cols with 2 on bottom spanning
        default:
            return 2;
    }
}

/**
 * Check if layout mode supports the given plugin count.
 */
export function isLayoutCompatible(mode: LayoutMode, pluginCount: number): boolean {
    switch (mode) {
        case '1-column':
            return pluginCount <= 1;
        case '2-column':
            return pluginCount <= 2;
        case '3-column':
            return pluginCount <= 3;
        case '2+1':
            return pluginCount <= 5;
        default:
            return false;
    }
}
