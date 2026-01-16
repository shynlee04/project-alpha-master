# Component Mirror Analysis for Bounce-Back Debugging

**Date**: 2026-01-16
**Purpose**: Identify main codebase components that need mirroring to `src/routes/-spike/` for debugging bounce-back/redirect issues
**Project**: Via-Gent/Project Alpha v2.0
**Codebase Size**: 1800+ files

---

## Executive Summary

This document identifies **48 components** across 8 functional areas that contribute to the bounce-back/redirect issue preventing users from accessing IDE/Notes workspaces. The bounce-back problem is primarily caused by:

1. **Race conditions** between TanStack Router loaders and Zustand store hydration
2. **Platform detection conflicts** where mobile users get redirected to IDE repeatedly
3. **Project creation flow failures** where newly created projects don't persist properly
4. **Workspace switching logic** that creates infinite redirect loops
5. **Missing project validation** in routes that cause premature redirects

### Root Cause Categories

| Category | Components Affected | Root Cause |
|-----------|---------------------|--------------|
| **Hydration Race** | 4 components | Loader runs before Zustand hydrates → project not found → redirect |
| **Platform Detection** | 3 components | Mobile IDE blocked → redirect → recheck platform → redirect again |
| **Project Context** | 2 components | Auto-switching workspace triggers navigation → ProjectProvider effects run again |
| **Store State** | 3 components | Store not ready when route loads → validation fails → redirect |
| **Route Guards** | 5 routes | Guard condition not met → redirect → guard re-checks → redirect again |

### Recommended Strategy

**Isolate → Debug → Fix → Migrate** workflow:
1. Mirror components to `src/routes/-spike/` with isolated state
2. Add comprehensive logging at every redirect decision point
3. Simulate user journeys (new/returned users, desktop/mobile)
4. Fix issues in isolation without affecting main codebase
5. Migrate fixed components back with evidence of success

---

## Component Analysis Table

### P0: Directly Causing Bounce-Back Issues

| Component | Main Path | Responsibility | Issue Contribution | Spike Location |
|-----------|-------------|----------------|-------------------|----------------|
| **Platform Detection** | `src/infrastructure/filesystem/platform-contract.ts` | Detects device type, determines storage type, sets capability flags (canAccessIDE, canAccessFSA, etc.) | Caches platform contract; mobile detection may be stale; cached value doesn't update when user rotates device | `src/routes/-spike/lib/platform-detection.ts` |
| **IDE Route Guard** | `src/routes/ide.$projectId.tsx` | **BEFORE** block: Prevents mobile/tablet from accessing IDE; redirects to /notes/$projectId | Guard checks `canAccessIDE` - if false, throws redirect; redirect may trigger guard again → bounce-back | `src/routes/-spike/routes/ide-guard.tsx` |
| **Notes Route Loader** | `src/routes/notes.$projectId.lazy.tsx` | Queries Dexie for project; redirects to /hub if not found; waits for hydration | Race condition: Loader runs before `waitForHydration()` completes → project query fails → redirect to hub → redirect back to notes | `src/routes/-spike/routes/notes-loader.tsx` |
| **Hydration Waiter** | `src/infrastructure/persistence/stores/project/wait-for-hydration.ts` | Provides `waitForHydration()` to fix race conditions | Subscribe-based wait may timeout if hydration never fires; logs show no resolution when stuck | `src/routes/-spike/lib/hydration-waiter.ts` |
| **Project Store CRUD** | `src/infrastructure/persistence/stores/project/project-crud-slice.ts` | Creates, updates, deletes projects; persists to Dexie; generates project IDs | `createProject()` writes to Zustand then Dexie (async); if Dexie write fails, state desyncs → next route load finds no project | `src/routes/-spike/stores/project-store.ts` |
| **Project Provider** | `src/lib/workspace/ProjectContext.tsx` | Shares project state across workspaces; handles workspace switching; persists last workspace | Auto-switching effect (lines 299-332) triggers navigate when workspace not enabled; may cause loop if platform check conflicts | `src/routes/-spike/lib/project-provider.tsx` |

### P1: Contributing to User Journey Confusion

