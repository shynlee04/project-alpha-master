# ROUTING & ROUTE GUARDS SKEPTIC AUDIT REPORT

**Date:** 2026-01-13  
**Auditor:** Claude (Skeptic Audit)  
**Scope:** All routes in `/Users/apple/Documents/coding-projects/project-alpha-master/src/routes/`  
**Priority:** CRITICAL issues identified

---

## EXECUTIVE SUMMARY

**🚨 CRITICAL FINDINGS:**

1. **Mobile FSA Project Block** - Mobile users with FSA projects are redirected from IDE → Notes, but FSA storage is NOT supported on mobile. This creates a dead-end user journey.

2. **IDE Route Storage Type Logic Error** - IDE route allows ANY storage type, but IDE workspace REQUIRES FSA. IndexDB projects can enter IDE but will fail silently.

3. **Missing Guards on All Workspace Routes** - Only IDE route has a `beforeLoad` guard. Notes, Knowledge, Study routes have NO validation.

4. **User Journey Loop Potential** - Mobile IDE user → redirect to Notes → Notes has no project validation → may redirect to Hub → user stuck.

---

## 1. COMPLETE ROUTE MAP WITH ALL GUARDS

| Route File | Route Pattern | Guard Type | Platform Check | Storage Check | Redirect Target |
|------------|---------------|------------|----------------|---------------|-----------------|
| `ide.$projectId.tsx` | `/ide/$projectId` | `beforeLoad` ✅ | `isMobileDevice()` → `/notes/$projectId` | None (BUG!) | `/notes/$projectId` |
| `notes.$projectId.lazy.tsx` | `/notes/$projectId` | **NONE** ❌ | None | None | None |
| `notes.lazy.tsx` | `/notes` | **NONE** ❌ | None | None | None |
| `knowledge.$projectId.lazy.tsx` | `/knowledge/$projectId` | **NONE** ❌ | None | None | None |
| `study.$projectId.lazy.tsx` | `/study/$projectId` | **NONE** ❌ | None | None | None |
| `ide.tsx` | `/ide` | **NONE** ❌ | None | None | None |
| `agents.tsx` | `/agents` | **NONE** ❌ | None | None | None |
| `settings.tsx` | `/settings` | **NONE** ❌ | None | None | None |
| `projects.tsx` | `/projects` | **NONE** ❌ | None | None | None |
| `hub.tsx` | `/hub` | **NONE** ❌ | None | None | None |
| `index.tsx` | `/` | **NONE** ❌ | None | None | None |

### Analysis:
- **Total workspace routes with guards:** 1 of 5 (20%)
- **Total routes with guards:** 1 of 14 (7%)

---

## 2. DEVICE-TYPE ROUTING MATRIX

### Current Behavior:

| Route | Desktop | Mobile | Tablet |
|-------|---------|--------|--------|
| `/ide/$projectId` | ✅ Allowed | ❌ Redirects to Notes | ❌ Redirects to Notes |
| `/notes/$projectId` | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| `/knowledge/$projectId` | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| `/study/$projectId` | ✅ Allowed | ✅ Allowed | ✅ Allowed |

### Issues:

**ISSUE #1: Wrong Redirect Target**
```
Mobile user → /ide/$projectId → redirect → /notes/$projectId
```

The IDE route redirects mobile users to `/notes/$projectId`, but this is **incorrect** because:
- Mobile users may have FSA projects (created on desktop)
- Notes workspace uses `useFileSyncService` with `storageType: project?.storageType ?? 'indexeddb'`
- On mobile, FSA is NOT supported (`isStorageTypeSupported('fsa')` returns false)
- The file sync service will fail to initialize

**ISSUE #2: No Tablet-Specific Logic**
- Tablets are treated as mobile (`isMobileDevice()` returns true for iPad)
- iPad users with keyboards could potentially use IDE
- No differentiation between phone and tablet

---

## 3. STORAGE-TYPE ROUTING MATRIX

### Workspace Storage Requirements (from `WorkspaceSetupStep.tsx`):

