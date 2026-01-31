# Hub → Knowledge Journey

**Analysis Date:** 2026-01-09

---

## Executive Summary

The **Knowledge workspace is COMPLETELY NON-FUNCTIONAL in Phase 1**. It shows a placeholder "Coming in Phase 2" because the `useWorkspaceAccess` hook causes infinite loops.

---

## Current Status: Phase 1 Placeholder

### Route File
- **File:** `src/routes/knowledge.lazy.tsx` (154 lines)
- **Status:** Shows placeholder UI

### Placeholder Component
```typescript
function KnowledgeWorkspacePhase1() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 max-w-md text-center p-8">
        <div className="p-4 bg-primary/10 rounded-lg">
          <BookOpen className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Knowledge Workspace</h2>
        <p className="text-muted-foreground">
          Manage your knowledge base, documents, and research.
        </p>
        <div className="p-4 bg-muted rounded-md border border-border">
          <p className="text-sm font-medium">Coming in Phase 2</p>
          <p className="text-xs text-muted-foreground mt-1">
            Knowledge workspace will be available after IDE and Notes workspaces are fully functional.
          </p>
        </div>
        {/* Navigation buttons to other workspaces */}
      </div>
    </div>
  );
}
```

---

## Original Implementation (Preserved, Commented Out)

### Original KnowledgeWorkspace (lines 115-143)
```typescript
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

  // If no projects, show empty state
  if (status === 'no_projects') {
    return <WorkspaceAccessEmptyState workspace="knowledge" status={state} actions={actions} />;
  }

  // If no binding, show enable option
  if (status === 'no_binding') {
    return <WorkspaceAccessEmptyState workspace="knowledge" status={state} actions={actions} />;
  }

  // has_projects: Show the workspace
  return (
    <ProjectProvider project={null} workspace="knowledge">
      <KnowledgePage />
    </ProjectProvider>
  );
}
```

---

## Why Knowledge is Broken

### Root Cause: useWorkspaceAccess Hook
```
workspace-access-helper.tsx (lines 230-238)
├── FIX-2026-01-08: COMPLETELY REMOVED useLiveQuery
├── useLiveQuery was causing "Maximum update depth exceeded" errors
├── Root cause: Dexie's live query subscription conflicts with React's render cycle
└── Current implementation: STATIC MOCK DATA (non-functional)
```

### Current useWorkspaceAccess State
```typescript
// STATIC MOCK DATA - no database access
const allProjects: ProjectRecord[] = [];
const workspaceProjects: ProjectRecord[] = [];
const mostRecentProject = null;
const status: WorkspaceAccessStatus = 'no_projects';
```

**Impact:** ANY workspace using `useWorkspaceAccess` will always see:
- `status === 'no_projects'`
- Empty project lists
- Broken functionality

---

## Original KnowledgePage Dependencies

### If Re-attached, KnowledgePage Would Need:
1. **rag-store.ts** (1,595 lines - GOD STORE)
   - Orama vector index
   - Incremental indexing service
   - Embedding generation

2. **Dexie Tables**
   - `sources` - document metadata
   - `vectors` - embedding vectors
   - `chunks` - text chunks

3. **useLiveQuery Hooks**
   - querySources()
   - queryVectors()
   - indexingStatus()

---

## Phase 1 Detachment Documentation

### From knowledge.lazy.tsx (lines 7-14)
```
═══════════════════════════════════════════════════════════════
⚠️ PHASE 1 DETACHMENT
Feature: Knowledge Workspace with useWorkspaceAccess hook
Reason: useWorkspaceAccess causes infinite loops / returns 'no_projects'
Re-attach in: Phase 2 (after P1-11 gate passes)
Gate: GATE-R1, GATE-R3 must pass (/notes and /ide render without errors)
Tracking: _bmad-output/project-planning-artifacts/phase-1-epics-2026-01-08.md
═══════════════════════════════════════════════════════════════
```

### GATE Requirements
| Gate | Requirement | Status |
|------|-------------|--------|
| GATE-R1 | /notes renders without errors | ✅ PASS |
| GATE-R3 | /ide renders without errors | ✅ PASS |

**Both gates passed - Knowledge could be re-attached!**

---

## What Would Be Needed to Re-attach

### 1. Fix useWorkspaceAccess Hook
- Re-implement with proper `useLiveQuery` + default values
- Or use alternative data fetching pattern

### 2. Audit rag-store.ts (1,595 lines)
- Potential god store issues
- Complex RAG pipeline logic
- Multiple responsibilities

### 3. Re-attach Original KnowledgeWorkspace
```typescript
function KnowledgeWorkspace() {
  const { state, actions, status } = useWorkspaceAccess('knowledge');
  
  // ... handle loading, no_projects, no_binding, has_projects
}
```

---

## Timeline

| Phase | Status | ETA |
|-------|--------|-----|
| Phase 1 | Detached (Placeholder) | Now |
| Phase 2 | Planned | TBD |
| Re-attachment | Requires useWorkspaceAccess fix | After P0 fix |

---

## Recommendations

### P0: Fix useWorkspaceAccess
**This is blocking Knowledge, Study, and other workspaces**

### P1: Re-attach Knowledge
**After useWorkspaceAccess is fixed:**
1. Remove placeholder
2. Uncomment original implementation
3. Test with real Dexie data

### P2: Audit rag-store
**After Knowledge is functional:**
1. Split rag-store.ts into slices
2. Reduce from 1,595 lines to <300 lines per slice
3. Test RAG functionality

---

*Generated by Codebase Diagnostic Workflow v1.0.0*
*Phase 1: User Journeys*
*Date: 2026-01-09*
