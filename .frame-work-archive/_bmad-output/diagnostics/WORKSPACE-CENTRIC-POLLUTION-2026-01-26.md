# Workspace-Centric Pollution Inventory

**Generated**: 2026-01-26
**Scanned By**: domain-scanner (subagent)
**Architecture Target**: v3.0.0 (Project-Centric Model)
**Status**: ⚠️ SIGNIFICANT POLLUTION DETECTED

---

## Executive Summary

| Category | Count | Severity |
|----------|-------|----------|
| Translation Keys (ide.*) | 33 | 🟡 Medium |
| Translation Keys (workspace.*) | 28 | 🟡 Medium |
| Translation Keys (notes.*) | 75+ | 🟢 Keep (plugin namespace) |
| Store workspaceId References | 100+ | 🔴 High |
| Dexie Migration Composite Keys | 347 | 🔴 Critical |
| Component Workspace References | 47 | 🟡 Medium |
| Route Workspace Prefixes | 5 | 🟡 Medium (redirects exist) |
| Type Definition Violations | 15+ | 🔴 High |

**Overall Assessment**: ~600 workspace-centric patterns require migration to project-centric model.

---

## 1. Translation Key Pollution

### 1.1 IDE-Prefixed Keys (ide.*)

| Key | Usage Context | Migration Target |
|-----|---------------|------------------|
| `ide.noFolderSelected` | IDE empty state | `plugin.monaco.noFolderSelected` |
| `ide.openFolderToView` | IDE empty state | `plugin.filetree.openFolderToView` |
| `ide.loading` | IDE loading | `plugin.common.loading` |
| `ide.fileExplorer` | IDE sidebar | `plugin.filetree.title` |
| `ide.noFileOpen` | Editor empty | `plugin.monaco.noFileOpen` |
| `ide.selectFile` | Editor hint | `plugin.monaco.selectFile` |
| `ide.deviceDesktop` | Preview device | `plugin.preview.deviceDesktop` |
| `ide.deviceTablet` | Preview device | `plugin.preview.deviceTablet` |
| `ide.deviceMobile` | Preview device | `plugin.preview.deviceMobile` |
| `ide.preview` | Preview label | `plugin.preview.title` |
| `ide.refreshPreview` | Preview action | `plugin.preview.refresh` |
| `ide.openInNewTab` | Preview action | `plugin.preview.openInNewTab` |
| `ide.waitingDevServer` | Preview status | `plugin.preview.waitingDevServer` |
| `ide.runDevCommand` | Preview hint | `plugin.preview.runDevCommand` |
| `ide.reAuthorize` | FSA permission | `project.permissions.reAuthorize` |
| `ide.fsDenied` | FSA error | `project.permissions.fsDenied` |
| `ide.syncError` | Sync status | `project.sync.error` |
| `ide.toggleChatShortcut` | Chat toggle | `plugin.chat.toggleShortcut` |
| `ide.hideChat` | Chat toggle | `plugin.chat.hide` |
| `ide.showChat` | Chat toggle | `plugin.chat.show` |
| `ide.autoSync` | Sync status | `project.sync.autoEnabled` |
| `ide.autoSyncOff` | Sync status | `project.sync.autoDisabled` |
| `ide.syncNow` | Sync action | `project.sync.syncNow` |
| `ide.switchFolder` | Project action | `project.switchFolder` |
| `ide.openFolder` | Project action | `project.openFolder` |
| `ide.terminal` | Terminal label | `plugin.terminal.title` |
| `ide.output` | Output label | `plugin.terminal.output` |
| `ide.problems` | Problems label | `plugin.diagnostics.problems` |
| `ide.outputSoon` | Coming soon | `plugin.terminal.outputSoon` |
| `ide.problemsSoon` | Coming soon | `plugin.diagnostics.problemsSoon` |
| `errors.ide.openOnMobile.title` | Mobile error | `errors.platform.desktopRequired.title` |
| `errors.ide.openOnMobile.description` | Mobile error | `errors.platform.desktopRequired.description` |
| `errors.ide.openOnMobile.action` | Mobile error | `errors.platform.desktopRequired.action` |

