# Phase 3 Implementation Plan: Spike Workspace Mirroring

**Artifact ID:** hnd_phase3_20260122
**Artifact Type:** implementation-plan
**Story:** Phase 3 - Spike Workspace Mirroring
**Source Agent:** architect-ext
**Target Agent:** dev-ext (for execution)
**Created At:** 2026-01-22T09:00:00+07:00
**Status:** PENDING

---

## EXECUTIVE SUMMARY

**Context:**
- Phase 2 ✅ COMPLETED: Spike routes fixed with file-based routing
- Phase 3 🔜 PENDING: Spike has placeholder components, NOT full mirrors of IDE/Notes
- Goal: Complete spike infrastructure to test fundamental requirements

**Key Decisions:**
1. **Mirror Strategy**: Import from main app directly (preferred - less duplication)
2. **Routing Update**: `/notes/$projectId` → `/spike/notes/$projectId`, `/ide/$projectId` → `/spike/ide/$projectId`
3. **Scope**: IDE and Notes workspaces ONLY (defer agent/AI/RAG)
4. **TypeScript**: NO checks until all code done

**Estimated Duration**: 4-6 hours
**Success Criteria**: 8/8 (all must pass)

---

## REQUIREMENTS ANALYSIS

### User Requirements (MUST IMPLEMENT)

| # | Requirement | Priority | Notes |
|---|-------------|-----------|--------|
| 1 | Focus ONLY on IDE and Notes workspaces | P0 | Defer Knowledge, Study, Marketing |
| 2 | Defer agent/AI/RAG components | P0 | Wire later (not in scope) |
| 3 | NO TypeScript checks until all code done | P0 | Refactor during debugging |
| 4 | Copy + routing must be correct | P0 | All `Link` and `navigate()` calls updated |
| 5 | Type errors not focus | P1 | Refactor during debugging |
| 6 | Easily comment out to reflect back to main app | P1 | Toggle between spike/main |

### Architecture Requirements (from ADR-033)

| # | Requirement | ADR Reference | Implementation |
|---|-------------|----------------|-----------------|
| 1 | Platform Contract: Desktop=FSA, Others=IndexedDB | D1 | Use `getPlatformContract()` |
| 2 | State Management: Zustand (UI) + Dexie (persistence) | - | Use existing stores |
| 3 | Composite Keys: `[projectId+workspaceId]` | D6 | Use in all workspace-scoped state |
| 4 | Project ID Format: `proj_{uuid}` | - | Consistent naming |
| 5 | Entry Matrix: Desktop/non-desktop × new/returned users | - | Implement flow |
| 6 | Platform Guards: IDE desktop-only with toast | D13 | `beforeLoad` + redirect |

---

## CURRENT STATE ANALYSIS

### Spike Routes (Phase 2 - File-Based Routing)

| Route | File | Status | Notes |
|-------|-------|--------|-------|
| `/spike/` | `spike/index.tsx` | ✅ EXISTS | Simple navigation hub |
| `/spike/notes` | `spike/notes.tsx` | ✅ EXISTS | Partially implemented (imports main components) |
| `/spike/notes/$projectId` | `spike/notes.$projectId.tsx` | ✅ EXISTS | Partially implemented (imports main components) |
| `/spike/ide` | `spike/ide.tsx` | ✅ EXISTS | Partially implemented (imports main components) |
| `/spike/ide/$projectId` | `spike/ide.$projectId.tsx` | ✅ EXISTS | Partially implemented (imports main components) |
| `/spike/create` | `spike/create.tsx` | ⚠️ STUB | Uses deprecated spikeDB store (needs fix) |

### Main App Routes (Source of Truth)

| Route | File | Component | Status |
|-------|-------|-----------|--------|
| `/` | `index.tsx` | HubHomePage | ✅ Main entry |
| `/hub` | `hub.tsx` | HubHomePage | ✅ Hub page |
| `/notes` | `notes.lazy.tsx` | ProjectPickerDialog | ✅ Notes entry (FSA picker) |
| `/notes/$projectId` | `notes.$projectId.lazy.tsx` | NotesPage | ✅ Notes workspace |
| `/ide` | `ide.tsx` | FolderPickerDialog | ✅ IDE entry (desktop-only) |
| `/ide/$projectId` | `ide.$projectId.tsx` | IDELayout | ✅ IDE workspace |

