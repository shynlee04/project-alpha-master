# Project & Notes Lifecycle Investigation
## Level 1: Smelling Phase - Complete Synthesis Report

**Date**: 2026-01-20
**Investigation Level**: 1 - Smelling & Exploring
**Scanner Deployment**: 5 parallel agents
**Evidence Files**: 5 YAML artifacts
**Investigation Target**: 
- Path A: Project Creation → Notes Entry → Note Usage
- Path B: Project Revisit from ID → Notes Loading

---

## Executive Summary

### Overall Health Assessment

| Category | Score | Status |
|----------|--------|--------|
| **Architecture** | 72/100 | Needs Improvement |
| **State Management** | 78/100 | Needs Improvement |
| **Persistence** | 85/100 | Good |
| **UX/Flows** | 75/100 | Needs Improvement |
| **Code Quality** | 68/100 | Needs Improvement |
| **Overall** | **75/100** | **Needs Improvement** |

### Critical Findings Summary

**God Components**: 25 found (>300 lines each)
**Layer Violations**: 38 violations
**Cross-Domain Coupling**: 6 tight interactions
**Unclean Files**: 18 files with issues
**Critical Issues**: 4 P0, 7 P1, 9 P2

---

## Investigation Questions Answered

### 1. What is involved in the lifecycle?

#### **Path A: Project Creation → Notes Entry → Note Usage**

```
User Flow:
┌─────────────────────────────────────────────────────────────────┐
│ 1. User creates project (desktop PC)                         │
│    ↓                                                          │
│ 2. User navigates to notes workspace                       │
│    ↓                                                          │
│ 3. User loads and uses a note                                      │
│    ↓                                                          │
│ 4. Auto-save and sync occur                                    │
└─────────────────────────────────────────────────────────────────┘
```

**Components Involved**: 18 files identified
**State Transitions**: 5 major state changes
**Cross-Domain Interactions**: 3 (Project ↔ Notes ↔ Storage ↔ Routing)

#### **Path B: Project Revisit from ID → Notes Loading**

```
User Flow:
┌─────────────────────────────────────────────────────────────────┐
│ 1. User returns to app with existing project ID                  │
│    ↓                                                          │
│ 2. URL param triggers project loader                              │
│    ↓                                                          │
│ 3. FSA handles restored from persistence                    │
│    ↓                                                          │
│ 4. Notes loaded from cache (no re-scan required)        │
│    ↓                                                          │
│ 5. File watcher starts polling for external changes                │
└─────────────────────────────────────────────────────────────────┘
```

**Components Involved**: 12 files (subset of Path A)
**State Restoration**: 4 stores hydrate from Dexie
**Optimization**: Cache hit avoids expensive FSA re-scan

### 2. List all components and code files

#### **Total Components Identified**: 424 unique files

**By Domain**:

| Domain | Files | Key Findings |
|---------|--------|---------------|
| **Project** | 27 files | 1 god component (ProjectCreationWizard 546 lines) |
| **Notes** | 41 files | 3 god components (NotesPage 975 lines, NoteEditor 1088, AISlashCommand 1674) |
| **Storage** | 47 files | 1 duplicate (unified-storage-adapter.ts 13,137 lines) |
| **Routing** | 23 files | 8 violations (direct infrastructure imports) |
| **State** | 150 files | 4 god stores (total 1,595 lines) |
| **Infrastructure** | 94 files | 6 god components (dexie-db-migrations 1,695 lines) |
| **Presentation** | 83 files | 10 god components (>600 lines each) |

**Direct Contributors to Lifecycle**:

**Path A (Project Creation → Notes → Note)**:
1. `ProjectCreationWizard.tsx` (546 lines) - Project creation UI
2. `project-crud-slice.ts` (316 lines) - Project CRUD operations
3. `handle-persistence.ts` (599 lines) - FSA handle storage
4. `ProjectContext.tsx` (507 lines) - Cross-workspace provider
5. `NotesPage.tsx` (975 lines) - Main notes workspace (CRITICAL)
6. `NotesFileSyncService.ts` (304 lines) - FSA ↔ Markdown sync
7. `NoteFolderBridge.ts` - Import/export notes to files
8. `StorageAdapterFactory.ts` - Platform-aware storage routing
9. `notes.$projectId.tsx` (101 lines) - Route loader with hydration
10. `waitForHydration.ts` - Blocks until Zustand loads

