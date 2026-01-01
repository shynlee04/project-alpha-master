# Tool Permission System Refactoring Plan

**Date**: 2026-01-01
**Ralph Loop**: Cycle 12, Iteration 11
**Priority**: P0 - Critical
**Estimated Effort**: 3-4 days

---

## Executive Summary

The tool permission system has excellent architecture (permission checks in facade, clean separation) but suffers from critical P0 issues:

1. ❌ **Trust levels not persisted** (lost on page reload)
2. ❌ **No workspace-scoped permissions** (same for all workspaces)
3. ❌ **No centralized tool registry** (tools scattered across 8+ files)
4. ✅ **Permission enforcement already exists** (in FileToolsFacade)

**Good News**: The hard part (enforcement layer) is already done. We just need to add persistence.

---

## Current Architecture Assessment

### ✅ What Works Well

**Permission Enforcement Layer** (file-tools-impl.ts:72-100):
```typescript
private checkPermission(toolId: string): void {
  const result = this.permissionManager.checkPermission(toolId);

  if (!result.canExecute) {
    throw new ToolPermissionDeniedError(...);
  }
}
```

**Strengths**:
- ✅ Clean separation of concerns
- ✅ Proper error types (ToolPermissionDeniedError)
- ✅ User-friendly error messages
- ✅ Logging for debugging
- ✅ Integrated into FileToolsFacade, TerminalToolsFacade, KnowledgeToolsFacade

### ❌ What's Broken

**ToolPermissionManager** (tool-permission-manager.ts:62):
```typescript
private trustLevels: Map<string, ToolTrustLevel> = new Map();
// ❌ In-memory only - lost on reload
// ❌ No workspace scoping
```

**Tool Definitions**:
```typescript
// ❌ Scattered across 8+ files
// /src/lib/agent/tools/read.ts
// /src/lib/agent/tools/write.ts
// /src/lib/agent/tools/execute.ts
// etc.
```

---

## Refactoring Strategy: Sequential & Cautious

### Phase 1: Add Persistence (Day 1 - 6 hours)

**Goal**: Persist trust levels to IndexedDB without breaking existing functionality.

**Checklist**:
- [ ] 1.1 Create Zustand store with Dexie persistence
- [ ] 1.2 Define TypeScript interfaces for tool permission state
- [ ] 1.3 Implement migration from ToolPermissionManager to store
- [ ] 1.4 Add serialization support for Map/Set types
- [ ] 1.5 Test persistence survives page reload
- [ ] 1.6 Verify backward compatibility with existing code

**Implementation Details**:

```typescript
// /src/lib/state/tool-permission-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ToolPermissionState {
  // Global trust levels (persisted)
  trustLevels: Record<string, ToolTrustLevel>;

  // Session trust (in-memory only, not persisted)
  sessionTrust: string[];

  // Actions
  setTrustLevel: (toolId: string, level: ToolTrustLevel) => void;
  getTrustLevel: (toolId: string) => ToolTrustLevel;
  addSessionTrust: (toolId: string) => void;
  removeSessionTrust: (toolId: string) => void;
  clearSessionTrust: () => void;
}

export const useToolPermissionStore = create<ToolPermissionState>()(
  persist(
    (set, get) => ({
      trustLevels: {
        // Default trust levels
        read_file: 'auto',
        list_files: 'auto',
        read_directory: 'auto',
        write_file: 'prompt',
        create_directory: 'prompt',
        delete_file: 'block',
        execute_command: 'prompt',
      },

      sessionTrust: [],

      setTrustLevel: (toolId, level) =>
        set((state) => ({
          trustLevels: { ...state.trustLevels, [toolId]: level }
        })),

      getTrustLevel: (toolId) => {
        return get().trustLevels[toolId] ?? 'prompt';
      },

      addSessionTrust: (toolId) =>
        set((state) => ({
          sessionTrust: [...state.sessionTrust, toolId]
        })),

      removeSessionTrust: (toolId) =>
        set((state) => ({
          sessionTrust: state.sessionTrust.filter(id => id !== toolId)
        })),

      clearSessionTrust: () => set({ sessionTrust: [] }),
    }),
    {
      name: 'tool-permissions',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        trustLevels: state.trustLevels,
        // Don't persist sessionTrust
      }),
    }
  )
);
```

**Migration Path**:
1. Create new store alongside existing ToolPermissionManager
2. Update ToolPermissionManager to use store as backing
3. Test that existing facade code continues working
4. Remove old Map-based storage once verified

---

### Phase 2: Add Workspace-Scoped Permissions (Day 2 - 6 hours)

