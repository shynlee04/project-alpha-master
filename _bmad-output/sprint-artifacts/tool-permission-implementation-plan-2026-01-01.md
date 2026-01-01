# Tool Permission System Implementation Plan
**P0 Priority - Critical User Experience Fix**

**Epic**: WB-8.3 - Cross-Workspace Event System
**Story**: Tool Permission Refactoring
**Date**: 2026-01-01
**Estimated Effort**: 28 hours (3-4 days)
**Team**: Team B (Backend/Agent)

---

## Executive Summary

### Problem Statement
The current tool permission system has three critical violations:
1. **Trust levels not persisted** - Users must re-approve tools on every browser reload
2. **No workspace-scoped permissions** - Cannot configure different trust levels per workspace
3. **No centralized tool registry** - Tool definitions scattered across codebase

### Impact
- **User Experience**: Broken - repetitive approval prompts
- **Maintenance**: High - scattered definitions, hard to update
- **Flexibility**: Limited - no workspace-specific controls

### Solution
Three-phase refactoring using Zustand + Dexie for persistence, workspace-scoped permissions, and centralized tool registry.

### Success Criteria
- ✅ Trust levels persist across browser restarts
- ✅ Different permissions per workspace type
- ✅ Single source of truth for tool definitions
- ✅ Zero TypeScript errors
- ✅ All tests passing
- ✅ No breaking changes to existing functionality

---

## Phase 1: Add Zustand + Dexie Persistence (6 hours)

### Objective
Persist tool trust levels across browser sessions using Zustand persist middleware with IndexedDB storage.

### MCP Research Applied
- **Zustand persist middleware** with custom storage engine
- **idb-keyval** for IndexedDB operations
- **Partialize function** for selective persistence
- **Type-safe TypeScript patterns**

### Architecture
```
┌─────────────────────────────────────┐
│  useToolPermissionStore (Zustand)   │
│  - trustLevels: persisted           │
│  - sessionTrust: ephemeral          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  IndexedDB (via idb-keyval)         │
│  Key: 'tool-permissions'            │
└─────────────────────────────────────┘
```

### Implementation Checklist

#### Step 1: Create Zustand Store (2 hours)
- [ ] **File**: `src/lib/state/tool-permission-store.ts`
- [ ] **Interface Definition**:
  ```typescript
  export interface ToolPermissionState {
    // Persisted state
    trustLevels: Record<string, ToolTrustLevel>;

    // Ephemeral state (not persisted)
    sessionTrust: string[];

    // Actions
    setTrustLevel: (toolId: string, level: ToolTrustLevel) => void;
    getTrustLevel: (toolId: string) => ToolTrustLevel;
    addSessionTrust: (toolId: string) => void;
    removeSessionTrust: (toolId: string) => void;
    clearSessionTrust: () => void;
    resetToDefaults: () => void;
  }
  ```
- [ ] **Default Trust Levels**:
  ```typescript
  trustLevels: {
    read_file: 'auto',
    list_files: 'auto',
    write_file: 'prompt',
    execute_command: 'prompt',
    delete_file: 'block',
    // ... all 20+ tools
  }
  ```
- [ ] **Persist Middleware Configuration**:
  - Storage: `createJSONStorage(() => idbStorage)`
  - Partialize: Exclude `sessionTrust` from persistence
  - Name: `'tool-permissions'`
  - Version: 1

#### Step 2: Migrate ToolPermissionManager (2 hours)
- [ ] **Current Location**: `src/lib/agent/providers/credential-vault.ts`
- [ ] **Remove**: `private trustLevels: Map<string, ToolTrustLevel>`
- [ ] **Replace**: `useToolPermissionStore.getState().setTrustLevel()`
- [ ] **Update**: All methods to use Zustand store
- [ ] **Preserve**: Singleton pattern for backwards compatibility

#### Step 3: Update Facades (1 hour)
- [ ] **File**: `src/lib/agent/facades/file-facade.ts`
- [ ] **Import**: `useToolPermissionStore`
- [ ] **Check**: Store instead of Map
- [ ] **File**: `src/lib/agent/facades/terminal-facade.ts`
- [ ] **Import**: `useToolPermissionStore`
- [ ] **Check**: Store instead of Map

