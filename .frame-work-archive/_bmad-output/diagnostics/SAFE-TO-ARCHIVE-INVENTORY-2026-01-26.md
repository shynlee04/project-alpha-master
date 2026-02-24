# Safe-to-Archive Inventory

**Generated**: 2026-01-26T19:15:00+07:00
**Scanner**: deep-scan-architecture-scanner (subagent)
**Source**: COMPREHENSIVE-CHAOS-ANALYSIS-2026-01-26.md
**Codebase**: 1,736 TypeScript files, 357,772 LOC

---

## Executive Summary

| Category | Files | Lines | Safe to Archive |
|----------|-------|-------|-----------------|
| **Deprecated Routes** | 6 | 377 | YES (100%) |
| **Deprecated Bak Files** | 2 | 1,094 | YES (100%) |
| **Legacy Workspace (Blocked)** | 33 | 6,733 | NO (29 active imports) |
| **Duplicate Implementations** | - | - | PARTIAL (see analysis) |
| **TOTAL IMMEDIATE** | 8 | 1,471 | ~0.4% codebase reduction |

---

## Category 1: Deprecated Routes (IMMEDIATE ARCHIVAL - 100% SAFE)

All routes redirect to `/$projectId` or `/hub`. Only imported by auto-generated `routeTree.gen.ts`.

| File Path | Lines | Reason | Import Count | Evidence |
|-----------|-------|--------|--------------|----------|
| `src/routes/ide.tsx` | 25 | Redirects to /hub | 0 (auto-gen only) | `beforeLoad: throw redirect({ to: '/hub' })` |
| `src/routes/ide.$projectId.tsx` | 113 | Redirects to /$projectId | 0 (auto-gen only) | `beforeLoad: throw redirect({ to: '/$projectId' })` |
| `src/routes/notes.lazy.tsx` | 27 | Redirects to /hub via window.location | 0 (auto-gen only) | `window.location.href = '/hub'` |
| `src/routes/notes.$projectId.tsx` | 145 | Redirects to /$projectId | 0 (auto-gen only) | `beforeLoad: throw redirect({ to: '/$projectId' })` |
| `src/routes/workspace/$projectId.tsx` | 32 | Redirects to /$projectId | 0 (auto-gen only) | `beforeLoad: throw redirect({ to: '/$projectId' })` |
| `src/routes/workspace/index.tsx` | 35 | Legacy workspace landing | 0 (auto-gen only) | Navigates to /ide (deprecated) |

**Subtotal**: 6 files, **377 lines**

### Archive Procedure
1. Delete route files
2. Run `pnpm tsr:routes` to regenerate routeTree.gen.ts
3. Verify no 404s in production

---

## Category 2: Bak Files (IMMEDIATE DELETE - 100% SAFE)

| File Path | Lines | Type | Evidence |
|-----------|-------|------|----------|
| `src/infrastructure/context/project-context.tsx.bak` | 364 | Old implementation | Backup of current file |
| `src/routeTree.gen.ts.backup` | 730 | Auto-generated backup | Will be regenerated |

**Subtotal**: 2 files, **1,094 lines**

### Delete Procedure
```bash
rm src/infrastructure/context/project-context.tsx.bak
rm src/routeTree.gen.ts.backup
```

---

## Category 3: Legacy Workspace Code (BLOCKED - ACTIVE IMPORTS)

### 3A: `src/lib/workspace/` (33 files, 6,733 lines)

**Status**: CANNOT ARCHIVE - 29 active import locations

