/**
 * @fileoverview Unit Tests for Citation Components
 * @module components/rag/__tests__/citation-components.test.tsx
 * @governance Story 32-3 - Semantic Citation System
 *
 * Comprehensive test suite for CitationSidebar and CitationCountBadge components.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTranslation } from 'react-i18next';

// Mock i18next before importing components
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(() => ({
    t: vi.fn((key: string) => {
      // Simple mock translation function
      const translations: Record<string, string> = {
        'citation.sidebar.title': 'Sources & Citations',
        'citation.sidebar.close': 'Close citations',
        'citation.sidebar.searchPlaceholder': 'Search citations...',
        'citation.sidebar.empty': 'No citations in this response',
        'citation.sidebar.noResults': 'No citations match your search',
        'citation.badge.ariaLabel': '{{count}} citations',
      };
      return translations[key] || key;
    }),
  })),
}));

// Import after mocking
import { CitationSidebar } from '../CitationSidebar';
import { CitationCountBadge, type CitationCountBadgeProps } from '../CitationCountBadge';
import type { DisplayCitation } from '@/lib/rag/citation-types';

// Test data with correct DisplayCitation structure
const mockCitations: DisplayCitation[] = [
  {
    id: 1,
    sourceId: 'source-1',
    title: 'Introduction to Machine Learning',
    score: 0.95,
    passage: 'Machine learning is a subset of artificial intelligence...',
    inlineCitation: '[1]',
    position: { start: 42, end: 100 },
  },
  {
    id: 2,
    sourceId: 'source-2',
    title: 'Deep Learning Fundamentals',
    score: 0.87,
    passage: 'Deep learning uses neural networks with multiple layers...',
    inlineCitation: '[2]',
    position: { start: 156, end: 220 },
  },
  {
    id: 3,
    sourceId: 'source-1',
    title: 'Introduction to Machine Learning',
    score: 0.72,
    passage: 'The field has grown significantly in recent years...',
    inlineCitation: '[3]',
    position: { start: 89, end: 140 },
  },
];

describe('CitationSidebar', () => {
  const defaultProps = {
    citations: mockCitations,
    isOpen: true,
    onClose: vi.fn(),
    onCitationClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Rendering', () => {
    it('should render sidebar when isOpen is true', () => {
      render(<CitationSidebar {...defaultProps} />);
      
      expect(screen.getByRole('complementary', { name: /citation sidebar/i })).toBeInTheDocument();
    });

    it('should not render sidebar when isOpen is false', () => {
      render(<CitationSidebar {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    });

    it('should render title', () => {
      render(<CitationSidebar {...defaultProps} />);
      
      expect(screen.getByText('Sources & Citations')).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<CitationSidebar {...defaultProps} />);
      
      const closeButton = screen.getByRole('button', { name: /close citations/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should render all citations when provided', () => {
      render(<CitationSidebar {...defaultProps} />);
      
      mockCitations.forEach((citation) => {
        expect(screen.getByText(citation.title)).toBeInTheDocument();
      });
    });

    it('should render empty state when no citations', () => {
      render(<CitationSidebar {...defaultProps} citations={[]} />);
      
      expect(screen.getByText('No citations in this response')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should render search input', () => {
      render(<CitationSidebar {...defaultProps} />);
      
      expect(screen.getByPlaceholderText('Search citations...')).toBeInTheDocument();
    });

    it('should filter citations by title on search', async () => {
      const user = userEvent.setup();
      render(<CitationSidebar {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search citations...');
      await user.type(searchInput, 'Deep Learning');
      
      expect(screen.getByText('Deep Learning Fundamentals')).toBeInTheDocument();
      expect(screen.queryByText('Introduction to Machine Learning')).not.toBeInTheDocument();
    });

    it('should show no results message when search yields no matches', async () => {
      const user = userEvent.setup();
      render(<CitationSidebar {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search citations...');
      await user.type(searchInput, 'nonexistent');
      
      expect(screen.getByText('No citations match your search')).toBeInTheDocument();
    });
  });

  describe('Citation Selection', () => {
    it('should call onCitationClick when citation is clicked', async () => {
      const user = userEvent.setup();
      const onCitationClick = vi.fn();
      render(<CitationSidebar {...defaultProps} onCitationClick={onCitationClick} />);
      
      const citationCard = screen.getByText('Introduction to Machine Learning');
      await user.click(citationCard);
      
      expect(onCitationClick).toHaveBeenCalledTimes(1);
      expect(onCitationClick).toHaveBeenCalledWith(mockCitations[0]);
    });

    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<CitationSidebar {...defaultProps} onClose={onClose} />);
      
      const closeButton = screen.getByRole('button', { name: /close citations/i });
      await user.click(closeButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Source Filtering', () => {
    it('should render filter by source section when selectedSources provided', () => {
      render(
        <CitationSidebar
          {...defaultProps}
          selectedSources={['source-1']}
          onFilterChange={vi.fn()}
        />
      );
      
      expect(screen.getByText('Filter by source')).toBeInTheDocument();
    });

    it('should filter citations by selected source', () => {
      render(
        <CitationSidebar
          {...defaultProps}
          selectedSources={['source-1']}
          onFilterChange={vi.fn()}
        />
      );
      
      // Only citations from source-1 should be visible
      expect(screen.getByText('Introduction to Machine Learning')).toBeInTheDocument();
      expect(screen.queryByText('Deep Learning Fundamentals')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<CitationSidebar {...defaultProps} />);
      
      const sidebar = screen.getByRole('complementary', { name: /citation sidebar/i });
      expect(sidebar).toHaveAttribute('aria-label');
    });

    it('should have ARIA labels for search input', () => {
      render(<CitationSidebar {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search citations...');
      expect(searchInput).toHaveAttribute('aria-label');
    });
  });
});

describe('CitationCountBadge', () => {
  const defaultProps: CitationCountBadgeProps = {
    count: 3,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Rendering', () => {
    it('should render badge with count', () => {
      render(<CitationCountBadge {...defaultProps} />);
      
      const badge = screen.getByRole('status', { name: /3 citations/i });
      expect(badge).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should render zero count correctly', () => {
      render(<CitationCountBadge count={0} />);
      
      const badge = screen.getByRole('status', { name: /0 citations/i });
      expect(badge).toBeInTheDocument();
    });

    it('should render single count correctly', () => {
      render(<CitationCountBadge count={1} />);
      
      const badge = screen.getByRole('status', { name: /1 citations/i });
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have default styling classes', () => {
      render(<CitationCountBadge {...defaultProps} />);
      
      const badge = screen.getByText('3');
      expect(badge).toHaveClass('inline-flex', 'items-center', 'justify-center');
    });

    it('should apply custom className if provided', () => {
      render(<CitationCountBadge {...defaultProps} className="custom-badge" />);
      
      const badge = screen.getByText('3');
      expect(badge).toHaveClass('custom-badge');
    });
  });

  describe('Accessibility', () => {
    it('should have ARIA label with count', () => {
      render(<CitationCountBadge count={5} />);
      
      const badge = screen.getByRole('status', { name: /5 citations/i });
      expect(badge).toHaveAttribute('aria-label', '5 citations');
    });
  });
});

describe('Citation Types', () => {
  describe('DisplayCitation Types', () => {
    it('should have all required properties', () => {
      const citation: DisplayCitation = {
        id: 1,
        sourceId: 'source-1',
        title: 'Test Document',
        score: 0.85,
        passage: 'Test passage content',
        inlineCitation: '[1]',
        position: { start: 100, end: 200 },
      };
      
      expect(citation.id).toBe(1);
      expect(citation.sourceId).toBe('source-1');
      expect(citation.title).toBe('Test Document');
      expect(citation.score).toBe(0.85);
      expect(citation.passage).toBe('Test passage content');
      expect(citation.inlineCitation).toBe('[1]');
      expect(citation.position).toEqual({ start: 100, end: 200 });
    });

    it('should allow optional position property', () => {
      const citation: DisplayCitation = {
        id: 1,
        sourceId: 'source-1',
        title: 'Test Document',
        score: 0.85,
        passage: 'Test passage content',
        inlineCitation: '[1]',
      };
      
      expect(citation.position).toBeUndefined();
    });
  });

  describe('CitationSidebarProps', () => {
    it('should accept all required props', () => {
      const props: React.ComponentProps<typeof CitationSidebar> = {
        citations: mockCitations,
        isOpen: true,
        onClose: vi.fn(),
        onCitationClick: vi.fn(),
      };
      
      expect(props.citations).toEqual(mockCitations);
      expect(props.isOpen).toBe(true);
      expect(typeof props.onClose).toBe('function');
      expect(typeof props.onCitationClick).toBe('function');
    });
  });
});
