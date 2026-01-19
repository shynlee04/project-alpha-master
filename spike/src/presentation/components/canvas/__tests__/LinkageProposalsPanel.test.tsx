/**
 * @fileoverview Linkage Proposals Panel Tests
 * @module components/canvas/__tests__/LinkageProposalsPanel.test.tsx
 * @governance EPIC-38, STORY-38-4
 *
 * Integration tests for AI-powered linkage discovery and proposal management.
 * Validates Use Case 2: Canvas Linkage Discovery flow.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import { LinkageProposalsPanel } from '../LinkageProposalsPanel';
import type { LinkageProposal } from '@/lib/canvas/linkage-types';
import type { Node } from '@xyflow/react';

// ============================================================
// MOCKS - Must be at the top before any imports
// ============================================================

// Mock window.matchMedia first - before any imports that might use it
const mockMatchMedia = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

// ============================================================
// TEST DATA
// ============================================================

const mockNodes: Node[] = [
  { id: 'node-1', type: 'source', data: { title: 'Calculus Basics' } },
  { id: 'node-2', type: 'source', data: { title: 'Physics Mechanics' } },
  { id: 'node-3', type: 'concept', data: { title: 'Derivatives' } },
];

const mockLinkageProposals: LinkageProposal[] = [
  {
    id: 'proposal-1',
    sourceNodeId: 'node-1',
    targetNodeId: 'node-3',
    linkageType: 'conceptual',
    confidence: 0.85,
    rationale: 'These nodes share 3 concepts/keywords: calculus, derivatives, mathematics',
    evidence: ['calculus', 'derivatives', 'mathematics'],
    suggestedLabel: 'Related: calculus',
    suggestedRelationship: 'relates',
    reviewed: false,
    createdAt: Date.now(),
  },
  {
    id: 'proposal-2',
    sourceNodeId: 'node-2',
    targetNodeId: 'node-3',
    linkageType: 'sequential',
    confidence: 0.65,
    rationale: 'These nodes share 2 concepts/keywords: physics, motion',
    evidence: ['physics', 'motion'],
    suggestedLabel: 'Builds on: physics',
    suggestedRelationship: 'supports',
    reviewed: false,
    createdAt: Date.now(),
  },
  {
    id: 'proposal-3',
    sourceNodeId: 'node-1',
    targetNodeId: 'node-2',
    linkageType: 'contrastive',
    confidence: 0.45,
    rationale: 'These nodes share 1 concept/keyword: applications',
    evidence: ['applications'],
    suggestedLabel: 'Contrasts: applications',
    suggestedRelationship: 'extends',
    reviewed: false,
    createdAt: Date.now(),
  },
];

// ============================================================
// MOCKS
// ============================================================

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

// Mock @xyflow/react Panel
vi.mock('@xyflow/react', () => ({
  Panel: ({ children, position }: { children: React.ReactNode; position?: string }) => (
    <div data-testid={`panel-${position || 'default'}`}>{children}</div>
  ),
}));

// Mock useCanvasStore
const mockAcceptProposal = vi.fn();
const mockDismissProposal = vi.fn();
const mockClearProposals = vi.fn();
const mockGenerateLinkageProposals = vi.fn();

vi.mock('@/infrastructure/persistence/stores', () => ({
  useCanvasStore: vi.fn(() => ({
    linkageProposals: mockLinkageProposals,
    nodes: mockNodes,
    acceptProposal: mockAcceptProposal,
    dismissProposal: mockDismissProposal,
    clearProposals: mockClearProposals,
    generateLinkageProposals: mockGenerateLinkageProposals,
  })),
}));

// Mock UI components
vi.mock('../../ui/button', () => ({
  Button: ({ children, onClick, className, size, variant }: any) => (
    <button
      onClick={onClick}
      className={className}
      data-size={size}
      data-variant={variant}
    >
      {children}
    </button>
  ),
}));

vi.mock('../../ui/pixel-badge', () => ({
  PixelBadge: ({ children, className, size, variant }: any) => (
    <span className={className} data-size={size} data-variant={variant}>
      {children}
    </span>
  ),
}));

// ============================================================
// TEST SUITES
// ============================================================

describe('LinkageProposalsPanel - Use Case 2 Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Scenario 1: Canvas with 3+ nodes triggers proposal generation', () => {
    it('should display proposal count badge', () => {
      render(<LinkageProposalsPanel />);

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should show title "Linkage Proposals"', () => {
      render(<LinkageProposalsPanel />);

      expect(screen.getByText('Linkage Proposals')).toBeInTheDocument();
    });
  });

  describe('Scenario 2: Connection recommendations appear and are categorized', () => {
    it('should display all proposals with correct types', () => {
      render(<LinkageProposalsPanel />);

      expect(screen.getByText('Conceptual')).toBeInTheDocument();
      expect(screen.getByText('Sequential')).toBeInTheDocument();
      expect(screen.getByText('Contrastive')).toBeInTheDocument();
    });

    it('should show confidence scores with percentages', () => {
      render(<LinkageProposalsPanel />);

      expect(screen.getByText(/High.*85%/)).toBeInTheDocument();
      expect(screen.getByText(/Medium.*65%/)).toBeInTheDocument();
      expect(screen.getByText(/Low.*45%/)).toBeInTheDocument();
    });

    it('should display rationale for each proposal', () => {
      render(<LinkageProposalsPanel />);

      expect(screen.getByText(/share 3 concepts/)).toBeInTheDocument();
      expect(screen.getByText(/share 2 concepts/)).toBeInTheDocument();
      expect(screen.getByText(/share 1 concept/)).toBeInTheDocument();
    });

    it('should show evidence keywords', () => {
      render(<LinkageProposalsPanel />);

      expect(screen.getByText(/calculus, derivatives/)).toBeInTheDocument();
      expect(screen.getByText(/physics, motion/)).toBeInTheDocument();
    });
  });

  describe('Scenario 3: Accept conceptual link', () => {
    it('should call acceptProposal when accept button clicked', async () => {
      render(<LinkageProposalsPanel />);

      const acceptButtons = screen.getAllByText('Accept');
      expect(acceptButtons.length).toBeGreaterThan(0);

      fireEvent.click(acceptButtons[0]);

      expect(mockAcceptProposal).toHaveBeenCalledWith('proposal-1');
    });
  });

  describe('Scenario 4: Dismiss irrelevant proposal', () => {
    it('should call dismissProposal when dismiss button clicked', async () => {
      render(<LinkageProposalsPanel />);

      const dismissButtons = screen.getAllByText('Dismiss');
      expect(dismissButtons.length).toBeGreaterThan(0);

      fireEvent.click(dismissButtons[0]);

      expect(mockDismissProposal).toHaveBeenCalledWith('proposal-1');
    });
  });

  describe('Scenario 5: Bulk accept/dismiss all', () => {
    it('should accept all filtered proposals when bulk accept clicked', async () => {
      render(<LinkageProposalsPanel />);

      const acceptAllButton = screen.getByText('Accept All');
      fireEvent.click(acceptAllButton);

      expect(mockAcceptProposal).toHaveBeenCalledTimes(3);
    });

    it('should dismiss all filtered proposals when bulk dismiss clicked', async () => {
      render(<LinkageProposalsPanel />);

      const dismissAllButton = screen.getByText('Dismiss All');
      fireEvent.click(dismissAllButton);

      expect(mockDismissProposal).toHaveBeenCalledTimes(3);
    });
  });

  describe('Scenario 6: Filter by linkage type', () => {
    it('should filter proposals to show only conceptual', () => {
      render(<LinkageProposalsPanel />);

      const conceptualFilter = screen.getAllByText('Conceptual');
      fireEvent.click(conceptualFilter[1]); // Click the filter button, not the badge

      expect(screen.getByText('Conceptual')).toBeInTheDocument();
    });

    it('should show all proposals when "All" filter selected', () => {
      render(<LinkageProposalsPanel />);

      const allFilter = screen.getByText('All').closest('button');
      fireEvent.click(allFilter!);

      // All 3 proposals should be visible
      expect(screen.getByText('Conceptual')).toBeInTheDocument();
      expect(screen.getByText('Sequential')).toBeInTheDocument();
      expect(screen.getByText('Contrastive')).toBeInTheDocument();
    });
  });

  describe('Scenario 7: Panel controls', () => {
    it('should collapse panel when collapse button clicked', () => {
      render(<LinkageProposalsPanel />);

      const collapseButton = screen.getByText('▼');
      fireEvent.click(collapseButton);

      // Panel should collapse
      expect(screen.queryByText('Accept')).not.toBeInTheDocument();
    });

    it('should expand panel when expand button clicked', () => {
      render(<LinkageProposalsPanel />);

      // First collapse
      const collapseButton = screen.getByText('▼');
      fireEvent.click(collapseButton);

      // Then expand
      const expandButton = screen.getByText('▶');
      fireEvent.click(expandButton);

      // Proposals should be visible again
      expect(screen.getByText('Accept')).toBeInTheDocument();
    });

    it('should clear all proposals when clear button clicked', () => {
      render(<LinkageProposalsPanel />);

      const clearButton = screen.getByText('✕');
      fireEvent.click(clearButton);

      expect(mockClearProposals).toHaveBeenCalled();
    });
  });
});

describe('LinkageProposalsPanel - Integration with Canvas Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should integrate with useCanvasStore for state management', () => {
    render(<LinkageProposalsPanel />);

    // Verify initial render
    expect(screen.getByText('Linkage Proposals')).toBeInTheDocument();
  });
});
