---
name: validate-level
description: Run a specific Sweeping Validation level and report findings
version: 1.0.0
module: arc-module
validation_ref: sweeping-validation.md
---

# Validate Level Workflow

## Purpose

This workflow executes a specific level of the Sweeping Validation Checklist, reports findings, and provides remediation guidance for any failures.

## Prerequisites

- Sweeping Validation Checklist at `_bmad-output/validation/sweeping-validation.md`
- Target level identified (L1-L12)
- Recent build passing

---

## Level Quick Reference

| Level | Name | Focus Area |
|-------|------|------------|
| L1 | State Integrity | Zustand state, persistence, hydration |
| L2 | Code Hygiene | Unused code, imports, dead branches |
| L3 | Naming Consistency | Prop names, conventions |
| L4 | Dependency Sanity | Circular imports, decoupling |
| L5 | Integration Reality | FSA, WebContainer, IndexedDB |
| L6 | Architecture Compliance | Layer boundaries, patterns |
| L7 | Mobile Reality | Touch targets, responsiveness |
| L8 | I18N Wiring | Translation keys, locale |
| L9 | Performance Under Load | Large projects, memory |
| L10 | Security + Privacy | API keys, data handling |
| L11 | Documentation Completeness | READMEs, JSDoc |
| L12 | Test Coverage | Unit, integration, E2E |

---

## Workflow Execution

### Select Level to Validate

**Which level are you validating?** Enter L1-L12:

---

## Level 1: State Integrity

### Checks

#### 1.1 No Dual-Source State Leaks

Search for direct localStorage usage that bypasses Zustand:

```bash
grep -r "localStorage\." src/ --include="*.ts" --include="*.tsx" | grep -v node_modules
```

**Expected:** 0 matches (all state through Zustand persist middleware)

**If Found:**
- Move to Zustand store with persist middleware
- Remove direct localStorage access

#### 1.2 Persist Middleware Naming Collision

Check for duplicate storage keys:

```bash
grep -r "name: '" src/stores/ --include="*.ts" | sort
```

**Expected:** All unique keys prefixed with `via-gent-*`

**If Collision Found:**
- Rename to unique pattern: `via-gent-<domain>-store`

#### 1.3 Selector Hydration Race Conditions

Check selectors handle undefined during hydration:

```typescript
// BAD: Will crash if state not hydrated
const agent = useAgentsStore((s) => s.agents.find(a => a.id === id));

// GOOD: Safe selector
const agent = useAgentsStore((s) => s.agents?.find(a => a.id === id) ?? null);
```

**Search Pattern:**
```bash
grep -r "useAgentsStore\|useProviderStore\|useConversationStore" src/ --include="*.tsx" -A 1
```

#### 1.4 State Flow Completeness

Verify each store has complete flow:
1. Action mutates state via `set()`
2. Persist middleware saves to IndexedDB
3. On reload, state restores correctly

**Test:** 
1. Make a change (add provider, create agent)
2. Hard refresh browser
3. Verify state persists

### Level 1 Report

| Check | Status | Notes |
|-------|--------|-------|
| No Dual-Source Leaks | [ ] PASS / [ ] FAIL | |
| Unique Storage Keys | [ ] PASS / [ ] FAIL | |
| Safe Selectors | [ ] PASS / [ ] FAIL | |
| State Flow Complete | [ ] PASS / [ ] FAIL | |

**Level 1 Result:** [ ] PASS / [ ] FAIL

---

## Level 2: Code Hygiene

### Checks

#### 2.1 No Unused Imports

```bash
# Run TypeScript with noUnusedLocals
pnpm tsc --noEmit --noUnusedLocals 2>&1 | grep "declared but"
```

**Expected:** 0 matches

#### 2.2 No Orphaned Event Listeners

Search for `addEventListener` without corresponding `removeEventListener`:

```bash
grep -rn "addEventListener" src/ --include="*.ts" --include="*.tsx"
# Cross-check with:
grep -rn "removeEventListener" src/ --include="*.ts" --include="*.tsx"
```

**Expected:** Every `addEventListener` has matching cleanup

#### 2.3 No Dead Code Branches

Search for legacy feature flags or unreachable code:

```bash
grep -r "if.*false\|if.*true\|// TODO\|// FIXME\|// HACK" src/ --include="*.ts" --include="*.tsx"
```

**Expected:** 0 permanent dead branches

#### 2.4 No Duplicate Utilities

Check for duplicate utility functions:

```bash
# Look for multiple cn() or clsx() definitions
grep -rn "function cn\|const cn\|function clsx" src/
```

**Expected:** Single source of truth for utilities

### Level 2 Report

| Check | Status | Notes |
|-------|--------|-------|
| No Unused Imports | [ ] PASS / [ ] FAIL | |
| No Orphaned Listeners | [ ] PASS / [ ] FAIL | |
| No Dead Branches | [ ] PASS / [ ] FAIL | |
| No Duplicate Utils | [ ] PASS / [ ] FAIL | |

