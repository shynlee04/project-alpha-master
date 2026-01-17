# Quick-Dev Coordination - Hub Flow Debug Validation

**Date**: 2026-01-22
**Status**: EXPERIMENTAL - NOT SUSTAINABLE
**Purpose**: Validate current findings before implementation commitment

---

## CRITICAL WARNING: THIS IS NOT A SUSTAINABLE APPROACH

### Why This Approach is Wrong

**Hot Load Complexity - Oversimplified in Previous Analysis**

Previous analysis suggested hot-load could be fixed by:
- "Implement project change watcher that triggers file tree refresh"

**This is WRONG because it ignores:**

1. **Permission Persistence**
   - FSA handles must be stored in IndexedDB (Chrome DevRel pattern)
   - Handles cannot be persisted directly - need handle registry
   - Need to re-request permissions if handles not stored

2. **FSA Synchronization**
   - File system watching via FileSystemObserver (Chrome 129+) or polling
   - Detect external editor changes (user opens .md files in other apps)
   - BlockNote ↔ Markdown bidirectional sync
   - Conflict resolution dialogs when local dirty + external change

3. **Why Dexie on Desktop with FSA?**
   - FSA handles need IndexedDB for persistence anyway
   - Dexie stores metadata: titles, order, favorites, RAG index
   - FSA stores: file content, folder structure
   - They are COMPLEMENTARY, not redundant

4. **Handle Lifecycle Management**
   - Handles are revoked on page close
   - Must request new permissions on page reload
   - Need handle verification before every FSA operation

**Correct Approach**: Hot-load requires complete file sync strategy implementation (EPIC-FS, not a simple fix).

---

## Quick-Dev Session Constraints

### HARD CONSTRAINTS

**NO CODE CREATION UNLESS**:
- I can find DOUBLE the amount of documentation/archiving to justify
- User explicitly approves
- Only for validation experiments, NOT implementation

**What CAN be done**:
- Console.log instrumentation
- Existing code modification for debugging
- Validation checks only
- Temporary diagnostic functions

