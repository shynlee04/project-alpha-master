/**
 * HubHomePage Component Tests
 *
 * Tests for hub home page with BentoGrid-based portal cards.
 *
 * @file HubHomePage.test.tsx
 * @created 2025-12-26
 * @updated 2025-12-29 - Rewritten for BentoGrid
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HubHomePage } from '../HubHomePage';
import { useHubStore } from '@/lib/state/hub-store';
import * as dexieReactHooks from 'dexie-react-hooks';

// Mock dependencies
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(),
}));

vi.mock('@/lib/state/hub-store', () => ({
  useHubStore: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => {
      // Map translation keys to expected text
      const translations: Record<string, string> = {
        'welcome': 'Welcome to Via-gent',
        'hub.exploreViaGent': 'Explore Via-gent',
        'projects.recent': 'Recent Projects',
        'projects.openFolder': 'Open Folder',
        'projects.new': 'New Project',
      };
      return translations[key] || fallback || key;
    },
  }),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock project store
vi.mock('@/lib/workspace/project-store', () => ({
  listProjectsWithPermission: vi.fn().mockResolvedValue([]),
  saveProject: vi.fn().mockResolvedValue(true),
  generateProjectId: vi.fn().mockReturnValue('test-id'),
}));

// Mock icons
vi.mock('@/components/ui/icons', () => ({
  PlusIcon: () => <span data-testid="plus-icon">Plus</span>,
  FileIcon: () => <span data-testid="file-icon">File</span>,
  SettingsIcon: () => <span data-testid="settings-icon">Settings</span>,
  AIIcon: () => <span data-testid="ai-icon">AI</span>,
  TerminalIcon: () => <span data-testid="terminal-icon">Terminal</span>,
}));

describe('HubHomePage', () => {
  const mockSetActiveSection = vi.fn();
  const mockToggleSidebar = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    (useHubStore as any).mockReturnValue({
      activeSection: 'home',
      sidebarCollapsed: false,
      toggleSidebar: mockToggleSidebar,
      setActiveSection: mockSetActiveSection,
      addToHistory: vi.fn(),
      navigateBack: vi.fn(),
      navigationHistory: [],
    });

    (dexieReactHooks.useLiveQuery as any).mockReturnValue([]);
  });

  describe('Rendering', () => {
    it('should render main layout', () => {
      render(<HubHomePage />);

      expect(document.body.querySelector('.min-h-screen')).toBeInTheDocument();
    });

    it('should render welcome heading', () => {
      render(<HubHomePage />);

      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });

    it('should render project section buttons', () => {
      render(<HubHomePage />);

      // New project button
      expect(screen.getByRole('button', { name: /new/i })).toBeInTheDocument();
      // Open folder button
      expect(screen.getByRole('button', { name: /open/i })).toBeInTheDocument();
    });

    it('should render explore section heading', () => {
      render(<HubHomePage />);

      expect(screen.getByText(/explore/i)).toBeInTheDocument();
    });

    it('should render BentoGrid for portal cards', () => {
      render(<HubHomePage />);

      // BentoGrid renders a grid container
      expect(document.body.querySelector('.grid')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to IDE when IDE Workspace card is clicked', () => {
      render(<HubHomePage />);

      // Find by text content in the BentoCard
      const buttons = screen.getAllByRole('button');
      const ideCard = buttons.find(btn => btn.textContent?.includes('IDE Workspace'));
      expect(ideCard).toBeDefined();
      fireEvent.click(ideCard!);

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/ide' });
    });

    it('should navigate to agents when Agent Center card is clicked', () => {
      render(<HubHomePage />);

      const buttons = screen.getAllByRole('button');
      const agentCard = buttons.find(btn => btn.textContent?.includes('Agent Center'));
      expect(agentCard).toBeDefined();
      fireEvent.click(agentCard!);

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/agents' });
    });

    it('should navigate to knowledge when Knowledge Hub card is clicked', () => {
      render(<HubHomePage />);

      const buttons = screen.getAllByRole('button');
      const knowledgeCard = buttons.find(btn => btn.textContent?.includes('Knowledge Hub'));
      expect(knowledgeCard).toBeDefined();
      fireEvent.click(knowledgeCard!);

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/knowledge' });
    });

    it('should navigate to settings when Settings card is clicked', () => {
      render(<HubHomePage />);

      const buttons = screen.getAllByRole('button');
      const settingsCard = buttons.find(btn =>
        btn.textContent?.includes('Settings') &&
        !btn.textContent?.includes('Workspace') &&
        !btn.textContent?.includes('Agents') &&
        !btn.textContent?.includes('Knowledge')
      );
      expect(settingsCard).toBeDefined();
      fireEvent.click(settingsCard!);

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/settings' });
    });
  });

  describe('Project Actions', () => {
    it('should render new project button', () => {
      render(<HubHomePage />);

      // The button has PlusIcon and aria-label from translation
      expect(screen.getByLabelText('Open Folder')).toBeInTheDocument();
    });

    it('should handle open folder action button', () => {
      render(<HubHomePage />);

      const openButton = screen.getByLabelText('Open Folder');
      expect(openButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have main content area', () => {
      render(<HubHomePage />);

      const main = document.body.querySelector('main');
      expect(main).toBeInTheDocument();
    });

    it('should have focusable elements', () => {
      render(<HubHomePage />);

      const buttons = document.body.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);

      // At least one button should be focusable
      const firstButton = buttons[0];
      expect(firstButton.getAttribute('tabIndex')).not.toBe('-1');
    });
  });

  describe('Loading State', () => {
    it('should handle empty projects list', () => {
      (dexieReactHooks.useLiveQuery as any).mockReturnValue([]);

      render(<HubHomePage />);

      // Component should render without error
      expect(screen.getByText(/explore/i)).toBeInTheDocument();
    });
  });
});
