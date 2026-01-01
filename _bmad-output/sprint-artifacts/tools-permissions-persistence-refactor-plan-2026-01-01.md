# Tools Permissions Persistence + Workspace-Scoping Refactor Plan

**Date:** 2026-01-01
**Status:** PLANNING - P0 Priority
**Epic:** Agent Configuration Enhancement
**Story:** Tools Permissions Persistence

---

## Executive Summary

The current tools permissions system has **critical gaps** that prevent proper workspace-scoped tool configuration:

1. **Not Persisted:** Tool permissions stored in-memory only, lost on page reload
2. **No Workspace-Scoping:** Cannot configure different tool permissions per workspace type
3. **No Centralized Registry:** Tools defined in multiple locations without unified management
4. **Security Risk:** No permission validation before tool execution

**Impact Score:** 8/10 (High)
**Technical Debt Level:** HIGH
**Estimated Remediation Effort:** 2-3 days

---

## Current State Analysis

### Existing Tools Permissions System

**Location:** `/src/lib/agent/providers/` (分散在多个文件中)

**Current Implementation:**
```typescript
// Tool permissions are stored as part of agent configuration
interface AgentToolPermission {
  toolId: string;
  enabled: boolean;
  requiresApproval: boolean;
}

// But NOT persisted independently
// Lost on page reload
// No workspace-specific configuration
```

**Critical Issues:**

1. **No Persistence Layer:** Tools permissions stored only in agent config in-memory
2. **No Workspace Context:** Same tools enabled for all workspace types (IDE, Knowledge, Study, Canvas)
3. **No Validation:** Tools execute without checking current workspace permissions
4. **No UI:** No interface for managing tool permissions per workspace

### Available Tools (Current Inventory)

**File System Tools:**
- `read_file` - Read file contents
- `write_file` - Write/create files
- `list_files` - List directory contents
- `delete_file` - Delete files

**Terminal Tools:**
- `execute_command` - Run shell commands
- `start_shell` - Start interactive shell

**Knowledge Tools:**
- `ingest_document` - Add documents to knowledge base
- `search_knowledge` - Search indexed content
- `chunk_document` - Split documents for embedding

**Web Tools:**
- `fetch_url` - Fetch web content
- `web_search` - Search the web

**Workspace-Specific Tool Requirements:**

| Workspace | Essential Tools | Optional Tools | Blocked Tools |
|-----------|----------------|----------------|---------------|
| **IDE** | read_file, write_file, list_files, execute_command | delete_file, start_shell | ingest_document, web_search |
| **Knowledge** | read_file, ingest_document, search_knowledge, chunk_document | fetch_url | execute_command, start_shell |
| **Study** | read_file, search_knowledge | web_search, fetch_url | execute_command, write_file |
| **Canvas** | read_file | None | execute_command, ingest_document |

---

## Proposed Architecture

### 1. Centralized Tool Registry

**New File:** `/src/lib/agent/registry/tool-registry.ts`

**Purpose:** Single source of truth for all available tools

```typescript
interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: 'filesystem' | 'terminal' | 'knowledge' | 'web';
  defaultPermissions: WorkspaceToolPermissions;
  requiresApproval: boolean;
  dangerous: boolean; // Can cause data loss or security issues
}

interface WorkspaceToolPermissions {
  ide: boolean;
  knowledge: boolean;
  study: boolean;
  canvas: boolean;
}

class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  registerTool(tool: ToolDefinition): void {
    this.tools.set(tool.id, tool);
  }

  getTool(toolId: string): ToolDefinition | undefined {
    return this.tools.get(toolId);
  }

  getToolsForWorkspace(workspaceType: WorkspaceType): ToolDefinition[] {
    return Array.from(this.tools.values()).filter(
      tool => tool.defaultPermissions[workspaceType]
    );
  }

  isToolAvailable(toolId: string, workspaceType: WorkspaceType): boolean {
    const tool = this.tools.get(toolId);
    return tool?.defaultPermissions[workspaceType] ?? false;
  }
}

export const toolRegistry = new ToolRegistry();
```

