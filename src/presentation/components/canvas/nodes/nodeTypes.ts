import { NodeTypes } from '@xyflow/react';
import { SourceNode } from './SourceNode';
import { ConceptNode } from './ConceptNode';
import { CodeConceptNode } from './CodeConceptNode';

/**
 * Node types map for React Flow
 * Using memo to prevent unnecessary re-renders
 */
export const nodeTypes: NodeTypes = {
  source: SourceNode as never,
  concept: ConceptNode as never,
  codeConcept: CodeConceptNode as never,
};

/**
 * Type-safe node type definitions
 */
export type CanvasNodeType = 'source' | 'concept' | 'codeConcept';

/**
 * Helper to check if a node is a source node
 */
export const isSourceNode = (node: { type?: string | null }): boolean => {
  return node.type === 'source';
};

/**
 * Helper to check if a node is a concept node
 */
export const isConceptNode = (node: { type?: string | null }): boolean => {
  return node.type === 'concept';
};

/**
 * Helper to check if a node is a code concept node
 */
export const isCodeConceptNode = (node: { type?: string | null }): boolean => {
  return node.type === 'codeConcept';
};

/**
 * Default node options for new nodes
 */
export const defaultNodeOptions = {
  source: {
    type: 'source',
    origin: [0.5, 0.5] as [number, number],
  },
  concept: {
    type: 'concept',
    origin: [0.5, 0.5] as [number, number],
  },
  codeConcept: {
    type: 'codeConcept',
    origin: [0.5, 0.5] as [number, number],
  },
};
