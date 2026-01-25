# HANDOFF: Investigation C - E2E User Journey Testing

**Handoff ID**: `hnd_20260125_100500_e2e_journeys`
**Created**: 2026-01-25T10:05:00+07:00
**Source Agent**: architect-ext
**Target Agent**: bmad-master → real-world-validator
**Status**: READY_FOR_EXECUTION
**Priority**: P0 (Critical validation)

---

## 1. EXECUTIVE SUMMARY

### Objective
Execute comprehensive end-to-end testing of 5 critical user journeys across all supported device types to validate EPIC-ARCH-03 deliverables and identify gaps before next development cycle.

### Why Now?
- EPIC-ARCH-03 is 85% complete - need validation before marking done
- Dev-team is fixing TypeScript/context issues in parallel
- This investigation is **read-only** - no code conflicts possible
- Results feed directly into next sprint planning

### Expected Duration
**2-3 hours** (can be extended if issues found)

### Expected Output
- Investigation report with pass/fail matrix
- Screenshots of any failures
- Prioritized remediation backlog
- Recommendations for EPIC-ARCH-04 scope

---

## 2. TOOL CONSTRAINTS (MANDATORY)

```yaml
tool_permissions:
  write: true      # Reports and screenshots ONLY
  edit: false      # NO code modifications
  bash: true       # Browser automation, dev server
  task: true       # Can delegate sub-investigations
  
role_boundaries:
  ALLOWED:
    - Run development server (pnpm dev)
    - Take screenshots
    - Navigate application
    - Fill forms and interact with UI
    - Write investigation reports
    - Document issues found
    
  FORBIDDEN:
    - Modify any source code files
    - Fix issues discovered (report only)
    - Install/uninstall dependencies
    - Commit changes to git
    - Modify configuration files
    
escalation:
  on_blocker: "Report to bmad-master, do NOT attempt fixes"
  on_critical_bug: "Document with screenshot, continue testing"
```

---

## 3. PRE-EXECUTION CHECKLIST

Before starting, verify:

```bash
# 1. Check dev server can start
pnpm dev
# Expected: Server starts on http://localhost:3000

# 2. Check browser automation available
# Chrome/Chromium must be installed

# 3. Verify no conflicting processes
lsof -i :3000
# Expected: No process OR only your dev server
```

### If Dev Server Fails
- Document the error
- Check if dev-team is running builds
- Wait 5 minutes and retry
- If persistent, escalate to bmad-master

---

## 4. USER JOURNEYS TO TEST

### Journey 1: Project Creation (Desktop FSA)

```yaml
journey_id: "J1-PROJECT-CREATE"
priority: P0
devices: ["desktop-chrome", "desktop-firefox"]
prerequisite: "No existing projects (fresh state preferred)"

steps:
  - step: 1
    action: "Navigate to http://localhost:3000"
    expected: "Hub page loads with 'New Project' option visible"
    screenshot: "j1-step1-hub.png"
    
  - step: 2
    action: "Click 'New Project' or '+' button"
    expected: "Project creation wizard opens"
    screenshot: "j1-step2-wizard.png"
    
  - step: 3
    action: "Enter project name: 'Test Project E2E'"
    expected: "Name field accepts input"
    
  - step: 4
    action: "Click 'Select Folder' to choose FSA directory"
    expected: "Native file picker opens"
    note: "If FSA not available, document and skip to J1-alt"
    
  - step: 5
    action: "Select any empty folder"
    expected: "Folder path displayed in wizard"
    
  - step: 6
    action: "Click 'Create Project'"
    expected: "Project created, redirected to project view"
    screenshot: "j1-step6-created.png"
    
  - step: 7
    action: "Verify project appears in sidebar"
    expected: "ProjectSidebar shows 'Test Project E2E'"
    screenshot: "j1-step7-sidebar.png"

success_criteria:
  - Project created successfully
  - FSA folder bound to project
  - Project visible in sidebar
  - No console errors

failure_actions:
  - Screenshot the failure
  - Check browser console for errors
  - Document exact step that failed
  - Continue to next journey
```

### Journey 2: Notes CRUD (Multi-Device)