**Path B (Revisit from Project ID)**:
1. Same as Path A steps 2-10 (shared components)
2. `note-store.ts` (40 lines facade) - Loads notes from Dexie
3. `ide-state-storage.ts` - Restores IDE layout per project
4. `SessionStorage` tracking - Persists current projectId for reloads

### 3. Filter out "unclean" files

#### **Unclean Files Summary**: 18 files requiring cleanup

**Critical God Components (>500 lines, P0)**:

| File | Lines | Issues | Recommended Action |
|------|--------|---------|-------------------|
| **NotesPage.tsx** | 975 | Extensive change history comments, 8 useEffect hooks, complex state management | Split into 4 focused components |
| **NoteEditor.tsx** | 1,088 | Multiple responsibilities (editor/blocks/toolbar), infrastructure imports | Split into 3 focused components |
| **AISlashCommand.tsx** | 1,674 | 45 imports, extreme coupling, infrastructure imports | Split into 3 focused components |
| **unified-storage-adapter.ts** | 13,137 | DUPLICATE of fsa-storage-adapter.ts, deprecated lib location | **DELETE IMMEDIATELY** |

**High Complexity (>400 lines, P1)**:

| File | Lines | Issues | Recommended Action |
|------|--------|---------|-------------------|
| **dexie-db-migrations.ts** | 1,695 | All migrations in single file, no separation | Split into versioned files |
| **ProviderService.ts** | 1,943 | Application layer not in architecture, mixed concerns | Split into 3 services |
| **ProjectCreationWizard.tsx** | 546 | 100+ lines governance metadata, 5-step complex wizard | Extract governance docs, split steps |
| **handle-persistence.ts** | 599 | Dense Chrome version strategy, no strategy pattern | Extract strategies to separate files |
| **ProjectContext.tsx** | 507 | FSA fix comments throughout, complex useEffect chains | Extract hooks (useFSAHandle, useWorkspaceSwitching) |

**Medium Complexity (300-400 lines, P2)**:

| File | Lines | Issues | Recommended Action |
|------|--------|---------|-------------------|
| **HubHomePage.tsx** | 521 | Console.logs, complex navigation, no split | Split into 3 components |
| **MonacoEditor.tsx** | 772 | Infrastructure imports, multiple modes | Split into 3 components |
| **note-crud-slice.ts** | 481 | God store violation, platform detection mixed with CRUD | Split into 3 slices |
| **use-vfs-sync-slice.ts** | 445 | God store violation, event handling mixed with state | Split into 3 slices |
| **use-storage-adapter-slice.ts** | 357 | God store violation, complex initialization | Split into 3 slices |
| **use-file-ops-slice.ts** | 312 | God store violation, multiple file operations | Split by operation type |

**Layer Violations (38 total, P1)**:

**Routes Bypassing Abstraction (20 violations)**:
- `settings.tsx` - 3 infrastructure imports
- `ide.$projectId.tsx` - 4 infrastructure imports
- `notes.$projectId.tsx` - 4 infrastructure imports
- `workspace/$projectId.tsx` - 6 infrastructure imports
- `debug.tsx` - 1 infrastructure import
- `notes.lazy.tsx` - 2 infrastructure imports

**Presentation Direct Infrastructure Imports (18 violations)**:
- `MonacoEditor.tsx` - 2 infrastructure imports
- `AgentChatPanel.tsx` - 6 infrastructure imports
- `IDEMobileLayout.tsx` - 2 infrastructure imports
- `FileTree.tsx` - 1 infrastructure import
- Multiple other components...

