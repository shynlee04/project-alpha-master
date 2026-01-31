# P0 CRITICAL BLOCKER: React Hooks Error on Project Load

**Report ID**: DIAG-2026-01-25-HOOKS-ERROR
**Created**: 2026-01-25
**Severity**: P0 (App Completely Broken)
**Status**: DIAGNOSED - READY FOR DEV

---

## Error Message

```
Failed to load project: Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
```

---

## Root Cause Analysis

### Finding 1: NOT a React Version Issue
- React: 19.2.3 ✅
- React DOM: 19.2.3 ✅
- No duplicate React detected in `pnpm list`

### Finding 2: TWO ProjectContext Implementations (CRITICAL)

There are **TWO incompatible ProjectContext implementations**:

| File | Type | Interface |
|------|------|-----------|
| `src/infrastructure/context/project-context.tsx` | **NEW (ADR-034)** | `ProjectContext` with `gateway`, `platform`, `chatService` |
| `src/lib/workspace/ProjectContext.tsx` | **OLD (Workspace-centric)** | `ProjectContextValue` with `fsaHandle`, `switchWorkspace` |

### Finding 3: Mixed Imports Across Codebase

**Components using NEW context** (`@/infrastructure/context/project-context`):
- All plugins: FileTreePlugin, MonacoPlugin, NotesPlugin, ChatPlugin, TerminalPlugin ✅
- PluginLayout.tsx ✅

**Components using OLD context** (`@/lib/workspace/ProjectContext`):
- `src/presentation/components/notes/NotesPage.tsx` ❌
- `src/presentation/components/ide/AgentChatPanel/AgentChatHeader.tsx` ❌
- `src/presentation/components/ide/MonacoEditor/hooks/useIdeFileGateway.ts` ❌
- `src/routes/workspace/$projectId.tsx` ❌

### Finding 4: The Hook Error Source

The error occurs when:
1. User creates a project
2. App navigates to `/$projectId` route
3. `ProjectContextProvider` (NEW) wraps the content
4. A child component (NotesPage, AgentChatHeader) calls `useProjectContext()` from OLD import
5. OLD context is UNDEFINED (no OLD provider exists)
6. React throws "Invalid hook call" because it's trying to use a context that doesn't exist in the tree

---

## Affected Files (Must Migrate)

### HIGH PRIORITY (Directly causes error)

| File | Current Import | Required Change |
|------|---------------|-----------------|
| `src/presentation/components/notes/NotesPage.tsx` | `@/lib/workspace/ProjectContext` | Change to `@/infrastructure/context/project-context` |
| `src/presentation/components/ide/AgentChatPanel/AgentChatHeader.tsx` | `@/lib/workspace/ProjectContext` | Change to `@/infrastructure/context/project-context` |
| `src/presentation/components/ide/MonacoEditor/hooks/useIdeFileGateway.ts` | `@/lib/workspace/ProjectContext` | Change to `@/infrastructure/context/project-context` |
| `src/routes/workspace/$projectId.tsx` | `@/lib/workspace/ProjectContext` | Deprecated route - redirect to `/$projectId` |

### MEDIUM PRIORITY (Re-exports that should be cleaned)

| File | Issue |
|------|-------|
| `src/lib/workspace/index.ts` | Re-exports `useProjectContext` from OLD file |

---

## Interface Mismatch

The two contexts have DIFFERENT interfaces:

**OLD (`src/lib/workspace/ProjectContext.tsx`):**
```typescript
interface ProjectContextValue {
  project: Project | null;
  currentWorkspace: WorkspaceId;          // ❌ WORKSPACE-CENTRIC
  enabledWorkspaces: WorkspaceId[];       // ❌ WORKSPACE-CENTRIC
  fsaHandle: FsaHandle;                   // ❌ NOT IN NEW
  setFsaHandle: (handle) => void;         // ❌ NOT IN NEW
  switchWorkspace: (workspace) => void;   // ❌ WORKSPACE-CENTRIC
  navigateToWorkspace: (workspace) => Promise<void>;  // ❌ WORKSPACE-CENTRIC
}
```

