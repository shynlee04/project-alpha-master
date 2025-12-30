/**
 * Notes Route
 *
 * Base route file for the Intelligent Knowledge Base ("The Brain").
 * Component is lazy-loaded via notes.lazy.tsx.
 *
 * @epic Epic-26 Intelligent Knowledge Base
 * @story 26-1 BlockNote Editor
 *
 * @file notes.tsx
 * @created 2025-12-31T00:55:00Z
 */

import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/notes')({
    // Component is lazy-loaded via notes.lazy.tsx
});
