import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock React Flow Handle component
vi.mock('@xyflow/react', async () => {
  const actual = await import('@xyflow/react') as object;
  return {
    ...actual,
    Handle: ({ type, position, className }: { type: string; position: string; className?: string }) => (
      <div data-testid={`handle-${type}-${position}`} className={className} />
    ),
    NodeResizer: () => <div data-testid="node-resizer" />,
  };
});

// Import after mocking
const { SourceNode } = await import('../SourceNode');

describe('SourceNode', () => {
  const defaultProps = {
    data: {
      nodeType: 'source' as const,
      sourceId: 'src-1',
      title: 'Introduction to Machine Learning',
      contentType: 'pdf' as const,
      excerpt: 'A comprehensive introduction to ML fundamentals',
    },
    selected: false,
    id: 'test-node',
    type: 'source',
    position: { x: 0, y: 0 },
    width: 200,
    height: 100,
    targetPosition: 'top',
    sourcePosition: 'bottom',
  };

  describe('Rendering', () => {
    it('renders source node with title', () => {
      render(<SourceNode {...defaultProps} />);
      expect(screen.getByText('Introduction to Machine Learning')).toBeInTheDocument();
    });

    it('renders content type badge (lowercase in DOM, uppercase via CSS)', () => {
      render(<SourceNode {...defaultProps} />);
      expect(screen.getByText('pdf')).toBeInTheDocument();
    });

    it('renders excerpt when provided', () => {
      render(<SourceNode {...defaultProps} />);
      expect(screen.getByText('A comprehensive introduction to ML fundamentals')).toBeInTheDocument();
    });
  });

  describe('Handles', () => {
    it('renders target handle at top position', () => {
      render(<SourceNode {...defaultProps} />);
      expect(screen.getByTestId('handle-target-top')).toBeInTheDocument();
    });

    it('renders source handle at bottom position', () => {
      render(<SourceNode {...defaultProps} />);
      expect(screen.getByTestId('handle-source-bottom')).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('renders NodeResizer when selected', () => {
      render(<SourceNode {...defaultProps} selected />);
      expect(screen.getByTestId('node-resizer')).toBeInTheDocument();
    });

    it('does not render NodeResizer when not selected', () => {
      render(<SourceNode {...defaultProps} selected={false} />);
      expect(screen.queryByTestId('node-resizer')).not.toBeInTheDocument();
    });
  });
});
