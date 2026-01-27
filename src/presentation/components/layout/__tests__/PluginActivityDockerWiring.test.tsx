/**
 * @fileoverview Tests for PluginActivityDockerWiring
 * @module presentation/components/layout/__tests__/PluginActivityDockerWiring.test.tsx
 *
 * **UXUI-02-05**: Wire ActivityBar + Docker Tests
 *
 * @epic EPIC-UXUI-02
 * @story UXUI-02-05
 * @team Team A
 * @created 2026-01-28
 */

// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  usePluginActivityDockerWiring,
  PluginActivityDockerWiringStandalone,
  type PluginActivityDockerWiringProps,
} from '../PluginActivityDockerWiring';

// Type aliases for plugin testing
type PluginId = 'filetree' | 'monaco' | 'notes' | 'terminal' | 'chat' | 'agents' | 'preview' | 'search';
type PanelPosition = 'left' | 'right' | null;

// ============================================================================
// Test Wrapper Component
// ============================================================================

/**
 * Test wrapper to render the hook result
 */
function TestWrapper({
  position = 'left',
  placements = new Map<PluginId, PanelPosition>(),
  onMove,
  onClose,
}: {
  position?: 'left' | 'right';
  placements?: Map<PluginId, PanelPosition>;
  onMove?: (pluginId: PluginId, panel: 'left' | 'right') => void;
  onClose?: (pluginId: PluginId) => void;
}) {
  const items = [
    { id: 'filetree', icon: <span>📁</span>, label: 'Files' },
    { id: 'search', icon: <span>🔍</span>, label: 'Search' },
  ];

  const getPluginPanel = (pluginId: PluginId): PanelPosition => {
    return placements.get(pluginId) ?? null;
  };

  const movePluginToPanel = (pluginId: PluginId, targetPanel: 'left' | 'right') => {
    onMove?.(pluginId, targetPanel);
    return true;
  };

  const closePlugin = (pluginId: PluginId) => {
    onClose?.(pluginId);
  };

  const getPluginsInPanel = (panel: 'left' | 'right'): PluginId[] => {
    const result: PluginId[] = [];
    placements.forEach((p, id) => {
      if (p === panel) result.push(id);
    });
    return result;
  };

  const { activityBar, docker } = usePluginActivityDockerWiring({
    position,
    items,
    getPluginPanel,
    movePluginToPanel,
    closePlugin,
    getPluginsInPanel,
  });

  return (
    <div data-testid="test-wrapper">
      <div data-testid="activity-bar-slot">{activityBar}</div>
      <div data-testid="docker-slot">{docker}</div>
    </div>
  );
}

// ============================================================================
// Tests
// ============================================================================

describe('PluginActivityDockerWiring', () => {
  const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

  beforeEach(() => {
    consoleSpy.mockClear();
  });

  describe('Rendering', () => {
    it('should render ActivityBar and Docker elements', () => {
      render(<TestWrapper />);

      expect(screen.getByTestId('activity-bar-slot')).toBeInTheDocument();
      expect(screen.getByTestId('docker-slot')).toBeInTheDocument();
    });

    it('should render ActivityBar with correct position', () => {
      render(<TestWrapper position="left" />);

      const activityBar = screen.getByRole('toolbar');
      expect(activityBar).toHaveClass('activity-bar--left');
    });

    it('should render Docker as closed when no plugin is active', () => {
      render(<TestWrapper />);

      const docker = screen.getByTestId('docker-slot').querySelector('.plugin-docker');
      expect(docker).toHaveClass('plugin-docker--closed');
    });
  });

  describe('ActivityBar Click Behavior', () => {
    it('should open plugin when clicked and not active', () => {
      const onMove = vi.fn();
      render(<TestWrapper onMove={onMove} />);

      const filesButton = screen.getByRole('button', { name: 'Files' });
      fireEvent.click(filesButton);

      expect(onMove).toHaveBeenCalledWith('filetree', 'left');
    });

    it('should close plugin when clicked and already active in same panel', () => {
      const onClose = vi.fn();
      const placements = new Map<PluginId, PanelPosition>([
        ['filetree', 'left'],
      ]);

      render(<TestWrapper placements={placements} onClose={onClose} />);

      const filesButton = screen.getByRole('button', { name: 'Files' });
      fireEvent.click(filesButton);

      expect(onClose).toHaveBeenCalledWith('filetree');
    });

    it('should switch plugin when clicking different item', () => {
      const onMove = vi.fn();
      const placements = new Map<PluginId, PanelPosition>([
        ['filetree', 'left'],
      ]);

      render(<TestWrapper placements={placements} onMove={onMove} />);

      const searchButton = screen.getByRole('button', { name: 'Search' });
      fireEvent.click(searchButton);

      expect(onMove).toHaveBeenCalledWith('search', 'left');
    });
  });

  describe('Active State Synchronization', () => {
    it('should mark active item with aria-pressed=true', () => {
      const placements = new Map<PluginId, PanelPosition>([
        ['filetree', 'left'],
      ]);

      render(<TestWrapper placements={placements} />);

      const filesButton = screen.getByRole('button', { name: 'Files' });
      expect(filesButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should open Docker when plugin is active', () => {
      const placements = new Map<PluginId, PanelPosition>([
        ['filetree', 'left'],
      ]);

      render(<TestWrapper placements={placements} />);

      const docker = screen.getByTestId('docker-slot').querySelector('.plugin-docker');
      expect(docker).toHaveClass('plugin-docker--open');
    });

    it('should show plugin content in Docker', () => {
      const placements = new Map<PluginId, PanelPosition>([
        ['filetree', 'left'],
      ]);

      render(<TestWrapper placements={placements} />);

      expect(screen.getByText('Plugin: filetree')).toBeInTheDocument();
    });
  });

  describe('Docker Close Button', () => {
    it('should close active plugin when Docker close button is clicked', () => {
      const onClose = vi.fn();
      const placements = new Map<PluginId, PanelPosition>([
        ['filetree', 'left'],
      ]);

      render(<TestWrapper placements={placements} onClose={onClose} />);

      const closeButton = screen.getByRole('button', { name: 'Close panel' });
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledWith('filetree');
    });
  });

  describe('Right Side Position', () => {
    it('should render correctly for right position', () => {
      render(<TestWrapper position="right" />);

      const activityBar = screen.getByRole('toolbar');
      expect(activityBar).toHaveClass('activity-bar--right');
    });

    it('should move plugin to right panel on click', () => {
      const onMove = vi.fn();
      render(<TestWrapper position="right" onMove={onMove} />);

      const filesButton = screen.getByRole('button', { name: 'Files' });
      fireEvent.click(filesButton);

      expect(onMove).toHaveBeenCalledWith('filetree', 'right');
    });
  });
});

describe('PluginActivityDockerWiringStandalone', () => {
  it('should render as a standalone component', () => {
    const props: PluginActivityDockerWiringProps = {
      position: 'left',
      items: [
        { id: 'filetree', icon: <span>📁</span>, label: 'Files' },
      ],
      getPluginPanel: () => null,
      movePluginToPanel: () => true,
      closePlugin: () => {},
      getPluginsInPanel: () => [],
    };

    render(<PluginActivityDockerWiringStandalone {...props} />);

    expect(screen.getByRole('toolbar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Files' })).toBeInTheDocument();
  });
});
