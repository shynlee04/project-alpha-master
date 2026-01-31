# Codebase Concerns

**Analysis Date:** 2026-01-31

---

## CRITICAL: Import Path Violations (654 violations)

**`@/lib/` Forbidden Imports:**
- Issue: 674 imports from `@/lib/*` instead of canonical `@/infrastructure/*` or `@/domain/*`
- Files: Spread across entire codebase, concentrated in:
  - `src/hooks/*.ts` (45+ files using @/lib/*)
  - `src/components/rag/*.tsx`
  - `src/lib/context/*.ts` (self-referencing lib)
  - `src/plugins/*.tsx`
- Impact: Architecture boundaries broken, clean architecture violated
- Fix approach: 
  1. Mass rename `@/lib/` to appropriate layer (`@/infrastructure/` or `@/domain/`)
  2. Update tsconfig paths
  3. Run `pnpm governance:imports` until 0 violations

**Sample violations:**
```typescript
// From src/hooks/useGit.ts
import { ... } from '@/lib/git/git-client';  // Should be @/infrastructure/git/

// From src/hooks/usePlugins.ts  
import { PluginManager } from '@/lib/plugins/plugin-manager';  // Should be @/infrastructure/plugins/
```

---

## CRITICAL: God Files (30 files >300 lines)

**Files exceeding 300 LOC limit (must split):**

| File | Lines | Type | Severity |
|------|-------|------|----------|
| `src/infrastructure/persistence/dexie-db-migrations.ts` | 1746 | DB Migrations | HIGH |
| `src/presentation/components/notes/AISlashCommand.tsx` | 1674 | Component | HIGH |
| `src/presentation/components/notes/NoteEditor.tsx` | 1353 | Component | HIGH |
| `src/lib/templates/template-registry.ts` | 1321 | Service | HIGH |
| `src/infrastructure/persistence/dexie-db.ts` | 1213 | Database | HIGH |
| `src/infrastructure/events/event-bus.ts` | 888 | Event System | MEDIUM |
| `src/infrastructure/filesystem/file-tree-scanner.ts` | 833 | Service | MEDIUM |
| `src/infrastructure/filesystem/fsa-gateway.ts` | 816 | Gateway | MEDIUM |
| `src/lib/git/git-client.ts` | 791 | Client | MEDIUM |
| `src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx` | 773 | Component | MEDIUM |
| `src/presentation/components/ui/resizable.tsx` | 763 | Component | MEDIUM |
| `src/infrastructure/filesystem/terminal-fs-adapter.ts` | 751 | Adapter | MEDIUM |
| `src/domain/services/universal-provider-registry.ts` | 724 | Service | MEDIUM |
| `src/infrastructure/filesystem/markdown-sync-service.ts` | 697 | Service | MEDIUM |
| `src/presentation/layouts/PluginLayoutStore.ts` | 692 | Store | HIGH |

**God Stores (>300 LOC) requiring immediate split:**
- `src/presentation/layouts/PluginLayoutStore.ts` (692 lines)
- `src/lib/notes/slash-command-store.ts` (541 lines)
- `src/infrastructure/persistence/stores/file-tree-store.ts` (536 lines)
- `src/lib/notes/saved-blocks-store.ts` (514 lines)
- `src/infrastructure/persistence/stores/plugin-coordination-store.ts` (471 lines)

---

## CRITICAL: Data Layer Chaos

**Dual Storage System Confusion:**
- Problem: Two parallel persistence systems (IndexedDB/Dexie vs FSA/File System)
- Files:
  - `src/infrastructure/persistence/dexie-db.ts` - IndexedDB via Dexie
  - `src/infrastructure/filesystem/fsa-storage-adapter.ts` - File System Access API
  - `src/infrastructure/filesystem/fsa-gateway.ts` - FSA abstraction
- Impact: Unclear which system to use, data sync issues, race conditions
- Evidence: 2748 filesystem abstraction references across codebase
- Fix approach: 
  1. Define clear StorageStrategy interface
  2. Route by platform capability (Desktop=FSA, Mobile=IndexedDB)
  3. Consolidate sync logic in single service

**Project/Note Storage Routing Issues:**
- `src/lib/notes/slices/note-crud-slice.ts:64-87` - BUG-013 fallback logic
- Decision path unclear: FSA -> IndexedDB fallback -> ???
- Multiple BUG-FIX markers around storage routing

---

## CRITICAL: State Management Fragmentation

**Store Distribution Chaos:**
- 40+ Zustand stores spread across:
  - `src/infrastructure/persistence/stores/` (canonical location)
  - `src/lib/notes/` (11 stores - wrong layer!)
  - `src/lib/workspace/` (3 stores - wrong layer!)
  - `src/lib/snippets/` (1 store - wrong layer!)
  - `src/presentation/layouts/` (1 store)
- Impact: No single source of truth, 2660 store references, inconsistent patterns

**Store Slices Locations (fragmented):**
```
src/lib/notes/slices/
src/infrastructure/persistence/stores/study/slices/
src/infrastructure/persistence/stores/chat/slices/
src/infrastructure/persistence/stores/workspace/slices/
src/infrastructure/persistence/stores/flashcard/slices/
src/infrastructure/persistence/stores/agents/slices/
src/infrastructure/persistence/stores/permissions/slices/
src/infrastructure/persistence/stores/canvas/slices/
src/infrastructure/persistence/stores/activity-bar/slices/
```

**State Confusion Points:**
- Zustand stores vs localStorage persistence vs Dexie persistence
- Query hotload patterns (no TanStack Query - only 1 file)
- Reactive store subscriptions with 2660 useStore references

---

## CRITICAL: Race Conditions & Concurrency

**Write Lock System:**
- Files: `src/plugins/monaco/MonacoMain.tsx`, `src/plugins/notes/NotesPlugin.tsx`
- Pattern: Debounced saves with write-lock acquisition (EPIC-0.6-03)
- Risk: Lock contention between Monaco and Notes plugins editing same file
- Evidence: `BUG-1 FIX: Debounced save handler for external files with write-lock`

**Plugin Loading Race:**
- `src/infrastructure/persistence/stores/plugin-coordination-store.ts`
- MAX_OPEN_DOCUMENTS limit enforcement may cause data loss
- Plugins loaded together under one project without regulated contracts

**Event Propagation Conflicts:**
- `src/infrastructure/events/event-bus.ts` (888 lines)
- `src/infrastructure/events/file-event-bus.ts`
- `src/lib/events/cross-workspace-event-bus.ts` (583 lines)
- Multiple event buses with overlapping responsibilities

---

## CRITICAL: Type Pollution

**Overlapping Type Definitions:**
- `src/domain/types/project-ids.ts` - ProjectId, LegacyProjectId, AnyProjectId, BrandedProjectId
- `src/domain/types/viagent-metadata.ts` - ViagentProjectMetadata
- `src/lib/workspace/project-types.ts` - Project type (DEPRECATED fields)

**Type Workarounds (60+ instances):**
```bash
# as any/as unknown patterns
src/routeTree.gen.ts (15+ instances - generated file)
src/__tests__/chat.test.ts (25+ instances)
src/hooks/useCanvasDrop.ts
```

**Synonymous Naming:**
- `StorageType` vs `storageType` field patterns
- `WorkspaceType` in project-ids.ts
- Overlapping interface names across modules

---

## HIGH: TODO/FIXME Markers (100+ occurrences)

**Distribution by category:**

**Deferred Features (ADR-033):**
- `ARCH-01-03 - Knowledge and Study workspaces DEFERRED` - 7 locations
- Terminal blocked on mobile - 3 locations

**Pending Implementations:**
- `src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx:384` - References panel TODO
- `src/infrastructure/context/project-context.tsx:218,367` - File watching TODO
- `src/lib/terminal/terminal-emulator.ts:413` - Line replacement TODO

**Bug Fix Markers (35+ markers):**
- BUG-001 through BUG-017 scattered across codebase
- BUG-FIX-008, BUG-FIX-010 patterns
- Indicates fragile areas requiring careful changes

---

## HIGH: Routing Complexity

**Route File Sizes:**
- `src/routes/$__debug__.provider-playground.tsx` (855 lines) - DEBUG route too large
- `src/routes/settings.tsx` (534 lines) - Over limit
- `src/routes/$projectId.tsx` (265 lines) - Approaching limit

**Nested Layout Issues:**
- `overflow-hidden` patterns (30+ occurrences) causing UI clipping
- `src/presentation/components/layout/ProjectAwareLayout.tsx:70-76` - Deep nesting

---

## HIGH: Test Coverage Gaps

**Current Coverage:**
- Test files: 125
- Total source files: 1413
- Coverage ratio: ~8.8% (critically low)

**Untested Critical Paths:**
- `src/infrastructure/persistence/dexie-db.ts` - Database core
- `src/infrastructure/filesystem/fsa-gateway.ts` - FSA abstraction
- `src/domain/services/universal-provider-registry.ts` - Provider system
- Most god files have 0 test coverage

**Testing Pattern Issues:**
- Only 1 file uses React Query patterns
- Heavy reliance on manual mocking
- No E2E coverage visible in src/

---

## MEDIUM: Deprecated Code

**Deprecated but still used:**
- `src/lib/snippets/snippet-store.ts:7` - `@deprecated` marker
- `src/lib/study/` - 6 files marked deprecated (deferred to post-MVP)
- `src/lib/workspace/temp-project.ts` - Multiple deprecated functions
- `src/lib/workspace/threads-store.ts:6` - `@deprecated PERSISTENCE UTILITY`
- `src/lib/workspace/file-sync-status-store/file-sync-status-store-refactored.ts:147,161`

**Files to remove:**
- `src/lib/study/quiz-*.ts` - All deprecated per ADR-033

---

## MEDIUM: Console Statement Proliferation

**Count:** 1811 console.log/warn/error statements
- Excessive logging in production code
- No structured logging system
- Debug statements mixed with error handling

---

## MEDIUM: Fragile Sync Services

**Sync Implementation Spread:**
```
src/lib/workspace/file-sync-status-store/
src/lib/filesystem/sync-manager/
src/lib/filesystem/sync-transaction/
src/lib/filesystem/sync-*.ts (6 files)
src/infrastructure/sync/
```

**Overlapping Responsibilities:**
- `src/lib/filesystem/sync-manager.ts`
- `src/lib/filesystem/sync-manager/sync-manager.ts`
- `src/infrastructure/filesystem/markdown-sync-service.ts`

---

## MEDIUM: Security Considerations

**Environment Variable Handling:**
- `import.meta.env.DEV` checks throughout (appropriate)
- `.env.local`, `.env.*.local` properly excluded from sync
- No sensitive data exposure detected

**Potential Risks:**
- `src/lib/utils/security.ts:355` - Path redaction logic
- No visible input sanitization patterns for user content in notes

---

## LOW: Performance Bottlenecks

**Large File Operations:**
- `src/infrastructure/filesystem/file-tree-scanner.ts` (833 lines)
- Full tree scans on project load
- No visible incremental scan optimization

**Memory Concerns:**
- 40+ Zustand stores in memory
- `MAX_OPEN_DOCUMENTS` limit of 50 (from plugin-coordination)
- No visible cleanup/garbage collection patterns

---

## Remediation Priority

| Priority | Category | Target | Current | Impact |
|----------|----------|--------|---------|--------|
| P0 | @/lib/ imports | 0 | 674 | Architecture integrity |
| P0 | God files | <10 | 30 | Maintainability |
| P1 | Store consolidation | 1 location | 4+ locations | State clarity |
| P1 | Test coverage | >80% | ~9% | Quality assurance |
| P2 | Deprecated removal | 0 | 15+ files | Code hygiene |
| P2 | Console cleanup | <100 | 1811 | Production readiness |
| P3 | Sync consolidation | 1 service | 6+ files | Reliability |

---

**Health Score:** 29.5% (target: >85%)

*Concerns audit: 2026-01-31*
