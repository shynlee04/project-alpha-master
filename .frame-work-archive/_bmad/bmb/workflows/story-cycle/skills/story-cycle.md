# Skill: Story Development Cycle

**Name:** `story-cycle`
**Version:** 2.0.0
**Cross-Platform:** Claude Code (`.claude/`) + Open Code (`.opencode/`)

---

## Description

Complete story development cycle with validation loops, pre-planning gates, research protocols, and cross-platform support. Replaces the monolithic story-dev-cycle.md with modular architecture.

---

## Triggers

```
/story-cycle
story cycle
develop story
story dev cycle
```

---

## Usage

### Start New Story
```bash
/story-cycle
```

Prompts for:
- Epic number
- Story number (optional, or finds next)
- Mode (create/continue)

### Continue Existing Story
```bash
/story-cycle continue {story_key}
```

Resumes from current story state.

### Jump to Specific Step
```bash
/story-cycle step={step_number} story={story_key}
```

Example: `/story-cycle step=5 story=3-1-implement-feature`

---

## What It Does

1. **Loads Configuration**: Reads user preferences from `_bmad/bmb/config.yaml`
2. **Determines Mode**: Create new story or continue existing
3. **Routes to Step**: Loads appropriate step file from `steps/`
4. **Executes Instructions**: Follows step instructions precisely
5. **Validates Output**: Ensures quality gates pass
6. **Updates Status**: Writes to sprint-status.yaml
7. **Handoffs to Next**: Creates handoff artifact for next phase

---

## Step Files

| Step | File | description | Agent |
|------|------|---------|-------|
| 01 | `01-create-story.md` | Create story from epic | SM |
| 02 | `02-validate-story.md` | Validate story 100% | SM |
| 03 | `03-create-context.md` | Build context XML | SM |
| 04 | `04-validate-context.md` | Validate + stale check | SM |
| 05 | `05-pre-planning.md` | Research gate (NEW) | Dev |
| 06 | `06-dev-story.md` | TDD implementation | Dev |
| 07 | `07-code-review.md` | Multi-agent review | Dev/Reviewer |
| 08 | `08-story-done.md` | Complete story | SM |
| 09 | `09-retrospective.md` | Epic retrospective | SM |

---

## Utilities

| Utility | File | description |
|----------|------|---------|
| Stale Check | `utils/_stale-check.md` | File freshness validation |
| Correct Course | `utils/_correct-course.md` | Recovery handler |
| Audit Checkpoint | `utils/_audit-checkpoint.md` | Quality audit |
| Handoff Template | `utils/_handoff-template.md` | Handoff format |

---

## Configuration

Expects these files to exist:

```yaml
# _bmad/bmb/config.yaml
user_name: {name}
communication_language: {language}
output_folder: "_bmad-output"

# _bmad-output/sprint-artifacts/sprint-status.yaml
# _bmad-output/epics.md
# _bmad-output/project-planning-artifacts/architecture.md
```

---

## Output Artifacts

```
_bmad-output/sprint-artifacts/
├── {epic}-{story}-{slug}.md           # Story file
├── {epic}-{story}-{slug}-context.xml   # Context XML
├── {epic}-{story}-{slug}-handoff.md    # Handoff artifact
├── sprint-status.yaml                  # Updated each step
└── epic-{N}-retrospective.md           # Epic completion (if applicable)
```

---

## Examples

### Example 1: Start New Story
```bash
User: /story-cycle

Agent: Welcome to Story Development Cycle v2.0!
      Loading configuration...

      Current Sprint: Sprint 5
      Available Epics:
      - Epic 21: Production Hardening (3 stories remaining)
      - Epic 22: UX Modernization (5 stories remaining)

      Which epic? [21/22]

User: 21

Agent: Epic 21: Production Hardening
      Next story: 21-3

      Creating story for Epic 21, Story 3...
      [Loads steps/01-create-story.md]
```

### Example 2: Continue Story
```bash
User: /story-cycle continue 21-2-fix-auth

Agent: Loading story 21-2-fix-auth...
      Current status: ready-for-implementation

      Resuming from Step 05: Pre-Planning
      [Loads steps/05-pre-planning.md]
```

### Example 3: Jump to Step
```bash
User: /story-cycle step=6 story=21-2-fix-auth

Agent: Jumping to Step 06: Develop Story
      [Loads steps/06-dev-story.md]
      Proceeding with TDD implementation...
```

---

## Error Handling

| Error | Action |
|-------|--------|
| Config not found | Prompt for user_name, language |
| Sprint status missing | Create new sprint-status.yaml |
| Epic not found | Show available epics from epics.md |
| Story not found | Offer to create new story |
| Validation fails | Loop back with specific fixes |
| Timebox exceeded | Trigger correct-course workflow |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2026-01-08 | Modular architecture, pre-planning gate, cross-platform |
| 1.0.0 | 2025-12-20 | Original monolithic workflow |
