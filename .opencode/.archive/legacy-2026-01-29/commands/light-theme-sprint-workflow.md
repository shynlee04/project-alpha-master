# Light Theme Sprint Workflow
# Main Sprint Orchestration Workflow

## Workflow Overview

**Workflow ID**: `light-theme-sprint-workflow`
**description**: Orchestrate the complete Light Theme Design System implementation sprint
**Duration**: 4 weeks (28 days)
**Stories**: 23 user stories
**Total Hours**: 88 hours

## Workflow Triggers

### Automatic Triggers
```
- Sprint initialization command
- Story completion events
- Daily standup schedule
- Sprint milestone reached
```

### Manual Triggers
```
- `start sprint`: Begin new sprint
- `pause sprint`: Pause sprint activities
- `resume sprint`: Resume sprint activities
- `cancel sprint`: Cancel sprint
- `generate report`: Generate status report
```

## Workflow Inputs

### Design Artifacts
```
- Design tokens: _bmad-output/light-theme-design-system/tokens/
- Color system: _bmad-output/light-theme-design-system/colors/
- Typography: _bmad-output/light-theme-design-system/typography/
- Components: _bmad-output/light-theme-design-system/components/
- Spacing: _bmad-output/light-theme-design-system/spacing/
- Accessibility: _bmad-output/light-theme-design-system/a11y/
```

### Sprint Configuration
```
- Sprint duration: 4 weeks
- Stories: 23 total
- Phases:
  - Week 1 (Foundation): 7 stories, 24 hours
  - Week 2 (P0 Components): 6 stories, 23 hours
  - Week 3 (P1 Components): 5 stories, 15 hours
  - Week 4 (Workspaces): 5 stories, 26 hours
```

### Templates
```
- Sprint backlog: sprint-backlog-template.md
- Story template: story-template.md
- Status report: sprint-status-report.md
```

## Workflow Stages

### Stage 1: Sprint Initialization
**Duration**: 1 hour
**Agent**: SM Agent

```
1.1 Read design artifacts directory
1.2 Analyze sprint requirements
1.3 Create sprint backlog using template
1.4 Initialize progress tracking
1.5 Generate sprint status report (initial)
1.6 Notify team sprint is ready
```

### Stage 2: Sprint Planning
**Duration**: 2 hours
**Agent**: SM Agent

```
2.1 Read project summary document
2.2 Decompose into user stories
2.3 Create story files for all 23 stories
2.4 Set priorities and estimates
2.5 Create sprint schedule
2.6 Validate sprint capacity
2.7 Approve sprint backlog
```

### Stage 3: Sprint Execution (Weeks 1-4)
**Duration**: 84 hours (21 hours/week)
**Agent**: SM/Dev alternating

The sprint execution follows the story-execution-cycle.md workflow for each story.

#### Week 1: Foundation
```
Stories: STORY-001 to STORY-007
Duration: 24 hours
Focus: Design token infrastructure
Deliverables:
  - CSS custom properties for colors
  - TypeScript theme types
  - ThemeProvider component
  - useTheme hook
```

#### Week 2: P0 Components
```
Stories: STORY-008 to STORY-013
Duration: 23 hours
Focus: Critical component families
Deliverables:
  - Button light theme
  - Input light theme
  - Card light theme
  - Modal light theme
  - Navigation light theme
  - Form components light theme
```

#### Week 3: P1 Components
```
Stories: STORY-014 to STORY-018
Duration: 15 hours
Focus: Secondary component families
Deliverables:
  - Table light theme
  - Select light theme
  - Checkbox light theme
  - Radio light theme
  - Switch light theme
```

#### Week 4: Workspaces
```
Stories: STORY-019 to STORY-023
Duration: 26 hours
Focus: Workspace-specific themes
Deliverables:
  - IDE workspace light theme
  - Knowledge workspace light theme
  - Notes workspace light theme
  - Study workspace light theme
  - Mobile light theme adjustments
```

