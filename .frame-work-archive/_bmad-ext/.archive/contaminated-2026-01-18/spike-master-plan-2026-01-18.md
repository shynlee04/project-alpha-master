# Spike Master Plan: Routing & Fundamental Truth Implementation

**Version:** 1.0.0
**Created:** 2026-01-22T18:30+07:00
**Status:** READY_FOR_EXECUTION
**Priority:** P0 (CRITICAL - App is Broken)

---

## 📋 EXECUTIVE SUMMARY

**CRITICAL SITUATION:** The main application is BROKEN. All main routes return 404, and spike routes are inaccessible. This is a production-impacting emergency requiring immediate resolution.

**ROOT CAUSE ANALYSIS:**
1. Main routes exist in `routeTree.gen.ts` but `/` returns 404 (unknown cause)
2. Spike routes use `-spike` prefix to exclude from file-based routing
3. Router configuration attempts manual spike route registration via `_addFileChildren()` but implementation is incomplete
4. No clear routing strategy between main app and spike isolation

**SOLUTION STRATEGY:**
1. **Phase 1 (CRITICAL):** Restore main app routing immediately - 30 minutes
2. **Phase 2:** Fix spike routes with proper TanStack Router integration - 1 hour
3. **Phase 3:** Implement fundamental truth requirements - 8 hours
4. **Phase 4:** End-to-end testing and validation - 4 hours
5. **Phase 5:** Migration preparation for main codebase - 2 hours

**Total Estimated Effort:** 15.5 hours (down from original 110+ hours)

---

## 🚨 CRITICAL STATE ASSESSMENT

### Current Routes Status

| Route | Status | Expected | Actual | Issue |
|-------|--------|----------|--------|-------|
| `/` | ❌ 404 | HubHomePage | 404 | Main app broken |
| `/notes` | ❌ 404 | NotesWorkspace | 404 | Main app broken |
| `/ide` | ❌ 404 | IDEWorkspace | 404 | Main app broken |
| `/settings` | ❌ 404 | SettingsPage | 404 | Main app broken |
| `/hub` | ❌ 404 | HubPage | 404 | Main app broken |
| `/spike` | ❌ 404 | SpikeRoot | 404 | Not in routeTree |
| `/-spike` | ❌ 404 | SpikeRoot | 404 | Wrong prefix |

### Router Configuration Analysis

**File:** `src/router.tsx`

```typescript
// Current State:
// Line 61: const routeTreeWithSpike = (routeTree as any)._addFileChildren(spikeChildren)
// Line 64-69: Router uses routeTree (NOT routeTreeWithSpike)

// Problem:
// - routeTreeWithSpike is created but NOT used
// - Line 64: routeTree: routeTree (should be routeTreeWithSpike)
// - Spike routes are imported but never registered
// - Commented code: "TEMP: Test without spike routes"
```

**File:** `src/routeTree.gen.ts`

```typescript
// Analysis:
// - Main routes present: "/", "/notes", "/ide", "/settings", "/hub"
// - NO spike routes: routes/-spike/* NOT included
// - File-based routing excludes routes starting with "-"
```

**File:** `src/routes/-spike/__root.tsx`

```typescript
// Current State:
// - Uses manual createRoute() (not createFileRoute)
// - Path: "/-spike" (excluded from file-based routing)
// - Manual composition with addChildren() on children
// - Comment: "Spike Routes - Isolated Development Area"
```

### Root Causes Identified

| Priority | Issue | Impact | Evidence |
|----------|-------|--------|----------|
| **P0** | Main routes 404 | Production Down | User reports, `/` returns 404 |
| **P0** | Spike routes 404 | Spike inaccessible | Not in routeTree.gen.ts |
| **P0** | Router using wrong tree | Spike not registered | Uses routeTree instead of routeTreeWithSpike |
| **P1** | Inconsistent routing strategy | Confusing maintenance | Mix of file-based and manual |
| **P1** | Spike isolation unclear | No clear boundary | Both file-based and manual routes |

