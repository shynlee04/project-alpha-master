# Routing Investigation Report

**Date**: 2026-01-16
**Agent**: Agent 2 (Routing Investigation)
**Epic**: EPIC-CC-ARC (Architectural Remediation)
**Phase**: Phase 1 - Temp Project Elimination

---

## Executive Summary

The routing investigation reveals that **temp projects are already eliminated from IDE routes** but **still partially present in Notes routes**. The browser-mode pseudo-project pattern is deprecated but still active for mobile users, creating routing complexity and technical debt.

**Key Findings**:
- ✅ IDE routes (`/ide`, `/ide/$projectId`) - Clean, no temp projects
- ⚠️ Notes routes (`/notes`, `/notes/$projectId`) - Legacy browser-mode project still active
- 📋 Browser-mode project (`proj_browser-default`) - Deprecated but functional
- 🎯 Phase 1 Goal: Remove browser-mode project from Notes routing

---

## Route 1: ide.tsx

### File Location
`src/routes/ide.tsx`

### Current Behavior

**Platform Guard (beforeLoad)**:
```typescript
// Lines 35-56
beforeLoad: async ({ location }) => {
  const platform = getPlatformContract();

  // ADR-033 D1: Mobile cannot access IDE
  if (!platform.canAccessIDE) {
    throw redirect({
      to: '/hub',
      search: { reason: 'mobile-not-supported' }
    });
  }
}
```

**Routing Logic**:
1. **Desktop with FSA**: Shows empty state with two options:
   - "Select Project Folder" → Opens FolderPickerDialog
   - "Create / Browse Projects" → Navigates to `/hub?action=create-project`

2. **Mobile/Tablet**: Redirected to `/hub` (blocked by platform guard)

3. **Child Route Detection**: Uses `useMatchRoute()` to detect if on `/ide/$projectId`

**Temp Project Status**: ✅ **ELIMINATED**
- Explicit comment: "No temp projects - users must create projects explicitly via hub"
- No auto-creation of temp projects
- Clean routing: `/ide` → hub, `/ide/$projectId` → IDE workspace

### Code Flow

```
User navigates to /ide
    ↓
Platform guard checks canAccessIDE
    ↓
If mobile/tablet → Redirect to /hub
    ↓
If desktop with FSA → Show empty state
    ↓
User selects folder → Navigate to /ide/$projectId
User clicks "Create" → Navigate to /hub?action=create-project
```

### Issues Found
None - This route is clean and follows Phase 1 requirements.

---

## Route 2: notes.lazy.tsx

### File Location
`src/routes/notes.lazy.tsx`

### Current Behavior

**Platform Detection**:
```typescript
// Lines 44-45
const platform = getPlatformContract();
```

**Browser Mode Project (DEPRECATED)**:
```typescript
// Lines 48-50
// ⚠️ DEPRECATED: useBrowserModeProject will be removed in Phase 4
const browserProject = useBrowserModeProject();
```

**Routing Logic**:

1. **Desktop with FSA** (Lines 53-72):
   - Shows `ProjectPickerDialog` for FSA projects
   - User can select existing FSA project
   - User can click "Create New" → Navigate to `/hub?action=create-project`
   - User closes picker → Navigate to `/hub`

2. **Mobile/Tablet without FSA** (Lines 74-132):
   - **If browser project exists** (legacy):
     - Uses it temporarily
     - Shows deprecation warning in console
     - Creates welcome note if needed
   - **If no browser project**:
     - Redirects to `/hub?action=create-project&workspace=notes`

**Temp Project Status**: ⚠️ **PARTIALLY ELIMINATED**
- Browser-mode project is deprecated but still functional
- Used as fallback for mobile users without projects
- Creates `proj_browser-default` project automatically

### Code Flow

```
User navigates to /notes
    ↓
Platform detection (canAccessFSA)
    ↓
If desktop with FSA → Show ProjectPickerDialog
    ↓
If mobile/tablet → Check for browser-mode project
    ↓
If browser project exists → Use it (deprecated)
If no browser project → Redirect to /hub?action=create-project
```

### Issues Found

1. **Legacy Browser-Mode Project** (Lines 48-50, 76-132):
   - `useBrowserModeProject()` hook is deprecated but still active
   - Creates `proj_browser-default` project automatically
   - Confusing for users (pseudo-project vs real project)

2. **Inconsistent with IDE Route**:
   - IDE route redirects all users without projects to hub
   - Notes route creates pseudo-project for mobile users

3. **Migration Complexity**:
   - Welcome note creation logic (Lines 84-127) is complex
   - Should be handled by hub project creation flow

---

## Route 3: ide.$projectId.tsx