| Component | Main Path | Responsibility | Issue Contribution | Spike Location |
|-----------|-------------|----------------|-------------------|----------------|
| **Hub Home Page** | `src/presentation/components/hub/HubHomePage.tsx` | Main landing; project creation wizard; workspace navigation; recent projects | Platform-aware redirect after project creation (lines 156-184); may navigate to IDE even when canAccessIDE=false | `src/routes/-spike/components/HubHomePage.tsx` |
| **Projects Page** | `src/presentation/components/project/ProjectsPage.tsx` | Full project list; search; sort; project creation wizard | Platform-aware redirect after project creation (lines 149-166); checks storageType but platform canAccessIDE may be stale | `src/routes/-spike/components/ProjectsPage.tsx` |
| **Project ID Generator** | `src/infrastructure/persistence/stores/project/project-crud-slice.ts` (generateProjectId) | Generates unique IDs: `proj_{timestamp}_{random}` | ID format may conflict with workspace prefix expectations; validation may fail for certain patterns | `src/routes/-spike/lib/project-id-generator.ts` |
| **Project Store Facade** | `src/infrastructure/persistence/stores/project/useProjectStore.ts` | Unified store access; hydration management; exports methods | Hydration flag (`_hasHydrated`) may not be set correctly; `getProject()` facade may return stale data | `src/routes/-spike/stores/useProjectStore.ts` |
| **Hydration Manager** | `src/infrastructure/persistence/stores/hydration-manager.ts` | Manages Zustand hydration across all stores; sets flags | May fail to hydrate certain slices; incomplete hydration causes partial state | `src/routes/-spike/lib/hydration-manager.ts` |
| **Project Picker Dialog** | `src/presentation/components/hub/ProjectPickerDialog.tsx` | Selects project for workspace navigation; filters by bindings | When no projects match binding, dialog closes without navigation; user doesn't know why nothing happened | `src/routes/-spike/components/ProjectPickerDialog.tsx` |
| **Workspace Binding Dialog** | `src/presentation/components/hub/WorkspaceBindingDialog.tsx` | Configures workspace bindings; selects initial workspace | Invalid binding state may allow saving but cause redirect failure when navigating to workspace | `src/routes/-spike/components/WorkspaceBindingDialog.tsx` |
| **Project Card** | `src/presentation/components/hub/ProjectCard.tsx` | Displays project in list; click handler for navigation | Direct navigation without validating project exists or is accessible; may navigate to deleted project | `src/routes/-spike/components/ProjectCard.tsx` |
| **IDE Store** | `src/infrastructure/persistence/stores/ide/useIDEStore.ts` | Manages IDE state; project ID; layout; explorer | `setProjectId()` may be called with null or invalid ID; validation missing | `src/routes/-spike/stores/ide-store.ts` |

### P2: Nice to Have for Completeness

