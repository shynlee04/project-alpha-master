/**
 * Knowledge Domain Entities - Domain Layer
 *
 * Core business entities representing Knowledge Management structures.
 * Aligned with Clean Architecture principles - pure domain logic with no infrastructure dependencies.
 *
 * @layer Domain
 * @module core/entities
 */

/**
 * Knowledge Source - Domain Entity
 *
 * Represents an origin of information (file, URL, note) that feeds into the knowledge graph.
 *
 * Business rules:
 * - Source must belong to a project
 * - URI must be unique within a project
 * - Status tracks the processing lifecycle
 */
export interface KnowledgeSource {
  /** Unique identifier */
  id: string;
  /** Project this source belongs to */
  projectId: string;
  /** Type of source */
  type: 'file' | 'url' | 'note';
  /** Uniform Resource Identifier (path or URL) */
  uri: string;
  /** Display title */
  title: string;
  /** Custom metadata */
  metadata: Record<string, unknown>;
  /** Processing status */
  status: 'pending' | 'processing' | 'processed' | 'error';
  /** Creation timestamp */
  created: Date;
  /** Last update timestamp */
  updated: Date;
}

/**
 * Knowledge Node - Domain Entity
 *
 * Represents a vertex in the knowledge graph (concept, entity, resource).
 *
 * Business rules:
 * - Node must have a unique ID
 * - Properties store flexible data attributes
 */
export interface KnowledgeNode {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Node classification */
  type: 'concept' | 'entity' | 'resource';
  /** Data attributes */
  properties: Record<string, unknown>;
  /** Creation timestamp */
  created: Date;
  /** Last update timestamp */
  updated: Date;
}

/**
 * Knowledge Edge - Domain Entity
 *
 * Represents a connection between two nodes in the knowledge graph.
 *
 * Business rules:
 * - Edge connects exactly one source node to one target node
 * - Directional relationship
 */
export interface KnowledgeEdge {
  /** Unique identifier */
  id: string;
  /** Source node ID */
  sourceId: string;
  /** Target node ID */
  targetId: string;
  /** Relationship type */
  type: 'relates_to' | 'contains' | 'references';
  /** Data attributes */
  properties: Record<string, unknown>;
  /** Creation timestamp */
  created: Date;
  /** Last update timestamp */
  updated: Date;
}

// --- Create Params ---

/**
 * KnowledgeSource creation parameters
 * Excludes auto-generated fields: id, created, updated, status (defaults to pending)
 */
export type KnowledgeSourceCreateParams = Omit<
  KnowledgeSource,
  'id' | 'created' | 'updated' | 'status'
>;

/**
 * KnowledgeNode creation parameters
 * Excludes auto-generated fields: id, created, updated
 */
export type KnowledgeNodeCreateParams = Omit<
  KnowledgeNode,
  'id' | 'created' | 'updated'
>;

/**
 * KnowledgeEdge creation parameters
 * Excludes auto-generated fields: id, created, updated
 */
export type KnowledgeEdgeCreateParams = Omit<
  KnowledgeEdge,
  'id' | 'created' | 'updated'
>;

// --- Update Params ---

/**
 * KnowledgeSource update parameters
 * All fields optional except id
 */
export type KnowledgeSourceUpdateParams = Partial<
  Omit<KnowledgeSource, 'id'>
> & {
  id: string;
};

/**
 * KnowledgeNode update parameters
 * All fields optional except id
 */
export type KnowledgeNodeUpdateParams = Partial<Omit<KnowledgeNode, 'id'>> & {
  id: string;
};

/**
 * KnowledgeEdge update parameters
 * All fields optional except id
 */
export type KnowledgeEdgeUpdateParams = Partial<Omit<KnowledgeEdge, 'id'>> & {
  id: string;
};