### File Location
`src/routes/ide.$projectId.tsx`

### Current Behavior

**Platform Guard (beforeLoad)**:
```typescript
// Lines 42-58
beforeLoad: async ({ params }) => {
  const platform = getPlatformContract();

  // ADR-033 D1: Mobile cannot access IDE
  if (!platform.canAccessIDE) {
    throw redirect({
      to: '/notes/$projectId',
      params: { projectId },
      search: { reason: 'mobile-not-supported' }
    });
  }
}
```

**Loader (INF-03 FIX)**:
```typescript
// Lines 61-81
loader: async ({ params }) => {
  const { projectId } = params;

  // Wait for Zustand store hydration
  await waitForHydration();

  // Query Dexie directly
  const record = await db.projects.get(projectId);

  if (!record) {
    throw redirect({ to: '/hub' });
  }

  return { project };
}
```

**Temp Project Status**: ✅ **ELIMINATED**
- No temp project creation
- Validates projectId in Dexie
- Redirects to `/hub` if project not found

### Code Flow

```
User navigates to /ide/$projectId
    ↓
Platform guard checks canAccessIDE
    ↓
If mobile → Redirect to /notes/$projectId
    ↓
Wait for Zustand hydration
    ↓
Query Dexie for project
    ↓
If project not found → Redirect to /hub
If project found → Load IDELayout
```

### Issues Found
None - This route is clean and follows Phase 1 requirements.

---

## Route 4: notes.$projectId.lazy.tsx

### File Location
`src/routes/notes.$projectId.lazy.tsx`

### Current Behavior

**Loader (INF-03 FIX)**:
```typescript
// Lines 46-66
loader: async ({ params }) => {
  const { projectId } = params;

  // Wait for Zustand store hydration
  await waitForHydration();

  // Query Dexie directly
  const record = await db.projects.get(projectId);

  if (!record) {
    throw redirect({ to: '/hub' });
  }

  return { project };
}
```

**Mobile Redirect Toast** (Lines 82-90):
```typescript
useEffect(() => {
  if (search?.reason === 'mobile-not-supported' && !toastShownRef.current) {
    toast.info('IDE requires desktop. Opening Notes workspace.', {
      duration: 4000,
      id: 'mobile-redirect-toast',
    });
  }
}, [search?.reason]);
```

**Temp Project Status**: ✅ **ELIMINATED**
- No temp project creation
- Validates projectId in Dexie
- Redirects to `/hub` if project not found

### Code Flow

```
User navigates to /notes/$projectId
    ↓
Wait for Zustand hydration
    ↓
Query Dexie for project
    ↓
If project not found → Redirect to /hub
If project found → Load NotesPage
    ↓
If redirected from IDE (mobile) → Show toast
```

### Issues Found
None - This route is clean and follows Phase 1 requirements.

---

## How Temp Projects Affect Routing

### Browser-Mode Project (`proj_browser-default`)

**Location**: `src/lib/workspace/browser-mode.ts`

**Purpose**:
- Originally created to allow mobile users to use Notes without creating projects
- Acts as a pseudo-project with IndexedDB storage
- Marked as `isTemp: true` and `isBrowserMode: true`

**Creation Flow**:
```typescript
// Lines 46-125
export async function getOrCreateBrowserModeProject(): Promise<Project | null> {
  // Check Dexie for existing project
  const existingRecord = await db.projects.get(BROWSER_MODE_PROJECT_ID);

  if (existingRecord) {
    // Update lastOpened
    await db.projects.update(BROWSER_MODE_PROJECT_ID, { lastOpened: new Date() });
    return existingRecord;
  }

  // Create browser mode project if it doesn't exist
  const browserProjectData: Project = {
    id: BROWSER_MODE_PROJECT_ID,
    name: BROWSER_MODE_DISPLAY_NAME,
    folderPath: 'Notes',
    storageType: 'indexeddb',
    isBrowserMode: true,
    isTemp: true,
    autoCreated: true,
  };

  await db.projects.put(dexieRecord);
  return browserProjectData;
}
```

**Usage in Routing**:
- Called by `useBrowserModeProject()` hook in `notes.lazy.tsx`
- Only active for mobile/tablet users without FSA
- Deprecated but still functional

### Routing Impact

**Current State**:
```
/ide (desktop) → Empty state → User creates/selects project
/ide (mobile) → Redirect to /hub
/ide/$projectId → Validate project → Load IDE

/notes (desktop with FSA) → ProjectPickerDialog → User selects project
/notes (mobile) → Browser-mode project (deprecated) → Load Notes
/notes/$projectId → Validate project → Load Notes
```

