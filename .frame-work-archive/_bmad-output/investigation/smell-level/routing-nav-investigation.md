---
investigation_id: ROUTING-NAV-01
created: 2026-01-20T17:30:00+07:00
scope:
  - "Route definitions and hierarchy"
  - "Guards, loaders, and navigation flow"
  - "Hydration and lazy loading"
investigator: deep-scan-orchestrator
---

# Routing & Navigation Lifecycle Investigation Report

## Executive Summary

This investigation examines the routing architecture, navigation guards, loaders, and hydration flow for the project creation → notes space lifecycle in the Project Alpha codebase. The system uses TanStack Router with a clear separation of concerns between route definitions, platform guards, and data loaders. Key architectural patterns include:

1. **Platform Contract Pattern**: Centralized platform detection via `getPlatformContract()` that caches device capabilities (FSA support, IDE access, terminal support)
2. **Route Guard Pattern**: `beforeLoad` hooks for platform validation before route execution
3. **Hydration Wait Pattern**: `waitForHydration()` utility to prevent race conditions between store hydration and route loaders
4. **Lazy Loading**: Dynamic imports for heavy components (IDELayout, etc.)

The investigation identified 4 uncleaned files with issues ranging from deprecated route handlers to long inline comments and inconsistent patterns.

---

## 1. Route Definitions

### 1.1 Route Hierarchy

```
__root.tsx (root layout)
├── index.tsx (Hub entry at /)
├── hub.tsx (Hub with MainLayout at /hub)
├── notes.lazy.tsx (Notes redirect at /notes)
│   └── notes.$projectId.tsx (Notes workspace at /notes/$projectId)
├── ide.tsx (IDE entry at /ide)
│   └── ide.$projectId.tsx (IDE workspace at /ide/$projectId)
├── workspace/$projectId.tsx (Legacy IDE at /workspace/$projectId)
├── workspace/index.tsx (Workspace index at /workspace/)
├── projects.tsx (Projects list at /projects)
├── settings.tsx (Settings at /settings)
├── debug.tsx (Debug at /debug)
├── about.tsx (About at /about)
├── about.lazy.tsx (About lazy at /about)
└── webcontainer.$.tsx (WebContainer routes)
```

### 1.2 Route Patterns

| Route | Pattern | Type | SSR |
|-------|---------|------|-----|
| `/` | `createFileRoute('/')` | Index | Default |
| `/hub` | `createFileRoute('/hub')` | File | Default |
| `/notes` | `createLazyFileRoute('/notes')` | Lazy | Default |
| `/notes/$projectId` | `createFileRoute('/notes/$projectId')` | File | `ssr: false` |
| `/ide` | `createFileRoute('/ide')` | File | `ssr: false` |
| `/ide/$projectId` | `createFileRoute('/ide/$projectId')` | File | `ssr: false` |
| `/workspace/$projectId` | `createFileRoute('/workspace/$projectId')` | File | `ssr: false` |
| `/settings` | `createFileRoute('/settings')` | File | Default |

### 1.3 Findings: Route Definitions

**Patterns Observed:**

1. **Lazy Route Pattern**: `/notes` uses `createLazyFileRoute` for code splitting, with a redirect component (`NotesRedirect`) handling project selection
2. **File Route Pattern**: Parameterized routes (`/$projectId`) use `createFileRoute` for direct file-based route definitions
3. **SSR Control**: IDE and Notes routes explicitly set `ssr: false` due to browser-only APIs (WebContainer, FSA)
4. **Legacy Route**: `/workspace/$projectId` marked as deprecated but still functional

**Issues:**

- No route tree visualization file (TanStack Router typically generates `routeTree.gen.ts` but file structure unclear)
- Mixed naming conventions: `createFileRoute` vs `createLazyFileRoute` may cause confusion

---

## 2. Guards & Loaders

### 2.1 Platform Contract Architecture

**File**: `src/infrastructure/filesystem/platform-contract.ts` (342 lines)

The platform contract is a singleton that caches platform detection:

```typescript
export interface PlatformContract {
  readonly deviceType: 'desktop' | 'mobile' | 'tablet';
  readonly storageType: 'fsa' | 'indexeddb';
  readonly canAccessFSA: boolean;           // showDirectoryPicker available
  readonly canWatchFiles: boolean;          // FileSystemObserver or polling
  readonly canRunTerminal: boolean;         // WebContainer + COOP/COEP
  readonly canDoAgenticCoding: boolean;     // FSA + Terminal
  readonly canAccessIDE: boolean;           // FSA support (TASK-3 FIX)
}
```

**Detection Logic:**

| Feature | Detection Method |
|---------|-----------------|
| Device Type | User agent + touch detection + screen width |
| FSA Support | `'showDirectoryPicker' in window` |
| WebContainer | `SharedArrayBuffer` + `crossOriginIsolated` |
| Storage Type | Desktop + FSA → `fsa`, else → `indexeddb` |

