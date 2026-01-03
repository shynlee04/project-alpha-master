# Story P2-9: Fix Workspace Context Clashes

**Generated**: 2026-01-03T23:50:00+07:00
**Epic**: Platform Unification & Integration
**Priority**: P2 (Medium - Critical runtime errors)
**Estimate**: 4 hours
**Team**: Team A (UI/Foundation)
**Status**: READY_FOR_DEV

## User Story

As a **Developer**, I want to **eliminate duplicate WorkspaceProvider implementations** so that components work consistently across all workspaces without runtime errors.

## Context & Motivation

**Current Problem**:
There are TWO different WorkspaceProvider implementations:
1. **OLD**: `@/lib/workspace/WorkspaceContext` (IDE-only, 59 lines)
2. **NEW**: `@/infrastructure/persistence/stores/workspace/workspace-provider.tsx` (Study/Notes/Knowledge)

**Runtime Errors**:
- Components using OLD `useWorkspace()` fail when rendered in routes with NEW provider
- Error: "useWorkspace must be used within a WorkspaceProvider"
- Affects: `AgentChatPanel`, `AgentStatusSegment`, `FileTree`, `IDEHeaderBar`, `MobileIDELayout`, etc.

**Recent Fix**:
- ✅ `SyncStatusPanel.tsx` - Removed dependency on OLD useWorkspace

**Remaining Issues**:
- 7 more components using OLD useWorkspace context
- Potential for more runtime errors in cross-workspace scenarios

## Acceptance Criteria

### AC1: Audit All Components Using OLD useWorkspace
- [ ] Search all imports of `useWorkspace` from `@/lib/workspace`
- [ ] Document each component's workspace dependency
- [ ] Classify as: (a) IDE-only, (b) Cross-workspace, (c) Can be removed

### AC2: Refactor IDE-Only Components
- [ ] Components that ONLY run in IDE workspace keep OLD useWorkspace
- [ ] Add JSDoc comment: `/** @workspace ide-only */`
- [ ] Update imports to be explicit: `import { useWorkspace } from '@/lib/workspace/IDEContext'`
- [ ] Update component documentation to clarify IDE-only scope

### AC3: Refactor Cross-Workspace Components
- [ ] Components that run across workspaces use NEW WorkspaceProvider
- [ ] Refactor to NOT use useWorkspace (make it optional or remove)
- [ ] Use Zustand stores directly instead of context
- [ ] Add null checks: `const workspace = useOptionalWorkspace()`

### AC4: Delete OLD WorkspaceContext (if safe)
- [ ] Verify NO cross-workspace components using OLD context
- [ ] Deprecate OLD WorkspaceProvider with @deprecated comment
- [ ] Add migration guide to code comment
- [ ] Update CLAUDE.md with new pattern

### AC5: Verify No Runtime Errors
- [ ] Load each workspace (IDE, Knowledge, Notes, Study)
- [ ] Check browser console for "useWorkspace must be used within" errors
- [ ] Test cross-workspace navigation
- [ ] Verify all components render without errors

## Technical Specification

### Components to Audit
```typescript
// IDE-ONLY (keep OLD useWorkspace):
✅ src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx
✅ src/presentation/components/ide/FileTree/FileTree.tsx
✅ src/presentation/components/ide/statusbar/AgentStatusSegment.tsx
✅ src/presentation/components/layout/IDEHeaderBar.tsx
✅ src/presentation/components/layout/MobileIDELayout.tsx
✅ src/presentation/components/layout/IDELayout/useIDELayoutWorkspaceState.ts

// CROSS-WORKSPACE (refactor needed):
❌ src/presentation/components/ide/AgentChatPanel.tsx
   → Used in Study/Notes/Knowledge workspaces
   → Fix: Make workspace optional or remove dependency

❌ src/presentation/components/ui/activity-indicators/SyncStatusPanel.tsx
   → Used in NotesPage
   → Fix: ✅ DONE (removed dependency)

// UNKNOWN (need audit):
? src/lib/workspace/WorkspaceContext.test.tsx
```

### Refactor Pattern

**BEFORE (Cross-Workspace Component)**:
```typescript
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';

export function AgentChatPanel() {
  const { localAdapterRef, syncManagerRef } = useWorkspace();
  // Error when rendered in Study/Notes/Knowledge!
}
```

**AFTER (Optional Context)**:
```typescript
import { useWorkspaceStore } from '@/infrastructure/persistence/stores/workspace';

export function AgentChatPanel() {
  const currentProjectId = useWorkspaceStore(s => s.currentProjectId);
  // Works in ALL workspaces!
}
```

### Files to Modify

**Create**:
```
src/lib/workspace/IDEContext.tsx (NEW - 20 lines)
  - Re-export OLD WorkspaceContext as IDEContext
  - Add @deprecated comment with migration guide
```

**Modify**:
```
src/presentation/components/ide/AgentChatPanel.tsx
  - Remove useWorkspace dependency
  - Use Zustand stores directly
  - Add null checks for optional props

src/lib/workspace/WorkspaceContext.tsx
  - Add @deprecated comment
  - Add migration guide

CLAUDE.md
  - Document WorkspaceProvider patterns
  - Add IDE-only vs Cross-workspace guidance
```

## Implementation Steps

1. **Audit Components** (30m)
   - Grep all `useWorkspace` imports
   - Classify by workspace scope
   - Create audit spreadsheet

2. **Refactor Cross-Workspace Components** (2h)
   - Fix AgentChatPanel (highest priority)
   - Remove useWorkspace dependency
   - Use Zustand stores
   - Test in all workspaces

3. **Deprecate OLD Context** (30m)
   - Add @deprecated comments
   - Create IDEContext alias
   - Document migration path

4. **Update Documentation** (30m)
   - CLAUDE.md updates
   - Add code examples
   - Update architecture docs

5. **Verify & Test** (30m)
   - Load all workspaces
   - Check console for errors
   - Test cross-workspace navigation

## Definition of Done
- [ ] All 5 acceptance criteria met
- [ ] Zero TypeScript errors
- [ ] Zero runtime "useWorkspace must be used within" errors
- [ ] All workspaces load successfully
- [ ] Documentation updated
- [ ] Migration guide created

## Risk Assessment

**Risk**: Breaking IDE functionality if refactoring incorrect
**Mitigation**: Keep OLD context as IDEContext, gradual migration

**Risk**: Performance regression from Zustand overuse
**Mitigation**: Use individual selectors (not destructuring)

## References
- Context: Ralph Loop local.md (lines 30-45)
- Issue: SyncStatusPanel fix completed 2026-01-03
- Pattern: Zustand v5 individual selectors (CLAUDE.md)