**Phase 1 Target State**:
```
/ide (desktop) → Empty state → User creates/selects project
/ide (mobile) → Redirect to /hub
/ide/$projectId → Validate project → Load IDE

/notes (desktop with FSA) → ProjectPickerDialog → User selects project
/notes (mobile) → Redirect to /hub (NO browser-mode project)
/notes/$projectId → Validate project → Load Notes
```

### Problems Caused by Browser-Mode Project

1. **Inconsistent User Experience**:
   - Desktop users must create projects
   - Mobile users get auto-created pseudo-project
   - Confusing project list (pseudo-project vs real projects)

2. **Technical Debt**:
   - Deprecated code still active
   - Complex migration logic for welcome notes
   - Additional database records to clean up

3. **ADR-033 Violation**:
   - ADR-033 D1: "Mobile Project Model: Single default (notes:browser-mode)"
   - This decision is now being reconsidered for Phase 1

4. **Routing Complexity**:
   - Different behavior for desktop vs mobile
   - Conditional logic in `notes.lazy.tsx`
   - Harder to maintain and test

---

## Phase 1 Changes Needed

### Change 1: Remove Browser-Mode Project from notes.lazy.tsx

**File**: `src/routes/notes.lazy.tsx`

**Lines to Remove**:
- Line 22: `import { useBrowserModeProject } from '@/infrastructure/persistence/stores/project/use-fsa-projects';`
- Lines 48-50: `const browserProject = useBrowserModeProject();`
- Lines 74-132: Entire `useEffect` block for browser-mode project handling

**New Behavior**:
```typescript
// Desktop with FSA → show project picker for FSA projects
if (platform.canAccessFSA) {
  return (
    <div className="h-full flex items-center justify-center bg-background">
      <ProjectPickerDialog
        open={true}
        onOpenChange={(open) => {
          if (!open) {
            navigate({ to: '/hub' });
          }
        }}
        targetWorkspace="notes"
        onCreateNew={() => {
          navigate({ to: '/hub', search: { action: 'create-project' } });
        }}
      />
    </div>
  );
}

// Mobile/tablet without FSA → redirect to hub to create project
useEffect(() => {
  navigate({ to: '/hub', search: { action: 'create-project', workspace: 'notes' } });
}, [navigate]);
```

### Change 2: Update use-fsa-projects.ts Deprecation Notice

**File**: `src/infrastructure/persistence/stores/project/use-fsa-projects.ts`

**Lines to Update**:
- Lines 36-47: Update deprecation notice to "Phase 1" instead of "Phase 4"

**New Comment**:
```typescript
/**
 * Custom hook to get browser-mode project for mobile
 *
 * ⚠️ DEPRECATED: This function will be removed in Phase 1.
 * Browser-mode pseudo-project pattern is deprecated.
 * Users should create real projects via hub.
 *
 * Always calls useLiveQuery at top level (no conditional)
 *
 * @returns Browser-mode project or null
 * @deprecated Use explicit project creation via hub instead.
 */
```

### Change 3: Archive browser-mode.ts (Optional for Phase 1)

**File**: `src/lib/workspace/browser-mode.ts`

**Action**: Move to `_bmad-ext/.archive/` with deprecation notice

**Reason**: Not used after Phase 1 changes, but keep for reference

### Change 4: Update ADR-033 Documentation

**File**: `_bmad-output/planning-artifacts/adr/ADR-033-correct-course-architectural-remediation-2026-01-16.md`

**Section to Update**: "Mobile Project Model"

**New Decision**:
```yaml
| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Mobile Project Model** | No default project | Users must create projects via hub (consistent with desktop) |
```

**Rationale**:
- Consistent user experience across platforms
- Eliminates pseudo-project confusion
- Simplifies routing logic
- Reduces technical debt

---

## Edge Cases to Handle

### Edge Case 1: Existing Browser-Mode Projects

**Scenario**: Users who already have `proj_browser-default` project in their database

**Handling**:
- Do NOT auto-delete existing browser-mode projects
- Allow users to access them via `/notes/$projectId` route
- Show deprecation notice in hub project list
- Provide migration path to create real project

**Implementation**:
```typescript
// In hub project list
if (project.isBrowserMode) {
  return (
    <div className="flex items-center gap-2">
      <span>{project.name}</span>
      <Badge variant="warning">Deprecated</Badge>
      <Button size="sm" onClick={() => migrateToRealProject(project)}>
        Migrate
      </Button>
    </div>
  );
}
```

### Edge Case 2: Mobile Users with No Projects

**Scenario**: Mobile user navigates to `/notes` with no projects

**Handling**:
- Redirect to `/hub?action=create-project&workspace=notes`
- Show clear message: "Create a project to use Notes workspace"
- Hub should guide user through project creation

