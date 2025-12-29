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

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
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

      const actionButton = screen.getByRole('button');
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

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-label', 'testTopic');
    });

    it('should be keyboard navigable', () => {
      render(<TopicCard {...defaultProps} />);

      const card = screen.getByRole('button');
      card.focus();

      expect(document.activeElement).toBe(card);
    });
  });
});