### 2. Tools Permissions Store

**New File:** `/src/lib/state/tools-permissions-store.ts`

**Purpose:** Persisted Zustand store for tool permissions configuration

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from '@/infrastructure/persistence/dexie-storage';
import { WorkspaceType } from '@/domain/value-objects/workspace-type';

interface ToolPermissionEntry {
  toolId: string;
  enabled: boolean;
  requiresApproval: boolean;
  workspaceType: WorkspaceType;
  customConfig?: Record<string, any>;
}

interface ToolsPermissionsState {
  // Per-workspace permissions
  permissions: Map<string, ToolPermissionEntry>; // key: `${toolId}:${workspaceType}`

  // Global tool overrides
  globalDisabled: Set<string>; // Tools disabled across all workspaces

  // Actions
  setToolPermission: (
    toolId: string,
    workspaceType: WorkspaceType,
    enabled: boolean
  ) => void;

  setToolApprovalRequired: (
    toolId: string,
    workspaceType: WorkspaceType,
    requiresApproval: boolean
  ) => void;

  isToolEnabled: (toolId: string, workspaceType: WorkspaceType) => boolean;

  getToolsForWorkspace: (workspaceType: WorkspaceType) => string[];

  disableToolGlobally: (toolId: string) => void;

  enableToolGlobally: (toolId: string) => void;
}

export const useToolsPermissionsStore = create<ToolsPermissionsState>()(
  persist(
    (set, get) => ({
      permissions: new Map(),
      globalDisabled: new Set(),

      setToolPermission: (toolId, workspaceType, enabled) => {
        set((state) => {
          const newPermissions = new Map(state.permissions);
          const key = `${toolId}:${workspaceType}`;
          newPermissions.set(key, {
            toolId,
            workspaceType,
            enabled,
            requiresApproval: false,
          });
          return { permissions: newPermissions };
        });
      },

      setToolApprovalRequired: (toolId, workspaceType, requiresApproval) => {
        set((state) => {
          const newPermissions = new Map(state.permissions);
          const key = `${toolId}:${workspaceType}`;
          const existing = newPermissions.get(key);
          newPermissions.set(key, {
            ...existing,
            toolId,
            workspaceType,
            requiresApproval,
            enabled: existing?.enabled ?? true,
          });
          return { permissions: newPermissions };
        });
      },

      isToolEnabled: (toolId, workspaceType) => {
        const { permissions, globalDisabled } = get();

        // Check global disable first
        if (globalDisabled.has(toolId)) {
          return false;
        }

        // Check workspace-specific permission
        const key = `${toolId}:${workspaceType}`;
        const entry = permissions.get(key);
        return entry?.enabled ?? false;
      },

      getToolsForWorkspace: (workspaceType) => {
        const { permissions, globalDisabled } = get();
        const workspaceTools: string[] = [];

        // Get all tools enabled for this workspace
        for (const [key, entry] of permissions) {
          if (entry.workspaceType === workspaceType && entry.enabled) {
            if (!globalDisabled.has(entry.toolId)) {
              workspaceTools.push(entry.toolId);
            }
          }
        }

        return workspaceTools;
      },

      disableToolGlobally: (toolId) => {
        set((state) => {
          const newGlobalDisabled = new Set(state.globalDisabled);
          newGlobalDisabled.add(toolId);
          return { globalDisabled: newGlobalDisabled };
        });
      },

      enableToolGlobally: (toolId) => {
        set((state) => {
          const newGlobalDisabled = new Set(state.globalDisabled);
          newGlobalDisabled.delete(toolId);
          return { globalDisabled: newGlobalDisabled };
        });
      },
    }),
    {
      name: 'tools-permissions',
      storage: createJSONStorage(() => createDexieStorage('toolsPermissions')),
      partialize: (state) => ({
        permissions: Array.from(state.permissions.entries()),
        globalDisabled: Array.from(state.globalDisabled),
      }),
      onRehydrateStorage: () => (state) => {
        // Convert arrays back to Map/Set after hydration
        if (state) {
          state.permissions = new Map(state.permissions as any);
          state.globalDisabled = new Set(state.globalDisabled as any);
        }
      },
    }
  )
);
```

### 3. Workspace-Aware Tool Execution Guard

**New File:** `/src/lib/agent/guards/tool-permission-guard.ts`

**Purpose:** Validate tool permissions before execution

```typescript
import { toolRegistry } from '../registry/tool-registry';
import { useToolsPermissionsStore } from '@/lib/state/tools-permissions-store';
import { WorkspaceType } from '@/domain/value-objects/workspace-type';
import { ToolPermissionDeniedError } from './tool-errors';

