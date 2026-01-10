# ado-status

Check ADO project status - view current phase, sprint progress, and workflow state.

## Overview

This command provides a comprehensive status report of the ADO workflow including current phase, active stories, progress metrics, and any blockers.

## Prerequisites

- ADO module installed at `.bmad/ado/`
- At least one workflow executed (for meaningful status)

## Usage

```
/ado-status [--format=table|json] [--phase] [--sprint]
```

**Parameters:**
- `--format`: Output format - `table` (default) or `json`
- `--phase`: Show only current phase information
- `--sprint`: Show only sprint backlog information

## Status Information

### Current Phase Status
- **Active Phase**: Which phase is currently active
- **Phase Progress**: Completion percentage and checklist status
- **Gate Status**: Which gates are passed/blocked
- **Next Actions**: What needs to be done next

### Sprint Tracker
- **Sprint Number**: Current sprint identifier
- **Sprint Goal**: Objective for this sprint
- **Sprint Dates**: Start and end dates
- **Story Status**: Progress on each story
- **Burndown**: Remaining work vs. time

### Workflow State
- **Overall Progress**: Percentage complete through full lifecycle
- **Completed Phases**: List of finished phases
- **Active Workflows**: Currently running workflows
- **Failed Validations**: Any failed gate validations

### Research Cache
- **Cached Queries**: Number of cached research results
- **Last Research**: Most recent research activity
- **Confidence Scores**: Average confidence of cached research

## Status Files

ADO maintains several status files:

### 1. Workflow Status
**File**: `docs/ado-artifacts/ado-workflow-status.yaml`
```yaml
lifecycle:
  current_phase: "discovery"  # discovery | planning | implementation | review
  phase_progress: 65
  gates_passed:
    - "gate_1_research_complete"
  gates_pending:
    - "gate_1_scope_defined"
    - "gate_1_constraints_set"

overall_progress: 25  # percentage through full lifecycle

completed_phases: []

active_workflows:
  - name: "ado-discovery"
    status: "in_progress"
    started: "2025-11-30T10:00:00Z"
    progress: 65

failed_validations: []
```

### 2. Sprint Tracker
**File**: `docs/ado-artifacts/ado-sprint-tracker.yaml`
```yaml
sprint:
  number: 1
  goal: "Fix agentic-coder pipeline"
  start_date: "2025-11-30"
  end_date: "2025-12-07"
  capacity: 13  # story points

backlog:
  - id: "ADO-1-001"
    title: "Investigate pipeline failure"
    status: "completed"
    type: "feature"
    priority: "high"
    effort: "M"
    completed_date: "2025-11-30"
    evidence:
      - "Research completed ✓"
      - "Root cause identified ✓"
      - "Documentation updated ✓"

  - id: "ADO-2-001"
    title: "Design refactoring approach"
    status: "completed"
    type: "feature"
    priority: "high"
    effort: "L"
    completed_date: "2025-11-30"
    evidence:
      - "Architecture documented ✓"
      - "Stories created ✓"
      - "Tech specs complete ✓"

  - id: "ADO-3-001"
    title: "Implement pipeline refactor"
    status: "in_progress"
    type: "feature"
    priority: "high"
    effort: "XL"
    assignee: "ado-coder"

  - id: "ADO-3-002"
    title: "Add test coverage"
    status: "todo"
    type: "feature"
    priority: "high"
    effort: "L"
    dependencies:
      - "ADO-3-001"

metrics:
  completed_story_points: 8
  remaining_story_points: 5
  total_story_points: 13
  completion_percentage: 62
  days_remaining: 5
  velocity: 1.6  # story points per day
```

### 3. Research Cache Index
**File**: `docs/ado-artifacts/ado-research-cache/index.yaml`
```yaml
total_queries: 15
last_query: "2025-11-30T14:30:00Z"
average_confidence: 0.82

queries:
  - query: "agentic-coder pipeline patterns"
    timestamp: "2025-11-30T10:00:00Z"
    tools_used: ["deepwiki", "context7", "tavily"]
    confidence: 0.85
    cache_path: "ado-research-cache/abc123/"

  - query: "TypeScript strict mode patterns"
    timestamp: "2025-11-30T11:15:00Z"
    tools_used: ["context7"]
    confidence: 0.95
    cache_path: "ado-research-cache/def456/"
```

## Status Display

### Table Format (Default)

