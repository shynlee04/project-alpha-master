---
name: remediation-cycle
description: 'Ongoing remediation workflow - NOT one-time work. Triggered after governance enforcement approves architectural conflict remediation.'
web_bundle: true
installed_path: '{project-root}/_bmad-ext/workflows/remediation-cycle'
created: '2026-01-10'
version: '2.0.0'
---

# Remediation Cycle Workflow

**Important:** This is **NOT** a one-time remediation project. This is an **ongoing adaptive remediation system** that runs whenever governance enforcement identifies architectural conflicts that require comprehensive remediation.

---

## Overview

### What Triggers This Workflow?

This workflow is **NOT** manually invoked. It runs **AFTER**:

1. **Governance Enforcement Check** (`correct-course`) runs
2. **Expert Analysis** categorizes the request as "Architectural Conflict"
3. **Governance Report** returns BLOCK or WARN status
4. **User acknowledges** or overrides with "I am aware but..."

### Ongoing vs One-Time Remediation

| Aspect | One-Time (Wrong) | Ongoing (Correct) |
|--------|------------------|-------------------|
| Trigger | Single "cleanup" project | Every architectural conflict |
| Scope | Fixed set of fixes | Dynamic based on findings |
| Timing | After problem accumulates | BEFORE making changes |
| Integration | Separate from daily work | Integrated with ALL work |
| Tracking | Project-based | Continuous with LOOP_STATE |

---

## Workflow Entry Point

**FROM:** `governance-core/workflows/correct-course.yaml`

```yaml
# When governance enforcement identifies architectural conflict:
governance_report:
  status: "BLOCK" or "WARN"
  category: "architectural_conflict"
  recommendation: "Comprehensive remediation required"

  # Routing decision
  route_to:
    module: "remediation-cycle"
    workflow: "remediation-cycle"
    reason: "Error category: Architectural Conflict"
```

---

## Error Category Determination

### Quick Patch → Direct Fix (No Remediation Cycle)

**Characteristics:**
- Single component change
- No cross-domain impact
- No state boundary violation
- Test coverage exists

**Example:** Fixing a typo in button text, correcting CSS class name

**Response:** Direct fix, no governance gate needed

### Independent Feature → Lightweight Gating (No Remediation Cycle)

**Characteristics:**
- New feature or self-contained change
- Minimal cross-domain impact
- Clear boundaries
- Can be tested independently

**Example:** Adding a new button component, creating a utility function

**Response:** Lightweight gating, acknowledgment required

### Architectural Conflict → Remediation Cycle (THIS WORKFLOW)

**Characteristics:**
- Cross-domain impact (2+ domains affected)
- State boundary violation
- Affects multiple features
- Requires journey mapping

**Example:** Modifying store structure, changing sync orchestration

**Response:** Full remediation cycle

---

## Remediation Cycle Steps

### Step 1: Receive Governance Report

**Input from `correct-course`:**
```yaml
governance_report:
  status: "BLOCK"
  category: "architectural_conflict"
  affected_domains: ["state_persistence", "sync", "ux_interaction"]
  expert_analysis: |
    This change affects STATE, SYNC, and UX domains.
    Quick patch will create circular dependency.
    Required: Comprehensive remediation.
  recommendation: "Use remediation-cycle workflow"
```

### Step 2: Context Gathering (Already Done by Governance)

The governance enforcement check has already:
- ✅ Scanned targeted domains
- ✅ Gathered context (<5K tokens)
- ✅ Compared with actual codebase
- ✅ Detected overlaps and conflicts

**Re-use:** No need to re-scan. Use `governance_report` as baseline.

### Step 3: Remediation Planning

**Create Remediation Plan:**

1. **Define Scope:** What exactly needs to change?
2. **Identify Dependencies:** What else is affected?
3. **Order of Operations:** What must happen first?
4. **Risk Assessment:** What could break?
5. **Rollback Strategy:** How to undo if needed?

### Step 4: Execute Remediation

**Based on Error Category:**

| Category | Remediation Approach |
|----------|---------------------|
| **God Store** | Split into focused slices (<300 lines) |
| **God Component** | Extract sub-components |
| **TypeScript Errors** | Fix with proper typing |
| **Workspace Filesystem** | Implement file adapter layer |
| **State Boundary** | Refactor with migration strategy |
| **Cross-Domain** | Coordinate across multiple teams |

