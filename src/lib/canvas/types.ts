import type { Node, Edge, Viewport, OnNodesChange, OnEdgesChange, OnConnect } from '@xyflow/react';

/**
 * Custom node types for the Knowledge Canvas
 */
export type CanvasNodeType = 'source' | 'concept';

/**
 * Source content type
 */
export type SourceContentType = 'pdf' | 'url' | 'text';

/**
 * Source node data structure
 */
export interface SourceNodeData {
  nodeType: 'source';
  sourceId: string;
  title: string;
  contentType: SourceContentType;
  excerpt?: string;
}

/**
 * Concept node data structure
 */
export interface ConceptNodeData {
  nodeType: 'concept';
  title: string;
  description?: string;
}

/**
 * Union type for all canvas node data
 * Note: Uses nodeType to avoid conflict with React Flow's built-in type property
 */
export type CanvasNodeData = SourceNodeData | ConceptNodeData;

/**
 * Relationship type for edges
 */
export type CanvasRelationshipType = 'relates' | 'supports' | 'contradicts' | 'extends';

/**
 * Custom edge data structure
 */
export interface CanvasEdgeData {
  label?: string;
  relationship?: CanvasRelationshipType;
}

/**
 * Canvas state interface
 */
export interface CanvasStoreState {
  // Nodes and edges - use any to bypass strict type constraints for custom data
  nodes: Node<any>[];
  edges: Edge<any>[];

  // Viewport state
  viewport: Viewport;

  // Read-only mode (mobile)
  isReadOnly: boolean;

  // Actions
  setNodes: (nodes: Node<any>[]) => void;
  setEdges: (edges: Edge<any>[]) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setViewport: (viewport: Viewport) => void;
  setReadOnly: (readOnly: boolean) => void;

  // Bulk operations
  addNode: (node: Node<any>) => void;
  removeNode: (nodeId: string) => void;
  addEdge: (edge: Edge<any>) => void;
  addEdgeWithRelationship: (connection: { source: string; target: string }, relationship: CanvasRelationshipType) => void;
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
