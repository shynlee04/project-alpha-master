/**
 * @fileoverview Canvas Linkage Activity Recording Slice
 * @module infrastructure/persistence/stores/canvas/slices/canvas-linkage-slice
 * @governance S-012-a (God Store Elimination)
 *
 * Canvas linkage proposal generation and management.
 * Part of canvas-store.ts refactoring to eliminate god store anti-pattern.
 *
 * Responsibility:
 * - Generate linkage proposals using linkage analyzer
 * - Accept/dismiss proposals
 * - Clear proposals
 *
 * Line Count: ~80 (target: ≤120 lines)
 *
 * @see aggregation: canvas/index.ts (unified store)
 */

import type { StateCreator } from 'zustand';
import type { LinkageProposal } from '@/lib/canvas/linkage-types';
import type { CanvasStoreState } from '@/lib/canvas/types';
import { createLinkageAnalyzer } from '@/lib/canvas/linkage-analyzer';

/**
 * Canvas linkage slice interface
 */
export interface CanvasLinkageSlice {
  linkageProposals: LinkageProposal[];

  // Operations
  setProposals: (proposals: LinkageProposal[]) => void;
  generateLinkageProposals: () => Promise<void>;
  acceptProposal: (proposalId: string) => void;
  dismissProposal: (proposalId: string) => void;
  clearProposals: () => void;
}

/**
 * Canvas linkage slice creator
 */
export const createCanvasLinkageSlice: StateCreator<CanvasStoreState & CanvasLinkageSlice> = (set, get) => ({
  linkageProposals: [],

  setProposals: (proposals: LinkageProposal[]) => set({ linkageProposals: proposals }),

  generateLinkageProposals: async () => {
    const { nodes } = get();

    // Only analyze if we have 3+ nodes
    if (nodes.length < 3) {
      set({ linkageProposals: [] });
      return;
    }

    try {
      const analyzer = createLinkageAnalyzer({ useAI: false });
      const analysis = await analyzer.analyze(nodes);
      set({ linkageProposals: analysis.proposals });
    } catch (error) {
      console.error('Failed to generate linkage proposals:', error);
      set({ linkageProposals: [] });
    }
  },

  acceptProposal: (proposalId: string) => {
    const { linkageProposals, edges } = get() as CanvasLinkageSlice & { edges: Edge<any>[] };
    const proposal = linkageProposals.find((p) => p.id === proposalId);

    if (!proposal) return;

    // Create edge from proposal
    const newEdge = {
      id: `edge-${proposal.sourceNodeId}-${proposal.targetNodeId}-${Date.now()}`,
      source: proposal.sourceNodeId,
      target: proposal.targetNodeId,
      type: 'relationship' as const,
      label: proposal.suggestedLabel,
      data: {
        relationship: proposal.suggestedRelationship,
        confidence: proposal.confidence,
      },
      animated: true,
    };

    set({
      edges: [...edges, newEdge],
      linkageProposals: linkageProposals.filter((p) => p.id !== proposalId),
    } as Partial<CanvasStoreState & CanvasLinkageSlice>);
  },

  dismissProposal: (proposalId: string) => {
    const { linkageProposals } = get();
    set({
      linkageProposals: linkageProposals.filter((p) => p.id !== proposalId),
    });
  },

  clearProposals: () => {
    set({ linkageProposals: [] });
  },
});