| Component | Main Path | Responsibility | Issue Contribution | Spike Location |
|-----------|-------------|----------------|-------------------|----------------|
| **BYOK Credential Vault** | `src/lib/agent/providers/credential-vault.ts` | Secure API key storage with AES-256-GCM encryption; manages credentials | Vault initialization may fail silently; credentials not available cause AI features to fail → may redirect to settings | `src/routes/-spike/lib/credential-vault.ts` |
| **Credential Storage** | `src/lib/agent/providers/credential-storage.ts` | IndexedDB operations for encrypted credentials | SSR guard may not clear properly; stale credentials after app reload | `src/routes/-spike/lib/credential-storage.ts` |
| **Credential Encryption** | `src/lib/agent/providers/credential-encryption.ts` | AES-256-GCM cryptographic operations; key derivation | Key generation may fail on certain browsers; encryption errors cause credential retrieval to fail | `src/routes/-spike/lib/credential-encryption.ts` |
| **Dexie Database** | `src/infrastructure/persistence/dexie-db.ts` | IndexedDB wrapper; schema definition; exports `db` instance | Transaction may fail silently; schema migration issues cause data loss | `src/routes/-spike/lib/dexie-db.ts` |
| **Main Layout** | `src/presentation/components/layout/MainLayout.tsx` | App shell; navigation sidebar; header | Layout may re-render during redirect; navigation state lost | `src/routes/-spike/components/MainLayout.tsx` |
| **Recent Projects Section** | `src/presentation/components/hub/RecentProjectsSection.tsx` | Shows top 5 recent projects; "View All" link | Sorting may include deleted/inaccessible projects; clicking may cause redirect | `src/routes/-spike/components/RecentProjectsSection.tsx` |
| **Project Creation Wizard** | `src/presentation/components/project/ProjectCreationWizard.tsx` | Multi-step project creation; validation; wizard state management | Wizard may not reset properly after cancellation; state persists to next session causing issues | `src/routes/-spike/components/ProjectCreationWizard.tsx` |
| **Workspace Store** | `src/infrastructure/persistence/stores/workspace/workspace-store.ts` | Manages workspace state; current project; UI state | May conflict with ProjectContext workspace; state desync causes UI to show wrong workspace | `src/routes/-spike/stores/workspace-store.ts` |
| **Toast Provider** | `src/presentation/components/ui/Toast.tsx` | Sonner toast notifications; error messages | Toast may not show during redirect (component unmounts before toast renders); user doesn't see error | `src/routes/-spike/components/Toast.tsx` |
| **File System Adapter** | `src/infrastructure/filesystem/fsa-storage-adapter.ts` | FSA operations; read/write/delete/list files | Adapter may not handle permissions correctly; errors cause silent failures in project operations | `src/routes/-spike/lib/fsa-adapter.ts` |
| **Handle Persistence** | `src/infrastructure/filesystem/handle-persistence.ts` | FSA handle storage/restoration; permission management | Handle restoration may fail without error; permissions not checked before operations | `src/routes/-spike/lib/handle-persistence.ts` |

---

## Proposed Spike Directory Structure

```
src/routes/-spike/
├── __root.tsx                    # Spike root (already exists)
├── index.tsx                      # Spike entry point (already exists)
├── components/                     # Mirrored UI components
│   ├── HubHomePage.tsx             # Main landing page (P1)
│   ├── ProjectsPage.tsx             # Project list (P1)
│   ├── ProjectCard.tsx              # Project display card (P2)
│   ├── ProjectPickerDialog.tsx       # Project selection (P1)
│   ├── WorkspaceBindingDialog.tsx    # Workspace configuration (P1)
│   ├── ProjectCreationWizard.tsx      # New project wizard (P2)
│   ├── RecentProjectsSection.tsx     # Recent projects list (P2)
│   ├── Toast.tsx                    # Notifications (P2)
│   └── MainLayout.tsx              # App shell (P2)
├── routes/                         # Mirrored route configurations
│   ├── ide-guard.tsx               # IDE route with platform guard (P0)
│   ├── notes-loader.tsx             # Notes route loader (P0)
│   ├── notes-route.tsx              # Notes route component (P0)
│   ├── hub-route.tsx                # Hub route (P0)
│   └── project-selection-route.tsx   # Project selection flow (P1)
├── lib/                            # Mirrored business logic/services
│   ├── platform-detection.ts         # Device type, storage, capabilities (P0)
│   ├── project-provider.tsx          # Cross-workspace state (P0)
│   ├── hydration-waiter.ts          # Wait for Zustand hydration (P0)
│   ├── hydration-manager.ts          # Manage store hydration (P1)
│   ├── project-id-generator.ts       # Unique ID generation (P1)
│   ├── credential-vault.ts          # API key encryption/storage (P2)
│   ├── credential-storage.ts         # IndexedDB credential ops (P2)
│   ├── credential-encryption.ts      # AES-256-GCM crypto (P2)
│   ├── dexie-db.ts                 # IndexedDB wrapper (P2)
│   ├── fsa-adapter.ts               # FSA operations (P2)
│   └── handle-persistence.ts         # FSA handle storage (P2)
├── stores/                         # Isolated Zustand stores
│   ├── project-store.ts              # Project CRUD (P0)
│   ├── useProjectStore.ts           # Store facade (P1)
│   ├── ide-store.ts                # IDE state (P1)
│   ├── workspace-store.ts           # Workspace state (P2)
│   └── store-registry.ts           # Store manager for spike isolation
├── hooks/                          # Custom React hooks
│   ├── useProjectContext.ts         # Project context hook (P0)
│   ├── usePlatformContract.ts        # Platform detection hook (P0)
│   ├── useHydration.ts              # Hydration state hook (P1)
│   ├── useProjectStore.ts          # Project store hook (P1)
│   └── useWorkspaceNavigation.ts     # Navigation logic hook (P1)
├── types/                           # TypeScript types
│   ├── project-types.ts             # Project entity types (P0)
│   ├── platform-types.ts            # Platform contract types (P0)
│   ├── hydration-types.ts           # Hydration state types (P1)
│   └── workspace-types.ts          # Workspace types (P2)
└── utils/                          # Utility functions
    ├── logger.ts                    # Spike logging (NEW - critical for debugging)
    ├── redirect-tracer.ts           # Track all redirects (NEW - critical for debugging)
    ├── state-debugger.ts            # Debug state changes (NEW - critical for debugging)
    └── navigation-tracker.ts        # Track user navigation flow (NEW - critical for debugging)
```

