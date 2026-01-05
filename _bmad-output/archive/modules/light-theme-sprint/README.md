# Light Theme Sprint Module
# BMAD Module for Coordinating Light Theme Implementation

## Overview

This module provides a complete framework for executing the Light Theme Design System implementation sprint. It includes agent specifications, workflows, and templates for managing 23 stories across 4 weeks.

## Module Contents

### 📁 agents/
- **light-theme-sm-agent.md**: Scrum Master agent for sprint coordination
- **light-theme-dev-agent.md**: Developer agent for implementation

### 📁 workflows/
- **light-theme-sprint-workflow.md**: Main sprint orchestration workflow
- **sprint-planning-workflow.md**: Sprint planning sub-workflow
- **story-execution-cycle.md**: SM → Dev → Review cycle workflow

### 📁 templates/
- **sprint-backlog-template.md**: Sprint backlog template
- **story-template.md**: Story template with Light Theme specifics
- **sprint-status-report.md**: Sprint status report template

### 📄 module.yaml
Module definition with configuration and dependencies.

## Quick Start

### 1. Initialize Sprint
```bash
# Run sprint planning workflow
bmad execute sprint-planning-workflow
```

### 2. Begin Sprint
```bash
# Start the main sprint workflow
bmad execute light-theme-sprint-workflow
```

### 3. Track Progress
```bash
# Generate status report
bmad generate sprint-status-report
```

## Sprint Overview

| Phase | Week | Stories | Hours | Focus |
|-------|------|---------|-------|-------|
| Foundation | 1 | 7 | 24 | Design tokens, types, infrastructure |
| P0 Components | 2 | 6 | 23 | Critical components (Button, Input, Card, etc.) |
| P1 Components | 3 | 5 | 15 | Secondary components (Table, Select, etc.) |
| Workspaces | 4 | 5 | 26 | IDE, Knowledge, Notes, Study, Mobile |

**Total**: 23 stories, 88 hours, 4 weeks

## Key Deliverables

- 36 component families with light theme variants
- 78 CSS custom properties for colors
- TypeScript theme types
- useTheme hook
- ThemeProvider component
- ThemeToggle component
- WCAG 2.1 AA compliance

## Agent Coordination

The module uses automatic agent switching:

1. **SM Agent** (Scrum Master):
   - Sprint planning and backlog management
   - Story creation and validation
   - Progress tracking and reporting
   - Code review and approval

2. **Dev Agent** (Developer):
   - Implementation of stories
   - Writing tests
   - Code quality assurance
   - Documentation

### Agent Switching Protocol

```
Story Created → SM validates → Switch to Dev
Implementation → Dev submits → Switch to SM
Review → Approved → Next story
Review → Changes → Switch to Dev
```

## Usage

### Creating Stories
Stories are automatically created from the sprint planning workflow using the story template.

### Running the Sprint
Execute the main workflow to run the complete sprint:
```bash
bmad execute light-theme-sprint-workflow
```

### Tracking Daily Progress
Generate daily status reports:
```bash
bmad execute generate-daily-report
```

### Completing a Story
Follow the story execution cycle for each story:
1. SM creates context
2. SM validates context
3. Switch to Dev
4. Dev implements
5. Dev submits for review
6. SM reviews
7. Approve or request revisions

## File Structure

```
_bmad/modules/light-theme-sprint/
├── README.md                    # This file
├── module.yaml                  # Module definition
├── agents/
│   ├── light-theme-sm-agent.md
│   └── light-theme-dev-agent.md
├── workflows/
│   ├── light-theme-sprint-workflow.md
│   ├── sprint-planning-workflow.md
│   └── story-execution-cycle.md
└── templates/
    ├── sprint-backlog-template.md
    ├── story-template.md
    └── sprint-status-report.md
```

## Output Location

All sprint artifacts are generated in:
```
_bmad-output/light-theme-sprint/
├── sprint-backlog.yaml
├── sprint-schedule.yaml
├── stories/
│   ├── STORY-001.md
│   ├── STORY-002.md
│   └── ...
├── progress/
│   ├── sprint-progress.yaml
│   └── daily-standup-YYYY-MM-DD.md
└── reports/
    ├── sprint-status-report-YYYY-MM-DD.md
    └── sprint-retrospective.md
```

## Design System Reference

Design artifacts are read from:
```
_bmad-output/light-theme-design-system/
├── tokens/
├── colors/
├── typography/
├── components/
├── spacing/
└── a11y/
```

## Constraints

### Do
- Follow story-dev-cycle.md workflow exactly
- Use design artifacts as single source of truth
- Generate MCP tool calls for research
- Maintain resource isolation from Ralph Loop
- Track progress meticulously

### Don't
- Modify Ralph Loop files or cycles
- Skip validation gates
- Overlook accessibility requirements
- Change sprint scope without approval

## Success Criteria

### Sprint Success
- All 23 stories completed
- 90% of planned hours used
- 100% P0 stories complete
- WCAG 2.1 AA compliance
- No critical bugs

### Quality Metrics
- Code review pass rate: >90%
- Test coverage: >80%
- Design fidelity: >95%
- Accessibility score: 100%

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-03 | Initial module creation |

## License

MIT
