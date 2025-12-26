/**
 * HubSidebar Component Tests
 * 
 * Tests for the collapsible sidebar navigation component.
 * 
 * @file HubSidebar.test.tsx
 * @created 2025-12-26T13:10:00Z
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HubSidebar } from '../HubSidebar';
import { useHubStore } from '@/lib/state/hub-store';

// Mock the hub store
vi.mock('@/lib/state/hub-store', () => ({
  useHubStore: vi.fn(),
}));

describe('HubSidebar', () => {
  const mockToggleSidebar = vi.fn();
  const mockSetActiveSection = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useHubStore as any).mockReturnValue({
      activeSection: 'home',
      sidebarCollapsed: false,
      toggleSidebar: mockToggleSidebar,
      setActiveSection: mockSetActiveSection,
      addToHistory: vi.fn(),
      navigateBack: vi.fn(),
      navigationHistory: [],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render sidebar with navigation items', () => {
      render(<HubSidebar />);
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should render all navigation items', () => {
      render(<HubSidebar />);
      
      expect(screen.getByLabelText('hub.home')).toBeInTheDocument();
      expect(screen.getByLabelText('hub.ide')).toBeInTheDocument();
      expect(screen.getByLabelText('hub.agents')).toBeInTheDocument();
      expect(screen.getByLabelText('hub.knowledge')).toBeInTheDocument();
      expect(screen.getByLabelText('hub.settings')).toBeInTheDocument();
    });

    it('should show labels when sidebar is expanded', () => {
      (useHubStore as any).mockReturnValue({
        activeSection: 'home',
        sidebarCollapsed: false,
        toggleSidebar: mockToggleSidebar,
        setActiveSection: mockSetActiveSection,
        addToHistory: vi.fn(),
        navigateBack: vi.fn(),
        navigationHistory: [],
      });

      render(<HubSidebar />);
      
      expect(screen.getByText('hub.home')).toBeInTheDocument();
      expect(screen.getByText('hub.ide')).toBeInTheDocument();
    });

    it('should hide labels when sidebar is collapsed', () => {
      (useHubStore as any).mockReturnValue({
        activeSection: 'home',
        sidebarCollapsed: true,
        toggleSidebar: mockToggleSidebar,
        setActiveSection: mockSetActiveSection,
        addToHistory: vi.fn(),
        navigateBack: vi.fn(),
        navigationHistory: [],
      });

      render(<HubSidebar />);
      
      // Labels should be hidden when collapsed
      expect(screen.queryByText('hub.home')).not.toBeInTheDocument();
      expect(screen.queryByText('hub.ide')).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should call setActiveSection when navigation item is clicked', () => {
      render(<HubSidebar />);
      
      const homeButton = screen.getByLabelText('hub.home');
      fireEvent.click(homeButton);
      
      expect(mockSetActiveSection).toHaveBeenCalledWith('home');
    });

    it('should highlight active section', () => {
      (useHubStore as any).mockReturnValue({
        activeSection: 'ide',
        sidebarCollapsed: false,
        toggleSidebar: mockToggleSidebar,
        setActiveSection: mockSetActiveSection,
        addToHistory: vi.fn(),
        navigateBack: vi.fn(),
        navigationHistory: [],
      });

      render(<HubSidebar />);
      
      const ideButton = screen.getByLabelText('hub.ide');
      expect(ideButton).toHaveClass(/active/);
    });
  });

  describe('Collapse/Expand', () => {
    it('should call toggleSidebar when collapse button is clicked', () => {
      render(<HubSidebar />);
      
      const collapseButton = screen.getByLabelText('hub.sidebar.toggle');
      fireEvent.click(collapseButton);
      
      expect(mockToggleSidebar).toHaveBeenCalled();
    });

    it('should show collapse button when expanded', () => {
      (useHubStore as any).mockReturnValue({
        activeSection: 'home',
        sidebarCollapsed: false,
        toggleSidebar: mockToggleSidebar,
        setActiveSection: mockSetActiveSection,
        addToHistory: vi.fn(),
        navigateBack: vi.fn(),
        navigationHistory: [],
      });

      render(<HubSidebar />);
      
      expect(screen.getByLabelText('hub.sidebar.collapse')).toBeInTheDocument();
    });

    it('should show expand button when collapsed', () => {
      (useHubStore as any).mockReturnValue({
        activeSection: 'home',
        sidebarCollapsed: true,
        toggleSidebar: mockToggleSidebar,
        setActiveSection: mockSetActiveSection,
        addToHistory: vi.fn(),
        navigateBack: vi.fn(),
        navigationHistory: [],
      });

      render(<HubSidebar />);
      
      expect(screen.getByLabelText('hub.sidebar.expand')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<HubSidebar />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Hub Navigation');
    });

    it('should be keyboard navigable', () => {
      render(<HubSidebar />);
      
      const homeButton = screen.getByLabelText('hub.home');
      homeButton.focus();
      
      expect(document.activeElement).toBe(homeButton);
    });
  });
});
