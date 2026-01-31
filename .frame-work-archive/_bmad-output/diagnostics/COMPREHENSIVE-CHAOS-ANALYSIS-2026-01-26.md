# CODEBASE CHAOS ANALYSIS - Via-gent Project Alpha
## Generated: 2026-01-26T16:52:00+07:00
## Author: BMAD Master Agent

---

# EXECUTIVE SUMMARY

The Via-gent codebase suffers from **SEVERE ARCHITECTURAL FRAGMENTATION** caused by:

1. **Dual Architecture Conflict**: Legacy workspace-centric (`src/lib/`) vs. new project-centric (`src/infrastructure/` + `src/plugins/`)
2. **Presentation Layer Bloat**: 640 files (37% of codebase) containing business logic
3. **Workspace-Centric Pollution**: Routes, stores, translations still use workspace patterns
4. **Massive Duplication**: Same functionality exists in multiple locations

---

# CODEBASE METRICS

| Metric | Value |
|--------|-------|
| **Total TypeScript/TSX Files** | 1,736 |
| **Total Lines of Code** | 357,772 |
| **Total Directories** | 334 |
| **Top-Level Domains** | ~20 |

---

# DOMAIN FILE DISTRIBUTION

## Primary Domains

| Domain | Files | % | Assessment |
|--------|-------|---|------------|
| `presentation/` | 640 | 37% | 🔴 BLOATED - Business logic in UI |
| `lib/` | 507 | 29% | 🔴 LEGACY DUMP - Should be migrated |
| `infrastructure/` | 395 | 23% | ⚠️ Heavy - New architecture target |
| `domain/` | 65 | 4% | ✅ Clean architecture core |
| `hooks/` | 36 | 2% | ⚠️ Should be in presentation |
| `routes/` | 30 | 2% | 🔴 Multiple conflicting patterns |
| `plugins/` | 21 | 1% | ✅ New plugin architecture |
| Other | 42 | 2% | Various |

---

# LEGACY `src/lib/` ANALYSIS (507 files - SHOULD BE MIGRATED)

The `lib/` directory is a **legacy dump** containing mixed responsibilities:

| Subdomain | Files | Migration Target | Priority |
|-----------|-------|------------------|----------|
| `agent/` | 140 | `domain/services/agent` | P0 |
| `filesystem/` | 59 | `infrastructure/filesystem` | P0 |
| `notes/` | 57 | `plugins/notes` | P1 |
| `rag/` | 41 | `domain/services/rag` | P1 |
| `workspace/` | 33 | **DELETE** (workspace-centric) | P0 |
| `workflow/` | 20 | `_bmad/` or `domain/workflows` | P2 |
| `filesync/` | 15 | `infrastructure/sync` | P0 |
| `events/` | 11 | `infrastructure/events` | P0 |
| `webcontainer/` | 10 | `infrastructure/webcontainer` | P0 |

### Action Required
- `lib/workspace/` - 33 files - **COMPLETE REMOVAL** (workspace-centric pollution)
- `lib/filesystem/` - 59 files - **MERGE** with `infrastructure/filesystem/` (32 files)
- `lib/events/` - 11 files - **MERGE** with `infrastructure/events/` (3 files)
- `lib/filesync/` - 15 files - **MERGE** with `infrastructure/sync/` (81 files)

---

# NEW ARCHITECTURE `src/infrastructure/` (395 files)

The new architecture target with proper separation:

| Subdomain | Files | Purpose | Status |
|-----------|-------|---------|--------|
| `persistence/` | 265 | Dexie, stores, hydration | 🔴 MASSIVE |
| `sync/` | 81 | File synchronization | ⚠️ Large |
| `filesystem/` | 32 | FSA adapters, handle persistence | ✅ Core |
| `tools/` | 6 | Agent tools | ✅ OK |
| `plugins/` | 4 | Plugin registry/config | ✅ Core |
| `events/` | 3 | EventBus | ⚠️ Incomplete? |
| `context/` | 2 | ProjectContext | ✅ Core |
| `webcontainer/` | 2 | WebContainer adapter | ⚠️ Small |
| `ui/` | 1 | UI utilities | ⚠️ Misplaced |
| `services/` | 1 | Application services | ⚠️ Empty? |

### Action Required
- `infrastructure/persistence/` - 265 files - **NEEDS AUDIT** for store duplication
- `infrastructure/sync/` - 81 files - **NEEDS AUDIT** for conflicts with `lib/filesync/`

