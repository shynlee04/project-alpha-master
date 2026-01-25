# P0 HOOKS-FIX Sprint Handoff

**Handoff ID**: `hnd_20260125_180000_p0_hooks_fix`
**Created**: 2026-01-25T18:00:00+07:00
**Source Agent**: architect-ext
**Target Agents**: sprint-manager, dev-ext
**Priority**: P0 (CRITICAL BLOCKER)
**Status**: READY_FOR_EXECUTION

---

## Executive Summary

The application is **NON-FUNCTIONAL**. Users cannot create or load projects due to a React hooks error caused by **two incompatible ProjectContext implementations**. This handoff provides everything needed to fix the issue.

---

## P0 Blocker Details

### Error Message
```
Failed to load project: Invalid hook call. Hooks can only be called inside of the body of a function component.
```

### Root Cause
Two ProjectContext implementations exist with **incompatible interfaces**:

| Context | Location | Interface | Used By |
|---------|----------|-----------|---------|
| **NEW (ADR-034)** | `src/infrastructure/context/project-context.tsx` | `ProjectContext` with `gateway`, `platform`, `fileTree`, `chatService` | Plugins, PluginLayout, `/$projectId` route |
| **OLD (Workspace-centric)** | `src/lib/workspace/ProjectContext.tsx` | `ProjectContextValue` with `fsaHandle`, `currentWorkspace`, `switchWorkspace` | 4 legacy files |

When navigating to `/$projectId`:
1. NEW `ProjectContextProvider` wraps the route (line 340 in new context)
2. Legacy components call `useProjectContext()` from OLD import
3. OLD context is `undefined` (no OLD provider in tree)
4. React throws hooks error

---

## Files Requiring Migration

### File 1: NotesPage.tsx
- **Path**: `src/presentation/components/notes/NotesPage.tsx`
- **Line**: 62
- **Current Import**: `import { useProjectContext } from '@/lib/workspace/ProjectContext';`
- **Required Import**: `import { useProjectContext } from '@/infrastructure/context/project-context';`
- **Property Mapping**:
  - `project` -> `project` (same)
  - `fsaHandle` -> Use `gateway` (StorageGateway provides file I/O)
  - `currentWorkspace` -> REMOVE (not in new interface)
  - `switchWorkspace` -> REMOVE (not in new interface)

### File 2: AgentChatHeader.tsx
- **Path**: `src/presentation/components/ide/AgentChatPanel/AgentChatHeader.tsx`
- **Line**: 18
- **Current Import**: `import { useProjectContextSafe } from '@/lib/workspace/ProjectContext';`
- **Required**: Add `useProjectContextSafe` to NEW context, then update import
- **Property Mapping**:
  - `project` -> `project` (same)
  - All workspace props -> REMOVE

### File 3: useIdeFileGateway.ts
- **Path**: `src/presentation/components/ide/MonacoEditor/hooks/useIdeFileGateway.ts`
- **Line**: 17
- **Current Import**: `import { useProjectContext } from '@/lib/workspace/ProjectContext';`
- **Required Import**: `import { useProjectContext } from '@/infrastructure/context/project-context';`
- **Property Mapping**:
  - `fsaHandle` -> `gateway` (NEW context provides `gateway: StorageGateway` directly)
  - `project` -> `project` (same)

### File 4: workspace/$projectId.tsx (DEPRECATED ROUTE)
- **Path**: `src/routes/workspace/$projectId.tsx`
- **Current**: Uses OLD `ProjectProvider`
- **Required**: Replace entire file with redirect to `/$projectId`

---

## Artifacts Ready for Consumption

### Story File (Complete)
```
Path: _bmad-output/sprint-artifacts/stories/HOOKS-FIX-01-unified-projectcontext-2026-01-25.md
Lines: 286
Contains: Full implementation steps, AC1-AC6, verification commands
```

### Context XML (Structured)
```
Path: _bmad-output/sprint-artifacts/stories/HOOKS-FIX-01-context.xml
Contains: <files>, <interfaces>, <migration_map>, <acceptance_criteria>
```

