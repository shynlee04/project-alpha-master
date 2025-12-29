import type { Node, Edge, Viewport, OnNodesChange, OnEdgesChange, OnConnect } from '@xyflow/react';

/**
 * Custom node types for the Knowledge Canvas
 */
export type CanvasNodeType = 'source' | 'concept';

/**
 * Source node data structure
 */
export interface SourceNodeData {
  type: 'source';
  sourceId: string;
  title: string;
  type: 'pdf' | 'url' | 'text';
  excerpt?: string;
}

/**
 * Concept node data structure
 */
export interface ConceptNodeData {
  type: 'concept';
  title: string;
  description?: string;
}

/**
 * Union type for all canvas node data
 */
export type CanvasNodeData = SourceNodeData | ConceptNodeData;

/**
 * Custom edge data structure
 */
export interface CanvasEdgeData {
  label?: string;
  relationship?: 'relates' | 'supports' | 'contradicts' | 'extends';
}

/**
 * Canvas state interface
 */
export interface CanvasStoreState {
  // Nodes and edges
  nodes: Node<CanvasNodeData>[];
  edges: Edge<CanvasEdgeData>[];

  // Viewport state
  viewport: Viewport;

  // Read-only mode (mobile)
  isReadOnly: boolean;

  // Actions
  setNodes: (nodes: Node<CanvasNodeData>[]) => void;
  setEdges: (edges: Edge<CanvasEdgeData>[]) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setViewport: (viewport: Viewport) => void;
  setReadOnly: (readOnly: boolean) => void;

  // Bulk operations
  addNode: (node: Node<CanvasNodeData>) => void;
  removeNode: (nodeId: string) => void;
  addEdge: (edge: Edge<CanvasEdgeData>) => void;
  removeEdge: (edgeId: string) => void;
  resetCanvas: () => void;
}

/**
 * Initial viewport settings
 */
export const initialViewport: Viewport = {
  x: 0,
  y: 0,
  zoom: 1,
};

/**
 * Default viewport options
 */
export const viewportOptions = {
  minZoom: 0.1,
  maxZoom: 4,
  fitView: true,
  fitViewOptions: {
    padding: 0.8,
  },
};
