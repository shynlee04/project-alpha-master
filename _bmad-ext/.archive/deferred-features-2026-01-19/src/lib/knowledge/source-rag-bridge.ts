/**
 * @file Stub for archived knowledge module
 * @deprecated This module is archived for MVP
 */

export interface OramaIndex {
  // Stub interface
}

export interface SourceRAGBridge {
  createIndex: () => Promise<OramaIndex>;
  addDocument: () => Promise<void>;
  search: () => Promise<unknown[]>;
}

export function createSourceRAGBridge(): SourceRAGBridge {
  return {
    createIndex: async () => ({}) as OramaIndex,
    addDocument: async () => {},
    search: async () => [],
  };
}
