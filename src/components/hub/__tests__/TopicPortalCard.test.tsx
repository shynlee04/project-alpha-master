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

describe('TopicPortalCard', () => {
  const defaultProps = {
    title: 'Test Portal',
    description: 'Test description',
    icon: <div data-testid="test-icon" />,
    onClick: vi.fn(),
  };

  describe('Rendering', () => {
    it('should render card with title and description', () => {
      render(<TopicPortalCard {...defaultProps} />);
      
      expect(screen.getByText('Test Portal')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('should render icon', () => {
      render(<TopicPortalCard {...defaultProps} />);
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('should render arrow indicator', () => {
      render(<TopicPortalCard {...defaultProps} />);
      
      expect(screen.getByRole('img')).toBeInTheDocument();
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
    it('should not render badge when count is not provided', () => {
      render(<TopicPortalCard {...defaultProps} />);
      
      expect(screen.queryByTestId('portal-badge')).not.toBeInTheDocument();
    });

    it('should render badge when count is provided', () => {
      render(<TopicPortalCard {...defaultProps} badgeCount={5} />);
      
      const badge = screen.getByTestId('portal-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('5');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<TopicPortalCard {...defaultProps} />);
      
      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-label', 'Test Portal');
    });

    it('should be keyboard navigable', () => {
      render(<TopicPortalCard {...defaultProps} />);
      
      const card = screen.getByRole('button');
      card.focus();
      
      expect(document.activeElement).toBe(card);
    });
  });
});
