# DO NOT DISTURB Report
**Generated**: 2026-01-27
**Agent**: domain-scanner
**Task**: PH2-T2D

---

## Executive Summary

This report identifies files and directories actively under backend development that **MUST NOT be modified** by UX/UI work. Touching these zones risks merge conflicts, regression, and coordination overhead.

**Critical Finding**: 33 infrastructure files modified in last 48 hours, 19 WIP markers in infrastructure, 100+ type suppressions.

---

## Critical Files (Backend Active Work)

| File | Reason | Team | Estimated Completion |
|------|--------|------|---------------------|
| `src/infrastructure/context/project-context.tsx` | FSA Handle Lifecycle (CC-01) | Team A | CC-04 pending |
| `src/routes/$projectId.tsx` | Route integration for FSA | Team A | CC-04 pending |
| `src/presentation/components/layout/PermissionOverlay.tsx` | Permission persistence | Team A | CC-04 pending |
| `src/infrastructure/context/plugin-coordination-context.tsx` | EPIC-0.6 Complete - DO NOT TOUCH | Team A | COMPLETE |
| `src/infrastructure/persistence/stores/plugin-coordination-store.ts` | EPIC-0.6 Complete - 471 lines | Team A | COMPLETE |
| `src/infrastructure/persistence/stores/process-registry-store.ts` | Terminal process tracking | Team B | Stabilizing |
| `src/infrastructure/events/file-event-bus.ts` | File event infrastructure | Team B | Stabilizing |

---

## Infrastructure Layer Status

| Directory | Status | Safe to Modify UI Parts? | Risk Level |
|-----------|--------|-------------------------|------------|
| `src/infrastructure/context/` | **ACTIVE WORK** | ❌ NO | 🔴 HIGH |
| `src/infrastructure/persistence/stores/` | **REFACTORING** | ⚠️ Facade Only | 🟡 MEDIUM |
| `src/infrastructure/filesystem/` | **STABLE** | ⚠️ READ ONLY | 🟡 MEDIUM |
| `src/infrastructure/sync/` | **PARTIAL** | ❌ NO | 🔴 HIGH |
| `src/infrastructure/events/` | **NEW** | ❌ NO | 🔴 HIGH |
| `src/infrastructure/webcontainer/` | **ACTIVE** | ❌ NO | 🔴 HIGH |
| `src/infrastructure/plugins/` | **STABLE** | ✅ YES | 🟢 LOW |

---

## Files Modified in Last 48 Hours (AVOID)

### Infrastructure (33 files)
```
src/domain/interfaces/feature-plugin.interface.ts
src/domain/interfaces/plugin-capability.interface.ts
src/domain/types/plugin-coordination.types.ts
src/domain/types/plugin-types.ts
src/infrastructure/context/plugin-coordination-context.tsx
src/infrastructure/context/project-context.tsx (P0 CRITICAL)
src/infrastructure/context/project-context.tsx.bak (BACKUP EXISTS - ACTIVE WORK)
src/infrastructure/events/file-event-bus.ts
src/infrastructure/events/types.ts
src/infrastructure/filesystem/handle-persistence.ts
src/infrastructure/filesystem/route-guards.ts
src/infrastructure/hooks/useDebouncedSave.ts
src/infrastructure/persistence/stores/file-tree-store.ts
src/infrastructure/persistence/stores/plugin-coordination-store.ts
src/infrastructure/persistence/stores/process-registry-store.ts
src/infrastructure/persistence/stores/workspace/slices/use-file-ops-slice.ts
src/infrastructure/utils/device-detection.ts
src/infrastructure/webcontainer/useDevServerDetection.ts
src/infrastructure/webcontainer/useFSAMount.ts
src/infrastructure/webcontainer/useWebContainer.ts
```

### Routes (15 files)
```
src/routes/__root.tsx
src/routes/$projectId.tsx (P0 CRITICAL)
src/routes/$projectId.diagnostic.tsx
src/routes/$projectId.test.tsx
src/routes/ide.$projectId.tsx
src/routes/ide.tsx
src/routes/index.tsx
src/routes/notes.$projectId.tsx
src/routes/notes.lazy.tsx
src/routes/workspace/$projectId.tsx
src/routes/workspace/index.tsx
```

