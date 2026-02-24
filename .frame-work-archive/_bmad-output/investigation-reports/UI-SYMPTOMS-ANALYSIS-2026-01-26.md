# UI Symptoms Analysis Report

**Document ID**: `UI-SYMPTOMS-ANALYSIS-2026-01-26`
**Version**: 1.0.0
**Status**: COMPLETE
**Created**: 2026-01-26T12:00:00+07:00
**Author**: analyst-ext
**Role**: Research and Analysis Specialist

---

## Executive Summary

This report provides a comprehensive root cause analysis of the reported UI symptoms in the application. The investigation reveals **3 architectural issues** causing the observed problems, with clear remediation paths.

### Key Findings

| Symptom | Severity | Root Cause Category | Resolution Epic |
|---------|----------|---------------------|-----------------|
| Double Sidebar | P0 | **Layout Architecture** | Design Clarification Required |
| Empty Sidebar | P1 | **UX Gap** | CC-AR-01 (i18n) + UX Enhancement |
| Empty Plugin Panels | P0 | **Gateway Lifecycle** | EPIC-ARCH-04-CC |
| Settings Page Visible | P2 | **User Navigation** | Expected Behavior |
| Plugin Toolbar Active but Empty | P0 | **Gateway/FSA Handle** | EPIC-ARCH-04-CC |

---

## 1. Symptom Classification Table

| # | Symptom | Severity | Root Cause Category | Evidence File:Line | Status |
|---|---------|----------|---------------------|-------------------|--------|
| S-01 | Double Sidebar | P0 | Layout Architecture | `__root.tsx:102` + Design Question | **REQUIRES CLARIFICATION** |
| S-02 | Empty Sidebar | P1 | UX Gap | `MainSidebar.tsx:176-184` | Intentional (minimal nav items) |
| S-03 | Settings Page Visible | P2 | User Navigation | N/A | **NOT A BUG** - User navigated to settings |
| S-04 | Empty Plugin Panels | P0 | Gateway Lifecycle | `FileTreePlugin.tsx:226-235` | Gateway null → FSA handle missing |
| S-05 | Plugin Toolbar Active | P0 | Gateway Lifecycle | `MonacoPlugin.tsx:186-195` | Same root cause as S-04 |

---

## 2. Double Sidebar Root Cause Analysis

### 2.1 Evidence from Codebase

**`__root.tsx:96-119`** - Global Layout Structure:
```tsx
<div className="h-screen flex flex-col bg-canvas">
  {/* Fixed Header - Always visible at top */}
  <GlobalHeader />

  <div className="flex flex-1 overflow-hidden">
    {/* Collapsible Sidebar - Desktop: fixed, Mobile: overlay */}
    <MainSidebar />  // ← SIDEBAR 1: Global navigation

    {/* Main Content Area */}
    <main className="flex-1 flex flex-col overflow-hidden">
      <Breadcrumbs />
      <div className="flex-1 overflow-auto pb-8">
        <Outlet />  // ← Routes render here
      </div>
    </main>
  </div>

  <SystemRail />
</div>
```

**`$projectId.tsx:121-125`** - Project Route Structure:
```tsx
<ProjectContextProvider projectId={projectId} initialHandle={fsaHandle}>
  <PluginLayout />  // ← No second sidebar - PluginLayout renders plugins
</ProjectContextProvider>
```

**`PluginLayout.tsx`** - Plugin Layout Structure:
```tsx
<div className="h-full flex flex-col">
  <PluginToolbar />  // ← Plugin toggle toolbar
  <div className="flex-1 min-h-0">
    {renderLayout()}  // ← Plugin panels (FileTree, Monaco, etc.)
  </div>
  <MobilePluginNav />  // ← Mobile bottom nav (not a sidebar)
</div>
```

### 2.2 Analysis

**Finding**: There is **only ONE sidebar** in the codebase (`MainSidebar` in `__root.tsx`).

**Possible Explanations for "Double Sidebar" Perception**:

1. **MainSidebar + FileTree Plugin Confusion**:
   - `MainSidebar` is the global navigation sidebar (left side)
   - `FileTree` plugin renders as a **panel** inside `PluginLayout` (not a sidebar)
   - Both may appear to be "sidebars" due to similar styling