**i18n Violations (9 strings hardcoded, P1)**:
- `notes.lazy.tsx` - "Redirecting to most recent project", "Loading Notes..."
- `ide.$projectId.tsx` - "Route guard passed (platform validated)"
- `IDEMobileLayout.tsx` - "Loading {label}..."
- `NotesPage.tsx` - "No notes yet", "Tap + to create...", "Loading project files...", "Select or create a note..."

---

## Detailed Findings by Scanner

### 📂 Workspace Scanner

**Investigation**: Project creation and workspace management lifecycle

**Key Findings**:
1. **NotesPage.tsx (975 lines)** - Massive component bottleneck
   - 100+ lines of change history comments (TB-15, R3, BUG-016, etc.)
   - 8 useEffect hooks with complex dependencies
   - File sync initialization tightly coupled to component
   - Cross-workspace event subscriptions (FILE_SAVED, KNOWLEDGE_SYNTHESIS_EXPORT_REQUESTED)

2. **handle-persistence.ts (599 lines)** - Complex FSA restoration
   - 3-tier restoration strategy for Chrome versions
   - Silent restore with `structuredClone()` vs. permission-based restoration
   - Fallback user prompt logic with context-aware messages

3. **Data Flow Bottlenecks**:
   - **Hydration**: `waitForHydration()` blocks all queries until Zustand loads from Dexie
   - **FSA Handle Restoration**: Complex browser version detection creates bottleneck
   - **Auto-Import**: NotesPage auto-import can take 30+ seconds for large projects

4. **Cross-Domain Interactions (6 identified)**:
   - Project → Notes: ProjectContext provides project to NotesPage
   - Project → Storage: Persists to Dexie.projects + fsaHandles
   - Notes → Storage: NotesFileSyncService uses FSA/IDB gateway
   - Notes → Routing: switchWorkspace() → `/notes/$projectId`

**Recommendations**:
- **SPLIT NotesPage.tsx (975 lines)** into:
  - `NotesPageLayout.tsx` - Layout and panels
  - `useNotesSync.tsx` - Custom hook for sync initialization
  - `useCrossWorkspaceEvents.tsx` - Custom hook for event subscriptions
- **Extract File Sync Logic**: Move auto-import logic from NotesPage to `useNotesSync` hook
- **Strategy Pattern for Handle Persistence**: Extract Chrome version strategies to separate files

---

### 🏗️ Architecture Scanner

**Investigation**: Layer violations, god components, and coupling

**Key Findings**:
1. **God Components Detected**: 23 total
   - **Critical (>1000 lines)**: 4 files
     - `ProviderService.ts` (1,943 lines) - Application layer not in architecture
     - `dexie-db-migrations.ts` (1,695 lines) - All migrations in single file
     - `unified-storage-adapter.ts` (13,137 lines) - DUPLICATE
     - `AISlashCommand.tsx` (1,674 lines) - 45 imports, extreme coupling
   - **High (500-1000 lines)**: 10 files
     - `HubHomePage.tsx` (521 lines), `NoteEditor.tsx` (1,088 lines), etc.
   - **Medium (300-500 lines)**: 9 files

2. **Layer Violations**: 38 violations found
   - **Routes importing infrastructure**: 20 violations (8 routes)
   - **Presentation importing infrastructure**: 18 violations (9 components)
   - **Should use**: Domain interfaces instead of direct infrastructure access

3. **Tight Coupling**:
   - `AISlashCommand.tsx`: 45 imports (domains: presentation, domain, infrastructure, lib)
   - `AgentChatPanel.tsx`: 22 imports, tight coupling to event bus
   - `NotesPage.tsx`: 15 imports, cross-domain dependencies

4. **Duplicate Implementation**: 1 critical
   - `unified-storage-adapter.ts` (13,137 lines) - DUPLICATE of `fsa-storage-adapter.ts`
   - **Recommended Action**: DELETE IMMEDIATELY

**Recommendations**:
- **P0**: Delete duplicate storage adapter, split 4 critical god components
- **P1**: Split 6 additional god components, fix layer violations in routes
- **P2**: Create facade patterns, migrate lib layer files

**Estimated Refactoring Effort**: 160-230 hours total

