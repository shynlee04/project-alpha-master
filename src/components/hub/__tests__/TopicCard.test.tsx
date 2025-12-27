/**
 * TopicCard Component Tests
 * 
 * Tests for topic-based onboarding card component.
 * 
 * @file TopicCard.test.tsx
 * @created 2025-12-26T13:12:00Z
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TopicCard } from '../TopicCard';

describe('TopicCard', () => {
  const defaultProps = {
    title: 'Test Topic',
    description: 'Test description',
    icon: <div data-testid="test-icon" />,
    gradient: 'orange',
    action: 'Test Action',
    onAction: vi.fn(),
  };

  describe('Rendering', () => {
    it('should render card with title and description', () => {
      render(<TopicCard {...defaultProps} />);
      
      expect(screen.getByText('Test Topic')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('should render icon', () => {
      render(<TopicCard {...defaultProps} />);
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('should render action button', () => {
      render(<TopicCard {...defaultProps} />);
      
      expect(screen.getByText('Test Action')).toBeInTheDocument();
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
      
      const actionButton = screen.getByText('Test Action');
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
      
      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-label', 'Test Topic');
    });

    it('should be keyboard navigable', () => {
      render(<TopicCard {...defaultProps} />);
      
      const actionButton = screen.getByRole('button');
      actionButton.focus();
      
      expect(document.activeElement).toBe(actionButton);
    });
  });
});