export class ToolPermissionGuard {
  /**
   * Check if tool can be executed in current workspace
   *
   * @throws ToolPermissionDeniedError if tool is not enabled
   */
  static async checkPermission(
    toolId: string,
    workspaceType: WorkspaceType
  ): Promise<void> {
    // Check if tool exists in registry
    const tool = toolRegistry.getTool(toolId);
    if (!tool) {
      throw new ToolPermissionDeniedError(
        `Tool "${toolId}" is not registered in the tool registry`
      );
    }

    // Check workspace-specific permissions
    const permissionsStore = useToolsPermissionsStore.getState();
    const isEnabled = permissionsStore.isToolEnabled(toolId, workspaceType);

    if (!isEnabled) {
      throw new ToolPermissionDeniedError(
        `Tool "${toolId}" is not enabled for ${workspaceType} workspace. ` +
        `This tool requires workspace-specific configuration.`
      );
    }

    // Check if approval required
    const key = `${toolId}:${workspaceType}`;
    const entry = permissionsStore.permissions.get(key);
    if (entry?.requiresApproval) {
      // TODO: Trigger approval UI flow
      // For now, throw error indicating approval needed
      throw new ToolPermissionDeniedError(
        `Tool "${toolId}" requires explicit user approval before execution in ${workspaceType} workspace`
      );
    }
  }

  /**
   * Get available tools for workspace
   */
  static getAvailableTools(workspaceType: WorkspaceType): string[] {
    const permissionsStore = useToolsPermissionsStore.getState();
    return permissionsStore.getToolsForWorkspace(workspaceType);
  }
}
```

---

## Implementation Plan

### Phase 1: Tool Registry Setup (Day 1)

**Objective:** Create centralized tool registry

**Tasks:**

1. ✅ Create `/src/lib/agent/registry/tool-registry.ts`
2. ✅ Define `ToolDefinition` interface
3. ✅ Implement `ToolRegistry` class
4. ✅ Register all existing tools with metadata:
   - Filesystem tools (read, write, list, delete)
   - Terminal tools (execute, shell)
   - Knowledge tools (ingest, search, chunk)
   - Web tools (fetch, search)

**Deliverables:**
- Single source of truth for tool definitions
- Tool metadata including default permissions per workspace
- Workspace availability queries

**Acceptance Criteria:**
- All tools registered in `toolRegistry`
- `getToolsForWorkspace()` returns correct tools for each workspace
- No hardcoded tool lists in agent configurations

### Phase 2: Permissions Store (Day 1-2)

**Objective:** Persist tool permissions with workspace scoping

**Tasks:**

1. ✅ Create `/src/lib/state/tools-permissions-store.ts`
2. ✅ Implement Zustand store with Dexie persistence
3. ✅ Add workspace-specific permission actions
4. ✅ Implement global tool disable/enable
5. ✅ Add rehydration logic for Map/Set conversion

**Deliverables:**
- Persisted tool permissions (survive page reloads)
- Workspace-scoped permission configuration
- Global tool override capability

**Acceptance Criteria:**
- Permissions persist in IndexedDB
- `setToolPermission()` updates stored state
- `isToolEnabled()` returns correct status per workspace
- Page reload preserves all permission settings

### Phase 3: Permission Guard Integration (Day 2)

**Objective:** Enforce permissions before tool execution

**Tasks:**

1. ✅ Create `/src/lib/agent/guards/tool-permission-guard.ts`
2. ✅ Integrate guard into tool execution flow
3. ✅ Add permission checks in `useAgentChatWithTools`
4. ✅ Implement error handling for denied permissions
5. ✅ Add user-facing error messages

**Integration Points:**

```typescript
// In useAgentChatWithTools hook
beforeToolExecution: async (toolId, workspaceType) => {
  await ToolPermissionGuard.checkPermission(toolId, workspaceType);
}

