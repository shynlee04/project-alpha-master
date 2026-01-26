/**
 * @fileoverview Workspace Filters Hook
 * @module presentation/components/hub/useWorkspaceFilters
 * @created 2026-01-03T00:00:00+07:00
 *
 * Custom hook for workspace filter state management.
 * Supports URL persistence via TanStack Router search params.
 */

import { useState, useCallback, useMemo } from 'react';

export type WorkspaceFilterType = 'ide' | 'knowledge' | 'notes' | 'study';

export interface WorkspaceFilters {
  ide: boolean;
  knowledge: boolean;
  notes: boolean;
  study: boolean;
}

export interface UseWorkspaceFiltersResult {
  /** Current filter state */
  filters: WorkspaceFilters;
  /** Update a single workspace filter */
  setFilter: (workspace: WorkspaceFilterType, checked: boolean) => void;
  /** Toggle a workspace filter */
  toggleFilter: (workspace: WorkspaceFilterType) => void;
  /** Set all filters to true */
  selectAll: () => void;
  /** Set all filters to false */
  deselectAll: () => void;
  /** Clear all filters (same as deselectAll) */
  clearAll: () => void;
  /** Number of active filters */
  activeCount: number;
  /** Whether all filters are active */
  allSelected: boolean;
  /** Whether no filters are active */
  noneSelected: boolean;
  /** Whether some (but not all) filters are active */
  partiallySelected: boolean;
  /** Get array of active workspace IDs */
  activeWorkspaces: WorkspaceFilterType[];
}

const DEFAULT_FILTERS: WorkspaceFilters = {
  ide: true,
  knowledge: true,
  notes: true,
  study: true,
};

/**
 * Parse filter from URL search param
 * @param searchParam - URL search param value (e.g., "ide,knowledge")
 * @returns Workspace filters object
 */
function parseFiltersFromURL(searchParam: string | null): WorkspaceFilters {
  if (!searchParam) {
    return { ...DEFAULT_FILTERS };
  }

  const workspaces = searchParam.split(',').filter(Boolean) as WorkspaceFilterType[];

  return {
    ide: workspaces.includes('ide'),
    knowledge: workspaces.includes('knowledge'),
    notes: workspaces.includes('notes'),
    study: workspaces.includes('study'),
  };
}

/**
 * Convert workspace filters to URL search param
 * @param filters - Workspace filters object
 * @returns URL search param value (e.g., "ide,knowledge")
 */
function filtersToURL(filters: WorkspaceFilters): string | null {
  const active = Object.entries(filters)
    .filter(([_, checked]) => checked)
    .map(([workspace, _]) => workspace)
    .join(',');

  return active || null;
}

/**
 * Custom hook for workspace filter state management.
 *
 * Features:
 * - URL persistence via TanStack Router search params
 * - Select/deselect all functionality
 * - Computed values (activeCount, allSelected, etc.)
 * - Optimized with useMemo and useCallback
 *
 * @param defaultFilters - Optional default filters (default: all true)
 * @param syncWithURL - Whether to sync filters with URL (default: true)
 * @returns Filter state and handlers
 *
 * @example
 * ```tsx
 * const {
 *   filters,
 *   setFilter,
 *   selectAll,
 *   deselectAll,
 *   activeCount,
 * } = useWorkspaceFilters();
 * ```
 */
export function useWorkspaceFilters(
  defaultFilters: WorkspaceFilters = DEFAULT_FILTERS,
  syncWithURL: boolean = false  // Disabled: TanStack Router URL sync needs implementation
): UseWorkspaceFiltersResult {
  const [searchParams, setSearchParams] = useState(new URLSearchParams());

  // Initialize filters from URL or defaults
  const [filters, setFiltersState] = useState<WorkspaceFilters>(() => {
    if (syncWithURL) {
      const filterParam = searchParams.get('workspaces');
      return parseFiltersFromURL(filterParam);
    }
    return { ...defaultFilters };
  });

  // Update single filter
  const setFilter = useCallback((workspace: WorkspaceFilterType, checked: boolean) => {
    setFiltersState((prev) => {
      const newFilters = { ...prev, [workspace]: checked };

      // Sync to URL if enabled
      if (syncWithURL) {
        const filterParam = filtersToURL(newFilters);
        if (filterParam) {
          searchParams.set('workspaces', filterParam);
        } else {
          searchParams.delete('workspaces');
        }
        setSearchParams(searchParams);
      }

      return newFilters;
    });
  }, [syncWithURL, searchParams, setSearchParams]);

  // Toggle filter
  const toggleFilter = useCallback((workspace: WorkspaceFilterType) => {
    const current = filters[workspace];
    setFilter(workspace, !current);
  }, [filters, setFilter]);

  // Select all filters
  const selectAll = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);

    if (syncWithURL) {
      searchParams.delete('workspaces'); // Empty param = all selected
      setSearchParams(searchParams);
    }
  }, [syncWithURL, searchParams, setSearchParams]);

  // Deselect all filters
  const deselectAll = useCallback(() => {
    const emptyFilters: WorkspaceFilters = {
      ide: false,
      knowledge: false,
      notes: false,
      study: false,
    };

    setFiltersState(emptyFilters);

    if (syncWithURL) {
      searchParams.set('workspaces', ''); // Empty string = none selected
      setSearchParams(searchParams);
    }
  }, [syncWithURL, searchParams, setSearchParams]);

  // Clear all (alias for deselectAll)
  const clearAll = deselectAll;

  // Computed values
  const activeCount = useMemo(() => {
    return Object.values(filters).filter(Boolean).length;
  }, [filters]);

  const allSelected = useMemo(() => {
    return activeCount === 4;
  }, [activeCount]);

  const noneSelected = useMemo(() => {
    return activeCount === 0;
  }, [activeCount]);

  const partiallySelected = useMemo(() => {
    return activeCount > 0 && activeCount < 4;
  }, [activeCount]);

  const activeWorkspaces = useMemo(() => {
    return Object.entries(filters)
      .filter(([_, checked]) => checked)
      .map(([workspace, _]) => workspace as WorkspaceFilterType);
  }, [filters]);

  return {
    filters,
    setFilter,
    toggleFilter,
    selectAll,
    deselectAll,
    clearAll,
    activeCount,
    allSelected,
    noneSelected,
    partiallySelected,
    activeWorkspaces,
  };
}
