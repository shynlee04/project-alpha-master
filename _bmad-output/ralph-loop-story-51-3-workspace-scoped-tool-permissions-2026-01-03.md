# Ralph Loop Story 51-3: Workspace-Scoped Tool Permissions Implementation

**Date**: 2026-01-03
**Iteration**: 51-3 (Foundation Stabilization)
**Status**: In Progress
**Health Score Impact**: 6/10 → Foundation for cross-workspace tool enforcement

---

## Executive Summary

This document provides the complete **workspace-scoped tool permission implementation** strategy to enable per-workspace tool enforcement across all 4 workspaces (IDE, Knowledge, Notes, Study).

**Current Problem**: Tool permissions are global - all workspaces share the same trust levels
**Target Solution**: Workspace-scoped permissions - each workspace has independent tool trust levels

---

## 1. Current State Analysis

### 1.1 Current Architecture (Global Permissions)

**File**: `src/lib/state/tool-permission-store.ts`

```typescript
// ❌ CURRENT: Flat, global trust levels
export interface ToolPermissionState {
  trustLevels: Record<string, ToolTrustLevel>; // toolId -> level
  sessionTrust: string[];
  // ...
}

// Example state:
{
  trustLevels: {
    'read_file': 'auto',        // Applies to ALL workspaces
    'write_file': 'prompt',      // Applies to ALL workspaces
    'execute_command': 'prompt', // Applies to ALL workspaces
  }
}
```

**Problem**: No workspace dimension - cannot configure different trust levels per workspace

### 1.2 Current UI (Ready for Workspace Scoping)

**File**: `src/presentation/components/agent/WorkspacePermissionEditor.tsx`

**Status**: ✅ **UI ALREADY PREPARED**

- Line 119: `const WORKSPACE_TYPES: WorkspaceType[] = ['ide', 'knowledge', 'study', 'notes'];`
- Line 160: `const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType>('ide');`
- Line 136: Comment says "Currently uses global permissions (Phase 1), prepared for workspace scoping (Phase 2)"

**Issue**: UI has workspace tabs but doesn't actually set workspace-scoped permissions yet
- Line 186: `setTrustLevel(toolId, newLevel)` - Sets global, not workspace-specific

### 1.3 Current ToolPermissionManager

**File**: `src/lib/agent/tool-permission-manager.ts`

```typescript
// ❌ CURRENT: No workspace parameter
public checkPermission(toolId: string): PermissionCheckResult {
  const trustLevel = state.trustLevels[toolId] ?? 'prompt';
  // No workspace awareness
}
```

---

## 2. Target Architecture Design

### 2.1 Workspace-Scoped State Schema

```typescript
// ✅ TARGET: Nested, workspace-scoped trust levels
export interface ToolPermissionState {
  /**
   * Nested trust levels: toolId -> workspaceType -> trustLevel
   *
   * Example:
   * {
   *   'read_file': {
   *     ide: 'auto',
   *     knowledge: 'auto',
   *     notes: 'prompt',      // Notes workspace requires approval
   *     study: 'auto',
   *   },
   *   'execute_command': {
   *     ide: 'prompt',        // IDE requires approval
   *     knowledge: 'block',   // Knowledge workspace blocks terminal
   *     notes: 'block',       // Notes workspace blocks terminal
   *     study: 'block',       // Study workspace blocks terminal
   *   }
   * }
   */
  trustLevels: Record<string, Record<WorkspaceType, ToolTrustLevel>>;

  /**
   * Default trust level for new tools/workspace combinations
   * Fallback when no specific level is set
   */
  defaultTrustLevel: ToolTrustLevel;

  /**
   * Session-based trust (still ephemeral, cleared on reload)
   * Format: toolId:workspaceType (e.g., "read_file:ide")
   */
  sessionTrust: string[];

  /**
   * Schema version for migration
   * v1: Flat trust levels (legacy)
   * v2: Workspace-scoped trust levels (target)
   */
  version: number;
}
```

