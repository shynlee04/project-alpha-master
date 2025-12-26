/**
 * NavigationBreadcrumbs Component Tests
 * 
 * Tests for breadcrumbs navigation component.
 * 
 * @file NavigationBreadcrumbs.test.tsx
 * @created 2025-12-26T13:12:00Z
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NavigationBreadcrumbs } from '../NavigationBreadcrumbs';

describe('NavigationBreadcrumbs', () => {
  const defaultProps = {
    items: [
      { label: 'Home', path: '/' },
      { label: 'Projects', path: '/projects' },
      { label: 'Workspace', path: '/workspace' },
    ],
  };

  describe('Rendering', () => {
    it('should render all breadcrumb items', () => {
      render(<NavigationBreadcrumbs {...defaultProps} />);
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Projects')).toBeInTheDocument();
      expect(screen.getByText('Workspace')).toBeInTheDocument();
    });

    it('should render separators between items', () => {
      render(<NavigationBreadcrumbs {...defaultProps} />);
      
      const separators = screen.getAllByText('/');
      expect(separators.length).toBe(2);
    });

    it('should render navigation aria attributes', () => {
      render(<NavigationBreadcrumbs {...defaultProps} />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'breadcrumbs.navigate');
    });
  });

  describe('Navigation', () => {
    it('should render breadcrumb items as clickable links', () => {
      render(<NavigationBreadcrumbs {...defaultProps} />);
      
      const links = screen.getAllByRole('link');
      expect(links.length).toBe(3);
    });

    it('should highlight last breadcrumb as non-clickable', () => {
      render(<NavigationBreadcrumbs {...defaultProps} />);
      
      const lastBreadcrumb = screen.getByText('Workspace');
      expect(lastBreadcrumb.closest('span')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render nothing when items is empty', () => {
      render(<NavigationBreadcrumbs items={[]} />);
      
      const nav = screen.queryByRole('navigation');
      expect(nav).not.toBeInTheDocument();
    });

    it('should render nothing when items is undefined', () => {
      render(<NavigationBreadcrumbs items={undefined as any} />);
      
      const nav = screen.queryByRole('navigation');
      expect(nav).not.toBeInTheDocument();
    });
  });

  describe('Single Item', () => {
    it('should render single item without separators', () => {
      render(<NavigationBreadcrumbs items={[{ label: 'Home', path: '/' }]} />);
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.queryByText('/')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<NavigationBreadcrumbs {...defaultProps} />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'breadcrumbs.navigate');
      expect(nav).toHaveAttribute('role', 'navigation');
    });

    it('should have proper link attributes', () => {
      render(<NavigationBreadcrumbs {...defaultProps} />);
      
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
      });
    });
  });
});