### Components to Mirror

| Component | Location | Purpose | Current Spike Status |
|-----------|----------|---------|---------------------|
| **NotesPage** | `src/presentation/components/notes/NotesPage.tsx` | Main notes UI | ✅ Imported directly |
| **IDELayout** | `src/presentation/components/layout/IDELayoutMain.tsx` | Main IDE UI | ✅ Imported directly |
| **ProjectPickerDialog** | `src/presentation/components/hub/ProjectPickerDialog.tsx` | Project selection | ✅ Imported directly |
| **HubHomePage** | `src/presentation/components/hub/HubHomePage.tsx` | Hub + project creation | ❌ NOT IMPLEMENTED |

---

## IMPLEMENTATION PLAN

### Step 1: Analyze Main App Sources (30 min)

**Goal**: Understand FULL implementation of IDE + Notes workspaces

**Tasks**:
1.1 Read `src/routes/ide.tsx` - Main entry (desktop FSA, mobile redirect)
1.2 Read `src/routes/ide.$projectId.tsx` - Project loader + Monaco
1.3 Read `src/presentation/components/layout/IDELayout.tsx` - Full component
1.4 Read `src/infrastructure/persistence/stores/ide/` - State management
1.5 Read `src/routes/notes.lazy.tsx` - Main entry (desktop FSA, mobile redirect)
1.6 Read `src/routes/notes.$projectId.lazy.tsx` - Project loader + editor
1.7 Read `src/presentation/components/notes/NotesPage.tsx` - Full component
1.8 Read `src/infrastructure/persistence/stores/notes/` - State management
1.9 Find main app's project creation flow:
    - Read `src/presentation/components/hub/HubHomePage.tsx`
    - Read `src/routes/hub.tsx`
    - Trace project creation flow

**Output**: Complete understanding of main app implementation

**Success Criteria**:
- ✅ All main app routes read and documented
- ✅ All components imported understood
- ✅ State management patterns documented
- ✅ Project creation flow traced

---

### Step 2: Design Spike Structure (30 min)

**Goal**: Define spike architecture based on ADR-033 requirements

#### 2.1 Spike Directory Structure (CONFIRMED)

```
src/routes/spike/
├── index.tsx              → /spike (navigation hub, mirror of hub.tsx)
├── notes.tsx              → /spike/notes (notes workspace entry)
├── notes.$projectId.tsx     → /spike/notes/$projectId (project-specific)
├── ide.tsx                → /spike/ide (IDE workspace entry)
├── ide.$projectId.tsx       → /spike/ide/$projectId (project-specific)
└── create.tsx             → /spike/create (project creation)
```

#### 2.2 Components Strategy (DECISION: Import Directly)

**Decision**: Import from main app directly (preferred over copying)

**Rationale**:
- Less code duplication
- Easier to maintain (changes in main app automatically reflect in spike)
- Simpler to "comment out" to reflect back to main app

**Implementation Pattern**:
```typescript
// ✅ PREFERRED: Import directly
import { NotesPage } from '@/presentation/components/notes/NotesPage';
import { IDELayout } from '@/presentation/components/layout/IDELayoutMain';

// ❌ ALTERNATIVE: Create spike-specific copies (NOT recommended)
// Creates duplication, harder to maintain
```

**Toggle Strategy**:
```typescript
// In spike routes, add toggle flag
const USE_SPIKE_COMPONENTS = true; // Toggle to false to use main app

const Component = USE_SPIKE_COMPONENTS ? SpikeComponent : MainComponent;
```

#### 2.3 Routing Strategy (PATH UPDATES)

**Pattern**: Update all `Link` and `navigate()` calls from main app routes to spike routes