**Goal**: Allow different trust levels per workspace type.

**Checklist**:
- [ ] 2.1 Extend state interface with workspace-scoped trust
- [ ] 2.2 Add workspace type to permission check methods
- [ ] 2.3 Update facades to pass workspace context
- [ ] 2.4 Implement workspace permission inheritance
- [ ] 2.5 Add UI for workspace-specific settings
- [ ] 2.6 Test permissions vary by workspace

**Implementation Details**:

```typescript
interface WorkspaceScopedPermissions {
  ide: Record<string, ToolTrustLevel>;
  knowledge: Record<string, ToolTrustLevel>;
  study: Record<string, ToolTrustLevel>;
  notes: Record<string, ToolTrustLevel>;
}

interface ToolPermissionState {
  // ... existing fields

  // Workspace-scoped permissions (persisted)
  workspacePermissions: WorkspaceScopedPermissions;

  // New action
  getWorkspaceTrustLevel: (toolId: string, workspace: WorkspaceType) => ToolTrustLevel;
  setWorkspaceTrustLevel: (toolId: string, workspace: WorkspaceType, level: ToolTrustLevel) => void;
}
```

**Permission Resolution Logic**:
```typescript
getWorkspaceTrustLevel(toolId: string, workspace: WorkspaceType): ToolTrustLevel {
  const state = get();

  // 1. Check workspace-specific override
  const workspaceLevel = state.workspacePermissions[workspace]?.[toolId];
  if (workspaceLevel) {
    return workspaceLevel;
  }

  // 2. Fall back to global default
  return state.trustLevels[toolId] ?? 'prompt';
}
```

**Facade Updates**:
```typescript
// FileToolsFacade constructor
constructor(
  private readonly localFS: LocalFSAdapter,
  private readonly syncManager: SyncManager,
  private readonly eventBus: WorkspaceEventEmitter,
  private readonly workspaceType: WorkspaceType, // ← NEW PARAMETER
  ...
) {
  // ...
}

private checkPermission(toolId: string): void {
  // Pass workspace to permission check
  const result = this.permissionManager.checkPermission(toolId, this.workspaceType);
  // ...
}
```

---

### Phase 3: Create Centralized Tool Registry (Day 3 - 8 hours)

**Goal**: Single source of truth for all tool definitions.

**Checklist**:
- [ ] 3.1 Define tool schema interface
- [ ] 3.2 Create tool-registry.ts with all tool definitions
- [ ] 3.3 Add tool metadata (name, description, category, risk level)
- [ ] 3.4 Generate tool registry from existing tool files
- [ ] 3.5 Replace hardcoded default trust levels
- [ ] 3.6 Add tool discovery API
- [ ] 3.7 Document tool registration process

**Implementation Details**:

```typescript
// /src/lib/agent/tools/tool-registry.ts

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: 'file' | 'terminal' | 'browser' | 'knowledge';
  riskLevel: 'low' | 'medium' | 'high';
  defaultTrustLevel: ToolTrustLevel;
  requiredCapabilities: string[];
  workspaceAvailability: WorkspaceType[];
  schema: z.ZodType<any>;
}

export const TOOL_REGISTRY: Record<string, ToolDefinition> = {
  read_file: {
    id: 'read_file',
    name: 'Read File',
    description: 'Read the contents of a file from the local filesystem',
    category: 'file',
    riskLevel: 'low',
    defaultTrustLevel: 'auto',
    requiredCapabilities: [],
    workspaceAvailability: ['ide', 'knowledge', 'study', 'notes'],
    schema: z.object({
      path: z.string(),
    }),
  },

  write_file: {
    id: 'write_file',
    name: 'Write File',
    description: 'Write content to a file in the local filesystem',
    category: 'file',
    riskLevel: 'medium',
    defaultTrustLevel: 'prompt',
    requiredCapabilities: [],
    workspaceAvailability: ['ide', 'knowledge', 'study', 'notes'],
    schema: z.object({
      path: z.string(),
      content: z.string(),
    }),
  },

  execute_command: {
    id: 'execute_command',
    name: 'Execute Command',
    description: 'Execute a shell command in the WebContainer terminal',
    category: 'terminal',
    riskLevel: 'high',
    defaultTrustLevel: 'prompt',
    requiredCapabilities: ['terminal'],
    workspaceAvailability: ['ide'], // IDE only!
    schema: z.object({
      command: z.string(),
    }),
  },

  // ... all 20+ tools
};

// Helper functions
export function getToolDefinition(toolId: string): ToolDefinition | undefined {
  return TOOL_REGISTRY[toolId];
}

export function getToolsByCategory(category: ToolDefinition['category']): ToolDefinition[] {
  return Object.values(TOOL_REGISTRY).filter(t => t.category === category);
}

export function getToolsForWorkspace(workspace: WorkspaceType): ToolDefinition[] {
  return Object.values(TOOL_REGISTRY).filter(t =>
    t.workspaceAvailability.includes(workspace)
  );
}
```