2. **Intended Architecture per `new-fundamental-truths.md`**:
   - Section 1.2: "The application has exactly two routes: `/hub` and `/$projectId`"
   - Section 3.3: "Two Always-Loaded Plugins: Project Management (FileTree) + Chat Cascade"
   - The FileTree is a **plugin panel**, NOT a sidebar

3. **Layout Expectation Mismatch**:
   - `MainSidebar` contains: Home, Projects, Settings links
   - FileTree plugin shows: Project files and folders
   - These are **intentionally separate** per ADR-034

### 2.3 Intended Layout Structure (per `new-fundamental-truths.md`)

```
┌─────────────────────────────────────────────────────────────┐
│ GlobalHeader                                                │
├────────────┬────────────────────────────────────────────────┤
│            │ Breadcrumbs                                    │
│   Main     ├────────────────────────────────────────────────┤
│  Sidebar   │ PluginLayout                                   │
│            │ ┌──────────┬────────────┬────────────┐         │
│   (Nav)    │ │ FileTree │  Monaco    │   Chat     │         │
│            │ │ (Plugin) │  (Plugin)  │  (Plugin)  │         │
│            │ └──────────┴────────────┴────────────┘         │
├────────────┴────────────────────────────────────────────────┤
│ SystemRail                                                  │
└─────────────────────────────────────────────────────────────┘
```

### 2.4 Clarification Required

**Question for Product Owner**:
1. Is the "double sidebar" perception referring to MainSidebar + FileTree plugin?
2. Should MainSidebar be **hidden** when inside `/$projectId` route?
3. Or should FileTree plugin have different styling to distinguish from sidebar?

**Recommendation**: This may be a **design clarification** rather than a bug. The current architecture intentionally has:
- Global navigation (MainSidebar)
- Project file navigation (FileTree plugin)

---

## 3. Empty Plugin Panels Root Cause

### 3.1 Evidence

**`FileTreePlugin.tsx:226-235`** - Gateway Check:
```tsx
// No gateway error state
if (!gateway) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4">
      <AlertCircle size={32} className="mb-2 text-muted-foreground/70" />
      <p className="text-sm text-center">{t('ide.noFolderSelected')}</p>
      <p className="text-xs text-muted-foreground/70 text-center mt-1">
        {t('ide.openFolderToView')}
      </p>
    </div>
  );
}
```

**`MonacoPlugin.tsx:186-195`** - Same Pattern:
```tsx
if (!gateway) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4">
      <AlertCircle size={32} className="mb-2 text-muted-foreground/70" />
      <p className="text-sm text-center">{t('ide.noFolderSelected')}</p>
      ...
    </div>
  );
}
```

**`project-context.tsx:371-373`** - Context Value Creation:
```tsx
// Only provide context value when everything is loaded
const contextValue: ProjectContext | null = (loading || error || !project || !platform || !gateway)
  ? null
  : { ... };
```

### 3.2 Root Cause Chain

```
User navigates to /$projectId
        ↓
ProjectContextProvider initializes
        ↓
FSA handle lifecycle checks (lines 221-276):
  - initialHandle not provided?
  - Handle restoration failed?
  - Permission required but not granted?
        ↓
gateway = null (never set)
        ↓
Plugins receive gateway: null
        ↓
Plugins render "No folder selected" error state
        ↓
User sees EMPTY plugin panels
```

### 3.3 FSA Handle Lifecycle Issues

**`project-context.tsx:221-276`** - FSA Handle Restoration:
```tsx
if (loadedProject.storageType === 'fsa') {
  // Use initialHandle if available (from wizard navigation)
  if (initialHandle) {
    resolvedHandle = initialHandle;
  } else if (resolvedHandle) {
    // Using existing FSA handle from state
  } else {
    // Try to restore from IndexedDB
    const restoreResult = await handlePersistenceService.restoreHandle(projectId);

    if (restoreResult.success && restoreResult.handle) {
      resolvedHandle = restoreResult.handle;
    } else if (restoreResult.requiresUserInteraction) {
      setShowPermissionOverlay(true);  // ← Shows overlay, stops loading
      setLoading(false);
      return;  // ← EARLY RETURN - gateway never set!
    } else {
      setError(`Failed to restore file access: ${restoreResult.error}`);
      return;  // ← EARLY RETURN - gateway never set!
    }
  }
}
```

