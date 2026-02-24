# EPIC Lineage Analysis Report

**Task ID**: PH2-T2B
**Agent**: analyst-ext-team-b (Team B)
**Date**: 2026-01-27
**Version**: 1.0.0
**Status**: COMPLETE

---

## Executive Summary

This analysis traces the EPIC-0.xx series (Foundation, Refactoring, Remediation) to understand the architectural evolution and its impact on UX/UI implementation. The series represents a critical transition from workspace-centric to project-centric architecture, with 3 completed phases and 1 in-progress.

**Key Finding**: Phase 1A was claimed at 60% but retrospective reveals **~30% true completion** due to 19 coordination gaps between plugins.

---

## EPIC Lineage Summary

| EPIC | Phase | Status | Key Changes | Completion | Created |
|------|-------|--------|-------------|------------|---------|
| **EPIC-0** | Foundation Reset | DRAFT | Project-centric model, route consolidation, context race fix | ~85% | 2026-01-26 |
| **EPIC-0.5** | FileTree & Plugin Maturity | PARTIALLY_COMPLETE | EventBus, auto-save, sidebar UX, progressive loading | ~30% (19 gaps) | 2026-01-26 |
| **EPIC-0.6** | Plugin Coordination Layer | COMPLETE | PluginCoordinationContext, write-locks, WebContainer boot | 100% (12/12 stories) | 2026-01-27 |
| **EPIC-ARCH-01** | Legacy | ARCHIVED | Foundation cleanup (superseded by EPIC-CC-AR02AR03) | Superseded | 2026-01-20 |
| **EPIC-ARCH-02** | Legacy | ARCHIVED (70% true) | Feature plugin architecture | Remediated by EPIC-CC-AR02AR03 | 2026-01-21 |
| **EPIC-ARCH-03** | Legacy | ARCHIVED (45% true) | Layout system & UX | Remediated by EPIC-CC-AR02AR03 | 2026-01-21 |
| **EPIC-ARCH-04-CC** | Foundation | 95% COMPLETE | FSA handle lifecycle integration | CC-04 E2E pending | 2026-01-25 |

---

## EPIC-0: Project-Centric Foundation Reset

### What Was Done

1. **Route Structure Cleanup**
   - Consolidated 9 routes to 2: `/hub` and `/$projectId`
   - Deprecated workspace-specific routes (`/ide/$projectId`, `/notes/$projectId`)
   - Verified `routeTree.gen.ts` regenerated

2. **ProjectContext Race Condition Fix**
   - Added conditional rendering until context is ready
   - Loading/error states during initialization
   - `useProjectContextSafe()` hook for guaranteed non-null context

3. **Storage Pattern Normalization**
   - `gateway.list('.')` now normalizes to `gateway.list('**/*')`
   - Returns BOTH files AND directories
   - `FileEntry` interface with `kind: 'file' | 'directory'`

4. **Device Architecture Separation**
   - Desktop (FSA) vs Mobile (IndexedDB) completely separate flows
   - Platform determines available plugins

### Patterns Established

| Pattern | Description | Example File |
|---------|-------------|--------------|
| **Project-Centric Model** | All state organized around Project entities | `project-context.tsx` |
| **Platform Detection** | `detectPlatform()` for storage type auto-selection | `platform-detection.ts` |
| **Handle Persistence** | FSA handles persisted to IndexedDB | `handlePersistenceService` |
| **Gateway Pattern** | `StorageGateway` abstraction for FSA/IDB | `StorageGateway.ts` |

### Files Modified

| File | Path | Changes |
|------|------|---------|
| ProjectContextProvider | `src/infrastructure/context/project-context.tsx` | Conditional rendering, pattern normalization |
| Platform Detection | `src/infrastructure/filesystem/platform-detection.ts` | Device detection logic |
| Route Files | `src/routes/$projectId.tsx`, `src/routes/hub.tsx` | Unified routing |

---

## EPIC-0.5: FileTree & Plugin System Maturity

### What Was Done (Completed)

1. **Real Monaco Editor Integration (CC-AR-05)**
   - Replaced textarea POC with `@monaco-editor/react`
   - Syntax highlighting for 16+ file types
   - Cmd+S keyboard shortcut for save

2. **File Event Bus Infrastructure (EPIC-0.5-02)**
   - `file-event-bus.ts` created (550 lines)
   - Type-safe `FileEvent` interface with CRUD operations
   - Project-scoped event filtering

