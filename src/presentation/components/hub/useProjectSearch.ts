/**
 * @fileoverview Project Search Hook
 * @module presentation/components/hub/useProjectSearch
 * @created 2026-01-02T23:30:00+07:00
 *
 * Custom hook for debounced project search with keyboard shortcut.
 * Based on January 2026 research: 300ms debounce standard.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ProjectMetadata } from '@/lib/workspace/project-store';

export interface UseProjectSearchResult {
  /** Current search query */
  searchQuery: string;
  /** Update search query */
  setSearchQuery: (query: string) => void;
  /** Is search debounced (waiting for timeout) */
  isDebouncing: boolean;
  /** Filtered projects based on debounced query */
  filteredProjects: ProjectMetadata[];
  /** Is command palette open */
  isOpen: boolean;
  /** Open command palette */
  open: () => void;
  /** Close command palette */
  close: () => void;
  /** Toggle command palette */
  toggle: () => void;
}

/**
 * Custom hook for debounced project search.
 *
 * Features:
 * - 300ms debounce (industry standard for 2026)
 * - Fuzzy matching on project name and path
 * - Global keyboard shortcut (Cmd+K / Ctrl+K)
 * - Case-insensitive search
 *
 * @param projects - Array of projects to search
 * @param initialOpenState - Initial command palette open state
 * @returns Search state and handlers
 *
 * @example
 * ```tsx
 * const {
 *   searchQuery,
 *   setSearchQuery,
 *   filteredProjects,
 *   isOpen,
 *   close,
 * } = useProjectSearch(projects, false);
 * ```
 */
export function useProjectSearch(
  projects: ProjectMetadata[],
  initialOpenState: boolean = false
): UseProjectSearchResult {
  const [searchQuery, setSearchQueryState] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [isOpen, setIsOpen] = useState(initialOpenState);

  // Debounce search query with 300ms delay (industry standard)
  useEffect(() => {
    if (!searchQuery) {
      setDebouncedQuery('');
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);

    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setIsDebouncing(false);
    }, 300);

    return () => {
      clearTimeout(handler);
      setIsDebouncing(false);
    };
  }, [searchQuery]);

  // Filter projects based on debounced query (case-insensitive fuzzy match)
  const filteredProjects = useMemo(() => {
    if (!debouncedQuery) {
      return projects;
    }

    const query = debouncedQuery.toLowerCase();

    return projects.filter((project) => {
      const nameMatch = project.name?.toLowerCase().includes(query) ?? false;
      const pathMatch = project.path?.toLowerCase().includes(query) ?? false;

      return nameMatch || pathMatch;
    });
  }, [projects, debouncedQuery]);

  // Global keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        toggle();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]); // Re-bind when isOpen changes

  // Memoized callbacks to prevent unnecessary re-renders
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    setSearchQueryState('');
  }, []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  // Stable setSearchQuery reference
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    isDebouncing,
    filteredProjects,
    isOpen,
    open,
    close,
    toggle,
  };
}
