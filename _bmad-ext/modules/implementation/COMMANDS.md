---
name: "implementation-commands"
description: "Unified command reference for BMAD-ext Implementation Module v2.0"
version: "2.0.0"
created: "2026-01-12"
updated: "2026-01-12"
---

# BMAD-ext Implementation Module Commands v2.0

**All commands start with the unified prefix: `@implementation`**

## Command Structure

```
@implementation:<workflow> --<option>=<value>
```

## Quick Reference

| Command | Alias | description |
|---------|-------|---------|
| `@implementation:story-cycle` | `@impl:sc` | Start full story development cycle |
| `@implementation:create-story` | `@impl:cs` | Create new story from epic |
| `@implementation:dev-story` | `@impl:ds` | Implement story with TDD |
| `@implementation:code-review` | `@impl:cr` | Review implementation |
| `@implementation:story-done` | `@impl:sd` | Mark story complete |
| `@implementation:correct-course` | `@impl:cc` | Run recovery workflow |
| `@implementation:validate-story` | `@impl:vs` | Validate story file |
| `@implementation:create-context` | `@impl:ccx` | Create context XML |
| `@implementation:validate-context` | `@impl:vcx` | Validate context |
| `@implementation:pre-planning` | `@impl:pp` | Research and planning gate |
| `@implementation:retrospective` | `@impl:retro` | Epic retrospective |

---

## Story-Cycle Commands

### @implementation:story-cycle
**description**: Start or continue the full story development cycle

**Usage**:
```bash
@implementation:story-cycle --story={story_key}
@implementation:story-cycle --story={story_key} --step={1-10}
@implementation:story-cycle --story={story_key} --continue
@implementation:story-cycle --story={story_key} --jump={step_name}
```

**Steps**:
| Step | Command | Description |
|------|---------|-------------|
| 1 | `@impl:sc --step=1` | Init with deep analysis |
| 1a | `@impl:sc --step=journey` | User journey simulation |
| 2 | `@impl:sc --step=2` | Validate prerequisites |
| 3a | `@impl:sc --step=toolspec` | Agent tool specification |
| 3 | `@impl:sc --step=3` | Implement with TDD |
| 4 | `@impl:sc --step=4` | Run tests |
| 5 | `@impl:sc --step=5` | Code review |
| 6 | `@impl:sc --step=6` | Mark done |
| 6a | `@impl:sc --step=reality` | Visual reality check |
| 7 | `@impl:sc --step=retro` | Retrospective |

**Examples**:
```bash
@implementation:story-cycle --story=FS-05
@implementation:story-cycle --story=FS-05 --continue
@implementation:story-cycle --story=FS-05 --jump=dev-story
@implementation:story-cycle --story=FS-05 --step=5
```

---

### @implementation:create-story
**description**: Create a new story file from epic backlog with deep analysis

**Usage**:
```bash
@implementation:create-story --epic={N}
@implementation:create-story --epic={N} --story={M}
@implementation:create-story --epic={N} --title={title}
```

**Examples**:
```bash
@implementation:create-story --epic=40
@implementation:create-story --epic=40 --story=2
@implementation:create-story --epic=40 --title="Add file sync"
```

---

### @implementation:dev-story
**description**: Implement story with TDD and enforced grep/glob analysis

**Usage**:
```bash
@implementation:dev-story --story={story_key}
@implementation:dev-story --story={story_key} --tdd
@implementation:dev-story --story={story_key} --continue
```

**Examples**:
```bash
@implementation:dev-story --story=FS-05
@implementation:dev-story --story=FS-05 --tdd
@implementation:dev-story --story=FS-05 --continue
```

---

### @implementation:code-review
**description**: Review implementation with real code analysis

**Usage**:
```bash
@implementation:code-review --story={story_key}
@implementation:code-review --story={story_key} --verbose
@implementation:code-review --story={story_key} --auto-approve
```

**Examples**:
```bash
@implementation:code-review --story=FS-05
@implementation:code-review --story=FS-05 --verbose
```

---

