/**
 * @fileoverview Citation Types for RAG
 * @module lib/rag/citation-types
 * @governance Story 32-3
 *
 * Type definitions for citation generation and display.
 */

import type { Citation } from './types';

/**
 * Citation style options for inline formatting
 */
export type CitationStyle = 'bracketed' | 'numeric' | 'named';

/**
 * Configuration for citation display
 */
export interface CitationDisplayConfig {
  /** Citation style to use */
  style: CitationStyle;
  
  /** Maximum excerpt length in characters */
  maxExcerptLength: number;
  
  /** Show relevance score */
  showScore: boolean;
  
  /** Show source title */
  showTitle: boolean;
  
  /** Sort citations by relevance */
  sortByRelevance: boolean;
}

/**
 * Default citation display configuration
 */
export const DEFAULT_CITATION_DISPLAY_CONFIG: CitationDisplayConfig = {
  style: 'bracketed',
  maxExcerptLength: 200,
  showScore: true,
  showTitle: true,
  sortByRelevance: true,
};

/**
 * Formatted citation for display in UI
 */
export interface DisplayCitation {
  /** Unique citation ID (1-indexed) */
  id: number;
  
  /** Source document ID */
  sourceId: string;
  
  /** Source title */
  title: string;
  
  /** Relevance score (0-1) */
  score: number;
  
  /** Passage from source */
  passage: string;
  
  /** Formatted inline citation string */
  inlineCitation: string;
  
  /** Position in response text */
  position?: {
    start: number;
    end: number;
  };
}

/**
 * Citation group for filtering
 */
export interface CitationGroup {
  /** Source ID for this group */
  sourceId: string;
  
  /** Source title */
  title: string;
  
  /** Citations in this group */
  citations: DisplayCitation[];
  
  /** Total count */
  count: number;
}

/**
 * Props for CitationSidebar component
 */
export interface CitationSidebarProps {
  /** Citations to display */
  citations: DisplayCitation[];
  
  /** Whether sidebar is open */
  isOpen: boolean;
  
  /** Callback when sidebar closes */
  onClose: () => void;
  
  /** Callback when citation is clicked */
  onCitationClick: (citation: DisplayCitation) => void;
  
  /** Selected citation IDs for filtering */
  selectedSources?: string[];
  
  /** Callback when source filter changes */
  onFilterChange?: (sourceIds: string[]) => void;
}

/**
 * Props for CitationCountBadge component
 */
export interface CitationCountBadgeProps {
  /** Number of citations */
  count: number;
  
  /** Callback when badge is clicked */
  onClick?: () => void;
  
  /** Whether citations panel is open */
  isOpen?: boolean;
}

/**
 * Citation navigation event
 */
export interface CitationNavigationEvent {
  /** Citation that was clicked */
  citation: DisplayCitation;
  
  /** Source document to navigate to */
  sourceId: string;
  
  /** Timestamp of navigation */
  timestamp: number;
}

/**
 * Citation filter state
 */
export interface CitationFilterState {
  /** Selected source IDs */
  selectedSources: string[];
  
  /** Minimum relevance score filter */
  minScore: number;
  
  /** Search query for filtering */
  searchQuery: string;
}