---

# PRESENTATION LAYER (640 files - NEEDS THINNING)

The presentation layer contains **business logic** that should be in domain/infrastructure:

| Component Group | Files | Status | Issue |
|-----------------|-------|--------|-------|
| `ui/` | 102 | ✅ Primitive | Design system components |
| `ide/` | 84 | 🔴 Feature | Should be plugin |
| `agent/` | 83 | 🔴 Feature | Should be in domain |
| `notes/` | 78 | 🔴 Duplicate | Conflicts with plugins/notes |
| `chat/` | 47 | 🔴 Duplicate | Conflicts with plugins/chat |
| `hub/` | 45 | ⚠️ Large | Hub pages and dialogs |
| `layout/` | 44 | ⚠️ Large | Layout components |
| `about/` | 31 | ⚠️ Unusual | Too many files for About |
| `canvas/` | 19 | ✅ Feature | Tldraw integration |
| `workspace/` | 10 | 🔴 LEGACY | Workspace-centric code |
| Others | 97 | Various | |

### Action Required
- `presentation/components/ide/` - 84 files - **MIGRATE TO** `plugins/`
- `presentation/components/notes/` - 78 files - **MERGE WITH** `plugins/notes/`
- `presentation/components/chat/` - 47 files - **MERGE WITH** `plugins/chat/`
- `presentation/components/workspace/` - 10 files - **DELETE** (legacy)

---

# ROUTE STRUCTURE CHAOS

## Current Route Files

| Route File | Lines | Purpose | Status |
|-----------|-------|---------|--------|
| `$projectId.tsx` | 143 | Project-centric route | 🔴 BROKEN |
| `$projectId.diagnostic.tsx` | 310 | Diagnostic page | 🔴 NOT RENDERING |
| `$projectId.test.tsx` | 200 | Test route | ⚠️ Unknown |
| `ide.$projectId.tsx` | 114 | Legacy IDE route | ⚠️ DEPRECATED |
| `ide.tsx` | 26 | Legacy IDE entry | ⚠️ DEPRECATED |
| `notes.$projectId.tsx` | 146 | Legacy Notes route | ⚠️ DEPRECATED |
| `notes.lazy.tsx` | 27 | Legacy Notes entry | ⚠️ DEPRECATED |
| `hub.tsx` | 15 | Hub home | ✅ Works |
| `index.tsx` | 14 | Root redirect | ✅ Works |
| `settings.tsx` | 700+ | Settings | 🔴 BLOATED |

## Per new-fundamental-truths.md Section 1.2

**ONLY TWO ROUTES SHOULD EXIST:**
```
/hub                - Project management, no project loaded
/$projectId         - Project loaded with feature plugins
```

### Action Required
- **DELETE** `ide.tsx`, `ide.$projectId.tsx`
- **DELETE** `notes.lazy.tsx`, `notes.$projectId.tsx`
- **FIX** `$projectId.tsx` to properly render plugins
- **EXTRACT** settings to modal/plugin (700+ lines is too large)

---

# SESSION FAILURE ANALYSIS (2026-01-26)

## Files Modified This Session

| File | Change Type | Result |
|------|-------------|--------|
| `plugins/*/Plugin.tsx` (6 files) | Added width/height props | ⚠️ Untested |
| `hub/HubHomePage.tsx` | Project-centric navigation | ⚠️ Lint warnings |
| `hub/ProjectPickerDialog.tsx` | Project-centric navigation | ⚠️ Untested |
| `layouts/PluginPanel.tsx` | Unknown changes | ⚠️ Untested |
| `routes/$projectId.tsx` | Direct plugin imports | 🔴 BROKEN - Bypasses layout |
| `routes/ide.tsx` | Redirect cleanup | ✅ OK |
| `routes/notes.lazy.tsx` | Redirect cleanup | ✅ OK |

## Patches Attempted (This Session)

1. **FeaturePlugin Interface** - Added `MainComponent` to replace `component`
   - Result: Plugins updated but layout not wired
   
2. **PluginLayout** - Attempted to pass width/height to plugins
   - Result: Unknown - layout still shows nothing
   
3. **Direct Plugin Render** - Bypassed layout to render FileTreePlugin directly
   - Result: Still shows "ide.noFiles" or nothing

