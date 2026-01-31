# Validation Loop Strategy: Phase 1 Discovery

**Date:** 2026-01-17
**Orchestrator:** BMAD Master Agent
**Approach:** Iterative Cross-Validation Loop
**Version:** 2.0

---

## 🔄 NEW APPROACH OVERVIEW

### Problem Statement
Initial Phase 1 discovery had 68.4% accuracy with 5 hallucinations:
1. ❌ EnhancedChatInterface (603 lines) - Does NOT exist
2. ❌ God stores in wrong directory (3 files searched deprecated `src/lib` instead of canonical `src/infrastructure`)
3. ❌ Deprecated directory counts wrong (84 claimed vs 48 actual = 73% error)
4. ⚠️ 2 god stores claimed but not verified (5/8 not checked)
5. ⚠️ File counts not verifiable (482 components, 38 stores - can't verify with glob)

### Root Cause
- Agent made claims without providing evidence
- Governance agent didn't cross-validate with another agent
- No iterative loop to fix inaccuracies
- Process stopped at 68.4% instead of continuing to 100%

---

## 🎯 NEW VALIDATION STRATEGY: 3-AGENT CROSS-VALIDATION

### Agent Roles

| Agent | Role | Tool Permissions |
|--------|------|-----------------|
| **Scanner Agent** | Scans codebase, makes claims | write: true, read: true, grep: true, glob: true, bash: false |
| **Analyst Agent** | Validates scanner claims with evidence | write: true, read: true, grep: true, glob: true, bash: false |
| **Governance Agent** | Final authority - checks if analyst validation is correct | write: true, read: true, grep: true, glob: true, bash: false |

---

## 🔄 VALIDATION LOOP PROTOCOL

### Iteration 1: Scanner → Analyst → Governance

#### Step 1: Scanner Agent Makes Claim
**Agent:** Scanner (dev-ext)
**Task:** Make claim with evidence requirement
**Output:** Claim statement (e.g., "EnhancedChatInterface exists at path X with 600 lines")

**Rule:**
- **NO pre-information** given to scanner
- **NO hints** about what should be found
- **MUST ask for evidence**: file path, line number, grep output

#### Step 2: Analyst Agent Validates Claim
**Agent:** Analyst (analyst-ext)
**Task:** Verify scanner claim with concrete evidence
**Validation Methods:**
- Read file at claimed path
- Count actual lines
- Verify exact line content matches claim
- Grep for patterns claimed

**Output:**
```
Claim: "EnhancedChatInterface exists at src/presentation/components/ide/EnhancedChatInterface.tsx with 603 lines"
Verification:
- File exists: NO
- Actual: Directory src/presentation/components/ide/ has no EnhancedChatInterface.tsx file
- Evidence: filesystem_list_directory('src/presentation/components/ide/') shows [list of files]
- Status: HALLUCINATED
```

**Rule:**
- **NO pre-information** about what analyst should find
- **MUST provide evidence**: file path, line numbers, directory listing, grep output

#### Step 3: Governance Agent Cross-Checks
**Agent:** Governance (bmad-governance)
**Task:** Final authority check - is analyst validation correct?
**Cross-Check Methods:**
- Verify analyst's evidence matches scanner's claim
- Read analyst's evidence source files
- Verify analyst didn't pre-load information
- Check validation logic is sound

**Output:**
```
Scanner Claim: "EnhancedChatInterface exists..."
Analyst Validation: "File does NOT exist"

Governance Cross-Check:
- Read analyst evidence: src/presentation/components/ide/ directory listing
- Verify: EnhancedChatInterface.tsx not in listing
- Read analyst's file read: Failed (file not found error)
- Conclusion: Analyst validation is CORRECT
- Accuracy: Scanner = 0%, Analyst = 100%
```

**Rule:**
- **NO pre-decision** about who is right
- **MUST cross-check** with own evidence gathering
- **If governance disagrees with analyst**: Must explain WHY with evidence

#### Step 4: Iteration Decision

**If 100% Match:**
- Mark claim as VERIFIED
- Proceed to next claim
- Continue until all claims verified

**If < 100% Match (Scanner Wrong):**
- Mark claim as HALLUCINATED
- Ask scanner to re-scan with corrected method
- **DO NOT PROCEED** until scanner provides correct claim

**If < 100% Match (Analyst Wrong):**
- Mark claim as UNVERIFIED
- Ask analyst to re-validate with new method
- Check governance cross-check logic

**If Both Wrong:**
- Mark claim as DISPUTED
- Add to disputed claims list
- Manual review required

---

## 📊 ACCURACY TRACKING

### Per-Claim Accuracy

| Claim ID | Scanner Claim | Analyst Validation | Governance Cross-Check | Final Status |
|----------|--------------|---------------------|----------------------|-------------|
| C-001 | EnhancedChatInterface 603 lines | File does NOT exist | Analyst correct | HALLUCINATED |
| C-002 | NoteEditor 1,089 lines | 1,089 lines | Analyst correct | VERIFIED |
| C-003 | Dexie-react-hooks import at line 4 | Import exists | Analyst correct | VERIFIED |

### Cumulative Accuracy

Formula:
```
Accuracy % = (VERIFIED claims / Total claims) * 100
```

Thresholds:
- **> 90%**: Proceed to Phase 2
- **70-90%**: Fix remaining < 30% issues
- **< 70%**: Re-run entire Phase 1

### Real-Time Dashboard

```
Iteration Status:
┌─────────────────────────────────────────────────┐
│ Current Iteration: 3                        │
│ Total Claims: 19                               │
│ Verified: 12 (63.2%)                          │
│ Hallucinated: 5 (26.3%)                       │
│ Unverified: 2 (10.5%)                       │
│ Accuracy: 63.2%                               │
├─────────────────────────────────────────────────┤
│ Target Accuracy: > 90%                        │
│ Current vs Target: -26.8% (gap)              │
│ Remaining to Verify: 7 claims                    │
└─────────────────────────────────────────────────┘
```

---

## 🚫 PROTOCOL RULES (NON-NEGOTIABLE)

### Rule 1: NO Pre-Information to Agents
**Forbidden:**
```markdown
❌ DO NOT give scanner hints like "look for EnhancedChatInterface"
❌ DO NOT tell analyst "expect to find X violations"
❌ DO NOT suggest what evidence they should collect
❌ DO NOT pre-validate claims before agents return
```

**Required:**
```markdown
✅ Ask scanner: "Make claims about codebase with evidence requirements"
✅ Ask analyst: "Verify this claim with evidence"
✅ Ask governance: "Check if analyst validation is correct"
```

---

### Rule 2: ALWAYS Require Evidence

**For Every Agent Return:**
```markdown
Scanner Agent Output Format:
```json
{
  "claim_id": "C-001",
  "claim_type": "component_inventory | store_inventory | technical_debt",
  "claim": "EnhancedChatInterface exists at src/presentation/components/ide/EnhancedChatInterface.tsx with 603 lines",
  "evidence_required": ["file_path", "line_count", "file_content"]
}
```

**If Scanner Cannot Provide Evidence:**
```markdown
⚠️ CLAIM REJECTED - No evidence provided

Required Evidence for This Claim:
- File path (absolute, not relative)
- Line count (actual count from reading file)
- File content (paste relevant lines)
- Grep output (show pattern matches)
- Directory listing (if claiming file exists)

Please re-scan and provide evidence.
```

**Governance Agent Authority:**
```markdown
⛔ GOVERNANCE ENFORCEMENT

If scanner claim lacks evidence → REJECT claim immediately
If analyst validation lacks evidence → REJECT validation immediately
If governance cross-check lacks evidence → REJECT cross-check immediately

NO EVIDENCE = NO PROCEED
```

---

### Rule 3: Cross-Pass Results Without Stopping

**Protocol:**
```
Scanner Agent Returns Claim
       ↓
Analyst Agent Validates Claim
       ↓
Governance Agent Cross-Checks Validation
       ↓
Decision:
  ✅ 100% match → Next claim
  ❌ Scanner wrong → Scanner re-scans
  ❌ Analyst wrong → Analyst re-validates
  ❌ Both wrong → Disputed list

Loop Continues Until:
  Accuracy > 90% OR
  All claims verified
```

**Key:**
- ✅ **DO NOT STOP** when Phase 1 is "done"
- ✅ **STOP ONLY** when accuracy > 90% (or user says stop)
- ✅ **ALWAYS update** workflow-status and master-plan after each iteration

---

### Rule 4: Update Both Workflow Status AND Master Plan

**After Each Iteration:**

#### Update `bmm-workflow-status.yaml`:
```yaml
current_validation:
  phase: "PHASE_1_DISCOVERY"
  iteration: 3
  total_claims: 19
  verified: 12
  hallucinated: 5
  unverified: 2
  accuracy: 63.2%
  target_accuracy: 90.0%
  gap: 26.8%
  status: "ITERATING"
  agents_active:
    - scanner: "dev-ext (session_id: XXX)"
    - analyst: "analyst-ext (session_id: XXX)"
    - governance: "bmad-governance (session_id: XXX)"
  next_actions:
    - "Verify claim C-013 (P0 cross-layer violation)"
    - "Re-verify claim C-004 (god store path)"
```

#### Update `discovery-framework-2026-01-17/master-plan.md`:
```markdown
## Phase 1: Domain-Specific Discovery
**Status:** ITERATING (Not Complete)
**Iteration:** 3 of N
**Current Accuracy:** 63.2% (Target: > 90%)

### Claims Status
| ID | Scanner Claim | Analyst Validation | Governance Check | Status |
|----|--------------|---------------------|-------------------|--------|
| C-001 | ... | ... | ... | VERIFIED |
| C-002 | ... | ... | ... | HALLUCINATED |

### Next Iteration
- Verify 7 remaining unverified claims
- Target accuracy > 90%
```

**Both files updated after EACH iteration**

---

### Rule 5: Example: EnhancedChatInterface Verification

**How This Claim Should Be Validated:**

**Scanner Agent:**
```markdown
Claim: "EnhancedChatInterface exists as a god component at src/presentation/components/ide/EnhancedChatInterface.tsx with 603 lines"

**Evidence Required:** 
- File path (absolute)
- Line count (actual from reading file)
```

**Analyst Agent:**
```markdown
Validation Attempt 1:
1. Read file: src/presentation/components/ide/EnhancedChatInterface.tsx
   - Result: File not found error

2. Verify path: Is file in wrong directory?
   - Check: filesystem_list_directory('src/presentation/components/ide/')
   - Result: Directory contains [MonacoEditor.tsx, ...] but NO EnhancedChatInterface.tsx

3. Search codebase for EnhancedChatInterface
   - Grep: "EnhancedChatInterface" in all .tsx files
   - Result: 0 matches

Validation Conclusion:
- Scanner Claim: "EnhancedChatInterface exists..."
- Analyst Finding: File does NOT exist anywhere
- Evidence: Directory listing, file read error, grep result (0 matches)
- Status: HALLUCINATED

Recommendation:
- Remove EnhancedChatInterface from god components list
- Re-run component inventory without this phantom file
```

**Governance Agent:**
```markdown
Cross-Check:
1. Read analyst evidence file: src/presentation/components/ide/ directory listing
   - Verify: EnhancedChatInterface.tsx NOT in list
2. Read analyst grep results: 0 matches for "EnhancedChatInterface"
   - Verify: Analyst correctly searched all .tsx files
3. Verify analyst didn't pre-load information
   - Check: Analyst had no prior knowledge about this component

Governance Decision:
- Scanner Claim: HALLUCINATED
- Analyst Validation: CORRECT (100%)
- Accuracy Contribution: Scanner = 0%, Analyst = 100%

Action Required:
- Ask scanner to re-verify EnhancedChatInterface claim
- If scanner still insists it exists, add to disputed list
- If scanner admits error, remove from inventory and proceed
```

---

## 🎯 ACCURACY TARGET: > 90% BEFORE PHASE 2

**Why 90% Threshold:**
- Allows 10% margin for edge cases (ambiguous claims, unverifiable due to tool limits)
- Ensures critical claims (P0 violations, god components) are verified
- Prevents Phase 2 from being based on false data

**Current Status:**
- Starting Accuracy: 68.4% (from previous validation)
- Target Accuracy: > 90%
- Gap to Close: 21.6% points

**Estimated Iterations:**
- 19 claims total
- Need 17/19 verified to reach > 90%
- If each iteration verifies 3-5 claims: ~4-7 iterations

---

## 📋 CLAIM QUEUE MANAGEMENT

### All 19 Claims from Phase 1

| ID | Claim | Scanner | Priority | Status |
|----|-------|----------|----------|--------|
| C-001 | EnhancedChatInterface 603 lines | P0 | HALLUCINATED |
| C-002 | NoteEditor 1,089 lines | P0 | VERIFIED |
| C-003 | NotesPage 877 lines | P0 | VERIFIED |
| C-004 | HubHomePage.dexie-import (line 4) | P0 | VERIFIED |
| C-005 | ProjectPickerDialog.dexie-import (line 22) | P0 | VERIFIED |
| C-006 | HubHomePage.test.dexie-import (line 13) | P0 | VERIFIED |
| C-007 | ProjectsPage.dexie-import (line 15) | P0 | VERIFIED |
| C-008 | slash-commands 563 lines | P1 | UNVERIFIED |
| C-009 | migration-backup 561 lines | P1 | UNVERIFIED |
| C-010 | conversation/migration 548 lines | P1 | UNVERIFIED |
| C-011 | use-vfs-sync-slice 445 lines | P1 | UNVERIFIED |
| C-012 | credentials/crud-slice 409 lines | P1 | UNVERIFIED |
| C-013 | Total 38 stores | P2 | UNVERIFIED |
| C-014 | Total 35 services | P2 | UNVERIFIED |
| C-015 | Total 482 components | P2 | UNVERIFIED |
| C-016 | Deprecated directories 84 files | P1 | HALLUCINATED |
| C-017 | src/lib/workspace 32 files | P1 | HALLUCINATED |
| C-018 | src/lib/filesystem 46 files | P1 | HALLUCINATED |
| C-019 | src/lib/sync 6 files | P1 | HALLUCINATED |

### Current Status:
- **Verified: 7/19 (36.8%)**
- **Hallucinated: 6/19 (31.6%)**
- **Unverified: 6/19 (31.6%)**
- **Accuracy: 36.8%** (below target)

**Work Remaining:**
- Verify 6 unverified claims
- Fix 6 hallucinated claims
- Target accuracy > 90%

---

## 🔄 ITERATION 1: START NOW

### Priority: Fix Hallucinated Claims (P0)

**Claims to Fix (6):**
1. ❌ C-001: EnhancedChatInterface (doesn't exist)
2. ❌ C-016: Deprecated directories 84 files (actually 48)
3. ❌ C-017: src/lib/workspace 32 files (actually 12)
4. ❌ C-018: src/lib/filesystem 46 files (actually 29)
5. ❌ C-019: src/lib/sync 6 files (actually 7 - minor)
6. ❌ God stores in wrong paths (C-008, C-009, C-010 - need canonical paths)

**Iteration Goal:**
- Fix all 6 hallucinated claims
- Update accuracy from 36.8% to > 70%
- Clear phantom data from inventory

**Estimated Time:** 45 minutes

---

## 📊 DASHBOARD

```
╔═══════════════════════════════════════════════════════════╗
║     PHASE 1 DISCOVERY: ITERATIVE VALIDATION LOOP                ║
╠═══════════════════════════════════════════════════════════╣
║                                                               ║
║  Iteration: 1 (of N)                                      ║
║  Target Accuracy: > 90%                                    ║
║  Current Accuracy: 36.8%                                   ║
║  Gap: 53.2%                                              ║
║                                                               ║
║  Total Claims: 19                                           ║
║  Verified: 7 (36.8%)                                        ║
║  Hallucinated: 6 (31.6%)                                   ║
║  Unverified: 6 (31.6%)                                   ║
║                                                               ║
║  Agents Active:                                             ║
║  Scanner: Waiting                                              ║
║  Analyst: Waiting                                              ║
║  Governance: Waiting                                            ║
║                                                               ║
║  Next Action: Launch Scanner for Claim C-001 (EnhancedChatInterface)    ║
║                                                               ║
╚═════════════════════════════════════════════════════════════════╝
```

---

## 🎯 SUCCESS CRITERIA

### Stop Condition
- [ ] Accuracy > 90% (minimum 17/19 claims verified)
- [ ] All P0 claims verified (7 claims)
- [ ] All P1 claims verified or corrected
- [ ] God component/store counts verified
- [ ] No hallucinated claims remaining

### Phase 1 Complete Checklist
- [ ] All 19 claims verified/corrected
- [ ] Accuracy > 90%
- [ ] All JSON inventory files updated with correct data
- [ ] All hallucinated claims removed
- [ ] All P0 cross-layer violations verified with exact evidence
- [ ] User approval to proceed to Phase 2

---

## 📝 GOVERNANCE AUTHORITY

**Final Authority:** bmad-governance agent
**Validation:** 100% passing score required with tracable evidences

**Enforcement:**
- ❌ No claim accepted without evidence
- ❌ No validation accepted without cross-check
- ❌ No iteration proceeds without accuracy > 90%
- ✅ All decisions evidence-based with file paths and line numbers

---

**Last Updated:** 2026-01-17T18:00:00+07:00
**Status:** 🔄 ITERATION 1 READY TO START
