/**
 * TopicCard Component Tests
 *
 * Tests for topic-based onboarding card component.
 *
 * @file TopicCard.test.tsx
 * @created 2025-12-26T13:12:00Z
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TopicCard } from '../TopicCard';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      // Return the key without the namespace prefix for testing
      return key.replace('topic:', '');
    },
  }),
}));

describe('TopicCard', () => {
  const defaultProps = {
    titleKey: 'topic:testTopic',
    descriptionKey: 'topic:testDescription',
    icon: <div data-testid="test-icon" />,
    gradient: 'orange' as const,
    actionKey: 'topic:testAction',
    onAction: vi.fn(),
  };

  describe('Rendering', () => {
    it('should render card with title and description', () => {
      render(<TopicCard {...defaultProps} />);

      expect(screen.getByText('testTopic')).toBeInTheDocument();
      expect(screen.getByText('testDescription')).toBeInTheDocument();
    });

    it('should render icon', () => {
      render(<TopicCard {...defaultProps} />);

      // Component clones icon in two places, so check for at least one
      const icons = screen.getAllByTestId('test-icon');
      expect(icons.length).toBeGreaterThanOrEqual(1);
    });

    it('should render action button', () => {
      render(<TopicCard {...defaultProps} />);

      expect(screen.getByText('testAction')).toBeInTheDocument();
    });

    it('should apply gradient class', () => {
      const { container } = render(<TopicCard {...defaultProps} />);

      expect(container.firstChild).toHaveClass(/gradient-orange/);
    });
  });

  describe('Interactions', () => {
    it('should call onAction when action button is clicked', () => {
      const onAction = vi.fn();
      render(<TopicCard {...defaultProps} onAction={onAction} />);

      // Action button has aria-label matching the action text
      const actionButton = screen.getByRole('button', { name: /testAction/i });
      actionButton.click();

      expect(onAction).toHaveBeenCalledTimes(1);
    });

    it('should have hover effect', () => {
      const { container } = render(<TopicCard {...defaultProps} />);

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass(/hover:/);
    });
  });

  describe('Gradient Variants', () => {
    it('should apply orange gradient', () => {
      const { container } = render(<TopicCard {...defaultProps} gradient="orange" />);

      expect(container.firstChild).toHaveClass(/gradient-orange/);
    });

    it('should apply coral gradient', () => {
      const { container } = render(<TopicCard {...defaultProps} gradient="coral" />);

      expect(container.firstChild).toHaveClass(/gradient-coral/);
    });

    it('should apply teal gradient', () => {
      const { container } = render(<TopicCard {...defaultProps} gradient="teal" />);

      expect(container.firstChild).toHaveClass(/gradient-teal/);
    });

    it('should apply purple gradient', () => {
      const { container } = render(<TopicCard {...defaultProps} gradient="purple" />);

      expect(container.firstChild).toHaveClass(/gradient-purple/);
    });

    it('should apply blue gradient', () => {
      const { container } = render(<TopicCard {...defaultProps} gradient="blue" />);

      expect(container.firstChild).toHaveClass(/gradient-blue/);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<TopicCard {...defaultProps} />);

      // Card container has role="button" with aria-label
      const card = screen.getByRole('button', { name: /testTopic/i });
      expect(card).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(<TopicCard {...defaultProps} />);

      // Card container is the main focusable element (has tabIndex=0)
      const card = screen.getByRole('button', { name: /testTopic/i });
      card.focus();

      expect(document.activeElement).toBe(card);
    });
  });
});