### 2.2 Updated checkPermission Method

```typescript
// ✅ TARGET: Workspace-aware permission check
public checkPermission(toolId: string, workspaceType: WorkspaceType): PermissionCheckResult {
  const state = useToolPermissionStore.getState();

  // Get workspace-specific trust level
  const trustLevel = state.trustLevels[toolId]?.[workspaceType]
    ?? state.defaultTrustLevel
    ?? 'prompt';

  // Check session trust (now workspace-scoped: "toolId:workspaceType")
  const sessionKey = `${toolId}:${workspaceType}`;
  const hasSession = state.sessionTrust.includes(sessionKey);

  // Return workspace-aware result
  if (trustLevel === 'block') {
    return {
      needsApproval: false,
      canExecute: false,
      reason: 'block',
      workspace: workspaceType,
      toolName: this.getToolDisplayName(toolId),
      toolId,
    };
  }

  if (hasSession) {
    return {
      needsApproval: false,
      canExecute: true,
      reason: 'session',
      workspace: workspaceType,
      toolName: this.getToolDisplayName(toolId),
      toolId,
    };
  }

  if (trustLevel === 'auto') {
    return {
      needsApproval: false,
      canExecute: true,
      reason: 'auto',
      workspace: workspaceType,
      toolName: this.getToolDisplayName(toolId),
      toolId,
    };
  }

  // Default: prompt
  return {
    needsApproval: true,
    canExecute: true,
    reason: 'prompt',
    workspace: workspaceType,
    toolName: this.getToolDisplayName(toolId),
    toolId,
  };
}
```

### 2.3 Workspace-Aware Agent Bindings

**Additional Enhancement**: Check if agent is enabled in workspace

```typescript
public checkPermission(toolId: string, workspaceType: WorkspaceType): PermissionCheckResult {
  // ... existing trust level checks ...

  // NEW: Check agent workspace bindings
  const agentBindings = useAppStore.getState().getAgentWorkspaceBindings(agentId);
  const agentEnabled = agentBindings?.[workspaceType]?.enabled ?? false;

  if (!agentEnabled) {
    return {
      needsApproval: false,
      canExecute: false,
      reason: 'Agent not enabled in workspace',
      workspace: workspaceType,
      toolName: this.getToolDisplayName(toolId),
      toolId,
    };
  }

  // ... return result ...
}
```

---

## 3. Migration Strategy

### 3.1 Zero-Downtime Migration Approach

**Phase 1: Schema Migration (Automatic)**

```typescript
// Migration function in tool-permission-store.ts
const migrateToWorkspaceScoped = (persistedState: any, version: number) => {
  // If version 1 (flat state), migrate to version 2 (nested)
  if (version === 1) {
    const legacyState = persistedState as {
      trustLevels: Record<string, ToolTrustLevel>;
      sessionTrust: string[];
    };

    // Migrate flat trust levels to workspace-scoped
    const workspaceScopedLevels: Record<string, Record<WorkspaceType, ToolTrustLevel>> = {};

    for (const [toolId, level] of Object.entries(legacyState.trustLevels)) {
      workspaceScopedLevels[toolId] = {
        ide: level,
        knowledge: level,
        notes: level,
        study: level,
      };
    }

    // Migrate session trust to workspace-scoped format
    const workspaceScopedSession: string[] = [];
    for (const toolId of legacyState.sessionTrust) {
      for (const workspace of ['ide', 'knowledge', 'notes', 'study']) {
        workspaceScopedSession.push(`${toolId}:${workspace}`);
      }
    }

    return {
      trustLevels: workspaceScopedLevels,
      sessionTrust: workspaceScopedSession,
      defaultTrustLevel: 'prompt',
      version: 2,
    };
  }

  // Already v2 or higher
  return persistedState as ToolPermissionState;
};
```

**Phase 2: Backward Compatibility Layer**

