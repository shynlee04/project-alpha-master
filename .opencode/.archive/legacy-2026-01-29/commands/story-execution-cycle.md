# Story Execution Cycle
# SM → Dev → Review Cycle for Light Theme Sprint

## Workflow Overview

**Workflow ID**: `story-execution-cycle`
**Parent**: light-theme-sprint-workflow
**description**: Execute a single story from creation to completion
**Duration**: Varies by story (2-6 hours typical)
**Agents**: SM Agent and Dev Agent (alternating)

## Workflow Triggers

### Automatic Triggers
```
- Sprint started (first story)
- Previous story completed
- Story unblocked
- Revisions completed
```

### Manual Triggers
```
- `start story [id]`: Start specific story
- `resume story [id]`: Resume blocked story
- `skip story [id]`: Skip story (requires reason)
- `reassign story [id]`: Change assignee
```

## Workflow Inputs

### Story Context
```
- Story file: _bmad-output/light-theme-sprint/stories/[STORY-XXX].md
- Design tokens: _bmad-output/light-theme-design-system/tokens/
- Component specs: _bmad-output/light-theme-design-system/components/
- Reference code: src/components/[component]/ (read-only)
```

### Agent State
```
current_agent: light-theme-sm-agent
story_id: STORY-001
story_status: todo
execution_mode: sync | async
```

## Workflow Stages

### Stage 1: Story Selection
**Duration**: 5 minutes
**Agent**: SM Agent

```
1.1 Check sprint backlog for next story
1.2 Verify story is ready (dependencies met)
1.3 Assign story to execution queue
1.4 Notify SM agent to begin
```

#### Selection Criteria
```
[ ] Story is at top of backlog
[ ] All dependencies completed
[ ] Resources available
[ ] No active blockers
[ ] Team capacity available
```

#### Priority Order
```
1. P0 stories first
2. Within same priority, sprint order
3. Consider dependencies
4. Consider team availability
```

### Stage 2: Create Story Context
**Duration**: 15-30 minutes
**Agent**: SM Agent

```
2.1 Read story file
2.2 Extract acceptance criteria
2.3 Identify design references
2.4 Create implementation context document
2.5 Document technical approach
2.6 List dependencies and prerequisites
```

#### Context Document Structure
```yaml
context:
  story_id: STORY-001
  story_title: Design Token Infrastructure
  priority: P0
  estimation: 4 hours
  
  acceptance_criteria:
    - CSS custom properties for all 78 colors defined
    - Color tokens follow naming convention --color-[scale]-[value]
    - Color values from design system specification
    - CSS file created at src/styles/light-theme.css
    - No duplicate or missing tokens
  
  design_references:
    - colors/primary-colors.md
    - colors/neutral-colors.md
    - colors/semantic-colors.md
    - tokens/color-tokens.json
  
  technical_approach:
    - Create src/styles/light-theme.css
    - Define :root and [data-theme="light"] selectors
    - Use design token values from specification
    - Follow existing dark theme structure
  
  dependencies:
    - None (first story)
  
  prerequisites:
    - Design tokens verified
    - No blocking stories
  
  risks:
    - Risk: Design tokens may change
      mitigation: Use flexible structure
      impact: Medium
```

### Stage 3: Validate Context
**Duration**: 10 minutes
**Agent**: SM Agent

```
3.1 Review context document for completeness
3.2 Verify all acceptance criteria have approach
3.3 Check dependencies are resolved
3.4 Confirm design references are accessible
3.5 Mark context as validated or request revisions
```

#### Validation Checklist
```
[ ] All acceptance criteria addressed
[ ] Technical approach defined
[ ] Design references accessible
[ ] Dependencies verified
[ ] Risks identified and mitigated
[ ] Resources available
```

#### Validation Decision
```
VALID: Proceed to Stage 4
INVALID: Return to Stage 2 with feedback
BLOCKED: Escalate blocker
```

### Stage 4: Agent Switch to Dev
**Duration**: 2 minutes
**Agent**: SM Agent (orchestrates switch)

```
4.1 Mark story as "In Progress"
4.2 Assign to Dev agent
4.3 Provide context document
4.4 Set execution mode (sync/async)
4.5 Notify Dev agent
```

#### Handoff Protocol
```yaml
handoff:
  from: light-theme-sm-agent
  to: light-theme-dev-agent
  story_id: STORY-001
  story_title: Design Token Infrastructure
  priority: P0
  estimation: 4 hours
  context_document: _bmad-output/light-theme-sprint/stories/STORY-001-context.md
  mode: sync
  
instructions: |
  Please implement STORY-001: Design Token Infrastructure.
  Full context available at: _bmad-output/light-theme-sprint/stories/STORY-001-context.md
  
  Key requirements:
  - Create 78 CSS custom properties for colors
  - Follow naming convention: --color-[scale]-[value]
  - Use design token values from _bmad-output/light-theme-design-system/tokens/
  - Create file at src/styles/light-theme.css
  
  Acceptance criteria:
  - [ ] All 78 color tokens defined
  - [ ] Naming convention followed
  - [ ] Values match specification
  - [ ] File created successfully
  - [ ] No duplicates or missing tokens
  
  Please follow story-dev-cycle.md workflow and
  use MCP tools for research as needed.
  
  Status: Ready for implementation
```