4. **Route Navigation** - Changed all routes to `/$projectId`
   - Result: Hub navigates correctly but route broken

5. **Diagnostic Route** - Created `$projectId.diagnostic.tsx`
   - Result: Does NOT render (route format issue)

---

# ROOT CAUSE ANALYSIS (CRITICAL)

## The Core Problem: Context Race Condition

The Master has identified the **PRIMARY ROOT CAUSE** of the FileTree not rendering:

### ProjectContext Provides `null` During Initialization

**File:** `src/infrastructure/context/project-context.tsx`

```tsx
// Line 371-372
const contextValue: ProjectContext | null = (loading || error || !project || !platform || !gateway)
  ? null  // ← CONTEXT IS NULL DURING LOADING
  : { ... };

// Line 416-418
return (
  <ProjectContext.Provider value={contextValue}>
    {children}  // ← Children render IMMEDIATELY
```

### What Happens:

1. `ProjectContextProvider` renders with `projectId`
2. Async initialization starts (`useEffect`)
3. `loading = true`, so `contextValue = null`
4. **Children immediately render** with `null` context
5. FileTreePlugin calls `useProjectContext()`
6. `useProjectContext()` throws: "must be used within ProjectContextProvider"

### Why FileTreePlugin Shows "ide.noFiles"

FileTreePlugin has a null check:

```tsx
// Line 226-235 in FileTreePlugin.tsx
if (!gateway) {
  return (
    <div>
      <AlertCircle />
      <p>{t('ide.noFolderSelected')}</p>  // ← Shows this!
    </div>
  );
}
```

But actually `useProjectContext()` throws before this check runs!

### Evidence from Screenshot

The UI shows `ide.noFiles` which **is not** a valid translation after lookup.
This means the translation key `ide.noFiles` was used directly as fallback.

---

## SECONDARY ROOT CAUSES

### 1. Async FSA Handle Restoration

```tsx
// Lines 240-274 in project-context.tsx
if (loadedProject.storageType === 'fsa') {
  // ... async handle restoration
  if (restoreResult.requiresUserInteraction) {
    setShowPermissionOverlay(true);
    setLoading(false);
    return; // ← Exits early, children already rendered with null
  }
}
```

### 2. Gateway Creation Depends on Handle

```tsx
// Line 278-282
const storageAdapter: StorageAdapter = storageAdapterFactory.createAdapter({
  projectId,
  storageType: loadedProject.storageType,
  handle: resolvedHandle,  // ← null if handle not restored
});
```

### 3. Plugin Assumes Sync Context Availability

FileTreePlugin expects `useProjectContext()` to return a valid context:

```tsx
// Line 74 in FileTreePlugin.tsx
const { gateway, project, refreshFileTree, openFile } = projectContext;
// ↑ This destructures from context, assumes non-null
```

---

## FIX REQUIREMENTS

### Option A: Suspend Children Until Ready

```tsx
// Wrap children in a condition
return (
  <ProjectContext.Provider value={contextValue}>
    {contextValue ? children : <LoadingSpinner />}
  </ProjectContext.Provider>
);
```

### Option B: Use Safe Hook

FileTreePlugin should use `useProjectContextSafe()`:

```tsx
const projectContext = useProjectContextSafe();
if (!projectContext) {
  return <LoadingSkeleton />;
}
const { gateway } = projectContext;
```

### Option C: Suspense/React Query Pattern

Use Suspense with async data loading.

---

# DATA FLOW ANALYSIS

## Expected Flow (per new-fundamental-truths.md)

```
USER ACTION: Click project in hub
    ↓
ROUTE: Navigate to /$projectId
    ↓
LOADER: 
├── waitForHydration()
├── Query Dexie for project
├── fromRecord() to create Project
└── Return { project }
    ↓
COMPONENT:
├── ProjectContextProvider wraps content
│   ├── Restore FSA handle (handlePersistenceService)
│   ├── Create StorageGateway
│   └── Expose { project, gateway } via context
├── PluginLayout reads from PluginLayoutStore
│   ├── Get enabled plugins
│   └── Render each plugin panel
│       └── Plugin.MainComponent receives { width, height }
└── FileTreePlugin.MainComponent
    ├── useProjectContext() → { gateway }
    ├── gateway.list('.') → files
    └── Render tree
```

## Actual Flow (BROKEN)