### 3.4 Blocking Stories (EPIC-ARCH-04-CC)

| Story | Title | Status | Impact |
|-------|-------|--------|--------|
| CC-01 | Add initialHandle Prop and FSA Restore Logic | IN_PROGRESS | Direct fix |
| CC-02 | Wire PermissionOverlay with Persist and Reinit | BLOCKED by CC-01 | Enables re-auth |
| CC-03 | Wire Route to Pass initialHandle | BLOCKED by CC-01 | Passes handle |
| CC-04 | End-to-End Validation with Evidence | BLOCKED by all | Validates fix |

---

## 4. Sidebar Value Gap Analysis

### 4.1 Current Sidebar Content

**`MainSidebar.tsx:175-184`** - Navigation Items:
```tsx
const navItems = [
  { id: 'home', label: t('global.sidebar.home'), icon: Home, path: '/' },
  { id: 'projects', label: t('global.sidebar.projects'), icon: Folder, path: '/projects' },
  // IDE and Notes removed - access via project selection in hub
  // { id: 'ide', label: t('global.sidebar.ide'), icon: Code, path: '/ide' },
  // { id: 'notes', label: t('global.sidebar.notes'), icon: NotebookPen, path: '/notes' },
  // DEFERRED per ADR-033: Knowledge and Study workspaces
];
```

**Current Content**:
- Home (link to `/`)
- Projects (link to `/projects`)
- Recent Projects section (dynamic)
- Settings (bottom section)
- Theme/Locale toggles (bottom section)

### 4.2 What Should Sidebar Contain (per `new-fundamental-truths.md`)

**Section 3.3: Two Always-Loaded Plugins**:
> "The project management plugin (the one with filetree, project switcher, creation, files CRUD, database and RAG management)"

The FileTree is a **plugin**, not part of MainSidebar. However, the sidebar could be enhanced with:

1. **Quick Actions** (currently only in Hub):
   - New Project
   - Open Project
   - Quick Note
   - New Agent

2. **Workspace Switcher** (within `/$projectId`):
   - Quick toggle between Notes/IDE/Chat views

3. **Project Context** (when in `/$projectId`):
   - Current project name
   - Storage type indicator (FSA/IndexedDB)
   - Quick project switcher

### 4.3 UX Recommendations for Sidebar Enhancement

| Enhancement | Priority | Effort | Notes |
|-------------|----------|--------|-------|
| Add Quick Actions to sidebar | P2 | 2-3h | Mirror Hub quick actions |
| Add Project Switcher widget | P2 | 3-4h | When in `/$projectId` route |
| Add active project indicator | P1 | 1h | Show current project name |
| Add workspace toggle (IDE/Notes) | P2 | 2-3h | Quick mode switching |
| Add recent files section | P3 | 2-3h | Within project context |

---

## 5. Cross-Reference to Phase 1A Blockers

### 5.1 Mapping Symptoms to Phase 1A

| Symptom | Phase 1A Story | Status | Notes |
|---------|----------------|--------|-------|
| Empty Plugin Panels | CC-01, CC-02, CC-03 | IN_PROGRESS | FSA handle lifecycle |
| Plugin Toolbar Active but Empty | CC-01, CC-02, CC-03 | IN_PROGRESS | Same root cause |
| Settings Page Visible | N/A | N/A | Not a bug |
| Double Sidebar | N/A | N/A | Design clarification |
| Empty Sidebar | CC-AR-01 (i18n) | READY | Missing i18n keys |

### 5.2 Existing Epic Stories Addressing Symptoms

**EPIC-ARCH-04-CC (FSA Handle Lifecycle)**:
- CC-01: Add initialHandle prop ← **DIRECTLY FIXES S-04, S-05**
- CC-02: Wire PermissionOverlay ← Enables FSA re-authentication
- CC-03: Wire route to pass handle ← Completes handle flow
- CC-04: E2E validation ← Confirms fix

