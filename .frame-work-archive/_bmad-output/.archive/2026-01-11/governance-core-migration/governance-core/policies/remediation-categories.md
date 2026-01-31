# Remediation Categories Policy

**Version:** 1.0.0
**Last Updated:** 2026-01-10

---

## description

Defines how different types of fixes are categorized and routed through the governance system.

---

## Three Categories

### Category 1: Quick Patch

**Definition:** Single component change, no cross-domain impact

**Criteria:**
```yaml
all_of:
  - single_file_change: true
  - no_boundary_crossing: true
  - no_state_change: false OR isolated_state_change
  - test_coverage_exists: true
  - no_api_change: true
```

**Examples:**
- Fixing a component's prop type
- Correcting a wiring bug
- Adding missing import
- Fixing typo in string
- Adjusting CSS

**Workflow:** Direct Fix
**Gate Required:** No
**Estimated Time:** 5-30 minutes

### Category 2: Independent Feature

**Definition:** Isolated change with clear boundaries

**Criteria:**
```yaml
all_of:
  - clearly_isolated: true
  - independently_testable: true
  - minimal_cross_impact: true
  - boundaries_well_defined: true

none_of:
  - state_boundary_violation: true
  - api_contract_change: true
  - storage_strategy_change: true
```

**Examples:**
- Adding a new UI component
- Implementing isolated feature with new store
- Adding new route
- Creating new hook
- Adding test coverage

**Workflow:** Isolated Workflow
**Gate Required:** Yes (lightweight)
**Estimated Time:** 1-4 hours

### Category 3: Architectural Conflict

**Definition:** Cross-domain impact requiring comprehensive remediation

**Criteria:**
```yaml
any_of:
  - affects_multiple_domains: true
  - god_store_refactoring: true
  - storage_strategy_change: true
  - cross_workspace_routing_change: true
  - state_boundary_violation: true
  - circular_dependency_introduced: true
  - api_contract_change: true
```

**Examples:**
- Splitting a god store
- Refactoring sync strategy
- Changing storage router logic
- Cross-domain state management changes
- Modifying agent tool permissions
- API contract modifications

**Workflow:** Correct-Course (full)
**Gate Required:** Yes (full)
**Estimated Time:** 4-16 hours

---

## Determination Algorithm

### Step 1: Check for Auto-Architectural Triggers

```typescript
if (affects_multiple_domains ||
    god_store_refactoring ||
    storage_strategy_change ||
    state_boundary_violation) {
  return "architectural_conflict";
}
```

### Step 2: Check for Quick Patch Criteria

```typescript
if (single_file_change &&
    no_boundary_crossing &&
    test_coverage_exists &&
    no_api_change) {
  return "quick_patch";
}
```

### Step 3: Default to Independent Feature

```typescript
return "independent_feature";
```

---

## Domain Impact Detection

### Single Domain (Low Risk)

**Definition:** Change affects only one domain

**Domains:** infrastructure, domain, presentation, routing, agents, rag, ux

**Example:** Changing a button component in UX domain only

### Cross-Domain (Medium Risk)

**Definition:** Change affects 2-3 domains

**Example:** Changing a store affects:
- State persistence domain
- UX domain (components using store)
- Domain layer (entities)

### Multi-Domain (High Risk)

**Definition:** Change affects 4+ domains

**Example:** Storage router change affects:
- State persistence
- Sync
- Workspace (all workspace types)
- UX (loading states, error handling)
- Domain (file entities)

---

## State Boundary Violations

### Types

| Violation | Severity | Category |
|-----------|----------|----------|
| Cross-store import | High | Architectural Conflict |
| Direct store mutation | Critical | Architectural Conflict |
| Circular dependency | Critical | Architectural Conflict |
| Cross-domain state access | High | Architectural Conflict |

### Detection

```typescript
// Detect cross-store import
if (importPath.includes('../other-domain/stores/')) {
  violation = "cross_store_import";
}

// Detect direct mutation
if (store.directMutationCalled) {
  violation = "direct_store_mutation";
}

// Detect circular dependency
if (dependencyGraph.hasCycle(storeA, storeB)) {
  violation = "circular_dependency";
}
```