```yaml
journey_id: "J2-NOTES-CRUD"
priority: P0
devices: 
  - "desktop-fsa"      # Primary
  - "desktop-indexeddb" # Fallback
  - "tablet-portrait"   # iPad simulation
  - "mobile-portrait"   # iPhone simulation

steps:
  - step: 1
    action: "Open existing project (or create one)"
    expected: "Project loads with plugin layout"
    
  - step: 2
    action: "Navigate to Notes plugin/view"
    expected: "Notes list visible (may be empty)"
    screenshot: "j2-step2-notes-list.png"
    
  - step: 3
    action: "Click 'New Note' or '+' button"
    expected: "BlockNote editor opens with empty note"
    screenshot: "j2-step3-new-note.png"
    
  - step: 4
    action: "Type: 'Test Note Title' as heading"
    expected: "Text appears in editor"
    
  - step: 5
    action: "Add paragraph: 'This is test content for E2E validation.'"
    expected: "Paragraph renders correctly"
    
  - step: 6
    action: "Wait 2 seconds (autosave)"
    expected: "Save indicator shows 'Saved' or similar"
    
  - step: 7
    action: "Refresh page (Ctrl+R / Cmd+R)"
    expected: "Note persists after reload"
    screenshot: "j2-step7-persisted.png"
    
  - step: 8
    action: "Delete the test note"
    expected: "Note removed from list"
    screenshot: "j2-step8-deleted.png"

device_specific_tests:
  mobile:
    - "Bottom navigation shows Notes icon"
    - "Touch scrolling works in editor"
    - "Keyboard doesn't obscure content"
  tablet:
    - "Sidebar collapses/expands correctly"
    - "Split view works if applicable"

success_criteria:
  - Create note works on all devices
  - Content persists after refresh
  - Delete works on all devices
  - No data loss observed
```

### Journey 3: AI Chat Interaction

```yaml
journey_id: "J3-CHAT-AI"
priority: P0
devices: ["desktop", "mobile"]
prerequisite: "Valid API key configured (or mock mode)"

steps:
  - step: 1
    action: "Open project"
    expected: "Project loads"
    
  - step: 2
    action: "Open Chat panel/plugin"
    expected: "Chat interface visible"
    screenshot: "j3-step2-chat.png"
    
  - step: 3
    action: "Type message: 'Hello, what can you help me with?'"
    expected: "Message appears in chat"
    
  - step: 4
    action: "Press Enter or click Send"
    expected: "Loading indicator shows"
    
  - step: 5
    action: "Wait for AI response (up to 30 seconds)"
    expected: "AI response appears"
    screenshot: "j3-step5-response.png"
    
  - step: 6
    action: "Check if response is coherent"
    expected: "Response is relevant to question"

api_key_scenarios:
  no_key:
    expected: "Prompt to configure API key"
    action: "Document and continue"
  invalid_key:
    expected: "Clear error message"
    action: "Document error handling quality"
  valid_key:
    expected: "AI responds successfully"

success_criteria:
  - Chat UI renders correctly
  - Messages send without error
  - AI responds (or clear error if no key)
  - Chat history persists
```

### Journey 4: IDE Code Editing (Desktop Only)

```yaml
journey_id: "J4-IDE-EDIT"
priority: P1
devices: ["desktop-fsa"]  # FSA required
prerequisite: "Project with code files"

steps:
  - step: 1
    action: "Open project with FSA binding"
    expected: "IDE view available"
    
  - step: 2
    action: "Navigate to IDE/FileTree plugin"
    expected: "File tree shows project files"
    screenshot: "j4-step2-filetree.png"
    
  - step: 3
    action: "Click on a .ts or .tsx file"
    expected: "Monaco editor opens with file content"
    screenshot: "j4-step3-monaco.png"
    
  - step: 4
    action: "Add a comment: '// E2E Test Comment'"
    expected: "Edit appears in editor"
    
  - step: 5
    action: "Press Ctrl+S / Cmd+S"
    expected: "Save indicator updates"
    
  - step: 6
    action: "Check actual file on disk"
    expected: "Comment persisted to file system"
    verification: "cat <filepath> | grep 'E2E Test Comment'"
    
  - step: 7
    action: "Remove the test comment"
    expected: "File restored"

mobile_behavior:
  expected: "IDE not available on mobile"
  verification: "Mobile shows redirect or disabled state"
  screenshot: "j4-mobile-blocked.png"

success_criteria:
  - File tree loads correctly
  - Monaco renders files
  - Edits save to FSA
  - Mobile correctly blocked
```

### Journey 5: Plugin Switching

