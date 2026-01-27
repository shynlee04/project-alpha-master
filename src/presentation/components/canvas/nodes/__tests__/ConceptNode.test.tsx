import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock React Flow components
vi.mock('@xyflow/react', async () => {
  const actual = await import('@xyflow/react') as object;
  return {
    ...actual,
    Handle: ({ type, position, className }: { type: string; position: string; className?: string }) => (
      <div data-testid={`handle-${type}-${position}`} className={className} />
    ),
  };
});

// Import after mocking
const { ConceptNode } = await import('../ConceptNode');

describe('ConceptNode', () => {
  const defaultProps = {
    id: 'concept-1',
    type: 'concept',
    data: {
      nodeType: 'concept' as const,
      title: 'Test Concept',
    },
    selected: false,
    position: { x: 0, y: 0 },
    width: 180,
    height: 80,
    targetPosition: 'top' as const,
    sourcePosition: 'bottom' as const,
  };

  describe('Rendering', () => {
    it('renders concept node with title', () => {
      render(<ConceptNode {...defaultProps} />);
      expect(screen.getByText('Test Concept')).toBeInTheDocument();
    });

    it('renders description when provided', () => {
      render(
        <ConceptNode
          {...defaultProps}
          data={{ ...defaultProps.data, description: 'A test description' }}
        />
      );
      expect(screen.getByText('A test description')).toBeInTheDocument();
    });

    it('does not render description when not provided', () => {
      render(<ConceptNode {...defaultProps} />);
      expect(screen.queryByText('A test description')).not.toBeInTheDocument();
    });
  });

  describe('Handles', () => {
    it('renders target handle at top position', () => {
      render(<ConceptNode {...defaultProps} />);
      expect(screen.getByTestId('handle-target-top')).toBeInTheDocument();
    });

    it('renders source handle at bottom position', () => {
      render(<ConceptNode {...defaultProps} />);
      expect(screen.getByTestId('handle-source-bottom')).toBeInTheDocument();
    });
  });

  describe('Inline Editing', () => {
    it('enters edit mode on double-click', () => {
      render(<ConceptNode {...defaultProps} />);
      const container = screen.getByText('Test Concept').closest('div');
      fireEvent.doubleClick(container!);
      expect(screen.getByTestId('concept-node-input')).toBeInTheDocument();
    });

    it('shows input field when editing', () => {
      render(<ConceptNode {...defaultProps} />);
      const container = screen.getByText('Test Concept').closest('div');
      fireEvent.doubleClick(container!);
      expect(screen.getByDisplayValue('Test Concept')).toBeInTheDocument();
    });

    it('calls onTitleChange when Enter is pressed', () => {
      const onTitleChange = vi.fn();
      render(<ConceptNode {...defaultProps} onTitleChange={onTitleChange} />);
      const container = screen.getByText('Test Concept').closest('div');
      fireEvent.doubleClick(container!);

      const input = screen.getByTestId('concept-node-input');
      fireEvent.change(input, { target: { value: 'Updated Concept' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      expect(onTitleChange).toHaveBeenCalledWith('concept-1', 'Updated Concept');
    });

    it('cancels editing on Escape', () => {
      render(<ConceptNode {...defaultProps} />);
      const container = screen.getByText('Test Concept').closest('div');
      fireEvent.doubleClick(container!);

      const input = screen.getByTestId('concept-node-input');
      fireEvent.change(input, { target: { value: 'Cancelled' } });
      fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });

      // Should show original title, not the cancelled value
      expect(screen.getByText('Test Concept')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('Cancelled')).not.toBeInTheDocument();
    });

    it('does not enter edit mode on single click', () => {
      render(<ConceptNode {...defaultProps} />);
      const container = screen.getByText('Test Concept').closest('div');
      fireEvent.click(container!);
      expect(screen.queryByTestId('concept-node-input')).not.toBeInTheDocument();
    });
  });

  describe('Selection Styling', () => {
    it('applies selected border class when node is selected', () => {
      render(<ConceptNode {...defaultProps} selected />);
      const container = screen.getByText('Test Concept').closest('div');
      expect(container).toHaveClass('border-purple-500');
    });

    it('does not apply selected border class when node is not selected', () => {
      render(<ConceptNode {...defaultProps} selected={false} />);
      const container = screen.getByText('Test Concept').closest('div');
      expect(container).toHaveClass('border-border');
    });
  });
});