**Level 2 Result:** [ ] PASS / [ ] FAIL

---

## Level 3: Naming Consistency

### Checks

#### 3.1 Prop Naming Standardization

```bash
# Check for inconsistent ID naming
grep -rn "agentUUID\|agent_id\|AgentId" src/ --include="*.tsx"
# Should be: agentId everywhere
```

#### 3.2 Boolean Prop Unification

```bash
# Check for inconsistent boolean naming
grep -rn "isEnabled\|enabled\|isActive\|active" src/ --include="*.tsx"
# Pick one convention and stick to it
```

#### 3.3 Event Handler Convention

- Internal handlers: `handle*` (e.g., `handleClick`)
- Prop callbacks: `on*` (e.g., `onClick`)

```bash
grep -rn "onClick=\|onSubmit=\|onChange=" src/ --include="*.tsx" | head -20
```

### Level 3 Report

| Check | Status | Notes |
|-------|--------|-------|
| Prop Naming Standard | [ ] PASS / [ ] FAIL | |
| Boolean Convention | [ ] PASS / [ ] FAIL | |
| Event Handler Names | [ ] PASS / [ ] FAIL | |

**Level 3 Result:** [ ] PASS / [ ] FAIL

---

## Level 4: Dependency Sanity

### Checks

#### 4.1 No Circular Imports

```bash
# Install madge if needed: npm install -g madge
npx madge --circular src/
```

**Expected:** No circular dependencies detected

#### 4.2 Barrel Export Compliance

```bash
# Check for deep imports bypassing barrels
grep -rn "from '\.\./\.\./components\|from '\.\./\.\./stores" src/ --include="*.tsx"
```

**Expected:** All imports via barrel exports (`@/components`, `@/stores`)

#### 4.3 Store Cross-Import Prevention

```bash
# Stores should not import other stores (use events)
grep -rn "from.*store" src/stores/*.ts | grep -v "store-events\|types\|index"
```

**Expected:** 0 direct store-to-store imports

### Level 4 Report

| Check | Status | Notes |
|-------|--------|-------|
| No Circular Imports | [ ] PASS / [ ] FAIL | |
| Barrel Exports Used | [ ] PASS / [ ] FAIL | |
| No Store Cross-Imports | [ ] PASS / [ ] FAIL | |

**Level 4 Result:** [ ] PASS / [ ] FAIL

---

## Level 5: Integration Reality

### Checks

#### 5.1 FSA Handle Lifecycle

```bash
grep -rn "queryPermission\|requestPermission" src/ --include="*.ts"
```

**Expected:** All FSA operations check permissions first

#### 5.2 WebContainer Boot Guards

```bash
grep -rn "wcStatus\|webcontainerStatus" src/ --include="*.tsx"
```

**Expected:** UI shows loading state until WC ready

#### 5.3 IndexedDB Quota Handling

```bash
grep -rn "QuotaExceededError\|storage.*quota" src/ --include="*.ts"
```

**Expected:** Error handling for quota exceeded

### Level 5 Report

| Check | Status | Notes |
|-------|--------|-------|
| FSA Permissions Checked | [ ] PASS / [ ] FAIL | |
| WC Boot Guards | [ ] PASS / [ ] FAIL | |
| Quota Handling | [ ] PASS / [ ] FAIL | |

**Level 5 Result:** [ ] PASS / [ ] FAIL

---

## Level 6: Architecture Compliance

### Checks

#### 6.1 Layer Boundaries

```bash
# Components should not access db directly
grep -rn "from.*dexie\|from.*db" src/components/ --include="*.tsx"
```

**Expected:** 0 matches (use stores/hooks)

#### 6.2 Tool Approval Integrity

Manual check: All tool executions require user approval

#### 6.3 Streaming Buffer Compliance

```bash
grep -rn "setInterval\|setTimeout" src/ --include="*.ts" | grep -i stream
```

**Expected:** 50ms buffer for streaming updates

### Level 6 Report

| Check | Status | Notes |
|-------|--------|-------|
| Layer Boundaries | [ ] PASS / [ ] FAIL | |
| Tool Approval | [ ] PASS / [ ] FAIL | |
| Streaming Buffer | [ ] PASS / [ ] FAIL | |

**Level 6 Result:** [ ] PASS / [ ] FAIL

---

## Final Summary

| Level | Status | Issues Found |
|-------|--------|--------------|
| L1 | | |
| L2 | | |
| L3 | | |
| L4 | | |
| L5 | | |
| L6 | | |

**Overall Health:** ____%

**Critical Remediations Required:**
1. 
2. 
3. 

---

**Workflow Created:** 2025-12-31T16:33:00+07:00
**Module:** arc-module v2.1
**Reference:** _bmad-output/validation/sweeping-validation.md
