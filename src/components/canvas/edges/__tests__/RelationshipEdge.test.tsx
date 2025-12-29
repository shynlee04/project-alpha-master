import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReactFlowProvider } from '@xyflow/react';

// Mock React Flow components
vi.mock('@xyflow/react', async () => {
  const actual = await import('@xyflow/react') as object;
  return {
    ...actual,
    BaseEdge: ({ id, path, style, markerEnd, selected, onClick }: any) => (
      <svg data-testid="base-edge" data-id={id} data-selected={selected} style={style}>
        <path d={path} />
      </svg>
    ),
    EdgeLabelRenderer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="edge-label-renderer">{children}</div>
    ),
    getBezierPath: vi.fn(() => ['M0,0 C50,50 100,100 150,150', 75, 75]),
    MarkerType: {
      ArrowClosed: 'arrowclosed',
      Arrow: 'arrow',
      Endpoint: 'endpoint',
    },
  };
});

// Mock useReactFlow
const mockFitView = vi.fn();
vi.mock('@xyflow/react', async () => {
  const actual = await import('@xyflow/react') as object;
  return {
    ...actual,
    useReactFlow: () => ({
      fitView: mockFitView,
      screenToFlowPosition: vi.fn(({ x, y }) => ({ x, y })),
    }),
  };
});

// Helper to render with ReactFlowProvider
const renderWithProvider = (component: React.ReactNode) => {
  return render(<ReactFlowProvider>{component}</ReactFlowProvider>);
};

// Import after mocking
const { RelationshipEdge, createRelationshipEdge, getRelationshipColor, getRelationshipLabel } = await import('../RelationshipEdge');

describe('RelationshipEdge', () => {
  const defaultProps = {
    id: 'edge-1',
    sourceX: 0,
    sourceY: 0,
    targetX: 150,
    targetY: 150,
    sourcePosition: 'bottom' as const,
    targetPosition: 'top' as const,
    data: {},
    style: {},
    markerEnd: { type: 'arrowclosed', color: '#a855f7' },
    selected: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders base edge with correct path', () => {
      render(<RelationshipEdge {...defaultProps} />);
      expect(screen.getByTestId('base-edge')).toBeInTheDocument();
    });

    it('renders edge label renderer', () => {
      render(<RelationshipEdge {...defaultProps} />);
      expect(screen.getByTestId('edge-label-renderer')).toBeInTheDocument();
    });

    it('applies correct color for relates type', () => {
      const { container } = render(
        <RelationshipEdge {...defaultProps} data={{ relationship: 'relates' }} />
      );
      const edge = container.querySelector('[data-testid="base-edge"]');
      expect(edge).toHaveStyle({ stroke: 'var(--color-primary, #a855f7)' });
    });

    it('applies green color for supports type', () => {
      const { container } = render(
        <RelationshipEdge {...defaultProps} data={{ relationship: 'supports' }} />
      );
      const edge = container.querySelector('[data-testid="base-edge"]');
      expect(edge).toHaveStyle({ stroke: '#22c55e' });
    });

    it('applies red dashed line for contradicts type', () => {
      const { container } = render(
        <RelationshipEdge {...defaultProps} data={{ relationship: 'contradicts' }} />
      );
      const edge = container.querySelector('[data-testid="base-edge"]');
      expect(edge).toHaveStyle({ stroke: '#ef4444', strokeDasharray: '5,5' });
    });

    it('applies blue dashed line for extends type', () => {
      const { container } = render(
        <RelationshipEdge {...defaultProps} data={{ relationship: 'extends' }} />
      );
      const edge = container.querySelector('[data-testid="base-edge"]');
      expect(edge).toHaveStyle({ stroke: '#3b82f6', strokeDasharray: '10,5' });
    });
  });

  describe('Edge Label', () => {
    it('does not show label button when no label provided', () => {
      render(<RelationshipEdge {...defaultProps} data={{ label: undefined }} />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('shows label button when label provided', () => {
      render(<RelationshipEdge {...defaultProps} data={{ label: 'related' }} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveTextContent('related');
    });

    it('shows input field when label is clicked', () => {
      render(<RelationshipEdge {...defaultProps} data={{ label: 'related' }} />);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('enters edit mode on double-click', () => {
      render(<RelationshipEdge {...defaultProps} data={{ label: 'related' }} />);
      const button = screen.getByRole('button');
      fireEvent.doubleClick(button);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Label Editing', () => {
    it('updates label value on input change', () => {
      render(<RelationshipEdge {...defaultProps} data={{ label: 'original' }} />);
      const button = screen.getByRole('button');
      fireEvent.click(button);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'updated' } });
      expect(input).toHaveValue('updated');
    });

    it('saves on Enter key press', () => {
      render(<RelationshipEdge {...defaultProps} data={{ label: 'original' }} />);
      const button = screen.getByRole('button');
      fireEvent.click(button);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'updated' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      // Should show the updated label after saving
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveTextContent('updated');
    });

    it('cancels on Escape key press', () => {
      render(<RelationshipEdge {...defaultProps} data={{ label: 'original' }} />);
      const button = screen.getByRole('button');
      fireEvent.click(button);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'changed' } });
      fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });

      // Should show the original label after cancelling
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveTextContent('original');
    });

    it('saves on blur', () => {
      render(<RelationshipEdge {...defaultProps} data={{ label: 'original' }} />);
      const button = screen.getByRole('button');
      fireEvent.click(button);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'changed' } });
      fireEvent.blur(input);

      // Input should be hidden after blur
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });

  describe('Selection Styling', () => {
    it('applies selected styling when edge is selected', () => {
      render(<RelationshipEdge {...defaultProps} data={{ label: 'test' }} selected />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-primary');
      expect(button).toHaveClass('text-primary');
    });

    it('does not apply selected styling when edge is not selected', () => {
      render(<RelationshipEdge {...defaultProps} data={{ label: 'test' }} selected={false} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-border');
      expect(button).toHaveClass('text-muted-foreground');
    });
  });
});

