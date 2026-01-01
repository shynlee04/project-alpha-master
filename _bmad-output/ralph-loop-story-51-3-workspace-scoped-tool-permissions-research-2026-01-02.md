# Ralph Loop Story 51-3: Workspace-Scoped Tool Permissions Research

**Date**: 2026-01-02
**Story**: 51-3 - Workspace-Scoped Tool Permissions
**Research Focus**: Zustand January 2026 patterns for multi-tenant, workspace-scoped state management
**MCP Tool Usage**: Context7 x3 (Zustand docs, pages 1-3)

---

## Executive Summary

This document provides research-backed recommendations for implementing workspace-scoped tool permission state using Zustand v5 patterns. The solution addresses the challenge of managing `trustLevels` across multiple workspace types while maintaining type safety, performance, and backward compatibility.

**Key Finding**: Zustand v5 provides robust patterns for nested state via:
1. **Record types** for workspace-keyed data
2. **Partialize middleware** for selective persistence
3. **Custom merge functions** for safe migration
4. **useShallow hook** for selector optimization

---

## 1. Recommended State Schema

### Current Schema (Flat)

```typescript
// tool-permission-store.ts (current)
interface ToolPermissionState {
  trustLevels: Record<string, ToolTrustLevel> // toolId -> trust level
  sessionTrust: Record<string, boolean> // toolId -> session granted
}

type ToolTrustLevel = 'always-block' | 'ask-permission' | 'always-allow'
```

**Problem**: No workspace isolation - all workspaces share the same trust levels.

### Proposed Schema (Nested/Workspace-Scoped)

```typescript
// tool-permission-store.ts (workspace-scoped)
import { WorkspaceType } from '@/domain/value-objects'

interface ToolPermissionState {
  // Nested Record: toolId -> workspaceType -> trustLevel
  trustLevels: Record<string, Record<WorkspaceType, ToolTrustLevel>>

  // Session trust remains ephemeral (not persisted)
  sessionTrust: Record<string, Record<WorkspaceType, boolean>>

  // Default trust levels for new tools
  defaultTrustLevel: ToolTrustLevel

  // Version tracking for migrations
  version: number
}

type WorkspaceType = 'ide' | 'knowledge' | 'notes' | 'study'
type ToolTrustLevel = 'always-block' | 'ask-permission' | 'always-allow'
```

**Benefits**:
- **Workspace Isolation**: Each workspace has independent trust levels
- **Type Safety**: WorkspaceType enum prevents typos
- **Backward Compatible**: Migration path from flat to nested
- **Ephemeral Session**: Session trust cleared on reload via `partialize`

---

## 2. Migration Strategy

### Phase 1: Schema Migration (Zero Downtime)

```typescript
// migration-v1-to-v2.ts
import { ToolTrustLevel, WorkspaceType } from '@/types'

/**
 * Migrates flat trustLevels to workspace-scoped structure
 *
 * Before: { trustLevels: { 'read-file': 'always-allow' } }
 * After: {
 *   trustLevels: {
 *     'read-file': {
 *       ide: 'always-allow',
 *       knowledge: 'ask-permission',
 *       notes: 'ask-permission',
 *       study: 'ask-permission'
 *     }
 *   }
 * }
 */
export function migrateToWorkspaceScoped(
  persistedState: unknown,
  currentState: ToolPermissionState
): ToolPermissionState {
  // Type guard for legacy state
  const isLegacyState = (
    state: unknown
  ): state is { trustLevels: Record<string, ToolTrustLevel> } => {
    return (
      typeof state === 'object' &&
      state !== null &&
      'trustLevels' in state &&
      typeof (state as any).trustLevels === 'object' &&
      !isWorkspaceScoped((state as any).trustLevels)
    )
  }

  const isWorkspaceScoped = (
    trustLevels: unknown
  ): trustLevels is Record<string, Record<WorkspaceType, ToolTrustLevel>> => {
    // Check if first tool has workspace keys
    const firstTool = Object.values(trustLevels as any)[0]
    return (
      typeof firstTool === 'object' &&
      firstTool !== null &&
      'ide' in firstTool
    )
  }

  // If already migrated, return current state
  if (!isLegacyState(persistedState)) {
    return currentState
  }

  // Migrate flat structure to nested
  const legacyState = persistedState as { trustLevels: Record<string, ToolTrustLevel> }

  const migratedTrustLevels: Record<string, Record<WorkspaceType, ToolTrustLevel>> = {}

  // For each tool, migrate to workspace-scoped structure
  for (const [toolId, trustLevel] of Object.entries(legacyState.trustLevels)) {
    migratedTrustLevels[toolId] = {
      ide: trustLevel,           // Existing trust applies to IDE
      knowledge: 'ask-permission', // Default for new workspaces
      notes: 'ask-permission',
      study: 'ask-permission',
    }
  }

  // Deep merge with current state to preserve any new tools
  return {
    ...currentState,
    trustLevels: {
      ...currentState.trustLevels,
      ...migratedTrustLevels,
    },
    version: 2, // Increment version
  }
}
```

