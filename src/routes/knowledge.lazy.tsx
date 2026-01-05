/**
 * Knowledge Route - Lazy Loaded
 *
 * Lazy-loaded route for the Knowledge Synthesis Station.
 * Integrated Source Library, Knowledge Canvas, and RAG Panel.
 *
 * @epic Epic-6 Source Ingestion & Management
 * @epic Epic-8 Knowledge Canvas
 * @story 6-2 Source Card UI
 * @story 8-1 React Flow Canvas Setup
 *
 * @file knowledge.lazy.tsx
 * @created 2025-12-30T23:59:00Z
 * @updated 2026-01-05 - FIX: Wrap in ProjectProvider to prevent useProjectContext crash
 */

import { createLazyFileRoute } from '@tanstack/react-router';
import { KnowledgePage } from '@/presentation/components/knowledge/KnowledgePage';
import { ProjectProvider } from '@/lib/workspace/ProjectContext';

export const Route = createLazyFileRoute('/knowledge')({
  component: KnowledgeWorkspace,
});

/**
 * Knowledge workspace wrapper with ProjectProvider
 * FIX-2026-01-05: Without this, useProjectContext throws when used in child components
 */
function KnowledgeWorkspace() {
  return (
    <ProjectProvider project={null} workspace="knowledge">
      <KnowledgePage />
    </ProjectProvider>
  );
}
