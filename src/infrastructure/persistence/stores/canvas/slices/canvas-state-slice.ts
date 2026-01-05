/**
 * @fileoverview Canvas State Slice
 * @module infrastructure/persistence/stores/canvas/slices/canvas-state-slice
 * @governance S-012-a (God Store Elimination)
 *
 * Canvas node and edge management with React Flow integration.
 * Part of canvas-store.ts refactoring to eliminate god store anti-pattern.
 *
 * Responsibility:
 * - Node CRUD operations (add, remove, set)
 * - Edge CRUD operations (add, remove, set, connect)
 * - Viewport management
 * - React Flow change handlers
 *
 * Line Count: ~100 (target: ≤120 lines)
 *
 * @see aggregation: canvas/index.ts (unified store)
 */

import type { StateCreator } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, addEdge as rfAddEdge } from '@xyflow/react';
import type { Node, Edge, Viewport, Connection, NodeChange, EdgeChange } from '@xyflow/react';
import type {
  CanvasStoreState,
  CanvasRelationshipType,
} from '@/lib/canvas/types';

/**
 * Canvas state slice interface
 */
export interface CanvasStateSlice {
  // State
  nodes: Node<any>[];
  edges: Edge<any>[];
  viewport: Viewport;
  isReadOnly: boolean;

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

  // Viewport operations
  setViewport: (viewport: Viewport) => void;

  // Read-only mode
  setReadOnly: (readOnly: boolean) => void;

  // Reset
  resetCanvas: () => void;
}

/**
 * Canvas state slice creator
 */
export const createCanvasStateSlice: StateCreator<CanvasStoreState> = (set, get) => ({
  // Initial state
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  isReadOnly: false,

  // Node operations
  setNodes: (nodes: Node<any>[]) => set({ nodes }),

  onNodesChange: (changes: NodeChange[]) => {
    const { nodes } = get();
    const newNodes = applyNodeChanges(changes, nodes) as Node<any>[];
    set({ nodes: newNodes });
  },

  addNode: (node: Node<any>) => {
    const { nodes } = get();
    set({ nodes: [...nodes, node] });
  },

  removeNode: (nodeId: string) => {
    const { nodes } = get();
    set({ nodes: nodes.filter((n) => n.id !== nodeId) });
  },

  // Edge operations
  setEdges: (edges: Edge<any>[]) => set({ edges }),

  onEdgesChange: (changes: EdgeChange[]) => {
    const { edges } = get();
    const newEdges = applyEdgeChanges(changes, edges) as Edge<any>[];
    set({ edges: newEdges });
  },

  onConnect: (connection: Connection) => {
    const { edges } = get();
    const newEdge = rfAddEdge(
      { ...connection, type: 'relationship', animated: true },
      edges,
    );
    const edgeArray = Array.isArray(newEdge) ? newEdge : [newEdge];
    set({ edges: [...edges, ...edgeArray] as Edge<any>[] });
  },

  addEdgeWithRelationship: (
    connection: { source: string; target: string },
    relationship: CanvasRelationshipType,
  ) => {
    const { edges } = get();
    const newEdge: Edge<any> = {
      id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
      source: connection.source,
      target: connection.target,
      type: 'relationship',
      data: { relationship },
      animated: true,
    };
    set({ edges: [...edges, newEdge] });
  },

  addEdge: (edge: Edge<any>) => {
    const { edges } = get();
    set({ edges: [...edges, edge] });
  },

  removeEdge: (edgeId: string) => {
    const { edges } = get();
    set({ edges: edges.filter((e) => e.id !== edgeId) });
  },

  // Viewport
  setViewport: (viewport: Viewport) => set({ viewport }),

  // Read-only mode
  setReadOnly: (readOnly: boolean) => set({ isReadOnly: readOnly }),

  // Reset
  resetCanvas: () => {
    set({
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    });
  },
});