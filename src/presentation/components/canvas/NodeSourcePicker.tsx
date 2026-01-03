/**
 * @fileoverview Node Source Picker Component
 * @module presentation/components/canvas/NodeSourcePicker
 * @governance EPIC-7-1, UC2
 *
 * Multi-select interface for choosing canvas nodes to analyze.
 * Provides filtering by node type and bulk selection controls.
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Lightbulb, Check } from 'lucide-react';
import { useCanvasStore } from '@/infrastructure/persistence/stores/canvas-store';

/**
 * Props for NodeSourcePicker
 */
export interface NodeSourcePickerProps {
  /** Selected node IDs */
  selectedIds: string[];
  /** Callback when selection changes */
  onSelectionChange: (ids: string[]) => void;
  /** Minimum number of nodes to select (default: 2) */
  minSelection?: number;
}

/**
 * Node filter type
 */
type NodeFilterType = 'all' | 'source' | 'concept';

/**
 * NodeSourcePicker Component
 *
 * Provides multi-select interface with:
 * - Filter tabs (all/source/concept)
 * - Select all / deselect all
 * - Individual node checkboxes
 * - Selection count indicator
 */
export function NodeSourcePicker({
  selectedIds,
  onSelectionChange,
  minSelection = 2,
}: NodeSourcePickerProps) {
  const { t } = useTranslation();

  // Get nodes from canvas store
  const nodes = useCanvasStore((s) => s.nodes);

  // Filter state
  const [filterType, setFilterType] = useState<NodeFilterType>('all');

  // Filter nodes by type
  const filteredNodes = useMemo(() => {
    if (filterType === 'all') return nodes;
    return nodes.filter((n) => n.type === filterType);
  }, [nodes, filterType]);

  // Calculate counts by type
  const counts = useMemo(() => {
    return {
      all: nodes.filter((n) => n.type === 'source' || n.type === 'concept').length,
      source: nodes.filter((n) => n.type === 'source').length,
      concept: nodes.filter((n) => n.type === 'concept').length,
    };
  }, [nodes]);

  // Toggle single node selection
  const handleToggleNode = (nodeId: string) => {
    const newSelection = selectedIds.includes(nodeId)
      ? selectedIds.filter((id) => id !== nodeId)
      : [...selectedIds, nodeId];
    onSelectionChange(newSelection);
  };

  // Toggle all filtered nodes
  const handleToggleAll = () => {
    const filteredIds = filteredNodes.map((n) => n.id);
    const allSelected = filteredIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      // Deselect all filtered
      const newSelection = selectedIds.filter((id) => !filteredIds.includes(id));
      onSelectionChange(newSelection);
    } else {
      // Select all filtered (union with existing)
      const newSelection = Array.from(new Set([...selectedIds, ...filteredIds]));
      onSelectionChange(newSelection);
    }
  };

  // Check if all filtered nodes are selected
  const allFilteredSelected =
    filteredNodes.length > 0 && filteredNodes.every((n) => selectedIds.includes(n.id));

  // Some but not all selected

  return (
    <div className="flex flex-col gap-2">
      {/* Filter tabs */}
      <div className="flex items-center gap-1 text-xs">
        <FilterTab
          active={filterType === 'all'}
          count={counts.all}
          onClick={() => setFilterType('all')}
        >
          {t('canvas.picker.all', 'All')}
        </FilterTab>
        <FilterTab
          active={filterType === 'source'}
          count={counts.source}
          onClick={() => setFilterType('source')}
        >
          {t('canvas.picker.sources', 'Sources')}
        </FilterTab>
        <FilterTab
          active={filterType === 'concept'}
          count={counts.concept}
          onClick={() => setFilterType('concept')}
        >
          {t('canvas.picker.concepts', 'Concepts')}
        </FilterTab>
      </div>

      {/* Select all / deselect all */}
      {filteredNodes.length > 0 && (
        <div
          className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/50 p-1 rounded"
          onClick={handleToggleAll}
        >
          <div className="w-4 h-4 border rounded flex items-center justify-center bg-background">
            {allFilteredSelected && <Check size={12} />}
          </div>
          <span>
            {allFilteredSelected
              ? t('canvas.picker.deselectAll', 'Deselect All')
              : t('canvas.picker.selectAll', 'Select All')}
          </span>
        </div>
      )}

      {/* Node list */}
      <div className="max-h-60 overflow-y-auto flex flex-col gap-1">
        {filteredNodes.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-4">
            {t('canvas.picker.noNodes', 'No nodes available')}
          </div>
        ) : (
          filteredNodes.map((node) => {
            const data = node.data as { title: string; contentType?: string };
            const isSelected = selectedIds.includes(node.id);

            return (
              <div
                key={node.id}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                  isSelected ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30 hover:bg-muted/50'
                }`}
                onClick={() => handleToggleNode(node.id)}
              >
                {/* Checkbox */}
                <div className="w-4 h-4 border rounded flex items-center justify-center bg-background">
                  {isSelected && <Check size={12} className="text-primary" />}
                </div>

                {/* Icon */}
                {node.type === 'source' ? (
                  <FileText size={14} className="text-muted-foreground" />
                ) : (
                  <Lightbulb size={14} className="text-muted-foreground" />
                )}

                {/* Title */}
                <span className="text-xs truncate flex-1" title={data.title}>
                  {data.title || 'Untitled'}
                </span>

                {/* Content type badge (source only) */}
                {node.type === 'source' && data.contentType && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground">
                    {data.contentType.toUpperCase()}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Selection count */}
      <div
        className={`text-xs text-center py-1 ${
          selectedIds.length < minSelection ? 'text-red-500' : 'text-muted-foreground'
        }`}
      >
        {selectedIds.length < minSelection ? (
          <span>
            {t('canvas.picker.selectMore', 'Select at least {{min}} nodes', { min: minSelection })}
          </span>
        ) : (
          <span>
            {t('canvas.picker.selected', '{{count}} selected', { count: selectedIds.length })}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Filter tab button component
 */
interface FilterTabProps {
  active: boolean;
  count: number;
  onClick: () => void;
  children: React.ReactNode;
}

function FilterTab({ active, count, onClick, children }: FilterTabProps) {
  return (
    <button
      className={`px-2 py-1 rounded text-xs transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted hover:bg-muted/70 text-muted-foreground'
      }`}
      onClick={onClick}
    >
      {children} ({count})
    </button>
  );
}

/**
 * Default export
 */
export default NodeSourcePicker;