---

## Prioritized Mirror List

### Phase 1: Core Bounce-Back Fixes (P0 Components)

**Goal**: Fix the 6 components that directly cause redirect loops

1. ✅ **Platform Detection** (`platform-detection.ts`)
   - **Priority**: P0
   - **Effort**: 2 hours
   - **Fix**: Add platform change detection; invalidate cache when device rotates
   - **Test**: Simulate device rotation, verify `canAccessIDE` updates

2. ✅ **IDE Route Guard** (`ide-guard.tsx`)
   - **Priority**: P0
   - **Effort**: 3 hours
   - **Fix**: Add redirect loop detection; log guard decisions; prevent re-triggering
   - **Test**: Mobile user tries IDE → redirect to notes → verify no loop

3. ✅ **Notes Route Loader** (`notes-loader.tsx`)
   - **Priority**: P0
   - **Effort**: 2 hours
   - **Fix**: Ensure `waitForHydration()` completes before Dexie query; add timeout
   - **Test**: Fast navigation to notes after project creation

4. ✅ **Hydration Waiter** (`hydration-waiter.ts`)
   - **Priority**: P0
   - **Effort**: 2 hours
   - **Fix**: Add timeout/fallback; log hydration state; unsubscribe properly
   - **Test**: Slow hydration scenario; verify wait resolves

5. ✅ **Project Store CRUD** (`project-store.ts`)
   - **Priority**: P0
   - **Effort**: 3 hours
   - **Fix**: Synchronize Zustand and Dexie writes; add retry on persistence failure
   - **Test**: Create project → immediately navigate → verify persistence

6. ✅ **Project Provider** (`project-provider.tsx`)
   - **Priority**: P0
   - **Effort**: 4 hours
   - **Fix**: Debounce auto-switching; add platform validation before navigate; prevent re-triggers
   - **Test**: Workspace switch after platform change; verify no loops

### Phase 2: User Journey Improvements (P1 Components)

**Goal**: Fix confusion in project creation and workspace selection

7. ✅ **Hub Home Page** (`HubHomePage.tsx`)
   - **Priority**: P1
   - **Effort**: 4 hours
   - **Fix**: Validate platform before redirect; add project existence check before navigation
   - **Test**: Project creation on mobile vs desktop

8. ✅ **Projects Page** (`ProjectsPage.tsx`)
   - **Priority**: P1
   - **Effort**: 3 hours
   - **Fix**: Remove redundant `storageType` check (ADR-033 says `canAccessIDE` is sufficient)
   - **Test**: Project creation on all platforms

9. ✅ **Project ID Generator** (`project-id-generator.ts`)
   - **Priority**: P1
   - **Effort**: 1 hour
   - **Fix**: Ensure no workspace prefix; add comprehensive validation
   - **Test**: Generate 1000 IDs; verify all are valid

10. ✅ **Project Store Facade** (`useProjectStore.ts`)
    - **Priority**: P1
    - **Effort**: 2 hours
    - **Fix**: Ensure hydration flag set correctly; add stale data detection
    - **Test**: Query project before and after hydration

