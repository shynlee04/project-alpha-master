# SPRINT MANAGER DELEGATION INSTRUCTIONS: TypeScript Remediation (v2.0)

**Version**: 2.0.0
**Created**: 2026-01-25
**Status**: ACTIVE
**Governance Reference**: ts-error-classification.md

---

## 🎯 PURPOSE

Provide sprint-manager with updated delegation instructions for TypeScript error remediation, ensuring dev-ext agents recognize architectural flaws and create ARCHITECT-REPORT artifacts instead of attempting aimless patches.

---

## 📊 CURRENT STATE (2026-01-25)

### Completed
- ✅ EPIC-ARCH-03: COMPLETE (7/7 stories)
- ✅ CTX-01 (Archive Superseded ADRs): COMPLETE
- ✅ CTX-02 (Fix YAML Errors): COMPLETE
- ✅ ARCH-03-05-FIX (TypeScript Resolution): COMPLETE

### In Progress
- ⏸️ TS-DEBT: PARTIAL (32/115 errors fixed, 83 remaining)
  - Tool files: 4/5 fixed (32 errors)
  - factory.ts: 2 remaining (architectural)
  - note-commands.ts: 1 remaining (architectural)
  - cache-sync.ts: 20 errors (not started)

### Ready to Start
- ❌ CTX-03 through CTX-07: NOT STARTED
- ❌ E2E Investigation C: READY_FOR_EXECUTION

---

## 🚨 CRITICAL GOVERNANCE UPDATE

### NEW RULE: TypeScript Error Classification

**Reference**: `.opencode/instructions/ts-error-classification.md`

**Categories:**
- **Category A**: Simple type errors → dev-ext CAN FIX
- **Category B**: Map/Array confusion → dev-ext CAN FIX (pattern known)
- **Category C**: SDK/Architecture incompatibility → **architect-ext MUST FIX**
- **Category D**: Missing properties on domain types → **architect-ext MUST FIX**
- **Category E**: Duplicate/Conflicting exports → dev-ext CAN FIX (caution)
- **Category F**: Type safety violations → dev-ext CAN FIX

**CRITICAL**: When dev-ext encounters Category C or D errors, they MUST:
1. **STOP** - Do NOT attempt to fix
2. Create ARCHITECT-REPORT artifact
3. Hand off to architect-ext

---

## 📋 ERROR BREAKDOWN (Current 83 Remaining Errors)

| Category | Count | Agent | Action Required |
|----------|-------|-------|----------------|
| A (Simple Fixes) | ~25 | dev-ext | Fix directly |
| B (Map/Array) | ~15 | dev-ext | Fix using Array.from() pattern |
| C (SDK/Architecture) | ~20 | architect-ext | **BLOCKING** - Create ARCHITECT-REPORTs |
| D (Missing Properties) | ~15 | architect-ext | **BLOCKING** - Create ARCHITECT-REPORTs |
| E (Duplicate Exports) | ~5 | dev-ext | Consolidate exports |
| F (Type Safety) | ~3 | dev-ext | Remove unused @ts-expect-error |

**Dev-ext can fix:** ~48 errors (Category A, B, E, F)
**Architect-ext must fix:** ~35 errors (Category C, D)

---

## 🔧 DELEGATION INSTRUCTIONS

### 1. DELEGATE TO DEV-EXT (Category A, B, E, F)

**When delegating simple type fixes:**

```markdown
## Tool Constraints

**CRITICAL**: This agent has LIMITED permissions:
- write: true - Can create ARCHITECT-REPORT artifacts
- edit: true - Can fix Category A, B, E, F errors
- bash: true - Can run pnpm tsc --noEmit
- task: false - Cannot delegate further

**Role Boundaries**:
- dev-ext - Fix TypeScript errors in Categories A, B, E, F
- **DO NOT** fix Category C or D errors
- **DO NOT** add properties to domain types (Project, Note, etc.)
- **DO NOT** modify SDK integration types
- **DO NOT** use // @ts-ignore or // @ts-expect-error as workarounds

**Required Output**:
- Report location: [path to completion report]
- Errors fixed: [count]
- Errors remaining: [count]
- Classification summary: [list of categories fixed]
- ARCHITECT-REPORTs created: [list of Category C/D errors found]
- Success criteria: [TypeScript compiles with 0 new errors]
- Timebox: [duration]

**Error Classification Reference**:
- Read `.opencode/instructions/ts-error-classification.md`
- Category A: Simple fixes (missing imports, unused variables, wrong types)
- Category B: Map/Array methods (use Array.from(map.values()).filter())
- Category E: Duplicate exports (remove duplicates, verify API)
- Category F: Type safety (remove unused @ts-expect-error)
- **Category C or D? → Create ARCHITECT-REPORT, DO NOT FIX**

**Required Actions**:
1. Run pnpm tsc --noEmit to get current error list
2. Classify each error (A/B/C/D/E/F)
3. Fix Category A, B, E, F errors
4. Create ARCHITECT-REPORT for each Category C or D error
5. Run pnpm tsc --noEmit again to verify
6. Report completion with breakdown
```

### 2. DELEGATE TO ARCHITECT-EXT (Category C, D)

