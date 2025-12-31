import { memo, useCallback, useMemo, useState } from 'react';
import {
  EdgeLabelRenderer,
  BaseEdge,
  EdgeProps,
  getBezierPath,
} from '@xyflow/react';
import type { CanvasRelationshipType } from '@/lib/canvas/types';
import '@xyflow/react/dist/style.css';
import { useTranslation } from 'react-i18next';

/**
 * Props for RelationshipEdge component
 */
export interface RelationshipEdgeData {
  relationship?: CanvasRelationshipType;
  label?: string;
}

/**
 * Cast data to RelationshipEdgeData for type-safe access
 */
const castEdgeData = (data: unknown): RelationshipEdgeData => {
  return data as RelationshipEdgeData;
};

/**
 * Get marker end type for relationship as a string
 */
const getMarkerEnd = (relationship: CanvasRelationshipType): string => {
  switch (relationship) {
    case 'contradicts':
      return 'arrowclosed';
    default:
      return 'arrowclosed';
  }
};

/**
 * Get styling for relationship type
 */
const getRelationshipStyle = (relationship: CanvasRelationshipType = 'relates') => {
  switch (relationship) {
    case 'supports':
      return {
        color: '#22c55e',
        strokeDasharray: 'none',
      };
    case 'contradicts':
      return {
        color: '#ef4444',
        strokeDasharray: '5,5',
      };
    case 'extends':
      return {
        color: '#3b82f6',
        strokeDasharray: '10,5',
      };
    case 'relates':
    default:
      return {
        color: 'var(--color-primary, #a855f7)',
        strokeDasharray: 'none',
      };
  }
};

/**
 * RelationshipEdge component for displaying connections between nodes
 * Supports different relationship types with distinct visual styling
 */
const RelationshipEdgeComponent = ({
  id,
  data,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  selected,
}: EdgeProps) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(castEdgeData(data).label || '');

  const relationship = castEdgeData(data).relationship || 'relates';
  const { color, strokeDasharray } = useMemo(
    () => getRelationshipStyle(relationship),
    [relationship],
  );

  // Create the bezier curve path
  const [edgePath, labelX, labelY] = useMemo(
    () =>
      getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
      }),
    [sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition],
  );

  // Memoized edge style
  const edgeStyle = useMemo(
    () => ({
      ...style,
      strokeWidth: 2,
      stroke: color,
      strokeDasharray,
      transition: 'stroke 0.2s, stroke-width 0.2s',
    }),
    [style, color, strokeDasharray],
  );

  // Handle label save
  const handleLabelSave = useCallback(() => {
    const edgeData = castEdgeData(data);
    const currentLabel = edgeData.label || '';
    if (label.trim() !== currentLabel) {
      // In a real implementation, this would update the edge data
      // For now, we just update local state
    }
    setIsEditing(false);
  }, [label, data]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        handleLabelSave();
      } else if (e.key === 'Escape') {
        const edgeData = castEdgeData(data);
        setLabel(edgeData.label || '');
        setIsEditing(false);
      }
    },
    [handleLabelSave, data],
  );

  // Handle edge click for selection
  const handleEdgeClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      // Selection is handled by React Flow's built-in selection
    },
    [],
  );

  const edgeData = castEdgeData(data);

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={getMarkerEnd(relationship)}
        style={edgeStyle}
        className={selected ? 'react-flow__edge-selected' : ''}
        onClick={handleEdgeClick}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            left: labelX,
            top: labelY,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'all',
            zIndex: 10,
          }}
          className="nodrag"
        >
          {isEditing ? (
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={handleLabelSave}
              onKeyDown={handleKeyDown}
              autoFocus
              className="px-2 py-1 text-xs bg-background border border-primary rounded min-w-[80px] text-center focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={t('canvas.edge.label', 'Label')}
            />
          ) : (
            <button
              type="button"
              className={`px-2 py-1 text-xs bg-background/90 backdrop-blur-sm border rounded cursor-pointer hover:bg-accent transition-colors ${
                selected
                  ? 'border-primary text-primary'
                  : 'border-border text-muted-foreground'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              style={{ color: selected ? color : undefined }}
            >
              {edgeData.label || ''}
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

// Memoize for performance
export const RelationshipEdge = memo(RelationshipEdgeComponent);

/**
 * Create a new relationship edge
 */
export const createRelationshipEdge = (
  source: string,
  target: string,
  relationship: CanvasRelationshipType = 'relates',
  label?: string,
) => ({
  id: `edge-${source}-${target}-${Date.now()}`,
  source,
  target,
  type: 'relationship',
  data: { relationship, label },
  animated: true,
});

/**
 * Get color for relationship type
 */
export const getRelationshipColor = (relationship: CanvasRelationshipType): string => {
  const styles = getRelationshipStyle(relationship);
  return styles.color;
};

/**
 * Get label for relationship type (for UI display)
 */
export const getRelationshipLabel = (relationship: CanvasRelationshipType): string => {
  const labels: Record<CanvasRelationshipType, string> = {
    relates: 'Related to',
    supports: 'Supports',
    contradicts: 'Contrasts with',
    extends: 'Extends',
  };
  return labels[relationship] || 'Related to';
};