// In tool executor
try {
  await ToolPermissionGuard.checkPermission(toolName, workspaceType);
  // Execute tool
} catch (error) {
  if (error instanceof ToolPermissionDeniedError) {
    // Show user-friendly error
    toast.error(error.message);
    return;
  }
  throw error;
}
```

**Acceptance Criteria:**
- Tools cannot execute without proper permissions
- Clear error messages for permission failures
- Workspace transitions update available tools
- Approval flow triggers for approval-required tools

### Phase 4: UI Components (Day 2-3)

**Objective:** Create UI for managing tool permissions

**Components:**

1. **ToolPermissionsPanel** - Main configuration interface
   - Workspace selector tabs
   - Tool list with toggles
   - Approval requirement checkboxes
   - Global tool disable switches

2. **WorkspaceToolBadge** - Show tool status in UI
   - Green: Enabled
   - Yellow: Requires approval
   - Red: Disabled
   - Gray: Not available

3. **ToolApprovalDialog** - Approval flow UI
   - Tool name and description
   - Risk warning for dangerous tools
   - Approve/Deny buttons
   - "Remember decision" checkbox

**Routes:**
- Settings → Agent Configuration → Tool Permissions

**Acceptance Criteria:**
- All workspaces have permission configuration UI
- Visual indicators show tool availability
- Permission changes persist immediately
- User can see which tools are active per workspace

### Phase 5: Migration & Testing (Day 3)

**Objective:** Migrate existing agents and validate system

**Tasks:**

1. **Backward Compatibility:**
   - Migrate existing agent tool configs to new system
   - Set default permissions based on historical usage
   - Add deprecation warnings for old config format

2. **Testing:**
   - Unit tests for `ToolRegistry`
   - Integration tests for `ToolPermissionGuard`
   - E2E tests for permission UI
   - Migration testing with existing projects

3. **Documentation:**
   - Update AGENTS.md with new tool permission flow
   - Document workspace-specific tool configuration
   - Add troubleshooting guide for permission issues

**Acceptance Criteria:**
- Existing agents work without reconfiguration
- All tests pass
- Migration completes without data loss
- Documentation is comprehensive

---

## Success Metrics

### Quantitative Metrics

- **Pre-Implementation:**
  - 0 tools persisted
  - 0 workspace-specific configurations
  - No permission validation

- **Post-Implementation Targets:**
  - 100% of tools registered in centralized registry
  - 4 workspace-specific permission sets (IDE, Knowledge, Study, Canvas)
  - 100% of tool executions validated before running
  - 0 unauthorized tool executions

### Qualitative Metrics

- ✅ Permissions survive page reloads
- ✅ Different workspaces have different tool availability
- ✅ Clear visual indicators for tool status
- ✅ User-friendly error messages
- ✅ Admin can configure tool permissions via UI
- ✅ Dangerous tools require explicit approval

---

## Risk Assessment

### High-Risk Areas

1. **Breaking Existing Agent Configurations**
   - Risk: Agents may lose tool access after migration
   - Mitigation: Default to permissive permissions during migration, add warnings

2. **Performance Impact**
   - Risk: Permission checks slow down tool execution
   - Mitigation: In-memory checks, IndexedDB caching, minimal overhead

3. **User Confusion**
   - Risk: Users don't understand why tools are disabled
   - Mitigation: Clear error messages, inline help, tooltips

### Migration Risks

1. **Data Loss:** Poor migration could lose tool configurations
2. **Permission Desync:** Permissions may not match workspace reality
3. **Test Failures:** Existing tests may assume tools always available

---

## Database Schema Changes

### New IndexedDB Store: `toolsPermissions`

**Schema:**

```typescript
{
  storeName: 'toolsPermissions',
  keyPath: 'id',
  indexes: [
    { name: 'toolId', keyPath: 'toolId', unique: false },
    { name: 'workspaceType', keyPath: 'workspaceType', unique: false },
  ]
}