```yaml
journey_id: "J5-PLUGIN-SWITCH"
priority: P1
devices: ["desktop", "tablet", "mobile"]

steps:
  - step: 1
    action: "Open project"
    expected: "Default plugin layout loads"
    screenshot: "j5-step1-default.png"
    
  - step: 2
    action: "Identify current active plugin"
    expected: "One plugin highlighted/active"
    
  - step: 3
    action: "Switch to Notes plugin"
    expected: "Notes view renders"
    screenshot: "j5-step3-notes.png"
    
  - step: 4
    action: "Switch to Chat plugin"
    expected: "Chat view renders"
    screenshot: "j5-step4-chat.png"
    
  - step: 5
    action: "Switch back to original plugin"
    expected: "Original state preserved"
    
  - step: 6
    action: "Reload page"
    expected: "Last active plugin remembered"

mobile_specific:
  - step: "m1"
    action: "Verify bottom navigation bar"
    expected: "Plugin icons visible at bottom"
    screenshot: "j5-mobile-nav.png"
    
  - step: "m2"
    action: "Tap different plugin icon"
    expected: "View switches smoothly"

success_criteria:
  - All plugins accessible
  - State preserved on switch
  - Mobile navigation works
  - No flicker or layout shift
```

---

## 5. DEVICE SIMULATION SETTINGS

### Desktop (Default)
- Viewport: 1920x1080
- User Agent: Default Chrome/Firefox

### Tablet Portrait
- Viewport: 768x1024
- User Agent: iPad
- Touch events enabled

### Tablet Landscape
- Viewport: 1024x768
- User Agent: iPad
- Touch events enabled

### Mobile Portrait
- Viewport: 375x812
- User Agent: iPhone 14
- Touch events enabled

### Mobile Landscape
- Viewport: 812x375
- User Agent: iPhone 14
- Touch events enabled

---

## 6. EXECUTION PROTOCOL

### Phase 1: Environment Setup (15 min)
```bash
# 1. Start dev server
cd /Users/apple/Documents/coding-projects/project-alpha-master
pnpm dev

# 2. Verify server running
curl http://localhost:3000 | head -20

# 3. Open browser (Chrome recommended)
# Navigate to http://localhost:3000

# 4. Open DevTools Console
# Monitor for JavaScript errors throughout testing
```

### Phase 2: Desktop Testing (45 min)
- Execute J1 through J5 on desktop Chrome
- Take screenshots at each checkpoint
- Document any failures immediately

### Phase 3: Tablet Testing (30 min)
- Use DevTools device simulation
- Execute J2, J3, J5 on tablet viewport
- Note any responsive layout issues

### Phase 4: Mobile Testing (30 min)
- Use DevTools device simulation
- Execute J2, J3, J5 on mobile viewport
- Verify bottom navigation
- Note any touch interaction issues

### Phase 5: Report Generation (30 min)
- Compile all screenshots
- Fill out results matrix
- Write remediation recommendations
- Create final report

---

## 7. OUTPUT REQUIREMENTS

### Report Location
```
_bmad-output/investigation-reports/INV-E2E-JOURNEYS-2026-01-25.md
```

### Screenshot Location
```
_bmad-output/investigation-reports/screenshots/e2e-2026-01-25/
```

### Report Format

```markdown
# E2E User Journey Investigation Report

**Date**: 2026-01-25
**Investigator**: real-world-validator
**Duration**: X hours
**Build**: [commit hash or version]

## Executive Summary
[2-3 sentence summary of findings]

## Results Matrix

| Journey | Desktop | Tablet | Mobile | Issues |
|---------|---------|--------|--------|--------|
| J1 | ✅/❌/⚠️ | N/A | N/A | [count] |
| J2 | ✅/❌/⚠️ | ✅/❌/⚠️ | ✅/❌/⚠️ | [count] |
| J3 | ✅/❌/⚠️ | ✅/❌/⚠️ | ✅/❌/⚠️ | [count] |
| J4 | ✅/❌/⚠️ | N/A | N/A | [count] |
| J5 | ✅/❌/⚠️ | ✅/❌/⚠️ | ✅/❌/⚠️ | [count] |

Legend: ✅ Pass | ❌ Fail | ⚠️ Partial

## Issues Found

### Issue 1: [Title]
- **Journey**: J[X] Step [Y]
- **Device**: [device]
- **Severity**: P0/P1/P2
- **Description**: [what happened]
- **Expected**: [what should happen]
- **Screenshot**: [link]
- **Console Errors**: [if any]

[Repeat for each issue]

## Console Errors Summary
[List any JavaScript errors observed]

## Recommendations

### Immediate (P0)
- [Issue requiring immediate fix]

### Next Sprint (P1)
- [Issue for next sprint]

### Backlog (P2)
- [Nice to have improvements]

## Screenshots
[List of all screenshots with captions]

## Appendix: Raw Test Log
[Step-by-step execution log]
```