### Stage 5: Dev Implementation
**Duration**: Variable (1-4 hours)
**Agent**: Dev Agent

#### Step 5.1: Research
```
5.1.1 Read design tokens from specification
5.1.2 Review existing dark theme implementation
5.1.3 Analyze component examples
5.1.4 Research best practices
5.1.5 Document findings
```

#### Step 5.2: Implement
```
5.2.1 Create/update implementation files
5.2.2 Apply CSS custom properties
5.2.3 Define TypeScript types
5.2.4 Build components/hooks
5.2.5 Configure Tailwind if needed
```

#### Step 5.3: Test
```
5.3.1 Write unit tests
5.3.2 Run existing tests
5.3.3 Verify accessibility
5.3.4 Check responsive behavior
5.3.5 Document test coverage
```

#### Step 5.4: Review
```
5.4.1 Self-review code
5.4.2 Run linting
5.4.3 Run type checking
5.4.4 Verify all acceptance criteria
5.4.5 Update documentation
```

### Stage 6: Submit for Review
**Duration**: 5 minutes
**Agent**: Dev Agent

```
6.1 Prepare review package
6.2 Document changes
6.3 List files modified
6.4 Note any issues or concerns
6.5 Submit to SM agent for review
```

#### Review Package Structure
```yaml
review_package:
  story_id: STORY-001
  status: submitted_for_review
  
  changes:
    files_created:
      - src/styles/light-theme.css
    files_modified: []
    files_deleted: []
  
  summary: |
    Created light-theme.css with 78 CSS custom properties
    for the light theme color system. All color tokens
    follow the --color-[scale]-[value] naming convention.
  
  acceptance_criteria_status:
    - criteria: CSS custom properties for all 78 colors defined
      status: met
      evidence: src/styles/light-theme.css contains all 78 tokens
    
    - criteria: Color tokens follow naming convention
      status: met
      evidence: All tokens use --color-[scale]-[value] format
    
    - criteria: Color values from design system specification
      status: met
      evidence: Values match tokens/color-tokens.json
    
    - criteria: CSS file created at src/styles/light-theme.css
      status: met
      evidence: File created and verified
    
    - criteria: No duplicate or missing tokens
      status: met
      evidence: Validated against specification
  
  tests:
    unit_tests: 5
    integration_tests: 0
    e2e_tests: 0
    all_passed: true
  
  issues:
    - None
  
  notes: |
    File is ready for review. All acceptance criteria met.
    Tests passing. Documentation updated.
```

### Stage 7: Code Review
**Duration**: 15-30 minutes
**Agent**: SM Agent

#### Step 7.1: Initial Review
```
7.1.1 Review changes summary
7.1.2 Verify acceptance criteria
7.1.3 Check code quality
7.1.4 Validate tests
7.1.5 Check documentation
```

#### Step 7.2: Detailed Review
```
7.2.1 Review file changes
7.2.2 Check for issues
7.2.3 Verify accessibility
7.2.4 Check performance impact
7.2.5 Validate against design
```

#### Review Decision
```
APPROVED: Proceed to Stage 10
REQUEST_CHANGES: Proceed to Stage 8
REJECTED: Proceed to Stage 9 (with reason)
```

### Stage 8: Request Revisions
**Duration**: 10 minutes
**Agent**: SM Agent

```
8.1 Document feedback
8.2 List required changes
8.3 Provide constructive suggestions
8.4 Return to Dev agent
8.5 Set story status to "Changes Requested"
```

#### Feedback Structure
```yaml
feedback:
  story_id: STORY-001
  decision: request_changes
  
  issues:
    - issue: Missing --color-success-100 token
      severity: medium
      location: src/styles/light-theme.css
      suggestion: Add token following pattern of other success colors
    
    - issue: border-radius uses px instead of rem
      severity: low
      location: src/styles/light-theme.css
      suggestion: Convert to rem for consistency
  
  required_changes:
    - Add missing --color-success-100 token
    - Convert border-radius values to rem
  
  optional_improvements:
    - Consider grouping tokens by category
  
  deadline: 24 hours
```

### Stage 9: Story Rejected
**Duration**: 5 minutes
**Agent**: SM Agent

```
9.1 Document rejection reason
9.2 Assess impact on sprint
9.3 Plan rework or scope change
9.4 Communicate to team
9.5 Update story status
```

#### Rejection Handling
```yaml
rejection:
  story_id: STORY-001
  reason: Critical issues found
  
  issues:
    - issue: Design token values incorrect
      severity: critical
      evidence: Values don't match specification
    
    - issue: File structure doesn't follow conventions
      severity: critical
      evidence: Missing required sections
  
  resolution_options:
    - option: Dev fixes issues and resubmits
      timeline: 4-8 hours
    
    - option: Create new story for rework
      timeline: 1-2 days
    
    - option: Remove from sprint scope
      timeline: Immediate
  
  recommended: Option 1 (Dev fixes and resubmits)
```