**What CANNOT be done**:
- Create new components
- Create new store slices
- Create new utility files
- Implement fixes (that's for next phase)

---

## Quick-Dev Session Plan

### Objective

Validate that the findings from domain scan and verification report are accurate:
1. Platform detection actually uses screen width (not capability)
2. Router bypass exists (`window.location.href`)
3. Store access patterns are inconsistent
4. Recent projects feature is incomplete
5. "Allow open folder" causes issues

### Success Criteria

✅ **Confirmation**: Dev confirms each finding with evidence
✅ **Failure**: Dev finds findings are WRONG - we can deflect wrong theories
✅ **Timebox**: 30 minutes total

### Validation Checklist

#### Validation 1: Platform Detection (5 min)

**Finding**: Platform check uses screen size, not browser capability

**Validate**:
- [ ] Open DevTools Console
- [ ] Run: `window.innerWidth > 1024` (current implementation)
- [ ] Run: `'showDirectoryPicker' in window` (correct implementation)
- [ ] Check file: `src/infrastructure/filesystem/platform-contract.ts`
- [ ] Confirm: Which method is used in `getPlatformContract()`?
- [ ] Log output to console

**Evidence Required**:
- Screenshot of console showing both checks
- Copy of actual code from platform-contract.ts (lines 1-50)
- Current vs expected behavior description

**If Finding is WRONG**:
- Document: Platform actually uses capability correctly
- Mark this finding as false positive

---

#### Validation 2: Router Bypass (5 min)

**Finding**: `ProjectPickerDialog.tsx` uses `window.location.href` causing full reload

**Validate**:
- [ ] Open file: `src/presentation/components/hub/ProjectPickerDialog.tsx`
- [ ] Search for: `window.location.href`
- [ ] Confirm: Line number and context
- [ ] Check if TanStack Router `navigate()` is available
- [ ] Try to trigger project selection in browser
- [ ] Open DevTools Network tab - confirm full page reload occurred

**Evidence Required**:
- Code snippet showing `window.location.href` usage
- Network tab screenshot showing full reload
- Comparison with route-based navigation example

**If Finding is WRONG**:
- Document: Actually uses router correctly
- Check if reload is intentional (maybe for fresh state?)

---

#### Validation 3: Store Access Patterns (5 min)

**Finding**: Direct `getState()` calls break reactivity

**Validate**:
- [ ] Search codebase: `useProjectStore.getState()`
- [ ] Check: ProjectPickerDialog.tsx (line ~159)
- [ ] Check: HubHomePage.tsx (line ~186)
- [ ] Add console.log: `console.log('Project ID:', useProjectStore.getState().currentProjectId)`
- [ ] Try to navigate to IDE
- [ ] Check console: Does currentProjectId update correctly?

**Evidence Required**:
- List of all `getState()` usage locations
- Console logs showing state not updating
- Compare with `useProjectStore()` hook usage

**If Finding is WRONG**:
- Document: Direct access works fine, reactivity not needed
- Maybe reactivity is handled differently?

---

#### Validation 4: Recent Projects Feature (5 min)

**Finding**: Recent projects component exists but doesn't connect to store

**Validate**:
- [ ] Open file: `src/presentation/components/hub/RecentProjectsSection.tsx`
- [ ] Check: Does it have data source? (placeholder vs store)
- [ ] Search: `recentProjects` in project store
- [ ] Check: Does store have `recentProjects` slice?
- [ ] Try to create a project - does it add to recent projects?

**Evidence Required**:
- Code showing RecentProjectsSection data source
- Store schema (project store type definition)
- Console log after project creation - check recent projects update

**If Finding is WRONG**:
- Document: Recent projects fully functional
- Maybe just UI not displaying correctly?

---

#### Validation 5: "Allow Open Folder" Feature (5 min)

**Finding**: Random folder loads without project registration

**Validate**:
- [ ] Search: `allowOpenFolder` or "Allow open folder" text
- [ ] Find component implementing this feature
- [ ] Check: Does it call `projectStore.createProject()`?
- [ ] Check: Does it register folder handle to IndexedDB?
- [ ] Try to open a folder - check DevTools Application > IndexedDB
- [ ] Look for new entry in `projects` table

**Evidence Required**:
- Code showing "allow open folder" implementation
- IndexedDB screenshot before/after opening folder
- Console logs showing project registration or lack thereof

**If Finding is WRONG**:
- Document: Folder properly registers as project
- Maybe user expectation wrong about what "project" means?

---

#### Validation 6: Hot Load Mechanism (5 min) - MARKED AS NEEDS MORE RESEARCH

**Finding**: Monaco and file tree don't reactively reload on project change

**Validate**:
- [ ] Open two projects in browser (switch between them)
- [ ] Check: Does Monaco editor reload content?
- [ ] Check: Does file tree refresh file list?
- [ ] Add console.log in IDE route: `useEffect` on projectId change
- [ ] Search: `useEffect` with `[projectId]` dependency in IDE layout
- [ ] Check: Is there a project change watcher?

**Evidence Required**:
- Console logs showing project change detection
- Screenshot of file tree not updating
- Code showing project change handling (or lack thereof)

**NOTE**: This is known to be COMPLEX. Do NOT attempt to fix. Only validate that it's broken.

---

## Dev Instructions

### What You Should Do

1. **Read This Document First** (5 min)
   - Understand what to validate
   - Understand constraints (NO code creation)
   - Understand evidence requirements

2. **Execute Validations Sequentially** (25 min)
   - Validation 1: Platform detection
   - Validation 2: Router bypass
   - Validation 3: Store patterns
   - Validation 4: Recent projects
   - Validation 5: Allow open folder
   - Validation 6: Hot load (observation only)

3. **Collect Evidence** (As You Go)
   - Screenshots where requested
   - Console logs copied
   - Code snippets
   - Step-by-step observations

4. **Report Back** (At End)
   - For each validation: CONFIRMED or REFUTED
   - Evidence summary
   - Any unexpected findings
   - Total time taken

### What You Should NOT Do

❌ **DO NOT** create new files
❌ **DO NOT** implement any fixes
❌ **DO NOT** modify existing code (except temporary console.logs)
❌ **DO NOT** attempt to fix hot load
❌ **DO NOT** spend more than 30 minutes total

### Allowed Temporary Changes

```typescript
// ✅ ALLOWED: Add console logs for debugging
console.log('[VALIDATION] Platform check result:', platform);

// ✅ ALLOWED: Temporarily expose state to window
window.__DEV_VALIDATION__ = {
  currentProjectId: useProjectStore.getState().currentProjectId
};

// ❌ NOT ALLOWED: Create new validation component
// ❌ NOT ALLOWED: Implement actual fix
// ❌ NOT ALLOWED: Create new utility file
```

---

## Learning Log Template

### If Findings are CONFIRMED

**What We Learned**:
- Our investigation was accurate
- We can proceed with confidence to implementation phase

**Next Steps**:
- Use domain-scan and verification reports as implementation guide
- Fix Priority 1 (Critical) issues first
- Fix Priority 2 (High) issues second
- Hot load requires dedicated EPIC-FS sprint

**Document for Future**:
- "Quick-dev validation on 2026-01-22 confirmed findings from domain scan"
- "Hot load complexity underestimated - requires full EPIC-FS implementation"

### If Findings are REFUTED

**What We Learned**:
- Our investigation made incorrect assumptions
- We need to rethink the approach

**Document for Future**:
- "Quick-dev validation on 2026-01-22 found findings WRONG"
- "Root cause: [explain what was wrong]"
- "Lesson: [what to avoid in future investigations]"

**Next Steps**:
- Re-run domain scan with corrected understanding
- Focus only on validated issues
- Deflect wrong theories to prevent waste

---

## Session Status Tracking

| Validation | Status | Time Spent | Evidence Collected | Finding |
|------------|--------|------------|-------------------|----------|
| 1. Platform Detection | ⏳ Pending | - | - | TBD |
| 2. Router Bypass | ⏳ Pending | - | - | TBD |
| 3. Store Patterns | ⏳ Pending | - | - | TBD |
| 4. Recent Projects | ⏳ Pending | - | - | TBD |
| 5. Allow Open Folder | ⏳ Pending | - | - | TBD |
| 6. Hot Load | ⏳ Pending | - | - | TBD |

**Total Time**: 0 / 30 minutes

---

## Handoff to Dev

**When You're Ready**:
1. Read this document completely
2. Execute validations sequentially
3. Collect evidence as you go
4. Report back with findings
5. Timebox: 30 minutes max

**After Validation**:
- We will update domain-scan report with confirmed/refuted findings
- We will create final implementation guide based on VALIDATED issues only
- We will document lessons learned to prevent repeat mistakes

**Contact**:
- This is an EXPERIMENTAL quick-dev session
- Questions? Ask before starting
- Stuck? Stop and report progress

---

## Metadata

**Created**: 2026-01-22
**Author**: ext-master orchestrator
**Session ID**: ses_quickdev_hub_flow_validation_20260122
**Related Documents**:
- `domain-scan-file-system-2026-01-22.md`
- `fundamental-truth-verification-2026-01-22.md`
- `check-list-for-fundamental-truth.md`
- `ADR-033-correct-course-architectural-remediation-2026-01-16.md`

**Tags**: quick-dev, validation, hub-flow, NOT-SUSTAINABLE, hot-load-complex