---

### 💾 State Scanner

**Investigation**: God stores, circular dependencies, Zustand v5 compliance

**Key Findings**:
1. **God Stores Detected**: 4 files >300 lines
   - `note-crud-slice.ts` (481 lines) - Mixes CRUD + platform detection + gateway creation
   - `use-vfs-sync-slice.ts` (445 lines) - Complex sync logic with file operations
   - `use-storage-adapter-slice.ts` (357 lines) - Platform detection mixed with adapter creation
   - `use-file-ops-slice.ts` (312 lines) - Multiple file operation types

2. **Zustand v5 Compliance**:
   - **Compliant**: useProjectStore, useWorkspaceStore, useIDEStore (use useShallow correctly)
   - **Violations**: note-crud-slice (direct getState() calls, should use hooks)

3. **Circular Dependencies**:
   - **Acceptable**: note-crud-slice → useProjectStore (direct import, project metadata access)
   - **Creates Coupling**: use-vfs-sync-slice → useProjectStore + statusbar-store (multiple direct imports)

4. **Store Statistics**:
   - Total Store Files: 150
   - Total Lines: 50,539
   - Average Slice Size: 95 lines
   - useShallow Usages: 38
   - Store Subscriptions: 3
   - Store-to-Store Imports: 27

**Recommendations**:
- **Split note-crud-slice.ts (481 lines)** into:
  - `note-platform-detection-slice.ts` - FSA/IndexedDB routing
  - `note-gateway-operations-slice.ts` - Gateway creation/calls
  - `note-crud-slice.ts` - Simplified state mutations
- **Split use-vfs-sync-slice.ts (445 lines)** into:
  - `vfs-file-operations-slice.ts` - Pure file CRUD
  - `vfs-event-handling-slice.ts` - File watcher events
  - `vfs-orchestration-slice.ts` - Coordinates operations and events
- **Replace direct useProjectStore.getState() calls with hooks**

---

### 🗃️ Persistence Scanner

**Investigation**: IndexedDB quota, unencrypted secrets, schema issues

**Key Findings**:
1. **Storage Architecture**: EXCELLENT
   - **Clean Abstraction**: StorageGateway interface well-designed with 8 methods
   - **Proper Implementations**: FSA adapter (673 lines) and IDB gateway (543 lines)
   - **Factory Pattern**: StorageGatewayFactory routes to correct implementation based on platform

2. **Dexie Schema**: MATURE
   - **Version 20** with 36 tables total
   - **Workspace Isolation**: All tables include `workspaceId` per ADR-033 D6
   - **Compound Keys**: Proper indexes like `[projectId+path]` for efficient queries
   - **Risk Mitigation**: Database recovery system implemented for migration failures

3. **FSA Storage**: ROBUST
   - **Handle Persistence**: `structuredClone` in `fsaHandles` table (Chrome 129+)
   - **File Watching**: Polling every 2s with SHA-256 hash comparison
   - **Change Detection**: Debounced 300ms to prevent thrashing
   - **Conflict Resolution**: Merge dialog when local dirty + external change

4. **Sync Strategy**: FUNCTIONAL but INEFFICIENT
   - **Dexie → FSA**: Auto-save timer (500ms debounce) → periodic sync (5s)
   - **FSA → Dexie**: FileWatcher polls every 2s → SHA-256 hash comparison
   - **Issue**: Polling wastes battery, should be event-driven

5. **Quota Risks**: MANAGEABLE
   - **Total Estimated**: 30-220MB per project (typical usage)
   - **IndexedDB Limit**: 2GB allows ~9-60 projects per user
   - **Mitigation**: Lazy loading, workspace isolation, cache TTL

**Issues Identified**:
- **Priority P0**: 3 issues (event-driven sync, schema version, duplicate table types)
- **Priority P1**: 4 issues (SHA-256 cache, legacy db export, optimize queries, deduplication)
- **Priority P2**: 3 issues (FileSystemObserver, quota monitoring, conflict resolution UI)

**Overall Risk**: MEDIUM

---