### Step 5: Validation

**After Remediation:**
- Run affected tests
- Verify no regressions
- Update ARTIFACT_REGISTRY
- Log to LOOP_STATE

### Step 6: Report Completion

**Output:**
```yaml
remediation_complete:
  timestamp: "{{now}}"
  original_request: "{{from_governance}}"
  domains_affected: "{{affected_domains}}"
  changes_made:
    - description: "Split note-store.ts into focused slices"
      files: ["note-actions-store.ts", "note-ui-store.ts", "note-base-store.ts"]
    - description: "Updated all consumers to use new stores"
      files: ["NoteListWidget.tsx", "NoteEditor.tsx", "SyncIndicator.tsx"]
  validation: "All tests passing, no regressions"
  registered_in_artifact_registry: true
```

---

## Integration with ARC-V2

The remediation cycle works with `arc-v2/diagnostic-first.md`:

1. **Governance** runs first → BLOCK/WARN/ALLOW
2. **If BLOCK/WARN** and architectural conflict:
   - **THEN** `arc-v2/diagnostic-first` runs → Deep scan
   - **THEN** `remediation-cycle` runs → Execute fixes
3. **Post-remediation:** Re-run governance to verify fix

```
User Request
    │
    ▼
┌─────────────────────────────────────┐
│  Governance Enforcement (GOV-001)  │
│  - Three checks                     │
│  - Output: ALLOW/WARN/BLOCK         │
└──────────────┬──────────────────────┘
               │
     ├─ ALLOW ──► Proceed to work
     │
     ├─ WARN (Quick Patch) ──► Lightweight gate
     │
     └─ BLOCK/WARN (Architectural Conflict)
               │
               ▼
┌─────────────────────────────────────┐
│  ARC-V2 Diagnostic-First            │
│  - Deep domain scanning              │
│  - Evidence gathering               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Remediation Cycle                  │
│  - Execute fixes                     │
│  - Validate                          │
│  - Register changes                  │
└──────────────┬──────────────────────┘
               │
               ▼
        Re-run Governance (verify fix)
```

---

## Remediation Categories

### RC-001: God Store Split

**Trigger:** Store file >300 lines

**Approach:**
1. Analyze store structure
2. Identify logical groupings
3. Extract focused slices (<300 lines each)
4. Update all consumers
5. Maintain backwards compatibility during transition

### RC-002: Component Split

**Trigger:** Component file >120 lines OR >3 functions OR >5 dependencies

**Approach:**
1. Extract custom hooks
2. Create sub-components
3. Maintain facade pattern
4. Update imports

### RC-003: TypeScript Fix

**Trigger:** TypeScript compilation errors

**Approach:**
1. Fix type errors at source
2. Add proper typing to stores
3. Update type definitions
4. Verify no `any` types

### RC-004: State Boundary Refactor

**Trigger:** State modification affects >3 consumers

**Approach:**
1. Create migration strategy
2. Implement new state structure alongside old
3. Migrate consumers incrementally
4. Remove old structure

### RC-005: Cross-Domain Coordination

**Trigger:** Changes affect 2+ domains

**Approach:**
1. Identify all affected domains
2. Coordinate changes across teams
3. Order operations to minimize conflicts
4. Test integration points

---

## Success Criteria

- [ ] Governance check passed remediation planning
- [ ] All remediation steps executed
- [ ] Tests passing for affected areas
- [ ] No regressions introduced
- [ ] Changes registered in ARTIFACT_REGISTRY
- [ ] LOOP_STATE updated with completion

---

## Related Files

- `_bmad-ext/modules/governance-core/workflows/correct-course.yaml` - Entry point
- `_bmad-ext/modules/arc-v2/workflows/diagnostic-first.md` - Deep scanning
- `_bmad-ext/state/LOOP_STATE.yaml` - Session tracking
- `_bmad-ext/state/ARTIFACT_REGISTRY.yaml` - Change registration

---

**Workflow Owner:** governance-core
**Integrates With:** arc-v2, quality-scanner-ext
**Last Updated:** 2026-01-10
