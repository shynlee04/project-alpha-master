# Phase 3 Integration Test Plan
**Correct-Course V2 Sprint**

**Date**: 2026-01-21T16:00:00+07:00
**Status**: READY_FOR_EXECUTION
**Governance**: ZERO_TOLERANCE - Evidence required for every claim

---

## Test Summary

| Test ID | Name | Team | Priority | Status |
|---------|------|------|----------|--------|
| TEST-01 | Desktop IDE Full Journey | BOTH | P0 | PENDING |
| TEST-02 | Desktop Notes FSA Journey | BOTH | P0 | PENDING |
| TEST-03 | Mobile Notes Journey | BOTH | P0 | PENDING |

---

## TEST-01: Desktop IDE Full Journey

### Objective
Verify that FSA handle persistence works correctly - users can refresh the page without being re-prompted for folder access.

### Prerequisites
- Chrome 129+ on Desktop
- Clean browser state (clear IndexedDB + localStorage)

### Steps & Evidence

| Step | Action | Expected Result | Evidence |
|------|--------|-----------------|----------|
| 1 | Clear all browser data (DevTools → Application → Clear storage) | Clean slate | Screenshot of empty IndexedDB |
| 2 | Navigate to `/ide` | Project selector shows | Screenshot of hub/ide landing |
| 3 | Verify NO "Quick IDE (Temp Project)" button | Only "Select Project Folder" and "Browse Projects" visible | Screenshot |
| 4 | Click "Select Project Folder", pick a folder | Folder picker opens, project created | Screenshot of picker |
| 5 | After project creation, IDE loads with file tree | Files visible in explorer | Screenshot of file tree |
| 6 | Refresh page (Cmd+R or F5) | **NO folder picker prompt**, files load automatically | Screenshot + Console log |
| 7 | Open DevTools → Application → IndexedDB → fsaHandles | handleData contains actual handle (not mock object) | Screenshot of fsaHandles table |

### Validation Criteria
- [ ] No temp project button on desktop
- [ ] FSA handle persisted to IndexedDB (structuredClone worked)
- [ ] Page refresh does NOT show folder picker
- [ ] Files load automatically after refresh
- [ ] HydrationManager logs correct projectId (not 'ide')

### Console Evidence Required
```
[HydrationManager] Hydrating ideStore from Dexie...
[HydrationManager] Project ID: proj_abc123 (NOT 'ide')
[FSAHandlePersistence] Restored handle for proj_abc123
```

### Failure Modes
| Symptom | Root Cause | Related Story |
|---------|------------|---------------|
| Temp project button visible | CC-V2-A03 incomplete | A03 |
| Folder picker shows on refresh | CC-V2-B01 or CC-V2-B03 incomplete | B01, B03 |
| Wrong projectId in logs | CC-V2-B02 incomplete | B02 |
| Mock handle in fsaHandles | CC-V2-B03 incomplete | B03 |

---

## TEST-02: Desktop Notes FSA Journey

### Objective
Verify that Notes workspace saves content as `.md` files for FSA projects (ADR-033 D4).

### Prerequisites
- Chrome 129+ on Desktop
- At least one FSA project created

### Steps & Evidence

| Step | Action | Expected Result | Evidence |
|------|--------|-----------------|----------|
| 1 | Navigate to `/notes` on desktop | Project picker OR recent projects shown (NOT browser-mode auto-create) | Screenshot |
| 2 | Select existing FSA project OR create new one | Notes workspace loads | Screenshot of notes list |
| 3 | Click "New Note", add content (e.g., "Test content for TEST-02") | Note saves | Screenshot of editor with content |
| 4 | Wait 2+ seconds (debounce) OR click Save | Auto-save or manual save triggers | Console log: `[NoteStore-Sync] Auto-saved note...` |
| 5 | Open project folder in Finder/Explorer | `.md` file exists in `/project/notes/` | Screenshot of folder with .md file |
| 6 | Edit .md file externally (add line at bottom) | Change syncs back to BlockNote | Screenshot of content appearing in editor |
| 7 | Create second note, verify another .md file created | Each note = separate .md file | Screenshot of folder with 2+ .md files |

### Validation Criteria
- [ ] Desktop `/notes` does NOT auto-create browser-mode project
- [ ] FSA project notes save as `.md` files
- [ ] External .md edits sync to BlockNote
- [ ] File save handler registered (console log shows registration)

### Console Evidence Required
```
[NoteStore-Sync] Registered file save handler for project proj_abc123
[NoteStore-Sync] Auto-saved note xxx-xxx-xxx to file
```

### File System Verification
```
/MyProject/
├── notes/
│   ├── welcome.md
│   └── test-note-2026-01-15.md  ← Should exist
```