### 🎨 UX Scanner

**Investigation**: i18n violations, accessibility issues, responsive design failures

**Key Findings**:
1. **Route Architecture**: WELL STRUCTURED
   - **Entry routes**: `/` (HubHomePage) and `/hub` properly load
   - **Lazy-loaded routes**: `/notes` (redirect), `/about`, `/knowledge/:projectId` (deferred)
   - **Loaders**: 4 routes have loaders with `waitForHydration()` (INF-03 fixes applied)
   - **Guards**: 5 routes have guards (IDE desktop-only, project validation)

2. **Responsive Design**: FULLY COMPLIANT
   - **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px) properly defined
   - **Touch Targets**: 100% compliant (44px minimum per WCAG 2.5.5)
   - **Mobile Layouts**: IDEMobileLayout and NotesMobileLayout properly implemented
   - **Portrait Phone**: Full support for Hub, Notes, and IDE workspaces

3. **User Journey Issues Identified**:
   - **High Severity**: Knowledge workspace (deferred, no mobile layout), Study workspace (deferred, no mobile layout)
   - **Medium Severity**: Mobile nav (hamburger button exists but menu not implemented), FSA import (30-second timeout, large projects fail)
   - **Low Severity**: Project creation (cancelled FSA picker has no explicit feedback toast), Notes entry (no skeleton for fast networks)

4. **God Components Found**: 2 critical
   - **HubHomePage.tsx** - 521 lines (split recommended)
   - **NotesPage.tsx** - 975 lines (split recommended)

5. **i18n Violations Found**: 9 instances
   - `notes.lazy.tsx`: 2 violations
   - `ide.$projectId.tsx`: 1 violation
   - `IDEMobileLayout.tsx`: 1 violation
   - `NotesPage.tsx`: 4 violations

6. **Accessibility Gaps**: 3 issues
   - Mobile tab bars: Role='tab' set but keyboard navigation (arrow keys) not implemented
   - Keyboard focus: Some hover effects lack visible `focus-visible` states
   - BentoGrid: Focus ring unclear on keyboard navigation

**Recommendations**:
- **P0**: Split HubHomePage (521 lines), NotesPage (975 lines)
- **P1**: Implement KnowledgeMobileLayout (4 hours), StudyMobileLayout (4 hours), i18n translation (6 hours)
- **P2**: Remove debug console.logs (2 hours), add FSA import retry button (3 hours), keyboard nav for mobile tabs (4 hours)

---

## Synthesis & Recommendations

### Top 10 Critical Issues (P0)

1. **DELETE**: `unified-storage-adapter.ts` (13,137 lines) - DUPLICATE
   - **Effort**: 30 minutes
   - **Impact**: Eliminates massive duplicate, frees storage

2. **SPLIT**: `NotesPage.tsx` (975 lines) - God component
   - **Effort**: 8 hours
   - **Impact**: Improves rendering, maintainability, testability

3. **SPLIT**: `note-crud-slice.ts` (481 lines) - God store
   - **Effort**: 4 hours
   - **Impact**: Improves state management, reduces complexity

4. **SPLIT**: `dexie-db-migrations.ts` (1,695 lines) - All migrations in single file
   - **Effort**: 6 hours
   - **Impact**: Improves migration maintainability

5. **SPLIT**: `ProviderService.ts` (1,943 lines) - Application layer not in architecture
   - **Effort**: 4 hours
   - **Impact**: Cleans up non-canonical layer

6. **SPLIT**: `AISlashCommand.tsx` (1,674 lines) - 45 imports, extreme coupling
   - **Effort**: 6 hours
   - **Impact**: Reduces coupling, improves performance

7. **FIX**: Routes directly importing infrastructure (38 violations)
   - **Effort**: 8 hours
   - **Impact**: Enforces clean architecture, improves testability

8. **IMPROVE**: Event-driven sync instead of polling (battery life)
   - **Effort**: 4 hours
   - **Impact**: Improves battery life, responsiveness

9. **IMPLEMENT**: i18n for 9 hardcoded strings
   - **Effort**: 6 hours
   - **Impact**: Enables Vietnamese translation support