**Conversion Table**:
| Main App Route | Spike Route | Update Location |
|----------------|-------------|-----------------|
| `/` (hub) | `/spike` | All `Link to="/"` → `Link to="/spike"` |
| `/hub` | `/spike` | All `Link to="/hub"` → `Link to="/spike"` |
| `/notes/$projectId` | `/spike/notes/$projectId` | Update all params navigation |
| `/ide/$projectId` | `/spike/ide/$projectId` | Update all params navigation |
| `/hub?action=create-project` | `/spike/create` | Update create project flow |

**Implementation Tasks**:
- Update `navigate({ to: '/hub' })` → `navigate({ to: '/spike' })`
- Update `navigate({ to: '/notes/$projectId', params: { projectId } })` → `navigate({ to: '/spike/notes/$projectId', params: { projectId } })`
- Update `navigate({ to: '/ide/$projectId', params: { projectId } })` → `navigate({ to: '/spike/ide/$projectId', params: { projectId } })`

#### 2.4 State Management Approach (USE EXISTING STORES)

**Decision**: Use main app's Zustand + Dexie stores (no spike-specific stores)

**Rationale**:
- State is already scoped by `[projectId+workspaceId]` (ADR-033 D6)
- Spike and main app can share data during testing
- Simplifies development (no store duplication)

**Implementation**:
```typescript
// Use existing stores
import { useIDEStore } from '@/infrastructure/persistence/stores/ide/useIDEStore';
import { useNoteStore } from '@/lib/notes/note-store';
import { useProjectStore } from '@/infrastructure/persistence/stores/project/project-store';
```

**Note**: `spike/create.tsx` currently uses deprecated spikeDB store. Must replace with main app's `useProjectStore`.

#### 2.5 Entry Matrix Implementation (ADR-033 REQUIREMENTS)

**Decision Matrix**:

| Device Type | Storage Type | Has Project? | Entry Point |
|-------------|--------------|--------------|-------------|
| **Desktop** | FSA | YES | `/spike/notes/$projectId` or `/spike/ide/$projectId` |
| **Desktop** | FSA | NO | `/spike` (hub) → project picker |
| **Desktop** | IndexedDB (no FSA) | YES | `/spike/notes/$projectId` (IDE blocked) |
| **Desktop** | IndexedDB (no FSA) | NO | `/spike` (hub) → create project |
| **Mobile** | IndexedDB | YES | `/spike/notes/$projectId` (IDE blocked) |
| **Mobile** | IndexedDB | NO | `/spike` (hub) → create project |
| **Tablet** | IndexedDB | YES | `/spike/notes/$projectId` (IDE blocked) |
| **Tablet** | IndexedDB | NO | `/spike` (hub) → create project |

**Platform Guard Implementation**:
```typescript
// In spike/ide.tsx and spike/ide.$projectId.tsx
const platform = getPlatformContract();

if (!platform.canAccessIDE) {
  throw redirect({
    to: '/spike/notes/$projectId',
    params: { projectId },
    search: { reason: 'mobile-not-supported' }
  });
}
```

#### 2.6 Project Creation Flow (MAIN APP ANALYSIS REQUIRED)

**Tasks**:
- Analyze `HubHomePage.tsx` project creation implementation
- Analyze `ProjectPickerDialog.tsx` project selection
- Trace FSA folder selection flow
- Analyze project metadata storage (Dexie)

**Expected Flow**:
```
User clicks "Create Project" in Hub
    ↓
Show project creation form
    ↓
User enters name + selects FSA folder (desktop)
    ↓
Create project in Dexie (db.projects table)
    ↓
Create FSA handle persistence (db.fsaHandles table)
    ↓
Navigate to selected workspace (/spike/notes/$projectId or /spike/ide/$projectId)
```

---

### Step 3: Write Implementation Plan (1 hour)

**Output**: This document (`phase3-spike-mirroring-plan-2026-01-16.md`)

**Include**:
1. ✅ File-by-file copy plan
2. ✅ Routing path updates
3. ✅ Component strategy (import vs copy)
4. ✅ State management approach
5. ✅ Entry matrix implementation
6. ✅ Success criteria
7. ✅ Defer agent/AI/RAG components (NOT to implement)
8. ✅ NO TypeScript checks directive
9. ✅ All requirements from architecture.md addressed

