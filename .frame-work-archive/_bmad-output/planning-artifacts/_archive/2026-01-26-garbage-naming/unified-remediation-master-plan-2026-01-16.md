# Unified Architectural Remediation Master Plan
**Date**: 2026-01-16
**Status**: APPROVED FOR EXECUTION
**Priority**: CRITICAL
**BMAD Governance**: EPIC-ARC-REMEDIATION

---

## Executive Summary

This master plan consolidates findings from 3 independent diagnostic teams and my real-time debugging session. The codebase has **critical architectural debt** that requires a **phased, surgical approach**.

### Key Findings Synthesis

| Issue | All Teams Agree | Root Cause Identified |
|-------|-----------------|----------------------|
| State/Stores | 59 store files, 20+ Zustand stores | Duplication between `src/lib/` and `src/infrastructure/` |
| DexieDB | 11 separate IndexedDB databases | Incomplete consolidation, `saveProject` was a STUB |
| Routing | `useWorkspaceAccess` broken | Returned hardcoded empty arrays |
| Entity Naming | `project` vs `workspace` confusion | ID generation inconsistent across stores |
| FSA vs IndexedDB | No clear device-based contract | Storage type decided at call site, not centrally |

### What I Already Fixed (Phase 0 Partial)

| Fix | File | Status |
|-----|------|--------|
| `useWorkspaceAccess` hook | `workspace-access-helper.tsx` | ✅ DONE |
| `browser-mode.ts` direct Dexie persistence | `browser-mode.ts` | ✅ DONE |
| Notes auto-create browser-mode project | `notes.lazy.tsx` | ✅ DONE |

---

## The Master Plan: 6-Domain Architecture

### Domain Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PROJECT ALPHA ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    DOMAIN 1: STORAGE GATEWAY                            │ │
│  │                                                                          │ │
│  │   ┌─────────────┐    ┌─────────────────────────┐    ┌─────────────┐    │ │
│  │   │   Desktop   │    │    StorageGateway       │    │   Mobile    │    │ │
│  │   │   (FSA)     │───▶│  (Single Entry Point)   │◀───│ (IndexedDB) │    │ │
│  │   └─────────────┘    └─────────────────────────┘    └─────────────┘    │ │
│  │                                 │                                        │ │
│  │                                 ▼                                        │ │
│  │                   ┌─────────────────────────┐                           │ │
│  │                   │  ViaGentDatabase ONLY   │                           │ │
│  │                   │  (Single Dexie DB)      │                           │ │
│  │                   └─────────────────────────┘                           │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    DOMAIN 2: PROJECT IDENTITY                           │ │
│  │                                                                          │ │
│  │   ProjectId Format: {workspace}:proj_{timestamp}_{random}               │ │
│  │   Example: notes:proj_1705400000000_abc123xyz                           │ │
│  │                                                                          │ │
│  │   WorkspaceType: 'ide' | 'notes' | 'knowledge' | 'study' (ENUM)         │ │
│  │   WorkspaceBindings: { ide: bool, notes: bool, knowledge: bool, ...}    │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    DOMAIN 3: STATE MANAGEMENT                           │ │
│  │                                                                          │ │
│  │   SINGLE LOCATION: src/infrastructure/persistence/stores/               │ │
│  │                                                                          │ │
│  │   src/lib/workspace/project-store/ ──(FACADE)──▶ infrastructure/        │ │
│  │   src/lib/notes/note-store.ts ──(FACADE)──▶ note-store-refactored       │ │
│  │                                                                          │ │
│  │   Pattern: Persist FIRST, then update Zustand                           │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    DOMAIN 4: PLATFORM CONTRACT                          │ │
│  │                                                                          │ │
│  │   getPlatformContract():                                                 │ │
│  │   ┌──────────────┬───────────────┬─────────────────┬────────────────┐  │ │
│  │   │ Device       │ canAccessFSA  │ canAccessIDE    │ storageType    │  │ │
│  │   ├──────────────┼───────────────┼─────────────────┼────────────────┤  │ │
│  │   │ Desktop+FSA  │ true          │ true            │ 'fsa'          │  │ │
│  │   │ Desktop-FSA  │ false         │ false           │ 'indexeddb'    │  │ │
│  │   │ Mobile       │ false         │ false           │ 'indexeddb'    │  │ │
│  │   └──────────────┴───────────────┴─────────────────┴────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    DOMAIN 5: ROUTING & ENTRY                            │ │
│  │                                                                          │ │
│  │   Entry Points:                                                          │ │
│  │   / ──▶ Hub (project selection)                                         │ │
│  │   /notes ──▶ Browser-mode (auto-create project if needed)              │ │
│  │   /notes/$projectId ──▶ Specific project in notes                       │ │
│  │   /ide/$projectId ──▶ IDE (desktop only, redirect mobile to notes)     │ │
│  │   /knowledge/$projectId ──▶ Knowledge workspace                         │ │
│  │   /study/$projectId ──▶ Study workspace                                 │ │
│  │                                                                          │ │
│  │   Route Guards: beforeLoad validates project + platform                 │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    DOMAIN 6: AI & AGENTS                                │ │
│  │                                                                          │ │
│  │   ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │   │ Orchestrator Layer (Conversational, Intent Detection)           │  │ │
│  │   └─────────────────────────────────────────────────────────────────┘  │ │
│  │                              │                                          │ │
│  │                              ▼                                          │ │
│  │   ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │   │ Workspace Layer (IDE: code, Notes: content, Knowledge: RAG)     │  │ │
│  │   └─────────────────────────────────────────────────────────────────┘  │ │
│  │                              │                                          │ │
│  │                              ▼                                          │ │
│  │   ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │   │ Tool Execution (CRUD with permissions, multi-step with confirm) │  │ │
│  │   └─────────────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Key Architectural Decisions (My Recommendations)