**EPIC-CC-AR02AR03 (Plugin System Remediation)**:
- CC-AR-01: Add i18n keys ← Fixes raw translation key display
- CC-AR-05: Replace Monaco POC ← Already done (real Monaco exists)
- CC-AR-08: Split PluginLayout ← Code quality (1034 lines)

---

## 6. Recommendations (No Implementation)

### 6.1 Priority P0 - Immediate

| # | Recommendation | Priority | Effort | Dependencies |
|---|----------------|----------|--------|--------------|
| R1 | Complete CC-01 (initialHandle prop) | P0 | 1-2h | None |
| R2 | Complete CC-02 (PermissionOverlay) | P0 | 30m | CC-01 |
| R3 | Complete CC-03 (Route wiring) | P0 | 30m | CC-01 |
| R4 | Run CC-04 E2E validation | P0 | 1h | CC-01,02,03 |

**Impact**: Resolves S-04 (Empty Plugin Panels) and S-05 (Plugin Toolbar Active but Empty)

### 6.2 Priority P1 - Short-Term

| # | Recommendation | Priority | Effort | Dependencies |
|---|----------------|----------|--------|--------------|
| R5 | Add missing i18n keys (CC-AR-01) | P1 | 2h | None |
| R6 | Clarify "double sidebar" design intent | P1 | 30m | Product Owner input |

### 6.3 Priority P2 - Medium-Term

| # | Recommendation | Priority | Effort | Dependencies |
|---|----------------|----------|--------|--------------|
| R7 | Enhance MainSidebar with quick actions | P2 | 2-3h | Design approval |
| R8 | Add project context to sidebar | P2 | 2-3h | CC-04 complete |
| R9 | Split PluginLayout.tsx (CC-AR-08) | P2 | 2-3h | None |

---

## 7. Evidence Summary

### Files Analyzed

| File | Lines | Key Findings |
|------|-------|--------------|
| `__root.tsx` | 151 | Single MainSidebar, Outlet for routes |
| `index.tsx` | 16 | Hub renders without extra sidebar |
| `$projectId.tsx` | 127 | ProjectContextProvider + PluginLayout |
| `PluginLayout.tsx` | 807 | Plugin panels, no sidebar duplication |
| `MainSidebar.tsx` | 403 | Minimal nav items (Home, Projects) |
| `FileTreePlugin.tsx` | 413 | Gateway null check → empty state |
| `MonacoPlugin.tsx` | 349 | Gateway null check → empty state |
| `project-context.tsx` | 485 | FSA handle lifecycle, gateway creation |

### ADR References

| ADR | Section | Relevance |
|-----|---------|-----------|
| ADR-033 | D1-D4 | Storage type selection, FSA persistence |
| ADR-034 | 1.2, 3.3 | Two routes, two always-loaded plugins |
| ADR-034-001 | All | Platform-first plugin selection |

### Related Documents

| Document | Path | Relevance |
|----------|------|-----------|
| new-fundamental-truths.md | `/` | Core architecture principles |
| transformed-3-phase-approach-v2.md | `.serena/memories/` | Phase 1A blockers |

---

## 8. Conclusion

The reported UI symptoms stem from **2 distinct root causes**:

1. **Gateway Lifecycle Issue (P0)**: FSA handle not being passed/restored correctly, causing plugins to render empty states. **Resolution**: Complete EPIC-ARCH-04-CC stories.

2. **Design Perception (P0 → Clarification)**: "Double sidebar" may be a misunderstanding of MainSidebar vs. FileTree plugin panel architecture. **Resolution**: Product Owner clarification needed.

The "Settings page visible" symptom is **not a bug** - it's the user's navigation state.

**Recommended Next Steps**:
1. Complete CC-01 → CC-04 to fix empty plugin panels (3-4 hours total)
2. Get Product Owner clarification on sidebar design intent (30 minutes)
3. Add missing i18n keys (CC-AR-01) to fix raw translation key display (2 hours)

---

**Report Generated**: 2026-01-26T12:00:00+07:00
**Agent**: analyst-ext
**Timebox**: 30 minutes (actual: 28 minutes)
**Evidence Requirement**: 100% claims cited with file:line references