3. **PluginLayout God Component Resolved (CC-AR-08)**
   - Reduced from 1034 lines to 305 lines
   - Extracted: `LayoutRenderers.tsx`, `PluginPanel.tsx`, `MobilePluginNav.tsx`

4. **Store Hydration Race Condition Fixed (CC-AR-03)**
   - `_hasHydrated` flag in `PluginLayoutStore.ts`
   - Guards rendering until hydration complete

5. **i18n Keys Added (CC-AR-01)**
   - 30+ `plugin.*` keys added to `en.json` and `vi.json`

6. **Preview Plugin Created (CC-AR-06)**
   - WebContainer integration placeholder
   - Iframe display for preview URLs

### What Was NOT Completed (19 Coordination Gaps)

| Gap Category | Count | Description | Status |
|--------------|-------|-------------|--------|
| **Shared State** | 5 | No PluginCoordinationContext, no ActiveDocument | Transferred to EPIC-0.6 |
| **Plugin Lifecycle** | 4 | No process registry, no capability declarations | Transferred to EPIC-0.6 |
| **State Preservation** | 3 | No state preservation across toggle, no lazy boot | Transferred to EPIC-0.6 |
| **Event Contracts** | 5 | No event ordering/priority, no prerequisite resolution | PARTIAL (types exist) |
| **Platform Constraints** | 2 | No device-type enforcement per plugin | Transferred to EPIC-0.6 |

### Implementation Flaw Discovered

**Path Truncation Bug**: Dev team truncated file paths in `project-context.tsx`:
```typescript
// ❌ WRONG - Truncates paths
const immediatePath = parts[0];  // "src/index.ts" → "src"
const fullPath = immediatePath;  // Path lost!

// ✅ CORRECT - Preserve full paths
return files.map((file) => ({
  path: file,  // PRESERVE FULL PATH
  kind: detectKind(file),
}));
```

**Impact**: Expanding folders showed EMPTY content.

---

## EPIC-0.6: Plugin Coordination Layer

### What's Being Remediated

All 19 coordination gaps from EPIC-0.5 retrospective:

| Story | Title | Team | Status | Effort |
|-------|-------|------|--------|--------|
| **0.6-01** | PluginCoordinationContext Foundation | A | COMPLETE | 4-6h |
| **0.6-02** | File Open Tracking | A | COMPLETE | 2-3h |
| **0.6-03** | Write-Lock Mechanism | A | COMPLETE | 2-3h |
| **0.6-04** | PluginCapability Interface | A | COMPLETE | 3-4h |
| **0.6-05** | Boot WebContainer on Terminal | B | COMPLETE | 4-6h |
| **0.6-06** | Mount FSA to WebContainer | B | COMPLETE | 4-6h |
| **0.6-07** | Process Registry | B | COMPLETE | 2-3h |
| **0.6-08** | Dev-Server-Ready Events | B | COMPLETE | 2h |
| **0.6-09** | Preview <-> Terminal Wiring | B | COMPLETE | 2-3h |
| **0.6-10** | Device Fallback | A | COMPLETE | 2h |
| **0.6-11** | Replace Hardcoded noteId | A | COMPLETE | 1-2h |
| **0.6-12** | Monaco <-> Notes Mirroring | B | COMPLETE | 4-6h |

### Architecture Changes

1. **PluginCoordinationContext** - Shared state layer for all plugins
2. **SharedDocument** - Single source of truth for active file
3. **Write-Lock Mechanism** - Prevents concurrent edits
4. **PluginCapability Interface** - Plugins declare what they can do
5. **Process Registry** - Terminal tracks running processes
6. **Event Coordination** - Plugins emit typed events for coordination

### Key Files Created

| File | Path | Purpose |
|------|------|---------|
| PluginCoordinationContext | `src/infrastructure/context/plugin-coordination-context.tsx` | Shared state provider |
| PluginCoordinationStore | `src/infrastructure/persistence/stores/plugin-coordination-store.ts` | Zustand store for coordination |
| SharedDocument Types | `src/domain/types/plugin-coordination.types.ts` | TypeScript interfaces |

---

## Components Created/Modified

