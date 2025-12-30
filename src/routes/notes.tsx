/**
 * Notes Route - Intelligent Knowledge Base ("The Brain")
 *
 * Routes to the Notes interface with BlockNote editor integration.
 * Component moved to notes.lazy.tsx for code splitting.
 *
 * @epic Epic-26 Intelligent Knowledge Base
 * @story 26-1 BlockNote Editor
 *
 * @file notes.tsx
 * @created 2025-12-28T10:00:00Z
 * @updated 2025-12-30T23:59:00Z - Fixed route configuration
 */

import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/notes')({
    // Component moved to notes.lazy.tsx for code splitting
});
