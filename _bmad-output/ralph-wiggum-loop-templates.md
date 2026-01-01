# Ralph Wiggum Loop Templates & Practical Examples

> **Purpose:** Reference library of loop patterns for common development scenarios  
> **Companion To:** `perplexity-ralph-wiggum-system-instruction.md`  
> **Created:** 2026-01-01T23:50:00+07:00  
> **Version:** 1.0.0

---

## Table of Contents

1. [Progressive Refactoring Loop](#1-progressive-refactoring-loop)
2. [Gap Analysis & Course Correction Loop](#2-gap-analysis--course-correction-loop)
3. [Epic Implementation Loop](#3-epic-implementation-loop)
4. [Migration Sweep Loop](#4-migration-sweep-loop)
5. [State Management Consolidation Loop](#5-state-management-consolidation-loop)
6. [Cross-Workspace Integration Loop](#6-cross-workspace-integration-loop)
7. [Production Hardening Loop](#7-production-hardening-loop)

---

## 1. Progressive Refactoring Loop

**Use When:** Splitting god classes, reorganizing modules, reducing file sizes

```yaml
---
active: true
iteration: 1
max_iterations: 100
completion_promise: "All target files <300 lines, zero TypeScript errors, build passes, no regressions"
started_at: "2026-01-01T00:00:00+07:00"
module: "arc-module-file-size-reduction"
phase: "refactoring"
---
```

### Loop Body

```markdown
# Progressive Refactoring Loop: File Size Compliance

## Context
- Validation Reference: `_bmad-output/validation/sweeping-validation.md` (Level 2: Code Hygiene)
- Current Violations: 17 files exceed 300-line limit
- Worst Offenders: See `_bmad-output/architectural-gap-analysis-*.md`

## Iteration Protocol

### Phase 1: Analysis (Iterations 1-5)
1. Run `find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -rn | head -50`
2. Identify top 5 largest files
3. Document split strategy per file (identify logical slices)
4. Create migration checklist per file

### Phase 2: Execution (Iterations 6+)
For each oversized file:
1. **Backup** - Document current exports and consumers
2. **Split** - Extract slices to separate files (<120 lines each)
3. **Barrel Export** - Update index.ts with re-exports
4. **Migration Sweep**:
   - `grep -r "from '.*{old-file}'" src/` 
   - Update ALL import paths
   - Check ALL workspaces (ide, knowledge, notes, study)
5. **Validate**:
   - `pnpm tsc --noEmit` (zero errors)
   - `pnpm build` (passes)
   - Manual test affected UI components
6. **Document** - Update AGENTS.md with new file structure

### Constraints
- Max 1 file split per iteration (prevent cascade errors)
- Full validation after each split (catch issues immediately)
- Never more than 1 background task running

### Exit Conditions
- All flagged files < 300 lines
- Zero TypeScript errors
- Build passes
- All existing tests pass

### Completion Signal
<promise>All target files <300 lines, zero TypeScript errors, build passes, no regressions</promise>
```

---

## 2. Gap Analysis & Course Correction Loop

**Use When:** Validating story/epic completion, finding implementation gaps

```yaml
---
active: true
iteration: 1
max_iterations: 50
completion_promise: "Gap analysis complete: all stories validated, course correction proposal created, governance updated"
started_at: "2026-01-01T00:00:00+07:00"
module: "gap-analysis-cycle-18"
phase: "validation"
---
```

### Loop Body

```markdown
# Gap Analysis Loop: Epic Validation Sweep

## Context
- Epics to Validate: 6, 7, 8, 9, 10, 24, 26, 27
- Validation Framework: `_bmad-output/validation/sweeping-validation.md`
- Story Files: `_bmad-output/sprint-artifacts/{epic}-{story}-*.md`

## 11-Check Validation Framework (Per Story)

| # | Check | Verification Method |
|---|-------|---------------------|
| 1 | Existence | File/component exists in codebase |
| 2 | Compliance | Implementation matches story requirements |
| 3 | Spec Match | Code aligns with acceptance criteria |
| 4 | Gap Analysis | Missing implementations documented |
| 5 | Documentation Integrity | BMAD alignment verified |
| 6 | Integration Validation | End-to-end flow works |
| 7 | Component Wiring | All components trace to user journeys |
| 8 | Data Mapping | Data flow correctness verified |
| 9 | Requirements Coverage | All requirements addressed |
| 10 | User Journey Routing | Complete flows work |
| 11 | Cross-Architecture | No broken integrations |

## Iteration Protocol

### Per Epic
1. Load epic definition from `_bmad-output/epics.md`
2. For each story in epic:
   a. Run 11-check validation
   b. Document findings (✅ passed, ⚠️ partial, ❌ failed)
   c. Note file size violations (>300 lines)
   d. Note missing features
3. Calculate epic health score
4. Create validation report: `_bmad-output/validation/epic-{N}-validation-{date}.md`

### Course Correction Trigger
If findings include:
- Critical gaps (❌ failed checks)
- Missing stories
- Architecture violations

Create:
- Sprint Change Proposal: `_bmad-output/project-planning-artifacts/sprint-change-proposal-{date}.md`
- New Epic if needed: `_bmad-output/epics/epic-{N+1}-remediation.md`

## Output Format

```markdown
## Epic {N} Validation Report

| Story | Existence | Compliance | Spec Match | Integration | Overall |
|-------|-----------|------------|------------|-------------|---------|
| X.1 | ✅ | ✅ | ⚠️ | ✅ | PARTIAL |
| X.2 | ✅ | ❌ | ❌ | 🔍 | FAILED |

### Critical Issues
- Issue 1: {description}
- Issue 2: {description}

### Actions Required
- Action 1: {remediation}
- Action 2: {remediation}
```

### Completion Signal
<promise>Gap analysis complete: all stories validated, course correction proposal created, governance updated</promise>
```

---

## 3. Epic Implementation Loop

**Use When:** Implementing new epics with multiple stories

```yaml
---
active: true
iteration: 1
max_iterations: 200
completion_promise: "Epic {X} complete: all {N} stories done, ACs met, TDD validated, retrospective filed"
started_at: "2026-01-01T00:00:00+07:00"
module: "epic-{X}-implementation"
phase: "implementation"
---
```

### Loop Body

```markdown
# Epic Implementation Loop

## Context
- Epic Definition: `_bmad-output/epics.md` (Epic {X})
- Architecture: `_bmad-output/project-planning-artifacts/architecture.md`
- Sprint Status: `_bmad-output/sprint-artifacts/sprint-status.yaml`

## Story Cycle (Per Story)

### Phase 1: Story Creation
1. Extract story from epics.md
2. Create story file: `_bmad-output/sprint-artifacts/{X}-{Y}-{slug}.md`
3. Include: User story, Acceptance Criteria, Tasks, Research Requirements
4. Update sprint-status.yaml: `backlog → drafted`

### Phase 2: Context Creation
1. Create context XML: `{X}-{Y}-{slug}-context.xml`
2. Research with MCP tools (min 5 tool calls):
   - Context7: Official docs for dependencies
   - Deepwiki: GitHub patterns
   - Repomix: Codebase analysis
3. Document findings in research_notes section
4. Update status: `drafted → ready-for-dev`

### Phase 3: Implementation (TDD)
For each task:
1. **RED**: Write failing test
2. **GREEN**: Implement minimal code
3. **REFACTOR**: Clean while keeping tests green
4. Run: `pnpm tsc --noEmit && pnpm test`
5. Mark task [x] complete in story file

### Phase 4: Code Review
1. Review against architecture patterns
2. Verify all ACs met
3. Check sweeping validation (relevant levels)
4. Document issues and resolutions
5. Update status: `review → done`

### Phase 5: Story Completion
1. Update sprint-status.yaml with completion timestamp
2. Update bmm-workflow-status.yaml
3. If last story in epic → trigger retrospective

## Constraints
- Research before implementation (no assumption-driven code)
- TDD mandatory (tests first, then implementation)
- Max 1 background task at time
- Build validation after each story

### Completion Signal
<promise>Epic {X} complete: all {N} stories done, ACs met, TDD validated, retrospective filed</promise>
```

---

## 4. Migration Sweep Loop

**Use When:** After major refactoring, centralizing stores, splitting files

```yaml
---
active: true
iteration: 1
max_iterations: 75
completion_promise: "Migration complete: all imports valid, no orphaned refs, all workspaces functional"
started_at: "2026-01-01T00:00:00+07:00"
module: "migration-sweep-{module-name}"
phase: "validation"
---
```

### Loop Body

```markdown
# Migration Sweep Loop: Post-Refactoring Validation

## Context
Refactoring has occurred in:
- Centralized LLM provider configuration
- Agent configuration consolidation
- Tool permissions system update
- Store splits (god classes → slices)

## Sweep Checklist

### 1. Import Validation
```bash
# Find broken imports
pnpm tsc --noEmit 2>&1 | grep "Cannot find module"
# Find orphaned exports
grep -r "export" src/lib/{module}/ --include="*.ts" | cut -d: -f2 | sort | uniq
```

### 2. Workspace Coverage
For each workspace (ide, knowledge, notes, study):
1. Navigate to workspace route
2. Verify core functionality
3. Check state persistence (refresh test)
4. Verify agent/provider selection works
5. Test tool execution

### 3. State Management Audit
```bash
# Find store usages
grep -r "useStore\|useAgentsStore\|useProviderStore" src/presentation --include="*.tsx"
# Verify imports match new structure
grep -r "from '@/stores" src/ --include="*.ts" --include="*.tsx"
```

### 4. Error Handling Check
- Check error boundaries are in place
- Verify graceful degradation on failures
- Test mobile and desktop error states

### 5. Persistence Validation
1. Create test data in IndexedDB
2. Refresh browser
3. Verify data restored correctly
4. Test across workspaces

## Iteration Protocol

Each iteration:
1. Run TypeScript check
2. Fix any import errors found
3. Update barrel exports if needed
4. Verify affected components still work
5. Document changes in AGENTS.md

## Exit Conditions
- Zero TypeScript errors
- All 4 workspaces functional
- State persists across refresh
- No console errors

### Completion Signal
<promise>Migration complete: all imports valid, no orphaned refs, all workspaces functional</promise>
```

---

## 5. State Management Consolidation Loop

**Use When:** Centralizing duplicate stores, implementing single-source-of-truth

```yaml
---
active: true
iteration: 1
max_iterations: 60
completion_promise: "State consolidated: single source of truth, Zustand patterns compliant, no duplicate stores"
started_at: "2026-01-01T00:00:00+07:00"
module: "state-consolidation"
phase: "refactoring"
---
```

### Loop Body

```markdown
# State Management Consolidation Loop

## Context
- Current Issue: Multiple stores managing same state (API keys, agent config)
- Target: Single consolidated store per domain
- Pattern: December 2025 Zustand slice pattern

## Consolidation Steps

### 1. Audit Current Stores
```bash
find src -name "*store*.ts" | xargs wc -l | sort -rn
grep -r "create\s*<" src --include="*.ts" | grep -v test
```

### 2. Identify Duplicates
Document stores with overlapping:
- State properties
- Action signatures
- Persistence keys

### 3. Design Consolidated Structure
```typescript
// Target pattern
src/infrastructure/persistence/stores/{domain}/
├── {domain}-store-core.ts (<120 lines)
├── {domain}-store-{slice1}.ts (<120 lines)
├── {domain}-store-{slice2}.ts (<120 lines)
├── index.ts (combined store with persist)
└── migrate.ts (migration from old stores)
```

### 4. Implementation (Per Domain)

#### Phase 1: Create New Store
1. Create slice files (core, credentials, workspace, events)
2. Create index.ts with combined store
3. Apply persist middleware ONLY to combined store
4. Create migration script

#### Phase 2: Create Facade
1. Create hook/facade matching old API
2. Delegate to new store internally
3. Zero breaking changes to consumers

#### Phase 3: Migration
1. Run migration script
2. Create backup of old data
3. Merge data into new structure
4. Clear old localStorage/IndexedDB entries

#### Phase 4: Consumer Update
1. Find all consumers: `grep -r "useOldStore" src/`
2. Update to new hook/facade
3. Verify no regressions

### 5. Validation
- Test state persistence
- Test cross-workspace reactivity
- Verify no infinite loop bugs (check useShallow usage)
- Profile re-renders (should be 1-3 per action)

### Completion Signal
<promise>State consolidated: single source of truth, Zustand patterns compliant, no duplicate stores</promise>
```

---

## 6. Cross-Workspace Integration Loop

**Use When:** Ensuring features work across all workspaces (IDE, Knowledge, Notes, Study)

```yaml
---
active: true
iteration: 1
max_iterations: 80
completion_promise: "Cross-workspace integration complete: feature works in all 4 workspaces, state syncs, no orphaned UIs"
started_at: "2026-01-01T00:00:00+07:00"
module: "cross-workspace-{feature}"
phase: "integration"
---
```

### Loop Body

```markdown
# Cross-Workspace Integration Loop

## Context
Features must work seamlessly across:
- **IDE**: Full development environment
- **Knowledge**: RAG, canvas, sources
- **Notes**: Block editor, AI features
- **Study**: Flashcards, quizzes

## Integration Checklist (Per Feature)

### 1. Component Availability
| Workspace | Component Present | Routed | Accessible |
|-----------|-------------------|--------|------------|
| IDE | ✅/❌ | ✅/❌ | ✅/❌ |
| Knowledge | ✅/❌ | ✅/❌ | ✅/❌ |
| Notes | ✅/❌ | ✅/❌ | ✅/❌ |
| Study | ✅/❌ | ✅/❌ | ✅/❌ |

### 2. State Synchronization
- State updates in one workspace → reflected in others
- Active agent/provider persists across navigation
- Project context available in all workspaces

### 3. UI Consistency
- Same component, same behavior
- Responsive variants (mobile vs desktop)
- Error states handled identically

### 4. Event Bus Integration
```typescript
// Verify events reach all workspaces
eventBus.emit('provider:changed', { providerId: 'x' });
// All workspaces should react
```

### 5. Test Matrix

| Feature | IDE | Knowledge | Notes | Study |
|---------|-----|-----------|-------|-------|
| Agent selector | Test | Test | Test | Test |
| Provider config | Test | Test | Test | Test |
| Chat panel | Test | Test | Test | Test |
| Tool execution | Test | N/A | Test | N/A |

### Completion Signal
<promise>Cross-workspace integration complete: feature works in all 4 workspaces, state syncs, no orphaned UIs</promise>
```

---

## 7. Production Hardening Loop

**Use When:** Preparing for deployment, fixing P0/P1 issues

```yaml
---
active: true
iteration: 1
max_iterations: 150
completion_promise: "Production ready: zero P0 issues, all P1 resolved, 12-level validation 100% pass"
started_at: "2026-01-01T00:00:00+07:00"
module: "production-hardening"
phase: "validation"
---
```

### Loop Body

```markdown
# Production Hardening Loop

## Context
- P0 Issues: Data loss risks, silent failures
- P1 Issues: Maintainability, performance
- Validation: 12-level sweeping validation

## Priority Resolution Order

### P0: Critical (Fix First)
1. IndexedDB quota handling (wrap all writes in safePut/safeAdd)
2. Silent failure elimination (remove console.error + return null)
3. Data persistence verification (kill tab → reopen → data present)

### P1: High (Fix Second)
1. File size violations (split files >300 lines)
2. Infinite loop prevention (check Zustand patterns)
3. Performance optimization (virtualize lists, IndexedDB indexes)

### P2: Medium (Fix Third)
1. Documentation completeness
2. Test coverage gaps
3. Accessibility compliance

## Validation Sweep (Each Iteration)

### Quick Checks (Every Iteration)
```bash
pnpm tsc --noEmit  # Zero errors
pnpm test          # All pass
pnpm build         # Successful
```

### Deep Checks (Every 5 Iterations)
1. 3-Device Rule test (desktop, mobile Safari, Android Chrome)
2. Offline functionality test
3. Performance profiling
4. Security audit (API keys encrypted, no plaintext in logs)

### Full Sweep (Final Iterations)
Run complete sweeping-validation.md checklist:
- All 12 levels
- All checkboxes verified
- Document any exceptions with justification

## Exit Conditions
- Zero P0 issues
- Zero P1 issues
- 12-level validation: 100% pass
- 3-Device Rule: All pass
- Build: Production bundle successful

### Completion Signal
<promise>Production ready: zero P0 issues, all P1 resolved, 12-level validation 100% pass</promise>
```

---

## Quick Reference: Loop Commands

```bash
# Start loop
/ralph-loop "{PROMPT}" --max-iterations N --completion-promise "{TEXT}"

# Cancel active loop
/cancel-ralph

# Check loop state
cat .claude/ralph-loop.local.md
```

---

## Loop Metrics Dashboard

Track across iterations:

| Metric | Start | Current | Target |
|--------|-------|---------|--------|
| TypeScript Errors | | | 0 |
| Files >300 Lines | | | 0 |
| Build Time | | | <30s |
| Test Coverage | | | >80% |
| Health Score | | | 100% |

---

*End of Loop Templates*