### Phase 2: Store Implementation with Custom Merge

```typescript
// tool-permission-store.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { createDexieStorage } from '@/infrastructure/persistence/dexie-storage'
import { migrateToWorkspaceScoped } from './migration-v1-to-v2'

const VERSION = 2

interface ToolPermissionState {
  trustLevels: Record<string, Record<WorkspaceType, ToolTrustLevel>>
  sessionTrust: Record<string, Record<WorkspaceType, boolean>>
  defaultTrustLevel: ToolTrustLevel
  version: number

  // Actions
  setTrustLevel: (toolId: string, workspaceType: WorkspaceType, level: ToolTrustLevel) => void
  getTrustLevel: (toolId: string, workspaceType: WorkspaceType) => ToolTrustLevel
  setSessionTrust: (toolId: string, workspaceType: WorkspaceType, granted: boolean) => void
  getSessionTrust: (toolId: string, workspaceType: WorkspaceType) => boolean
  resetSessionTrust: () => void
}

const initialState: ToolPermissionState = {
  trustLevels: {},
  sessionTrust: {},
  defaultTrustLevel: 'ask-permission',
  version: VERSION,
}

export const useToolPermissionStore = create<ToolPermissionState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setTrustLevel: (toolId, workspaceType, level) =>
        set((state) => ({
          trustLevels: {
            ...state.trustLevels,
            [toolId]: {
              ...state.trustLevels[toolId],
              [workspaceType]: level,
            },
          },
        })),

      getTrustLevel: (toolId, workspaceType) => {
        const state = get()
        return (
          state.trustLevels[toolId]?.[workspaceType] ||
          state.defaultTrustLevel
        )
      },

      setSessionTrust: (toolId, workspaceType, granted) =>
        set((state) => ({
          sessionTrust: {
            ...state.sessionTrust,
            [toolId]: {
              ...state.sessionTrust[toolId],
              [workspaceType]: granted,
            },
          },
        })),

      getSessionTrust: (toolId, workspaceType) => {
        const state = get()
        return state.sessionTrust[toolId]?.[workspaceType] || false
      },

      resetSessionTrust: () => set({ sessionTrust: {} }),
    }),
    {
      name: 'tool-permission-store',
      storage: createJSONStorage(() => createDexieStorage('toolPermissions')),

      // CRITICAL: Only persist trustLevels, NOT sessionTrust (ephemeral)
      partialize: (state) => ({
        trustLevels: state.trustLevels,
        defaultTrustLevel: state.defaultTrustLevel,
        version: state.version,
      }),

      // Custom merge function for safe migration
      merge: (persistedState, currentState) => {
        const version = (persistedState as any).version || 1

        // Run migration if version mismatch
        if (version < VERSION) {
          return migrateToWorkspaceScoped(persistedState, currentState)
        }

        // Otherwise, deep merge nested structures
        return {
          ...currentState,
          ...persistedState,
          trustLevels: {
            ...currentState.trustLevels,
            ...(persistedState as any).trustLevels,
          },
        }
      },

      // Handle rehydration
      onRehydrateStorage: () => (state) => {
        console.log('[ToolPermissionStore] Rehydrated:', state)
      },
    }
  )
)
```

---

## 3. Selector Patterns for Efficient Queries

### Pattern 1: Workspace-Specific Selectors (Type-Safe)