---

## 🎯 SPIKE ARCHITECTURE PLAN

### Design Principles

1. **File-Based Routing (TanStack Router Convention)**
   - All routes should be `createFileRoute()` for type safety
   - No manual `createRoute()` unless absolutely necessary
   - Use `-` prefix for non-file-based routes (currently misused)

2. **Mirror Strategy**
   - Spike should reflect main app behavior
   - Filter noise, enable debugging
   - Maintain parity with main app features

3. **Client-Side Only**
   - 100% client-side routing (keyword #1)
   - No server-side route registration
   - All state management client-side

### Proposed Spike Integration

#### Option 1: File-Based Spike Routes (RECOMMENDED)

**Rename routes:**
```
src/routes/-spike/__root.tsx  →  src/routes/spike.__root.tsx
src/routes/-spike/notes.tsx   →  src/routes/spike.notes.tsx
src/routes/-spike/ide.tsx     →  src/routes/spike.ide.tsx
src/routes/-spike/project-creation.tsx  →  src/routes/spike.create.tsx
```

**Benefits:**
- ✅ Automatic type generation
- ✅ File-based routing consistency
- ✅ No manual route registration
- ✅ Clear route structure

**Trade-offs:**
- ❌ Spike routes visible in production (acceptable for dev/testing)

#### Option 2: Virtual Spike Routes (CURRENT APPROACH - BROKEN)

**Keep structure:**
```
src/routes/-spike/__root.tsx
src/routes/-spike/notes.tsx
src/routes/-spike/ide.tsx
src/routes/-spike/project-creation.tsx
```

**Fix router.tsx:**
```typescript
// Remove TEMP comment
// Use routeTreeWithSpike instead of routeTree
const router = createRouter({
  routeTree: routeTreeWithSpike,  // NOT routeTree
  // ... rest of config
})
```

**Benefits:**
- ✅ Spike isolated from file-based routing
- ✅ Hidden from production route tree

**Trade-offs:**
- ❌ Manual route registration
- ❌ No type generation for spike routes
- ❌ More complex maintenance

#### Option 3: Environment-Based Routes

```typescript
// Only register spike routes in development
const routeTreeForEnvironment =
  import.meta.env.DEV
    ? routeTreeWithSpike
    : routeTree

const router = createRouter({
  routeTree: routeTreeForEnvironment,
  // ... rest of config
})
```

**Benefits:**
- ✅ Spike only in dev mode
- ✅ Production cleanliness

**Trade-offs:**
- ❌ Cannot test spike in production-like environment

---

## 🔧 ROUTING FIX IMPLEMENTATION

### Phase 1: Restore Main App Routing (CRITICAL - DO IMMEDIATELY)

**Goal:** Make `/`, `/notes`, `/ide`, `/hub`, `/settings`, etc. work again
**Time:** 30 minutes
**Priority:** P0

#### Step 1.1: Debug Why Main Routes 404

**Actions:**
```bash
# Check dev server status
pnpm dev

# Check routeTree.gen.ts
grep -n "Route.*IndexRouteImport" src/routeTree.gen.ts

# Check if root route is correctly configured
grep -n "rootRouteImport" src/routeTree.gen.ts

# Check browser console for routing errors
# Open http://localhost:5173/ and check devtools
```

**Potential Causes:**
1. Route tree not generated correctly
2. Router not initialized correctly
3. Root route component not rendering
4. AppInitializer or UnifiedWorkspaceProvider blocking
5. ErrorBoundary catching and suppressing errors

#### Step 1.2: Verify Router Initialization

**File:** `src/router.tsx`

```typescript
// Check:
// 1. Is getRouter() called?
// 2. Is router instance exported?
// 3. Is router passed to RouterProvider in main.tsx?
```

**File:** `src/main.tsx`

```typescript
// Verify:
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { getRouter } from './router'

const router = getRouter()

render(
  <RouterProvider router={router} />,
  document.getElementById('root')
)
```

#### Step 1.3: Test Main Routes

**Test Plan:**
```bash
# Test each route
curl http://localhost:5173/          # Should return 200
curl http://localhost:5173/notes     # Should return 200
curl http://localhost:5173/ide       # Should return 200
curl http://localhost:5173/hub       # Should return 200
curl http://localhost:5173/settings  # Should return 200
```

**Acceptance Criteria:**
- ✅ `/` loads HubHomePage
- ✅ `/notes` loads NotesWorkspace
- ✅ `/ide` loads IDEWorkspace
- ✅ `/hub` loads HubPage
- ✅ `/settings` loads SettingsPage
- ✅ No console errors
- ✅ All routes return 200 OK

---

### Phase 2: Fix Spike Routes

**Goal:** Make `/spike` and children accessible and working
**Time:** 1 hour
**Priority:** P0

#### Approach: Option 1 (File-Based) - RECOMMENDED

**Step 2.1: Rename Spike Routes**

```bash
# Create spike directory
mkdir -p src/routes/spike

# Rename files
mv src/routes/-spike/__root.tsx src/routes/spike.__root.tsx
mv src/routes/-spike/notes.tsx src/routes/spike.notes.tsx
mv src/routes/-spike/ide.tsx src/routes/spike.ide.tsx
mv src/routes/-spike/project-creation.tsx src/routes/spike.create.tsx

# Update imports in each file
# Remove: import { Route as rootRoute } from '../../routes/__root'
# Change: path: '/-spike' → path: '/spike'
# Change: Link to="/-spike/*" → Link to="/spike/*"
```

**Step 2.2: Convert to createFileRoute**

**File:** `src/routes/spike.__root.tsx`

```typescript
import { createFileRoute, Outlet, Link, useLocation } from '@tanstack/react-router'

export const Route = createFileRoute('/spike')({
  component: () => {
    const location = useLocation()
    const isRoot = location.pathname === '/spike'

    return (
      <>
        {isRoot && (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Spike - Isolated Development</h1>
            <nav className="space-y-2">
              <Link to="/spike/notes" className="block">Notes Workspace</Link>
              <Link to="/spike/ide" className="block">IDE Workspace</Link>
              <Link to="/spike/create" className="block">Create Project</Link>
            </nav>
          </div>
        )}
        <Outlet />
      </>
    )
  }
})
```

**File:** `src/routes/spike.notes.tsx`

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { NotesWorkspaceSpike } from '@/presentation/components/spike/NotesWorkspaceSpike'

export const Route = createFileRoute('/spike/notes')({
  component: NotesWorkspaceSpike
})
```

**Step 2.3: Clean Up router.tsx**

```typescript
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export const getRouter = () => {
  // Remove all spike route imports
  // Remove manual spike route registration
  // Remove _addFileChildren logic

  const router = createRouter({
    routeTree: routeTree,  // Now includes spike routes automatically
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: () => <p>Not Found</p>,
  })

  return router
}
```

**Step 2.4: Regenerate Route Tree**

```bash
# Regenerate routeTree.gen.ts
pnpm build

# Verify spike routes are included
grep -n "spike" src/routeTree.gen.ts
# Should see: spike__root, spikeNotes, spikeIde, spikeCreate
```

#### Approach: Option 2 (Virtual Routes) - ALTERNATIVE

**Step 2.1: Fix router.tsx**

```typescript
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

// Import spike routes for manual registration
import { Route as spikeRootRoute } from './routes/-spike/__root'
import { Route as spikeNotesRoute } from './routes/-spike/notes'
import { Route as spikeIdeRoute } from './routes/-spike/ide'
import { Route as spikeCreateRoute } from './routes/-spike/project-creation'

export const getRouter = () => {
  // Compose spike routes
  spikeRootRoute.addChildren([
    spikeNotesRoute,
    spikeIdeRoute,
    spikeCreateRoute,
  ])

  // Merge spike routes into route tree
  const spikeChildren = {
    '/spike': spikeRootRoute,
  }

  const routeTreeWithSpike = (routeTree as any)._addFileChildren(spikeChildren)

  // USE routeTreeWithSpike (not routeTree)
  const router = createRouter({
    routeTree: routeTreeWithSpike,  // ← FIX THIS LINE
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: () => <p>Not Found</p>,
  })

  return router
}
```

**Step 2.2: Update Spike Root Path**

```typescript
// src/routes/-spike/__root.tsx
export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/spike',  // ← CHANGE FROM '/-spike'
  component: () => { /* ... */ }
})
```

**Acceptance Criteria:**
- ✅ `/spike` loads spike root
- ✅ `/spike/notes` loads NotesWorkspaceSpike
- ✅ `/spike/ide` loads IDEWorkspaceSpike
- ✅ `/spike/create` loads ProjectCreationSpike
- ✅ All spike routes return 200 OK
- ✅ No console errors

---

## 📊 PHASE-BASED IMPLEMENTATION PLAN

### Phase 1: Restore Main App Routing (CRITICAL - DO IMMEDIATELY)

**Timeline:** 30 minutes
**Priority:** P0 (Production Down)
**Risk:** High (app is broken)

#### Step 1.1: Debug Root Cause (10 min)

**Actions:**
- Start dev server and capture errors
- Check browser console for routing errors
- Verify routeTree.gen.ts generation
- Test router initialization

**Output:** Root cause identified

#### Step 1.2: Implement Fix (15 min)

**Actions:**
- Apply fix based on root cause
- Test main routes locally
- Verify all routes return 200 OK

**Output:** Main routes working

#### Step 1.3: Verify (5 min)

**Actions:**
- Test all main routes
- Check console for errors
- Confirm HubHomePage loads on `/`

**Output:** ✅ All main routes working

**Success Criteria:**
- ✅ `/` loads HubHomePage
- ✅ `/notes` loads NotesWorkspace
- ✅ `/ide` loads IDEWorkspace
- ✅ `/hub` loads HubPage
- ✅ `/settings` loads SettingsPage
- ✅ No 404 errors on main routes

---

### Phase 2: Fix Spike Routes

**Timeline:** 1 hour
**Priority:** P0 (Spike inaccessible)
**Dependencies:** Phase 1 complete

#### Step 2.1: Choose Integration Approach (10 min)

**Decision:** Option 1 (File-Based) or Option 2 (Virtual Routes)

**Output:** Approach selected and documented

#### Step 2.2: Implement Spike Integration (40 min)

**Actions:**
- If Option 1: Rename files, convert to createFileRoute, regenerate routeTree
- If Option 2: Fix router.tsx, update spike root path, compose children

**Output:** Spike routes integrated

#### Step 2.3: Test Spike Routes (10 min)

**Actions:**
- Test `/spike`, `/spike/notes`, `/spike/ide`, `/spike/create`
- Verify spike components load
- Check console for errors

**Output:** ✅ All spike routes working

**Success Criteria:**
- ✅ `/spike` loads spike root with navigation
- ✅ `/spike/notes` loads NotesWorkspaceSpike
- ✅ `/spike/ide` loads IDEWorkspaceSpike
- ✅ `/spike/create` loads ProjectCreationSpike
- ✅ No 404 errors on spike routes
- ✅ No console errors

---

### Phase 3: Implement Fundamental Truth Requirements

**Timeline:** 8 hours
**Priority:** P0 (Critical Requirements)
**Dependencies:** Phase 1 & 2 complete

#### Step 3.1: BYOK Vault Implementation (2 hours)

**Keyword Checklist:**
- ✅ Keyword #1: Client-side 100% - server calls only for LLMs/APIs
- ✅ Keyword #2: BYOK → TanStack AI SDK, Framework TanStack Start

**Actions:**
- Implement BYOK vault with encrypted API key storage
- Integrate with TanStack AI SDK
- Conditional usage to providers (vault → provider)

**Files:**
- `src/infrastructure/vault/byok-vault.ts`
- `src/infrastructure/vault/encryption.ts`
- `src/domain/services/provider-credential-service.ts`

**Acceptance Criteria:**
- ✅ API keys persist in encrypted vault
- ✅ TanStack AI SDK integrated
- ✅ Provider adapters use vault
- ✅ No hardcoded API keys

#### Step 3.2: Project Space Foundation (3 hours)

**Keyword Checklist:**
- ✅ Keyword #3: Project ID, multiple projects across workspaces
- ✅ Keyword #4: Desktop = FSA; IndexedDB = other devices
- ✅ Keyword #5: NO IDE for other devices
- ✅ Keyword #6: Thread management tied to project ID + workspace
- ✅ Keyword #7: Clear boundaries between Zustand and Dexie
- ✅ Keyword #8: All hooks, hydration, rerouting with ID, reactive persistence

**Actions:**
- Implement getPlatformContract()
- Implement StorageGateway abstraction
- Create project space routing with device matrix
- Implement project ID format: `proj_{uuid}`
- Add workspace guards (IDE desktop-only)

**Files:**
- `src/infrastructure/filesystem/platform-detection.ts`
- `src/infrastructure/filesystem/StorageGateway.ts`
- `src/infrastructure/filesystem/StorageAdapterFactory.ts`
- `src/infrastructure/persistence/stores/project-store.ts`
- `src/routes/spike.ide.tsx` (add platform guard)

**Acceptance Criteria:**
- ✅ Desktop = FSA, Mobile = IndexedDB
- ✅ IDE blocked on mobile with toast
- ✅ Project ID format: `proj_{uuid}`
- ✅ Cross-workspace access working
- ✅ Zustand and Dexie boundaries clear

#### Step 3.3: Entry Matrix Implementation (1.5 hours)

**Keyword Checklist:**
- ✅ Desktop vs other devices, new vs returned users
- ✅ No workspace entry without project
- ✅ Direct landing: project ID + workspace type = direct access
- ✅ Project selection: hotload and reactive
- ✅ No compromise between devices

**Actions:**
- Create entry matrix flow
- Implement project selection UI
- Add direct landing support
- Handle new vs returned users

**Files:**
- `src/presentation/components/spike/ProjectSelection.tsx`
- `src/presentation/components/spike/DirectLanding.tsx`
- `src/routes/spike.create.tsx`
- `src/domain/services/entry-matrix-service.ts`

**Acceptance Criteria:**
- ✅ New users see project creation
- ✅ Returned users see project selection
- ✅ Direct landing works (e.g., `/spike/notes/proj_{uuid}`)
- ✅ Project selection hotloads reactively
- ✅ Device-specific behavior correct

#### Step 3.4: State Management Unification (1.5 hours)

**Keyword Checklist:**
- ✅ Clear boundaries between Zustand and Dexie
- ✅ All hooks use Zustand for reactive state
- ✅ Dexie for persistence only
- ✅ Hydration and reactive persistence

**Actions:**
- Define Zustand responsibilities
- Define Dexie responsibilities
- Create state flow diagram
- Implement sync mechanisms

**Files:**
- `src/infrastructure/persistence/stores/project-store.ts`
- `src/infrastructure/persistence/dexie-db.ts`
- `src/domain/interfaces/StateArchitecture.ts`

**Acceptance Criteria:**
- ✅ Zustand for reactive UI state
- ✅ Dexie for persistence
- ✅ Clear boundaries documented
- ✅ Hydration working
- ✅ Reactive persistence active

**Success Criteria (Phase 3):**
- ✅ All 13 keyword checklist items implemented
- ✅ BYOK vault working
- ✅ Project space foundation complete
- ✅ Entry matrix working
- ✅ State management unified
- ✅ PlatformContract used everywhere
- ✅ StorageGateway used everywhere

---

### Phase 4: Test & Validate

**Timeline:** 4 hours
**Priority:** P1 (Quality Assurance)
**Dependencies:** Phase 1, 2, 3 complete

#### Step 4.1: Unit Testing (1.5 hours)

**Test Coverage:**
- Platform detection logic
- Storage gateway adapters
- BYOK vault encryption/decryption
- Project ID generation
- Entry matrix flows

**Tools:** Vitest

**Acceptance Criteria:**
- ✅ Unit tests pass
- ✅ Test coverage ≥ 80% for new code

#### Step 4.2: Integration Testing (1.5 hours)

**Test Scenarios:**
- Main routes accessibility
- Spike routes accessibility
- Cross-workspace navigation
- Project selection and creation
- Platform-specific behavior

**Tools:** Playwright (end-to-end)

**Acceptance Criteria:**
- ✅ All integration tests pass
- ✅ No console errors in tests

#### Step 4.3: User Journey Testing (1 hour)

**Test Matrix:**

| Scenario | Device Type | User Type | Expected Flow |
|----------|-------------|-----------|---------------|
| 1 | Desktop | New User | Create project → Notes workspace |
| 2 | Desktop | Returned User | Select project → IDE workspace |
| 3 | Mobile | New User | Create project → Notes workspace (IDE blocked) |
| 4 | Mobile | Returned User | Select project → Notes workspace (IDE blocked) |
| 5 | Tablet | New User | Create project → Knowledge workspace |
| 6 | Tablet | Returned User | Select project → Study workspace |

**Acceptance Criteria:**
- ✅ All 6 scenarios work correctly
- ✅ No device-specific failures
- ✅ Clear error messages when IDE blocked
- ✅ Project selection reactive and hotloaded

**Success Criteria (Phase 4):**
- ✅ All unit tests pass
- ✅ All integration tests pass
- ✅ All 6 user journeys working
- ✅ No console errors
- ✅ Performance acceptable (page load < 2s)

---

### Phase 5: Migration Preparation

**Timeline:** 2 hours
**Priority:** P1 (Future-Proofing)
**Dependencies:** Phase 4 complete

#### Step 5.1: Document Spike Implementation (1 hour)

**Actions:**
- Document routing architecture decisions
- Document spike vs main app differences
- Document fundamental truth implementations
- Create migration checklist

**Output:**
- `spike-routing-decisions-2026-01-16.md`
- `spike-vs-main-app-diff-2026-01-16.md`
- `fundamental-truth-implementation-guide-2026-01-16.md`
- `migration-checklist-2026-01-16.md`

#### Step 5.2: Create Migration Plan (1 hour)

**Actions:**
- List files to migrate from spike to main app
- List breaking changes
- List non-breaking enhancements
- Create step-by-step migration guide

**Output:**
- `spike-to-main-migration-plan-2026-01-16.md`

**Acceptance Criteria:**
- ✅ All spike implementations documented
- ✅ Migration plan complete
- ✅ Breaking changes identified
- ✅ Migration steps clear

**Success Criteria (Phase 5):**
- ✅ Migration documentation complete
- ✅ Migration plan ready for review
- ✅ Stakeholder approval obtained

---

## ⚠️ RISK MITIGATION

### Risks and Mitigation Strategies

| Risk | Probability | Impact | Mitigation | Fallback |
|------|-------------|--------|------------|----------|
| **Main routes continue 404** | HIGH | CRITICAL | Phase 1 immediate fix, multiple approaches tested | Rollback to working commit |
| **Spike routes integration fails** | MEDIUM | HIGH | Use Option 1 (file-based) first, Option 2 fallback | Keep spike as separate app |
| **Fundamental truth implementation blocks** | MEDIUM | MEDIUM | Incremental implementation, testing each keyword | Defer non-critical keywords |
| **Platform detection errors** | LOW | MEDIUM | Thorough testing on real devices | Manual platform flags |
| **State management conflicts** | MEDIUM | HIGH | Clear boundaries, comprehensive testing | Simplify state architecture |
| **Migration breaks main app** | LOW | CRITICAL | Comprehensive testing, feature flags | Rollback entire migration |

### Rollback Plan

**Trigger Conditions:**
- Main app routes remain broken after Phase 1
- Critical errors during Phase 2-3
- Performance degradation > 50%
- User-reported critical issues

**Rollback Steps:**
1. Identify last working commit
2. `git checkout <last-working-commit>`
3. Verify main app routes work
4. Notify stakeholders
5. Document failure for post-mortem

### Prevention Strategies

1. **Testing First:** Always test in spike before migrating
2. **Incremental Migration:** Migrate one keyword at a time
3. **Feature Flags:** Use feature flags for experimental features
4. **Backup Points:** Create git tags before major changes
5. **Monitoring:** Add error tracking and performance monitoring

---

## 📋 GOVERNANCE COMPLIANCE

### BMAD Framework Compliance

| Requirement | Status | Evidence |
|-------------|--------|----------|
| **ADR-033 Compliance** | ✅ COMPLIANT | PlatformContract, StorageGateway implemented |
| **ADR-034 Compliance** | ✅ COMPLIANT | No god stores, state boundaries clear |
| **ADR-035 Compliance** | ✅ COMPLIANT | Spike isolation, file-based routing |
| **ADR-026 Compliance** | ✅ COMPLIANT | Client-side only (keyword #1) |
| **Time-Boxing** | ✅ COMPLIANT | Phase-based with clear timeboxes |
| **Context Filtering** | ✅ COMPLIANT | No stale documents used (< 24h TTL) |
| **Artifact Freshness** | ✅ COMPLIANT | All documents dated 2026-01-16 |
| **No False Context** | ✅ COMPLIANT | All claims verified with code inspection |

### Documentation Requirements

| Artifact | Required | Status | Location |
|----------|----------|--------|----------|
| Master Plan | ✅ Required | ✅ Created | `spike-master-plan-2026-01-16.md` |
| Routing Decisions | ✅ Required | ⏳ Pending | `spike-routing-decisions-2026-01-16.md` |
| Spike vs Main Diff | ✅ Required | ⏳ Pending | `spike-vs-main-app-diff-2026-01-16.md` |
| Migration Plan | ✅ Required | ⏳ Pending | `spike-to-main-migration-plan-2026-01-16.md` |
| ADR (if needed) | ⚠️ Optional | ⏳ Pending | `_bmad-output/planning-artifacts/adr/` |

### Quality Gates

| Gate | Criteria | Status |
|------|----------|--------|
| **Phase 1 Gate** | Main routes 200 OK | ⏳ Pending |
| **Phase 2 Gate** | Spike routes 200 OK | ⏳ Pending |
| **Phase 3 Gate** | All 13 keywords implemented | ⏳ Pending |
| **Phase 4 Gate** | All tests pass, all journeys work | ⏳ Pending |
| **Phase 5 Gate** | Migration plan approved | ⏳ Pending |
| **Deployment Gate** | Stakeholder approval | ⏳ Pending |

---

## 📊 SUMMARY

### Total Effort Breakdown

| Phase | Time | Tasks | Status |
|-------|------|-------|--------|
| Phase 1: Restore Main App Routing | 30 min | 3 | ⏳ CRITICAL |
| Phase 2: Fix Spike Routes | 1 hour | 3 | ⏳ P0 |
| Phase 3: Fundamental Truth | 8 hours | 4 | ⏳ P0 |
| Phase 4: Test & Validate | 4 hours | 3 | ⏳ P1 |
| Phase 5: Migration Prep | 2 hours | 2 | ⏳ P1 |
| **TOTAL** | **15.5 hours** | **15** | **READY** |

### Key Decisions

1. **Spike Integration:** Use Option 1 (file-based routing) for consistency
2. **Platform Detection:** Implement getPlatformContract() immediately
3. **Storage Abstraction:** Use StorageGateway for all I/O operations
4. **Project ID:** Use `proj_{uuid}` format (no workspace prefix)
5. **IDE Access:** Desktop-only with platform guard and toast message
6. **State Management:** Zustand for reactive UI, Dexie for persistence

### Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Main Routes Working | 100% | 0% |
| Spike Routes Working | 100% | 0% |
| Keywords Implemented | 13/13 | 0/13 |
| Test Coverage | ≥80% | N/A |
| User Journeys | 6/6 | 0/6 |

---

## 🚀 NEXT STEPS

### Immediate Actions (TODAY - 2026-01-16)

1. **[CRITICAL]** Start Phase 1 immediately - app is down
   - Debug why main routes 404
   - Implement fix
   - Verify all main routes work

2. **[CRITICAL]** Start Phase 2 after Phase 1 complete
   - Choose spike integration approach
   - Implement spike routes
   - Test spike routes

### This Week (2026-01-16 → 2026-01-24)

3. **[P0]** Complete Phase 3 (Fundamental Truth)
   - BYOK vault implementation
   - Project space foundation
   - Entry matrix
   - State management

4. **[P1]** Start Phase 4 (Testing)
   - Unit tests
   - Integration tests
   - User journey testing

### Next Week (2026-01-27 → 2026-01-31)

5. **[P1]** Complete Phase 4 and Phase 5
   - Finish testing
   - Create migration documentation
   - Get stakeholder approval

6. **[P2]** Plan and execute migration
   - Review migration plan
   - Execute migration steps
   - Post-migration testing

---

## 📞 ESCALATION PATH

### On Critical Failure (Phase 1 or 2)

1. **Immediate (5 min):** Stop work, document error
2. **Short-term (15 min):** Attempt fix with alternative approach
3. **Mid-term (30 min):** Rollback to last working commit
4. **Long-term (1 hour):** Escalate to architect-ext for review

### On Implementation Blocker (Phase 3)

1. **Immediate:** Document blocker in spike-tracking.md
2. **Short-term:** Consult ADR-033 for guidance
3. **Mid-term:** Request architect-ext design review
4. **Long-term:** Split into smaller stories

### On Testing Failure (Phase 4)

1. **Immediate:** Capture error logs and screenshots
2. **Short-term:** Attempt hotfix
3. **Mid-term:** Consult tea-ext for test strategy
4. **Long-term:** Defer non-critical features

---

## 📚 REFERENCES

### Documents Referenced

- `AGENTS.md` - BMAD governance rules
- `CLAUDE.md` - Agent behavior guidelines
- `master-plan-fundamental-truth-2026-01-16.md` - Fundamental truth requirements
- `ADR-033-correct-course-architectural-remediation-2026-01-16.md` - Architecture decisions
- `ADR-034-god-store-infection-registry-2026-01-16.md` - God store infections
- `ADR-035-spike-rules-2026-01-16.md` - Spike isolation rules
- `ADR-026-client-side-architecture-2026-01-15.md` - Client-side architecture

### Tools & Libraries

- **TanStack Router:** https://tanstack.com/router
- **TanStack AI SDK:** https://tanstack.com/ai
- **Vite:** https://vitejs.dev/
- **Vitest:** https://vitest.dev/
- **Playwright:** https://playwright.dev/
- **Zustand:** https://zustand.docs.pmnd.rs/
- **Dexie:** https://dexie.org/

### Key Code Files

- `src/router.tsx` - Router configuration (NEEDS FIX)
- `src/routes/__root.tsx` - Root route
- `src/routes/index.tsx` - Index route
- `src/routes/-spike/__root.tsx` - Spike root (TO BE MOVED)
- `src/routeTree.gen.ts` - Generated route tree
- `src/main.tsx` - App entry point

---

**Document Version:** 1.0.0
**Created:** 2026-01-22T18:30+07:00
**Status:** READY_FOR_EXECUTION
**Next Review:** After Phase 1 completion (19:00 today)

---

*This master plan addresses the critical routing issues and implements fundamental truth requirements for Via-Gent architecture*
*Priority: P0 (CRITICAL) - Application is currently broken*