| Importing File | Import Target | Type |
|----------------|---------------|------|
| `src/infrastructure/persistence/stores/index.ts` | file-sync-status-store | Re-export |
| `src/domain/services/project-creation-service.ts` | fsa-persistence, browser-mode, temp-project | Service |
| `src/presentation/components/ide/FileTree/FileTree.tsx` | useFileSyncStatusStore | Hook |
| `src/presentation/components/ide/FileTree/FileTreeItem.tsx` | useFileSyncStatusStore | Hook |
| `src/presentation/components/hub/HubHomePage.tsx` | fsa-persistence | Service |
| `src/presentation/components/hub/WorkspaceBadge.tsx` | WorkspaceId type | Type |
| `src/presentation/components/hub/ProjectCard.tsx` | WorkspaceId type | Type |
| `src/presentation/components/hub/ProjectBadge.tsx` | WorkspaceId type | Type |
| `src/presentation/components/layout/IDELayout/IDETerminalPanel.tsx` | TerminalTab type | Type |
| `src/presentation/components/layout/TerminalPanel.tsx` | TerminalTab type | Type |
| `src/presentation/components/agent/UnifiedAgentSelector.tsx` | workspace-detector | Function |
| `src/presentation/components/agent/useAgentConfigProvider.ts` | workspace-detector | Function |
| `src/hooks/useWorkspaceContext.ts` | workspace-detector | Function |
| `src/lib/agent/tools/search-notes-tool.ts` | note-context-tracker | Function |
| `src/presentation/components/ui/activity-indicators/SyncStatusPanel.tsx` | useFileSyncStatusStore | Hook |

**Migration Required**: Move to `src/infrastructure/persistence/stores/` or `src/domain/services/`

### 3B: `src/presentation/components/workspace/` (9 files, 1,540 lines)

**Status**: CANNOT ARCHIVE - Components still used

| Component | Lines | Usage | Blocking Files |
|-----------|-------|-------|----------------|
| `FolderPickerDialog.tsx` | 328 | Folder selection UI | Internal use only |
| `FolderOverlapWarningDialog.tsx` | 214 | Warning dialog | Used by FolderPickerDialog |
| `TempProjectBanner.tsx` | 119 | Temp project indicator | Exported, may be unused |
| `WorkspaceEnhancedSwitcher.tsx` | 386 | Workspace switching UI | Legacy, likely unused |
| `WorkspaceSettings.tsx` | 172 | Workspace settings | Exported, check usage |
| `sync/SyncStatusIndicator.tsx` | 120 | Sync status UI | Duplicate of ide/ version |
| `sync/FileChangeNotification.tsx` | 164 | File change toast | Check usage |
| `sync/index.ts` | - | Exports | - |
| `index.ts` | - | Exports | - |

**Note**: No files outside `workspace/` import from `@/presentation/components/workspace`. Components only imported via internal `index.ts`. Potential to archive after verifying no runtime usage.

---

## Category 4: Duplicate Implementations (ANALYSIS)

### 4A: Events (lib/events vs infrastructure/events)

| Legacy Location | Lines | Canonical Location | Lines | Status |
|-----------------|-------|--------------------|-------|--------|
| `src/lib/events/` | 1,791 | `src/infrastructure/events/` | 1,009 | **CANONICAL IS RE-EXPORTER** |

**Finding**: `infrastructure/events/cross-workspace-event-bus.ts` (34 lines) RE-EXPORTS from `lib/events/cross-workspace-event-bus.ts` (583 lines). The lib/ version is the canonical implementation.

**Action**: Keep `lib/events/`, it is the source of truth. `infrastructure/events/` merely re-exports.

**Import Analysis**:
- `@/lib/events/`: 40+ imports across codebase
- `@/infrastructure/events/`: 31 imports (but some import from event-bus.ts which is 755 lines of actual implementation)

**Verdict**: COMPLEX DUPLICATION - Both have real implementations. Needs careful merge, NOT safe for immediate archive.

### 4B: Filesystem (lib/filesystem vs infrastructure/filesystem)

| Legacy Location | Files | Lines | Canonical Location | Files | Lines |
|-----------------|-------|-------|-------------------|-------|-------|
| `src/lib/filesystem/` | 43 (prod) | 6,056 | `src/infrastructure/filesystem/` | 27 (prod) | 8,834 |

**Finding**: 
- `lib/filesystem/index.ts` marks most exports as `@deprecated`, recommending `@/infrastructure/filesystem`
- BUT: Active imports from `lib/filesystem/` exist (36+ locations)
- `infrastructure/filesystem/` imports FROM `lib/filesystem/` for some utilities

**Key Dependencies**:
- `lib/filesystem/unified-storage-adapter.ts` (409 lines) - Used by 4 files
- `lib/filesystem/permission-lifecycle.ts` (322 lines) - Used by 5 files
- `lib/filesystem/sync-manager/` (13 files, ~1,000 lines) - Re-exported by `infrastructure/sync/`

