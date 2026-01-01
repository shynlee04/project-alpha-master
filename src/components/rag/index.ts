/**
 * @fileoverview RAG Components Barrel Export
 * @module components/rag
 * @governance Story 32-3 - Semantic Citation System
 *
 * Barrel export for RAG UI components.
 */

export { CitationSidebar } from './CitationSidebar';
export { CitationCountBadge } from './CitationCountBadge';

export type {
  CitationSidebarProps,
  CitationCountBadgeProps
} from '@/lib/rag/citation-types';