---

### Step 4: Implementation Details (For dev-ext)

#### 4.1 Update `/spike/index.tsx` (Spike Hub)

**Current**: Simple navigation hub with links
**Target**: Full mirror of `/hub.tsx` with HubHomePage component

**Changes Required**:
```typescript
// BEFORE (current)
<Link to="/spike/notes" className="block">Notes Workspace</Link>
<Link to="/spike/ide" className="block">IDE Workspace</Link>
<Link to="/spike/create" className="block">Create Project</Link>

// AFTER (mirror of hub.tsx)
import { HubHomePage } from '@/presentation/components/hub/HubHomePage';
import { MainLayout } from '@/presentation/components/layout/MainLayout';

export const Route = createFileRoute('/spike/')({
  component: () => (
    <ErrorBoundary>
      <MainLayout>
        <HubHomePage />
      </MainLayout>
    </ErrorBoundary>
  ),
});
```

**Routing Updates in HubHomePage**:
- Update all `Link to="/hub"` → `Link to="/spike"`
- Update all `Link to="/notes/$projectId"` → `Link to="/spike/notes/$projectId"`
- Update all `Link to="/ide/$projectId"` → `Link to="/spike/ide/$projectId"`
- Update project creation flow to navigate to `/spike/create`

#### 4.2 Update `/spike/notes.tsx` (Already Partially Implemented)

**Current**: Imports NotesPage and shows project picker
**Target**: Ensure all routing uses spike paths

**Changes Required**:
```typescript
// Verify these navigations
navigate({ to: '/spike' });  // Should be spike hub
navigate({ to: '/spike/create', search: { action: 'create-project', workspace: 'notes' }});
```

**No component changes needed** (already imports from main app).

#### 4.3 Update `/spike/notes.$projectId.tsx` (Already Partially Implemented)

**Current**: Loads project and shows NotesPage
**Target**: Ensure all routing uses spike paths

**Changes Required**:
- Verify `toast` notification uses spike paths
- Verify IDE store state initialization

**No component changes needed** (already imports from main app).

#### 4.4 Update `/spike/ide.tsx` (Already Partially Implemented)

**Current**: Platform guard + folder picker + empty state
**Target**: Ensure all routing uses spike paths

**Changes Required**:
```typescript
// Verify these navigations
navigate({ to: '/spike' });  // Should be spike hub
navigate({ to: '/spike/ide/$projectId', params: { projectId } });  // Spike path
```

**Platform Guard**: Already correct (mobile redirects to `/spike`).

**No component changes needed** (already imports from main app).

#### 4.5 Update `/spike/ide.$projectId.tsx` (Already Partially Implemented)

**Current**: Loads project + platform guard + shows IDELayout
**Target**: Ensure all routing uses spike paths

**Changes Required**:
- Verify mobile redirect uses spike paths (`/spike/notes/$projectId`)
- Verify project loading uses Dexie directly (✅ ALREADY CORRECT)

**No component changes needed** (already imports from main app).

#### 4.6 Update `/spike/create.tsx` (Major Refactor Required)

**Current**: Uses deprecated spikeDB store
**Target**: Use main app's project creation flow

**Changes Required**:

**Option A**: Mirror main app's project creation (RECOMMENDED)
- Analyze `HubHomePage.tsx` project creation UI
- Copy project creation form component
- Use `useProjectStore` (main app store) instead of `useSpikeProjectStore`
- Ensure FSA folder selection works on desktop
- Ensure IndexedDB project creation works on mobile

**Option B**: Simplified stub (NOT RECOMMENDED for testing)
- Keep existing form but use main app store
- Use `useProjectStore` instead of deprecated spike store
- Remove spikeDB references

