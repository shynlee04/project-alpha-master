/**
 * @fileoverview Canvas State Slice
 * @module infrastructure/persistence/stores/canvas/slices/canvas-state-slice
 * @governance S-012-a (God Store Elimination)
 *
 * Canvas node, edge, viewport, and linkage proposal management with React Flow.
 * Part of canvas-store.ts refactoring to eliminate god store anti-pattern.
 *
 * Responsibility:
 * - Node CRUD operations (add, remove, set)
 * - Edge CRUD operations (add, remove, set, connect)
 * - Viewport management
 * - React Flow change handlers
 * - Linkage proposal state (set, clear)
 *
 * Line Count: ~120 (target: ≤120 lines)
 *
 * @see aggregation: canvas/index.ts (unified store)
 */

import type { StateCreator } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, addEdge as rfAddEdge } from '@xyflow/react';
import type { Node, Edge, Viewport, Connection, NodeChange, EdgeChange } from '@xyflow/react';
import type { CanvasRelationshipType } from '@/lib/canvas/types';
import type { LinkageProposal } from '@/lib/canvas/linkage-types';

/**
 * Canvas state slice interface
 */
export interface CanvasStateSlice {
  // State
  nodes: Node<any>[];
  edges: Edge<any>[];
  viewport: Viewport;
  isReadOnly: boolean;
  linkageProposals: LinkageProposal[];

  // Node operations
  setNodes: (nodes: Node<any>[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  addNode: (node: Node<any>) => void;
  removeNode: (nodeId: string) => void;

  // Edge operations
  setEdges: (edges: Edge<any>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  addEdge: (edge: Edge<any>) => void;
  removeEdge: (edgeId: string) => void;
  onConnect: (connection: Connection) => void;
  addEdgeWithRelationship: (
    connection: { source: string; target: string },
    relationship: CanvasRelationshipType,
  ) => void;

  // Viewport
  setViewport: (viewport: Viewport) => void;

  // Read-only
  setReadOnly: (readOnly: boolean) => void;

  // Proposals
  setProposals: (proposals: LinkageProposal[]) => void;
  clearProposals: () => void;

  // Reset
  resetCanvas: () => void;
}

/**
 * Canvas state slice creator
 */
export const createCanvasStateSlice: StateCreator<CanvasStateSlice> = (set, get) => ({
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  isReadOnly: false,
  linkageProposals: [],

  setNodes: (nodes: Node<any>[]) => set({ nodes }),
  onNodesChange: (changes: NodeChange[]) => {
    const { nodes } = get();
    set({ nodes: applyNodeChanges(changes, nodes) as Node<any>[] });
  },
  addNode: (node: Node<any>) => set((state) => ({ nodes: [...state.nodes, node] })),
  removeNode: (nodeId: string) => set((state) => ({ nodes: state.nodes.filter((n) => n.id !== nodeId) })),

  setEdges: (edges: Edge<any>[]) => set({ edges }),
  onEdgesChange: (changes: EdgeChange[]) => {
    const { edges } = get();
    set({ edges: applyEdgeChanges(changes, edges) as Edge<any>[] });
  },
  onConnect: (connection: Connection) => {
    const { edges } = get();
    const newEdge = rfAddEdge({ ...connection, type: 'relationship', animated: true }, edges);
    const edgeArray = Array.isArray(newEdge) ? newEdge : [newEdge];
    set({ edges: [...edges, ...edgeArray] as Edge<any>[] });
  },
  addEdgeWithRelationship: (connection, relationship) => {
    const newEdge: Edge<any> = {
      id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
      source: connection.source,
      target: connection.target,
      type: 'relationship',
      data: { relationship },
      animated: true,
    };
    set((state) => ({ edges: [...state.edges, newEdge] }));
  },
  addEdge: (edge: Edge<any>) => set((state) => ({ edges: [...state.edges, edge] })),
  removeEdge: (edgeId: string) => set((state) => ({ edges: state.edges.filter((e) => e.id !== edgeId) })),

  setViewport: (viewport: Viewport) => set({ viewport }),
  setReadOnly: (readOnly: boolean) => set({ isReadOnly: readOnly }),

  setProposals: (proposals: LinkageProposal[]) => set({ linkageProposals: proposals }),
  clearProposals: () => set({ linkageProposals: [] }),

  resetCanvas: () => set({ nodes: [], edges: [], linkageProposals: [], viewport: { x: 0, y: 0, zoom: 1 } }),
});