| Component | EPIC | Status | Notes |
|-----------|------|--------|-------|
| **ProjectContextProvider** | EPIC-0 | ACTIVE | Conditional rendering, pattern normalization |
| **PluginLayout** | EPIC-0.5 | REFACTORED | 1034 → 305 lines |
| **LayoutRenderers** | EPIC-0.5 | NEW | 442 lines extracted from PluginLayout |
| **PluginPanel** | EPIC-0.5 | NEW | 317 lines extracted from PluginLayout |
| **MobilePluginNav** | EPIC-0.5 | NEW | 209 lines extracted from PluginLayout |
| **MonacoPlugin** | EPIC-0.5 | UPGRADED | Real Monaco Editor |
| **PreviewPlugin** | EPIC-0.5 | NEW | WebContainer integration |
| **FileEventBus** | EPIC-0.5 | NEW | 550 lines, CRUD event infrastructure |
| **PluginCoordinationContext** | EPIC-0.6 | NEW | Shared state coordination |
| **PluginCoordinationStore** | EPIC-0.6 | NEW | Zustand store for active document |

---

## Deprecated Patterns (DO NOT USE)

| Pattern | Replaced By | EPIC | Reason |
|---------|-------------|------|--------|
| **Workspace-centric state** | Project-centric state | EPIC-0 | Architecture fundamental |
| **9 separate routes** | 2 routes (`/hub`, `/$projectId`) | EPIC-0 | Route consolidation |
| **Textarea Monaco stub** | Real `@monaco-editor/react` | EPIC-0.5 | Feature completion |
| **God component PluginLayout** | Split into 4 files | EPIC-0.5 | Maintainability |
| **Hardcoded noteId** | Route parameter noteId | EPIC-0.6 | Dynamic file loading |
| **Isolated plugin state** | PluginCoordinationContext | EPIC-0.6 | Cross-plugin coordination |
| **`window.location.href`** | TanStack Router `navigate()` | EPIC-0 | SPA routing |
| **`/ide/$projectId` route** | `/$projectId` unified route | EPIC-0 | Deprecated redirect |
| **`/notes/$projectId` route** | `/$projectId` unified route | EPIC-0 | Deprecated redirect |

---

## Current Patterns (MUST USE)

| Pattern | Description | Example File |
|---------|-------------|--------------|
| **Project-Centric Model** | All state organized around Project entities | `project-context.tsx` |
| **Platform Detection** | Auto-detect FSA vs IndexedDB storage | `platform-detection.ts` |
| **PluginCoordinationContext** | Shared state for cross-plugin coordination | `plugin-coordination-context.tsx` |
| **Unified Route** | Single `/$projectId` route for all plugins | `$projectId.tsx` |
| **EventBus for CRUD** | All file operations emit typed events | `file-event-bus.ts` |
| **Write-Lock Pattern** | Acquire lock before editing shared document | `plugin-coordination-store.ts` |
| **Zustand + useShallow** | Always use `useShallow` for store selectors | All store consumers |
| **Debounced Auto-Save** | 500ms debounce for auto-save | `MonacoPlugin.tsx`, `NotesPlugin.tsx` |

---

## ADR Summary

| ADR | Decision | Impact on UX | Status |
|-----|----------|--------------|--------|
| **ADR-034** | Project-Centric Architecture with Feature Plugins | Single unified route, plugin-based layout | APPROVED |
| **ADR-036** | Platform Contract Consolidation | ARCHIVED - Renamed to ADR-037 | ARCHIVED |
| **ADR-039** | Consolidated Project-Centric Architecture | FSA handle lifecycle, Zustand reactivity, EventBus contracts | APPROVED |

### ADR-039 Key Decisions (CRITICAL)

1. **Project-Centric Model**: All state around Project entities
2. **Storage Type Auto-Detection**: Platform determines storage automatically
3. **FSA Handle Lifecycle**: Persist to IndexedDB, restore on route mount
4. **Zustand Reactivity**: Individual selectors + useMemo for derived data
5. **Storage Gateway Pattern**: Normalize patterns, return files AND directories
6. **Plugin Panel Architecture**: Sidebar tabs vs main panels
7. **EventBus for File CRUD**: All operations emit typed events
8. **Auto-Save Contract**: 500ms debounce, visual indicator

### Anti-Patterns from ADR-039

```typescript
// ❌ NEVER - Creates new array on every render
const items = useStore(s => s.data.map(x => transform(x)));

// ✅ CORRECT - Stable references + memoization
const data = useStore(s => s.data);
const items = useMemo(() => data.map(x => transform(x)), [data]);
```

