import { memo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { FileText, Globe, FileJson } from 'lucide-react';
import { SourceNodeData } from '@/lib/canvas/types';

interface SourceNodeProps extends Omit<NodeProps, 'data'> {
  data: SourceNodeData;
}

/**
 * Get icon component based on content type
 */
const getContentTypeIcon = (contentType: string) => {
  switch (contentType) {
    case 'pdf':
      return <FileText className="w-4 h-4" />;
    case 'url':
      return <Globe className="w-4 h-4" />;
    case 'markdown':
    case 'text':
      return <FileJson className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

/**
 * Get color based on content type
 */
const getContentTypeColor = (contentType: string): string => {
  switch (contentType) {
    case 'pdf':
      return '#ef4444'; // Red for PDF
    case 'url':
      return '#3b82f6'; // Blue for URL
    case 'markdown':
    case 'text':
      return '#22c55e'; // Green for text/markdown
    default:
      return '#6b7280'; // Gray default
  }
};

const SourceNodeComponent = ({ data, selected }: SourceNodeProps) => {
  const { title, contentType, excerpt } = data;
  const typeColor = getContentTypeColor(contentType);

  return (
    <div
      className={`
        min-w-[200px] max-w-[300px] bg-gray-900 border-2 rounded-none overflow-hidden
        transition-all duration-200
        ${selected ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-gray-700'}
        hover:border-gray-600
      `}
      draggable={false}
    >
      {/* Top handle for incoming connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500 !w-3 !h-3 !border-2 !border-gray-900"
      />

      {/* Header with type icon */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b border-gray-700"
        style={{ backgroundColor: `${typeColor}20` }}
      >
        <span style={{ color: typeColor }}>{getContentTypeIcon(contentType)}</span>
        <span
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: typeColor }}
        >
          {contentType}
        </span>
      </div>

      {/* Title */}
      <div className="px-3 py-2">
        <h3 className="text-sm font-semibold text-gray-100 line-clamp-2 leading-tight">
          {title}
        </h3>
        {excerpt && (
          <p className="mt-1 text-xs text-gray-400 line-clamp-2">{excerpt}</p>
        )}
      </div>

      {/* Bottom handle for outgoing connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-500 !w-3 !h-3 !border-2 !border-gray-900"
      />

      {/* Selection resizer */}
      {selected && (
        <NodeResizer
          minWidth={150}
          minHeight={80}
        />
      )}
    </div>
  );
};

export const SourceNode = memo(SourceNodeComponent);