**When delegating architectural fixes:**

```markdown
## Tool Constraints

**CRITICAL**: This agent has LIMITED permissions:
- write: true - Can update ADRs, type definitions
- edit: true - Can modify domain types, interfaces
- bash: false - Cannot run build commands
- task: false - Cannot delegate further

**Role Boundaries**:
- architect-ext - Fix Category C and D TypeScript errors
- Review ARCHITECT-REPORT artifacts from dev-ext
- Make architectural decisions for type mismatches
- Update domain types and ADRs as needed
- **DO NOT** fix Category A, B, E, F errors (that's dev-ext work)
- **DO NOT** make changes without updating ADRs

**Required Output**:
- ADR updates: [list of ADRs modified or created]
- Type definitions updated: [list of files]
- ARCHITECT-REPORTs resolved: [count]
- Resolution summary: [how each Category C/D error was resolved]
- Success criteria: [All Category C/D errors resolved, no regressions]
- Timebox: [duration]

**Input Artifacts**:
- Read all ARCHITECT-REPORT artifacts from dev-ext
- Read ADR-034 for context
- Review current type definitions

**Required Actions**:
1. Review all ARCHITECT-REPORT artifacts
2. Make architectural decisions for each Category C/D error
3. Update domain types and interfaces
4. Update ADR-034 or create new ADRs if needed
5. Verify all consumers updated
6. Archive ARCHITECT-REPORTs as RESOLVED
7. Report completion with resolution details
```

---

## 📋 EXAMPLE DELEGATION PROMPTS

### Example 1: Fixing Simple Type Errors (Category A, B, E, F)

```markdown
# TASK: Fix TypeScript Errors - Categories A, B, E, F

## Context
You are a dev-ext agent tasked with fixing TypeScript errors.

## Error Classification (CRITICAL)
Before fixing ANY error, you MUST classify it using this reference:
- Read `.opencode/instructions/ts-error-classification.md`
- Category A: Simple fixes (missing imports, unused variables, wrong types)
- Category B: Map/Array methods (use Array.from(map.values()).filter())
- Category E: Duplicate exports (remove duplicates, verify API)
- Category F: Type safety (remove unused @ts-expect-error)
- **Category C or D? → Create ARCHITECT-REPORT, DO NOT FIX**

## Files to Fix
- src/lib/notes/sync/cache-sync.ts (Category B - Map vs Array)
- src/lib/diagnostics/trace-system.ts (Category E - Duplicate exports)
- src/routes/api/*.ts (Category F - Unused @ts-expect-error)

## Acceptance Criteria
1. Run `pnpm tsc --noEmit` to get current error list
2. Classify each error (A/B/C/D/E/F)
3. Fix only Category A, B, E, F errors
4. Create ARCHITECT-REPORT for each Category C or D error
5. Run `pnpm tsc --noEmit` to verify no new errors
6. Report completion with breakdown

## Output
Create completion report at: `_bmad-output/sprint-artifacts/TS-DEBT-01-completion.md`

## Tool Constraints
- edit: true (can fix Category A, B, E, F errors)
- write: true (can create ARCHITECT-REPORT artifacts)
- bash: true (can run pnpm tsc --noEmit)
- task: false (cannot delegate further)
```

### Example 2: Handling Architectural Errors (Category C, D)

```markdown
# TASK: Fix Architectural TypeScript Errors - Categories C, D

## Context
You are an architect-ext agent tasked with resolving Category C and D TypeScript errors reported by dev-ext.

## ARCHITECT-REPORT Artifacts to Review
- _bmad-output/architect-reports/SDK-incompatibility-report.md
- _bmad-output/architect-reports/Missing-properties-report.md

## Error Types
- Category C: SDK/Architecture incompatibility
- Category D: Missing properties on domain types

## Required Actions
1. Review all ARCHITECT-REPORT artifacts
2. Make architectural decisions for each Category C/D error
3. Update domain types and interfaces in `src/domain/types/`
4. Update ADR-034 or create new ADRs if needed
5. Verify all consumers updated
6. Archive ARCHITECT-REPORTs as RESOLVED

## Acceptance Criteria
1. All Category C/D errors resolved
2. No new TypeScript errors introduced
3. ADRs updated or created
4. All consumers updated
5. ARCHITECT-REPORTs archived as RESOLVED

## Output
Create completion report at: `_bmad-output/sprint-artifacts/TS-DEBT-ARCHITECT-completion.md`

## Tool Constraints
- write: true (can update ADRs, type definitions)
- edit: true (can modify domain types, interfaces)
- bash: false (cannot run build commands - dev-ext will verify)
- task: false (cannot delegate further)
```

---

## 🔄 WORKFLOW FOR SPRINT MANAGER

### Step 1: Analyze Current Errors

```bash
# Run TypeScript check
pnpm tsc --noEmit > typescript-errors.txt

# Categorize errors
# Review errors.txt to count Categories A, B, C, D, E, F
```

### Step 2: Create Batches

