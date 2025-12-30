import { memo } from 'react';
import { Edge, EdgeTypes } from '@xyflow/react';
import { RelationshipEdge } from './RelationshipEdge';

/**
 * Memoized edge types map for React Flow
 * Using memo to prevent unnecessary re-renders
 */
export const edgeTypes: EdgeTypes = {
  relationship: memo(() => <RelationshipEdge />),
};

/**
 * Default edge options applied to all new edges
 */
export const defaultEdgeOptions: Partial<Edge> = {
  type: 'smoothstep',
  animated: true,
  style: {
    stroke: 'var(--color-primary, #a855f7)',
    strokeWidth: 2,
  },
  labelStyle: {
    fill: 'var(--color-text-primary, #e5e7eb)',
    fontSize: 12,
    fontFamily: 'var(--font-mono, monospace)',
  },
  labelBgStyle: {
    fill: 'var(--color-background, #0f0f0f)',
    fillOpacity: 0.9,
  },
};

/**
 * Get edge style based on relationship type
 */
export const getEdgeStyle = (relationship: string = 'relates') => {
  const styles: Record<string, React.CSSProperties> = {
    relates: {
      stroke: 'var(--color-primary, #a855f7)',
      strokeDasharray: 'none',
    },
    supports: {
      stroke: '#22c55e',
      strokeDasharray: 'none',
    },
    contradicts: {
      stroke: '#ef4444',
      strokeDasharray: '5,5',
    },
    extends: {
      stroke: '#3b82f6',
      strokeDasharray: '10,5',
    },
  };

  return styles[relationship] || styles.relates;
};
