import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Code2, FileCode, GitBranch, Package } from 'lucide-react';
import type { CodeAnalysis } from '@/lib/ide/code-analyzer';

/**
 * CodeConceptNode data structure
 */
export interface CodeConceptNodeData {
  nodeType: 'codeConcept';
  title: string;
  filePath: string;
  analysis: CodeAnalysis;
}

interface CodeConceptNodeProps extends Omit<NodeProps, 'data'> {
  data: CodeConceptNodeData;
}

const CodeConceptNodeComponent = ({
  data,
  selected,
}: CodeConceptNodeProps) => {
  const { title, filePath, analysis } = data;

  // Determine complexity color
  const getComplexityColor = (score: number) => {
    if (score < 30) return 'text-success';
    if (score < 60) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div
      className={`
        min-w-[200px] max-w-[300px] bg-card border-2 rounded-none
        transition-all duration-200
        ${selected ? 'border-info shadow-lg shadow-info/20' : 'border-border'}
        hover:border-border
      `}
    >
      {/* Handle for incoming connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-info !w-3 !h-3 !border-2 !border-card"
      />

      {/* Header */}
      <div className="px-3 py-2 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-info" />
          <h3 className="text-sm font-semibold text-info-foreground truncate" title={title}>
            {title}
          </h3>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-1" title={filePath}>
          {filePath}
        </p>
      </div>

      {/* Content */}
      <div className="px-3 py-2 space-y-2">
        {/* Language */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Language:</span>
          <span className="text-foreground font-mono">{analysis.language}</span>
        </div>

        {/* Lines of Code */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <FileCode className="w-3 h-3" />
            LOC:
          </span>
          <span className="text-foreground">{analysis.linesOfCode}</span>
        </div>

        {/* Functions & Classes */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Functions:</span>
          <span className="text-foreground">{analysis.functionCount}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Classes:</span>
          <span className="text-foreground">{analysis.classCount}</span>
        </div>

        {/* Complexity Score */}
        <div className="flex items-center justify-between text-xs border-t border-border pt-2 mt-2">
          <span className="text-muted-foreground">Complexity:</span>
          <span className={`font-mono font-bold ${getComplexityColor(analysis.complexity.complexityScore)}`}>
            {analysis.complexity.complexityScore}/100
          </span>
        </div>

        {/* Dependencies Badge */}
        {analysis.dependencies.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
            <Package className="w-3 h-3" />
            <span>{analysis.dependencies.length} deps</span>
          </div>
        )}

        {/* Concepts Badge */}
        {analysis.concepts.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <GitBranch className="w-3 h-3" />
            <span>{analysis.concepts.length} concepts</span>
          </div>
        )}
      </div>

      {/* Handle for outgoing connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-info !w-3 !h-3 !border-2 !border-card"
      />
    </div>
  );
};

export const CodeConceptNode = memo(CodeConceptNodeComponent);
