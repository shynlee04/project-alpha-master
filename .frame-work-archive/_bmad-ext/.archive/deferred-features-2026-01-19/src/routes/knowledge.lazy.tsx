/**
 * @fileoverview Knowledge Workspace Route
 * @module routes/knowledge
 * @governance WS-2026-01-07
 * @updated 2026-01-08T23:30:00+07:00
 *
 * ═══════════════════════════════════════════════════════════════
 * ⚠️ PHASE 1 DETACHMENT
 * Feature: Knowledge Workspace with useWorkspaceAccess hook
 * Reason: useWorkspaceAccess causes infinite loops / returns 'no_projects'
 * Re-attach in: Phase 2 (after P1-11 gate passes)
 * Gate: GATE-R1, GATE-R3 must pass (/notes and /ide render without errors)
 * Tracking: _bmad-output/project-planning-artifacts/phase-1-epics-2026-01-08.md
 * ═══════════════════════════════════════════════════════════════
 *
 * PHASE 1 STATUS: PLACEHOLDER - Shows "Coming in Phase 2"
 * Original implementation preserved below with marker.
 */

import { createLazyFileRoute } from '@tanstack/react-router';
import { ErrorBoundary } from '@/presentation/components/error';
import { BookOpen } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

/**
 * Route definition with ErrorBoundary protection
 */
export const Route = createLazyFileRoute('/knowledge')({
  component: () => (
    <ErrorBoundary
      fallback={
        <div className="p-6 text-center">
          <h2 className="text-lg font-bold mb-2">Knowledge Workspace Failed</h2>
          <p className="text-muted-foreground mb-4">
            An unexpected error occurred. Please retry or contact support.
          </p>
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      }
      onError={(error, errorInfo) => {
        console.error('[Knowledge Workspace] Error:', error, errorInfo);
      }}
    >
      <KnowledgeWorkspacePhase1 />
    </ErrorBoundary>
  ),
});

/**
 * PHASE 1: Knowledge Workspace Placeholder
 *
 * Shows "Coming in Phase 2" message with navigation options.
 */
function KnowledgeWorkspacePhase1() {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 max-w-md text-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 bg-primary/10 rounded-lg">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Knowledge Workspace</h2>
          <p className="text-muted-foreground">
            Manage your knowledge base, documents, and research.
          </p>
        </div>
        <div className="p-4 bg-muted rounded-md border border-border">
          <p className="text-sm font-medium">Coming in Phase 2</p>
          <p className="text-xs text-muted-foreground mt-1">
            Knowledge workspace will be available after IDE and Notes workspaces are fully functional.
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={() => navigate({ to: '/ide' })}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium flex items-center justify-center gap-2"
          >
            Go to IDE
          </button>
          <button
            onClick={() => navigate({ to: '/notes' })}
            className="w-full px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 font-medium flex items-center justify-center gap-2"
          >
            Go to Notes
          </button>
          <button
            onClick={() => navigate({ to: '/hub' })}
            className="w-full px-6 py-2 border border-border text-foreground rounded-lg hover:bg-muted font-medium"
          >
            Back to Hub
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Phase 1: IDE and Notes workspaces are the priority
        </p>
      </div>
    </div>
  );
}

/**
 * ═══════════════════════════════════════════════════════════════
 * ⚠️ PHASE 1 DETACHMENT: Original KnowledgeWorkspace implementation
 * Reason: useWorkspaceAccess hook causes infinite loops
 * Re-attach in: Phase 2 (after P1-11 gate passes)
 * ═══════════════════════════════════════════════════════════════

function KnowledgeWorkspace_Original() {
  const { state, actions, status } = useWorkspaceAccess('knowledge');

  // FIX-2026-01-08: Show loading state while Dexie data loads
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // If no projects, show empty state with quick-create option
  if (status === 'no_projects') {
    return <WorkspaceAccessEmptyState workspace="knowledge" status={state} actions={actions} />;
  }

  // If projects exist but none have knowledge binding, show enable option
  if (status === 'no_binding') {
    return <WorkspaceAccessEmptyState workspace="knowledge" status={state} actions={actions} />;
  }

  // has_projects: Show the workspace with project list/selector
  return (
    <ProjectProvider project={null} workspace="knowledge">
      <KnowledgePage />
    </ProjectProvider>
  );
}

export function KnowledgeProjectWorkspace() {
  return (
    <ProjectProvider project={null} workspace="knowledge">
      <KnowledgePage />
    </ProjectProvider>
  );
}

*/