```
USER ACTION: Click project in hub
    ↓
ROUTE: Navigate to /$projectId
    ↓
LOADER: ✅ Works
    ↓
COMPONENT:
├── ProjectContextProvider ✅ Wraps correctly
├── Direct plugin imports (bypassing layout) 🔴 WRONG
└── FileTreePlugin.MainComponent
    ├── useProjectContext() → ??? (context may be null)
    ├── gateway.list('.') → ??? (may fail)
    └── Shows "ide.noFiles" 🔴 WRONG TRANSLATION KEY
```

## Root Causes

1. **ProjectContextProvider** may not finish initializing before children render
2. **PluginLayout** is bypassed, so layout logic never runs
3. **FileTreePlugin** uses old "ide." translation keys
4. **Gateway** may not be created if handle restoration fails
5. **FSA Handle** may not be persisted correctly during project creation

---

# DUPLICATION MATRIX

## Filesystem Implementations

| Location | Files | Status |
|----------|-------|--------|
| `lib/filesystem/` | 59 | 🔴 LEGACY |
| `infrastructure/filesystem/` | 32 | ✅ NEW |
| `lib/filesync/` | 15 | 🔴 LEGACY |
| `infrastructure/sync/` | 81 | ⚠️ Merged? |

## Notes Implementations

| Location | Files | Status |
|----------|-------|--------|
| `lib/notes/` | 57 | 🔴 LEGACY |
| `plugins/notes/` | ?? | ✅ NEW |
| `presentation/components/notes/` | 78 | 🔴 UI LAYER |

## Chat Implementations

| Location | Files | Status |
|----------|-------|--------|
| `lib/chat/` | 3 | 🔴 LEGACY |
| `plugins/chat/` | ?? | ✅ NEW |
| `presentation/components/chat/` | 47 | 🔴 UI LAYER |

## EventBus Implementations

| Location | Files | Status |
|----------|-------|--------|
| `lib/events/` | 11 | 🔴 LEGACY |
| `infrastructure/events/` | 3 | ✅ NEW |

---

# WORKSPACE-CENTRIC POLLUTION

## Translation Keys Using "ide." or "notes." Prefix

Files with workspace-specific translations:
- `ide.noFiles` - FileTree empty state
- `ide.loading` - Loading state
- `notes.xxx` - Various notes translations

## Stores with Workspace Logic

Need to audit `infrastructure/persistence/stores/` for:
- Workspace-specific store keys
- Workspace bindings in project records
- Layout modes based on workspace

---

# RECOMMENDED REMEDIATION PHASES

## Phase 0: STOP THE BLEEDING (Immediate)
1. Revert `$projectId.tsx` to working state (if any)
2. Identify ONE working entry point to debug from
3. Document exact failure points with console logs

## Phase 1: FOUNDATION (Critical)
1. Fix ProjectContextProvider async initialization
2. Wire PluginLayout to PluginLayoutStore correctly
3. Verify FileTreePlugin receives gateway from context
4. Test gateway.list('.') with console logging

## Phase 2: CLEANUP (Important)
1. Delete deprecated routes (ide.*, notes.*)
2. Migrate workspace-centric code to project-centric
3. Consolidate duplicate implementations

## Phase 3: ARCHITECTURE (Long-term)
1. Thin out presentation layer (640 → ~200 files)
2. Migrate lib/ to proper domains
3. Establish clear boundaries

---

# FILES TO DELETE

## Deprecated Routes
- `src/routes/ide.tsx`
- `src/routes/ide.$projectId.tsx`
- `src/routes/notes.lazy.tsx`
- `src/routes/notes.$projectId.tsx`
- `src/routes/workspace/` (entire directory)

## Legacy Workspace Code
- `src/lib/workspace/` (33 files)
- `src/presentation/components/workspace/` (10 files)

---

# NEXT ACTIONS FOR SUB-AGENTS

1. **Domain Mapper Agent**: Map all 1,736 files to their proper clean architecture domain
2. **Duplication Detector Agent**: Find all duplicate implementations across lib/ and infrastructure/
3. **Translation Auditor Agent**: Find all workspace-centric translation keys
4. **Store Auditor Agent**: Audit all Zustand stores for workspace references
5. **Route Fixer Agent**: Create working route structure per new-fundamental-truths.md

---

*End of Chaos Analysis Report*
*Generated by BMAD Master Agent*
*Version: 6.0.0-alpha.23*