**Usage in Store**:
```typescript
// Initialize store defaults from registry
const initializeDefaults = () => {
  const defaults: Record<string, ToolTrustLevel> = {};

  Object.values(TOOL_REGISTRY).forEach(tool => {
    defaults[tool.id] = tool.defaultTrustLevel;
  });

  return defaults;
};
```

---

## Dependency Graph

```
ToolPermissionStore (NEW)
    ↓ persists to
IndexedDB (via Dexie)
    ↓ provides
ToolPermissionManager (REFACTORED)
    ↓ uses
TOOL_REGISTRY (NEW)
    ↓ provides
FileToolsFacade, TerminalToolsFacade, KnowledgeToolsFacade
    ↓ call
checkPermission() → permissionManager.checkPermission()
    ↓ throws
ToolPermissionDeniedError
```

---

## Testing Strategy

### Unit Tests

**Phase 1 - Persistence**:
- [ ] Trust levels survive page reload
- [ ] Session trust cleared on reload (by design)
- [ ] Default trust levels initialized correctly
- [ ] SetTrustLevel/getTrustLevel roundtrip works

**Phase 2 - Workspace Scoping**:
- [ ] Workspace-specific permissions override global
- [ ] Falls back to global when workspace not set
- [ ] All four workspace types work independently
- [ ] Inheritance logic correct

**Phase 3 - Registry**:
- [ ] All tools registered in registry
- [ ] getToolDefinition() returns correct tool
- [ ] getToolsForWorkspace() filters correctly
- [ ] Tool schemas validate correctly

### Integration Tests

- [ ] End-to-end: Save permission → reload → still there
- [ ] End-to-end: Set workspace permission → check permission → respects workspace
- [ ] End-to-end: Facade blocks 'block' level tools
- [ ] End-to-end: Facade auto-approves 'auto' level tools
- [ ] End-to-end: Facade prompts for 'prompt' level tools

### Manual Testing

- [ ] Open IDE workspace → execute file read → works
- [ ] Change trust level → reload → still changed
- [ ] Switch to knowledge workspace → different permissions apply
- [ ] Block dangerous tool → execution denied

---

## Rollback Strategy

If any phase breaks:

1. **Revert immediately** to previous commit
2. **Document what broke** and why
3. **Fix issue in branch**
4. **Re-apply with more testing**

**Git Safety**:
- Create feature branch: `feature/tool-permission-persistence`
- Each phase in separate commit
- Tag working states: `v1.0-phase1`, `v1.0-phase2`, etc.

---

## Success Criteria

### Phase 1 (Persistence)
- ✅ Trust levels persist across page reloads
- ✅ Existing facade code unchanged
- ✅ No breaking changes to API
- ✅ All tests passing

### Phase 2 (Workspace Scoping)
- ✅ Each workspace has independent permissions
- ✅ Workspace permissions override global
- ✅ Fallback to global when workspace not set
- ✅ UI shows workspace-specific settings

### Phase 3 (Registry)
- ✅ All tools defined in registry
- ✅ No duplicate tool definitions
- ✅ Tool discovery API works
- ✅ Schemas validate correctly

---

## Open Questions

1. **Session Trust Storage**: Should session trust be partially persisted? (e.g., remember for 1 hour)
2. **Permission Inheritance**: Should workspaces inherit from a default template?
3. **Tool Discovery**: Should we auto-discover tools from files or require registration?
4. **UI Requirements**: What UI components needed for managing workspace permissions?

---

## Next Steps

**Immediate** (Today):
1. ✅ Create refactoring plan (this document)
2. ➡️ Continue TypeScript error remediation (reduce TS6133 to <30)
3. ➡️ Create architecture decision record (ADR)

**Tomorrow** (Phase 1):
1. Create tool-permission-store.ts
2. Update ToolPermissionManager to use store
3. Test persistence
4. Commit working state

**This Week**:
1. Phase 1: Persistence (6 hours)
2. Phase 2: Workspace scoping (6 hours)
3. Phase 3: Tool registry (8 hours)
4. Testing and documentation (8 hours)

**Total**: ~28 hours (3-4 days)

---

**Plan Created**: 2026-01-01
**Status**: Ready for implementation
**Confidence**: High - existing architecture is solid, just adding persistence