interface ToolsPermissionRecord {
  id: string; // `${toolId}:${workspaceType}`
  toolId: string;
  workspaceType: WorkspaceType;
  enabled: boolean;
  requiresApproval: boolean;
  customConfig?: Record<string, any>;
  updatedAt: number;
}
```

**Migration Script:**

```typescript
// On app startup or version upgrade
export async function migrateToolsPermissions() {
  const db = getDexieDB();

  // Check if migration already ran
  const version = await db.version.toArray();
  if (version.includes('tools-permissions-v1')) {
    return;
  }

  // Import default tool permissions
  const defaultPermissions = getDefaultToolPermissions();
  await db.toolsPermissions.bulkPut(defaultPermissions);

  // Mark migration complete
  await db.version.add(['tools-permissions-v1']);
}

function getDefaultToolPermissions(): ToolsPermissionRecord[] {
  return [
    // IDE workspace - filesystem + terminal tools
    {
      id: 'read_file:ide',
      toolId: 'read_file',
      workspaceType: 'ide',
      enabled: true,
      requiresApproval: false,
      updatedAt: Date.now(),
    },
    {
      id: 'write_file:ide',
      toolId: 'write_file',
      workspaceType: 'ide',
      enabled: true,
      requiresApproval: false,
      updatedAt: Date.now(),
    },
    {
      id: 'execute_command:ide',
      toolId: 'execute_command',
      workspaceType: 'ide',
      enabled: true,
      requiresApproval: true, // Dangerous - requires approval
      updatedAt: Date.now(),
    },

    // Knowledge workspace - filesystem + knowledge tools
    {
      id: 'read_file:knowledge',
      toolId: 'read_file',
      workspaceType: 'knowledge',
      enabled: true,
      requiresApproval: false,
      updatedAt: Date.now(),
    },
    {
      id: 'ingest_document:knowledge',
      toolId: 'ingest_document',
      workspaceType: 'knowledge',
      enabled: true,
      requiresApproval: false,
      updatedAt: Date.now(),
    },
    {
      id: 'execute_command:knowledge',
      toolId: 'execute_command',
      workspaceType: 'knowledge',
      enabled: false, // Blocked in knowledge workspace
      requiresApproval: false,
      updatedAt: Date.now(),
    },

    // ... and so on for all tool × workspace combinations
  ];
}
```

---

## Next Steps

### Immediate (This Week)

1. **Review and approve** this implementation plan
2. **Create feature branch:** `feature/tools-permissions-persistence`
3. **Set up tool registry** with all existing tools
4. **Implement permissions store** with Dexie persistence

### Next Sprint

1. **Integrate permission guard** into tool execution flow
2. **Build UI components** for permission management
3. **Migrate existing agents** to new permission system
4. **Complete testing** and documentation

### Future Enhancements

1. **Audit Logging:** Track tool permission changes
2. **Time-Based Permissions:** Temporary tool access (e.g., 1 hour)
3. **User-Based Permissions:** Different users have different tool access
4. **Permission Templates:** Pre-configured permission sets for common use cases
5. **Compliance Reporting:** Generate reports of tool usage by workspace

---

**Document Owner:** Agent Configuration Team
**Last Updated:** 2026-01-01
**Next Review:** After Phase 1 completion
