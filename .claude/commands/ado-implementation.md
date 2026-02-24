# ado-implementation

Execute ADO Phase 3: Implementation - TDD development with validation gates.

## Overview

This command initiates the **Implementation Phase** of the ADO development lifecycle. It follows strict TDD (Test-Driven Development) practices with continuous validation gates.

## Prerequisites

- **Planning phase completed** (Phase 2)
- Gate 2 validation passed
- Architecture documented
- User stories created with acceptance criteria
- Technical specifications available

## Usage

```
/ado-implementation [story-id] [--parallel] [--skip-validation]
```

**Parameters:**
- `story-id`: Optional specific story to implement (e.g., "ADO-3-001")
- `--parallel`: Enable parallel implementation for independent stories
- `--skip-validation`: Skip validation gates (NOT recommended)

## Phase 3: Implementation Loop

### Step 1: Load Workflow
1. **Load workflow configuration** from `.bmad/ado/workflows/ado-implementation-loop/workflow.yaml`
2. **Load validation gate** from `.bmad/ado/workflows/ado-validation-gate/workflow.yaml`
3. **Read sprint backlog** from `docs/ado-artifacts/ado-sprint-tracker.yaml`

### Step 2: TDD Cycle (Red-Green-Refactor)

#### RED: Write Failing Test
1. **Select next story** from sprint backlog
2. **Write acceptance test** based on story criteria
3. **Write unit tests** for components
4. **Tests fail** (as expected)

#### GREEN: Minimal Implementation
1. **Write minimal code** to pass tests
2. **No premature optimization**
3. **Focus on functionality**
4. **Tests pass**

#### REFACTOR: Improve Code
1. **Clean up implementation**
2. **Improve naming and structure**
3. **Maintain test coverage**
4. **Tests still pass**

### Step 3: Continuous Validation Gates

After each story implementation:

#### Gate 3A: Code Quality
- [ ] **Type checking**: `pnpm typecheck` passes
- [ ] **Linting**: `pnpm lint` clean
- [ ] **Formatting**: `pnpm format` applied
- [ ] **Dead code**: No unused code or imports

#### Gate 3B: Testing
- [ ] **Unit tests**: All pass with ≥80% coverage
- [ ] **Integration tests**: Pass for affected modules
- [ ] **Story tests**: Acceptance criteria met

#### Gate 3C: Build & Deploy
- [ ] **Build succeeds**: `pnpm build` passes
- [ ] **No breaking changes**: Existing functionality intact
- [ ] **Performance**: No regression in benchmarks

#### Gate 3D: Documentation
- [ ] **Code comments**: Complex logic explained
- [ ] **README updates**: If API/interface changed
- [ ] **Story completion**: Marked as done with evidence

### Step 4: Parallel Execution (Optional)
If `--parallel` flag used:
- Implement independent stories simultaneously
- Maximum 3 parallel implementations
- Coordinate shared dependencies
- Merge conflicts resolved

### Step 5: Progress Tracking
1. **Update sprint tracker** after each story
2. **Mark stories complete** with evidence
3. **Update burndown chart**
4. **Document blockers and issues**

## Validation Tools

### Code Validation
```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Formatting
pnpm format

# Dead code detection
pnpm deadcode

# Unused imports
pnpm unused
```

### Testing
```bash
# Unit tests
pnpm test

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# Coverage report
pnpm test:coverage
```

### Build & Deploy
```bash
# Production build
pnpm build

# Preview build
pnpm preview

# Performance audit
pnpm audit:perf
```

## Implementation Patterns

### Component Development
```typescript
// 1. Write test first
describe('UserCard', () => {
  it('should display user name', () => {
    render(<UserCard user={mockUser} />)
    expect(screen.getByText(mockUser.name)).toBeInTheDocument()
  })
})

// 2. Minimal implementation
export function UserCard({ user }: UserCardProps) {
  return <div>{user.name}</div>
}

// 3. Refactor
export function UserCard({ user }: UserCardProps) {
  return (
    <div className="user-card">
      <h3 className="user-card__name">{user.name}</h3>
    </div>
  )
}
```

### API Development
```typescript
// 1. Write test first
describe('POST /api/users', () => {
  it('should create user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'John' })
    expect(response.status).toBe(201)
  })
})

// 2. Minimal implementation
app.post('/api/users', (req, res) => {
  res.status(201).json({ id: 1, ...req.body })
})

// 3. Refactor with validation, error handling
app.post('/api/users', async (req, res) => {
  try {
    const user = await userService.create(req.body)
    res.status(201).json(user)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})
```

## Outputs

All outputs saved to `docs/ado-artifacts/ado-phase-outputs/implementation/`:

```
docs/ado-artifacts/ado-phase-outputs/implementation/
├── code-changes/
│   ├── [story-id]-changes.md        # Git diff summary
│   ├── [story-id]-test-results.md   # Test execution results
│   └── [story-id]-validation.md     # Validation gate results
├── test-reports/
│   ├── unit-test-results.html       # Coverage report
│   ├── integration-test-results.md  # Integration test summary
│   └── e2e-test-results.md          # E2E test summary
├── build-reports/
│   ├── build-success.md             # Build output
│   ├── performance-metrics.md       # Performance benchmarks
│   └── bundle-analysis.md           # Bundle size analysis
└── implementation-report.md         # Comprehensive phase report
```

## Sprint Tracking

Progress tracked in `docs/ado-artifacts/ado-sprint-tracker.yaml`:

```yaml
sprint:
  number: 1
  goal: "Complete AI chat feature"
  start_date: "2025-11-30"
  end_date: "2025-12-07"

backlog:
  - id: "ADO-3-001"
    title: "Implement chat component"
    status: "completed"  # todo | in-progress | done | blocked
    type: "feature"
    priority: "high"
    effort: "M"
    assignee: "ado-coder"
    completed_date: "2025-11-30"
    evidence:
      - "Tests passing: pnpm test ✓"
      - "Type check: pnpm typecheck ✓"
      - "Build success: pnpm build ✓"
      - "Code review: approved ✓"

  - id: "ADO-3-002"
    title: "Implement API endpoint"
    status: "in-progress"
    type: "feature"
    priority: "high"
    effort: "L"
    assignee: "ado-coder"
```

## Checklist

Progress tracked in workflow checklist:

- [ ] 3.1: Story selected and analyzed
- [ ] 3.2: Acceptance tests written
- [ ] 3.3: Unit tests written
- [ ] 3.4: RED phase complete (tests failing)
- [ ] 3.5: Minimal implementation written
- [ ] 3.6: GREEN phase complete (tests passing)
- [ ] 3.7: Code refactored
- [ ] 3.8: REFACTOR phase complete
- [ ] 3.9: Gate 3A (Code Quality) passed
- [ ] 3.10: Gate 3B (Testing) passed
- [ ] 3.11: Gate 3C (Build) passed
- [ ] 3.12: Gate 3D (Documentation) passed
- [ ] 3.13: Sprint tracker updated
- [ ] 3.14: Story marked complete

## Success Criteria

Implementation phase is complete when:
- All planned stories implemented
- TDD cycle followed for each story
- All validation gates passed
- Test coverage ≥80%
- Build succeeds without errors
- Documentation updated
- Sprint goals achieved
- No critical bugs remaining

## Examples

### Implement Specific Story
```
/ado-implementation ADO-3-001
```
**Result**: Implements story ADO-3-001 following complete TDD cycle with validation gates.

### Parallel Implementation
```
/ado-implementation --parallel
```
**Result**: Implements multiple independent stories in parallel with coordination.

### Full Sprint
```
/ado-implementation
```
**Result**: Implements entire sprint backlog following TDD methodology.

## Common Patterns

1. **Greenfield Development**: TDD from scratch with new features
2. **Refactoring**: TDD refactoring with preservation of behavior
3. **Bug Fixes**: TDD approach to fix existing issues
4. **Feature Addition**: Add new features to existing code

## Integration with ADO

- **Previous Phase**: `ado-planning` (Phase 2)
- **Next Phase**: `ado-validation-gate` (Phase 4)
- **Prerequisites**: Gate 2 validation passed
- **Gate**: Must pass Gate 3 before proceeding to Review
- **Workflows**: Uses `ado-validation-gate` continuously
- **Agents**: Primarily `ado-coder` and `ado-validator`

## Validation Gate Details

### Gate 3A: Code Quality
**Triggered**: After every code change
**Commands**: `pnpm typecheck`, `pnpm lint`, `pnpm format`
**Pass Criteria**: Zero errors, zero warnings

### Gate 3B: Testing
**Triggered**: After every story
**Commands**: `pnpm test`, `pnpm test:coverage`
**Pass Criteria**: All tests pass, coverage ≥80%

### Gate 3C: Build
**Triggered**: Daily and before merge
**Commands**: `pnpm build`
**Pass Criteria**: Build succeeds, no performance regression

### Gate 3D: Documentation
**Triggered**: After feature completion
**Checklist**: README updated, comments added, story marked done
**Pass Criteria**: All documentation complete

## Notes

- **TDD is mandatory** - no code without tests
- **Small iterations** - complete TDD cycle for each task
- **Continuous validation** - gates after every change
- **Evidence-based completion** - prove work with test results
- **No skipping gates** - validation is non-negotiable

For more information, see:
- `.bmad/ado/workflows/ado-implementation-loop/workflow.yaml`
- `.bmad/ado/workflows/ado-validation-gate/workflow.yaml`
- `.bmad/ado/README.md`