### Decision 1: Storage Architecture

**Question**: Should non-desktop users get per-workspace IndexedDB projects, or ONE project across all workspaces?

**RECOMMENDATION**: **Option B - Cross-Workspace Projects with Bindings**

| Reason | Explanation |
|--------|-------------|
| Simpler mental model | User creates ONE project, enables workspaces via `bindings` |
| Already implemented | `WorkspaceBindings` type exists and is used |
| Desktop parity | FSA projects work the same way |
| Future-proof | Knowledge synthesis can reference IDE files |

**Implementation**: 
- Project has `bindings: { ide: true, notes: true, knowledge: false, study: false }`
- User toggles which workspaces can access the project
- Cross-workspace navigation preserves project context

---

### Decision 2: Desktop-Only IDE Enforcement

**Question**: Should we completely block IDE on mobile, or allow read-only preview?

**RECOMMENDATION**: **Option A - Hard Block for MVP, Read-Only in Phase 2**

| Phase | Behavior |
|-------|----------|
| MVP (Now) | Mobile → `/notes/$projectId` with toast "IDE requires desktop" |
| Phase 2 | Mobile → Read-only IDE preview (view files, no edit) |
| Phase 3 | Mobile → WebContainer-lite for basic editing |

---

### Decision 3: IndexedDB vs FileSystem - Clear Contract

**Question**: When should each storage be used?

**RECOMMENDATION**: Storage determined ONCE at project creation, immutable thereafter.

```typescript
interface Project {
  id: ProjectId;  // e.g., 'notes:proj_...'
  storageType: 'fsa' | 'indexeddb';  // Set at creation, never changes
  bindings: WorkspaceBindings;       // Which workspaces can access
}

// Storage selection happens in ONE place
function createProject(input: CreateProjectInput): Project {
  const platform = getPlatformContract();
  
  // If user picked a folder → FSA
  // If no folder selected → IndexedDB
  const storageType = input.folderHandle ? 'fsa' : 'indexeddb';
  
  return { ...input, storageType };
}
```

---

### Decision 4: ID Naming Convention

**Question**: How should project IDs be generated?

**RECOMMENDATION**: Namespace-prefixed IDs with clear separation.