```typescript
// hooks/use-tool-permissions.ts
import { useShallow } from 'zustand/react/shallow'
import { useToolPermissionStore } from './tool-permission-store'
import type { WorkspaceType } from '@/domain/value-objects'

/**
 * Hook for accessing workspace-scoped tool permissions
 *
 * Usage in IDE workspace:
 * const { getTrustLevel, setTrustLevel } = useToolPermissions('ide')
 * const trustLevel = getTrustLevel('read-file')
 */
export function useToolPermissions(workspaceType: WorkspaceType) {
  // Workspace-scoped actions
  const getTrustLevel = useToolPermissionStore(
    (state) => (toolId: string) => state.getTrustLevel(toolId, workspaceType)
  )

  const setTrustLevel = useToolPermissionStore(
    (state) => (toolId: string, level: ToolTrustLevel) =>
      state.setTrustLevel(toolId, workspaceType, level)
  )

  const getSessionTrust = useToolPermissionStore(
    (state) => (toolId: string) => state.getSessionTrust(toolId, workspaceType)
  )

  const setSessionTrust = useToolPermissionStore(
    (state) => (toolId: string, granted: boolean) =>
      state.setSessionTrust(toolId, workspaceType, granted)
  )

  // Read-only access to trust levels for this workspace
  const trustLevels = useToolPermissionStore(
    useShallow((state) => {
      // Extract trust levels for this workspace only
      const workspaceLevels: Record<string, ToolTrustLevel> = {}
      for (const [toolId, levelsByWorkspace] of Object.entries(state.trustLevels)) {
        workspaceLevels[toolId] = levelsByWorkspace[workspaceType] || state.defaultTrustLevel
      }
      return workspaceLevels
    })
  )

  return {
    trustLevels,
    getTrustLevel,
    setTrustLevel,
    getSessionTrust,
    setSessionTrust,
  }
}
```

### Pattern 2: Cross-Workspace Selector (Comparison)

```typescript
// hooks/use-cross-workspace-tool-trust.ts
import { useShallow } from 'zustand/react/shallow'
import { useToolPermissionStore } from './tool-permission-store'

/**
 * Compares trust levels across all workspaces for a specific tool
 *
 * Usage:
 * const trustByWorkspace = useCrossWorkspaceToolTrust('read-file')
 * // Returns: { ide: 'always-allow', knowledge: 'ask-permission', ... }
 */
export function useCrossWorkspaceToolTrust(toolId: string) {
  return useToolPermissionStore(
    useShallow((state) => {
      const levels = state.trustLevels[toolId]
      if (!levels) {
        // Tool not configured - return defaults
        return {
          ide: state.defaultTrustLevel,
          knowledge: state.defaultTrustLevel,
          notes: state.defaultTrustLevel,
          study: state.defaultTrustLevel,
        }
      }

      // Ensure all workspaces have a value
      return {
        ide: levels.ide || state.defaultTrustLevel,
        knowledge: levels.knowledge || state.defaultTrustLevel,
        notes: levels.notes || state.defaultTrustLevel,
        study: levels.study || state.defaultTrustLevel,
      }
    })
  )
}
```

### Pattern 3: Optimized Multi-Tool Selector

```typescript
// hooks/use-tools-trust-batch.ts
import { useShallow } from 'zustand/react/shallow'
import { useToolPermissionStore } from './tool-permission-store'

/**
 * Batch get trust levels for multiple tools (single render)
 *
 * Usage:
 * const { read: 'always-allow', write: 'ask-permission' } = useToolsTrustBatch(['read', 'write'], 'ide')
 */
export function useToolsTrustBatch(
  toolIds: string[],
  workspaceType: WorkspaceType
): Record<string, ToolTrustLevel> {
  return useToolPermissionStore(
    useShallow((state) => {
      const result: Record<string, ToolTrustLevel> = {}
      for (const toolId of toolIds) {
        result[toolId] = state.getTrustLevel(toolId, workspaceType)
      }
      return result
    })
  )
}
```

---

## 4. Code Examples: Before/After Patterns

### Before: Flat State (Current Implementation)

```typescript
// ❌ PROBLEM: No workspace isolation
const trustLevel = useToolPermissionStore(
  (state) => state.trustLevels['read-file'] || 'ask-permission'
)

// Setting trust level affects ALL workspaces
useToolPermissionStore.getState().setTrustLevel('read-file', 'always-allow')

// Cannot have different trust levels per workspace
```