```typescript
// ❌ NEVER - Pass handle through router state (not serializable)
navigate(`/${projectId}`, { state: { handle } });

// ✅ CORRECT - Persist to IndexedDB, restore on mount
await handlePersistenceService.persist(projectId, handle);
const handle = await handlePersistenceService.restore(projectId);
```

---

## Recommendations

### For UX Implementation Team

1. **Use PluginCoordinationContext** for cross-plugin state
   - Import `usePluginCoordination()` hook
   - Access `activeDocument`, `openDocument()`, `closeDocument()`

2. **Subscribe to EventBus** for file changes
   - `FILE_CREATED`, `FILE_UPDATED`, `FILE_DELETED`, `FILE_MOVED`
   - Use `useFileEventBus()` hook

3. **Respect Write-Lock** before editing
   - `acquireWriteLock(path, pluginId)` before write
   - `releaseWriteLock(path, pluginId)` after save

4. **Always use unified route** - `/$projectId`
   - No `/ide/$projectId` or `/notes/$projectId`
   - Layout determined by platform + user preferences

5. **Use i18n keys** - No hardcoded strings
   - All plugin UI text via `useTranslation()` hook
   - Keys in `plugin.*` namespace

### Blocking Issues Resolved

| Issue | EPIC | Resolution |
|-------|------|------------|
| Plugins isolated | EPIC-0.6 | PluginCoordinationContext |
| FileTree empty on expand | EPIC-0.5 | Path truncation fixed |
| Monaco POC stub | EPIC-0.5 | Real Monaco Editor |
| God component PluginLayout | EPIC-0.5 | Split into 4 files |
| No shared active document | EPIC-0.6 | SharedDocument state |
| Terminal POC only | EPIC-0.6 | WebContainer integration |
| Preview no URL source | EPIC-0.6 | Terminal URL events |

### Outstanding Work

| Item | EPIC | Priority | Notes |
|------|------|----------|-------|
| E2E Validation | EPIC-ARCH-04-CC (CC-04) | P0 | FSA handle lifecycle validation |
| Mobile Responsive | EPIC-CC-AR02AR03 | P2 | UX-10 deferred |
| i18n missing keys | EPIC-CC-AR02AR03 | P0 | CC-AR-01 ready |
| Platform defaults wiring | EPIC-CC-AR02AR03 | P0 | CC-AR-02 ready |

---

## EPIC Dependency Graph

```
EPIC-0: Foundation Reset
    ↓
EPIC-0.5: Plugin System Maturity (PARTIAL)
    ↓
EPIC-0.6: Plugin Coordination Layer (COMPLETE)
    ↓
EPIC-CC-AR02AR03: Phase 1A Plugin System (37.5%)
    ↓
EPIC-PH1B-BYOK-NOTES: Phase 1B (BLOCKED)
    ↓
EPIC-PH2-CHAT-AGENTS: Phase 2 (BLOCKED)
    ↓
EPIC-PH3-ADVANCED-PATTERNS: Phase 3 (BLOCKED)
```

---

## References

| Document | Path |
|----------|------|
| **EPIC-0** | `_bmad-output/planning-artifacts/epics/EPIC-0-PROJECT-CENTRIC-RESET-2026-01-26.md` |
| **EPIC-0.5** | `_bmad-output/planning-artifacts/epics/EPIC-0.5-FILETREE-PLUGIN-MATURITY-2026-01-26.md` |
| **EPIC-0.5 Retrospective** | `_bmad-output/retrospectives/EPIC-0.5-RETROSPECTIVE-2026-01-27.md` |
| **EPIC-0.6** | `_bmad-output/planning-artifacts/epics/EPIC-0.6-PLUGIN-COORDINATION-LAYER-2026-01-27.md` |
| **ADR-034** | `_bmad-output/planning-artifacts/adr/ADR-034-project-centric-architecture-2026-01-20.md` |
| **ADR-039** | `_bmad-output/planning-artifacts/adr/ADR-039-consolidated-project-centric-architecture-2026-01-26.md` |
| **epics.md** | `_bmad-output/planning-artifacts/epics.md` |
| **architecture.md** | `_bmad-output/planning-artifacts/architecture.md` |

---

**Document Version**: 1.0.0
**Created**: 2026-01-27
**Author**: analyst-ext-team-b
**Status**: COMPLETE