### Root Cause Diagnosis
```
Path: _bmad-output/investigation-reports/P0-REACT-HOOKS-ERROR-DIAGNOSIS-2026-01-25.md
Contains: Full diagnostic trace, interface comparison, failure mechanism
```

---

## Interface Comparison

### NEW Context Interface (ADR-034 Compliant)
```typescript
// src/infrastructure/context/project-context.tsx
export interface ProjectContext {
  project: Project;
  projectId: string;
  gateway: StorageGateway;           // File I/O
  platform: PlatformContract;        // Device capabilities
  fileTree: unknown;                 // Zustand store
  chatService: ChatService;          // AI chat (placeholder)
  openFile: (path: string) => void;
  saveFile: (path: string, content: string) => Promise<void>;
  refreshFileTree: () => Promise<void>;
}
```

### OLD Context Interface (DEPRECATED)
```typescript
// src/lib/workspace/ProjectContext.tsx
export interface ProjectContextValue {
  project: Project | null;
  currentWorkspace: WorkspaceId;
  enabledWorkspaces: WorkspaceId[];
  fsaHandle: FsaHandle;
  setFsaHandle: (handle: FileSystemDirectoryHandle | null) => void;
  switchWorkspace: (workspace: WorkspaceId) => void;
  navigateToWorkspace: (workspace: WorkspaceId, options?: { replace?: boolean }) => Promise<void>;
}
```

### Key Differences
| Feature | NEW Context | OLD Context |
|---------|-------------|-------------|
| File I/O | `gateway: StorageGateway` | `fsaHandle: FileSystemDirectoryHandle` |
| Workspace | Not included (route-level) | `currentWorkspace`, `switchWorkspace` |
| Platform | `platform: PlatformContract` | None (uses `getPlatformContract()`) |
| Chat | `chatService: ChatService` | None |
| File Tree | `fileTree` (Zustand) | None |

---

## Implementation Steps (For dev-ext)

### Step 1: Add useProjectContextSafe to NEW context
```typescript
// Add to src/infrastructure/context/project-context.tsx after useProjectContext

/**
 * Safe version of useProjectContext that returns null instead of throwing
 */
export function useProjectContextSafe(): ProjectContext | null {
  const context = useContext(ProjectContextInternal);
  return context ?? null;
}
```

### Step 2: Migrate NotesPage.tsx
1. Change import from `@/lib/workspace/ProjectContext` to `@/infrastructure/context/project-context`
2. Update destructuring to use new interface properties
3. Remove workspace-centric code (`currentWorkspace`, `switchWorkspace`)
4. If `fsaHandle` is used, replace with `gateway` methods

### Step 3: Migrate AgentChatHeader.tsx
1. Change import to use new `useProjectContextSafe`
2. Update property access

### Step 4: Migrate useIdeFileGateway.ts
1. Change import
2. Replace `const { fsaHandle } = useProjectContext()` with `const { gateway } = useProjectContext()`
3. Remove any FSAGateway instantiation (gateway is already provided)

### Step 5: Fix workspace route
Replace `src/routes/workspace/$projectId.tsx` with:
```typescript
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/workspace/$projectId')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/$projectId',
      params: { projectId: params.projectId },
      replace: true,
    });
  },
});
```

### Step 6: Archive OLD context
1. Move `src/lib/workspace/ProjectContext.tsx` to `_bmad-ext/.archive/ProjectContext-2026-01-25.tsx`
2. Update `src/lib/workspace/index.ts` to remove exports (if exists)

### Step 7: Verify
```bash
# No old imports remain
grep -r "from '@/lib/workspace/ProjectContext'" src/ --include="*.tsx" --include="*.ts"
# Expected: 0 results

# TypeScript check
pnpm tsc --noEmit
# Expected: 0 errors

# Build check
pnpm build
# Expected: SUCCESS

# Runtime check
pnpm dev
# Navigate to /$projectId - should NOT throw hooks error
```

---

## Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC1 | No "Invalid hook call" error on project load | Manual test in browser |
| AC2 | Project creation wizard completes successfully | Manual test |
| AC3 | All 4 files use `@/infrastructure/context/project-context` | `grep` verification |
| AC4 | No TypeScript errors in migrated files | `pnpm tsc --noEmit` |
| AC5 | OLD ProjectContext.tsx archived | File exists in `_bmad-ext/.archive/` |
| AC6 | Workspace route redirects to unified route | Navigate to `/workspace/proj_xxx` -> redirects to `/proj_xxx` |

---

## Verification Commands

```bash
# 1. Check no old imports remain
grep -r "from '@/lib/workspace/ProjectContext'" src/ --include="*.tsx" --include="*.ts"

# 2. TypeScript compilation
pnpm tsc --noEmit

# 3. Build
pnpm build

# 4. Dev server start
pnpm dev

# 5. Manual browser tests:
#    - Navigate to / (Hub)
#    - Click "Create Project"
#    - Complete wizard
#    - Verify no hooks error
#    - Navigate to existing project
#    - Verify project loads
```

---

## Dependencies

| Dependency | Status | Location |
|------------|--------|----------|
| ADR-034 | APPROVED | `_bmad-output/planning-artifacts/adr/ADR-034-project-centric-architecture-2026-01-20.md` |
| NEW ProjectContext | EXISTS | `src/infrastructure/context/project-context.tsx` (369 lines) |
| OLD ProjectContext | TO ARCHIVE | `src/lib/workspace/ProjectContext.tsx` (521 lines) |
| EPIC-ARCH-02 | COMPLETE | Created NEW context |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Interface mismatch breaks components | Medium | Medium | Test each file individually |
| Missing properties in NEW context | Low | High | Interface documented above |
| Other hidden imports | Low | Medium | Use grep to find all |
| Gateway methods differ from fsaHandle | Medium | Medium | Check StorageGateway interface |

---

## Rollback Plan

If issues occur:
1. Restore `src/lib/workspace/ProjectContext.tsx` from `_bmad-ext/.archive/`
2. Revert import changes in 4 files
3. OLD context pattern still works if OLD provider is added to route

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Add useProjectContextSafe | 10 min |
| Migrate NotesPage.tsx | 30 min |
| Migrate AgentChatHeader.tsx | 20 min |
| Migrate useIdeFileGateway.ts | 30 min |
| Fix workspace route | 10 min |
| Archive OLD context | 10 min |
| Verification | 30 min |
| **Total** | **2-3 hours** |

---

## Post-Completion Actions

After P0 fix is verified:
1. Execute INV-C E2E Testing (blocked by this)
2. Continue EPIC-CTX-CLEAN for governance cleanup
3. Complete remaining ARCH-03-05-FIX if needed

---

## Tool Constraints for dev-ext

```yaml
write: true       # Create new files, archive old files
edit: true        # Modify source files
bash: true        # Run tsc, build, dev commands
task: false       # No further delegation needed
```

---

## Handoff Signature

```yaml
artifact_id: "hnd_20260125_180000_p0_hooks_fix"
artifact_type: "handoff"
parent_id: null
story_id: "HOOKS-FIX-01"
source_agent: "architect-ext"
target_agent: "sprint-manager, dev-ext"
status: "PENDING"
created_at: "2026-01-25T18:00:00+07:00"
priority: "P0"
```

---

## Quick Reference for Execution

```bash
# Files to modify:
src/infrastructure/context/project-context.tsx     # ADD useProjectContextSafe
src/presentation/components/notes/NotesPage.tsx    # MIGRATE import
src/presentation/components/ide/AgentChatPanel/AgentChatHeader.tsx  # MIGRATE import
src/presentation/components/ide/MonacoEditor/hooks/useIdeFileGateway.ts  # MIGRATE import
src/routes/workspace/$projectId.tsx                # REPLACE with redirect

# File to archive:
src/lib/workspace/ProjectContext.tsx -> _bmad-ext/.archive/ProjectContext-2026-01-25.tsx
```

**START EXECUTION WHEN READY**
