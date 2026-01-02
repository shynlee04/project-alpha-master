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
 * @updated 2025-12-31T12:05:00Z - Fixed duplicate route issue
 */

import { createLazyFileRoute } from '@tanstack/react-router';
import { KnowledgePage } from '@/presentation/components/knowledge/KnowledgePage';
import { WorkspaceProvider } from '@/infrastructure/persistence/stores/workspace';

export const Route = createLazyFileRoute('/knowledge')({
  component: () => (
    <WorkspaceProvider initialWorkspace="knowledge">
      <KnowledgePage />
    </WorkspaceProvider>
  ),
});