#### Step 4: Testing (1 hour)
- [ ] **Unit Test**: `src/lib/state/__tests__/tool-permission-store.test.ts`
  - [ ] Test default trust levels
  - [ ] Test setTrustLevel action
  - [ ] Test persistence across reloads
  - [ ] Test sessionTrust isolation
- [ ] **Integration Test**: Verify tool approval flow
- [ ] **Manual Test**:
  - [ ] Approve tool in IDE
  - [ ] Reload browser
  - [ ] Verify approval persists

### Success Criteria
- [x] Trust levels survive browser restart
- [x] Session trust cleared on reload
- [x] No TypeScript errors
- [x] All tests passing
- [x] Backwards compatible with existing code

### Rollback Procedure
1. Revert `src/lib/state/tool-permission-store.ts`
2. Restore `ToolPermissionManager` Map implementation
3. Revert facade updates
4. Clear IndexedDB: `indexedDB.deleteDatabase('tool-permissions')`

---

## Phase 2: Workspace-Scoped Permissions (6 hours)

### Objective
Allow different trust levels per workspace type (ide, knowledge, study, notes).

### MCP Research Applied
- **Workspace-scoped state management** patterns
- **Partialize function** for nested state
- **React permission systems** RBAC patterns

### Architecture
```
┌─────────────────────────────────────────────────┐
│  WorkspaceScopedPermissions                     │
│  ┌─────────────────────────────────────────┐   │
│  │ ide: {                                   │   │
│  │   read_file: 'auto',                     │   │
│  │   execute_command: 'prompt',             │   │
│  │ }                                        │   │
│  ├─────────────────────────────────────────┤   │
│  │ knowledge: { ... }                       │   │
│  ├─────────────────────────────────────────┤   │
│  │ study: { ... }                           │   │
│  ├─────────────────────────────────────────┤   │
│  │ notes: { read_file: 'auto',              │   │
│  │         execute_command: 'block' }       │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Implementation Checklist

#### Step 1: Extend State Interface (1 hour)
- [ ] **File**: `src/lib/state/tool-permission-store.ts`
- [ ] **Add Interface**:
  ```typescript
  export interface WorkspaceScopedPermissions {
    ide: Record<string, ToolTrustLevel>;
    knowledge: Record<string, ToolTrustLevel>;
    study: Record<string, ToolTrustLevel>;
    notes: Record<string, ToolTrustLevel>;
  }

  export interface ToolPermissionState {
    // Existing
    trustLevels: Record<string, ToolTrustLevel>;
    sessionTrust: string[];

    // New
    workspacePermissions: WorkspaceScopedPermissions;

    // Updated actions
    setTrustLevel: (toolId: string, level: ToolTrustLevel) => void;
    setWorkspaceTrustLevel: (
      toolId: string,
      workspace: WorkspaceType,
      level: ToolTrustLevel
    ) => void;
    getWorkspaceTrustLevel: (
      toolId: string,
      workspace: WorkspaceType
    ) => ToolTrustLevel;
    clearWorkspacePermissions: (workspace: WorkspaceType) => void;
  }
  ```

#### Step 2: Implement Resolution Logic (2 hours)
- [ ] **Priority Order**:
  1. Workspace-specific override
  2. Global default
  3. Session trust (ephemeral)
- [ ] **Implementation**:
  ```typescript
  getWorkspaceTrustLevel(toolId: string, workspace: WorkspaceType): ToolTrustLevel {
    // 1. Check session trust first (ephemeral approval)
    if (this.sessionTrust.includes(toolId)) {
      return 'auto';
    }

    // 2. Check workspace-specific override
    const workspaceLevel = this.workspacePermissions[workspace]?.[toolId];
    if (workspaceLevel) {
      return workspaceLevel;
    }

    // 3. Fall back to global default
    return this.trustLevels[toolId] ?? 'prompt';
  }
  ```

#### Step 3: Update Facades with Workspace Context (2 hours)
- [ ] **File**: `src/lib/agent/facades/file-facade.ts`
- [ ] **Add Parameter**: `workspace: WorkspaceType` to all methods
- [ ] **Update**: Permission checks to use `getWorkspaceTrustLevel(toolId, workspace)`
- [ ] **File**: `src/lib/agent/facades/terminal-facade.ts`
- [ ] **Add Parameter**: `workspace: WorkspaceType` to all methods
- [ ] **Update**: Permission checks to use `getWorkspaceTrustLevel(toolId, workspace)`
- [ ] **File**: `src/lib/agent/hooks/useAgentChatWithTools.ts`
- [ ] **Pass**: Workspace context to tool execution

#### Step 4: Create UI for Workspace Permissions (1 hour)
- [ ] **File**: `src/presentation/components/agent/WorkspacePermissionEditor.tsx`
- [ ] **Tabs**: One tab per workspace type
- [ ] **Rows**: One row per tool
- [ ] **Select**: Trust level dropdown (auto/prompt/block)
- [ ] **Persist**: Changes to Zustand store

### Success Criteria
- [x] Different trust levels per workspace
- [x] Resolution logic correct (workspace → global → session)
- [x] UI for editing permissions
- [x] No TypeScript errors
- [x] All tests passing

### Rollback Procedure
1. Remove `workspacePermissions` from state
2. Remove `getWorkspaceTrustLevel` method
3. Revert facades to use global `getTrustLevel`
4. Delete workspace permission editor UI

---

## Phase 3: Centralized Tool Registry (8 hours)

### Objective
Create single source of truth for all tool definitions with metadata, schemas, and default configurations.

### MCP Research Applied
- **Registry pattern** for centralized definitions
- **Zod schemas** for validation
- **TypeScript interfaces** for type safety

### Architecture
```
┌────────────────────────────────────────────┐
│  TOOL_REGISTRY (Readonly)                  │
│  ┌──────────────────────────────────────┐  │
│  │ read_file: {                          │  │
│  │   id: 'read_file',                   │  │
│  │   name: 'Read File',                 │  │
│  │   category: 'file',                  │  │
│  │   riskLevel: 'low',                  │  │
│  │   defaultTrustLevel: 'auto',         │  │
│  │   workspaceAvailability: [...],      │  │
│  │   schema: z.object({...}),           │  │
│  │ }                                    │  │
│  ├──────────────────────────────────────┤  │
│  │ execute_command: { ... }             │  │
│  ├──────────────────────────────────────┤  │
│  │ ... 20+ tools                        │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