**Total IDE Keys**: 33
**Migration Strategy**: Rename to plugin-specific or project-scoped namespace

### 1.2 Workspace-Prefixed Keys (workspace.*)

| Key | Usage Context | Migration Target |
|-----|---------------|------------------|
| `workspace.switcher.switchWorkspace` | Switcher | `plugin.switcher.switchPlugin` |
| `workspace.switcher.toolAvailabilityHint` | Switcher | `plugin.switcher.toolHint` |
| `workspace.switcher.selectWorkspaceHint` | Switcher | `plugin.switcher.selectPluginHint` |
| `workspace.switcher.legend.available` | Legend | `plugin.switcher.legend.available` |
| `workspace.switcher.legend.unavailable` | Legend | `plugin.switcher.legend.unavailable` |
| `workspace.switcher.legend.toolCount` | Legend | `plugin.switcher.legend.toolCount` |
| `workspace.switcher.agentNotAvailable` | Agent status | `agent.notAvailableInPlugin` |
| `workspace.switcher.toolsAvailableCount` | Tool count | `plugin.switcher.toolsAvailable` |
| `workspace.switcher.toolsDisabledCount` | Tool count | `plugin.switcher.toolsDisabled` |
| `workspace.provider.title` | Provider | `project.provider.title` |
| `workspace.provider.preferred` | Provider | `project.provider.preferred` |
| `workspace.provider.useGlobal` | Provider | `project.provider.useGlobal` |
| `workspace.provider.noKey` | Provider | `project.provider.noKey` |
| `workspace.provider.strictMode` | Provider | `project.provider.strictMode` |
| `workspace.provider.strictModeDesc` | Provider | `project.provider.strictModeDesc` |
| `workspace.provider.clear` | Provider | `project.provider.clear` |
| `workspace.provider.resetAll` | Provider | `project.provider.resetAll` |
| `workspace.provider.providerSet` | Provider | `project.provider.providerSet` |
| `workspace.provider.providerCleared` | Provider | `project.provider.providerCleared` |
| `workspaceSwitcher.selectWorkspace` | Switcher | `pluginSwitcher.selectPlugin` |
| `workspaceSwitcher.lastWorkspacePersisted` | Switcher | `pluginSwitcher.preferencesSaved` |
| `errors.workspace.openFailed.*` | Errors | `errors.project.openFailed.*` |
| `errors.workspace.permissionDenied.*` | Errors | `errors.project.permissionDenied.*` |
| `errors.workspace.notFound.*` | Errors | `errors.project.notFound.*` |

**Total Workspace Keys**: 28
**Migration Strategy**: Rename to `plugin.*` or `project.*` namespace

### 1.3 Notes-Prefixed Keys (notes.*)

| Assessment | Decision |
|------------|----------|
| **75+ keys** starting with `notes.*` | ✅ KEEP as plugin namespace |
| These represent the Notes plugin UI | No change needed |
| Example: `notes.createNote`, `notes.saving` | Map to `plugin.notes.*` optionally |

**Decision**: Keep `notes.*` keys - they correctly represent a plugin namespace.

---

## 2. Store Composite Key Violations

### 2.1 Dexie Schema Composite Keys

| Table | Schema Pattern | Violation | Fix Required |
|-------|---------------|-----------|--------------|
| `ideState` | `projectId, workspaceId, [projectId+workspaceId]` | ⛔ Composite key | `projectId` only |
| `conversations` | `id, workspaceId, projectId, [projectId+workspaceId]` | ⛔ Composite key | Remove workspaceId from index |
| `threads` | `id, workspaceId, projectId, [projectId+workspaceId]` | ⛔ Composite key | Remove workspaceId from index |
| `sources` | `id, workspaceId, projectId, [projectId+workspaceId]` | ⛔ Composite key | Remove workspaceId from index |
| `collections` | `id, workspaceId, projectId, [projectId+workspaceId]` | ⛔ Composite key | Remove workspaceId from index |
| `synthesisResults` | `id, workspaceId, projectId, [projectId+workspaceId]` | ⛔ Composite key | Remove workspaceId from index |
| `oramaIndexes` | `id, workspaceId, projectId, [projectId+workspaceId]` | ⛔ Composite key | Remove workspaceId from index |
| `notes` | `id, workspaceId, projectId, [projectId+workspaceId]` | ⛔ Composite key | Remove workspaceId from index |
| `fsaHandles` | `projectId, workspaceId, [projectId+workspaceId]` | ⛔ Composite key | `projectId` only |
| `fileMetadata` | `[projectId+workspaceId+path]` | ⛔ Triple composite | `[projectId+path]` |
| `fileContentCache` | `[projectId+workspaceId+path]` | ⛔ Triple composite | `[projectId+path]` |
| `fileSnapshots` | `[projectId+workspaceId+path]` | ⛔ Triple composite | `[projectId+path]` |