### 2.2 Route Guards

**File**: `src/infrastructure/filesystem/route-guards.ts` (36 lines)

**Guard Pattern:**

```typescript
export async function requireIDEAccess(projectId: string) {
  const platform = getPlatformContract();
  if (!platform.canAccessIDE) {
    throw redirect({
      to: '/notes/$projectId',
      params: { projectId },
      search: { reason: 'mobile-not-supported' },
    });
  }
}
```

**Guard Usage:**

| Route | Guard | Purpose |
|-------|-------|---------|
| `/ide` | `beforeLoad` (inline) | Block mobile on `/ide` root |
| `/ide/$projectId` | `beforeLoad: requireIDEAccess` | Mobile → redirect to Notes |
| `/workspace/$projectId` | `beforeLoad: requireIDEAccess` | Legacy route guard |
| `/notes/$projectId` | Loader-only | No guard, handles all platforms |

### 2.3 Loaders with Hydration

**Pattern Used Across Routes** (`notes.$projectId.tsx`, `ide.$projectId.tsx`):

```typescript
loader: async ({ params }) => {
  await waitForHydration();  // INF-03 FIX: Wait for Zustand
  const record = await db.projects.get(projectId);
  if (!record) throw redirect({ to: '/hub' });
  const project = fromRecord(record);
  return { project };
}
```

**Hydration Utility** (`wait-for-hydration.ts`):

```typescript
export function waitForHydration(): Promise<void> {
  const state = useProjectStore.getState();
  if (state._hasHydrated) return Promise.resolve();
  return new Promise((resolve) => {
    const unsubscribe = useProjectStore.subscribe(
      (state) => {
        if (state._hasHydrated) {
          unsubscribe();
          resolve();
        }
      }
    );
  });
}
```

**Issue**: The `waitForHydration` pattern is duplicated in both route files. This could be extracted into a shared loader middleware.

### 2.4 Findings: Guards & Loaders

**Patterns:**

1. **Centralized Platform Contract**: Single source of truth for platform capabilities
2. **Redirect Pattern**: Guards use TanStack Router's `throw redirect()` for navigation
3. **Hydration Awareness**: Loaders explicitly wait for Zustand store hydration before querying Dexie
4. **Search Params for Context**: Mobile redirects pass `?reason=mobile-not-supported` for user feedback

**Issues:**

- `/ide.tsx` has inline `beforeLoad` that duplicates `requireIDEAccess` guard logic
- Platform detection cached once per session (may need invalidation for dev/test scenarios)
- No explicit error boundary at route level (handled by component wrapper)

---

## 3. Navigation Flow

### 3.1 Creation → Notes/IDE Flow

```
User clicks workspace card (e.g., Notes)
    ↓
HubHomePage.navigateToWorkspace('notes')
    ↓
Filter projects by workspaceBindings.notes === true
    ↓
Single project → navigate(`/notes/$projectId`)
Multiple projects → open ProjectPickerDialog
    ↓
notes.lazy.tsx: NotesRedirect component
    ├─ Check if child route (/$projectId already matched)
    └─ Query Dexie for notes-eligible projects
        └─ Redirect to most recent project OR hub if none exist
```

### 3.2 Project Creation Flow

```
User clicks "Create Project"
    ↓
handleNewProject() [FSA] OR ProjectCreationWizard
    ↓
useProjectStore.createProject(input)
    ↓
handlePersistenceService.persistHandle() [FSA only]
    ↓
BUG-017 FIX: Navigate to intended workspace
    ├─ If projectPickerWorkspace !== 'ide' → navigate(`/${workspace}/$projectId`)
    └─ Else platform-aware default:
        ├─ canAccessIDE && storageType === 'fsa' → /ide/$projectId
        └─ else → /notes/$projectId
```

### 3.3 Navigation Code References

**Key Navigation Points:**

| File | Function | Purpose |
|------|----------|---------|
| `HubHomePage.tsx:156` | `handleProjectCreated()` | Post-creation navigation with workspace awareness |
| `HubHomePage.tsx:199` | `handleNewProject()` | FSA folder picker + navigation |
| `HubHomePage.tsx:279` | `handleOpenRecentProject()` | Recent project → first available workspace |
| `notes.lazy.tsx:126` | `useEffect` [notesProjects] | Auto-redirect to recent notes project |
| `ide.tsx:26-52` | `beforeLoad` | Platform guard for IDE access |
| `ide.tsx:141` | `handleBrowseProjects()` | Navigate to hub for project selection |

### 3.4 Findings: Navigation Flow

**Patterns:**

