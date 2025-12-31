/**
 * @fileoverview Graph Module Barrel Exports
 * @module lib/knowledge/graph
 * @governance EPIC-38, PHASE-7
 */

export { KnowledgeGraphCRUD } from './graph-crud';
export { GraphTraversal } from './graph-traversal';
export { GraphQueries } from './graph-queries';
export { GraphPersistence } from './graph-persistence';
export { generateId, validateEdgeData, calculateEdgeWeight } from './graph-utils';