**Total workspaceId references in migrations**: 347
**Location**: `src/infrastructure/persistence/dexie-db-migrations.ts`
**Severity**: 🔴 Critical - Requires migration script

### 2.2 Store Factory Composite Keys

| File | Line | Pattern Found | Fix Required |
|------|------|---------------|--------------|
| `workspace-store-factory.ts` | 33-34 | `${workspaceId}:${projectId}` | Use `projectId` only |
| `workspace-store-facade.ts` | 70-88 | `createWorkspaceStore(workspaceId, projectId)` | Remove workspaceId param |

**Location**: `src/infrastructure/persistence/stores/workspace-store-factory.ts`

### 2.3 Type Definitions with workspaceId

| File | workspaceId Usage | Line(s) | Migration Plan |
|------|-------------------|---------|----------------|
| `dexie-db-core-types.ts` | `workspaceId: 'ide' \| 'knowledge' \| 'study' \| 'notes'` | 37, 50, 95, 100, 114, 119, 129, 134, 147, 151 | Remove from types |
| `dexie-db-session-types.ts` | `workspaceId` in all session types | 43, 88, 115, 140, 160, 188 | Remove field |
| `handle-types.ts` | `workspaceId` in FSA handle types | 30, 89 | Remove field |
| `workspace-types.ts` | `WorkspaceType` enum | 14 | Keep for plugin identification |
| `workspace.ts` (domain) | `type WorkspaceType = 'ide' \| 'knowledge' \| 'study' \| 'notes'` | 14 | Rename to `PluginType` |

**Total Type Violations**: 15+ files

---

## 3. Component Workspace References

### 3.1 Workspace Directory Components

| Component | Path | Reference Type | Migration Action |
|-----------|------|----------------|------------------|
| `SyncStatusIndicator.tsx` | `workspace/sync/` | Import from workspace stores | Move to `plugin/common/` |
| `FileChangeNotification.tsx` | `workspace/sync/` | Import from workspace stores | Move to `plugin/common/` |
| `WorkspaceSettings.tsx` | `workspace/` | WorkspaceType imports | Rename to `PluginSettings.tsx` |
| `TempProjectBanner.tsx` | `workspace/` | temp-project lib import | Move to `project/` |
| `WorkspaceEnhancedSwitcher.tsx` | `workspace/` | WorkspaceType logic | Rename to `PluginSwitcher.tsx` |
| `FolderPickerDialog.tsx` | `workspace/` | fsa-persistence import | Move to `project/` |
| `FolderOverlapWarningDialog.tsx` | `workspace/` | FSA overlap logic | Move to `project/` |