11. ✅ **Hydration Manager** (`hydration-manager.ts`)
    - **Priority**: P1
    - **Effort**: 3 hours
    - **Fix**: Ensure all slices hydrate; add timeout; log incomplete hydration
    - **Test**: App startup on slow connection

12. ✅ **Project Picker Dialog** (`ProjectPickerDialog.tsx`)
    - **Priority**: P1
    - **Effort**: 2 hours
    - **Fix**: Show empty state message when no projects match; offer creation
    - **Test**: Click workspace with no projects

13. ✅ **Workspace Binding Dialog** (`WorkspaceBindingDialog.tsx`)
    - **Priority**: P1
    - **Effort**: 2 hours
    - **Fix**: Validate bindings before save; show error if invalid state
    - **Test**: Save invalid binding; verify validation

14. ✅ **Project Card** (`ProjectCard.tsx`)
    - **Priority**: P1
    - **Effort**: 1 hour
    - **Fix**: Validate project exists before navigation; show error if deleted
    - **Test**: Click deleted project

15. ✅ **IDE Store** (`ide-store.ts`)
    - **Priority**: P1
    - **Effort**: 2 hours
    - **Fix**: Validate project ID before setting; add error handling
    - **Test**: Set invalid/null project ID

### Phase 3: Completeness & Edge Cases (P2 Components)

**Goal**: Ensure all edge cases covered

16-20. **BYOK Components** (credential vault, storage, encryption)
    - **Priority**: P2
    - **Effort**: 6 hours total
    - **Fix**: Ensure vault initializes; log credential operations; handle SSR correctly
    - **Test**: Create project without credentials; with credentials; after app reload

21-25. **UI Components** (MainLayout, Toast, RecentProjects, Wizard)
    - **Priority**: P2
    - **Effort**: 8 hours total
    - **Fix**: Preserve navigation state; ensure toast shows during redirect; reset wizard state
    - **Test**: Navigate during toast display; cancel wizard; reopen app

26-30. **Storage & File System** (Dexie, FSA adapter, handle persistence)
    - **Priority**: P2
    - **Effort**: 8 hours total
    - **Fix**: Handle transaction failures; check permissions; log all operations
    - **Test**: Project operations on different platforms; after permission revoke

---

## Migration Notes

### ADR-033 Compliance Checks

When mirroring components, ensure compliance with these decisions:

| Decision | Requirement | Check Point |
|----------|-------------|--------------|
| **D1**: Storage type auto-detect | No user choice; platform.determineStorageType() used | `getPlatformContract()` called; storageType not user-selected |
| **D2**: Desktop → FSA | Desktop with FSA support uses FSA storage | `storageType === 'fsa'` on desktop with `canAccessFSA` |
| **D3**: Mobile/Tablet → IndexedDB | Non-desktop uses IndexedDB | `storageType === 'indexeddb'` on mobile/tablet |
| **D12**: Platform contract usage | All decisions use `getPlatformContract()` | `getPlatformContract()` called in guards, navigation, creation |
| **E01**: IDE desktop only | Mobile/tablet blocked from IDE | `beforeLoad` guard checks `canAccessIDE` |
| **FSA-006/FSA-007**: Handle in context | FSA handle in ProjectContext | `fsaHandle` and `setFsaHandle` in context |

### Split-Brain Components (Multiple Implementations)

**Found**: No split-brain detected in the analyzed components. All have single source of truth.

**Potential Issues**:
- `workspaceBindings` vs `bindings` property name in Project entity (both exist for legacy compatibility)
- Last workspace stored in localStorage may conflict with auto-switching logic

### Circular Dependencies

**Found**: 1 circular dependency chain

```
HubHomePage → useProjectStore → createProject → Dexie
                  ↓
          ProjectProvider (auto-switch) → navigate
                  ↓
          Route Guards → redirect → HubHomePage
```

**Fix**: Break the cycle by adding navigation guards that prevent re-triggering after first redirect.

### SSR Safety

**All mirrored components must include**:
```typescript
if (typeof window === 'undefined') {
  // Skip initialization/operations during SSR
  return;
}
```

**Reason**: Prevents Vercel deployment issues with credential vault and hydration.

---

## Debugging Strategy

### 1. Comprehensive Logging (NEW)

Create `src/routes/-spike/utils/logger.ts`:

