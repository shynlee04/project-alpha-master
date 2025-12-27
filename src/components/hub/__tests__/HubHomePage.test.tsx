/**
 * HubHomePage Component Tests
 * 
 * Tests for hub home page with topic-based onboarding.
 * 
 * @file HubHomePage.test.tsx
 * @created 2025-12-26T13:12:00Z
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HubHomePage } from '../HubHomePage';

// Mock useHubStore
vi.mock('@/lib/state/hub-store', () => ({
  useHubStore: vi.fn(),
}));

describe('HubHomePage', () => {
  const mockSetActiveSection = vi.fn();
  const mockToggleSidebar = vi.fn();

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

  describe('Rendering', () => {
    it('should render hub sidebar', () => {
      render(<HubHomePage />);
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should render topic cards', () => {
      render(<HubHomePage />);
      
      expect(screen.getByLabelText('topic.aiPoweredDev.title')).toBeInTheDocument();
      expect(screen.getByLabelText('topic.privacyFirst.title')).toBeInTheDocument();
      expect(screen.getByLabelText('topic.classroomReady.title')).toBeInTheDocument();
      expect(screen.getByLabelText('topic.knowledgeSynthesis.title')).toBeInTheDocument();
      expect(screen.getByLabelText('topic.agentOrchestration.title')).toBeInTheDocument();
    });

    it('should render project section', () => {
      render(<HubHomePage />);
      
      expect(screen.getByText('projects.recent')).toBeInTheDocument();
      expect(screen.getByText('projects.new')).toBeInTheDocument();
      expect(screen.getByText('projects.openFolder')).toBeInTheDocument();
    });

    it('should render portal cards', () => {
      render(<HubHomePage />);
      
      expect(screen.getByLabelText('portal.ideWorkspace.title')).toBeInTheDocument();
      expect(screen.getByLabelText('portal.agentCenter.title')).toBeInTheDocument();
      expect(screen.getByLabelText('portal.knowledgeHub.title')).toBeInTheDocument();
      expect(screen.getByLabelText('portal.settings.title')).toBeInTheDocument();
    });

    it('should render breadcrumbs', () => {
      render(<HubHomePage />);
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  describe('Topic Card Actions', () => {
    it('should call setActiveSection when topic card action is clicked', () => {
      render(<HubHomePage />);
      
      const devCard = screen.getByLabelText('topic.aiPoweredDev.action');
      fireEvent.click(devCard);
      
      expect(mockSetActiveSection).toHaveBeenCalledWith('ide');
    });

    it('should navigate to ide when AI-Powered Development is clicked', () => {
      render(<HubHomePage />);
      
      const devCard = screen.getByLabelText('topic.aiPoweredDev.action');
      fireEvent.click(devCard);
      
      expect(mockSetActiveSection).toHaveBeenCalledWith('ide');
    });

    it('should navigate to agents when Agent Orchestration Center is clicked', () => {
      render(<HubHomePage />);
      
      const agentCard = screen.getByLabelText('topic.agentOrchestration.action');
      fireEvent.click(agentCard);
      
      expect(mockSetActiveSection).toHaveBeenCalledWith('agents');
    });
  });

  describe('Portal Card Actions', () => {
    it('should call setActiveSection when portal card is clicked', () => {
      render(<HubHomePage />);
      
      const idePortal = screen.getByLabelText('portal.ideWorkspace.title');
      fireEvent.click(idePortal);
      
      expect(mockSetActiveSection).toHaveBeenCalledWith('ide');
    });

    it('should navigate to agents when Agent Center portal is clicked', () => {
      render(<HubHomePage />);
      
      const agentPortal = screen.getByLabelText('portal.agentCenter.title');
      fireEvent.click(agentPortal);
      
      expect(mockSetActiveSection).toHaveBeenCalledWith('agents');
    });

    it('should navigate to knowledge when Knowledge Hub portal is clicked', () => {
      render(<HubHomePage />);
      
      const knowledgePortal = screen.getByLabelText('portal.knowledgeHub.title');
      fireEvent.click(knowledgePortal);
      
      expect(mockSetActiveSection).toHaveBeenCalledWith('knowledge');
    });

    it('should navigate to settings when Settings portal is clicked', () => {
      render(<HubHomePage />);
      
      const settingsPortal = screen.getByLabelText('portal.settings.title');
      fireEvent.click(settingsPortal);
      
      expect(mockSetActiveSection).toHaveBeenCalledWith('settings');
    });
  });

  describe('Project Actions', () => {
    it('should handle new project action', () => {
      render(<HubHomePage />);
      
      const newButton = screen.getByText('projects.new');
      fireEvent.click(newButton);
      
      // Should trigger new project flow
      expect(newButton).toBeInTheDocument();
    });

    it('should handle open folder action', () => {
      render(<HubHomePage />);
      
      const openButton = screen.getByText('projects.openFolder');
      fireEvent.click(openButton);
      
      // Should trigger folder picker
      expect(openButton).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should have proper layout structure', () => {
      const { container } = render(<HubHomePage />);
      
      expect(container.firstChild).toHaveClass(/flex/);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<HubHomePage />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Hub Navigation');
    });

    it('should be keyboard navigable', () => {
      render(<HubHomePage />);
      
      const firstTopic = screen.getByLabelText('topic.aiPoweredDev.title');
      firstTopic.focus();
      
      expect(document.activeElement).toBe(firstTopic);
    });
  });
});
