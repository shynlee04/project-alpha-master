# P0-2: Unified Workspace Provider Refactoring Plan

**File**: `src/infrastructure/persistence/stores/workspace/unified-workspace-provider.tsx`
**Current**: 734 lines (far exceeds 300-line limit)
**Target**: Extract into focused hooks

## Refactoring Strategy

The provider has too many responsibilities:
1. Zustand store aggregation (5 cornerstones)
2. File system state management (12 useState hooks)
3. Sync operations (performSync, syncNow)
4. File system actions (openFolder, switchFolder, restoreAccess)
5. Workspace switching (switchWorkspace)
6. Context value construction (large useMemo)

## Extracted Hooks

### 1. useWorkspaceFileSystem.ts (~200 lines)
**Responsibility**: File system operations and state
**Exports**:
- File system state (directoryHandle, permissionState, syncStatus, etc.)
- File system actions (openFolder, switchFolder, syncNow, restoreAccess)
- Sync management (performSync, setAutoSync, setExclusionPatterns)
- Infrastructure refs (localAdapterRef, syncManagerRef)

### 2. useCornerstoneStores.ts (~80 lines)
**Responsibility**: Aggregates the 5 cornerstone Zustand stores
**Exports**:
- Store accessors (appStore, agentSelectionStore, conversationStore, ragStore, workspaceStore)
- Store actions (handleSetActiveWorkspace, handleSetActiveProjectId, handleSetActiveAgent)

### 3. useWorkspaceSwitching.ts (~60 lines)
**Responsibility**: Workspace switching logic
**Exports**:
- enabledWorkspaces
- switchWorkspace function
- persistLastWorkspace helper

## Updated Provider Structure

After extraction, the provider should be ~150 lines:

```typescript
// unified-workspace-provider.tsx (simplified)
export function UnifiedWorkspaceProvider({ children, initialWorkspace, initialProjectId }) {
  // Initialize workspace from props
  useEffect(() => {
    if (initialWorkspace && initialWorkspace !== 'hub') {
      setCurrentWorkspace(initialWorkspace);
    }
  }, [initialWorkspace]);

  // Load project if provided
  useEffect(() => {
    if (initialProjectId) {
      loadProject(initialProjectId);
    }
  }, [initialProjectId]);

  // Use extracted hooks
  const fileSystem = useWorkspaceFileSystem();
  const cornerstoneStores = useCornerstoneStores();
  const workspaceSwitching = useWorkspaceSwitching();

  // Construct context value
  const contextValue = useMemo(() => ({
    ...cornerstoneStores,
    fileSystem,
    workspaceSwitching,
  }), [cornerstoneStores, fileSystem, workspaceSwitching]);

  return <UnifiedWorkspaceContext.Provider value={contextValue}>
    {children}
  </UnifiedWorkspaceContext.Provider>;
}
```

## Acceptance Criteria

- [ ] Main provider ≤200 lines
- [ ] Extracted hooks have clear responsibilities
- [ ] TypeScript compiles without errors
- [ ] Zero breaking changes (existing consumers still work)
- [ ] All functionality preserved

## Dependencies

- Stores: useWorkspaceStore, useAppStore, useAgentSelectionStore, useConversationStore, useRAGStore
- File system: LocalFSAdapter, SyncManager, project-store, permission-lifecycle
- Router: useNavigate from @tanstack/react-router