**Batch 1: Category A, B, E, F (dev-ext)**
- ~48 errors total
- Estimated effort: 3-4 hours
- Files: cache-sync.ts, trace-system.ts, routes/api/*.ts, etc.

**Batch 2: Category C, D (architect-ext)**
- ~35 errors total
- Estimated effort: 4-5 hours
- Files: domain types, SDK integrations, etc.

### Step 3: Delegate Batch 1 to dev-ext

Use delegation prompt from Example 1 above.

### Step 4: Wait for dev-ext completion

Review:
- Completion report
- ARCHITECT-REPORT artifacts for Category C/D errors

### Step 5: Delegate Batch 2 to architect-ext

Use delegation prompt from Example 2 above.

### Step 6: Verify Final State

```bash
# Final TypeScript check
pnpm tsc --noEmit

# Should show 0 errors (or minimal remaining)
```

### Step 7: Update LOOP_STATE.yaml

```yaml
typescript_status:
  total_errors: 0
  fixed_errors: 115
  remaining_errors: 0
  fixed_percent: 100
```

---

## 📋 CHECKLIST FOR SPRINT MANAGER

Before delegating:
- [ ] Read `.opencode/instructions/ts-error-classification.md`
- [ ] Run `pnpm tsc --noEmit` to get current error list
- [ ] Categorize each error (A/B/C/D/E/F)
- [ ] Separate Category A, B, E, F (dev-ext) from C, D (architect-ext)
- [ ] Create delegation prompt with tool constraints
- [ ] Set clear timebox for each batch

After dev-ext completion:
- [ ] Review completion report
- [ ] Count ARCHITECT-REPORT artifacts created
- [ ] Verify no new errors introduced
- [ ] Review ARCHITECT-REPORTs for Category C/D errors

Before architect-ext delegation:
- [ ] Compile all ARCHITECT-REPORT artifacts
- [ ] Ensure ADR-034 is loaded for context
- [ ] Create delegation prompt with clear actions

After architect-ext completion:
- [ ] Review completion report
- [ ] Verify all Category C/D errors resolved
- [ ] Check ADR updates
- [ ] Verify no regressions

Final verification:
- [ ] Run `pnpm tsc --noEmit`
- [ ] Verify 0 errors (or minimal remaining)
- [ ] Update LOOP_STATE.yaml
- [ ] Update AGENTS.md with TypeScript status

---

## 🚨 CRITICAL WARNINGS

### DO NOT:
- ❌ Delegate Category C/D errors to dev-ext
- ❌ Let dev-ext add properties to domain types
- ❌ Let dev-ext modify SDK integration types
- ❌ Let dev-ext use // @ts-ignore or // @ts-expect-error
- ❌ Let architect-ext fix Category A/B/E/F errors
- ❌ Skip error classification before delegation

### DO:
- ✅ Always classify errors before delegating
- ✅ Always set tool constraints in delegation prompts
- ✅ Always require ARCHITECT-REPORT for Category C/D errors
- ✅ Always verify TypeScript compiles after each batch
- ✅ Always update LOOP_STATE.yaml after completion
- ✅ Always require pnpm tsc --noEmit verification

---

## 📊 SUCCESS METRICS

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| TypeScript errors (total) | 0 | 83 | ⏳ In Progress |
| Category A/B/E/F (dev-ext) | 0 | 48 | ⏳ Ready to Fix |
| Category C/D (architect-ext) | 0 | 35 | ⏳ Ready to Fix |
| Build status | SUCCESS | FAILURE | ⏳ In Progress |
| ARCHITECT-REPORTs created | 35 | 0 | ⏳ Pending |
| ADR updates | As needed | 0 | ⏳ Pending |

---

## 🔄 RESUMING FROM SESSION DISRUPTION

### Current State (from LOOP_STATE.yaml):
- Session: `arch-03-audit-2026-01-25`
- Active Agent: `bmad-sprint-manager`
- Epic: `EPIC-ARCH-03` (COMPLETE)
- Pending: `EPIC-TS-DEBT` (PARTIAL), `EPIC-CTX-CLEAN` (PARTIAL)

### Next Actions:
1. **Analyze current TypeScript errors** (run `pnpm tsc --noEmit`)
2. **Categorize errors** (A/B/C/D/E/F)
3. **Delegate Category A, B, E, F to dev-ext**
4. **Wait for ARCHITECT-REPORTs from dev-ext**
5. **Delegate Category C, D to architect-ext**
6. **Verify final state and update LOOP_STATE**

### Tool Permissions:
- `write`: true (can create artifacts)
- `edit`: true (can update YAML files)
- `bash`: true (can run validation commands)
- `task`: true (can delegate to dev-ext and architect-ext)

---

## 📝 CHANGE HISTORY

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-01-25 | 2.0.0 | Added TypeScript error classification rules | orchestrator |
| 2026-01-25 | 1.0.0 | Initial creation | orchestrator |

---

## 🔗 REFERENCES

- `.opencode/instructions/ts-error-classification.md` - Error classification matrix
- `_bmad-output/planning-artifacts/epics/EPIC-TS-DEBT-typescript-remediation-2026-01-25.md` - Epic details
- `_bmad-ext/state/LOOP_STATE.yaml` - Current session state
- ADR-034: Project-Centric Architecture
