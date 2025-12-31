/**
 * HubHomePage Component Tests
 *
 * Tests for hub home page with BentoGrid-based portal cards.
 *
 * @file HubHomePage.test.tsx
 * @created 2025-12-26
 * @updated 2025-12-31 - Updated for Retro-Tech overhaul
 */

import { render, screen, fireEvent, act } from '@testing-library/react';
import { HubHomePage } from '../HubHomePage';
import * as dexieReactHooks from 'dexie-react-hooks';
import * as useMediaQuery from '@/hooks/useMediaQuery'; // Mock hook

// Mock dependencies
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(),
}));

// Mock layout store
vi.mock('@/stores/layoutStore', () => ({
  useLayoutStore: () => ({
    setMobileMenuOpen: vi.fn(),
  }),
}));

// Mock media query hook
vi.mock('@/hooks/useMediaQuery', () => ({
  useDeviceType: () => ({ isMobile: false }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => {
      // Map translation keys to specific test values if needed, otherwise return key or fallback
      const translations: Record<string, string> = {
        'hub.welcome': 'INITIALIZING SYSTEM...',
        'hub.menu.workspace': 'WORKSPACE_MOUNT',
        'hub.menu.agents': 'NEURAL_AGENTS',
        'hub.menu.knowledge': 'DATA_BANK',
        'hub.menu.settings': 'CONFIG_SYS',
        'hub.recentProjects': 'RECENT_DIRECTORIES',
        'hub.recent.title': 'RECENT_DIRECTORIES',
        'hub.actions.viewAll': 'VIEW_ALL >>',
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

// Mock db
vi.mock('@/lib/state/dexie-db', () => ({
  db: {
    projects: {
      toArray: vi.fn().mockResolvedValue([]),
    },
  },
}));

describe('HubHomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    (dexieReactHooks.useLiveQuery as any).mockReturnValue([]);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const skipBootSequence = () => {
    act(() => {
      vi.runAllTimers();
    });
  };

  describe('Rendering', () => {
    it('should render boot sequence initially', () => {
      render(<HubHomePage />);
      expect(screen.getByText(/BIOS CHECK... OK/i)).toBeInTheDocument();
    });

    it('should render main content after boot', () => {
      render(<HubHomePage />);

      skipBootSequence();

      expect(screen.getByText('INITIALIZING SYSTEM...')).toBeInTheDocument();
      expect(screen.getByText('WORKSPACE_MOUNT')).toBeInTheDocument();
    });

    it('should render all bento cards', () => {
      render(<HubHomePage />);
      skipBootSequence();

      expect(screen.getByText('NEURAL_AGENTS')).toBeInTheDocument();
      expect(screen.getByText('DATA_BANK')).toBeInTheDocument();
      expect(screen.getByText('CONFIG_SYS')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to workspace when Workspace card is clicked', () => {
      render(<HubHomePage />);
      skipBootSequence();

      const card = screen.getByText('WORKSPACE_MOUNT');
      fireEvent.click(card);

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/workspace' });
    });

    it('should navigate to agents when Agents card is clicked', () => {
      render(<HubHomePage />);
      skipBootSequence();

      const card = screen.getByText('NEURAL_AGENTS');
      fireEvent.click(card);

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/agents' });
    });
  });

  describe('Recent Projects', () => {
    it('should render empty state when no projects', () => {
      render(<HubHomePage />);
      skipBootSequence();

      expect(screen.getByText('RECENT_DIRECTORIES')).toBeInTheDocument();
      // Expect empty state message (using default key/fallback from mock if specific key not providing text)
      // The component uses t('hub.noProjects', 'No directories found...')
      // Our mock returns 'hub.noProjects' or the fallback.
      expect(screen.getByText(/No directories found/i)).toBeInTheDocument();
    });

    it('should render project list when projects exist', () => {
      const mockProjects = [
        { id: '1', name: 'Project Alpha', updatedAt: new Date(), lastOpened: new Date() },
        { id: '2', name: 'Project Beta', updatedAt: new Date(Date.now() - 10000), lastOpened: new Date() }
      ];
      (dexieReactHooks.useLiveQuery as any).mockReturnValue(mockProjects);

      render(<HubHomePage />);
      skipBootSequence();

      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
      expect(screen.getByText('Project Beta')).toBeInTheDocument();
    });
  });
});