describe('Edge Helper Functions', () => {
  describe('createRelationshipEdge', () => {
    it('creates edge with default relates type', () => {
      const edge = createRelationshipEdge('source-1', 'target-1');
      expect(edge.id).toMatch(/^edge-source-1-target-1-\d+$/);
      expect(edge.source).toBe('source-1');
      expect(edge.target).toBe('target-1');
      expect(edge.type).toBe('relationship');
      expect(edge.data?.relationship).toBe('relates');
      expect(edge.animated).toBe(true);
    });

    it('creates edge with supports type', () => {
      const edge = createRelationshipEdge('source-1', 'target-1', 'supports');
      expect(edge.data?.relationship).toBe('supports');
    });

    it('creates edge with custom label', () => {
      const edge = createRelationshipEdge('source-1', 'target-1', 'relates', 'my label');
      expect(edge.data?.label).toBe('my label');
    });
  });

  describe('getRelationshipColor', () => {
    it('returns purple for relates', () => {
      expect(getRelationshipColor('relates')).toBe('var(--color-primary, #a855f7)');
    });

    it('returns green for supports', () => {
      expect(getRelationshipColor('supports')).toBe('#22c55e');
    });

    it('returns red for contradicts', () => {
      expect(getRelationshipColor('contradicts')).toBe('#ef4444');
    });

    it('returns blue for extends', () => {
      expect(getRelationshipColor('extends')).toBe('#3b82f6');
    });
  });

  describe('getRelationshipLabel', () => {
    it('returns "Related to" for relates', () => {
      expect(getRelationshipLabel('relates')).toBe('Related to');
    });

    it('returns "Supports" for supports', () => {
      expect(getRelationshipLabel('supports')).toBe('Supports');
    });

    it('returns "Contrasts with" for contradicts', () => {
      expect(getRelationshipLabel('contradicts')).toBe('Contrasts with');
    });

    it('returns "Extends" for extends', () => {
      expect(getRelationshipLabel('extends')).toBe('Extends');
    });
  });
});