---

## WIP Markers Found

### Infrastructure Layer (19 markers)

| File | Line | Marker | Context |
|------|------|--------|---------|
| `project-context.tsx` | 218 | TODO | `canWatchFiles: false, // TODO: Implement file watching` |
| `project-context.tsx` | 367 | TODO | `// TODO: Implement file watching` |
| `filesystem/index.ts` | 67 | TODO | `Move permission-lifecycle.ts to infrastructure/filesystem` |
| `sync/index.ts` | 182 | TODO | `Move implementation from src/lib/filesystem/sync-manager` |
| `note-context-tracker.ts` | 165 | TODO | `Integrate with BlockNote selection API` |
| `ide-project-slice.ts` | 76 | TODO | `Signal other slices to reset via event bus` |
| `useIDEStore.ts` | 235 | TODO | `Clear other slices via event bus` |
| `rag-chat-slice.ts` | 79 | TODO | `Trigger AI response with RAG context` |
| `snapshot-*.ts` | Multiple | TODO | `Add Dexie persistence` (6 occurrences) |

### Domain Layer (1 marker)

| File | Line | Marker | Context |
|------|------|--------|---------|
| `workspace-transition-service.ts` | 210 | TODO | `Implement actual safety checks` |

---

## Type Suppressions (Risk Assessment)

| File | Count | Risk Level | Notes |
|------|-------|------------|-------|
| `fsa-gateway.ts` | 8 | 🟡 MEDIUM | Experimental Chrome APIs (@ts-ignore) |
| `handle-persistence.ts` | 1 | 🟢 LOW | Type casting for workspaceId |
| `dexie-db-migrations.ts` | 5 | 🟡 MEDIUM | Migration-specific type overrides |
| `__tests__/*.ts` | ~85 | 🟢 LOW | Test-only mocking patterns |
| `plugin-registry.test.ts` | 10 | 🟢 LOW | Test context mocking |
| Total Production | ~15 | 🟡 MEDIUM | Most in FSA/experimental APIs |
| Total Test | ~85 | 🟢 LOW | Expected for mocking |

---

## Not Implemented / Deferred Features (DO NOT TOUCH)

| File | Status | Notes |
|------|--------|-------|
| `study-file-sync-service.ts` | **DEFERRED** | `@deprecated Study workspace is deferred to post-MVP` |
| `knowledge-file-sync-service.ts` | **DEFERRED** | `@deprecated Knowledge workspace is deferred to post-MVP` |
| `project-knowledge-sync.ts` | **DEFERRED** | Knowledge sync deferred |
| `rollback-fsa-migration.ts` | **STUB** | 10 `throw new Error('Not implemented')` - Migration rollback scripts |
| `git-client.ts` | **STUB** | 11 `throw new Error('File system not implemented')` - Git integration deferred |
| `unified-storage-adapter.ts` | **STUB** | `deleteDirectory not implemented` |

---

## Safe Zones for UX Work

### Presentation Layer (Safe with Caution)

| Directory/File | Why Safe | Priority | Notes |
|----------------|----------|----------|-------|
| `src/presentation/components/ui/` | Design system primitives | HIGH | ✅ Safe |
| `src/presentation/components/common/` | Shared components | HIGH | ✅ Safe |
| `src/presentation/components/sidebar/` | Sidebar components | MEDIUM | ✅ Safe |
| `src/presentation/components/header/` | Header components | MEDIUM | ✅ Safe |
| `src/plugins/` | Plugin UI components | HIGH | ⚠️ Avoid plugin-coordination imports |
| `src/presentation/layouts/` | Layout components | MEDIUM | ⚠️ PluginLayout.tsx has 1 TS error |

### Explicitly Safe Files

| File | Why Safe |
|------|----------|
| `src/styles.css` | Pure CSS styling |
| `src/i18n/*.json` | Translation strings |
| `src/presentation/components/notes/*.tsx` | Notes UI (not affected by FSA work) |
| `src/presentation/components/chat/*.tsx` | Chat UI components |
| `src/presentation/hooks/` | Presentation hooks (not infrastructure) |