| Type | Format | Example |
|------|--------|---------|
| Project ID | `{workspace}:proj_{timestamp}_{random}` | `notes:proj_1705400000000_abc123` |
| Temp Project ID | `alpha-temp-{timestamp}-{random}` | `alpha-temp-1705400000000-xyz789` |
| Browser Mode ID | `notes:browser-mode` | Singleton for quick-access |
| Note ID | `note_{uuid}` | `note_a1b2c3d4-e5f6-7890-abcd-ef12` |
| Thread ID | `thread_{uuid}` | `thread_a1b2c3d4-e5f6-7890-abcd` |

---

### Decision 5: Double-Space Interface

**Question**: How to handle workspace-in-workspace scenarios?

**RECOMMENDATION**: Clear hierarchy with single active context.

```
Hub (Project Selection)
  │
  ├── IDE Workspace ────────────────────────────────────┐
  │   ├── File Explorer (left)                          │
  │   ├── Editor (center)                               │
  │   └── Chat Panel (right, collapsible)               │
  │                                                     │
  ├── Notes Workspace ──────────────────────────────────┤
  │   ├── Note Tree (left)                              │
  │   ├── Editor (center)                               │
  │   └── Chat Panel (right, collapsible)               │
  │                                                     │
  ├── Knowledge Workspace ──────────────────────────────┤
  │   ├── Source List (left)                            │
  │   ├── Synthesis View (center)                       │
  │   └── Chat Panel (right, collapsible)               │
  │                                                     │
  └── Study Workspace ──────────────────────────────────┘
      ├── Flashcard/Quiz List (left)
      ├── Study View (center)
      └── Chat Panel (right, collapsible)

Cross-Workspace Navigation:
- Sidebar icons switch workspace
- Project context PRESERVED during switch
- Chat history PRESERVED (per-project threads)
- Asset references work cross-workspace (e.g., note references IDE file)
```

---

### Decision 6: CRUD Permissions for AI Agents

**Question**: How should AI agents request and execute file operations?

**RECOMMENDATION**: Tool-based permission model with explicit approval.

```typescript
interface ToolPermission {
  tool: 'file_read' | 'file_write' | 'file_create' | 'file_delete' | 
        'note_read' | 'note_write' | 'note_create' | 'note_delete' |
        'terminal_execute' | 'browser_navigate';
  scope: 'project' | 'workspace' | 'global';
  requiresApproval: boolean;  // If true, user confirms before execution
}

// Default permissions (safe)
const DEFAULT_PERMISSIONS: ToolPermission[] = [
  { tool: 'file_read', scope: 'project', requiresApproval: false },
  { tool: 'file_write', scope: 'project', requiresApproval: true },
  { tool: 'file_create', scope: 'project', requiresApproval: true },
  { tool: 'file_delete', scope: 'project', requiresApproval: true },
  { tool: 'terminal_execute', scope: 'project', requiresApproval: true },
];
```

---

## Phased Execution Plan

### Phase 0: Stabilization (COMPLETED PARTIALLY)

| Step | Status | Description |
|------|--------|-------------|
| 0.1 | ✅ DONE | Fix `useWorkspaceAccess` hook |
| 0.2 | ✅ DONE | Fix `browser-mode.ts` direct Dexie persistence |
| 0.3 | ⬜ TODO | Fix pre-existing TypeScript errors (AITransformMenu, ReplacementPreviewDialog) |
| 0.4 | ⬜ TODO | Add error boundaries to all workspace routes |

### Phase 1: Single Source of Truth (SSOT)

| Step | Priority | Description | Files |
|------|----------|-------------|-------|
| 1.1 | P0 | Consolidate Project Store | Merge `lib/workspace/project-store/` → `infrastructure/persistence/stores/project/` |
| 1.2 | P1 | Delete duplicate files | `lib/filesystem/local-fs-adapter.ts`, `lib/workspace/file-sync-status-store/` |
| 1.3 | P1 | Create facade re-exports | Old paths → canonical paths |
| 1.4 | P2 | Fix `saveProject` STUB | Replace stub with real Dexie persistence |

