/**
 * @fileoverview Tests for usePluginPlacement Hook
 * @module presentation/hooks/__tests__/usePluginPlacement.test
 *
 * **UXUI-02-04b**: Single Instance Constraint Tests
 *
 * Tests the ONE INSTANCE RULE:
 * - Plugin can only exist in ONE panel at a time
 * - Moving plugin from left to right works
 * - Moving plugin from right to left works
 * - Same panel drop is no-op
 *
 * @epic EPIC-UXUI-02
 * @story UXUI-02-04b
 * @team Team A
 * @created 2026-01-28
 */

// @vitest-environment jsdom

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  usePluginPlacement,
  getDefaultPlacements,
  type PluginPlacementEntry,
} from '../usePluginPlacement';

// ============================================================================
// Test Suite
// ============================================================================

describe('usePluginPlacement', () => {
  // ==========================================================================
  // Initialization Tests
  // ==========================================================================

  describe('initialization', () => {
    it('should initialize with empty placements by default', () => {
      const { result } = renderHook(() => usePluginPlacement());

      expect(result.current.placements.size).toBe(0);
      expect(result.current.getPluginsInPanel('left')).toEqual([]);
      expect(result.current.getPluginsInPanel('right')).toEqual([]);
    });

    it('should initialize with provided placements', () => {
      const initialPlacements: PluginPlacementEntry[] = [
        { pluginId: 'filetree', panel: 'left' },
        { pluginId: 'chat', panel: 'right' },
      ];

      const { result } = renderHook(() => usePluginPlacement(initialPlacements));

      expect(result.current.placements.size).toBe(2);
      expect(result.current.getPluginPanel('filetree')).toBe('left');
      expect(result.current.getPluginPanel('chat')).toBe('right');
    });

    it('should return null for unplaced plugins', () => {
      const { result } = renderHook(() => usePluginPlacement([]));

      expect(result.current.getPluginPanel('filetree')).toBe(null);
      expect(result.current.getPluginPanel('notes')).toBe(null);
    });
  });

  // ==========================================================================
  // Single Instance Rule Tests
  // ==========================================================================

  describe('single instance rule', () => {
    it('should move plugin from left to right', () => {
      const initialPlacements: PluginPlacementEntry[] = [
        { pluginId: 'filetree', panel: 'left' },
      ];

      const { result } = renderHook(() => usePluginPlacement(initialPlacements));

      // Initially in left panel
      expect(result.current.getPluginPanel('filetree')).toBe('left');
      expect(result.current.getPluginsInPanel('left')).toContain('filetree');
      expect(result.current.getPluginsInPanel('right')).not.toContain('filetree');

      // Move to right panel
      act(() => {
        const moved = result.current.movePluginToPanel('filetree', 'right');
        expect(moved).toBe(true);
      });

      // Now in right panel only
      expect(result.current.getPluginPanel('filetree')).toBe('right');
      expect(result.current.getPluginsInPanel('left')).not.toContain('filetree');
      expect(result.current.getPluginsInPanel('right')).toContain('filetree');
    });

    it('should move plugin from right to left', () => {
      const initialPlacements: PluginPlacementEntry[] = [
        { pluginId: 'chat', panel: 'right' },
      ];

      const { result } = renderHook(() => usePluginPlacement(initialPlacements));

      // Initially in right panel
      expect(result.current.getPluginPanel('chat')).toBe('right');

      // Move to left panel
      act(() => {
        const moved = result.current.movePluginToPanel('chat', 'left');
        expect(moved).toBe(true);
      });

      // Now in left panel only
      expect(result.current.getPluginPanel('chat')).toBe('left');
      expect(result.current.getPluginsInPanel('right')).not.toContain('chat');
      expect(result.current.getPluginsInPanel('left')).toContain('chat');
    });

    it('should no-op when dropping on same panel', () => {
      const initialPlacements: PluginPlacementEntry[] = [
        { pluginId: 'filetree', panel: 'left' },
      ];

      const { result } = renderHook(() => usePluginPlacement(initialPlacements));

      // Try to move to same panel (should be no-op)
      act(() => {
        const moved = result.current.movePluginToPanel('filetree', 'left');
        expect(moved).toBe(false);
      });

      // Still in left panel
      expect(result.current.getPluginPanel('filetree')).toBe('left');
    });

    it('should NOT allow plugin in both panels simultaneously', () => {
      const initialPlacements: PluginPlacementEntry[] = [
        { pluginId: 'filetree', panel: 'left' },
      ];

      const { result } = renderHook(() => usePluginPlacement(initialPlacements));

      // Move to right
      act(() => {
        result.current.movePluginToPanel('filetree', 'right');
      });

      // Plugin should be in right only, not in both
      const leftPlugins = result.current.getPluginsInPanel('left');
      const rightPlugins = result.current.getPluginsInPanel('right');

      expect(leftPlugins).not.toContain('filetree');
      expect(rightPlugins).toContain('filetree');

      // Only one placement total
      expect(result.current.placements.size).toBe(1);
    });
  });

  // ==========================================================================
  // Close Plugin Tests
  // ==========================================================================

  describe('closePlugin', () => {
    it('should remove plugin from any panel', () => {
      const initialPlacements: PluginPlacementEntry[] = [
        { pluginId: 'filetree', panel: 'left' },
        { pluginId: 'chat', panel: 'right' },
      ];

      const { result } = renderHook(() => usePluginPlacement(initialPlacements));

      // Close filetree
      act(() => {
        result.current.closePlugin('filetree');
      });

      expect(result.current.getPluginPanel('filetree')).toBe(null);
      expect(result.current.placements.size).toBe(1);
      expect(result.current.getPluginsInPanel('left')).not.toContain('filetree');
    });

    it('should be safe to close non-placed plugin', () => {
      const { result } = renderHook(() => usePluginPlacement([]));

      // Should not throw
      act(() => {
        result.current.closePlugin('filetree');
      });

      expect(result.current.placements.size).toBe(0);
    });
  });

  // ==========================================================================
  // Query Tests
  // ==========================================================================

  describe('isPluginPlaced', () => {
    it('should return true for placed plugins', () => {
      const initialPlacements: PluginPlacementEntry[] = [
        { pluginId: 'filetree', panel: 'left' },
      ];

      const { result } = renderHook(() => usePluginPlacement(initialPlacements));

      expect(result.current.isPluginPlaced('filetree')).toBe(true);
      expect(result.current.isPluginPlaced('chat')).toBe(false);
    });
  });

  describe('getPluginsInPanel', () => {
    it('should return all plugins in a panel', () => {
      const initialPlacements: PluginPlacementEntry[] = [
        { pluginId: 'filetree', panel: 'left' },
        { pluginId: 'notes', panel: 'left' },
        { pluginId: 'chat', panel: 'right' },
      ];

      const { result } = renderHook(() => usePluginPlacement(initialPlacements));

      const leftPlugins = result.current.getPluginsInPanel('left');
      const rightPlugins = result.current.getPluginsInPanel('right');

      expect(leftPlugins).toHaveLength(2);
      expect(leftPlugins).toContain('filetree');
      expect(leftPlugins).toContain('notes');

      expect(rightPlugins).toHaveLength(1);
      expect(rightPlugins).toContain('chat');
    });
  });

  // ==========================================================================
  // Reset Tests
  // ==========================================================================

  describe('resetPlacements', () => {
    it('should reset to initial placements', () => {
      const initialPlacements: PluginPlacementEntry[] = [
        { pluginId: 'filetree', panel: 'left' },
      ];

      const { result } = renderHook(() => usePluginPlacement(initialPlacements));

      // Move plugin
      act(() => {
        result.current.movePluginToPanel('filetree', 'right');
        result.current.movePluginToPanel('chat', 'left');
      });

      expect(result.current.placements.size).toBe(2);

      // Reset
      act(() => {
        result.current.resetPlacements();
      });

      expect(result.current.placements.size).toBe(1);
      expect(result.current.getPluginPanel('filetree')).toBe('left');
      expect(result.current.getPluginPanel('chat')).toBe(null);
    });

    it('should reset to new placements if provided', () => {
      const initialPlacements: PluginPlacementEntry[] = [
        { pluginId: 'filetree', panel: 'left' },
      ];

      const { result } = renderHook(() => usePluginPlacement(initialPlacements));

      const newPlacements: PluginPlacementEntry[] = [
        { pluginId: 'chat', panel: 'right' },
        { pluginId: 'notes', panel: 'left' },
      ];

      act(() => {
        result.current.resetPlacements(newPlacements);
      });

      expect(result.current.placements.size).toBe(2);
      expect(result.current.getPluginPanel('filetree')).toBe(null);
      expect(result.current.getPluginPanel('chat')).toBe('right');
      expect(result.current.getPluginPanel('notes')).toBe('left');
    });
  });
});

// ============================================================================
// Helper Function Tests
// ============================================================================

describe('getDefaultPlacements', () => {
  it('should return default preset placements', () => {
    const placements = getDefaultPlacements('default');

    expect(placements).toHaveLength(2);
    expect(placements).toContainEqual({ pluginId: 'filetree', panel: 'left' });
    expect(placements).toContainEqual({ pluginId: 'chat', panel: 'right' });
  });

  it('should return focus preset placements', () => {
    const placements = getDefaultPlacements('focus');

    expect(placements).toHaveLength(1);
    expect(placements).toContainEqual({ pluginId: 'notes', panel: 'left' });
  });

  it('should return code preset placements', () => {
    const placements = getDefaultPlacements('code');

    expect(placements).toHaveLength(2);
    expect(placements).toContainEqual({ pluginId: 'filetree', panel: 'left' });
    expect(placements).toContainEqual({ pluginId: 'terminal', panel: 'right' });
  });

  it('should return full-editor preset placements', () => {
    const placements = getDefaultPlacements('full-editor');

    expect(placements).toHaveLength(2);
    expect(placements).toContainEqual({ pluginId: 'filetree', panel: 'left' });
    expect(placements).toContainEqual({ pluginId: 'chat', panel: 'right' });
  });
});
