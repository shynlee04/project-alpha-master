/**
 * @fileoverview ActivityBar Component Tests
 * @module components/layout/__tests__/ActivityBar.test
 *
 * Tests for the ActivityBar component following 8-bit design system.
 *
 * @epic EPIC-UXUI-01
 * @story UXUI-03-14
 * @team Team B
 * @created 2026-01-28
 * @updated 2026-01-28
 */

// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActivityBar, type ActivityBarItem } from '../ActivityBar';

describe('ActivityBar', () => {
  const mockItems: ActivityBarItem[] = [
    { id: 'files', icon: '📁', label: 'Files' },
    { id: 'search', icon: '🔍', label: 'Search' },
    { id: 'git', icon: '🌿', label: 'Git', badge: 3 },
    { id: 'settings', icon: '⚙️', label: 'Settings', disabled: true },
  ];

  describe('Rendering', () => {
    it('renders with left position', () => {
      render(
        <ActivityBar
          position="left"
          items={mockItems}
        />
      );

      expect(screen.getByRole('toolbar')).toBeInTheDocument();
      expect(screen.getByLabelText('Activity bar left')).toBeInTheDocument();
    });

    it('renders with right position', () => {
      render(
        <ActivityBar
          position="right"
          items={mockItems}
        />
      );

      expect(screen.getByLabelText('Activity bar right')).toBeInTheDocument();
    });

    it('renders all items', () => {
      render(
        <ActivityBar
          position="left"
          items={mockItems}
        />
      );

      mockItems.forEach(item => {
        expect(screen.getByLabelText(item.label)).toBeInTheDocument();
      });
    });

    it('renders badges correctly', () => {
      render(
        <ActivityBar
          position="left"
          items={mockItems}
        />
      );

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('handles badge overflow (9+)', () => {
      const itemsWithLargeBadge: ActivityBarItem[] = [
        { id: 'notifications', icon: '🔔', label: 'Notifications', badge: 15 },
      ];

      render(
        <ActivityBar
          position="left"
          items={itemsWithLargeBadge}
        />
      );

      expect(screen.getByText('9+')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onItemClick when item is clicked', () => {
      const handleClick = vi.fn();
      render(
        <ActivityBar
          position="left"
          items={mockItems}
          onItemClick={handleClick}
        />
      );

      fireEvent.click(screen.getByLabelText('Files'));
      expect(handleClick).toHaveBeenCalledWith('files');
    });

    it('does not call onItemClick when disabled item is clicked', () => {
      const handleClick = vi.fn();
      render(
        <ActivityBar
          position="left"
          items={mockItems}
          onItemClick={handleClick}
        />
      );

      fireEvent.click(screen.getByLabelText('Settings'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('handles keyboard navigation (Enter key)', () => {
      const handleClick = vi.fn();
      render(
        <ActivityBar
          position="left"
          items={mockItems}
          onItemClick={handleClick}
        />
      );

      const filesButton = screen.getByLabelText('Files');
      fireEvent.keyDown(filesButton, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalledWith('files');
    });

    it('handles keyboard navigation (Space key)', () => {
      const handleClick = vi.fn();
      render(
        <ActivityBar
          position="left"
          items={mockItems}
          onItemClick={handleClick}
        />
      );

      const filesButton = screen.getByLabelText('Files');
      fireEvent.keyDown(filesButton, { key: ' ' });
      expect(handleClick).toHaveBeenCalledWith('files');
    });
  });

  describe('Active State', () => {
    it('marks active item with aria-pressed', () => {
      render(
        <ActivityBar
          position="left"
          items={mockItems}
          activeItem="files"
        />
      );

      const filesButton = screen.getByLabelText('Files');
      expect(filesButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('marks inactive items with aria-pressed="false"', () => {
      render(
        <ActivityBar
          position="left"
          items={mockItems}
          activeItem="files"
        />
      );

      const searchButton = screen.getByLabelText('Search');
      expect(searchButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Accessibility', () => {
    it('renders with correct ARIA role', () => {
      render(
        <ActivityBar
          position="left"
          items={mockItems}
        />
      );

      expect(screen.getByRole('toolbar')).toBeInTheDocument();
    });

    it('provides aria-label for accessibility', () => {
      render(
        <ActivityBar
          position="left"
          items={mockItems}
        />
      );

      const filesButton = screen.getByLabelText('Files');
      expect(filesButton).toHaveAttribute('aria-label', 'Files');
    });

    it('disabled items have correct disabled attribute', () => {
      render(
        <ActivityBar
          position="left"
          items={mockItems}
        />
      );

      const settingsButton = screen.getByLabelText('Settings');
      expect(settingsButton).toBeDisabled();
    });
  });

  describe('Custom ClassName', () => {
    it('applies custom className', () => {
      render(
        <ActivityBar
          position="left"
          items={mockItems}
          className="custom-class"
        />
      );

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toHaveClass('custom-class');
    });
  });

  describe('Empty Items', () => {
    it('renders without items', () => {
      render(
        <ActivityBar
          position="left"
          items={[]}
        />
      );

      expect(screen.getByRole('toolbar')).toBeInTheDocument();
    });
  });

  describe('ReactNode Icons', () => {
    it('renders ReactNode icons correctly', () => {
      const itemsWithReactNode: ActivityBarItem[] = [
        { id: 'custom', icon: <span data-testid="custom-icon">★</span>, label: 'Custom' },
      ];

      render(
        <ActivityBar
          position="left"
          items={itemsWithReactNode}
        />
      );

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });
});