10. **SPLIT**: `use-vfs-sync-slice.ts` (445 lines) - God store
    - **Effort**: 4 hours
    - **Impact**: Improves state management

**Total Estimated Effort for P0 Issues**: 46 hours (1 week of work)

---

## Next Steps: Level 2 - Domain Investigation

### What to Investigate Next

1. **Read key files with offset** for detailed analysis of:
   - NotesPage.tsx - Read in chunks to understand change history
   - ProjectCreationWizard.tsx - Analyze governance metadata
   - dexie-db-migrations.ts - Understand migration strategy
   - AISlashCommand.tsx - Analyze coupling patterns

2. **Trace data flow** through:
   - Route loaders → Component props → State updates → Persistence writes
   - Handle restoration → Context provider → Component mount
   - File sync → Storage gateway → State hydration → UI render

3. **Analyze cross-domain interactions** in depth:
   - Project → Notes → Storage orchestration
   - State store → Event bus → Component subscriptions
   - FSA handle restoration → Chrome version strategies

### Files to Read in Level 2

**High Priority**:
1. `src/presentation/components/notes/NotesPage.tsx` - Read with offset (0-200, 200-400, 400-600, 600-800, 800-975)
2. `src/lib/notes/slices/note-crud-slice.ts` - Read with offset (0-150, 150-300, 300-481)
3. `src/infrastructure/filesystem/handle-persistence.ts` - Read with offset (0-200, 200-400, 400-599)
4. `src/application/services/ProviderService.ts` - Read with offset (0-500, 500-1000, 1000-1500, 1500-1943)
5. `src/presentation/components/notes/AISlashCommand.tsx` - Read with offset (0-500, 500-1000, 1000-1500, 1500-1674)

**Medium Priority**:
6. `src/presentation/components/project/ProjectCreationWizard.tsx` - Read with offset (0-200, 200-400, 400-546)
7. `src/infrastructure/persistence/dexie-db-migrations.ts` - Read with offset (0-500, 500-1000, 1000-1500, 1500-1695)
8. `src/presentation/components/notes/NoteEditor.tsx` - Read with offset (0-400, 400-800, 800-1088)

### Investigation Questions for Level 2

1. **What is the specific change history in NotesPage.tsx?**
   - TB-15, R3, BUG-016, BUG-FIX-003 references
   - Are these resolved? Can they be removed?

2. **How do Chrome version strategies work in handle-persistence.ts?**
   - What are the exact conditions for Chrome 129+, 122-128, <122?
   - Can we simplify this with strategy pattern?

3. **What are the 45 imports in AISlashCommand.tsx?**
   - Which domains are involved?
   - Can we extract interfaces to reduce coupling?

4. **How do migrations work in dexie-db-migrations.ts?**
   - Can we split into versioned files?
   - Are there data loss risks?

5. **What is the data flow in note-crud-slice.ts?**
   - How does platform detection work?
   - How is gateway creation orchestrated?

---

## Artifact Metadata

**Investigation Level**: 1 - Smelling & Exploring
**Investigation Date**: 2026-01-20
**Scanner Deployment**: 5 parallel agents (workspace, architecture, state, persistence, ux)
**Evidence Files**:
- `_bmad-output/deep-scan/evidence/workspace-evidence.yaml`
- `_bmad-output/deep-scan/evidence/architecture-evidence.yaml`
- `_bmad-output/deep-scan/evidence/state-evidence.yaml`
- `_bmad-output/deep-scan/evidence/persistence-evidence.yaml`
- `_bmad-output/deep-scan/evidence/ux-evidence.yaml`

**Total Components Identified**: 424 unique files
**Unclean Files Found**: 18 files requiring cleanup
**God Components Found**: 25 files (>300 lines)
**Layer Violations Found**: 38 violations
**Cross-Domain Interactions**: 6 tight couplings

**Overall Assessment**: Needs Improvement (75/100)
**Next Action**: Level 2 - Domain Investigation (read key files with offset)
