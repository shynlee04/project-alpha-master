# Story INF-02-02: Create useFSAProjects() Custom Hook

**Epic**: EPIC-INF-02 (Fix Hooks Error)
**Story ID**: INF-02-02
**Status**: READY FOR STEP 01 (create-story)
**Date**: 2026-01-21
**Priority**: P0-CRITICAL
**Effort**: 20 minutes
**Team**: Team A (Identity & Routing Squad)

---

## Story Overview

**Purpose**: Create custom hook `useFSAProjects()` that properly uses `useLiveQuery` without conditional calls.

**Problem**: `useLiveQuery` hook cannot be called conditionally inside useEffect or if statements. React requires all hooks to be called at the same order every render.

**Solution**: Create custom hook that always calls `useLiveQuery` at component top level, then filter results in useMemo (deferred evaluation).

**Key Principles**:
1. **Always call hooks at top level** - Never conditionally
2. **Use useMemo for filtering** - Defer expensive operations
3. **Return empty array as default** - Handle error states gracefully

---

## Step 01: Create Story

**Status**: ✅ COMPLETE
**Completed At**: 2026-01-21

**Description**:
Create story file for creating custom useFSAProjects hook.

**Deliverables**:
- This story file: `epic-inf-02-story-inf-02-02-create-custom-hook.md`

**Evidence**:
- Story file created with acceptance criteria

---

## Tasks

- [ ] Task 1: Create use-fsa-projects.ts file in infrastructure layer
- [ ] Task 2: Implement useFSAProjects() function with useLiveQuery
- [ ] Task 3: Add TypeScript types and interfaces
- [ ] Task 4: Add error handling for failed queries
- [ ] Task 5: Export hook for use in notes.lazy.tsx
- [ ] Task 6: Add unit test stub
- [ ] Task 7: Verify TypeScript: 0 errors

---

## Files to Create

| File | Purpose | Change |
|-------|---------|---------|
| `src/infrastructure/persistence/stores/project/use-fsa-projects.ts` | Create custom hook | New file with useFSAProjects() |

---

## Implementation Pattern

```typescript
// src/infrastructure/persistence/stores/project/use-fsa-projects.ts
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { getPlatformContract } from '@/infrastructure/filesystem/platform-detection';
import db from '@/infrastructure/persistence/dexie-db';

export function useFSAProjects() {
  const platform = getPlatformContract();
  
  // ✅ ALWAYS call hook at top level (no conditional)
  const allProjects = useLiveQuery(() => db.projects.toArray(), []);
  
  // ✅ Filter in useMemo (deferred, not in hook)
  const fsaProjects = useMemo(() => {
    if (!platform.canAccessFSA) return [];
    
    return allProjects?.filter(
      (p) => p.storageType === 'fsa' && p.workspaceBindings?.notes === true
    ) ?? [];
  }, [allProjects, platform.canAccessFSA]);
  
  return fsaProjects;
}
```

---

## Validation

**Pending Step 02**: validate-story
**Pending Step 03**: create-context
**Pending Step 04**: validate-context
**Pending Step 05**: pre-planning (SKIP - no MCP research needed)
**Pending Step 06**: dev-story
**Pending Step 07**: code-review
**Pending Step 08**: story-done

---

## Handoff Context

**Source Agent**: bmad-master (orchestrator)
**Target Agent**: dev-ext
**Handoff Type**: Delegation for implementation

**Context Summary**:
Story INF-02-02 creates custom useFSAProjects() hook to fix React hooks error. The hook always calls useLiveQuery at top level and filters results in useMemo.

**Dependencies**:
- Story INF-02-01 must be complete (useLiveQuery removed from notes.lazy.tsx)
- DexieReactHooks must be available

**ADR References**:
- ADR-034 D12: Route loader should use Dexie directly
- ADR-035 Entity Model: Proper Dexie React Hooks usage

---

**END OF STORY**