### Implementation Checklist

#### Step 1: Create Tool Definition Interface (1 hour)
- [ ] **File**: `src/lib/agent/tools/tool-registry.ts`
- [ ] **Interface**:
  ```typescript
  export interface ToolDefinition {
    // Identity
    id: string;
    name: string;
    description: string;

    // Categorization
    category: 'file' | 'terminal' | 'browser' | 'knowledge';
    riskLevel: 'low' | 'medium' | 'high';

    // Permissions
    defaultTrustLevel: ToolTrustLevel;
    workspaceAvailability: WorkspaceType[];

    // Validation
    schema: z.ZodType<any>;

    // Metadata
    requiredCapabilities: string[];
    version: string;
    author: string;
    tags: string[];
  }
  ```

#### Step 2: Populate Registry (3 hours)
- [ ] **File**: `src/lib/agent/tools/tool-registry.ts`
- [ ] **Tools to Migrate**:
  - [ ] File Tools (7 tools):
    - read_file
    - write_file
    - list_files
    - delete_file
    - create_directory
    - move_file
    - copy_file
  - [ ] Terminal Tools (3 tools):
    - execute_command
    - start_shell
    - kill_process
  - [ ] Browser Tools (2 tools):
    - navigate_web
    - search_web
  - [ ] Knowledge Tools (5 tools):
    - ingest_source
    - query_rag
    - create_note
    - update_note
    - delete_note
  - [ ] Additional Tools (5+):
    - read_git
    - apply_patch
    - run_tests
    - install_dependencies
    - etc.

- [ ] **For Each Tool**:
  - [ ] Define schema (Zod)
  - [ ] Set risk level
  - [ ] Set default trust level
  - [ ] Set workspace availability
  - [ ] Add metadata

