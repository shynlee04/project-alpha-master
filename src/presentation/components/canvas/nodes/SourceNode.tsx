import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
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
      return 'hsl(var(--destructive))'; // Red for PDF
    case 'url':
      return 'hsl(var(--info))'; // Blue for URL
    case 'markdown':
    case 'text':
      return 'hsl(var(--success))'; // Green for text/markdown
    default:
      return 'hsl(var(--muted-foreground))'; // Gray default
  }
};

const SourceNodeComponent = ({ data, selected }: SourceNodeProps) => {
  const { title, contentType, excerpt } = data;
  const typeColor = getContentTypeColor(contentType);

  return (
    <div
      className={`
        min-w-[200px] max-w-[300px] bg-card border-2 rounded-none overflow-hidden
        transition-all duration-200
        ${selected ? 'border-info shadow-lg shadow-info/20' : 'border-border'}
        hover:border-muted-foreground
      `}
      draggable={false}
    >
      {/* Top handle for incoming connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-info !w-3 !h-3 !border-2 !border-card"
      />

      {/* Header with type icon */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b border-border"
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
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
          {title}
        </h3>
        {excerpt && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{excerpt}</p>
        )}
      </div>

      {/* Bottom handle for outgoing connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-info !w-3 !h-3 !border-2 !border-card"
      />
    </div>
  );
};

export const SourceNode = memo(SourceNodeComponent);
