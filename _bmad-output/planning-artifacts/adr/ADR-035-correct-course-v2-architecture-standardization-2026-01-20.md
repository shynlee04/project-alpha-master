---
# ⚠️ SUPERSEDED DECISION RECORD
**Status:** SUPERSEDED
**Superseded By:** ADR-034-project-centric-architecture-2026-01-20.md
**Superseded Date:** 2026-01-25
**Reason:** Architectural consolidation - ADR-034 established project-centric architecture as primary authority
---

# ADR-035: Correct-Course v2 - Architecture Standardization

**Date**: 2026-01-14
**Status**: SUPERSEDED (was: APPROVED - IMMEDIATE EXECUTION)
**Decision Makers**: User + BMAD Master Orchestrator
**Supersedes**: ADR-033 (partial), ADR-034 (extends)
**Superseded By**: ADR-034
**Priority**: P0 - CRITICAL BLOCKERS IDENTIFIED

---

## Executive Summary

Deep-scan analysis on 2026-01-14 revealed that despite 90%+ claimed completion:
- **3 P0 bugs** block ALL user journeys
- **Architecture boundaries** are undefined (Dexie used for 5 conflicting purposes)
- **ID confusion** causes hydration failures (WorkspaceId vs ProjectId)
- **Platform branching** broken (desktop gets mobile flow)

This ADR standardizes the architecture and defines the fix plan.

---

## Part 1: STANDARDIZED ARCHITECTURE

### 1.1 Entity Model (Single Source of Truth)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ENTITY MODEL                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PROJECT (Domain Entity)                                                     │
│  ════════════════════════                                                    │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │  id: string              // Format: "proj_{uuid}"           │            │
│  │  name: string            // Display name                    │            │
│  │  folderPath: string      // Display path (FSA security)     │            │
│  │  storageType: 'fsa' | 'indexeddb'                           │            │
│  │  workspaceBindings: {                                        │            │
│  │    ide?: boolean,                                            │            │
│  │    notes?: boolean,                                          │            │
│  │    study?: boolean,                                          │            │
│  │    knowledge?: boolean                                       │            │
│  │  }                                                           │            │
│  │  createdAt: Date                                             │            │
│  │  lastOpened: Date                                            │            │
│  │  // ... other metadata                                       │            │
│  └─────────────────────────────────────────────────────────────┘            │
│                                                                              │
│  WORKSPACE (NOT an Entity - Just a View Mode Name)                          │
│  ═══════════════════════════════════════════════════                        │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │  type WorkspaceId = 'ide' | 'notes' | 'study' | 'knowledge' │            │
│  │                                                              │            │
│  │  ⚠️ WorkspaceId is NOT an entity ID!                        │            │
│  │  ⚠️ It is a VIEW MODE selector only!                        │            │
│  │  ⚠️ NEVER use it where projectId is expected!               │            │
│  └─────────────────────────────────────────────────────────────┘            │
│                                                                              │
│  COMPOSITE KEY PATTERN                                                       │
│  ════════════════════                                                        │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │  Key: [projectId, workspaceId]                              │            │
│  │                                                              │            │
│  │  Example: ["proj_abc123", "ide"]                            │            │
│  │  Meaning: IDE state for project proj_abc123                 │            │
│  │                                                              │            │
│  │  Use for: IDE state, conversations, file snapshots          │            │
│  │  NOT for: Project entity itself (just projectId)           │            │
│  └─────────────────────────────────────────────────────────────┘            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Project ID Format Standard

| Project Type | ID Format | Example | When Created |
|--------------|-----------|---------|--------------|
| FSA Project | `proj_{uuid}` | `proj_a1b2c3d4-e5f6-7890-abcd-ef1234567890` | User picks folder |
| IndexedDB Project | `proj_{uuid}` | `proj_x1y2z3w4-...` | User creates via wizard |
| Browser Default | `proj_browser-default` | `proj_browser-default` | Mobile auto-create |
| Temp IDE | `proj_temp_{uuid}` | `proj_temp_a1b2c3d4` | Quick start (deprecated) |

**Rules**:
- ALL project IDs start with `proj_`
- NO colons (`:`) in IDs (breaks URL parsing)
- UUID v4 for uniqueness
- `proj_browser-default` is the ONLY magic ID (for mobile)