1. **Workspace Binding Filtering**: Projects filtered by `workspaceBindings` before navigation
2. **Intent Preservation**: BUG-017 FIX ensures user intent (workspace choice) is preserved after creation
3. **Fallback Navigation**: Platform-aware defaults when no explicit intent
4. **Graceful Degradation**: Mobile users redirected from IDE → Notes with toast notification

**Issues:**

- `notes.lazy.tsx` uses `useLiveQuery` and `useEffect` for redirect logic instead of loader-based approach
- Potential race condition in `NotesRedirect` if project query returns after component unmount
- No unified navigation service; scattered across HubHomePage and route components

---

## 4. Hydration & Lazy Loading

### 4.1 App Initialization Sequence

```
AppInitializer (useEffect)
    ├─ credentialVault.initialize()
    ├─ hydrateProjects() → loads Dexie → Zustand store
    ├─ migrateWorkspaceBindings() (one-time migration)
    ├─ registerServiceWorker()
    └─ fetchModels() for all providers
        ↓
    All routes now safe to query Zustand store
```

**File**: `src/presentation/components/common/AppInitializer.tsx` (123 lines)

### 4.2 Route Loader Hydration Pattern

**INF-03 FIX**: Added `waitForHydration()` to prevent race conditions

```typescript
// PROBLEM: Loader runs before hydrateProjects() completes
loader: async ({ params }) => {
  const record = await db.projects.get(projectId); // Returns null if timing issue
}

// SOLUTION: Wait for hydration first
loader: async ({ params }) => {
  await waitForHydration();  // Blocks until store hydrated
  const record = await db.projects.get(projectId);
}
```

### 4.3 Lazy Loading Implementation

**IDELayout Lazy Load** (`ide.$projectId.tsx:32-36`):

```typescript
const IDELayout = lazy(() =>
  import('@/presentation/components/layout/IDELayoutMain').then(m => ({
    default: m.IDELayout,
  }))
);

// Used with Suspense fallback
<Suspense fallback={<LoadingSpinner />}>
  <IDELayout />
</Suspense>
```

### 4.4 Findings: Hydration & Lazy Loading

**Patterns:**

1. **Store-to-DB Sync**: `hydrateProjects()` syncs Dexie to Zustand on app boot
2. **Hydration Subscribers**: Zustand `subscribe` pattern for hydration completion detection
3. **Code Splitting**: Heavy components (IDELayout) lazy-loaded with Suspense
4. **SSR Disabled**: IDE/Notes routes disabled SSR due to browser APIs

**Issues:**

- `AppInitializer` has complex parallel execution that may cause timing issues
- Lazy-loaded IDELayout has no error boundary at Suspense level
- No preload strategy for routes (potential for faster navigation)

---

## 5. Uncleaned Files

### 5.1 File: `src/routes/ide.tsx`

**Issue**: Long inline comments and BUG-FIX markers

```
Lines 1-15: Detailed file header with PHASE 1 CLEANUP notes
Lines 27-37: Console.log for platform detection (debug code)
Lines 39-48: BUG-007 FIX comment block (40+ lines)
Lines 139-145: handleBrowseProjects with inline comment
Total: ~60 lines of comments and debug code
```

**Evidence**:
```typescript
// BUG-007 FIX: Only block strictly if on /ide root.
// Child routes like /ide/$projectId handle their own redirection (e.g. to /notes/$projectId).
// This allows deep linking to work on mobile.
if (!platform.canAccessIDE && location.pathname === '/ide') {
  console.warn('[ide.tsx] Mobile/tablet/desktop-without-FSA detected on root /ide, redirecting to /hub');
```

**Recommendation**: Extract comments to separate documentation file, remove console.log after debugging complete

---

### 5.2 File: `src/routes/notes.lazy.tsx`

**Issue**: Excessive BUG-FIX comments throughout file

```
Lines 1-21: Extensive file header with TASK-2, BUG-FIX history
Lines 59-66: BUG-019, BUG-021 FIX comments
Lines 71-124: Complex project filtering with multiple BUG-FIX comments
Total: ~80 lines of historical fix comments
```

**Evidence**:
```typescript
// BUG-019 FIX: Move all hooks BEFORE any early return
// Violating Rules of Hooks caused "Rendered fewer hooks than expected" error

// BUG-021 FIX: Use useLocation for stable child route detection
// useMatch caused flickering/infinite redirect loops
```

**Recommendation**: Consolidate fix history to CHANGELOG.md, keep only essential inline comments

---

### 5.3 File: `src/routes/workspace/$projectId.tsx`

**Issue**: Deprecated route with duplicate logic

```
Status: Marked as deprecated with comment "Use /ide/$projectId instead"
Lines 41-77: getProjectWithRetry utility (duplicates waitForHydration)
Lines 83-99: beforeLoad with platform guard and project fetch
Lines 103-104: loader passes context
```