### Stage 10: Story Approved
**Duration**: 10 minutes
**Agent**: SM Agent

```
10.1 Mark story as "Complete"
10.2 Document completion notes
10.3 Update sprint progress
10.4 Notify team
10.5 Trigger next story or stage
```

#### Completion Documentation
```yaml
completion:
  story_id: STORY-001
  status: complete
  
  completed_at: 2026-01-03T14:30:00Z
  actual_hours: 3.5
  estimated_hours: 4
  
  acceptance_criteria:
    - All 7 criteria: MET
  
  quality_metrics:
    code_review_pass: true
    test_coverage: 100%
    accessibility_compliance: verified
  
  deliverables:
    - src/styles/light-theme.css (78 color tokens)
    - Tests passing
    - Documentation updated
  
  notes: |
    Story completed successfully under estimate.
    All acceptance criteria met. No issues.
  
  next_steps:
    - Proceed to STORY-002
    - Update sprint burn-down
```

### Stage 11: Loop or Continue
**Duration**: 2 minutes
**Agent**: SM Agent

```
11.1 Check for more stories in sprint
11.2 If yes: Start next story (go to Stage 1)
11.3 If no: Check for phase completion
11.4 If phase complete: Trigger phase review
11.5 If sprint complete: Trigger sprint review
```

## Branching Logic

```
Story Complete?
├─ YES → More stories in sprint?
│           ├─ YES → Start next story (Stage 1)
│           └─ NO → Sprint complete? (Stage 11)
│                    ├─ YES → Trigger sprint review
│                    └─ NO → Wait for dependent stories
│
└─ NO → Revisions requested?
          ├─ YES → Return to Dev (Stage 5)
          └─ NO → Story rejected?
                   ├─ YES → Handle rejection (Stage 9)
                   └─ NO → Check other outcomes
```

## Example Execution

### Stage 1-4: Handoff
```
[SM] "=== Starting STORY-001: Design Token Infrastructure ==="
[SM] "Reading story file and acceptance criteria..."
[SM] "Creating context document..."
[SM] "Context validated. All acceptance criteria addressed."
[SM] "Switching to Dev agent for implementation..."
[Dev] "=== STORY-001: Implementation Started ==="
[Dev] "Researching design tokens..."
[Dev] "Reading 78 color tokens from specification..."
[Dev] "Reviewing existing dark theme structure..."
[Dev] "Implementation context received. Beginning work..."
```

### Stage 5: Implementation
```
[Dev] "=== Implementing STORY-001 ==="
[Dev] "Creating src/styles/light-theme.css..."
[Dev] "Defining :root and [data-theme='light'] selectors..."
[Dev] "Adding primary color tokens (50-900)..."
[Dev] "Adding neutral color tokens (50-900)..."
[Dev] "Adding semantic color tokens..."
[Dev] "Verifying all 78 tokens present..."
[Dev] "Running validation against specification..."
[Dev] "All tokens validated. Creating TypeScript types..."
[Dev] "TypeScript types complete. Writing tests..."
[Dev] "Tests passing. Updating documentation..."
[Dev] "Self-review: All acceptance criteria met."
[Dev] "Submitting for code review..."
```

### Stage 6-7: Review
```
[SM] "=== Reviewing STORY-001 ==="
[SM] "Reviewing changes..."
[SM] "Code quality: EXCELLENT"
[SM] "Acceptance criteria: ALL MET"
[SM] "Tests: ALL PASSING"
[SM] "Documentation: UPDATED"
[SM] "Review: APPROVED"
[SM] "=== STORY-001: COMPLETE ==="
[SM] "Updating sprint progress..."
[SM] "Stories completed: 1/23"
[SM] "Hours used: 3.5/88"
[SM] "Switching to next story..."
```

## Error Handling

### Blocker Detection
```
During implementation:
1. Dev identifies blocker
2. Dev documents blocker
3. Dev reports to SM
4. SM analyzes blocker
5. SM resolves or escalates
6. Story resumed or blocked
```

### Quality Failures
```
During review:
1. SM identifies issue
2. SM categorizes severity
3. SM requests changes or rejects
4. Dev fixes or creates new story
5. Story resubmitted or deferred
```

### Dependency Issues
```
Before implementation:
1. Check dependency status
2. If blocked, mark story blocked
3. Notify SM
4. SM reorders backlog
5. Story resumed when ready
```

## Success Metrics

### Story Completion
```
- First-time approval rate: >80%
- Revisions per story: <1.5
- On-time completion: >90%
- Quality score: >95%
```

### Cycle Time
```
- Average cycle time: 2-4 hours
- Minimum cycle time: 1 hour
- Maximum cycle time: 8 hours
- Target: <4 hours per story
```

### Quality Metrics
```
- Code review pass rate: >90%
- Test coverage: >80%
- Acceptance criteria met: 100%
- Bug introduction rate: <5%
```
