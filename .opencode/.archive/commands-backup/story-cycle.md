# Command: story-cycle

> **Skill**: `.opencode/skill/story-cycle/SKILL.md` | **Master**: `_bmad/bmb/workflows/story-cycle/`

---

## Description

Execute the complete story development cycle v2.0 with 9 modular steps, validation loops, pre-planning gates, and research protocols.

---

## Usage

```bash
story-cycle                    # Start new story (prompts for epic/story)
story-cycle continue S-001     # Continue existing story
story-cycle step=N story=S-001 # Jump to specific step
```

---

## 9-Step Workflow

| Step | Command | Purpose |
|------|---------|---------|
| 01 | `create-story` | Create story from epic |
| 02 | `validate-story` | Validate story file |
| 03 | `create-context` | Build context XML |
| 04 | `validate-context` | Validate + stale check |
| 05 | `pre-planning` | Research gate (NEW v2.0) |
| 06 | `dev-story` | TDD implementation |
| 07 | `code-review` | Multi-agent review |
| 08 | `story-done` | Complete story |
| 09 | `retrospective` | Epic retrospective |

---

## Configuration

**Requires**:
- `_bmad/bmb/config.yaml`
- `_bmad-output/sprint-artifacts/sprint-status.yaml`
- `_bmad-output/epics.md`

---

## Output

```
_bmad-output/sprint-artifacts/
├── {epic}-{story}-{slug}.md           # Story file
├── {epic}-{story}-{slug}-context.xml   # Context XML
├── {epic}-{story}-{slug}-handoff.md    # Handoff artifact
└── epic-{N}-retrospective.md           # Epic completion
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `story-cycle` | Full cycle (prompts) |
| `story-cycle continue S-001` | Resume story |
| `create-story epic=21` | Create new story |
| `dev-story story=S-001` | Implement story |
| `code-review story=S-001` | Review implementation |
| `correct-course story=S-001` | Recovery workflow |

---

**See Also**: `create-story`, `dev-story`, `correct-course`
