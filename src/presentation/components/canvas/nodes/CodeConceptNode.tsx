import React, { memo } from 'react';
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
    if (score < 30) return 'text-green-400';
    if (score < 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div
      className={`
        min-w-[200px] max-w-[300px] bg-gray-800 border-2 rounded-none
        transition-all duration-200
        ${selected ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-gray-700'}
        hover:border-gray-600
      `}
    >
      {/* Handle for incoming connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500 !w-3 !h-3 !border-2 !border-gray-900"
      />

      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-700 bg-gray-900/50">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-blue-100 truncate" title={title}>
            {title}
          </h3>
        </div>
        <p className="text-xs text-gray-400 truncate mt-1" title={filePath}>
          {filePath}
        </p>
      </div>

      {/* Content */}
      <div className="px-3 py-2 space-y-2">
        {/* Language */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Language:</span>
          <span className="text-gray-200 font-mono">{analysis.language}</span>
        </div>

        {/* Lines of Code */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400 flex items-center gap-1">
            <FileCode className="w-3 h-3" />
            LOC:
          </span>
          <span className="text-gray-200">{analysis.linesOfCode}</span>
        </div>

        {/* Functions & Classes */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Functions:</span>
          <span className="text-gray-200">{analysis.functionCount}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Classes:</span>
          <span className="text-gray-200">{analysis.classCount}</span>
        </div>

        {/* Complexity Score */}
        <div className="flex items-center justify-between text-xs border-t border-gray-700 pt-2 mt-2">
          <span className="text-gray-400">Complexity:</span>
          <span className={`font-mono font-bold ${getComplexityColor(analysis.complexity.complexityScore)}`}>
            {analysis.complexity.complexityScore}/100
          </span>
        </div>

        {/* Dependencies Badge */}
        {analysis.dependencies.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-400 pt-1">
            <Package className="w-3 h-3" />
            <span>{analysis.dependencies.length} deps</span>
          </div>
        )}

        {/* Concepts Badge */}
        {analysis.concepts.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <GitBranch className="w-3 h-3" />
            <span>{analysis.concepts.length} concepts</span>
          </div>
        )}
      </div>

      {/* Handle for outgoing connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-500 !w-3 !h-3 !border-2 !border-gray-900"
      />
    </div>
  );
};

export const CodeConceptNode = memo(CodeConceptNodeComponent);
