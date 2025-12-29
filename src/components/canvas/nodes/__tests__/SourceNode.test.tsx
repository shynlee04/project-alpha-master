import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { SourceNode } from '../SourceNode';
import '@testing-library/jest-dom';

// Mock React Flow Handle component
vi.mock('@xyflow/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@xyflow/react')>();
  return {
    ...actual,
    Handle: ({ type, position, className }: { type: string; position: string; className?: string }) => (
      <div data-testid={`handle-${type}-${position}`} className={className} />
    ),
    NodeResizer: ({ minWidth, minHeight }: { minWidth: number; minHeight: number }) => (
      <div data-testid="node-resizer" data-min-width={minWidth} data-min-height={minHeight} />
    ),
  };
});

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
  };

  describe('Rendering', () => {
    it('renders source node with title', () => {
      render(<SourceNode {...defaultProps} />);
      expect(screen.getByText('Introduction to Machine Learning')).toBeInTheDocument();
    });

    it('renders content type badge', () => {
      render(<SourceNode {...defaultProps} />);
      expect(screen.getByText('PDF')).toBeInTheDocument();
    });

    it('renders excerpt when provided', () => {
      render(<SourceNode {...defaultProps} />);
      expect(screen.getByText('A comprehensive introduction to ML fundamentals')).toBeInTheDocument();
    });

    it('does not render excerpt when not provided', () => {
      const { container } = render(
        <SourceNode
          {...defaultProps}
          data={{ ...defaultProps.data, excerpt: undefined }}
        />
      );
      expect(container.querySelector('.text-xs.text-gray-400')).not.toBeInTheDocument();
    });
  });

  describe('Content Type Icons', () => {
    it('shows PDF icon for PDF type', () => {
      render(<SourceNode {...defaultProps} data={{ ...defaultProps.data, contentType: 'pdf' }} />);
      // PDF should have red color styling
      const header = screen.getByText('PDF').parentElement;
      expect(header).toHaveStyle({ color: '#ef4444' });
    });

    it('shows globe icon for URL type', () => {
      render(
        <SourceNode
          {...defaultProps}
          data={{ ...defaultProps.data, contentType: 'url' }}
        />
      );
      const header = screen.getByText('URL').parentElement;
      expect(header).toHaveStyle({ color: '#3b82f6' });
    });

    it('shows file icon for text/markdown type', () => {
      render(
        <SourceNode
          {...defaultProps}
          data={{ ...defaultProps.data, contentType: 'markdown' }}
        />
      );
      const header = screen.getByText('MARKDOWN').parentElement;
      expect(header).toHaveStyle({ color: '#22c55e' });
    });
  });

  describe('Handles', () => {
    it('renders target handle at top position', () => {
      render(<SourceNode {...defaultProps} />);
      expect(screen.getByTestId('handle-target-Top')).toBeInTheDocument();
    });

    it('renders source handle at bottom position', () => {
      render(<SourceNode {...defaultProps} />);
      expect(screen.getByTestId('handle-source-Bottom')).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('applies selected styling when node is selected', () => {
      render(<SourceNode {...defaultProps} selected />);
      const container = screen.getByText('Introduction to Machine Learning').closest('div');
      expect(container).toHaveClass('border-blue-500');
    });

    it('does not apply selected styling when node is not selected', () => {
      render(<SourceNode {...defaultProps} selected={false} />);
      const container = screen.getByText('Introduction to Machine Learning').closest('div');
      expect(container).toHaveClass('border-gray-700');
    });

    it('renders NodeResizer when selected', () => {
      render(<SourceNode {...defaultProps} selected />);
      expect(screen.getByTestId('node-resizer')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies correct border color for PDF type', () => {
      render(<SourceNode {...defaultProps} />);
      const container = screen.getByText('Introduction to Machine Learning').closest('div');
      // The border should have the gray-700 color for unselected state
      expect(container).toHaveClass('border-gray-700');
    });
  });
});