#### Step 3: Update Tool Registration (2 hours)
- [ ] **File**: `src/lib/agent/tools/index.ts`
- [ ] **Remove**: Manual tool registration
- [ ] **Add**: Dynamic loading from registry
- [ ] **Filter**: By workspace availability
- [ ] **Validate**: Tool schemas before registration

#### Step 4: Update UI Components (2 hours)
- [ ] **File**: `src/presentation/components/agent/ToolAvailabilityIndicator.tsx`
- [ ] **Use**: Tool registry for metadata
- [ ] **Display**: Tool categories, risk levels
- [ ] **Filter**: By workspace availability
- [ ] **File**: `src/presentation/components/agent/WorkspacePermissionEditor.tsx`
- [ ] **Load**: Tools from registry
- [ ] **Group**: By category
- [ ] **Sort**: By risk level

### Success Criteria
- [x] All 20+ tools defined in registry
- [x] No scattered tool definitions
- [x] Zod schemas for all tools
- [x] Workspace filtering functional
- [x] UI displays registry data
- [x] No TypeScript errors
- [x] All tests passing

### Rollback Procedure
1. Delete `src/lib/agent/tools/tool-registry.ts`
2. Restore manual tool registration
3. Revert UI component updates
4. Restore hardcoded tool definitions

---

## Testing Strategy

### Unit Tests
- [ ] **Store Tests** (`tool-permission-store.test.ts`):
  - [ ] Default trust levels
  - [ ] Set/get trust levels
  - [ ] Persistence verification
  - [ ] Session trust isolation
  - [ ] Workspace permission resolution
  - [ ] Partialize function verification

- [ ] **Registry Tests** (`tool-registry.test.ts`):
  - [ ] All tools have definitions
  - [ ] Required fields present
  - [ ] Zod schema validation
  - [ ] Workspace availability filtering
  - [ ] Risk level assignment

### Integration Tests
- [ ] **Permission Flow**:
  - [ ] Tool approval in IDE workspace
  - [ ] Tool rejection in Notes workspace
  - [ ] Session trust cleared on reload
  - [ ] Workspace permission override

- [ ] **Tool Execution**:
  - [ ] Auto-approved tools execute immediately
  - [ ] Prompt tools show approval dialog
  - [ ] Blocked tools prevent execution
  - [ ] Workspace context passed correctly

### Manual Testing Checklist
- [ ] **Test 1: Persistence**
  1. Open IDE workspace
  2. Execute `write_file` tool
  3. Approve in dialog
  4. Reload browser
  5. Execute `write_file` again
  6. Verify: No approval prompt (trust persisted)

- [ ] **Test 2: Workspace Scoping**
  1. In IDE workspace: Set `execute_command` to 'prompt'
  2. In Notes workspace: Set `execute_command` to 'block'
  3. Execute tool in IDE → Shows prompt
  4. Execute tool in Notes → Shows blocked message

- [ ] **Test 3: Session Trust**
  1. Approve tool for session only
  2. Execute tool → Works
  3. Reload browser
  4. Execute tool → Shows prompt again (session cleared)

- [ ] **Test 4: Registry Loading**
  1. Open workspace permission editor
  2. Verify: All 20+ tools displayed
  3. Verify: Categories correct
  4. Verify: Risk levels accurate

### Performance Tests
- [ ] **Store Initialization**: <100ms
- [ ] **Permission Check**: <10ms
- [ ] **Registry Load**: <200ms
- [ ] **UI Render**: <500ms

---

## Validation Against sweeping-validation.md

### Code Hygiene
- [ ] **Max Lines**: No file >300 lines
- [ ] **Max Functions**: No component >3 functions
- [ ] **Max Dependencies**: No file >5 dependencies
- [ ] **TS Errors**: Zero new errors introduced

### December 2025 Patterns
- [ ] **Single Responsibility**: Each file one purpose
- [ ] **Type Safety**: All interfaces exported
- [ ] **Accessibility**: UI components ARIA-compliant
- [ ] **Graceful Degradation**: Works without persistence

### BMAD Framework
- [ ] **Artifact IDs**: All files dated and stamped
- [ ] **Handoff Documents**: Clear phase transitions
- [ ] **Checklists**: Every step verified
- [ ] **Rollback Plans**: Each phase has exit strategy

---

## Risk Assessment