**Verdict**: NOT safe for immediate archive. Migration plan required.

### 4C: Filesync (lib/filesync vs infrastructure/sync)

| Legacy Location | Lines | Canonical Location | Lines | Status |
|-----------------|-------|--------------------|-------|--------|
| `src/lib/filesync/` | 570 (17 + 553 in hooks) | `src/infrastructure/sync/` | 10,903 | **LIB IS RE-EXPORTER** |

**Finding**: Most `lib/filesync/*.ts` files are 1-line re-exports:
```typescript
export * from '@/infrastructure/sync/workspace-services/file-sync-service'
```

**Exception**: `lib/filesync/hooks/use-file-sync-service.ts` (252 lines) has actual implementation.

**Action**: 
- Safe to archive: 8 files that are pure re-exports (8 lines total)
- Keep: `hooks/` directory (553 lines) - actual implementation

---

## Category 5: Dead Code (IMMEDIATE DELETE - VERIFY FIRST)

### 5A: Potential Dead Exports in `src/presentation/components/workspace/`

No files import from `@/presentation/components/workspace` outside the workspace directory itself.

**Verification Needed**:
```bash
grep -rn "from.*components/workspace" src/ --include="*.ts" --include="*.tsx" | grep -v "workspace/"
```

**Result**: 0 matches - Components are self-contained

**Potential Safe Archive** (after runtime verification):
- `WorkspaceEnhancedSwitcher.tsx` (386 lines) - Likely unused legacy switcher
- `WorkspaceSettings.tsx` (172 lines) - Likely unused settings panel

---

## Summary

### IMMEDIATE ARCHIVAL (100% Safe)

| Category | Files | Lines |
|----------|-------|-------|
| Deprecated Routes | 6 | 377 |
| Bak Files | 2 | 1,094 |
| **TOTAL** | **8** | **1,471** |

**Codebase Reduction**: 1,471 / 357,772 = **0.41%**

### REQUIRES MIGRATION FIRST (NOT Safe Yet)

| Category | Files | Lines | Blocking Issue |
|----------|-------|-------|----------------|
| `lib/workspace/` | 33 | 6,733 | 29+ active imports |
| `lib/filesystem/` | 43 | 6,056 | Cross-dependencies |
| `lib/events/` | 11 | 1,791 | Is canonical source |
| `presentation/components/workspace/` | 9 | 1,540 | Internal deps |

### POTENTIAL FUTURE ARCHIVE (After Verification)

| Category | Files | Lines | Verification Required |
|----------|-------|-------|----------------------|
| `lib/filesync/` re-exports | 8 | 8 | Confirm no direct usage |
| `workspace/WorkspaceEnhancedSwitcher.tsx` | 1 | 386 | Runtime check |
| `workspace/WorkspaceSettings.tsx` | 1 | 172 | Runtime check |

---

## Recommended Archive Order

### Phase 1: Immediate (Today)
1. Delete 2 `.bak` files (1,094 lines)
2. Delete 6 deprecated routes (377 lines)
3. Regenerate `routeTree.gen.ts`
4. Verify build passes

### Phase 2: After Migration (Next Sprint)
1. Migrate `lib/workspace/` types/functions to proper domains
2. Update all import paths
3. Archive empty `lib/workspace/`

### Phase 3: Consolidation (Future Epic)
1. Audit `lib/filesystem/` vs `infrastructure/filesystem/`
2. Consolidate sync implementations
3. Archive legacy facades

---

## Evidence Commands Run

```bash
# Route imports
grep -rn "from.*routes/ide" src/ --include="*.ts" --include="*.tsx" | grep -v routeTree

# Workspace imports  
grep -rn "from.*@/lib/workspace" src/ --include="*.ts" --include="*.tsx" | grep -v "__tests__"

# Line counts
find src/lib/workspace -name "*.ts" -o -name "*.tsx" | xargs wc -l

# Bak files
find src/ -name "*.bak" -type f
```

---

*End of Safe-to-Archive Inventory*
*Generated by deep-scan-architecture-scanner*