---

## Gate Levels

### None (No Gate)

**Applies to:** Quick Patch

**Checks:**
- None (proceed directly)

**Override:** Not applicable

### Lightweight Gate

**Applies to:** Independent Feature

**Checks:**
- TypeScript check passes
- Related tests pass
- No circular dependencies introduced

**Override:** Allowed with "I am aware but..."

### Full Gate

**Applies to:** Architectural Conflict

**Checks:**
- Context First (two-step hook)
- Expert Analysis (codebase comparison)
- Research (if applicable)
- Journey mapping (if cross-domain)
- Rollback plan documented

**Override:** Allowed with justification, logged as debt

---

## Risk Levels

### Low Risk

**Characteristics:**
- UI only changes
- New component
- Test additions
- Documentation updates

**Response:** Proceed directly

### Medium Risk

**Characteristics:**
- Store modification
- API change
- Hook changes
- New feature in existing domain

**Response:** Lightweight gate

### High Risk

**Characteristics:**
- Cross-domain changes
- State refactoring
- Storage changes
- API contract changes

**Response:** Full gate with research

### Critical Risk

**Characteristics:**
- God store split
- Storage router change
- Multi-domain changes
- Security implications

**Response:** Full gate + research + rollback plan

---

## Size Thresholds

### Component Size

| Size | Lines | Action |
|------|-------|--------|
| Small | < 100 | Proceed normally |
| Medium | 100-300 | Consider refactoring if > 250 |
| Large | > 300 | Recommend split before change |

### Store Size

| Size | Lines | Action |
|------|-------|--------|
| Small | < 80 | Proceed normally |
| Medium | 80-120 | Monitor growth |
| Large | > 120 | Split required (architectural) |

### File Size

| Size | Lines | Action |
|------|-------|--------|
| Small | < 200 | Proceed normally |
| Medium | 200-500 | Consider splitting |
| Large | > 500 | Split recommended |

---

## Override Behavior

### Override Allowed

**Categories:** Quick Patch, Independent Feature, Architectural Conflict

**Pattern:** "I am aware but {reason}"

**Requirements:**
- Minimum 20 characters
- Must include reason
- Certain reasons accepted

**Accepted Reasons:**
- "prototyping and will refactor"
- "time critical, customer blocked"
- "documented debt, will address"
- "experiment to validate approach"

### Override NOT Allowed

**Categories:** Security Risk, Data Loss Risk

**Response:** Block unless additional authorization

**Required Action:**
- Security lead approval for security risks
- Tech lead approval for data loss risks

---

## Example Determinations

### Example 1: Quick Patch

```
User: "Fix the typo in the button label"
Analysis:
  - Single file: Button.tsx
  - No state change
  - No cross-domain impact
Category: quick_patch
Action: Proceed directly
```

### Example 2: Independent Feature

```
User: "Add a new color picker component"
Analysis:
  - New component, isolated
  - Can be tested independently
  - Minimal cross-impact
Category: independent_feature
Action: Lightweight gate
Gate checks: TypeScript, tests, no circular deps
```

### Example 3: Architectural Conflict

```
User: "Split the agent-config-store"
Analysis:
  - Store is 448 lines (god store)
  - Used by 12 components
  - Cross-domain impact (agents, ux, state)
  - State boundary changes
Category: architectural_conflict
Action: Full gate
Gate checks: All three enforcement checks
Estimated: 4-6 hours
```

---

## Technical Debt Tracking

All overrides are logged as technical debt:

```yaml
debt_item:
  id: "{uuid}"
  timestamp: "{iso_timestamp}"
  category: "{quick_patch | independent_feature | architectural_conflict}"
  original_recommendation: "{what_governance_recommended}"
  override_reason: "{user_reason}"
  estimated_remediation: "{hours}"
  risk_multiplier: "{multiplier}x"
  status: "open"
```

---

**Policy Owner:** governance-core
**Review Frequency:** Monthly
**Next Review:** 2026-02-10