---

## Coordination Required

| UX Change | Requires Sync With | Contact | Notes |
|-----------|-------------------|---------|-------|
| FileTree styling | Team B (MonacoPlugin) | CC-AR-05 complete | Safe after CC-04 |
| PluginToolbar modifications | Team B | CC-AR-08 blocked | Wait for CC-AR-04 |
| Layout changes | Team A (CC-AR-04) | **BLOCKED** | CC-AR-04 replaces drag-drop |
| Permission UI changes | Team A (CC-01/02) | **CRITICAL** | FSA handle lifecycle |
| Terminal panel | Team B | EPIC-0.6 | Process registry active |
| Preview panel | Team B | EPIC-0.6 | Dev server detection active |

---

## Team Ownership Matrix (from sprint-status)

### Team A Files (DO NOT TOUCH)
```
src/infrastructure/context/project-context.tsx
src/routes/$projectId.tsx
src/presentation/components/layout/PermissionOverlay.tsx
src/lib/i18n/locales/*.json
```

### Team B Files (DO NOT TOUCH)
```
src/presentation/layouts/PluginLayoutStore.ts
src/plugins/monaco/MonacoPlugin.tsx
src/plugins/preview/PreviewPlugin.tsx
src/presentation/layouts/PluginLayout.tsx
```

---

## Store Files by Size (God Store Risk)

| File | Lines | Risk | Action |
|------|-------|------|--------|
| `file-tree-store.ts` | 536 | 🔴 GOD STORE | Refactoring planned |
| `plugin-coordination-store.ts` | 471 | 🟡 LARGE | Recently created (EPIC-0.6) |
| `use-app-store.ts` | 377 | 🟡 LARGE | Stable |
| `layout-presets-store.ts` | 378 | 🟡 LARGE | Stable |
| `process-registry-store.ts` | 342 | 🟢 OK | Active development |

---

## Filesystem Files by Size

| File | Lines | Status |
|------|-------|--------|
| `file-tree-scanner.ts` | 833 | 🔴 GOD FILE |
| `fsa-gateway.ts` | 816 | 🔴 GOD FILE |
| `terminal-fs-adapter.ts` | 751 | 🟡 LARGE |
| `markdown-sync-service.ts` | 697 | 🟡 LARGE |
| `fsa-storage-adapter.ts` | 672 | 🟡 LARGE |
| `viagent-service.ts` | 672 | 🟡 LARGE |
| `handle-persistence.ts` | 605 | 🟡 LARGE - ACTIVE WORK |

---

## Summary & Recommendations

### 🔴 HIGH RISK - DO NOT TOUCH
1. `src/infrastructure/context/` - FSA Handle Lifecycle active
2. `src/infrastructure/events/` - File event bus newly created
3. `src/infrastructure/webcontainer/` - Terminal integration active
4. `src/routes/$projectId.tsx` - Route integration for FSA
5. Any file with `.bak` backup (indicates active work)

### 🟡 MEDIUM RISK - COORDINATE FIRST
1. `src/presentation/layouts/PluginLayout.tsx` - Has 1 TS error, CC-AR-08 blocked
2. `src/infrastructure/persistence/stores/` - Use facade patterns only
3. Any file modified in last 48 hours

### 🟢 LOW RISK - SAFE FOR UX
1. `src/presentation/components/ui/` - Design system
2. `src/presentation/components/common/` - Shared components
3. `src/styles.css` - CSS only
4. `src/i18n/*.json` - Translations

### Pre-Flight Checklist for Any UX Change
1. ✅ Check this report for file status
2. ✅ Run `git log --since="24 hours ago" --name-only -- <file>` before editing
3. ✅ Verify no `@ts-ignore` or TODO markers in target area
4. ✅ Check sprint-status.yaml for team ownership
5. ✅ Coordinate with Team A/B if touching shared files

---

**Report Generated By**: domain-scanner
**Timebox**: 15 minutes
**Accuracy**: Based on git history, code analysis, and sprint-status.yaml