### After: Workspace-Scoped (Recommended)

```typescript
// ✅ SOLUTION: Workspace-specific trust levels
const { getTrustLevel, setTrustLevel } = useToolPermissions('knowledge')

// Get trust level for specific workspace
const trustLevel = getTrustLevel('read-file') // Returns knowledge workspace level

// Set trust level for specific workspace only
setTrustLevel('read-file', 'always-allow') // Only affects knowledge workspace

// Compare across workspaces
const trustByWorkspace = useCrossWorkspaceToolTrust('read-file')
console.log(trustByWorkspace)
// {
//   ide: 'ask-permission',
//   knowledge: 'always-allow',  // Different!
//   notes: 'ask-permission',
//   study: 'ask-permission'
// }
```

---

## 5. TypeScript Best Practices

### Type 1: Workspace-Scoped Generic Selector

```typescript
// utils/create-workspace-selector.ts
import { useToolPermissionStore } from './tool-permission-store'
import type { WorkspaceType } from '@/domain/value-objects'

/**
 * Generic factory for creating workspace-scoped selectors
 *
 * Usage:
 * const useKnowledgeTrustLevels = createWorkspaceSelector('knowledge')
 * const levels = useKnowledgeTrustLevels() // Type-safe knowledge workspace levels
 */
export function createWorkspaceSelector<TWorkspace extends WorkspaceType>(
  workspaceType: TWorkspace
) {
  return function useWorkspaceSelector() {
    return useToolPermissionStore(
      useShallow((state) => {
        const workspaceLevels: Record<string, ToolTrustLevel> = {}
        for (const [toolId, levelsByWorkspace] of Object.entries(state.trustLevels)) {
          workspaceLevels[toolId] =
            levelsByWorkspace[workspaceType] || state.defaultTrustLevel
        }
        return workspaceLevels
      })
    )
  }
}

// Usage example
const useKnowledgeTrustLevels = createWorkspaceSelector('knowledge')
const useIDETrustLevels = createWorkspaceSelector('ide')
```

### Type 2: Migration Type Guards

```typescript
// utils/migration-type-guards.ts
import type { ToolPermissionState } from './tool-permission-store'

type LegacyState = {
  trustLevels: Record<string, ToolTrustLevel>
}

type WorkspaceScopedState = {
  trustLevels: Record<string, Record<WorkspaceType, ToolTrustLevel>>
  version: number
}

/**
 * Type guard for legacy (flat) state structure
 */
export function isLegacyState(state: unknown): state is LegacyState {
  return (
    typeof state === 'object' &&
    state !== null &&
    'trustLevels' in state &&
    typeof (state as any).trustLevels === 'object' &&
    // Check if first tool has workspace keys (if false, it's legacy)
    !isWorkspaceScoped((state as any).trustLevels)
  )
}

/**
 * Type guard for workspace-scoped (nested) state structure
 */
export function isWorkspaceScoped(
  trustLevels: unknown
): trustLevels is Record<string, Record<WorkspaceType, ToolTrustLevel>> {
  const firstTool = Object.values(trustLevels as any)[0]
  return (
    typeof firstTool === 'object' &&
    firstTool !== null &&
    'ide' in firstTool &&
    'knowledge' in firstTool
  )
}

/**
 * Type-safe migration function signature
 */
export type MigrationFunction = (
  persistedState: unknown,
  currentState: ToolPermissionState
) => ToolPermissionState
```

---

## 6. Performance Optimization Strategies

### Strategy 1: Selector Memoization

```typescript
// Cache workspace-specific selectors to prevent re-renders
const selectorsCache = new Map<WorkspaceType, () => Record<string, ToolTrustLevel>>()

export function useWorkspaceTrustLevels(workspaceType: WorkspaceType) {
  if (!selectorsCache.has(workspaceType)) {
    selectorsCache.set(
      workspaceType,
      () => useToolPermissionStore(useShallow(createWorkspaceSelector(workspaceType)))
    )
  }

  return selectorsCache.get(workspaceType)!()
}
```

### Strategy 2: Lazy State Initialization

