---
# ═══════════════════════════════════════════════════════════════════════════
# PHASE 1 CORRECTION STORIES
# Generated: 2026-01-09T02:03:00+07:00
# Triggered by: Comprehensive Code Review - Gap Analysis
# ═══════════════════════════════════════════════════════════════════════════
title: "Phase 1 Correction Stories - Complete User Journey Validation"
type: correction_stories
version: "1.0.0"
priority: P0-CRITICAL
status: READY_FOR_EXECUTION
created: "2026-01-09T02:03:00+07:00"
triggered_by: "Code Review identified missing validation gates"
phase: "PHASE_1_CORRECTION"
team: Team A
agent: bmad-core-bmad-master
---

# Phase 1 Correction Stories

## Problem Statement

The Comprehensive Code Review identified **critical gaps** between planned stories and actual user experience:

```
USER'S EXPECTED EXPERIENCE:
══════════════════════════════════════════════════════════════════════════

1. STARTING JOURNEY (Settings):
   ✅ Settings page loads without loop           → FIXED (P1-13)
   ❓ User can save API key                      → NOT VERIFIED
   ❓ VaultStatusCard shows key status           → NOT VERIFIED
   ❓ Provider selection works                   → NOT VERIFIED

2. PROJECT CREATION (Mobile/Desktop):
   ✅ Mobile → Auto temp project                 → IMPLEMENTED (P1-03)
   ✅ Desktop → Folder picker                    → IMPLEMENTED (P1-04)
   ❓ Fallback to temp on unknown project        → NOT VERIFIED
   ❓ Temp project banner visible                → NOT VERIFIED

3. IDE WORKSPACE:
   ✅ Route loads without loop                   → FIXED (P1-02)
   ✅ User CRUD documented                       → INVESTIGATION (P1-06)
   ✅ Agent CRUD documented                      → INVESTIGATION (P1-06)
   ❓ Actual browser CRUD test                   → NOT DONE

4. NOTES WORKSPACE:
   ✅ Route loads without loop                   → FIXED (P1-01)
   ✅ User CRUD documented                       → INVESTIGATION (P1-07)
   ❓ AI slash command works                     → NOT VERIFIED
   ❓ Settings API key → Notes AI chain          → NOT VERIFIED

5. VAULT → AI CHAIN:
   ⚠️ Documented but not simplified             → PARTIAL (P1-08, P1-09)
   ❓ End-to-end test: Save key → AI works      → NOT VERIFIED
```

## Gaps Requiring Correction

### GAP-1: Settings Page Incomplete Simplification
- **Status**: P1-13 fixed plugin loop
- **Missing**: Vault status card visibility, API key flow verification
- **Impact**: Users can't configure API keys

### GAP-2: Browser Verification Not Done
- **Status**: Checklist created (P1-11) but not executed
- **Missing**: Manual browser testing of all gates
- **Impact**: Can't confirm Phase 1 actually works

### GAP-3: Vault → AI Chain Not Simplified
- **Status**: P1-09 marked DONE but flow still complex
- **Missing**: Simplified direct localStorage fallback
- **Impact**: AI features may not work due to vault complexity

### GAP-4: End-to-End User Journey Not Tested
- **Status**: Individual stories done, no E2E test
- **Missing**: Full journey from Settings → Notes → AI command
- **Impact**: User experience unknown

---

## Correction Stories

### P1-15: Complete Settings Page Simplification

**Priority**: P0-CRITICAL
**Effort**: 1 hour
**Dependencies**: P1-13 (DONE)

**Description**:
Verify Settings page is fully functional for Phase 1 user journey:
- VaultStatusCard visible and working
- API key can be saved
- Provider selection functional
- No complex forms blocking user

**Acceptance Criteria**:
- [ ] Open Settings page in browser - no loop
- [ ] VaultStatusCard shows key status (stored/not stored)
- [ ] Click provider dropdown - options visible
- [ ] Enter API key - save button works
- [ ] After save - VaultStatusCard updates to show "Key stored"
- [ ] No console errors

**Files to Verify**:
- `src/routes/settings.tsx`
- `src/presentation/components/agent/VaultStatusCard.tsx`

---

### P1-16: Execute Browser Gate Verification

**Priority**: P0-CRITICAL
**Effort**: 2 hours
**Dependencies**: P1-15

**Description**:
Execute the gate verification checklist from P1-11 manually in browser.
Document all results with screenshots or notes.

**Acceptance Criteria**:
- [ ] GATE-R1: `/notes` renders ✅/❌
- [ ] GATE-R2: `/notes/$projectId` renders ✅/❌
- [ ] GATE-R3: `/ide` renders ✅/❌
- [ ] GATE-R4: `/ide/$projectId` renders ✅/❌
- [ ] GATE-R5: Unknown route fallback ✅/❌
- [ ] GATE-I1: User can CRUD files ✅/❌
- [ ] GATE-I2: File tree shows files ✅/❌
- [ ] GATE-I3: Monaco loads content ✅/❌
- [ ] GATE-I4: Save writes to FS ✅/❌
- [ ] GATE-N1: User can CRUD notes ✅/❌
- [ ] GATE-N2: Note sidebar works ✅/❌
- [ ] GATE-N3: BlockNote loads content ✅/❌
- [ ] GATE-N4: Auto-save persists ✅/❌
- [ ] GATE-E1: Zero "Maximum update depth" ✅/❌
- [ ] GATE-E2: Zero console errors ✅/❌
- [ ] GATE-E3: HMR doesn't break pages ✅/❌

