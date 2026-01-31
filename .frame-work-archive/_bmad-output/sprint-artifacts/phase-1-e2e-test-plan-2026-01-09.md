---
# ═══════════════════════════════════════════════════════════════════════════
# PHASE 1 END-TO-END USER JOURNEY TEST
# Generated: 2026-01-09T03:45:00+07:00
# Story: P1-17 - E2E User Journey Test
# ═══════════════════════════════════════════════════════════════════════════

title: "Phase 1 End-to-End User Journey Test"
type: e2e_test
version: "1.0.0"
priority: P0-CRITICAL
status: READY_FOR_EXECUTION
created: "2026-01-09T03:45:00+07:00"
triggered_by: "P1-17 - E2E User Journey Test"
phase: "PHASE_1_CORRECTION"
team: Team A
agent: bmad-core-bmad-master
---

# Phase 1 End-to-End User Journey Test

## Test Objective

Verify the complete Phase 1 user journey works end-to-end:
**Settings → Configure API Key → IDE → Notes → AI Command**

## Prerequisites

- [ ] Dev server running: `http://localhost:3000`
- [ ] Browser ready (Chrome/Firefox/Safari)
- [ ] Console open (F12 or Cmd+Opt+I)
- [ ] Have a test API key ready (for LLM provider)

---

## TEST JOURNEY

### Step 1: Landing & Hub Navigation

**Action**: Navigate to `http://localhost:3000`

**Expected Results**:
- [ ] Home page loads without errors
- [ ] Sidebar navigation visible
- [ ] No "Maximum update depth exceeded" in console
- [ ] No red errors in console

**Console Check**: ❌ No errors | ⚠️ Warnings OK | 📝 Notes: _______________

**Status**: ✅ PASS | ❌ FAIL

---

### Step 2: Settings Page Access

**Action**: Click "Settings" in sidebar OR navigate to `http://localhost:3000/settings`

**Expected Results**:
- [ ] Settings page loads
- [ ] VaultStatusCard visible (showing "0 API keys stored" or similar)
- [ ] Provider list visible
- [ ] No infinite loading spinner
- [ ] No console errors

**Console Check**: ❌ No errors | ⚠️ Warnings OK | 📝 Notes: _______________

**Status**: ✅ PASS | ❌ FAIL

---

### Step 3: Configure API Key

**Action**:
1. Click on a provider (e.g., "OpenAI Compatible" or "Anthropic")
2. Enter a test API key (e.g., `sk-test-12345`)
3. Click "Save Key" button

**Expected Results**:
- [ ] Dialog/Modal opens for provider configuration
- [ ] API key input accepts text
- [ ] Save button is clickable
- [ ] After save: success toast/notification appears
- [ ] VaultStatusCard updates to show "1 API key stored"
- [ ] No console errors

**Console Check**: ❌ No errors | ⚠️ Warnings OK | 📝 Notes: _______________

**Critical Bug**: If VaultStatusCard doesn't update after save → **P1-15 FIX VERIFIED**

**Status**: ✅ PASS | ❌ FAIL | ⚠️ PARTIAL

---

### Step 4: Verify API Key Persistence (Refresh Test)

**Action**: Refresh page (Cmd+R or F5) → Go back to Settings

**Expected Results**:
- [ ] API key still shows as stored
- [ ] VaultStatusCard still shows "1 API key stored"
- [ ] No "Key lost" errors

**Console Check**: ❌ No errors | ⚠️ Warnings OK | 📝 Notes: _______________

**Status**: ✅ PASS | ❌ FAIL

---

### Step 5: Navigate to IDE Workspace

**Action**: Click "Projects" or "IDE" in sidebar OR navigate to `http://localhost:3000/ide`

**Expected Results**:
- [ ] IDE workspace loads
- [ ] File tree panel visible (left)
- [ ] Editor panel visible (center/right)
- [ ] No console errors

**Console Check**: ❌ No errors | ⚠️ Warnings OK | 📝 Notes: _______________

**Status**: ✅ PASS | ❌ FAIL

---

### Step 6: Create/Open Project

**Action**:
- Look for "New Project" button OR
- Check if temp project auto-created OR
- Try selecting a folder if on desktop

**Expected Results**:
- [ ] Can create a new project (temp or folder-selected)
- [ ] Project name/ID visible in UI
- [ ] File tree shows project files (even if empty initially)
- [ ] No console errors

**Console Check**: ❌ No errors | ⚠️ Warnings OK | 📝 Notes: _______________

**Status**: ✅ PASS | ❌ FAIL | ⚠️ PARTIAL (temp only, no folder picker)