**Implementation (Option A)**:
```typescript
// BEFORE (current - deprecated)
import { useSpikeProjectStore } from '../routes/-spike/stores/project-store';

// AFTER (recommended - use main app store)
import { useProjectStore } from '@/infrastructure/persistence/stores/project/project-store';
import { getPlatformContract } from '@/infrastructure/filesystem/platform-contract';

function ProjectCreationSpike() {
  const { createProject, getAllProjects } = useProjectStore();
  const platform = getPlatformContract();

  // Use main app's project creation flow
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const projectId = await createProject({
        name,
        folderPath: platform.canAccessFSA ? folderPath : undefined,
        storageType: platform.storageType,  // Auto-detect
        autoSync: true,
        workspaceBindings: {
          ide: true,
          knowledge: true,
          notes: true,
          study: true,
        },
      });

      // Navigate to workspace
      navigate({ to: '/spike/notes/$projectId', params: { projectId } });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  // ... rest of component
}
```

**Platform-Specific Behavior**:
- **Desktop with FSA**: Show folder picker + path input
- **Desktop without FSA**: Hide folder picker (IndexedDB only)
- **Mobile**: Hide folder picker (IndexedDB only)

---

### Step 5: Routing Path Updates (Comprehensive List)

**Task**: Find and update all routing calls in spike routes

**Search Pattern**:
```bash
grep -r "navigate.*to.*['\"]/" src/routes/spike/
grep -r "Link.*to=["\']" src/routes/spike/
```

**Update List**:

| File | Line | Before | After |
|------|------|--------|-------|
| `spike/index.tsx` | 24-26 | `/spike/notes`, `/spike/ide`, `/spike/create` | Already correct ✅ |
| `spike/notes.tsx` | 60 | `navigate({ to: '/' })` | `navigate({ to: '/spike' })` |
| `spike/notes.tsx` | 66 | `navigate({ to: '/spike/create', search: {...} })` | Already correct ✅ |
| `spike/ide.tsx` | 56 | `throw redirect({ to: '/spike' })` | Already correct ✅ |
| `spike/ide.tsx` | 175 | `navigate({ to: '/spike', search: {...} })` | Already correct ✅ |
| `spike/ide.$projectId.tsx` | 58 | `throw redirect({ to: '/spike/notes/$projectId', ... })` | Already correct ✅ |

**Total Changes**: 1 route path update needed in `spike/notes.tsx`

---

### Step 6: Defer Agent/AI/RAG Components (NOT IN SCOPE)

**Components to Exclude**:
- ❌ `ChatPanel` - Agent chat interface
- ❌ `AISlashCommand` - AI slash commands
- ❌ `AIPromptDialog` - AI prompt dialog
- ❌ `AITransformMenu` - AI transform menu
- ❌ RAG search components
- ❌ Agent tool execution

**Rationale**:
- User requirement: "Defer agent/AI/RAG components (wire later)"
- Focus on IDE + Notes workspace mirroring only
- Reduce complexity for Phase 3

**Implementation**:
- Spike routes should import main app components as-is
- If AI/agent components are imported by main app components, they will be included
- But no NEW agent/AI/RAG features should be added to spike
- Main app component changes should NOT be mirrored to spike

**Example**:
```typescript
// ✅ OK: Import main app component (may include AI features internally)
import { NotesPage } from '@/presentation/components/notes/NotesPage';

// ❌ NOT OK: Add NEW AI feature to spike
// const aiAssistant = new AIAssistant();  // Don't add this
```

---

### Step 7: Toggle Strategy (Easily Comment Out)

**Goal**: Allow easy switch between spike and main app for testing

**Implementation Options**:

**Option A**: Toggle flag in each route (RECOMMENDED)
```typescript
// In each spike route file
const USE_SPIKE_ROUTE = true; // Toggle to false to use main app

export const Route = USE_SPIKE_ROUTE
  ? createFileRoute('/spike/notes')({ component: SpikeNotesWorkspace })
  : createFileRoute('/spike/notes')({ component: MainAppNotesWorkspace });
```

**Option B**: Environment variable (NOT RECOMMENDED)
```typescript
// Requires build process changes
const USE_SPIKE = import.meta.env.VITE_USE_SPIKE === 'true';
```