```typescript
// Only initialize trust levels for tools when first accessed
export function useToolPermissionLazy(toolId: string, workspaceType: WorkspaceType) {
  const trustLevel = useToolPermissionStore((state) => {
    // Lazy initialization pattern
    if (!state.trustLevels[toolId]?.[workspaceType]) {
      // Set default on first access
      state.setTrustLevel(toolId, workspaceType, state.defaultTrustLevel)
      return state.defaultTrustLevel
    }
    return state.trustLevels[toolId][workspaceType]
  })

  return trustLevel
}
```

---

## 7. Testing Strategy

### Test 1: Migration Safety

```typescript
// __tests__/migration.test.ts
import { describe, it, expect } from 'vitest'
import { migrateToWorkspaceScoped } from '../migration-v1-to-v2'

describe('Tool Permission Migration v1 -> v2', () => {
  it('should migrate flat structure to nested', () => {
    const legacyState = {
      trustLevels: {
        'read-file': 'always-allow',
        'write-file': 'ask-permission',
      },
    }

    const currentState = {
      trustLevels: {},
      sessionTrust: {},
      defaultTrustLevel: 'ask-permission',
      version: 2,
    }

    const migrated = migrateToWorkspaceScoped(legacyState, currentState)

    expect(migrated.trustLevels['read-file']).toEqual({
      ide: 'always-allow',
      knowledge: 'ask-permission',
      notes: 'ask-permission',
      study: 'ask-permission',
    })

    expect(migrated.trustLevels['write-file']).toEqual({
      ide: 'ask-permission',
      knowledge: 'ask-permission',
      notes: 'ask-permission',
      study: 'ask-permission',
    })

    expect(migrated.version).toBe(2)
  })

  it('should not migrate already-scoped state', () => {
    const alreadyScoped = {
      trustLevels: {
        'read-file': {
          ide: 'always-allow',
          knowledge: 'ask-permission',
        },
      },
      version: 2,
    }

    const currentState = {
      trustLevels: {
        'read-file': {
          ide: 'always-allow',
          knowledge: 'ask-permission',
        },
      },
      sessionTrust: {},
      defaultTrustLevel: 'ask-permission',
      version: 2,
    }

    const migrated = migrateToWorkspaceScoped(alreadyScoped, currentState)

    // Should return current state unchanged
    expect(migrated).toEqual(currentState)
  })
})
```

### Test 2: Selector Efficiency

```typescript
// __tests__/selectors.test.ts
import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useToolPermissions } from '../hooks/use-tool-permissions'

describe('Workspace Tool Permissions Selectors', () => {
  it('should only re-render when workspace-specific trust levels change', () => {
    const { rerender } = renderHook(() => useToolPermissions('knowledge'))

    const renderSpy = vi.fn()
    const { result } = renderHook(() => useToolPermissions('knowledge'))

    // Initial render
    expect(result.current).toBeDefined()

    // Changing IDE trust level should NOT trigger re-render
    const store = useToolPermissionStore.getState()
    store.setTrustLevel('read-file', 'ide', 'always-block')

    // Knowledge workspace should not re-render
    expect(renderSpy).not.toHaveBeenCalled()

    // Changing knowledge trust level SHOULD trigger re-render
    store.setTrustLevel('read-file', 'knowledge', 'always-allow')

    // Verify knowledge workspace updated
    expect(result.current.getTrustLevel('read-file')).toBe('always-allow')
  })
})
```

---

## 8. Implementation Checklist

- [ ] **Step 1**: Create migration function (`migration-v1-to-v2.ts`)
- [ ] **Step 2**: Update store schema with nested `trustLevels`
- [ ] **Step 3**: Add custom `merge` function to persist middleware
- [ ] **Step 4**: Implement `partialize` to exclude `sessionTrust`
- [ ] **Step 5**: Create `useToolPermissions` hook with workspace scoping
- [ ] **Step 6**: Add `useCrossWorkspaceToolTrust` for comparison UI
- [ ] **Step 7**: Update `ToolPermissionManager` facade to support workspace parameter
- [ ] **Step 8**: Write migration tests (legacy → scoped)
- [ ] **Step 9**: Write selector efficiency tests
- [ ] **Step 10**: Update UI components to use workspace-scoped hooks
- [ ] **Step 11**: Update AgentConfigDialog to display workspace-specific trust levels
- [ ] **Step 12**: Verify backward compatibility with existing persisted state