| Workspace | Requires FSA | Supports IndexDB |
|-----------|--------------|------------------|
| IDE | ✅ YES | ❌ NO (but route doesn't enforce!) |
| Notes | ❌ NO | ✅ YES |
| Knowledge | ❌ NO | ✅ YES |
| Study | ❌ NO | ✅ YES |

### Current Route Behavior vs Requirements:

| Route | FSA Project | IndexDB Project | Issue |
|-------|-------------|-----------------|-------|
| `/ide/$projectId` | ✅ Works | ✅ Allowed (BUG!) | Should reject IndexDB |
| `/notes/$projectId` | ⚠️ Fails on mobile | ✅ Works | No guard to prevent FSA on mobile |
| `/knowledge/$projectId` | ⚠️ Fails on mobile | ✅ Works | No guard |
| `/study/$projectId` | ⚠️ Fails on mobile | ✅ Works | No guard |

### Critical Bug in IDE Route:

```typescript
// From ide.$projectId.tsx lines 60-62:
Desktop users can access IDE with ANY storage type
// No redirect - let desktop users use IDE regardless of storage type
```

**BUT** the IDE workspace has `requiresFSA: true` in `WorkspaceSetupStep.tsx`. This means:
1. IndexDB projects can enter IDE route
2. The component tries to use FSA features
3. No FSA handle exists for IndexDB projects
4. **Silent failure or crash**

---

## 4. CRITICAL ISSUES - USER JOURNEY LOOPS & BLOCKS

### 🚨 CRITICAL ISSUE #1: Mobile FSA Project Death Spiral

**Scenario:** Mobile user has FSA project (created on desktop)

```
1. User taps "IDE" sidebar button
2. Navigate to /ide/my-fsa-project
3. IDE route beforeLoad: isMobileDevice() = true
4. Throw redirect to /notes/my-fsa-project
5. Notes route: NO GUARD - allows access
6. NotesPage renders, calls useFileSyncService({
     projectId: 'my-fsa-project',
     storageType: 'fsa'  // From project.storageType
   })
7. useFileSyncService: isStorageTypeSupported('fsa') = false (mobile!)
8. Error: "File System Access API not supported on mobile"
9. Service fails to initialize
10. User sees broken Notes workspace, no clear error message
```

**Impact:** User cannot access their FSA project on mobile at all. No fallback, no error message, just broken functionality.

**Root Cause:** IDE route redirects to Notes assuming Notes can handle FSA projects, but Notes has no guard to prevent FSA storage on mobile.

---

### 🚨 CRITICAL ISSUE #2: IndexDB Project in IDE Silent Failure

**Scenario:** Desktop user with IndexDB project opens IDE

```
1. User taps "IDE" sidebar button
2. Navigate to /ide/my-indexdb-project
3. IDE route beforeLoad: isDesktopDevice() = true
4. No storage type check - proceeds
5. Component mounts, tries to restore FSA handle
6. Project has storageType = 'indexdb' - no handle exists
7. Code path: if (restoredProject?.storageType === 'fsa') { ... }
8. This block is skipped because storageType !== 'fsa'
9. IDE renders but file system features won't work
10. User sees broken IDE, no clear error
```

**Impact:** User enters IDE but functionality is broken. No clear indication why.

**Root Cause:** IDE route has `beforeLoad` that checks mobile but NOT storage type.

---

### 🚨 CRITICAL ISSUE #3: No Project Binding Validation

**Scenario:** User created project with only IDE binding, tries to open in Notes

```
1. User created project "my-project" with bindings: { ide: true, notes: false }
2. User tries to open /notes/my-project
3. Notes route: NO GUARD - allows access
4. NotesPage renders
5. NotesFileSyncService initializes
6. No validation that project is allowed in Notes workspace
```

**Impact:** Project binding configuration is not enforced at the route level.

**Root Cause:** No route guard checks `project.workspaceBindings.notes`.

---

## 5. MISSING ROUTE GUARDS ANALYSIS

### Guards That Should Exist:

#### A. `/notes/$projectId` - Needs `beforeLoad`:

```typescript
beforeLoad: async ({ params }) => {
  const { projectId } = params;
  
  // Check 1: Fetch project
  const project = await getProject(projectId);
  if (!project) {
    throw redirect({ to: '/hub' });
  }
  
  // Check 2: Mobile users cannot use FSA storage
  if (isMobileDevice() && project.storageType === 'fsa') {
    throw redirect({
      to: '/hub',
      search: { 
        error: 'mobile-fsa-not-supported',
        message: 'FSA projects cannot be opened on mobile. Please use a desktop browser.'
      }
    });
  }
  
  // Check 3: Verify workspace binding
  const bindings = project.workspaceBindings || project.bindings || {};
  if (!bindings.notes) {
    throw redirect({
      to: '/hub',
      search: { 
        error: 'workspace-not-enabled',
        message: 'Notes workspace is not enabled for this project.'
      }
    });
  }
  
  return { project };
}
```

#### B. `/knowledge/$projectId` - Needs `beforeLoad`:

```typescript
beforeLoad: async ({ params }) => {
  const { projectId } = params;
  
  const project = await getProject(projectId);
  if (!project) {
    throw redirect({ to: '/hub' });
  }
  
  // Check workspace binding
  const bindings = project.workspaceBindings || project.bindings || {};
  if (!bindings.knowledge) {
    throw redirect({
      to: '/hub',
      search: { error: 'workspace-not-enabled' }
    });
  }
  
  return { project };
}
```

#### C. `/study/$projectId` - Needs `beforeLoad`:

```typescript
beforeLoad: async ({ params }) => {
  const { projectId } = params;
  
  const project = await getProject(projectId);
  if (!project) {
    throw redirect({ to: '/hub' });
  }
  
  // Check workspace binding
  const bindings = project.workspaceBindings || project.bindings || {};
  if (!bindings.study) {
    throw redirect({
      to: '/hub',
      search: { error: 'workspace-not-enabled' }
    });
  }
  
  return { project };
}
```

#### D. `/ide/$projectId` - Needs Storage Type Check:

```typescript
beforeLoad: async ({ params }) => {
  const { projectId } = params;
  
  // Check 1: Mobile redirect (existing)
  if (isMobileDevice()) {
    throw redirect({
      to: '/notes/$projectId',
      params: { projectId },
      search: { reason: 'mobile-not-supported' }
    });
  }
  
  // Check 2: Fetch project
  const project = await getProject(projectId);
  if (!project) {
    throw redirect({ to: '/hub' });
  }
  
  // Check 3: IDE REQUIRES FSA - reject IndexDB projects
  if (project.storageType !== 'fsa') {
    throw redirect({
      to: '/hub',
      search: { 
        error: 'ide-requires-fsa',
        message: 'IDE workspace requires FSA storage type. This project uses IndexDB.'
      }
    });
  }
  
  // Check 4: Verify workspace binding
  const bindings = project.workspaceBindings || project.bindings || {};
  if (!bindings.ide) {
    throw redirect({
      to: '/hub',
      search: { error: 'workspace-not-enabled' }
    });
  }
  
  return { project };
}
```

---

## 6. RECOMMENDATIONS (Priority Order)

### P0 - Critical Fixes:

1. **Add storage type guard to IDE route**
   - Reject IndexDB projects (IDE requires FSA)
   - Location: `src/routes/ide.$projectId.tsx`

2. **Add mobile + storage type guard to Notes route**
   - Reject FSA projects on mobile
   - Location: `src/routes/notes.$projectId.lazy.tsx`

3. **Add workspace binding validation to all workspace routes**
   - Check `project.workspaceBindings[workspaceType]` before allowing access
   - Location: All `*.$projectId.lazy.tsx` routes

### P1 - Important Enhancements:

4. **Add consistent error messaging**
   - All redirects should include `search` params with error message
   - Hub route should display user-friendly error messages

5. **Add tablet detection**
   - Tablets may support FSA (iPad with keyboard)
   - Differentiate from phones in `isMobileDevice()`

6. **Add storage type to route loader data**
   - Pass storage type to component for conditional rendering
   - Show appropriate UI for supported storage types

### P2 - Nice to Have:

7. **Add unified route guard utility**
   - Create `createWorkspaceRoute()` helper
   - Reduces code duplication across routes

8. **Add route guard tests**
   - Test each guard scenario
   - Prevent future regressions

---

## 7. FILES REQUIRING CHANGES

| File | Change Type | Description |
|------|-------------|-------------|
| `src/routes/ide.$projectId.tsx` | Modify | Add storage type check in beforeLoad |
| `src/routes/notes.$projectId.lazy.tsx` | Modify | Add beforeLoad guard with mobile+FSA check |
| `src/routes/knowledge.$projectId.lazy.tsx` | Modify | Add beforeLoad guard with binding check |
| `src/routes/study.$projectId.lazy.tsx` | Modify | Add beforeLoad guard with binding check |
| `src/infrastructure/filesystem/platform-detection.ts` | No change | Already has needed utilities |

---

## APPENDIX: Platform Detection Functions Used

From `/Users/apple/Documents/coding-projects/project-alpha-master/src/infrastructure/filesystem/platform-detection.ts`:

```typescript
export function isMobileDevice(): boolean
export function isTabletDevice(): boolean
export function isDesktopDevice(): boolean
export function getDeviceType(): PlatformType
export function isFSASupported(): boolean
export function getOptimalStorageType(): StorageType
export function getStorageTypeForDevice(deviceType: PlatformType): StorageType
```

---

**END OF REPORT**
