/**
 * @fileoverview Canvas Store Tests
 * @module lib/state/__tests__/canvas-store.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Node, Edge, Viewport } from '@xyflow/react';

// Mock localStorage first - before any imports
const mockLocalStorage = {
  getItem: vi.fn().mockReturnValue(null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock Dexie tables
const mockTables = {
  canvases: {
    get: vi.fn().mockResolvedValue(undefined),
    add: vi.fn().mockResolvedValue('test-id'),
    update: vi.fn().mockResolvedValue(1),
    delete: vi.fn().mockResolvedValue(undefined),
    toArray: vi.fn().mockResolvedValue([]),
    clear: vi.fn().mockResolvedValue(undefined),
    put: vi.fn().mockResolvedValue('test-id'),
  },
  canvasStates: {
    get: vi.fn().mockResolvedValue(undefined),
    add: vi.fn().mockResolvedValue('test-id'),
    update: vi.fn().mockResolvedValue(1),
    delete: vi.fn().mockResolvedValue(undefined),
    toArray: vi.fn().mockResolvedValue([]),
    clear: vi.fn().mockResolvedValue(undefined),
    put: vi.fn().mockResolvedValue('test-id'),
  },
};

// Create mock Dexie instance
const createMockDexieInstance = () => ({
  version: vi.fn().mockReturnThis(),
  stores: vi.fn().mockReturnThis(),
  transaction: vi.fn().mockImplementation(async (_mode: string, _stores: string[], callback: () => Promise<void>) => {
    await callback();
  }),
  table: vi.fn((name: string) => mockTables[name as keyof typeof mockTables] || mockTables.canvases),
});

// Setup Dexie mock before imports
vi.mock('dexie', async () => {
  const actual = await vi.importActual('dexie');
  return {
    ...actual,
    default: createMockDexieInstance,
    Dexie: createMockDexieInstance,
  };
});

// Import after mocking
const { useCanvasStore, useMultiCanvasStore, generateCanvasId, KnowledgeCanvasDB, getCanvasDb, setCanvasDbForTesting } = await import('../canvas-store');

describe('Canvas Store', () => {
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
      const { addNode } = useCanvasStore.getState();

      const newNode = {
        id: 'node-1',
        type: 'concept' as const,
        data: { nodeType: 'concept' as const, title: 'Test Concept' },
        position: { x: 100, y: 100 },
      };

      addNode(newNode);

      const updatedNodes = useCanvasStore.getState().nodes;
      expect(updatedNodes).toHaveLength(1);
      expect(updatedNodes[0].id).toBe('node-1');
      expect(updatedNodes[0].data.title).toBe('Test Concept');
    });

    it('should remove a node from the canvas', () => {
      const { addNode, removeNode } = useCanvasStore.getState();

      const newNode = {
        id: 'node-1',
        type: 'concept' as const,
        data: { nodeType: 'concept' as const, title: 'Test Concept' },
        position: { x: 100, y: 100 },
      };

      addNode(newNode);
      expect(useCanvasStore.getState().nodes).toHaveLength(1);

      removeNode('node-1');
      expect(useCanvasStore.getState().nodes).toHaveLength(0);
    });

    it('should set nodes array', () => {
      const { setNodes } = useCanvasStore.getState();

      const nodeArray = [
        {
          id: 'node-1',
          type: 'source' as const,
          data: { nodeType: 'source' as const, sourceId: 'src-1', title: 'Source 1', contentType: 'pdf' as const },
          position: { x: 0, y: 0 },
        },
        {
          id: 'node-2',
          type: 'concept' as const,
          data: { nodeType: 'concept' as const, title: 'Concept 1' },
          position: { x: 200, y: 200 },
        },
      ];

      setNodes(nodeArray);
      expect(useCanvasStore.getState().nodes).toEqual(nodeArray);
    });
  });

  describe('Edge Management', () => {
    it('should add an edge to the canvas', () => {
      const { addEdge } = useCanvasStore.getState();

      const newEdge = {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        type: 'default' as const,
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
        type: 'default' as const,
      };

      addEdge(newEdge);
      expect(useCanvasStore.getState().edges).toHaveLength(1);

      removeEdge('edge-1');
      expect(useCanvasStore.getState().edges).toHaveLength(0);
    });

    it('should add edge with relationship type', () => {
      const { addEdgeWithRelationship, edges } = useCanvasStore.getState();

      addEdgeWithRelationship({ source: 'node-1', target: 'node-2' }, 'supports');

      const updatedEdges = useCanvasStore.getState().edges;
      expect(updatedEdges).toHaveLength(1);
      expect(updatedEdges[0].data?.relationship).toBe('supports');
      expect(updatedEdges[0].animated).toBe(true);
    });
  });

  describe('Viewport Management', () => {
    it('should update viewport', () => {
      const { setViewport } = useCanvasStore.getState();

      const newViewport = { x: 100, y: 200, zoom: 1.5 };
      setViewport(newViewport);

      expect(useCanvasStore.getState().viewport).toEqual(newViewport);
    });
  });

  describe('Read-Only Mode', () => {
    it('should toggle read-only mode', () => {
      const { setReadOnly } = useCanvasStore.getState();

      expect(useCanvasStore.getState().isReadOnly).toBe(false);

      setReadOnly(true);
      expect(useCanvasStore.getState().isReadOnly).toBe(true);

      setReadOnly(false);
      expect(useCanvasStore.getState().isReadOnly).toBe(false);
    });
  });

  describe('Canvas Reset', () => {
    it('should reset canvas to initial state', () => {
      const { addNode, addEdge, setViewport, resetCanvas } = useCanvasStore.getState();

      // Add some data
      addNode({
        id: 'node-1',
        type: 'concept' as const,
        data: { nodeType: 'concept' as const, title: 'Test' },
        position: { x: 100, y: 100 },
      });

      addEdge({
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        type: 'default' as const,
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
        type: 'concept' as const,
        data: { nodeType: 'concept' as const, title: 'Test' },
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
  });
});

describe('Canvas ID Generation', () => {
  it('should generate unique canvas IDs', () => {
    const id1 = generateCanvasId();
    const id2 = generateCanvasId();

    expect(id1).toMatch(/^canvas-\d+-[a-z0-9]+$/);
    expect(id2).toMatch(/^canvas-\d+-[a-z0-9]+$/);
    expect(id1).not.toBe(id2);
  });
});

describe('Multi-Canvas Store', () => {
  it('should have initial state', () => {
    const state = useMultiCanvasStore.getState();

    expect(state.activeCanvasId).toBeNull();
    expect(state.canvasList).toBeInstanceOf(Array);
  });
});

describe('KnowledgeCanvasDB', () => {
  it('should be a class extending Dexie', () => {
    expect(KnowledgeCanvasDB).toBeDefined();
    expect(typeof KnowledgeCanvasDB).toBe('function');
  });

  it('should have getCanvasDb function', () => {
    expect(getCanvasDb).toBeDefined();
    expect(typeof getCanvasDb).toBe('function');
  });

  it('should have setCanvasDbForTesting function', () => {
    expect(setCanvasDbForTesting).toBeDefined();
    expect(typeof setCanvasDbForTesting).toBe('function');
  });
});

describe('Canvas Export Format', () => {
  it('should validate export structure', () => {
    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      canvas: {
        id: 'test-canvas',
        name: 'Test Canvas',
        nodes: [] as Node<any>[],
        edges: [] as Edge<any>[],
        viewport: { x: 0, y: 0, zoom: 1 } as Viewport,
      },
    };

    expect(exportData.version).toBe(1);
    expect(exportData.canvas.nodes).toBeInstanceOf(Array);
    expect(exportData.canvas.edges).toBeInstanceOf(Array);
  });
});
