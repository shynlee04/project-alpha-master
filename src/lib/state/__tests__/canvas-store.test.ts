import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock IndexedDB
const mockIndexedDB = {
  tables: new Map(),
  clear: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  add: vi.fn(),
  toArray: vi.fn().mockResolvedValue([]),
};

const mockDexie = {
  table: vi.fn().mockReturnValue(mockIndexedDB),
  transaction: vi.fn().mockImplementation(async (_mode, _stores, callback) => {
    await callback();
  }),
};

// Mock Dexie
vi.mock('dexie', () => ({
  default: vi.fn().mockImplementation(() => mockDexie),
}));

// Import after mocking
const { useCanvasStore } = await import('../canvas-store');

describe('CanvasStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useCanvasStore.setState({
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      isReadOnly: false,
    });
  });

  describe('Node Management', () => {
    it('should add a node to the canvas', () => {
      const { addNode, nodes } = useCanvasStore.getState();

      const newNode = {
        id: 'node-1',
        type: 'concept',
        data: { type: 'concept' as const, title: 'Test Concept' },
        position: { x: 100, y: 100 },
      };

      addNode(newNode);

      const updatedNodes = useCanvasStore.getState().nodes;
      expect(updatedNodes).toHaveLength(1);
      expect(updatedNodes[0].id).toBe('node-1');
      expect(updatedNodes[0].data.title).toBe('Test Concept');
    });

    it('should remove a node from the canvas', () => {
      const { addNode, removeNode, nodes } = useCanvasStore.getState();

      const newNode = {
        id: 'node-1',
        type: 'concept',
        data: { type: 'concept' as const, title: 'Test Concept' },
        position: { x: 100, y: 100 },
      };

      addNode(newNode);
      expect(useCanvasStore.getState().nodes).toHaveLength(1);

      removeNode('node-1');
      expect(useCanvasStore.getState().nodes).toHaveLength(0);
    });

    it('should set nodes array', () => {
      const { setNodes, nodes } = useCanvasStore.getState();

      const nodeArray = [
        {
          id: 'node-1',
          type: 'source',
          data: { type: 'source' as const, sourceId: 'src-1', title: 'Source 1', type: 'pdf' as const },
          position: { x: 0, y: 0 },
        },
        {
          id: 'node-2',
          type: 'concept',
          data: { type: 'concept' as const, title: 'Concept 1' },
          position: { x: 200, y: 200 },
        },
      ];

      setNodes(nodeArray);
      expect(useCanvasStore.getState().nodes).toEqual(nodeArray);
    });
  });

  describe('Edge Management', () => {
    it('should add an edge to the canvas', () => {
      const { addEdge, edges } = useCanvasStore.getState();

      const newEdge = {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        type: 'default',
      };

      addEdge(newEdge);

      const updatedEdges = useCanvasStore.getState().edges;
      expect(updatedEdges).toHaveLength(1);
      expect(updatedEdges[0].id).toBe('edge-1');
    });

    it('should remove an edge from the canvas', () => {
      const { addEdge, removeEdge } = useCanvasStore.getState();

      const newEdge = {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        type: 'default',
      };

      addEdge(newEdge);
      expect(useCanvasStore.getState().edges).toHaveLength(1);

      removeEdge('edge-1');
      expect(useCanvasStore.getState().edges).toHaveLength(0);
    });
  });

  describe('Viewport Management', () => {
    it('should update viewport', () => {
      const { setViewport, viewport } = useCanvasStore.getState();

      const newViewport = { x: 100, y: 200, zoom: 1.5 };
      setViewport(newViewport);

      expect(useCanvasStore.getState().viewport).toEqual(newViewport);
    });
  });

  describe('Read-Only Mode', () => {
    it('should toggle read-only mode', () => {
      const { setReadOnly, isReadOnly } = useCanvasStore.getState();

      expect(isReadOnly).toBe(false);

      setReadOnly(true);
      expect(useCanvasStore.getState().isReadOnly).toBe(true);

      setReadOnly(false);
      expect(useCanvasStore.getState().isReadOnly).toBe(false);
    });
  });

  describe('Canvas Reset', () => {
    it('should reset canvas to initial state', () => {
      const { addNode, addEdge, setViewport, resetCanvas, nodes, edges } = useCanvasStore.getState();

      // Add some data
      addNode({
        id: 'node-1',
        type: 'concept',
        data: { type: 'concept' as const, title: 'Test' },
        position: { x: 100, y: 100 },
      });

      addEdge({
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
      });

      setViewport({ x: 500, y: 500, zoom: 2 });

      // Reset
      resetCanvas();

      expect(useCanvasStore.getState().nodes).toHaveLength(0);
      expect(useCanvasStore.getState().edges).toHaveLength(0);
      expect(useCanvasStore.getState().viewport).toEqual({ x: 0, y: 0, zoom: 1 });
    });
  });

  describe('React Flow Change Handlers', () => {
    it('should handle node position changes', () => {
      const { onNodesChange, addNode } = useCanvasStore.getState();

      const node = {
        id: 'node-1',
        type: 'concept',
        data: { type: 'concept' as const, title: 'Test' },
        position: { x: 100, y: 100 },
      };

      addNode(node);

      const positionChange = {
        type: 'position' as const,
        id: 'node-1',
        position: { x: 200, y: 200 },
        dragging: false,
      };

      onNodesChange([positionChange]);

      const updatedNode = useCanvasStore.getState().nodes.find((n) => n.id === 'node-1');
      expect(updatedNode?.position).toEqual({ x: 200, y: 200 });
    });

    it('should handle edge selection changes', () => {
      const { onEdgesChange, addEdge } = useCanvasStore.getState();

      const edge = {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        selected: false,
      };

      addEdge(edge);

      const selectionChange = {
        type: 'select' as const,
        id: 'edge-1',
        selected: true,
      };

      onEdgesChange([selectionChange]);

      const updatedEdge = useCanvasStore.getState().edges.find((e) => e.id === 'edge-1');
      expect(updatedEdge?.selected).toBe(true);
    });

    it('should handle connections', () => {
      const { onConnect, addNode } = useCanvasStore.getState();

      // Add two nodes first
      addNode({
        id: 'node-1',
        type: 'concept',
        data: { type: 'concept' as const, title: 'Node 1' },
        position: { x: 0, y: 0 },
      });

      addNode({
        id: 'node-2',
        type: 'concept',
        data: { type: 'concept' as const, title: 'Node 2' },
        position: { x: 200, y: 200 },
      });

      const connection = {
        source: 'node-1',
        target: 'node-2',
        sourceHandle: null,
        targetHandle: null,
      };

      onConnect(connection);

      expect(useCanvasStore.getState().edges).toHaveLength(1);
      expect(useCanvasStore.getState().edges[0].source).toBe('node-1');
      expect(useCanvasStore.getState().edges[0].target).toBe('node-2');
    });
  });
});