**Implementation**:
```typescript
// In hub.tsx
const search = Route.useSearch();
if (search.action === 'create-project' && search.workspace === 'notes') {
  // Show project creation dialog pre-selected for Notes workspace
  showCreateProjectDialog({ defaultWorkspace: 'notes' });
}
```

### Edge Case 3: Desktop Users with FSA but No Projects

**Scenario**: Desktop user with FSA navigates to `/notes` with no projects

**Handling**:
- Show `ProjectPickerDialog` with empty state
- Show "Create New Project" button
- User can create project via hub

**Implementation**:
```typescript
// In ProjectPickerDialog
{projects.length === 0 && (
  <div className="text-center py-8">
    <p className="text-muted-foreground mb-4">No projects found</p>
    <Button onClick={onCreateNew}>Create New Project</Button>
  </div>
)}
```

### Edge Case 4: Invalid Project ID

**Scenario**: User navigates to `/notes/$projectId` with invalid or deleted project

**Handling**:
- Loader queries Dexie for project
- If not found, redirect to `/hub`
- Show error toast: "Project not found"

**Implementation**:
```typescript
// In notes.$projectId.lazy.tsx loader
if (!record) {
  toast.error('Project not found', {
    description: 'The project you are looking for does not exist or has been deleted.',
  });
  throw redirect({ to: '/hub' });
}
```

### Edge Case 5: Mobile User Tries to Access IDE

**Scenario**: Mobile user navigates to `/ide` or `/ide/$projectId`

**Handling**:
- Platform guard blocks access
- Redirects to `/hub` (for `/ide`) or `/notes/$projectId` (for `/ide/$projectId`)
- Shows toast: "IDE requires desktop. Opening Notes workspace."

**Implementation**:
```typescript
// In ide.tsx beforeLoad
if (!platform.canAccessIDE) {
  toast.info('IDE requires desktop. Opening Notes workspace.', {
    duration: 4000,
  });
  throw redirect({ to: '/hub', search: { reason: 'mobile-not-supported' } });
}
```

---

## Testing Checklist

### Unit Tests
- [ ] Test `notes.lazy.tsx` redirects mobile users to hub
- [ ] Test `notes.lazy.tsx` shows picker for desktop with FSA
- [ ] Test `ide.tsx` blocks mobile users
- [ ] Test `ide.$projectId.tsx` redirects mobile to notes
- [ ] Test `notes.$projectId.tsx` validates project ID

### Integration Tests
- [ ] Test end-to-end flow: Mobile user creates project via hub → Access Notes
- [ ] Test end-to-end flow: Desktop user selects folder → Access IDE
- [ ] Test end-to-end flow: Invalid project ID → Redirect to hub
- [ ] Test existing browser-mode project still accessible via `/notes/$projectId`

### Manual Testing
- [ ] Test on mobile device (no FSA)
- [ ] Test on desktop with FSA
- [ ] Test on desktop without FSA
- [ ] Test with existing browser-mode project
- [ ] Test with no projects

---

## Recommendations

### Immediate Actions (Phase 1)
1. ✅ Remove browser-mode project from `notes.lazy.tsx`
2. ✅ Update deprecation notices in `use-fsa-projects.ts`
3. ✅ Update ADR-033 documentation
4. ✅ Test all routing flows

### Future Actions (Phase 2+)
1. 📋 Implement migration path for existing browser-mode projects
2. 📋 Add deprecation notice in hub project list
3. 📋 Archive `browser-mode.ts` file
4. 📋 Clean up browser-mode projects from database (optional)

### Long-Term Considerations
1. 🎯 Consider adding "Quick Create" flow for mobile users
2. 🎯 Improve hub project creation UX for mobile
3. 🎯 Add onboarding tutorial for new users
4. 🎯 Consider project templates for quick setup

---

## Conclusion

The routing investigation reveals that **Phase 1 changes are straightforward**:

1. **IDE routes** are already clean and require no changes
2. **Notes routes** need browser-mode project removal from `notes.lazy.tsx`
3. **Browser-mode project** is deprecated but still functional
4. **Edge cases** are well-defined and can be handled with redirects and toasts

The main challenge is ensuring **consistent user experience** across platforms while maintaining **backward compatibility** for existing browser-mode projects.

**Estimated Effort**: 2-3 hours
- Code changes: 1 hour
- Testing: 1 hour
- Documentation: 30 minutes

**Risk Level**: Low
- Changes are isolated to routing logic
- No database schema changes required
- Existing projects remain accessible

---

**Report Generated**: 2026-01-16
**Next Steps**: Proceed with Phase 1 implementation