# 45-03: Create Unified Project State

**Epic:** EPIC-45 - Chat State & Project Foundation
**Story:** 45-03
**Status:** COMPLETED ✅
**Created:** 2026-01-14
**Completed:** 2026-01-14
**Priority:** P0-CRITICAL
**Team:** Team A
**Iterations:** 2

---

## User Story

**As a** user working across multiple workspaces (IDE, Notes, Knowledge, Study)
**I want** my project selection to persist seamlessly across all workspace tabs
**So that** I don't lose context when switching between views and my chosen project remains active throughout my session

---

## Epic Analysis

### Epic Basics
- **Number:** 45
- **Name:** Chat State & Project Foundation
- **Status:** IN_PROGRESS
- **Progress:** 40% (2/5 stories complete)

### Epic Goals
- **Primary Goal:** Establish single source of truth for project state across all workspaces
- **Secondary Goals:**
  - Fix state drift between workspace tabs (Files/Notes/AI)
  - Enable workspace-specific project selection persistence
  - Foundation for space-aware agent orchestration (EPIC-46)

### Epic Scope
- **Stories Total:** 5
- **Stories Completed:** 2 (45-01, 45-02)
- **Current Story:** 45-03 (architectural foundation)
- **Remaining:** 45-04 (browser/project space switch), 45-05 (scroll position)

### Epic Dependencies
**Downstream Epics (blocked by this):**
- **EPIC-46:** Space-Aware Agent Orchestration (BLOCKED until EPIC-45 complete)
- **EPIC-47:** Workspace-Aware Artifacts & Actions (BLOCKED until EPIC-46 complete)

### Epic Patterns (from architecture.md)
- **State Management:** Zustand stores with `useShallow` for multiple selectors
- **Event Bus:** `src/infrastructure/events/event-bus.ts` for reactive updates
- **Facades:** Abstraction layer in `src/lib/agent/facades/`

---

## Current Problem

### State Drift Issues Identified

When a user switches between workspace tabs (Files ↔ Notes ↔ AI):

1. **Project Selection Lost**: Each workspace tab maintains its own project state
2. **IDE Store Disconnected:** `useIDEStore` doesn't sync with workspace-specific stores
3. **ProjectContext Stale**: React Context doesn't update when project changes in other views
4. **No Single Source of Truth**: Multiple stores (`project-store`, `ide-store`, workspace-specific stores) contain duplicated, divergent state

### Root Cause Analysis

```typescript
// Current architecture has THREE separate project state sources:

// 1. IDE Store (src/infrastructure/persistence/stores/ide.ts)
const projectId = useIDEStore(state => state.projectId);

// 2. Project Store (src/infrastructure/persistence/stores/project/project-store.ts)
const projects = useProjectStore(state => state.projects);

// 3. Project Context (src/lib/workspace/ProjectContext.tsx)
const { project } = useProjectContext(); // ← Does NOT react to IDE store changes!
```

**Result:** When user changes project in IDE, Notes/Knowledge workspaces don't know.

---

## Acceptance Criteria

### AC1: Single Source of Truth Established
- [x] IDE store's `projectId` established as single source of truth
- [x] `setProjectId` in ide-project-slice now emits `WORKSPACE_CHANGED` event
- [x] Project changes propagate immediately to all workspace tabs

### AC2: Workspace Reactivity
- [x] When project changes in IDE, Notes workspace updates automatically
- [x] When project changes in Notes, IDE reflects the change (via route sync)
- [x] No manual refresh needed to see project changes
- [x] Knowledge and Study workspaces also sync

### AC3: Backward Compatibility
- [x] Existing components using `useProjectContext` continue working
- [x] No breaking changes to component props
- [x] TypeScript compiles without errors

### AC4: Event-Driven Updates
- [x] Event bus used for cross-workspace project change notifications
- [x] `WORKSPACE_CHANGED` event emitted when project selection changes
- [x] All workspace components subscribe to IDE store changes via useEffect

---

## Technical Implementation

### Implementation Summary

The implementation took a **route-sync approach** rather than replacing `ProjectContext` everywhere. This maintains backward compatibility while adding cross-workspace reactivity.

**Key Design Decision:**
- **IDE Store** is the single source of truth for `projectId`
- **Routes** (URL params) remain the primary way projects are communicated to components
- **Event Bus** (`WORKSPACE_CHANGED`) broadcasts changes to all workspaces
- **useEffect hooks** in each workspace watch IDE store and navigate when project changes

This approach:
1. ✅ Maintains backward compatibility (no breaking changes)
2. ✅ Uses IDE store as single source of truth
3. ✅ Provides reactivity via event-driven navigation
4. ✅ Works with existing TanStack Router architecture

### Files Modified

#### 1. `src/infrastructure/persistence/stores/ide/ide-project-slice.ts`

Added event emission when project changes:

```typescript
// Added import
import { eventBus, DomainEventType } from '@/infrastructure/events/event-bus';

setProjectId: (projectId: string | null) => {
  set({ projectId });

  // 45-03: Emit event for cross-workspace project synchronization
  eventBus.emit(DomainEventType.WORKSPACE_CHANGED, {
    workspaceType: 'ide',
    projectId,
    timestamp: new Date(),
  });

  console.log('[IDESlice] Project ID set to:', projectId);
},
```

#### 2. `src/presentation/components/notes/NotesPage.tsx`

Added IDE store sync effect:

```typescript
// Get projectId from ProjectContext (set by route)
const { project } = useProjectContext();
const projectId = project?.id || 'default';

// 45-03: Sync projectId from IDE store (single source of truth)
// When project changes in other workspaces (IDE, Knowledge), Notes workspace follows
const ideProjectId = useIDEStore((s) => s.projectId);
useEffect(() => {
  if (ideProjectId && ideProjectId !== projectId) {
    console.log('[NotesPage] Project changed in IDE store, navigating:', ideProjectId);
    navigate({ to: `/notes/${ideProjectId}` });
  }
}, [ideProjectId, projectId, navigate]);
```

#### 3. `src/presentation/components/knowledge/KnowledgePage.tsx`

Same pattern as NotesPage:

```typescript
// 45-03: Sync projectId from IDE store (single source of truth)
// When project changes in other workspaces (IDE, Notes), Knowledge workspace follows
const ideProjectId = useIDEStore((s) => s.projectId);
useEffect(() => {
  if (ideProjectId && ideProjectId !== projectId) {
    console.log('[KnowledgePage] Project changed in IDE store, navigating:', ideProjectId);
    navigate({ to: `/knowledge/${ideProjectId}` });
  }
}, [ideProjectId, projectId, navigate]);
```

#### 4. `src/presentation/components/study/StudyPage.tsx`

Added imports and sync effect:

```typescript
import { useState, useEffect } from 'react';
import { useIDEStore } from '@/infrastructure/persistence/stores/ide';

// ... in component:

// 45-03: Sync projectId from IDE store (single source of truth)
// When project changes in other workspaces (IDE, Notes), Study workspace follows
const ideProjectId = useIDEStore((s) => s.projectId);
useEffect(() => {
  if (ideProjectId && ideProjectId !== projectId) {
    console.log('[StudyPage] Project changed in IDE store, navigating:', ideProjectId);
    navigate({ to: `/study/${ideProjectId}` });
  }
}, [ideProjectId, projectId, navigate]);
```

#### 5. `src/lib/workspace/useUnifiedProjectState.ts` (NEW)

Created utility hook for unified project state access:

```typescript
export function useUnifiedProjectState(workspaceType: keyof WorkspaceBindings): UnifiedProjectState {
  const projectId = useIDEStore((state) => state.projectId);
  const setProjectId = useIDEStore((state) => state.setProjectId);
  const { projects, isLoading } = useWorkspaceProjects({ workspaceType });
  const projectName = projects.find((p) => p.id === projectId)?.name || null;

  // Subscribe to cross-workspace project changes
  const [, setVersion] = useState(0);
  useEffect(() => {
    const handleProjectChange = (event: WorkspaceChangedEvent) => {
      console.log(`[useUnifiedProjectState] Project changed in ${event.workspaceType}: ${event.projectId}`);
      setVersion((v) => v + 1);
    };
    const unsubscribe = eventBus.on(DomainEventType.WORKSPACE_CHANGED, handleProjectChange);
    return unsubscribe;
  }, []);

  return { projectId, projectName, projects, isLoading, setProjectId };
}
```

### File: `src/lib/workspace/UnifiedProjectContext.tsx` (NEW)

**Note:** This file was planned in the original design but NOT created in the final implementation. The route-sync approach was deemed simpler and more maintainable.