### High Risk Items
1. **Data Migration**: Existing user approvals lost
   - **Mitigation**: Keep Map in parallel, migrate on first load

2. **Breaking Changes**: Facades require workspace parameter
   - **Mitigation**: Add optional parameter with default value

3. **Performance**: IndexedDB operations slow
   - **Mitigation**: Use idb-keyval for fast async operations

### Medium Risk Items
1. **Test Coverage**: Insufficient tests for registry
   - **Mitigation**: Add comprehensive unit tests before migration

2. **UI Complexity**: Permission editor overwhelming
   - **Mitigation**: Group by category, progressive disclosure

### Low Risk Items
1. **TypeScript Errors**: Interface mismatches
   - **Mitigation**: Incremental compilation checks

---

## Timeline

### Day 1: Phase 1 (Persistence)
- **Morning**: Steps 1-2 (Store creation + migration)
- **Afternoon**: Steps 3-4 (Facades + testing)
- **End of Day**: Trust levels persisting

### Day 2: Phase 2 (Workspace Scoping)
- **Morning**: Steps 1-2 (Interface + logic)
- **Afternoon**: Steps 3-4 (Facades + UI)
- **End of Day**: Workspace permissions functional

### Day 3: Phase 3 (Registry)
- **Morning**: Steps 1-2 (Interface + population)
- **Afternoon**: Steps 3-4 (Registration + UI)
- **End of Day**: Registry complete

### Day 4: Integration + Documentation
- **Morning**: Testing + bug fixes
- **Afternoon**: Documentation + tree command
- **End of Day**: Feature complete

---

## Dependencies

### Required Files
- `src/lib/state/tool-permission-store.ts` (NEW)
- `src/lib/agent/tools/tool-registry.ts` (NEW)
- `src/presentation/components/agent/WorkspacePermissionEditor.tsx` (NEW)

### Modified Files
- `src/lib/agent/providers/credential-vault.ts`
- `src/lib/agent/facades/file-facade.ts`
- `src/lib/agent/facades/terminal-facade.ts`
- `src/lib/agent/tools/index.ts`
- `src/lib/agent/hooks/useAgentChatWithTools.ts`
- `src/presentation/components/agent/ToolAvailabilityIndicator.tsx`

### Package Dependencies (Already Installed)
- `zustand@^5.0.8`
- `dexie@^4.0.8`
- `idb-keyval@^6.2.1`
- `zod@^3.22.4`

---

## Handoff Criteria

### Phase 1 Complete When:
- [x] Store created and tested
- [x] ToolPermissionManager migrated
- [x] Facades updated
- [x] Persistence verified manually
- [x] Zero TS errors
- [x] All tests passing

### Phase 2 Complete When:
- [x] Workspace interface added
- [x] Resolution logic implemented
- [x] Facades pass workspace context
- [x] Permission editor functional
- [x] Zero TS errors
- [x] All tests passing

### Phase 3 Complete When:
- [x] Registry populated with 20+ tools
- [x] All tools have Zod schemas
- [x] Tool registration updated
- [x] UI components use registry
- [x] Zero TS errors
- [x] All tests passing

### Feature Complete When:
- [x] All 3 phases complete
- [x] Documentation updated (CLAUDE.md, AGENTS.md)
- [x] Tree command executed
- [x] Validation against sweeping-validation.md
- [x] Handoff to QA for testing

---

## Post-Implementation

### Documentation Updates
- [ ] **CLAUDE.md**: Add tool permission system section
- [ ] **AGENTS.md**: Document permission flow patterns
- [ ] **README**: Update architecture diagram
- [ ] **Tree Command**: `tree -L 3 -I 'node_modules' > _bmad-output/file-tree-2026-01-01.txt`

### Metrics to Track
- [ ] User approval rate (before/after)
- [ ] Time spent on approvals (before/after)
- [ ] Tool execution success rate
- [ ] Browser reload retention rate

### Future Enhancements
- [ ] Permission templates (preset configurations)
- [ ] Import/export permissions
- [ ] Permission audit log
- [ ] Advanced rules (time-based, conditional)
- [ ] Permission inheritance (workspace → global)

---

**End of Implementation Plan**

**Next Action**: Begin Phase 1, Step 1 - Create Zustand Store