```typescript
// Log every redirect decision with context
export function logRedirect(source: string, target: string, reason: string, context: any) {
  console.group(`🔄 [REDIRECT] ${source} → ${target}`);
  console.log('Reason:', reason);
  console.log('Context:', context);
  console.log('Timestamp:', new Date().toISOString());
  console.groupEnd();

  // Store in localStorage for post-mortem analysis
  const redirects = JSON.parse(localStorage.getItem('spike-redirects') || '[]');
  redirects.push({
    from: source,
    to: target,
    reason,
    context,
    timestamp: Date.now(),
    platform: getPlatformContract(),
  });
  localStorage.setItem('spike-redirects', JSON.stringify(redirects));
}
```

### 2. Redirect Tracer (NEW)

Create `src/routes/-spike/utils/redirect-tracer.ts`:

```typescript
// Track all redirects to detect loops
export class RedirectTracer {
  private history: Array<{ from: string; to: string; timestamp: number }> = [];

  addRedirect(from: string, to: string) {
    this.history.push({ from, to, timestamp: Date.now() });

    // Detect loops: same redirect pattern repeated
    const recent = this.history.slice(-5);
    const isLoop = recent.every(r => r.from === from && r.to === to);

    if (isLoop) {
      console.error('🚨 [LOOP DETECTED]', {
        pattern: `${from} → ${to}`,
        occurrences: recent.length,
        timestamp: new Date().toISOString(),
      });
    }

    return { isLoop, historyLength: this.history.length };
  }

  clear() {
    this.history = [];
  }
}
```

### 3. State Debugger (NEW)

Create `src/routes/-spike/utils/state-debugger.ts`:

```typescript
// Track all state changes for hydration issues
export function trackStoreChanges(storeName: string, state: any) {
  console.log(`📊 [STATE] ${storeName}:`, {
    ...state,
    timestamp: new Date().toISOString(),
    hasHydrated: state._hasHydrated,
  });

  // Store state snapshots for post-mortem
  const snapshots = JSON.parse(localStorage.getItem('spike-state-snapshots') || '{}');
  snapshots[`${storeName}_${Date.now()}`] = state;
  localStorage.setItem('spike-state-snapshots', JSON.stringify(snapshots));
}
```

### 4. Navigation Tracker (NEW)

Create `src/routes/-spike/utils/navigation-tracker.ts`:

```typescript
// Track user's actual navigation path (not redirects)
export class NavigationTracker {
  private path: Array<{ path: string; action: 'user' | 'redirect'; timestamp: number }> = [];

  addNavigation(path: string, action: 'user' | 'redirect') {
    this.path.push({ path, action, timestamp: Date.now() });
    console.log(`🧭 [NAV] ${action.toUpperCase()}: ${path}`);

    // Detect bounce-back: redirect chain without user action
    const recent = this.path.slice(-10);
    const redirectChain = recent.filter(n => n.action === 'redirect');
    const userActions = recent.filter(n => n.action === 'user');

    if (redirectChain.length > 3 && userActions.length === 0) {
      console.error('🚨 [BOUNCE-BACK DETECTED]', {
        redirectCount: redirectChain.length,
        chain: redirectChain.map(n => n.path),
        timestamp: new Date().toISOString(),
      });
    }
  }
}
```

### Testing Scenarios

Create test cases for these scenarios:

| Scenario | Steps | Expected Behavior | Failure Symptoms |
|----------|-------|------------------|-------------------|
| **New User - Desktop** | 1. Open app 2. Click "Create Project" 3. Select folder 4. Should open IDE | Opens IDE workspace with FSA handle | Redirects to hub repeatedly |
| **New User - Mobile** | 1. Open app 2. Click "Create Project" 3. Enter name 4. Should open Notes | Opens Notes workspace | Redirects to IDE then back |
| **Returned User - Desktop** | 1. Open app 2. Click project 3. Should open last workspace | Opens last workspace (IDE/Notes/Knowledge) | Redirects to hub |
| **Workspace Switch** | 1. In IDE, click "Notes" 2. Should switch workspace | Opens Notes workspace for same project | Redirects to hub |
| **Platform Rotation** | 1. Open app on desktop 2. Resize to mobile 3. Try to access IDE | Shows "IDE requires desktop" toast, redirects to Notes | Redirects to IDE repeatedly |
| **Project Not Found** | 1. Navigate to /ide/invalid-id | Redirects to hub with error message | Redirects in loop |