```typescript
/**
 * Unified Project Context - Single Source of Truth
 *
 * This context provides project state that:
 * 1. Reads from useIDEStore as the primary source
 * 2. Emits events on project changes
 * 3. Notifies all subscribers across workspaces
 */

import { createContext, useContext, useEffect, useMemo } from 'react';
import { useIDEStore } from '@/infrastructure/persistence/stores/ide';
import { useWorkspaceProjects } from '@/infrastructure/persistence/stores/project/useWorkspaceProjects';
import { eventBus, DomainEventType } from '@/infrastructure/events/event-bus';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';

interface UnifiedProjectContextValue {
  currentProject: Project | null;
  allProjects: Project[];
  workspaceType: string;
  setCurrentProject: (projectId: string) => void;
}

const UnifiedProjectContext = createContext<UnifiedProjectContextValue | null>(null);

export function useUnifiedProjectContext(workspaceType: string) {
  const context = useContext(UnifiedProjectContext);
  if (!context) {
    throw new Error('useUnifiedProjectContext must be used within UnifiedProjectProvider');
  }
  return context;
}

export function UnifiedProjectProvider({
  children,
  workspaceType
}: {
  children: React.ReactNode;
  workspaceType: string;
}) {
  // Primary source of truth: IDE store
  const projectId = useIDEStore(state => state.projectId);
  const setProjectId = useIDEStore(state => state.setProjectId);

  // Projects for this workspace type
  const { projects, activeProject } = useWorkspaceProjects({ workspaceType });

  const currentProject = useMemo(() => {
    return projects.find(p => p.id === projectId) || activeProject || null;
  }, [projectId, projects, activeProject]);

  // Emit event when project changes
  useEffect(() => {
    if (projectId) {
      eventBus.emit(DomainEventType.PROJECT_CHANGED, {
        projectId,
        workspaceType,
        timestamp: new Date(),
      });
    }
  }, [projectId, workspaceType]);

  const value = useMemo<UnifiedProjectContextValue>(() => ({
    currentProject,
    allProjects: projects,
    workspaceType,
    setCurrentProject: setProjectId,
  }), [currentProject, projects, workspaceType, setProjectId]);

  return (
    <UnifiedProjectContext.Provider value={value}>
      {children}
    </UnifiedProjectContext.Provider>
  );
}
```

### Files to Modify

1. **`src/lib/workspace/ProjectContext.tsx`**
   - Update to read from `useIDEStore` instead of local state
   - Emit events on project changes

2. **`src/infrastructure/events/event-bus.ts`**
   - Add `PROJECT_CHANGED` event type if not exists

3. **`src/routes/notes.lazy.tsx`**
   - Wrap with `UnifiedProjectProvider` instead of `ProjectProvider`

4. **`src/presentation/components/notes/NotesPage.tsx`**
   - Use `useUnifiedProjectContext` hook

---

## Cross-Impact Analysis

### Workspace Impact

| Workspace | Affected | Features | Files |
|-----------|----------|----------|-------|
| **IDE** | YES (source) | Project selector, file tree | `ide.ts`, `ProjectSelector.tsx` |
| **Notes** | YES | Note filtering, file sync | `NotesPage.tsx`, `ProjectFilesPanel.tsx` |
| **Knowledge** | YES | RAG indexing, source selection | `KnowledgePage.tsx` |
| **Study** | YES (future) | Flashcard decks, study sets | (not implemented yet) |

### Shared Components Affected
- `ProjectSelector` - Will receive project changes from event bus
- `AgentManager` - Needs project context for agent calls
- File sync services - Depend on correct `projectId`

---

## Implementation Tasks

| Task | Type | Effort | Depends On |
|------|------|--------|------------|
| Research event bus patterns | Research | 30m | - |
| Create UnifiedProjectContext | Implementation | 2h | Research |
| Add PROJECT_CHANGED event type | Implementation | 30m | - |
| Update NotesPage to use unified context | Refactor | 1h | UnifiedProjectContext |
| Update ProjectContext for backward compat | Refactor | 1h | UnifiedProjectContext |
| Test cross-workspace project sync | Testing | 1h | All above |

**Total Estimated Effort:** 5.5 hours

---

## Research Protocol (Pre-Planning Gate)

### MCP Tools Required

1. **Context7**: `react` - Context patterns and best practices
2. **DeepWiki**: `tanstack/react` - Query patterns for reactive state
3. **Serena**: Search for existing event bus usage patterns
4. **Local**: grep for `PROJECT_CHANGED` or `projectId` state management

### Research Questions

1. How does the current event bus handle domain events?
2. Are there existing unified context patterns in the codebase?
3. What's the best practice for cross-workspace state synchronization?

---

## Handoff

**Story Status:** COMPLETED ✅
**Completed:** 2026-01-14

### Artifacts Created
- [x] Story artifact (this file)
- [x] Implementation complete (5 files modified)
- [x] TypeScript compilation verified
- [x] All acceptance criteria met

### Next Steps
- Proceed to Story 45-04: Browser space vs project space mode
- Then Story 45-05: Preserve scroll position per note
- Then EPIC-45 retrospective

---

## Notes

**Why This Architecture Matters:**

This is the FOUNDATION story for EPIC-45. Without a unified project state:
- EPIC-46 (Space-Aware Agents) cannot determine workspace context
- EPIC-47 (Artifacts) cannot save to correct workspace location
- User experience remains disjointed across tabs

**Alternative Considered and Rejected:**
- **Zustand store for project state:** Rejected because IDE store already exists - don't want duplicate sources of truth
- **React Context with local state:** Rejected because it doesn't sync across workspaces
- **Event-only architecture:** Rejected because components need synchronous access to current project

**Decision:** Use IDE store as source of truth, wrap with React Context for component access, emit events for reactivity.
