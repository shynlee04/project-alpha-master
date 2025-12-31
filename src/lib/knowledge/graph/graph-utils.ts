/**
 * @fileoverview Graph Utilities
 * @module lib/knowledge/graph/graph-utils
 * @governance EPIC-38, PHASE-7
 *
 * Shared utility functions for graph operations.
 */

/**
 * Generate unique ID
 *
 * @param prefix - ID prefix (e.g., 'node', 'edge')
 * @returns Unique ID string
 */
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Validate edge data
 *
 * @param edge - Edge data to validate
 * @returns True if edge data is valid
 */
export function validateEdgeData(edge: {
  sourceId: string;
  targetId: string;
  strength: number;
}): boolean {
  if (!edge.sourceId || !edge.targetId) {
    return false;
  }
  if (edge.sourceId === edge.targetId) {
    return false; // No self-loops
  }
  if (edge.strength < 0 || edge.strength > 1) {
    return false; // Strength must be 0-1
  }
  return true;
}

/**
 * Calculate edge weight based on type and strength
 *
 * @param type - Edge type
 * @param strength - Edge strength (0-1)
 * @returns Calculated weight
 */
export function calculateEdgeWeight(
  type: string,
  strength: number
): number {
  const typeMultipliers: Record<string, number> = {
    conceptual: 1.0,
    sequential: 1.2,
    citation: 1.5,
    temporal: 0.8,
    hierarchical: 1.3,
    contrastive: 0.7,
  };

  const multiplier = typeMultipliers[type] || 1.0;
  return strength * multiplier;
}