```
╔════════════════════════════════════════════════════════════╗
║                  ADO PROJECT STATUS                       ║
╠════════════════════════════════════════════════════════════╣
║ Current Phase: DISCOVERY (Phase 1)                        ║
║ Phase Progress: 65%                                       ║
║ Overall Progress: 25%                                     ║
╠════════════════════════════════════════════════════════════╣
║ SPRINT 1: Fix agentic-coder pipeline                     ║
║ Goal: Restore full functionality to agentic-coder         ║
║ Dates: 2025-11-30 → 2025-12-07                            ║
║ Capacity: 13 story points                                 ║
╠════════════════════════════════════════════════════════════╣
║ Story Progress:                                           ║
║  ✓ ADO-1-001: Investigate pipeline (Completed, 3 pts)     ║
║  ✓ ADO-2-001: Design refactor (Completed, 5 pts)          ║
║  ⟳ ADO-3-001: Implement refactor (In Progress, 8 pts)     ║
║  ○ ADO-3-002: Add tests (Todo, 3 pts)                     ║
║                                                            ║
║ Burndown: 62% complete (8/13 pts)                        ║
║ Velocity: 1.6 pts/day | Days remaining: 5                ║
╠════════════════════════════════════════════════════════════╣
║ Gates:                                                    ║
║  ✓ Gate 1A: Research Complete                            ║
║  ○ Gate 1B: Scope Defined (Pending)                      ║
║  ○ Gate 1C: Constraints Set (Pending)                    ║
╠════════════════════════════════════════════════════════════╣
║ Research Cache:                                           ║
║  Total queries: 15 | Avg confidence: 0.82                ║
║  Last query: 2025-11-30 14:30                            ║
╠════════════════════════════════════════════════════════════╣
║ Next Actions:                                             ║
║  1. Complete discovery phase checklist                    ║
║  2. Pass Gate 1 validation                                ║
║  3. Move to Planning phase                                ║
╚════════════════════════════════════════════════════════════╝
```

### JSON Format

```json
{
  "lifecycle": {
    "current_phase": "discovery",
    "phase_progress": 65,
    "overall_progress": 25
  },
  "sprint": {
    "number": 1,
    "goal": "Fix agentic-coder pipeline",
    "progress": {
      "completed_points": 8,
      "remaining_points": 5,
      "total_points": 13,
      "completion_percentage": 62
    }
  },
  "gates": {
    "passed": ["gate_1_research_complete"],
    "pending": ["gate_1_scope_defined", "gate_1_constraints_set"],
    "failed": []
  },
  "research": {
    "total_queries": 15,
    "average_confidence": 0.82,
    "last_query": "2025-11-30T14:30:00Z"
  },
  "next_actions": [
    "Complete discovery phase checklist",
    "Pass Gate 1 validation",
    "Move to Planning phase"
  ]
}
```

## Examples

### View Full Status
```
/ado-status
```
**Result**: Complete status report in table format with all information.

### View as JSON
```
/ado-status --format=json
```
**Result**: Machine-readable JSON format with all status data.

### View Current Phase
```
/ado-status --phase
```
**Result**: Shows only current phase information and progress.

### View Sprint Backlog
```
/ado-status --sprint
```
**Result**: Shows only sprint tracker with story progress.

## Status Metrics

### Phase Metrics
- **Phase Progress**: Percentage through current phase
- **Gate Status**: Validation gate completion
- **Checklist Items**: Completed vs. total items

### Sprint Metrics
- **Story Points**: Completed, remaining, total
- **Velocity**: Story points per day
- **Burndown**: Work remaining vs. time
- **Completion**: Percentage of sprint complete

### Research Metrics
- **Total Queries**: Number of research queries executed
- **Average Confidence**: Mean confidence score
- **Cache Hits**: Reused query results
- **Tool Usage**: Frequency of each MCP tool

## Status Indicators

### Phase Status
- 🔴 **Not Started**: Phase not yet begun
- 🟡 **In Progress**: Phase actively being worked on
- 🟢 **Complete**: Phase finished and validated
- 🔒 **Blocked**: Phase blocked by dependencies or failures

### Story Status
- ○ **Todo**: Not yet started
- ⟳ **In Progress**: Currently being worked on
- ✓ **Completed**: Finished with evidence
- ⚠ **Blocked**: Cannot proceed due to dependencies
- ⏸ **On Hold**: Temporarily paused

### Gate Status
- ✓ **Passed**: Validation gate successfully completed
- ○ **Pending**: Awaiting completion
- ⚠ **Warning**: Passed but with concerns
- ❌ **Failed**: Validation gate failed, must fix

## Integration Points

### Workflow Integration
- Updates from all ADO workflows
- Real-time progress tracking
- Automatic status synchronization

### Sprint Management
- Story completion tracking
- Burndown calculation
- Velocity measurement
- Capacity planning

### Research Tracking
- Query caching
- Confidence scoring
- Source validation
- Knowledge base building

## Alerts and Warnings

Status command highlights:
- ⚠ **Sprint at risk**: Behind schedule or velocity too low
- ❌ **Failed gates**: Validation failures requiring attention
- 🚫 **Blocked stories**: Dependencies preventing progress
- 📉 **Low research confidence**: Sources need validation
- ⏰ **Time warnings**: Approaching deadlines

## Success Criteria

Status is current when:
- All workflows update status files
- Sprint tracker reflects actual progress
- Research cache is indexed
- Gate status is accurate
- Next actions are clear and actionable

## Notes

- **Real-time updates** - status reflects current state
- **Evidence-based** - all completions have supporting evidence
- **Actionable** - next steps are clearly defined
- **Historical** - previous phases and sprints are tracked
- **Metrics-driven** - data supports decision making

For more information, see:
- `.bmad/ado/workflows/ado-status-update/workflow.yaml`
- `.bmad/ado/config.yaml` (sprint_tracking setting)
- `.bmad/ado/README.md`
