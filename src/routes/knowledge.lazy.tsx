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
 * @updated 2025-12-30T23:59:00Z - Standardized to barrel exports
 */

import { createLazyFileRoute } from '@tanstack/react-router';
import { KnowledgePage } from '@/components/knowledge/KnowledgePage';

export const Route = createLazyFileRoute('/knowledge')({
    component: KnowledgePage,
});