### Stage 4: Sprint Review
**Duration**: 2 hours
**Agent**: SM Agent + Team

```
4.1 Review completed stories
4.2 Demo light theme implementations
4.3 Collect stakeholder feedback
4.4 Update sprint status
4.5 Document learnings
```

### Stage 5: Sprint Retrospective
**Duration**: 1 hour
**Agent**: SM Agent

```
5.1 Review sprint metrics
5.2 Identify improvements
5.3 Document retrospective findings
5.4 Update processes
5.5 Plan next sprint if applicable
```

## Agent Switching Protocol

### Automatic Switching Events
```
Story Created → Switch to Dev for implementation
Implementation Complete → Switch to SM for review
Review Passed → Switch to Dev for next story
Story Rejected → Switch to Dev for revisions
Sprint Complete → SM for final report
```

### Agent State Management
```yaml
current_agent: light-theme-sm-agent
story_queue:
  - STORY-001
  - STORY-002
  - STORY-003
  # ... all 23 stories
current_story: STORY-001
sprint_status: active
```

## Progress Tracking

### Daily Metrics
```
Date: [Current Date]
Sprint Day: [1-28]
Stories Completed: [Count]
Stories In Progress: [Count]
Stories Blocked: [Count]
Hours Remaining: [Total - Logged]
Blockers: [List]
Velocity: [Stories/Day Average]
```

### Sprint Burn-down
```
Day 1: 23 stories planned
Day 7: 7 stories completed (Week 1 end)
Day 14: 13 stories completed (Week 2 end)
Day 21: 18 stories completed (Week 3 end)
Day 28: 23 stories completed (Sprint end)
```

### Phase Completion Criteria
```
Week 1 (Foundation):
  - [ ] All 7 stories complete
  - [ ] Design tokens implemented
  - [ ] Theme infrastructure ready
  
Week 2 (P0 Components):
  - [ ] All 6 stories complete
  - [ ] Critical components themed
  - [ ] No critical bugs
  
Week 3 (P1 Components):
  - [ ] All 5 stories complete
  - [ ] Secondary components themed
  - [ ] Accessibility verified
  
Week 4 (Workspaces):
  - [ ] All 5 stories complete
  - [ ] All workspaces themed
  - [ ] Mobile responsive
```

## Output Artifacts

### Sprint Artifacts
```
_bmad-output/light-theme-sprint/
├── sprint-backlog.yaml
├── sprint-schedule.yaml
├── stories/
│   ├── STORY-001.md
│   ├── STORY-002.md
│   └── ...
├── progress/
│   ├── daily-standup-YYYY-MM-DD.md
│   └── sprint-progress.yaml
└── reports/
    ├── sprint-status-report-YYYY-MM-DD.md
    ├── sprint-review-report.md
    └── sprint-retrospective.md
```

### Final Deliverables
```
- 36 component families with light theme variants
- 78 CSS custom properties for colors
- TypeScript theme types
- useTheme hook
- ThemeProvider component
- ThemeToggle component
- WCAG 2.1 AA compliance verified
```

## Workflow Execution

### Entry Command
```
$ bmad execute light-theme-sprint-workflow
```

### Execution Sequence
```
[SM] Stage 1: Sprint Initialization
  → Read design artifacts
  → Create sprint backlog
  → Initialize tracking
  
[SM] Stage 2: Sprint Planning
  → Create 23 story files
  → Set priorities and estimates
  → Approve sprint backlog
  
[Loop for each story in Week 1-4]
  [SM] Create story context
  [SM] Validate story
  [Switch to Dev]
  [Dev] Implement story
  [Dev] Run tests
  [Dev] Submit for review
  [Switch to SM]
  [SM] Code review
  [SM] Accept or request revisions
[/Loop]

[SM] Stage 4: Sprint Review
  → Demo completed work
  → Collect feedback
  
[SM] Stage 5: Sprint Retrospective
  → Review metrics
  → Document learnings
```