```typescript
// In tool-permission-manager.ts, maintain old API for gradual migration
public checkPermission(toolId: string): PermissionCheckResult {
  // @deprecated Use checkPermission(toolId, workspaceType) instead
  // Default to 'ide' workspace for backward compatibility
  return this.checkPermission(toolId, 'ide');
}
```

**Phase 3: Consumer Migration**

1. **Update all call sites** to pass workspace parameter
2. **Use workspace context** to determine current workspace
3. **Test per-workspace enforcement**

### 3.2 Migration Order

| Step | Component | Changes | Risk |
|------|-----------|---------|------|
| 1 | `tool-permission-store.ts` | Add migration function, update schema | Low |
| 2 | `tool-permission-manager.ts` | Update checkPermission signature | Medium |
| 3 | `WorkspacePermissionEditor.tsx` | Update to set workspace-scoped permissions | Low |
| 4 | Agent tool execution | Pass workspace to checkPermission | Medium |
| 5 | All call sites | Add workspace parameter | Low |

---

## 4. Implementation Tasks

### Task 1: Update State Schema (2 hours)

**File**: `src/lib/state/tool-permission-store.ts`

**Changes**:
1. Update `ToolPermissionState` interface to nested schema
2. Add `version: 2` to state
3. Add `defaultTrustLevel` property
4. Implement `migrateToWorkspaceScoped()` migration function
5. Update `persist` middleware with custom merge function

**Validation**:
- [ ] State type checks with new schema
- [ ] Migration function handles legacy state correctly
- [ ] Defaults apply when workspace level not set

### Task 2: Update ToolPermissionManager (3 hours)

**File**: `src/lib/agent/tool-permission-manager.ts`

**Changes**:
1. Update `checkPermission(toolId, workspaceType)` signature
2. Update `PermissionCheckResult` interface to include `workspace` field
3. Update session trust logic to use workspace-scoped keys
4. Add backward compatibility layer (overload for old API)
5. Update all helper methods to support workspace parameter

**Validation**:
- [ ] TypeScript errors resolved
- [ ] All call sites compile
- [ ] Workspace parameter correctly propagated

### Task 3: Update WorkspacePermissionEditor UI (3 hours)

**File**: `src/presentation/components/agent/WorkspacePermissionEditor.tsx`

**Changes**:
1. Update `handleLevelChange` to set workspace-scoped trust levels
2. Add new action `setWorkspaceTrustLevel(toolId, workspace, level)`
3. Update UI to show current workspace's trust levels
4. Add visual indicator for workspace vs. global defaults
5. Test permission changes per workspace

**Validation**:
- [ ] Each workspace tab shows independent permissions
- [ ] Changing workspace updates displayed permissions
- [ ] Permission changes persist correctly

### Task 4: Update Agent Tool Execution (2 hours)

**Files**: All agent tool execution sites

**Changes**:
1. Identify all `checkPermission(toolId)` calls
2. Add workspace parameter from context
3. Test tool execution respects workspace settings
4. Verify workspace-scoped enforcement works

**Validation**:
- [ ] Tools check permissions for correct workspace
- [ ] Blocked tools in workspace don't execute
- [ ] Session trust works per-workspace

### Task 5: Add Tests (2 hours)

**Files**: Create `src/lib/state/__tests__/tool-permission-store.test.ts`

**Tests**:
1. Migration from legacy to workspace-scoped state
2. Workspace-specific permission checks
3. Session trust per-workspace
4. Default trust level fallback
5. Backward compatibility layer

**Validation**:
- [ ] All tests passing
- [ ] Migration tested with legacy state
- [ ] Workspace isolation verified

---

## 5. Success Criteria

### 5.1 Functional Requirements