---

## 8. SUCCESS CRITERIA

### Investigation Success
- [ ] All 5 journeys executed on all applicable devices
- [ ] Screenshots captured for each checkpoint
- [ ] All issues documented with severity
- [ ] Report generated in correct format
- [ ] No code modifications made

### Journey Success Thresholds

| Journey | Pass Threshold |
|---------|----------------|
| J1 | 100% steps pass on desktop |
| J2 | 80% steps pass across devices |
| J3 | Chat UI renders, messages send |
| J4 | 100% steps pass on desktop FSA |
| J5 | 90% steps pass across devices |

### Overall Assessment Criteria

| Rating | Criteria |
|--------|----------|
| **GREEN** | All journeys pass thresholds, <3 P2 issues |
| **YELLOW** | 1-2 journeys below threshold, or 1 P1 issue |
| **RED** | Any P0 issue, or 3+ journeys fail |

---

## 9. ESCALATION PROTOCOL

### Level 1: Minor Issue
- Document in report
- Continue testing
- No immediate escalation

### Level 2: Blocking Issue
- Screenshot immediately
- Check if workaround exists
- If no workaround, skip journey
- Note in report as BLOCKED

### Level 3: Critical Bug
- Stop testing that journey
- Document full reproduction steps
- Check if affects other journeys
- Continue with unaffected journeys
- Flag in report as CRITICAL

### Level 4: Environment Failure
- Dev server crashes
- Browser crashes repeatedly
- Cannot proceed with any testing
- **Escalate to bmad-master immediately**

---

## 10. CONTEXT FILES TO REFERENCE

```yaml
required_reading:
  - file: "new-fundamental-truths.md"
    purpose: "Understand strategic vision"
    
  - file: "_bmad-output/planning-artifacts/epics/EPIC-ARCH-03-layout-ux-2026-01-21.md"
    purpose: "Understand what was implemented"
    
  - file: "_bmad-output/planning-artifacts/adr/ADR-034-project-centric-architecture-2026-01-20.md"
    purpose: "Understand architecture decisions"
    
  - file: "AGENTS.md"
    purpose: "Governance rules"

optional_reading:
  - file: "_bmad-output/sprint-artifacts/stories/EPIC-ARCH-03/*-completion.md"
    purpose: "Implementation details"
```

---

## 11. PARALLEL EXECUTION NOTES

### What's Running in Parallel

| Team | Task | Potential Conflict |
|------|------|-------------------|
| dev-team | EPIC-TS-DEBT fixes | None - code changes only |
| sprint-manager | EPIC-CTX-CLEAN | None - YAML/docs only |
| **this investigation** | E2E Testing | None - read-only |

### Coordination Rules

1. **Do NOT restart dev server** without checking with dev-team
2. **Do NOT modify any files** except investigation reports
3. **If build breaks** during testing, wait for dev-team fix
4. **Report conflicts** to bmad-master immediately

### Communication

- Check LOOP_STATE.yaml for current team status
- If blocked by dev-team work, pause and document
- Resume when dev-team signals safe

---

## 12. COMPLETION CHECKLIST

Before marking investigation complete:

- [ ] All 5 journeys attempted
- [ ] Screenshots saved to correct location
- [ ] Report follows required format
- [ ] All issues have severity ratings
- [ ] Recommendations prioritized
- [ ] No code was modified
- [ ] LOOP_STATE.yaml updated with completion
- [ ] Handoff back to bmad-master

---

## 13. HANDOFF COMPLETION

When investigation complete, create callback artifact:

```yaml
# _bmad-output/handoffs/2026-01-25/e2e-journeys-callback.md

artifact_id: "hnd_20260125_HHMMSS_e2e_callback"
artifact_type: "handoff-callback"
parent_id: "hnd_20260125_100500_e2e_journeys"
source_agent: "real-world-validator"
target_agent: "bmad-master"
status: "COMPLETE"

summary: |
  E2E User Journey Investigation complete.
  [X] journeys passed, [Y] issues found.
  See full report at: _bmad-output/investigation-reports/INV-E2E-JOURNEYS-2026-01-25.md

key_findings:
  - finding_1: "[summary]"
  - finding_2: "[summary]"
  
remediation_items:
  - item_1: "[P0/P1/P2]: [description]"
  
next_recommended_action: "[what should happen next]"
```

---

**END OF HANDOFF DOCUMENT**

*This document is ready for bmad-master to delegate to real-world-validator.*
