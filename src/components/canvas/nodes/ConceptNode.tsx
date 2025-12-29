import React, { memo, useCallback } from 'react';
import { Node, Position } from '@xyflow/react';
import { Handle } from '@xyflow/react';

/**
 * ConceptNode data structure
 */
export interface ConceptNodeData {
  nodeType: 'concept';
  title: string;
  description?: string;
  isEditing?: boolean;
}

interface ConceptNodeProps {
  data: ConceptNodeData;
  selected?: boolean;
}

const ConceptNodeComponent = ({ data, selected }: ConceptNodeProps) => {
  const { title, description } = data;

  return (
    <div
      className={`
        min-w-[150px] px-4 py-3 bg-gray-800 border-2 rounded-xl
        transition-all duration-200
        ${selected ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-gray-700'}
        hover:border-gray-600
      `}
    >
      {/* Handle for incoming connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-purple-500 !w-3 !h-3 !border-2 !border-gray-900"
      />

      {/* Title */}
      <h3 className="text-sm font-semibold text-purple-100 text-center">
        {title}
      </h3>

      {/* Description if present */}
      {description && (
        <p className="mt-1 text-xs text-gray-400 text-center line-clamp-2">
          {description}
        </p>
      )}

      {/* Handle for outgoing connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-purple-500 !w-3 !h-3 !border-2 !border-gray-900"
      />
    </div>
  );
};

export const ConceptNode = memo(ConceptNodeComponent);