**Option C**: Router-level toggle (SIMPLEST)
```typescript
// In src/router.tsx
const USE_SPIKE_ROUTES = true; // Toggle this

export const getRouter = () => {
  const router = createRouter({
    routeTree: USE_SPIKE_ROUTES ? spikeRouteTree : mainRouteTree,
  });
  return router;
};
```

**Recommendation**: Use Option C (router-level toggle) for simplicity.

**Implementation**:
```typescript
// src/router.tsx
// Add toggle at top of file
const USE_SPIKE_ROUTES = true; // Toggle to false to use main app

// Comment/uncomment import
// import { routeTree as mainRouteTree } from './routeTree.gen';
import { routeTree as spikeRouteTree } from './routeTree.gen';

export const getRouter = () => {
  const router = createRouter({
    routeTree: USE_SPIKE_ROUTES ? spikeRouteTree : mainRouteTree,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    context: { ... },
  });
  return router;
};
```

**Note**: This requires two route trees to be generated (main and spike). TanStack Router's file-based routing makes this complex. **Alternative**: Use `navigate()` calls to redirect between spike and main routes.

**Simpler Toggle Strategy**:
```typescript
// In MainLayout component (shared by both)
const USE_SPIKE = false; // Toggle to redirect to spike

// In MainLayout useEffect
useEffect(() => {
  if (USE_SPIKE && location.pathname.startsWith('/hub')) {
    navigate({ to: '/spike', replace: true });
  }
}, [USE_SPIKE, location.pathname]);
```

**Recommendation**: Skip toggle for Phase 3. Use explicit navigation during testing.

---

### Step 8: NO TypeScript Checks Directive

**Requirement**: "NO TypeScript checks until all code done"

**Implementation**:
```typescript
// At top of each spike route file
// @ts-nocheck - Temporarily disable TypeScript checks during Phase 3

// Or use ts-ignore for specific lines
// @ts-ignore

// Or add to tsconfig.json
{
  "compilerOptions": {
    // "noUncheckedIndexedAccess": false,  // Disable strict checks
  }
}
```

**Recommendation**: Add `// @ts-nocheck` to top of each spike route file.

**After Phase 3**:
- Remove `// @ts-nocheck` comments
- Run `pnpm tsc --noEmit`
- Fix TypeScript errors one by one
- Test with strict mode enabled

---

## SUCCESS CRITERIA

| # | Criteria | Validation Method | Pass/Fail |
|---|-----------|------------------|------------|
| 1 | ✅ Plan covers IDE workspace mirroring (entry + project + component) | Review plan sections 4.4-4.5 | |
| 2 | ✅ Plan covers Notes workspace mirroring (entry + project + component) | Review plan sections 4.2-4.3 | |
| 3 | ✅ Plan covers project creation | Review plan section 4.6 | |
| 4 | ✅ Routing paths clearly documented | Review plan section 5 | |
| 5 | ✅ Component strategy clearly defined (import vs copy) | Review plan section 2.2 | |
| 6 | ✅ Entry matrix implementation documented | Review plan section 2.5 | |
| 7 | ✅ Agent/AI/RAG components explicitly DEFERRED (not in scope) | Review plan section 6 | |
| 8 | ✅ NO TypeScript checks directive included | Review plan section 8 | |
| 9 | ✅ All requirements from architecture.md addressed | Review plan sections 2-3 | |

**Completion**: All 9/9 criteria must be PASS before implementation starts.

---

## DEPENDENCIES

**Internal Dependencies**:
- Phase 2 ✅ COMPLETED (file-based routing fixed)
- ADR-033 ✅ APPROVED (platform contract, storage decisions)
- ADR-034 ✅ APPROVED (workspace access remediation)

**External Dependencies**:
- TanStack Router v1.147.1 (already installed)
- Dexie.js (already installed)
- Zustand v5 (already installed)

**Blocking Issues**:
- None identified

---

## RISK ASSESSMENT