### @implementation:story-done
**description**: Mark story complete and update sprint status

**Usage**:
```bash
@implementation:story-done --story={story_key}
@implementation:story-done --story={story_key} --handoff
```

**Examples**:
```bash
@implementation:story-done --story=FS-05
@implementation:story-done --story=FS-05 --handoff
```

---

## Validation Commands

### @implementation:validate-story
**description**: Validate story file is 100% complete

**Usage**:
```bash
@implementation:validate-story --story={story_key}
@implementation:validate-story --story={story_key} --strict
```

---

### @implementation:create-context
**description**: Create context XML for story development

**Usage**:
```bash
@implementation:create-context --story={story_key}
@implementation:create-context --story={story_key} --deep
```

---

### @implementation:validate-context
**description**: Validate context XML and run stale check

**Usage**:
```bash
@implementation:validate-context --story={story_key}
@implementation:validate-context --story={story_key} --freshness
```

---

### @implementation:pre-planning
**description**: Research and planning gate before implementation

**Usage**:
```bash
@implementation:pre-planning --story={story_key}
@implementation:pre-planning --story={story_key} --research
```

---

## Recovery Commands

### @implementation:correct-course
**description**: Recovery workflow when story is stuck

**Usage**:
```bash
@implementation:correct-course --story={story_key}
@implementation:correct-course --issue={issue_key}
@implementation:correct-course --story={story_key} --split
@implementation:correct-course --story={story_key} --defer
@implementation:correct-course --story={story_key} --escalate
@implementation:correct-course --story={story_key} --reduce-scope
```

**Options**:
| Option | Description |
|--------|-------------|
| `--split` | Split story into smaller stories |
| `--defer` | Move to next sprint |
| `--escalate` | Send to architect |
| `--reduce-scope` | Ship partial value |

**Examples**:
```bash
@implementation:correct-course --story=FS-05
@implementation:correct-course --story=FS-05 --split
@implementation:correct-course --story=FS-05 --defer
```

---

## Epic Commands

### @implementation:retrospective
**description**: Epic retrospective after all stories complete

**Usage**:
```bash
@implementation:retrospective --epic={N}
@implementation:retrospective --epic={N} --full
```

---

## Platform Aliases

### .claude Platform (Skills)
Use without `@implementation:` prefix:

```bash
/story-cycle {story_key}
/create-story --epic={N}
/dev-story --story={story_key}
/code-review --story={story_key}
/story-done --story={story_key}
/correct-course --story={story_key}
```

### .opencode Platform (Commands)
Use full `@implementation:` prefix:

```bash
@implementation:story-cycle --story={story_key}
@implementation:create-story --epic={N}
@implementation:dev-story --story={story_key}
@implementation:code-review --story={story_key}
@implementation:story-done --story={story_key}
@implementation:correct-course --story={story_key}
```

---

## Global Options

| Option | Description | Available For |
|--------|-------------|---------------|
| `--help` | Show help | All commands |
| `--verbose` | Detailed output | All commands |
| `--dry-run` | Preview without execution | Most commands |
| `--continue` | Continue from current step | story-cycle |
| `--jump={step}` | Jump to specific step | story-cycle |
| `--step={N}` | Specify step number | story-cycle |

---

## Error Recovery

### Common Errors and Solutions

| Error | Command | Solution |
|-------|---------|----------|
| Story not found | Any | Check story key, list available with `@implementation:list --stories` |
| Step invalid | story-cycle | Use valid step: 1, 1a, 2, 3a, 3, 4, 5, 6, 6a, 7 |
| Context stale | create-context | Run `@implementation:validate-context --freshness` |
| Tests failing | dev-story | Fix failing tests before proceeding |
| Review blocked | code-review | Address blocking issues, re-run review |
| Sprint full | create-story | Check capacity with `@implementation:sprint-status` |

---

## Command History

All commands are tracked in:
- `_bmad-ext/state/LOOP_STATE.yaml`
- `{story_file}` status history

---

**Version**: 2.0.0
**Last Updated**: 2026-01-12
**Prefix**: `@implementation:`