### Phase 2: Database Consolidation

| Step | Priority | Description |
|------|----------|-------------|
| 2.1 | P0 | Complete `db-consolidation-service.ts` |
| 2.2 | P1 | Migrate FlashcardDB → ViaGentDatabase |
| 2.3 | P1 | Migrate StudyDB → ViaGentDatabase |
| 2.4 | P2 | Add sync/async state contracts |

### Phase 3: Platform Routing

| Step | Priority | Description |
|------|----------|-------------|
| 3.1 | P0 | Create `getPlatformContract()` function |
| 3.2 | P0 | Standardize route guards (beforeLoad) |
| 3.3 | P1 | Fix mobile → notes redirect for IDE |
| 3.4 | P2 | Add project validation with retry |

### Phase 4: Entity Standardization

| Step | Priority | Description |
|------|----------|-------------|
| 4.1 | P1 | Enforce ProjectId type template literal |
| 4.2 | P1 | Fix `workspaceId || projectId` fallback bugs |
| 4.3 | P2 | Rename `bindings` → `workspaceBindings` (breaking) |

### Phase 5: AI/Agent Integration

| Step | Priority | Description |
|------|----------|-------------|
| 5.1 | P1 | Implement tool permission store |
| 5.2 | P2 | Add approval UI for destructive operations |
| 5.3 | P2 | Connect RAG pipeline to unified storage |

### Phase 6: Cross-Workspace Features

| Step | Priority | Description |
|------|----------|-------------|
| 6.1 | P2 | Asset references (note links to IDE file) |
| 6.2 | P2 | Cross-workspace search |
| 6.3 | P3 | Knowledge synthesis from IDE + Notes |

---

## Tracking Registry

### Files Modified Today (2026-01-16)

| File | Change | Reason |
|------|--------|--------|
| `src/lib/workspace/browser-mode.ts` | Direct Dexie persistence | `saveProject` was a STUB |
| `src/lib/workspace/workspace-access-helper.tsx` | `useState`/`useEffect` pattern | `useLiveQuery` caused infinite loops |
| `src/presentation/components/notes/ReplacementPreviewDialog.tsx` | Fixed ternary syntax | Pre-existing error |

### Files to Remove (Phase 1.2)

| File | Reason |
|------|--------|
| `src/lib/filesystem/local-fs-adapter.ts` | Duplicate of `infrastructure/filesystem/local-fs-adapter.ts` |
| `src/lib/workspace/file-sync-status-store/` | Duplicate of `infrastructure/persistence/stores/file-sync/` |
| `src/lib/workspace/project-store/` (slices) | Consolidate to infrastructure |

### Files to Create (Future Phases)

| File | Phase | Description |
|------|-------|-------------|
| `src/domain/services/platform-contract.ts` | 3.1 | Central platform detection |
| `src/domain/services/storage-gateway.ts` | 2.4 | Unified storage abstraction |
| `src/infrastructure/persistence/stores/permissions/tool-permission-store.ts` | 5.1 | AI tool permissions |

---

## Success Metrics

| Metric | Current | Target | Phase |
|--------|---------|--------|-------|
| TypeScript errors | 10 | 0 | 0.3 |
| Separate Dexie databases | 11 | 1 | 2.1-2.3 |
| Store files in `src/lib/` | 15+ | 0 | 1.1-1.3 |
| Duplicate adapter files | 3 | 0 | 1.2 |
| Route guard coverage | ~50% | 100% | 3.2 |

---

## Next Immediate Actions

1. **Fix remaining TypeScript errors** (AITransformMenu.tsx, ReplacementPreviewDialog.tsx)
2. **Test Notes workspace** - Verify persistence works on page reload
3. **Create Phase 1.1 story** - Consolidate Project Store

---

**Document Owner**: BMAD Master Orchestrator
**Last Updated**: 2026-01-16T15:30:00+07:00
**Status**: ACTIVE - Tracking all remediation work