### 1.3 Storage Layer Boundaries

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        STORAGE LAYER BOUNDARIES                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  LAYER 1: DEXIE (IndexedDB) - Persistent Database                           │
│  ═════════════════════════════════════════════════                          │
│  ┌────────────────────┬────────────────────┬────────────────────┐           │
│  │ Table              │ Purpose            │ Owner              │           │
│  ├────────────────────┼────────────────────┼────────────────────┤           │
│  │ db.projects        │ Project metadata   │ Domain Layer       │           │
│  │ db.notes           │ Note content       │ Domain Layer       │           │
│  │ db.conversations   │ Chat history       │ Domain Layer       │           │
│  │ db.fsaHandles      │ FSA handle storage │ Infrastructure     │           │
│  │ db.ideState        │ IDE layout/tabs    │ State Layer        │           │
│  │ db.fileSnapshots   │ File tree cache    │ Infrastructure     │           │
│  │ db.fileContentCache│ File content cache │ Infrastructure     │           │
│  │ db.providerConfigs │ Zustand persist    │ State Layer        │           │
│  │ db.terminalState   │ Terminal persist   │ State Layer        │           │
│  │ db.workspaceState  │ Workspace persist  │ State Layer        │           │
│  └────────────────────┴────────────────────┴────────────────────┘           │
│                                                                              │
│  LAYER 2: ZUSTAND - Reactive State                                          │
│  ═════════════════════════════════                                          │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │ Pattern: Zustand store + persist middleware + Dexie storage    │         │
│  │                                                                 │         │
│  │ persist({                                                       │         │
│  │   name: `store-name-${projectId}`,  // SCOPED by projectId     │         │
│  │   storage: createJSONStorage(() => createDexieStorage('table'))│         │
│  │ })                                                              │         │
│  │                                                                 │         │
│  │ ⚠️ ALL Zustand stores MUST use Dexie (not localStorage)        │         │
│  │ ⚠️ ALL persist keys MUST include projectId for scoping         │         │
│  └────────────────────────────────────────────────────────────────┘         │
│                                                                              │
│  LAYER 3: FSA (File System Access) - Real Files                             │
│  ═══════════════════════════════════════════════                            │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │ Used for: Desktop projects with storageType='fsa'              │         │
│  │                                                                 │         │
│  │ Handle stored in: db.fsaHandles (actual handle, not mock)      │         │
│  │ Files accessed via: FileSystemDirectoryHandle                  │         │
│  │ Notes stored as: /project/notes/*.md (real files)              │         │
│  │                                                                 │         │
│  │ ⚠️ FSA is DESKTOP ONLY                                         │         │
│  │ ⚠️ Chrome 122+ for persistent permissions                      │         │
│  │ ⚠️ Chrome 129+ for structuredClone of handle                   │         │
│  └────────────────────────────────────────────────────────────────┘         │
│                                                                              │
│  LAYER 4: LOCALSTORAGE - DEPRECATED (DO NOT USE)                            │
│  ═══════════════════════════════════════════════                            │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │ ❌ localStorage is NOT scoped by projectId                      │         │
│  │ ❌ localStorage has 5MB limit                                   │         │
│  │ ❌ localStorage causes cross-tab conflicts                      │         │
│  │                                                                 │         │
│  │ EXCEPTION: Last workspace preference per project               │         │
│  │            Key: project_{projectId}_last_workspace             │         │
│  └────────────────────────────────────────────────────────────────┘         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.4 Platform Contract (Auto-Detection)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PLATFORM CONTRACT                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  interface PlatformContract {                                                │
│    deviceType: 'desktop' | 'mobile' | 'tablet';                             │
│    storageType: 'fsa' | 'indexeddb';    // AUTO-SELECTED                    │
│    canAccessFSA: boolean;                                                    │
│    canAccessIDE: boolean;               // = canAccessFSA                   │
│    canWatchFiles: boolean;              // FileSystemObserver support       │
│    canRunTerminal: boolean;             // = desktop only                   │
│    canDoAgenticCoding: boolean;         // = canAccessFSA && canRunTerminal│
│  }                                                                          │
│                                                                              │
│  PLATFORM MATRIX                                                             │
│  ┌───────────┬─────────────┬────────────┬────────────┬────────────┐         │
│  │ Device    │ storageType │ canAccessIDE │ canAccessFSA │ Notes    │         │
│  ├───────────┼─────────────┼────────────┼────────────┼────────────┤         │
│  │ Desktop   │ fsa         │ ✅ true     │ ✅ true     │ FSA folder│         │
│  │ Mobile    │ indexeddb   │ ❌ false    │ ❌ false    │ IndexedDB │         │
│  │ Tablet    │ indexeddb   │ ❌ false    │ ❌ false    │ IndexedDB │         │
│  └───────────┴─────────────┴────────────┴────────────┴────────────┘         │
│                                                                              │
│  ⚠️ User does NOT choose storage type - it is AUTO-DETECTED                 │
│  ⚠️ Desktop = FSA (no browser-mode option in IDE)                           │
│  ⚠️ Mobile = IndexedDB (no FSA option)                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.5 Route Flow Standards

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ROUTE FLOW STANDARDS                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ROUTE: /ide (base)                                                          │
│  ─────────────────                                                           │
│  beforeLoad:                                                                 │
│    ✅ Check getPlatformContract().canAccessIDE                              │
│    ✅ If false → redirect to /hub with reason                               │
│  component:                                                                  │
│    ✅ Desktop → Show "Select Project Folder" + "Browse Projects"            │
│    ❌ NO "Temp Project" option on desktop                                    │
│                                                                              │
│  ROUTE: /ide/$projectId                                                      │
│  ───────────────────────                                                     │
│  beforeLoad:                                                                 │
│    ✅ Platform guard (canAccessIDE)                                          │
│  loader:                                                                     │
│    ✅ Fetch project from db.projects                                         │
│    ✅ Restore FSA handle from db.fsaHandles (SILENT - no picker)            │
│    ✅ Validate project.storageType matches platform                         │
│  component:                                                                  │
│    ✅ Hydrate IDE state for THIS projectId (not 'ide')                      │
│    ✅ Scan file tree via FSA handle                                          │
│                                                                              │
│  ROUTE: /notes (base)                                                        │
│  ──────────────────                                                          │
│  component:                                                                  │
│    Desktop:                                                                  │
│      ✅ Check for existing FSA projects                                      │
│      ✅ If exists → show recent projects list                                │
│      ✅ If none → show "Select Project Folder" dialog                       │
│    Mobile:                                                                   │
│      ✅ Auto-create browser-default project                                  │
│      ✅ Redirect to /notes/proj_browser-default                             │
│                                                                              │
│  ROUTE: /notes/$projectId                                                    │
│  ─────────────────────────                                                   │
│  loader:                                                                     │
│    ✅ Fetch project                                                          │
│    ✅ If FSA → restore handle, connect MarkdownSyncService                  │
│  component:                                                                  │
│    ✅ FSA project → notes sync to .md files                                  │
│    ✅ IndexedDB project → notes in Dexie                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Part 2: CRITICAL BUGS IDENTIFIED

### Bug 1: Chrome Version Check (P0)

```typescript
// FILE: src/infrastructure/filesystem/handle-persistence.ts
// LINE: 53-58

// CURRENT (BROKEN):
export function isStructuredCloneSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'structuredClone' in window &&
    navigator.userAgent.includes('Chrome/129')  // ❌ EXACT MATCH ONLY
  );
}

// FIX:
export function isStructuredCloneSupported(): boolean {
  if (typeof window === 'undefined') return false;
  if (!('structuredClone' in window)) return false;
  
  const match = navigator.userAgent.match(/Chrome\/(\d+)/);
  const chromeVersion = match ? parseInt(match[1], 10) : 0;
  return chromeVersion >= 129;  // ✅ >= 129
}
```

### Bug 2: Hydration Regex Capture Group (P0)

```typescript
// FILE: src/infrastructure/persistence/stores/hydration-manager.ts
// LINE: 55-59

// CURRENT (BROKEN):
private getProjectIdFromURL(): string | null {
  const pathname = window.location.pathname;
  const match = pathname.match(/\/(ide|study)\/([a-f0-9-]+)/i);
  return match ? match[1] : null;  // ❌ match[1] = 'ide' or 'study'
}

// FIX:
private getProjectIdFromURL(): string | null {
  const pathname = window.location.pathname;
  const match = pathname.match(/\/(ide|study|notes|knowledge)\/([^/]+)/i);
  return match ? match[2] : null;  // ✅ match[2] = actual projectId
}
```

### Bug 3: FSA Handle Storage (P0)

```typescript
// FILE: src/infrastructure/persistence/stores/project/project-crud-slice.ts
// LINE: 154-158

// CURRENT (BROKEN):
storeFSAHandle({
  projectId,
  workspaceId: workspaceType,
  handleData: { kind: 'directory' as const, name: input.storageMetadata.directoryName },  // ❌ MOCK
  // ...
});

// FIX: Handle must be passed from creation flow
// In ProjectCreationWizard, after showDirectoryPicker():
const handle = await showDirectoryPicker();
await handlePersistenceService.persistHandle(projectId, handle, 'ide');  // ✅ ACTUAL HANDLE
```

---

## Part 3: SPRINT PLANNING

### Sprint Overview

| Sprint | Name | Duration | Focus |
|--------|------|----------|-------|
| **Week 1** | Foundation Fixes | 3 days | P0 bugs + Architecture cleanup |
| **Week 2** | Integration | 4 days | Notes FSA sync + ID migration |

### Team Assignments

| Team | Focus Area | Platform |
|------|------------|----------|
| **Team A** | Routing, Platform, ID Migration | Claude Code |
| **Team B** | Storage, State, FSA Handle | OpenCode |

---

## Part 4: DETAILED SPRINT PLAN

See companion file: `correct-course-v2-sprint-2026-01-14.yaml`

---

## Part 5: FOUNDATION CLEANUP (Parallel Tracks)

**Team Assignment**: Team B (Foundation Squad)
**Duration**: Week 1-2 (Parallel with Critical Fixes)

### Track 1: Slash Command Store Migration (Data Safety)
*   **Problem**: `src/lib/notes/slash-command-store.ts` uses localStorage (violation) and is in legacy path.
*   **Fix**: Move to `src/infrastructure/persistence/stores/notes/slash-commands/`, switch to Dexie.
*   **Value**: Prevents data loss (5MB limit), fixes architectural violation.

### Track 2: Thread Persistence Migration (Mobile Safety)
*   **Problem**: `conversation-helpers.ts` imports from legacy `threads-store.ts`.
*   **Fix**: Extract `saveThread` logic to `src/infrastructure/persistence/stores/conversation/persistence.ts`.
*   **Value**: Allows safe deletion of legacy code without breaking mobile chat history.

### Track 3: Unified Chat Store Refactor (God Store)
*   **Problem**: `unified-chat-store.ts` is too large and mixes concerns.
*   **Fix**: Extract persistence logic to `chat-persistence-slice.ts`.
*   **Value**: Improves maintainability and testability.

---

## Decisions Summary

### New Decisions (This ADR)

| ID | Decision | Rationale |
|----|----------|-----------|
| D14 | All projectIds start with `proj_` | Consistent format, no URL parsing issues |
| D15 | Dexie table ownership documented | Clear boundaries, no confusion |
| D16 | WorkspaceId defined in ONE file only | Single source of truth |
| D17 | Desktop /notes shows project picker | ADR-033 D3 compliance |
| D18 | browser-mode renamed to `proj_browser-default` | Consistent ID format |

### ADR-033 Amendments

| Section | Amendment |
|---------|-----------|
| D2 | Add: "Chrome >= 129 for structuredClone, not exact match" |
| D3 | Clarify: "Desktop /notes MUST show project picker" |
| D5 | Clarify: "browser-default is MOBILE ONLY" |

---

## Success Criteria

- [ ] Desktop IDE: Create → refresh → files load WITHOUT picker prompt
- [ ] Desktop Notes: Shows project picker, NOT auto browser-mode
- [ ] FSA Notes: Save as .md files via MarkdownSyncService
- [ ] Hydration: Loads state for correct projectId from URL
- [ ] Mobile: Cannot access IDE, auto-creates browser-default
- [ ] All projectIds match `proj_*` format
- [ ] TypeScript: 0 errors
- [ ] No localStorage usage except last_workspace

---

**Document Owner**: BMAD Master Orchestrator
**Created**: 2026-01-20T15:00:00+07:00
**Status**: APPROVED - IMMEDIATE EXECUTION
