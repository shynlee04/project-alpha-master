/**
 * Knowledge Route - Knowledge Synthesis Hub
 *
 * Routes to the Knowledge Synthesis Station (Phase 2 MVP).
 * Integrated Source Library, Knowledge Canvas, and Synthesis Panel.
 *
 * @epic Epic-6 Source Ingestion & Management
 * @epic Epic-8 Knowledge Canvas
 * @story 6-2 Source Card UI
 * @story 8-1 React Flow Canvas Setup
 * 
 * @file knowledge.tsx
 * @created 2025-12-27T01:10:00Z
 * @updated 2025-12-30T04:00:00Z
 */

import { createFileRoute } from '@tanstack/react-router';
import { KnowledgePage } from '@/components/knowledge/KnowledgePage';

export const Route = createFileRoute('/knowledge')({
    component: KnowledgePage,
});
