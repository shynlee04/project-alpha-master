# Ralph Loop Quick Reference - 2026-01-03

**For rapid consultation during autonomous execution**

---

## 🎯 ONE-PAGE SUMMARY

**What**: Autonomous 100-iteration refactoring loop
**Goal**: Health score 3.8 → 8.8, zero technical debt
**Timeline**: 8-12 weeks (40-50 hours Phase 0, 280-460 total)

---

## 📊 CURRENT STATE (Baseline)

```
Health Score:     3.8/10 (actual, not 7.0/10)
TS Errors:        371 (test files only, 0 production)
God Stores:       69 files (worst: 1,267 lines)
Components:       45 violations (>300 lines)
Circular Deps:    1 confirmed cycle
Test Coverage:    16.6%
```

---

## 🚀 FIRST 5 ITERATIONS (Immediate Start)

**Iteration 1144**: Fix circular dependency (2 hours)
- Agent: @typescript-fixer
- Files: use-app-store.ts, agent-selection-store.ts
- Success: Zero circular dependencies

**Iterations 1145-1150**: Begin TS error batch fixes
- Agent: @typescript-fixer
- Target: Fix 50 errors per batch
- Success: Reduce from 371 → <100

---

## 📋 CRITICAL DOCUMENTS

### Must Read (Before Starting)
1. `ralph-loop-readiness-report-2026-01-03.md` (overview)
2. `ralph-loop-execution-cue-sheet-2026-01-03.md` (step-by-step)

### Reference During Execution
3. `ralph-loop-handoff-protocol-2026-01-03.md` (agent transitions)
4. `ralph-loop-quality-gates-2026-01-03.md` (validation checks)
5. `ralph-loop-rollback-procedures-2026-01-03.md` (when things fail)

### Tracking Templates
6. `ralph-loop-progress-tracking-2026-01-03.md` (YAML templates)

### Analysis Artifacts
7. `ralph-loop-baseline-2026-01-03.md` (from Explore agent)
8. `exhaustive-codebase-analysis-2026-01-03.md` (scan results)

---

## 🔄 HANDOFF TEMPLATE

```markdown
# Handoff: {Task Name}

**From**: {Current Agent}
**To**: {Next Agent}
**Priority**: {P0/P1/P2}

## Task Context
{Brief description}

## Acceptance Criteria
1. [ ] {AC-1}
2. [ ] {AC-2}
3. [ ] {AC-3}

## Validation Commands
```bash
{Commands}
```

## Output Location
_bmad-output/{category}/{name}-{date}.md

## Return Protocol
Report to BMad Master with completion status, artifacts, next action
```

---

## ✅ PER-ITERATION CHECKLIST

**Before Starting**:
- [ ] Read previous handoff artifact
- [ ] Understand acceptance criteria
- [ ] Verify validation commands work
- [ ] Identify blockers immediately

**During Execution**:
- [ ] Follow workflow steps
- [ ] Run validation commands
- [ ] Track metrics in sprint-status.yaml
- [ ] Document decisions made

**After Completion**:
- [ ] Verify all acceptance criteria met
- [ ] Create completion artifact
- [ ] Update sprint-status.yaml
- [ ] Report to BMad Master

---

## 🚨 EMERGENCY COMMANDS

**Stop Immediately**:
```bash
# Kill all processes
# Notify BMad Master
# Create incident report
```

**Quick Rollback** (Option 1):
```bash
git revert {commit-hash}
pnpm test
git push origin dev
```

**Full Restore** (Option 2):
```bash
git checkout backup-before-{phase}-{date}
git push origin dev --force
```

**Verify Restoration**:
```bash
madge --circular src/
pnpm tsc --noEmit
pnpm test
```

---

## 📈 METRICS TO TRACK

**Update Every Iteration** in `sprint-status.yaml`:

```yaml
iteration: {N}
metrics:
  typescript_errors: {count}
  god_stores: {count}
  component_violations: {count}
  circular_dependencies: {count}
  health_score: {score}/10
```

---

## 🎯 SUCCESS CRITERIA

**Ralph Loop Complete When**:
- [ ] Health score ≥ 8.8/10
- [ ] TS errors < 10
- [ ] God stores = 0
- [ ] Component violations = 0
- [ ] Test coverage ≥ 40%
- [ ] All 4 workspaces functional
- [ ] Zero circular dependencies
- [ ] Zero silent failures

---

## 🔗 KEY FILE LOCATIONS

**Store Files** (need refactoring):
```
src/infrastructure/persistence/stores/
src/lib/state/
src/stores/ (deprecated)
```

**Component Files** (need splitting):
```
src/presentation/components/
```

**Configuration Files**:
```
_bmad/modules/architecture-remediation/config/thresholds.yaml
_bmad/modules/architecture-remediation/config/priorities.yaml
```

**Status Tracking**:
```
_bmad-output/sprint-artifacts/sprint-status.yaml
bmm-workflow-status.yaml
```

---

## 🛠️ AGENT DIRECTORY

**@typescript-fixer**: Fix TS errors, circular dependencies
**@store-refactorer**: Eliminate god stores, create slices
**@component-splitter**: Split large components
**@test-writer**: Improve test coverage
**@bmad-core-bmad-master**: Orchestrate everything

---

## ⚡ QUICK VALIDATION

**Run These Commands** (every iteration):

```bash
# Check circular dependencies
madge --circular src/

# Count TS errors
pnpm tsc --noEmit 2>&1 | grep "error TS" | wc -l

# Run tests
pnpm test

# Verify build
pnpm build

# Check file sizes
find src -name "*store*.ts" -exec wc -l {} + | sort -rn | head -10
find src -name "*.tsx" -exec wc -l {} + | sort -rn | head -10
```

---

## 📞 WHEN TO ASK FOR HELP

**Create Support Ticket** if:
- Blocker persists >1 hour
- Unclear acceptance criteria
- Conflicting priorities
- Rollback needed (create incident report)

**Continue Autonomously** if:
- Acceptance criteria are clear
- No blockers encountered
- Quality gates passing
- Progress on track

---

## 🎮 START SEQUENCE

**1. User says**: "START"
**2. I load**: @typescript-fixer
**3. I execute**: Iteration 1144 (P0-1)
**4. I validate**: Quality gates
**5. I report**: Completion to BMad Master
**6. I continue**: Iterations 1145-1243 autonomously

---

**End of Quick Reference**
**Keep this document open during execution**