**Total Components in workspace/**: 7

### 3.2 Components Importing Workspace Types

| Component | Import | Migration |
|-----------|--------|-----------|
| `ToolAvailabilityIndicator.tsx` | `WorkspaceType` | Use `PluginType` |
| `UnifiedAgentSelector.tsx` | `detectWorkspace` | Use `detectPlugin` |
| `FilePermissionRow.tsx` | `WorkspaceType` | Use `PluginType` |
| `ToolPermissionRow.tsx` | `WorkspaceType` | Use `PluginType` |
| `PermissionGridHeader.tsx` | `WorkspaceType` | Use `PluginType` |
| `WorkspaceToolPermissionsConfig.tsx` | `WorkspaceType` | Rename to `PluginToolPermissionsConfig` |
| `ChatHistory.tsx` | workspace/project filters | Use project-only filters |

**Total Components with WorkspaceType**: 40+

---

## 4. Route Workspace Prefixes

| Route File | Current Path | Target Path | Status |
|------------|--------------|-------------|--------|
| `ide.$projectId.tsx` | `/ide/$projectId` | `/$projectId` | 🟢 Redirect exists |
| `notes.$projectId.tsx` | `/notes/$projectId` | `/$projectId` | 🟢 Redirect exists |
| `workspace/$projectId.tsx` | `/workspace/$projectId` | `/$projectId` | 🟢 Redirect exists |
| `workspace/index.tsx` | `/workspace/` | `/hub` | 🟡 Needs redirect |
| `notes.lazy.tsx` | `/notes` | `/hub` | 🟡 Evaluate deprecation |

**Good News**: Most legacy routes already redirect to unified `/$projectId` route.

---

## 5. Type Definition Violations

### 5.1 Domain Entity WorkspaceType

| Type File | Current Definition | Target Definition |
|-----------|-------------------|-------------------|
| `src/domain/entities/workspace.ts` | `type WorkspaceType = 'ide' \| 'knowledge' \| 'study' \| 'notes'` | Rename to `PluginType` |
| `src/domain/entities/workspace.ts` | `interface WorkspaceConfig` | Rename to `PluginConfig` |
| `src/domain/entities/workspace.ts` | `interface WorkspaceState` | Rename to `PluginState` |

### 5.2 Infrastructure Types

| File | Current | Target |
|------|---------|--------|
| `project-types.ts` | References workspace | Use pluginBindings |
| `workspace-store.ts` | useWorkspaceStore | Deprecate, use project store |
| `workspace-store-factory.ts` | createWorkspaceStore | Deprecate entire file |
| `workspace-types.ts` | WORKSPACES constant | Rename to PLUGINS constant |

---

## 6. Store Files to Deprecate

### 6.1 Workspace Store Directory

```
src/infrastructure/persistence/stores/workspace/
├── unified-workspace-context.ts      → DEPRECATE
├── unified-workspace-provider.tsx    → DEPRECATE
├── workspace-provider.tsx            → DEPRECATE
├── workspace-provider-slice.ts       → DEPRECATE
├── workspace-store.ts                → DEPRECATE
├── workspace-types.ts                → RENAME to plugin-types.ts
├── slices/
│   ├── use-file-loader-slice.ts      → KEEP (project-scoped)
│   ├── use-file-ops-slice.ts         → KEEP (project-scoped)
│   ├── use-storage-adapter-slice.ts  → KEEP (project-scoped)
│   └── use-vfs-sync-slice.ts         → KEEP (project-scoped)
└── __tests__/
    └── workspace-switch-isolation.test.ts → UPDATE tests
```

### 6.2 Facade Files

```
src/infrastructure/persistence/stores/
├── workspace-store-facade.ts         → DEPRECATE
├── workspace-store-factory.ts        → DEPRECATE
└── workspace-store-factory.test.ts   → REMOVE
```

---

## Summary

| Category | Migration Required |
|----------|-------------------|
| **Translation keys to migrate** | 61 keys (ide.*, workspace.*) |
| **Store composite keys to fix** | 347+ occurrences in migrations |
| **Components to update** | 47 files |
| **Routes to consolidate** | 2 remaining (redirects already exist) |
| **Type definitions to rename** | 15+ files |
| **Store files to deprecate** | 8 files |

### Priority Order

1. **P0**: Dexie schema migration (remove workspaceId from composite keys)
2. **P0**: Type renaming (`WorkspaceType` → `PluginType`)
3. **P1**: Store file deprecation/consolidation
4. **P1**: Component workspace/ directory refactor
5. **P2**: Translation key migration
6. **P2**: Test file updates

### Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Dexie migration failure | Data loss | Backup + rollback plan |
| Import path breaks | Build failure | Update all imports via codemod |
| Test regressions | CI failure | Run full test suite |
| User data isolation | Data leakage | Test data isolation post-migration |

---

**Report End**