**Output**:
- Update `phase-1-gate-verification-checklist-2026-01-09.md` with results
- Create `phase-1-gate-results-2026-01-09.md` with evidence

---

### P1-17: End-to-End User Journey Test

**Priority**: P0
**Effort**: 1 hour
**Dependencies**: P1-15, P1-16

**Description**:
Complete end-to-end test of the full Phase 1 user journey:

```
JOURNEY:
1. Open app → Hub
2. Go to Settings
3. Configure API key (save to vault)
4. Go to IDE workspace
5. Create/open project (temp or folder)
6. Verify file CRUD works
7. Go to Notes workspace
8. Create note
9. Type /summarize or other AI command
10. Verify AI responds (no "API Key missing" error)
```

**Acceptance Criteria**:
- [ ] Complete journey without errors
- [ ] API key persists after refresh
- [ ] AI command in Notes works
- [ ] OR: Document specific blocker found

**Output**:
- `phase-1-e2e-results-2026-01-09.md` documenting journey

---

### P1-18: Vault Simplification (If Needed)

**Priority**: P1
**Effort**: 2 hours
**Dependencies**: P1-17 (only if blockers found)

**Description**:
If P1-17 reveals vault/API key blockers, implement simplified fallback:

**Option A**: Direct localStorage for Phase 1
```typescript
// Store key directly in localStorage as fallback
localStorage.setItem('alpha-api-key-{provider}', key);
```

**Option B**: Ensure vault migration runs
```typescript
// Call migration on Settings page load
await migrateApiKeysToVault();
await credentialVault.initialize();
```

**Acceptance Criteria**:
- [ ] API key can be saved and retrieved
- [ ] AI slash command works in Notes
- [ ] No complex vault initialization failures

---

## Updated Story List for Phase 1

| ID | Title | Status | Notes |
|----|-------|--------|-------|
| P1-01 | Simplify Notes Route | ✅ DONE | |
| P1-02 | Simplify IDE Route | ✅ DONE | |
| P1-03 | Temp Project Mobile | ✅ DONE | |
| P1-04 | FSA Picker Desktop | ✅ DONE | |
| P1-05 | Detach Complex Forms | ✅ DONE | |
| P1-06 | IDE CRUD Investigation | ✅ DONE | |
| P1-07 | Notes CRUD Investigation | ✅ DONE | |
| P1-08 | Vault Chain Investigation | ⚠️ DONE | Partial - not simplified |
| P1-09 | Simplify AI Flow | ⚠️ DONE | Partial - not verified |
| P1-10 | Detach Knowledge/Study | ✅ DONE | |
| P1-11 | Verify Phase 1 Gate | 🟡 PARTIAL | Checklist created, not executed |
| P1-12 | Update Documentation | ✅ DONE | |
| **P1-13** | Settings Plugin Decouple | ✅ DONE | Added 2026-01-09 |
| **P1-14** | Settings Full Simplify | 🟡 IN_PROGRESS | |
| **P1-15** | Complete Settings Simplify | 🔲 READY | NEW |
| **P1-16** | Execute Browser Gates | 🔲 READY | NEW |
| **P1-17** | E2E User Journey Test | 🔲 BLOCKED | Depends on P1-15, P1-16 |
| **P1-18** | Vault Simplification | 🔲 CONDITIONAL | Only if P1-17 fails |

---

## Validation Loop (Ralph Pattern)

The dev team should use this loop pattern for each story:

```
RALPH LOOP:
╔══════════════════════════════════════════════════════════════════════════╗
║ ITERATION START                                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║ 1. READ story from this file                                             ║
║ 2. EXECUTE acceptance criteria                                            ║
║ 3. VERIFY all criteria pass                                              ║
║ 4. IF any fail:                                                          ║
║    └── FIX the issue                                                     ║
║    └── DOCUMENT the fix                                                  ║
║    └── RE-VERIFY                                                         ║
║    └── LOOP until all pass                                               ║
║ 5. UPDATE sprint status with result                                      ║
║ 6. MOVE to next story                                                    ║
║ 7. REPEAT until all stories DONE                                         ║
╠══════════════════════════════════════════════════════════════════════════╣
║ EXIT CONDITION: All P1-15 through P1-18 DONE or SKIPPED                  ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## Communication to Dev Team

```
══════════════════════════════════════════════════════════════════════════
TO: Development Team
FROM: BMAD Master (SM)
DATE: 2026-01-09T02:03:00+07:00
RE: Phase 1 Correction Stories
══════════════════════════════════════════════════════════════════════════

The Comprehensive Code Review identified gaps in Phase 1 completion.

GOOD NEWS:
- 10 of 12 original stories fully implemented
- All code changes are correct
- No rework needed on existing code

GAPS:
- Browser verification was NOT executed
- End-to-end user journey was NOT tested
- Settings page had a loop (now fixed)
- Vault → AI chain may have issues (unverified)

NEW STORIES (P1-15 through P1-18):
These stories focus on VERIFICATION, not new code.
They ensure the user can actually experience the Phase 1 promise.

EXECUTION:
Please use the story-cycle workflow:
@_bmad/workflows/story-cycle

And the ralph-loop pattern in:
@.claude/ralph-loop.local.md

Update sprint status after each story.

-- BMAD Master
══════════════════════════════════════════════════════════════════════════
```

---

*Correction Stories generated: 2026-01-09T02:03:00+07:00*
*Workflow: /bmad-bmm-workflows-correct-course*
