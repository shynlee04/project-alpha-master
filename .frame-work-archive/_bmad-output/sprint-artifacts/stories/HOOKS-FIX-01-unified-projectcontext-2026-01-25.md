# HOOKS-FIX-01: Migrate to Unified ProjectContext

**Created**: 2026-01-25
**Priority**: P0 (CRITICAL BLOCKER - App Non-Functional)
**Effort**: 2-3 hours
**Status**: READY_FOR_DEV
**Assigned**: dev-ext (any available)
**Epic**: EPIC-ARCH-03 (Layout & UX)

---

## Executive Summary

The application **cannot create or load projects** due to a React hooks error caused by **two incompatible ProjectContext implementations**. This story migrates 4 legacy files from the OLD workspace-centric context to the NEW ADR-034 compliant context.

---

## Error Being Fixed

```
Failed to load project: Invalid hook call. Hooks can only be called inside of the body of a function component.
```

---

## Root Cause

| Context | Location | Used By |
|---------|----------|---------|
| **NEW (ADR-034)** | `src/infrastructure/context/project-context.tsx` | All plugins, PluginLayout, `/$projectId` route |
| **OLD (Workspace-centric)** | `src/lib/workspace/ProjectContext.tsx` | 4 legacy files ❌ |

When navigating to `/$projectId`:
1. NEW `ProjectContextProvider` wraps the route
2. Legacy components call `useProjectContext()` from OLD import
3. OLD context is undefined → React throws hooks error

---

## Files to Migrate

### File 1: NotesPage.tsx

**Path**: `src/presentation/components/notes/NotesPage.tsx`
**Line**: 62

**Current (BROKEN)**:
```typescript
import { useProjectContext } from '@/lib/workspace/ProjectContext';
```

**Required**:
```typescript
import { useProjectContext } from '@/infrastructure/context/project-context';
```

**Property Changes**:
| OLD Property | NEW Property | Notes |
|--------------|--------------|-------|
| `project` | `project` | Same |
| `fsaHandle` | Use `gateway` | Access via `gateway.getHandle()` if needed |
| `currentWorkspace` | REMOVE | Not needed in ADR-034 |
| `switchWorkspace` | REMOVE | Not needed in ADR-034 |

---

### File 2: AgentChatHeader.tsx

**Path**: `src/presentation/components/ide/AgentChatPanel/AgentChatHeader.tsx`
**Line**: 18

**Current (BROKEN)**:
```typescript
import { useProjectContextSafe } from '@/lib/workspace/ProjectContext';
```

**Required**:
```typescript
// Create useProjectContextSafe in new context OR use try-catch
import { useProjectContext } from '@/infrastructure/context/project-context';

// Safe wrapper (add to project-context.tsx if not exists)
function useProjectContextSafe() {
  try {
    return useProjectContext();
  } catch {
    return null;
  }
}
```

**Property Changes**:
| OLD Property | NEW Property | Notes |
|--------------|--------------|-------|
| `project` | `project` | Same |
| All workspace props | REMOVE | Not applicable |

---

### File 3: useIdeFileGateway.ts

**Path**: `src/presentation/components/ide/MonacoEditor/hooks/useIdeFileGateway.ts`
**Line**: Unknown (search for import)

**Current (BROKEN)**:
```typescript
import { useProjectContext } from '@/lib/workspace/ProjectContext';
```

**Required**:
```typescript
import { useProjectContext } from '@/infrastructure/context/project-context';
```

**Property Changes**:
| OLD Property | NEW Property | Notes |
|--------------|--------------|-------|
| `fsaHandle` | `gateway` | NEW context provides `gateway: StorageGateway` directly |
| `project` | `project` | Same |

**Code Pattern Change**:
```typescript
// OLD:
const { fsaHandle } = useProjectContext();
const gateway = new FSAGateway(fsaHandle);

// NEW:
const { gateway } = useProjectContext();
// gateway is already a StorageGateway - no creation needed
```

---