### Failure Modes
| Symptom | Root Cause | Related Story |
|---------|------------|---------------|
| Browser-mode auto-created on desktop | CC-V2-A01 incomplete | A01 |
| No .md files created | CC-V2-B04 incomplete | B04 |
| External edits don't sync | CC-V2-B04 incomplete | B04 |
| Old 'notes:browser-mode' ID in console | CC-V2-B05 incomplete | B05 |

---

## TEST-03: Mobile Notes Journey

### Objective
Verify that mobile users are redirected away from IDE and auto-create `proj_browser-default` for Notes.

### Prerequisites
- Chrome DevTools with mobile emulation enabled

### Steps & Evidence

| Step | Action | Expected Result | Evidence |
|------|--------|-----------------|----------|
| 1 | Open DevTools (F12), toggle device toolbar (Ctrl+Shift+M) | Mobile viewport active | Screenshot of mobile dimensions |
| 2 | Set device to iPhone 12 Pro or similar (390x844) | Mobile emulation | Screenshot |
| 3 | Navigate to `/ide` | Redirected to `/hub` with message explaining IDE is desktop-only | Screenshot of redirect |
| 4 | Navigate to `/notes` | Auto-creates `proj_browser-default`, loads notes | Screenshot + Console |
| 5 | Create a note, add content | Note saves to IndexedDB (NOT .md file) | Screenshot of note |
| 6 | Check Application → IndexedDB → db.notes | Note exists in database | Screenshot of IndexedDB |
| 7 | Check Application → IndexedDB → db.projects | Project ID is `proj_browser-default` | Screenshot |

### Validation Criteria
- [ ] Mobile `/ide` redirects to hub (IDE blocked)
- [ ] Mobile `/notes` auto-creates `proj_browser-default`
- [ ] Notes save to IndexedDB (no .md files on mobile)
- [ ] No browser-mode ID with old format ('notes:browser-mode')

### Console Evidence Required
```
[PlatformDetection] deviceType: mobile, storageType: indexeddb
[BrowserMode] Using proj_browser-default for notes
```

### Failure Modes
| Symptom | Root Cause | Related Story |
|---------|------------|---------------|
| IDE accessible on mobile | CC-V2-A03 incomplete (or separate issue) | A03 |
| Old 'notes:browser-mode' ID in console | CC-V2-B05 incomplete | B05 |
| Mobile shows project picker (should auto-create) | CC-V2-A01 incomplete | A01 |

---

## Test Execution Template

Copy this template for each test execution:

```markdown
## TEST-XX Execution Results

**Executed by**: [Your Name]
**Execution Date**: 2026-01-21THH:mm:ss+07:00
**Environment**: Chrome [version], Desktop/Mobile

### Step Results
| Step | Status | Evidence | Notes |
|------|--------|----------|-------|
| 1 | [PASS/FAIL] | [Link to screenshot] | |
| 2 | [PASS/FAIL] | [Link to screenshot] | |
| ... | ... | ... | |

### Console Logs
```
[Paste relevant console output here]
```

### Overall Result
- [ ] PASS - All steps successful
- [ ] PARTIAL - Some failures (see notes)
- [ ] FAIL - Critical failures

### Issues Found
[List any bugs or unexpected behavior]
```

---

## Success Criteria (All Must Pass)

| Criterion | Related Tests | Status |
|-----------|---------------|--------|
| SC-01: Desktop IDE refresh loads without picker | TEST-01 | PENDING |
| SC-02: Desktop Notes shows project picker (not browser-mode) | TEST-02 | PENDING |
| SC-03: FSA Notes save as .md files | TEST-02 | PENDING |
| SC-04: Hydration uses correct projectId | TEST-01 | PENDING |
| SC-05: Mobile cannot access IDE | TEST-03 | PENDING |
| SC-06: All projectIds match proj_* format | TEST-03 | PENDING |
| SC-07: TypeScript 0 errors | Pre-validated | ✅ PASS |

---

## Governance Checklist

Before marking Phase 3 complete:

- [ ] All three tests executed
- [ ] Screenshots saved for each step
- [ ] Console logs captured
- [ ] Success criteria validated
- [ ] Any failures documented with root cause
- [ ] Regression testing performed (no broken existing features)

---

## Next Steps After Testing

### If ALL TESTS PASS
1. Update LOOP_STATE.yaml: `current.phase: "PHASE_3_COMPLETE"`
2. Update sprint file: mark all success_criteria as `PASS`
3. Proceed to Phase 4: Documentation & Handoff

### If TESTS FAIL
1. Document failure in test results
2. Identify root cause (which story)
3. Create bug ticket with evidence
4. Re-run failed test after fix

---

**Test Plan Version**: 1.0
**Last Updated**: 2026-01-21T16:00:00+07:00
**Governance Agent**: EXCALIBUR