**NEW (`src/infrastructure/context/project-context.tsx`):**
```typescript
interface ProjectContext {
  project: Project;
  projectId: string;
  gateway: StorageGateway;          // ✅ ADR-034 compliant
  platform: PlatformContract;       // ✅ ADR-034 compliant
  fileTree: unknown;
  chatService: ChatService;
  openFile: (path: string) => void;
  saveFile: (path: string, content: string) => Promise<void>;
  refreshFileTree: () => Promise<void>;
}
```

---

## Solution

### Option A: Migrate All Imports (RECOMMENDED)
- Update all 4 files to use NEW context
- Update their code to use NEW interface properties
- Archive OLD context file

**Effort**: 2-3 hours
**Risk**: Low (clear migration path)

### Option B: Bridge Layer
- Create adapter that maps OLD interface to NEW
- Less code changes but more technical debt

**Effort**: 1-2 hours
**Risk**: Medium (adds complexity)

### Option C: Merge Contexts
- Combine both contexts into one
- Most disruptive but cleanest result

**Effort**: 4-6 hours
**Risk**: High (affects many files)

---

## Recommended Implementation Plan

### Story: HOOKS-FIX-01 - Migrate to Unified ProjectContext

**Priority**: P0 (BLOCKING ALL USER JOURNEYS)
**Effort**: 2-3 hours
**Team**: dev-ext

**Steps:**

1. **Update NotesPage.tsx**
   - Change import from `@/lib/workspace/ProjectContext` to `@/infrastructure/context/project-context`
   - Replace `useProjectContext()` calls with new interface properties
   - Property mapping:
     - `project` → `project` (same)
     - `fsaHandle` → `gateway.getHandle()` (if needed)
     - Remove workspace-centric code (not needed in ADR-034)

2. **Update AgentChatHeader.tsx**
   - Same migration as above
   - Use `useProjectContextSafe()` from NEW context (create if not exists)

3. **Update useIdeFileGateway.ts**
   - Same migration
   - Use `gateway` from NEW context instead of `fsaHandle`

4. **Remove/Redirect old workspace route**
   - `src/routes/workspace/$projectId.tsx` should redirect to `/$projectId`
   - This route is deprecated per ADR-034

5. **Archive OLD context**
   - Move `src/lib/workspace/ProjectContext.tsx` to `_bmad-ext/.archive/`
   - Update `src/lib/workspace/index.ts` to remove old exports

6. **Verify**
   - Run `pnpm tsc --noEmit`
   - Run `pnpm dev`
   - Test project creation flow

---

## Acceptance Criteria

- [ ] No "Invalid hook call" error when loading project
- [ ] Project creation wizard completes successfully
- [ ] Project loads and displays plugins
- [ ] All imports use `@/infrastructure/context/project-context`
- [ ] No TypeScript errors
- [ ] OLD `ProjectContext.tsx` archived

---

## Evidence

### 1. Two Context Files Exist
```
src/infrastructure/context/project-context.tsx  (NEW - ADR-034)
src/lib/workspace/ProjectContext.tsx            (OLD - Workspace-centric)
```

### 2. Mixed Imports Found
```bash
$ grep -r "from '@/lib/workspace/ProjectContext'" src/ --include="*.tsx"
src/presentation/components/ide/MonacoEditor/hooks/useIdeFileGateway.ts
src/presentation/components/ide/AgentChatPanel/AgentChatHeader.tsx
src/presentation/components/notes/NotesPage.tsx
src/routes/workspace/$projectId.tsx
```

### 3. React Version Check (No duplicates)
```bash
$ pnpm list react react-dom
react 19.2.3
react-dom 19.2.3
```

---

## Related Documents

- ADR-034: Project-Centric Architecture
- ADR-034-AMENDMENT-001: Platform-First Plugin Selection
- EPIC-ARCH-02: Feature Plugins
- `new-fundamental-truths.md`: Strategic vision

---

*Diagnosed by: architect-ext*
*Date: 2026-01-25*
