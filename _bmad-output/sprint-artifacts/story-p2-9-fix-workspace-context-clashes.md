# Story P2-9: Fix Workspace Context Clashes

**Generated**: 2026-01-04T00:45:00+07:00
**Epic**: Platform Unification & Knowledge Synthesis
**Priority**: P2 (Medium - Blocks other P2 stories)
**Estimate**: 4 hours
**Team**: Team A (UI/Foundation)
**Status**: READY_FOR_DEV

## User Story

As a **Platform Unification engineer**, I want to **eliminate duplicate WorkspaceProvider implementations** so that components work consistently across all workspaces without runtime errors.

## Context & Motivation

**Current State**:
- Two WorkspaceProvider implementations exist:
  - **OLD**: `@/lib/workspace/WorkspaceContext` (IDE-only, limited functionality)
  - **NEW**: `@/infrastructure/persistence/stores/workspace/workspace-provider.tsx` (all workspaces, complete implementation)
- Components using OLD `useWorkspace` context fail with runtime errors when rendered in NEW provider routes
- Recent fix: `SyncStatusPanel.tsx` already migrated (removed OLD useWorkspace dependency)

**Problem**:
- Runtime error: "useWorkspace must be used within a WorkspaceProvider"
- Inconsistent workspace state management across workspaces
- Cross-workspace components (like `AgentChatPanel`) fail in Knowledge/Notes/Study workspaces
- Technical debt: Two parallel implementations confuse developers

**Value**:
- Single source of truth for workspace state
- Consistent behavior across all workspaces
- Unblock P2-10 cross-workspace connections
- Improved code maintainability

## Acceptance Criteria

### AC1: Audit Complete with Component Classification
- [ ] Find all components using OLD `useWorkspace` from `@/lib/workspace`
- [ ] Classify components as:
  - **IDE-only**: Used only in IDE workspace (keep OLD context)
  - **Cross-workspace**: Used across 2+ workspaces (must migrate to NEW context)
  - **Shared UI**: Used in Hub/switcher (must migrate to NEW context)
- [ ] Document findings with component list and classification

### AC2: IDE-Only Components Marked
- [ ] Add `@workspace ide-only` JSDoc tag to IDE-only components
- [ ] Add clear comments explaining why OLD context is acceptable for IDE-only use
- [ ] Update component documentation to indicate workspace scope

### AC3: Cross-Workspace Components Refactored
- [ ] **Priority**: `AgentChatPanel.tsx` (used in all 4 workspaces)
- [ ] Migrate cross-workspace components from OLD to NEW `useWorkspace`:
  - Remove: `import { useWorkspace } from '@/lib/workspace'`
  - Add: `import { useWorkspaceStore } from '@/infrastructure/persistence/stores/workspace'`
  - Update: All `useWorkspace()` calls to `useWorkspaceStore()` selectors
- [ ] Test migrated components in all workspace contexts
- [ ] Verify no runtime errors

### AC4: OLD Context Deprecated
- [ ] Add `@deprecated` JSDoc tag to OLD WorkspaceContext
- [ ] Add migration guide in comments explaining transition to NEW provider
- [ ] Document OLD context as "IDE-ONLY - DO NOT USE FOR NEW COMPONENTS"
- [ ] Update CLAUDE.md with workspace context migration notes

### AC5: Zero Runtime Errors
- [ ] Test all 4 workspaces (IDE, Knowledge, Notes, Study) for errors
- [ ] Verify browser console shows no "useWorkspace must be used within WorkspaceProvider" errors
- [ ] Test cross-workspace navigation (switch between workspaces)
- [ ] Test AgentChatPanel in all workspace contexts
- [ ] Manual testing checklist complete

## Technical Specification

### Files to Audit

**Step 1: Find all components using OLD useWorkspace** (30m):
```bash
grep -rn "from.*lib/workspace.*useWorkspace\|useWorkspace.*from.*lib/workspace" src --include="*.tsx"
```

**Expected findings**:
- `AgentChatPanel.tsx` - Cross-workspace (PRIORITY)
- Other components using OLD context

### Files to Modify

**Step 2: Migrate cross-workspace components** (2h):
```typescript
// BEFORE (OLD context):
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';

function AgentChatPanel() {
  const { activeProjectId, workspaceType } = useWorkspace();
  // ...
}

// AFTER (NEW store):
import { useWorkspaceStore } from '@/infrastructure/persistence/stores/workspace';

function AgentChatPanel() {
  const activeProjectId = useWorkspaceStore(s => s.activeProjectId);
  const workspaceType = useWorkspaceStore(s => s.workspaceType);
  // ...
}
```

**Components to migrate**:
1. `src/presentation/components/chat/AgentChatPanel.tsx` (PRIORITY - used everywhere)
2. [Other cross-workspace components found in audit]

### Files to Deprecate

**Step 3: Deprecate OLD context** (30m):
```typescript
// File: src/lib/workspace/WorkspaceContext.tsx

/**
 * @deprecated IDE-ONLY CONTEXT - DO NOT USE FOR NEW COMPONENTS
 *
 * This legacy WorkspaceContext is maintained for IDE-only components.
 * For all new components and cross-workspace components, use:
 *
 * ```typescript
 * import { useWorkspaceStore } from '@/infrastructure/persistence/stores/workspace';
 * ```
 *
 * @migration_guide See: .claude/ralph-loop.local.md Section 2
 * @workspace ide-only
 */
export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);
```

### Documentation Updates

**Step 4: Update documentation** (30m):

**File**: `CLAUDE.md`
- Add section: "Workspace Context Migration (Epic 51)"
- Document OLD vs NEW provider
- Provide migration examples
- List IDE-only exceptions

## Implementation Steps

1. **Audit Components** (30m)
   - Run grep to find all useWorkspace usages
   - Classify each component (IDE-only / cross-workspace / shared UI)
   - Create component classification list

2. **Refactor Cross-Workspace Components** (2h)
   - Start with AgentChatPanel.tsx (PRIORITY)
   - Replace useWorkspace with useWorkspaceStore
   - Use individual selectors (no destructuring)
   - Test in all workspace contexts

3. **Deprecate OLD Context** (30m)
   - Add @deprecated tags
   - Add migration guide comments
   - Document IDE-only use case

4. **Update Documentation** (30m)
   - Update CLAUDE.md
   - Add JSDoc comments
   - Document component classification

5. **Test & Validate** (30m)
   - Manual test all 4 workspaces
   - Test cross-workspace navigation
   - Verify browser console clean
   - Check AgentChatPanel in all contexts

## Definition of Done
- [ ] All 5 acceptance criteria met
- [ ] Zero TypeScript errors
- [ ] Zero runtime workspace context errors
- [ ] AgentChatPanel works in all workspaces
- [ ] Browser console clean (no useWorkspace errors)
- [ ] Documentation updated (CLAUDE.md, JSDoc comments)
- [ ] Component classification documented

## Use Case Impact

**Before**:
- Cross-workspace components fail with runtime errors
- AgentChatPanel broken in Knowledge/Notes/Study
- Inconsistent workspace state

**After**:
- All components work consistently
- AgentChatPanel functional in all workspaces
- Single source of truth for workspace state
- Unblock P2-10 cross-workspace connections

## References
- Assessment: `_bmad-output/ux-ui-workspace-integration-assessment-2026-01-03.md`
- Handoff: `_bmad-output/dev-handoffs/p2-implementation-handoff-2026-01-03.md`
- Ralph Loop: `.claude/ralph-loop.local.md`

## Dependencies
- None (can start immediately)

## Blocks
- P2-10: Complete Critical Cross-Workspace Connections (requires P2-9 fix first)
