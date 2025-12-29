import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

// Mock useCanvasDrop BEFORE importing Canvas
vi.mock('../../hooks/useCanvasDrop', () => ({
  useCanvasDrop: () => ({
    handleDragOver: vi.fn(),
    handleDrop: vi.fn(),
  }),
}));

// Mock dependencies
vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react');
  return {
    ...actual,
    ReactFlow: ({ children, ...props }: React.ComponentProps<typeof actual.ReactFlow>) => (
      <div data-testid="react-flow" {...props}>
        {children}
      </div>
    ),
    Controls: () => <div data-testid="controls" />,
    Background: () => <div data-testid="background" />,
    ReactFlowProvider: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="react-flow-provider">{children}</div>
    ),
    Panel: ({ children, position }: { children: React.ReactNode; position?: string }) => (
      <div data-testid={`panel-${position || 'default'}`}>{children}</div>
    ),
    useReactFlow: () => ({
      screenToFlowPosition: vi.fn(({ x, y }) => ({ x, y })),
      getNodes: vi.fn(() => []),
      setNodes: vi.fn(),
    }),
    useStoreApi: () => ({
      getState: vi.fn(),
      setState: vi.fn(),
    }),
  };
});

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

// Mock useResponsive hook
vi.mock('../../hooks/useResponsive', () => ({
  useResponsive: () => ({ isMobile: false, isTablet: false, isDesktop: true }),
}));

// Import Canvas after mocks are set up
import { Canvas } from '../Canvas';

describe('Canvas Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Rendering', () => {
    it('renders ReactFlow when there are no nodes', () => {
      render(<Canvas />);

      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
      expect(screen.getByTestId('controls')).toBeInTheDocument();
      expect(screen.getByTestId('background')).toBeInTheDocument();
    });

    it('renders empty state message', () => {
      render(<Canvas />);

      expect(screen.getByText('Drop sources here to start')).toBeInTheDocument();
      expect(
        screen.getByText('Drag and drop sources from the sidebar to create your knowledge map')
      ).toBeInTheDocument();
    });

    it('renders within ReactFlowProvider', () => {
      render(<Canvas />);

      expect(screen.getByTestId('react-flow-provider')).toBeInTheDocument();
    });
  });

  describe('Mobile Read-Only Mode', () => {
    it('shows read-only overlay on mobile', async () => {
      vi.mock('../../hooks/useResponsive', () => ({
        useResponsive: () => ({ isMobile: true, isTablet: false, isDesktop: false }),
      }));

      render(<Canvas />);

      expect(screen.getByText('Edit on desktop')).toBeInTheDocument();
    });

    it('does not show read-only overlay on desktop', () => {
      render(<Canvas />);

      expect(screen.queryByText('Edit on desktop')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts Panel', () => {
    it('renders keyboard shortcuts panel', () => {
      render(<Canvas />);

      expect(screen.getByTestId('panel-bottom-right')).toBeInTheDocument();
    });

    it('displays pan shortcut', () => {
      render(<Canvas />);

      expect(screen.getByText('Pan')).toBeInTheDocument();
    });

    it('displays zoom shortcut', () => {
      render(<Canvas />);

      expect(screen.getByText('Zoom in/out')).toBeInTheDocument();
    });

    it('displays fit view shortcut', () => {
      render(<Canvas />);

      expect(screen.getByText('Fit view')).toBeInTheDocument();
    });

    it('displays delete shortcut', () => {
      render(<Canvas />);

      expect(screen.getByText('Delete selected')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper container structure', () => {
      render(<Canvas />);

      const container = screen.getByTestId('react-flow').closest('div');
      expect(container).toHaveClass('w-full', 'h-full', 'min-h-[400px]', 'relative');
    });
  });
});