### File 4: workspace/$projectId.tsx (DEPRECATED ROUTE)

**Path**: `src/routes/workspace/$projectId.tsx`

**Current**: Uses OLD `ProjectProvider`

**Required**: This entire route should redirect to `/$projectId`

**Implementation**:
```typescript
// src/routes/workspace/$projectId.tsx
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/workspace/$projectId')({
  beforeLoad: ({ params }) => {
    // Redirect deprecated workspace route to unified route
    throw redirect({
      to: '/$projectId',
      params: { projectId: params.projectId },
      replace: true,
    });
  },
});
```

---

## Implementation Steps

### Step 1: Add useProjectContextSafe to NEW context
```typescript
// Add to src/infrastructure/context/project-context.tsx

/**
 * Safe version of useProjectContext that returns null instead of throwing
 */
export function useProjectContextSafe(): ProjectContext | null {
  const context = useContext(ProjectContextInternal);
  return context ?? null;
}
```

### Step 2: Migrate NotesPage.tsx
1. Change import
2. Update property access (remove workspace-centric code)
3. Test compilation

### Step 3: Migrate AgentChatHeader.tsx
1. Change import to use new `useProjectContextSafe`
2. Update property access
3. Test compilation

### Step 4: Migrate useIdeFileGateway.ts
1. Change import
2. Replace `fsaHandle` with `gateway`
3. Remove FSAGateway instantiation (already provided)
4. Test compilation

### Step 5: Fix workspace route
1. Replace route content with redirect
2. Remove old imports

### Step 6: Archive OLD context
1. Move `src/lib/workspace/ProjectContext.tsx` to `_bmad-ext/.archive/`
2. Update `src/lib/workspace/index.ts` to remove exports

### Step 7: Verify
```bash
pnpm tsc --noEmit   # Should have 0 errors related to these files
pnpm dev            # Start dev server
# Test: Create new project → Should succeed
# Test: Load existing project → Should succeed
```

---

## Acceptance Criteria

| AC | Description | Verification |
|----|-------------|--------------|
| AC1 | No "Invalid hook call" error on project load | Manual test in browser |
| AC2 | Project creation wizard completes successfully | Manual test |
| AC3 | All 4 files use `@/infrastructure/context/project-context` | grep verification |
| AC4 | No TypeScript errors in migrated files | `pnpm tsc --noEmit` |
| AC5 | OLD ProjectContext.tsx archived | File moved to `_bmad-ext/.archive/` |
| AC6 | Workspace route redirects to unified route | Navigate to `/workspace/proj_xxx` → redirects to `/proj_xxx` |

---

## Verification Commands

```bash
# Check no old imports remain
grep -r "from '@/lib/workspace/ProjectContext'" src/ --include="*.tsx" --include="*.ts"
# Expected: 0 results

# TypeScript check
pnpm tsc --noEmit
# Expected: 0 errors from these files

# Build check
pnpm build
# Expected: SUCCESS
```

---

## Rollback Plan

If issues occur:
1. Restore `src/lib/workspace/ProjectContext.tsx` from archive
2. Revert import changes in 4 files
3. The OLD context pattern still works if OLD provider is added to route

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| ADR-034 | APPROVED | Architecture reference |
| EPIC-ARCH-02 | COMPLETE | Created NEW context |
| NEW ProjectContext | EXISTS | `src/infrastructure/context/project-context.tsx` |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Interface mismatch breaks components | Medium | Medium | Test each file individually |
| Missing properties in NEW context | Low | High | Check interface before migration |
| Other hidden imports | Low | Medium | Use grep to find all occurrences |

---

## Success Metrics

- 0 React hooks errors
- Project creation works
- Project loading works
- All user journeys unblocked

---

## Notes

This is a **BLOCKING** story. No other work can proceed until this is fixed because the app is completely non-functional.

The root cause is architectural: the codebase has two incompatible context systems from different architectural phases (workspace-centric vs project-centric).

After this fix, the OLD context file should be archived to prevent future imports.