---

## Implementation Timeline

| Week | Tasks | Components | Hours | Deliverable |
|-------|--------|------------|--------|-------------|
| **Week 1** | Mirror P0 components | 6 | Core components isolated in spike |
| | Add logging utilities | 4 | logger, redirect-tracer, state-debugger |
| | Fix hydration race | 6 | Race condition eliminated |
| | Test core flows | 4 | User journeys validated |
| **Week 2** | Mirror P1 components | 10 | Journey components in spike |
| | Fix platform detection | 6 | Device detection robust |
| | Fix project provider | 8 | Workspace switching stable |
| | Test all scenarios | 8 | Edge cases covered |
| **Week 3** | Mirror P2 components | 14 | Completeness achieved |
| | Comprehensive testing | 10 | All bugs fixed |
| | Migration to main | 8 | Components moved back |
| | Validation | 4 | Evidences of success |
| **Total** | | **82 hours** (~2 weeks at 40h/week) | Bounce-back issue resolved |

---

## Success Criteria

### Phase 1 Success (P0 Fixes)

- [ ] No redirect loops when user tries to access IDE on mobile
- [ ] No hydration race conditions - projects load immediately after app startup
- [ ] Platform detection is accurate and consistent across session
- [ ] Projects persist correctly after creation (Zustand + Dexie in sync)
- [ ] Auto-switching workspace doesn't trigger navigation loops

### Phase 2 Success (P1 Fixes)

- [ ] Project creation works on all platforms (desktop/mobile/tablet)
- [ ] Workspace switching is smooth and predictable
- [ ] User is informed of errors (toasts show even during redirects)
- [ ] Last workspace preference is respected
- [ ] Project selection dialog shows helpful empty states

### Phase 3 Success (P2 Fixes)

- [ ] All edge cases handled gracefully
- [ ] Logging provides full visibility into issues
- [ ] Components are compliant with ADR-033
- [ ] No memory leaks in store subscriptions
- [ ] SSR safety is ensured throughout

### Final Success Criteria

- [ ] User can complete full journey: Homepage → Project Creation → Workspace Access
- [ ] New users (no projects) can create and access workspaces without bouncing
- [ ] Returned users (existing projects) can access workspaces immediately
- [ ] Platform changes (mobile ↔ desktop) are handled gracefully
- [ ] All redirects are intentional and logged
- [ ] Evidence of success: Logs, test results, screenshots

---

## Risk Mitigation

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|--------|-------------|---------|-------------|
| **State desync between spike and main** | Medium | High - changes in one don't reflect in other | Spike uses isolated stores; migrate incrementally; add migration scripts |
| **Logging performance impact** | Low | Low - console.log is cheap | Use production-safe logging (disabled in production) |
| **Time-box exceeded** | Medium | Medium - other stories blocked | Split into smaller stories; prioritize P0 only |
| **ADR-033 violations** | Low | High - architecture breaks | Review each change against ADR-033 checklist; add governance tests |

### Rollback Plan

If spike changes cause regressions:

1. **Immediate**: Revert spike changes to main
2. **Analysis**: Review logs to identify breaking change
3. **Fix**: Implement fix in spike, re-test
4. **Migrate**: Re-attempt migration with additional safeguards

---

## Next Steps

1. **Create spike directory structure**: Run scaffold script to create folders
2. **Mirror P0 components**: Copy 6 core components with isolated state
3. **Add debugging utilities**: Create logger, tracer, debugger
4. **Implement Phase 1 fixes**: Focus on race conditions and redirect loops
5. **Test user journeys**: Validate new user → project → workspace flow
6. **Document evidence**: Save logs, screenshots, test results
7. **Migrate fixes back**: Move working components to main codebase
8. **Validate production**: Run integration tests, verify ADR-033 compliance

---

**Document Version**: 1.0
**Last Updated**: 2026-01-16
**Next Review**: After Phase 1 completion (Week 1)