- [ ] **Workspace-Scoped Permissions**: Each workspace has independent tool trust levels
- [ ] **Migration Success**: Legacy global permissions migrated to workspace-scoped
- [ ] **Zero Data Loss**: All existing trust levels preserved during migration
- [ ] **UI Functionality**: WorkspacePermissionEditor sets workspace-specific levels
- [ ] **Agent Enforcement**: Agents respect workspace-scoped permissions
- [ ] **Session Trust**: Temporary approvals work per-workspace

### 5.2 Quality Metrics

| Metric | Current | Target | Delta |
|--------|---------|--------|-------|
| **Workspace Isolation** | None (global) | 4 independent configs | ✅ NEW |
| **Granularity** | 6 tools × 3 levels | 6 tools × 4 workspaces × 3 levels | 4× more control |
| **Migration Safety** | N/A | Zero data loss | ✅ REQUIRED |
| **TypeScript Errors** | 0 | 0 | ✅ MAINTAINED |

### 5.3 User Experience

**Before** (Global Permissions):
- All workspaces share same tool trust levels
- Cannot block terminal in Knowledge/Notes/Study while allowing in IDE
- One-size-fits-all approach

**After** (Workspace-Scoped Permissions):
- Each workspace has independent tool trust levels
- IDE: Can allow `execute_command` (needed for terminal)
- Knowledge: Can block `execute_command` (no terminal access)
- Notes/Study: Can block `execute_command` (no terminal access)
- Fine-grained control per workspace context

---

## 6. Risk Assessment

### 6.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Migration Data Loss** | Low | High | Comprehensive migration tests, backup strategy |
| **Performance Degradation** | Low | Medium | Selector optimization, shallow comparisons |
| **Breaking Changes** | Medium | High | Backward compatibility layer, gradual rollout |
| **UI Complexity** | Low | Low | UI already prepared, minimal changes needed |

### 6.2 Migration Safety

**Rollback Strategy**:
- Keep version 1 schema support in migration function
- Can revert migration if critical bugs found
- Backward compatibility layer prevents breaking changes

**Testing Strategy**:
- Unit tests for migration function
- Integration tests for permission checks
- E2E tests for tool execution per workspace
- Manual testing with real user scenarios

---

## 7. Implementation Timeline

**Total Estimated Time**: 12 hours

| Day | Tasks | Hours | Status |
|-----|-------|-------|--------|
| 1 | Task 1: Update State Schema | 2h | ⏳ Pending |
| 1 | Task 2: Update ToolPermissionManager | 3h | ⏳ Pending |
| 2 | Task 3: Update WorkspacePermissionEditor | 3h | ⏳ Pending |
| 2 | Task 4: Update Agent Tool Execution | 2h | ⏳ Pending |
| 2 | Task 5: Add Tests | 2h | ⏳ Pending |

---

## 8. Next Steps

### Immediate Action

**Begin Task 1**: Update state schema in `tool-permission-store.ts`

1. Add version tracking to state interface
2. Implement nested trust levels schema
3. Create migration function with legacy support
4. Add custom merge function to persist middleware
5. Test migration with legacy state

### Validation Checklist

After completing Task 1:
- [ ] TypeScript type checking passes
- [ ] Legacy state migrates correctly
- [ ] New workspace-scoped state initializes properly
- [ ] Defaults apply when workspace not set
- [ ] No breaking changes to existing consumers

---

## 9. Conclusion

This workspace-scoped tool permission implementation addresses a **critical UX gap** by enabling fine-grained control over tool execution per workspace context.

**Key Benefits**:
1. **Workspace Isolation**: Each workspace has independent tool configurations
2. **Context-Aware**: Terminal tools blocked in non-IDE workspaces
3. **Migration Safe**: Zero data loss with automatic migration
4. **Future-Proof**: Foundation for agent workspace bindings integration

**Expected Outcome**: Health score 6/10 → 6.5/10, foundation for Story 51-4 (File System Access Expansion)

---

**Document Version**: 1.0
**Last Updated**: 2026-01-03
**Author**: Ralph Loop (Iteration 51-3)
**Status**: ✅ Research Complete → Ready for Implementation
