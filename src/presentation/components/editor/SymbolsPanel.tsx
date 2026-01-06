/**
 * Symbols Panel Component
 * @module components/editor/SymbolsPanel
 *
 * Shows symbol outline for current file
 * Displays symbols in tree structure with icons and filtering
 *
 * S-043: Code Navigation
 */

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { OutlineNode, SymbolKind } from '@/lib/navigation/symbol-outline';
import { ChevronRight, ChevronDown, Search, Package } from 'lucide-react';

export interface SymbolsPanelProps {
  /** Outline nodes to display */
  outline: OutlineNode[];
  /** Whether panel is visible */
  visible?: boolean;
  /** Callback when symbol is clicked */
  onSymbolClick?: (node: OutlineNode) => void;
  /** Whether to show visibility badges */
  showVisibility?: boolean;
  /** Maximum height (in pixels or dvh) */
  maxHeight?: string;
  /** Whether panel is read-only (mobile) */
  readOnly?: boolean;
}

/**
 * Symbols panel component
 */
export function SymbolsPanel({
  outline,
  visible = true,
  onSymbolClick,
  showVisibility = true,
  maxHeight = '100%',
  readOnly = false,
}: SymbolsPanelProps): React.JSX.Element {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Filter outline based on search query
  const filteredOutline = useMemo(() => {
    if (!searchQuery.trim()) {
      return outline;
    }

    const query = searchQuery.toLowerCase();

    function filterNode(node: OutlineNode): OutlineNode | null {
      const matches = node.name.toLowerCase().includes(query);

      let filteredChildren: OutlineNode[] | undefined;
      if (node.children && node.children.length > 0) {
        filteredChildren = node.children
          .map((child) => filterNode(child))
          .filter((child): child is OutlineNode => child !== null);
      }

      if (matches || (filteredChildren && filteredChildren.length > 0)) {
        return {
          ...node,
          children: filteredChildren,
        };
      }

      return null;
    }

    return outline
      .map((node) => filterNode(node))
      .filter((node): node is OutlineNode => node !== null);
  }, [outline, searchQuery]);

  // Toggle node expansion
  const toggleNode = (nodeKey: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeKey)) {
        next.delete(nodeKey);
      } else {
        next.add(nodeKey);
      }
      return next;
    });
  };

  // Get visibility badge color
  const getVisibilityBadge = (visibility?: 'public' | 'private' | 'protected') => {
    if (!showVisibility || !visibility) return null;

    const badges = {
      public: 'bg-green-900 text-green-300',
      private: 'bg-red-900 text-red-300',
      protected: 'bg-yellow-900 text-yellow-300',
    };

    return (
      <span className={`text-xs px-1.5 py-0.5 rounded ${badges[visibility]}`}>
        {visibility[0].toUpperCase()}
      </span>
    );
  };

  // Get symbol kind color
  const getKindColor = (kind: SymbolKind): string => {
    const colors: Record<SymbolKind, string> = {
      function: 'text-blue-400',
      method: 'text-blue-400',
      class: 'text-purple-400',
      interface: 'text-purple-400',
      type: 'text-cyan-400',
      variable: 'text-orange-400',
      constant: 'text-yellow-400',
      enum: 'text-pink-400',
      namespace: 'text-green-400',
      module: 'text-green-400',
      constructor: 'text-blue-400',
      property: 'text-orange-400',
      enumMember: 'text-pink-400',
    };
    return colors[kind] || 'text-slate-400';
  };

  if (!visible) {
    return <></>;
  }

  return (
    <div
      className="symbols-panel flex flex-col bg-slate-900 border-l border-slate-800"
      style={{ height: maxHeight, maxHeight }}
    >
      {/* Panel header */}
      <div className="px-3 py-2 border-b border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-200">
              {t('navigation.symbols', 'Symbols')}
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {outline.reduce((count, node) => count + countSymbols(node), 0)}
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('navigation.searchSymbols', 'Search symbols...')}
            className="w-full pl-7 pr-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Symbols tree */}
      <div className="flex-1 overflow-auto p-2">
        {filteredOutline.length === 0 ? (
          <div className="text-center text-slate-500 text-xs py-4">
            {searchQuery
              ? t('navigation.noSymbolsFound', 'No symbols found')
              : t('navigation.noSymbols', 'No symbols in file')}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredOutline.map((node, index) => (
              <SymbolTreeNode
                key={`${node.name}-${index}`}
                node={node}
                level={0}
                expanded={expandedNodes.has(`${node.name}-${index}`)}
                onToggle={() => toggleNode(`${node.name}-${index}`)}
                onClick={() => onSymbolClick?.(node)}
                getVisibilityBadge={getVisibilityBadge}
                getKindColor={getKindColor}
                readOnly={readOnly}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Symbol tree node component (internal)
 */
interface SymbolTreeNodeProps {
  node: OutlineNode;
  level: number;
  expanded: boolean;
  onToggle: () => void;
  onClick: () => void;
  getVisibilityBadge: (visibility?: 'public' | 'private' | 'protected') => React.JSX.Element | null;
  getKindColor: (kind: SymbolKind) => string;
  readOnly: boolean;
}

function SymbolTreeNode({
  node,
  level,
  expanded,
  onToggle,
  onClick,
  getVisibilityBadge,
  getKindColor,
  readOnly,
}: SymbolTreeNodeProps): React.JSX.Element {
  const hasChildren = node.children && node.children.length > 0;
  const paddingLeft = `${level * 16 + 8}px`;

  return (
    <div>
      {/* Node row */}
      <div
        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 cursor-pointer transition-colors"
        style={{ paddingLeft }}
        onClick={() => {
          if (hasChildren && !readOnly) {
            onToggle();
          }
          onClick();
        }}
      >
        {/* Expand/collapse icon */}
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!readOnly) onToggle();
            }}
            className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-slate-500 hover:text-slate-300"
          >
            {expanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {/* Symbol icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`flex-shrink-0 ${getKindColor(node.kind)}`}
        >
          {getIconPathForKind(node.kind)}
        </svg>

        {/* Symbol name */}
        <span className="flex-1 text-xs font-mono text-slate-300 truncate">
          {node.name}
        </span>

        {/* Visibility badge */}
        {getVisibilityBadge(node.visibility)}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="mt-0.5">
          {node.children!.map((child, index) => (
            <SymbolTreeNode
              key={`${child.name}-${index}`}
              node={child}
              level={level + 1}
              expanded={false}
              onToggle={() => {}}
              onClick={() => onClick()}
              getVisibilityBadge={getVisibilityBadge}
              getKindColor={getKindColor}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Count total symbols in node (including children)
 */
function countSymbols(node: OutlineNode): number {
  let count = 1;
  if (node.children) {
    for (const child of node.children) {
      count += countSymbols(child);
    }
  }
  return count;
}

/**
 * Get SVG icon path for symbol kind
 */
function getIconPathForKind(kind: SymbolKind): React.JSX.Element {
  switch (kind) {
    case 'function':
    case 'method':
      return <polyline points="4 17 10 11 4 5" />;
    case 'class':
    case 'interface':
      return <rect x="3" y="3" width="18" height="18" rx="2" />;
    case 'type':
      return (
        <>
          <path d="M4 7V4h16v3" />
          <path d="M4 14v-3h16v3" />
          <path d="M4 21v-3h16v3" />
        </>
      );
    case 'variable':
    case 'constant':
      return <circle cx="12" cy="12" r="10" />;
    case 'enum':
      return (
        <>
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </>
      );
    case 'namespace':
    case 'module':
      return (
        <>
          <path d="M3 7V4h18v3" />
          <path d="M3 21v-3h18v3" />
        </>
      );
    default:
      return <circle cx="12" cy="12" r="10" />;
  }
}

export default SymbolsPanel;