| Risk | Probability | Impact | Mitigation |
|------|-------------|---------|------------|
| **Spike routes share state with main app** | HIGH | MEDIUM | Use composite keys `[projectId+workspaceId]` (ADR-033 D6) |
| **TypeScript errors block implementation** | MEDIUM | HIGH | Add `// @ts-nocheck` directive, fix later |
| **Routing path updates missed** | MEDIUM | MEDIUM | Comprehensive grep search (section 5) |
| **Platform guard logic incorrect** | LOW | HIGH | Test on desktop + mobile browsers |
| **Project creation flow complex** | MEDIUM | MEDIUM | Analyze main app implementation first (section 4.6) |

**Overall Risk**: MEDIUM (manageable with careful planning and testing)

---

## TESTING STRATEGY

### Unit Testing (Not Required for Phase 3)

**Decision**: Defer unit testing to Phase 4 (after implementation complete)

**Rationale**:
- Focus on mirroring main app functionality first
- Main app already has tests
- Spike is for integration testing, not unit testing

### Integration Testing (Phase 4)

**Test Cases** (to be implemented after Phase 3):

1. **Entry Matrix Testing**
   - Desktop with FSA: Create project → open IDE → verify works
   - Desktop with FSA: Create project → open Notes → verify works
   - Desktop without FSA: Create project → open Notes → verify IDE blocked
   - Mobile: Create project → open Notes → verify IDE blocked with toast

2. **Routing Testing**
   - Navigate `/spike` → verify hub loads
   - Navigate `/spike/notes` → verify project picker shows (desktop)
   - Navigate `/spike/notes/$projectId` → verify NotesPage loads
   - Navigate `/spike/ide` → verify folder picker shows (desktop)
   - Navigate `/spike/ide/$projectId` → verify IDELayout loads

3. **Project Creation Testing**
   - Desktop with FSA: Create project → verify folder picker works
   - Desktop without FSA: Create project → verify IndexedDB used
   - Mobile: Create project → verify IndexedDB used
   - Verify project appears in project list
   - Verify project ID format `proj_{uuid}`

4. **Platform Guard Testing**
   - Mobile: Navigate `/spike/ide` → verify redirect to `/spike`
   - Mobile: Navigate `/spike/ide/$projectId` → verify redirect to `/spike/notes/$projectId` with toast
   - Desktop with FSA: Navigate `/spike/ide` → verify folder picker shows
   - Desktop without FSA: Navigate `/spike/ide` → verify redirect to `/spike`

5. **State Management Testing**
   - Create project → verify stored in Dexie
   - Open Notes → verify project loads
   - Open IDE → verify project loads
   - Switch workspaces → verify state scoped correctly
   - Verify composite keys work `[projectId+workspaceId]`

---

## POST-IMPLEMENTATION TASKS (Phase 4)

**After Phase 3 implementation complete**:

1. **Remove TypeScript disable directive**
   - Remove `// @ts-nocheck` comments
   - Run `pnpm tsc --noEmit`
   - Fix TypeScript errors one by one

2. **Add error boundaries**
   - Add `<ErrorBoundary>` to all spike routes (if not already present)
   - Test error handling

3. **Add logging**
   - Add console.log statements for debugging
   - Test on desktop + mobile

4. **Integration testing**
   - Execute test cases (section 9)
   - Fix issues found

5. **Performance testing**
   - Measure page load times
   - Measure state hydration times
   - Optimize if needed

6. **Documentation**
   - Update architecture.md with spike implementation notes
   - Update ADR-033 with lessons learned
   - Create Phase 3 completion report

---

## CONCLUSION

**Phase 3 Summary**:
- Mirror IDE + Notes workspaces from main app to spike
- Use import strategy (less duplication)
- Update routing paths from main app to spike
- Implement entry matrix (platform-specific behavior)
- Defer agent/AI/RAG components (not in scope)
- NO TypeScript checks until all code done

**Expected Outcome**:
- Spike routes fully functional mirrors of main app
- Testing environment ready for fundamental requirement validation
- Easy to toggle between spike and main app for comparison

**Next Phase**: Phase 4 - Integration testing + TypeScript error fixes

---

**End of Phase 3 Implementation Plan**