---

### Step 7: Verify File CRUD Works

**Create Test**:
- Click "New File" button (if available)
- Enter filename: `test.txt`
- File appears in tree

**Read Test**:
- Click on the file
- Editor shows file content

**Edit Test**:
- Type "Hello World" in editor
- Content appears in editor

**Save Test**:
- Press Cmd+S or Ctrl+S
- No "Failed to save" error

**Expected Results**:
- [ ] Can create files
- [ ] Can read file content
- [ ] Can edit file content
- [ ] Can save files

**Console Check**: ❌ No errors | ⚠️ Warnings OK | 📝 Notes: _______________

**Status**: ✅ PASS | ❌ FAIL | ⚠️ PARTIAL

---

### Step 8: Navigate to Notes Workspace

**Action**: Click "Notes" in sidebar OR navigate to `http://localhost:3000/notes`

**Expected Results**:
- [ ] Notes workspace loads
- [ ] Notes sidebar visible (if notes exist)
- [ ] Editor area visible
- [ ] No console errors

**Console Check**: ❌ No errors | ⚠️ Warnings OK | 📝 Notes: _______________

**Status**: ✅ PASS | ❌ FAIL

---

### Step 9: Create Note

**Action**: Click "New Note" button

**Expected Results**:
- [ ] New note created
- [ ] Note appears in sidebar
- [ ] Editor area shows note (empty or with template)
- [ ] No console errors

**Console Check**: ❌ No errors | ⚠️ Warnings OK | 📝 Notes: _______________

**Status**: ✅ PASS | ❌ FAIL

---

### Step 10: Type AI Command

**Action**: In the note editor, type `/summarize` or press `/` to see AI commands

**Expected Results**:
- [ ] AI command menu appears OR
- [ ] Can type `/summarize` and see AI option
- [ ] Command is recognized (not treated as plain text)

**Console Check**: ❌ No errors | ⚠️ Warnings OK | 📝 Notes: _______________

**Status**: ✅ PASS | ❌ FAIL | ⚠️ PARTIAL

---

### Step 11: Execute AI Command

**Action**: Select the AI summarize command and execute it

**Expected Results**:
- [ ] AI processing indicator appears
- [ ] No "API Key missing" error
- [ ] No "Vault not initialized" error
- [ ] AI response appears (even if "simulated" or error about invalid key)

**Console Check**: ❌ No errors | ⚠️ Warnings OK | 📝 Notes: _______________

**Critical**: If "API Key missing" → **Vault chain broken (triggers P1-18)**

**Status**: ✅ PASS | ❌ FAIL | ⚠️ PARTIAL

---

## SUMMARY RESULTS

### Overall Journey Status

| Step | Description | Status | Notes |
|------|-------------|--------|-------|
| 1 | Landing page | ___ | |
| 2 | Settings access | ___ | |
| 3 | Configure API key | ___ | |
| 4 | Key persistence | ___ | |
| 5 | IDE workspace | ___ | |
| 6 | Project creation | ___ | |
| 7 | File CRUD | ___ | |
| 8 | Notes workspace | ___ | |
| 9 | Create note | ___ | |
| 10 | AI command access | ___ | |
| 11 | AI execution | ___ | |

**Total Pass**: ___ / 11

**Total Fail**: ___ / 11

**Total Partial**: ___ / 11

---

## BLOCKERS FOUND

If any step failed, document here:

| Step | Issue | Severity | Triggers P1-18? |
|------|-------|----------|------------------|
| | | | |

---

## NEXT STEPS

- **If ALL PASS**: Phase 1 complete! Update sprint status to COMPLETE
- **If FAILURES found**: Document and determine if P1-18 (Vault Simplification) is needed
- **If VAULT/API KEY issues**: Execute P1-18 to implement fallback

---

## Playwright MCP Automation (When Available)

```javascript
// Example Playwright MCP automation sequence
await browser_navigate("http://localhost:3000/settings");
await browser_take_screenshot("step1-settings.png");
await browser_click("[data-testid='provider-selector']");
await browser_click("[data-testid='provider-anthropic']");
await browser_type("[data-testid='api-key-input']", "sk-test-key");
await browser_click("[data-testid='save-button']");
await browser_wait_for(2000);
await browser_take_screenshot("step2-key-saved.png");
// ... continue journey
```

---

*Test Plan Generated: 2026-01-09T03:45:00+07:00*
*Workflow: BMAD V6 - Ralph Loop - Phase 1 Correction*
*Story: P1-17 - E2E User Journey Test*
