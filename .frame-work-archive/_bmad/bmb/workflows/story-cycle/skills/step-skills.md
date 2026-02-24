# Individual Step Skills

Each step can be invoked as a standalone skill/command.

---

## Create Story

**Trigger:** `/create-story` or `create story`

**Usage:**
```bash
/create-story epic={N} story={N}
```

**Loads:** `steps/01-create-story.md`

**Output:** Story file at `{sprint_artifacts}/{epic}-{story}-{slug}.md`

---

## Validate Story

**Trigger:** `/validate-story` or `validate story`

**Usage:**
```bash
/validate-story story={story_key}
```

**Loads:** `steps/02-validate-story.md`

**Output:** Validation report, status set to `validated`

---

## Create Context

**Trigger:** `/create-context` or `create context`

**Usage:**
```bash
/create-context story={story_key}
```

**Loads:** `steps/03-create-context.md`

**Output:** Context XML at `{sprint_artifacts}/{story_key}-context.xml`

---

## Validate Context

**Trigger:** `/validate-context` or `validate context`

**Usage:**
```bash
/validate-context story={story_key}
```

**Loads:** `steps/04-validate-context.md`

**Calls:** `utils/_stale-check.md`

**Output:** Validation report with freshness check

---

## Pre-Planning (NEW)

**Trigger:** `/pre-planning` or `pre planning`

**Usage:**
```bash
/pre-planning story={story_key}
```

**Loads:** `steps/05-pre-planning.md`

**Output:** Complete research, implementation plan

**v2.0 Innovation:** This is the mandatory "plan before code" gate

---

## Develop Story

**Trigger:** `/dev-story` or `dev story`

**Usage:**
```bash
/dev-story story={story_key}
```

**Loads:** `steps/06-dev-story.md`

**Output:** Implemented code, tests, Dev Agent Record

**Approach:** TDD (Red-Green-Refactor)

---

## Code Review

**Trigger:** `/code-review` or `code review`

**Usage:**
```bash
/code-review story={story_key}
```

**Loads:** `steps/07-code-review.md`

**Output:** Code review report in story file

**On Pass:** Proceeds to story-done
**On Fail:** Loops back to dev-story

---

## Story Done

**Trigger:** `/story-done` or `story done`

**Usage:**
```bash
/story-done story={story_key}
```

**Loads:** `steps/08-story-done.md`

**Output:** Story marked done, sprint status updated

**Next:** Retrospective (if epic complete) or next story

---

## Retrospective

**Trigger:** `/retrospective` or `retro`

**Usage:**
```bash
/retrospective epic={N}
```

**Loads:** `steps/09-retrospective.md`

**Trigger:** All stories in epic are done

**Output:** Epic retrospective document

---

## Utility Commands

### Stale Check
```bash
/stale-check context={context_file_path}
```

**Loads:** `utils/_stale-check.md`

### Correct Course
```bash
/correct-course story={story_key}
```

**Loads:** `utils/_correct-course.md`

### Audit
```bash
/audit story={story_key}
```

**Loads:** `utils/_audit-checkpoint.md`

---

## Skill Registration

### Claude Code (`.claude/skills/`)

Create symlinks or skill files:
```yaml
# .claude/skills/story-cycle/SKILL.md
name: story-cycle
description: Complete story development cycle
triggers:
  - /story-cycle
  - story cycle

# .claude/skills/create-story/SKILL.md
name: create-story
description: Create a new story from epic
triggers:
  - /create-story
```

### Open Code (`.opencode/skill/`)

```json
// .opencode/skill/story-cycle/skill.json
{
  "name": "story-cycle",
  "description": "Complete story development cycle",
  "triggers": ["/story-cycle", "story cycle"]
}
```

---

## Quick Reference

| Command | What It Does |
|---------|--------------|
| `/story-cycle` | Start or continue story cycle |
| `/create-story epic=N` | Create story for epic N |
| `/validate-story story=X` | Validate story file |
| `/create-context story=X` | Create context XML |
| `/validate-context story=X` | Validate context with stale check |
| `/pre-planning story=X` | Research and planning gate |
| `/dev-story story=X` | Implement with TDD |
| `/code-review story=X` | Review implementation |
| `/story-done story=X` | Mark story complete |
| `/retrospective epic=N` | Epic retrospective |
| `/audit story=X` | Run quality audit |
| `/correct-course story=X` | Recovery handler |
