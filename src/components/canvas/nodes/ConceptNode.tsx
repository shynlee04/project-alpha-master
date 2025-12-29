import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

/**
 * ConceptNode data structure
 */
export interface ConceptNodeData {
  nodeType: 'concept';
  title: string;
  description?: string;
  isEditing?: boolean;
}

interface ConceptNodeProps extends NodeProps<ConceptNodeData> {
  onTitleChange?: (id: string, title: string) => void;
}

const ConceptNodeComponent = ({
  id,
  data,
  selected,
  onTitleChange,
}: ConceptNodeProps) => {
  const { title, description } = data;
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Save changes on blur or Enter
  const handleSave = useCallback(() => {
    if (editValue.trim() !== '' && editValue !== title) {
      onTitleChange?.(id, editValue.trim());
    }
    setIsEditing(false);
  }, [id, editValue, title, onTitleChange]);

  // Handle keydown events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        setEditValue(title);
        setIsEditing(false);
      }
    },
    [handleSave, title]
  );

  // Handle double-click to enter edit mode
  const handleDoubleClick = useCallback(() => {
    if (!isEditing) {
      setIsEditing(true);
    }
  }, [isEditing]);

  return (
    <div
      className={`
        min-w-[150px] px-4 py-3 bg-gray-800 border-2 rounded-xl
        transition-all duration-200 cursor-pointer
        ${selected ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-gray-700'}
        hover:border-gray-600
      `}
      onDoubleClick={handleDoubleClick}
    >
      {/* Handle for incoming connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-purple-500 !w-3 !h-3 !border-2 !border-gray-900"
      />

      {/* Title - either input or display */}
      {isEditing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-full bg-gray-900 text-purple-100 text-sm font-semibold text-center outline-none border border-purple-500 rounded px-2 py-1"
          data-testid="concept-node-input"
        />
      ) : (
        <h3
          className="text-sm font-semibold text-purple-100 text-center cursor-text"
          data-testid="concept-node-title"
        >
          {title}
        </h3>
      )}

      {/* Description if present */}
      {description && !isEditing && (
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
