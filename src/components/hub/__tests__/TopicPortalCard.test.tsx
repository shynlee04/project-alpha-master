/**
 * TopicPortalCard Component Tests
 *
 * Tests for portal card component for workspace navigation.
 *
 * @file TopicPortalCard.test.tsx
 * @created 2025-12-26T13:12:00Z
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TopicPortalCard } from '../TopicPortalCard';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      // Return the key without the namespace prefix for testing
      return key.replace('portal:', '');
    },
  }),
}));

describe('TopicPortalCard', () => {
  const defaultProps = {
    titleKey: 'portal:testPortal',
    descriptionKey: 'portal:testDescription',
    icon: <div data-testid="test-icon" />,
    onClick: vi.fn(),
  };

  describe('Rendering', () => {
    it('should render card with title and description', () => {
      render(<TopicPortalCard {...defaultProps} />);

      expect(screen.getByText('testPortal')).toBeInTheDocument();
      expect(screen.getByText('testDescription')).toBeInTheDocument();
    });

    it('should render icon', () => {
      render(<TopicPortalCard {...defaultProps} />);

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('should render arrow indicator', () => {
      render(<TopicPortalCard {...defaultProps} />);

      // ChevronRight icon is rendered (aria-hidden="true")
      expect(document.body.innerHTML).toContain('lucide-chevron-right');
    });
  });

  describe('Interactions', () => {
    it('should call onClick when card is clicked', () => {
      const onClick = vi.fn();
      render(<TopicPortalCard {...defaultProps} onClick={onClick} />);

      const card = screen.getByRole('button');
      fireEvent.click(card);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should have hover effect', () => {
      const { container } = render(<TopicPortalCard {...defaultProps} />);

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass(/hover:/);
    });
  });

  describe('Badge', () => {
    it('should not render badge when badge is not provided', () => {
      render(<TopicPortalCard {...defaultProps} />);

      // Badge is a span with specific styling, check that badge content is not rendered
      expect(screen.queryByText('5')).not.toBeInTheDocument();
    });

    it('should render badge when badge is provided', () => {
      render(<TopicPortalCard {...defaultProps} badge="5" />);

      // Badge is rendered as a span with the badge content
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<TopicPortalCard {...defaultProps} />);

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-label', 'testPortal');
    });

    it('should be keyboard navigable', () => {
      render(<TopicPortalCard {...defaultProps} />);

      const card = screen.getByRole('button');
      card.focus();

      expect(document.activeElement).toBe(card);
    });
  });
});