---

## 9. Backward Compatibility Strategy

### Legacy API Support

```typescript
// Maintain backward compatibility during transition period
export function useToolPermissionStore() {
  const store = useToolPermissionStoreRaw()

  // Legacy support: default to 'ide' workspace if no workspace specified
  const legacySetTrustLevel = (toolId: string, level: ToolTrustLevel) => {
    console.warn(
      '[ToolPermissionStore] Legacy API called. Use setTrustLevel(toolId, workspaceType, level) instead.'
    )
    store.setTrustLevel(toolId, 'ide', level)
  }

  return {
    ...store,
    // Add legacy method
    setTrustLevelLegacy: legacySetTrustLevel,
  }
}
```

### Deprecation Warning

```typescript
// In development, warn about deprecated usage
if (process.env.NODE_ENV === 'development') {
  const originalSetTrustLevel = store.setTrustLevel
  store.setTrustLevel = function (toolId: string, ...args: any[]) {
    if (args.length === 1) {
      console.warn(
        `[ToolPermissionStore] Deprecation: setTrustLevel("${toolId}", level) is deprecated. ` +
          `Use setTrustLevel("${toolId}", workspaceType, level) instead.`
      )
      return originalSetTrustLevel(toolId, 'ide', args[0])
    }
    return originalSetTrustLevel(toolId, ...args)
  }
}
```

---

## 10. Key Takeaways

### 1. **Nested State via Record Types**
- Use `Record<string, Record<WorkspaceType, ToolTrustLevel>>` for workspace isolation
- Type-safe via WorkspaceType enum
- Enables per-workspace trust level configuration

### 2. **Migration Safety**
- Custom `merge` function in persist middleware
- Version tracking (`version: number`)
- Type guards for legacy vs. scoped state
- Deep merge preserves existing data

### 3. **Selective Persistence**
- `partialize` excludes `sessionTrust` (ephemeral)
- Only persist `trustLevels`, `defaultTrustLevel`, `version`
- Session trust cleared on reload (security feature)

### 4. **Selector Optimization**
- `useShallow` prevents unnecessary re-renders
- Workspace-specific hooks isolate state access
- Batch selectors for multi-tool queries
- Memoization for performance

### 5. **Backward Compatibility**
- Graceful migration from flat to nested
- Deprecation warnings during transition
- Legacy API support period
- Zero data loss migration path

---

## 11. Recommended Next Steps

1. **Review and Validate**: Share this research document with the team for feedback
2. **Proof of Concept**: Create a test store with nested state to verify patterns
3. **Migration Script**: Implement `migrateToWorkspaceScoped` with comprehensive tests
4. **Incremental Rollout**: Start with one workspace (e.g., knowledge) before full migration
5. **Documentation**: Update AGENTS.md with workspace-scoped permission patterns
6. **UI Updates**: Modify AgentConfigDialog to display per-workspace trust levels

---

## References

### Zustand Documentation
- **Nested Objects Persistence**: https://github.com/pmndrs/zustand/blob/main/docs/middlewares/persist.md
- **Custom Merge Function**: https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md
- **useShallow Hook**: https://github.com/pmndrs/zustand/blob/main/docs/guides/beginner-typescript.md
- **Partial Persistence**: https://github.com/pmndrs/zustand/blob/main/docs/middlewares/persist.md

### Internal Project References
- Story 51-3: Workspace-Scoped Tool Permissions
- Epic 51: Multi-Workspace Agent Architecture
- Agent Workspace Bindings (Cycle 16 domain services)
- Tool Permission Store (Cycle 12 implementation)

---

**End of Research Document**

---

**Research Summary**:
- **MCP Tool Usage**: 3 Context7 queries (Zustand docs, pages 1-3)
- **Patterns Identified**: 5 core Zustand v5 patterns for workspace-scoped state
- **Migration Strategy**: Zero-downtime deep merge with version tracking
- **Type Safety**: Full TypeScript coverage with generic selectors
- **Performance**: Optimized via useShallow and memoization
- **Backward Compatibility**: Graceful migration path from flat to nested

**Status**: ✅ Research Complete - Ready for implementation planning