**Evidence**:
```typescript
/**
 * @fileoverview Project Workspace Route (Legacy)
 * @deprecated Use /ide/$projectId instead
 */
```

**Recommendation**: Add redirect from `/workspace/$projectId` to `/ide/$projectId` or remove route entirely

---

### 5.4 File: `src/presentation/components/project/ProjectCreationWizard.tsx`

**Issue**: Phase 1 detachment comment block and long file

```
Lines 7-14: Phase 1 DETACHMENT block comment (12 lines)
Total lines: 546 (exceeds 300 line threshold)
Complex multi-step wizard with extensive subcomponents
```

**Evidence**:
```typescript
/**
 * ═══════════════════════════════════════════════════════
 * ⚠️ PHASE 1 DETACHMENT
 * Feature: Multi-step Project Creation Wizard (513 lines)
 * Reason: Complex wizard with workspace bindings, agent selection, file setup
 * Re-attach in: Phase 2 (after Phase 1 gates pass)
 * ═══════════════════════════════════════════════════════
 */
```

**Recommendation**: Split wizard steps into separate files, remove Phase 1 detachment comment

---

## 6. Synthesis

The routing and navigation architecture in Project Alpha demonstrates a well-structured approach to handling cross-platform application routing with TanStack Router. The platform contract pattern provides a clean abstraction for device capability detection, and the route guard system effectively enforces platform restrictions (e.g., mobile users blocked from IDE). The hydration awareness in loaders (`waitForHydration`) is a critical fix for preventing race conditions between Zustand store initialization and route data loading.

However, several architectural inconsistencies and code cleanliness issues were identified. The most significant is the scattered navigation logic across `HubHomePage` and individual route components, which violates DRY principles and makes the navigation flow harder to maintain. The `NotesRedirect` component's use of `useLiveQuery` + `useEffect` for redirects is an anti-pattern that should be migrated to loader-based routing. Additionally, the excessive inline comments (BUG-FIX markers, Phase 1 detachment notes) throughout route files add unnecessary cognitive load and should be consolidated to external documentation.

For immediate action, the team should: (1) migrate `NotesRedirect` to a loader-based approach with query client, (2) extract navigation logic to a unified `NavigationService`, (3) consolidate fix comments to CHANGELOG, and (4) implement route preloading for faster user experience. The deprecated `/workspace/$projectId` route should either redirect to `/ide/$projectId` or be removed entirely to reduce confusion.

---

## 7. Files Investigated

| File | Lines | Purpose |
|------|-------|---------|
| `src/routes/__root.tsx` | 123 | Root layout with providers |
| `src/routes/notes.lazy.tsx` | 173 | Notes redirect + project selection |
| `src/routes/notes.$projectId.tsx` | 101 | Notes workspace with loader |
| `src/routes/ide.tsx` | 146 | IDE entry with platform guard |
| `src/routes/ide.$projectId.tsx` | 111 | IDE workspace with lazy loading |
| `src/routes/workspace/$projectId.tsx` | 139 | Legacy IDE route (deprecated) |
| `src/routes/index.tsx` | 12 | Hub index |
| `src/routes/hub.tsx` | 15 | Hub route |
| `src/routes/projects.tsx` | 15 | Projects list |
| `src/routes/settings.tsx` | 533 | Settings page |
| `src/routes/workspace/index.tsx` | 36 | Workspace index |
| `src/router.tsx` | 17 | Router factory |
| `src/infrastructure/filesystem/platform-contract.ts` | 342 | Platform detection |
| `src/infrastructure/filesystem/route-guards.ts` | 36 | Route guard utilities |
| `src/presentation/components/common/AppInitializer.tsx` | 123 | App initialization |
| `src/presentation/components/hub/HubHomePage.tsx` | 521 | Hub with navigation |
| `src/presentation/components/project/ProjectCreationWizard.tsx` | 546 | Project wizard |
| `src/infrastructure/persistence/stores/project/wait-for-hydration.ts` | 44 | Hydration utility |

---

## 8. Recommendations Summary

| Priority | Issue | Recommendation |
|----------|-------|----------------|
| P0 | Race condition in NotesRedirect | Migrate to loader-based query |
| P0 | Deprecated `/workspace` route | Add redirect or remove |
| P1 | Scattered navigation logic | Create NavigationService |
| P1 | Long inline comments | Consolidate to CHANGELOG |
| P2 | No route preloading | Implement TanStack Router preloading |
| P2 | Duplicate waitForHydration | Extract to shared middleware |
| P3 | Phase 1 detachment comment | Remove after Phase 2 |
| P3 | Console.log in production | Remove debug logging |

---

*Report generated by deep-scan-orchestrator*
*Investigation ID: ROUTING-NAV-01*
*Date: 2026-01-20*
