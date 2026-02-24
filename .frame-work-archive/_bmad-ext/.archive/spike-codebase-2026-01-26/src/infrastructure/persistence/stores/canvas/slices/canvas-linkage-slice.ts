/**
 * @fileoverview Canvas Linkage Slice
 * @module infrastructure/persistence/stores/canvas/slices/canvas-linkage-slice
 * @governance S-012-a (God Store Elimination)
 *
 * Canvas linkage proposal generation and management.
 * Part of canvas-store.ts refactoring to eliminate god store anti-pattern.
 *
 * Responsibility:
 * - Generate linkage proposals using linkage
 * - Accept/dismiss proposals
 * - Create edges from accepted proposals
 *
 * Line Count: ~90 (target: ≤120 lines)
 *
 * @see aggregation: canvas/index.ts (unified store)
 */

import type { StateCreator } from 'zustand';
import type { LinkageProposal } from '@/lib/canvas/linkage-types';
import type { Edge } from '@xyflow/react';
import { createLinkageAnalyzer } from '@/lib/canvas/linkage-analyzer';

/**
 * Canvas linkage slice interface
 */
export interface CanvasLinkageSlice {
  generateLinkageProposals: () => Promise<void>;
  acceptProposal: (proposalId: string) => void;
  dismissProposal: (proposalId: string) => void;
}

/**
 * Canvas linkage slice creator
 * Accepts a state that includes nodes, edges, and linkageProposals
 */
export const createCanvasLinkageSlice: StateCreator<
  {
    nodes: any[];
    edges: Edge<any>[];
    linkageProposals: LinkageProposal[];
  },
  [],
  [],
  CanvasLinkageSlice
> = (set, get) => ({
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
    const { linkageProposals, edges } = get();
    const proposal = linkageProposals.find((p) => p.id === proposalId);

    if (!proposal) return;

    // Create edge from proposal
    const newEdge: Edge<any> = {
      id: `edge-${proposal.sourceNodeId}-${proposal.targetNodeId}-${Date.now()}`,
      source: proposal.sourceNodeId,
      target: proposal.targetNodeId,
      type: 'relationship',
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
    });
  },

  dismissProposal: (proposalId: string) => {
    const { linkageProposals } = get();
    set({
      linkageProposals: linkageProposals.filter((p) => p.id !== proposalId),
    });
  },
});