### Progress Checkpoints
```
- Daily: Daily standup at 9:00 AM
- Weekly: Friday progress review
- Milestone: End of each week
- Final: Sprint completion review
```

## Error Handling

### Blocker Management
```
1. Blocker identified by Dev agent
2. Dev reports blocker to SM agent
3. SM analyzes blocker
4. SM resolves if possible
5. SM escalates if needed
6. Blocker resolved → Resume story
```

### Scope Management
```
1. Scope creep identified
2. SM evaluates impact
3. SM consults with stakeholders
4. Decision: Approve / Reject / Defer
5. Update sprint backlog if approved
```

### Quality Issues
```
1. Code review failure
2. SM provides feedback
3. Dev fixes issues
4. Dev resubmits
5. Review passes → Continue
```

## Success Criteria

### Sprint Success
```
- All 23 stories completed
- 90% of planned hours used
- 100% P0 stories complete
- WCAG 2.1 AA compliance
- No critical bugs
- All deliverables shipped
```

### Quality Metrics
```
- Code review pass rate: >90%
- Test coverage: >80%
- Design fidelity: >95%
- Accessibility score: 100%
- Performance impact: <5%
```

## Post-Sprint Actions

### If Successful
```
1. Generate final sprint report
2. Merge light theme to main branch
3. Deploy to staging environment
4. Notify stakeholders
5. Plan next sprint if needed
```

### If Unfinished
```
1. Document incomplete stories
2. Create carryover backlog
3. Analyze reasons for delay
4. Adjust estimates for next sprint
5. Continue in next sprint cycle
```

## Example Execution

### Day 1 Morning
```
[SM] "=== Sprint Day 1 ==="
[SM] "Reading design artifacts from _bmad-output/light-theme-design-system/"
[SM] "Creating sprint backlog for 23 stories across 4 weeks..."
[SM] "Story STORY-001: Design Token Infrastructure - 4 hours - P0"
[SM] "Story STORY-002: Color System Variables - 6 hours - P0"
[SM] "Story STORY-003: Typography System Variables - 3 hours - P0"
[SM] "Story STORY-004: CSS Custom Properties Setup - 3 hours - P0"
[SM] "Story STORY-005: TypeScript Theme Types - 3 hours - P0"
[SM] "Story STORY-006: ThemeProvider Component - 3 hours - P0"
[SM] "Story STORY-007: useTheme Hook - 2 hours - P0"
[SM] "Week 1 Foundation phase planned (7 stories, 24 hours)"
[SM] "Sprint backlog created and approved"
[SM] "Switching to Dev agent for STORY-001 implementation..."
```

### Day 1 Afternoon
```
[Dev] "=== Starting STORY-001: Design Token Infrastructure ==="
[Dev] "Creating light-theme.css with CSS custom properties..."
[Dev] "Implementing 78 color tokens..."
[Dev] "Adding typography, spacing, and shadow tokens..."
[Dev] "Creating TypeScript theme types..."
[Dev] "Building ThemeProvider component..."
[Dev] "Creating useTheme hook..."
[Dev] "Writing and running tests..."
[Dev] "All tests passing"
[Dev] "Submitting for code review..."
[Switch to SM]
[SM] "=== Reviewing STORY-001 ==="
[SM] "Code review: PASSED"
[SM] "All acceptance criteria met"
[SM] "Story STORY-001 marked as COMPLETE"
[SM] "Switching to Dev agent for STORY-002..."
```

### Week 1 Friday
```
[SM] "=== Week 1 Progress Report ==="
[SM] "Stories Completed: 7/7 (100%)"
[SM] "Hours Used: 24/24 (100%)"
[SM] "Foundation phase: COMPLETE"
[SM] "Design tokens: IMPLEMENTED"
[SM] "Theme infrastructure: READY"
[SM] "Week 2 (P0 Components) ready to begin"
[SM] "No blockers reported"
[SM] "Velocity: 7 stories/week"
```
