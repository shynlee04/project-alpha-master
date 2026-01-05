/**
 * @fileoverview Canvas Database Initialization
 * @module infrastructure/persistence/stores/canvas/canvas-db
 * @governance S-012-a (God Store Elimination)
 *
 * IndexedDB database for canvas persistence.
 * Part of canvas-store.ts refactoring to eliminate god store anti-pattern.
 *
 * Architecture:
 * - Extracted from canvas-store.ts (original lines 36-71)
 * - Canonical location for Dexie database initialization
 * - Supports canvas metadata and state persistence
 *
 * @see aggregation: canvas/index.ts (unified store)
 */

import Dexie from 'dexie';

/**
 * IndexedDB record types
 */
interface CanvasStateRecord {
  canvasId: string;
  nodes: Node<any>[];
  edges: Edge<any>[];
  viewport: Viewport;
  linkageProposals?: LinkageProposal[];
}

interface CanvasMetadataRecord {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  nodeCount: number;
  edgeCount: number;
}

/**
 * KnowledgeCanvasDB class for IndexedDB operations
 * Extends Dexie for type-safe database operations
 */
export class KnowledgeCanvasDB extends Dexie {
  canvases!: Dexie.Table<CanvasMetadataRecord, string, CanvasMetadataRecord>;
  canvasStates!: Dexie.Table<CanvasStateRecord, string, CanvasStateRecord>;

  constructor() {
    super('KnowledgeCanvasDB');
    this.version(2).stores({
      canvases: 'id, name, updatedAt',
      canvasStates: 'canvasId',
    });
  }
}

// Singleton instance - can be replaced for testing
let canvasDbInstance: KnowledgeCanvasDB | null = null;

/**
 * Get/create the database singleton instance
 */
export function getCanvasDb(): KnowledgeCanvasDB {
  if (!canvasDbInstance) {
    canvasDbInstance = new KnowledgeCanvasDB();
  }
  return canvasDbInstance;
}

/**
 * Set database instance (for testing)
 */
export function setCanvasDbForTesting(db: KnowledgeCanvasDB | null): void {
  canvasDbInstance = db;
}

/**
 * Safe getter (SSR-compatible)
 */
export const getSafeCanvasDb = (): KnowledgeCanvasDB | null => {
  if (typeof window === 'undefined') return null;
  return getCanvasDb();
};