# Subtask2 Integration with Built-in Agents

## Problem
`explore` and `general` are built-in OpenCode subagents. They work with subtask2 when called via **wrapper commands**.

## Solution Created

| Wrapper Command | Uses |
|----------------|--------|
| `/explore-general` | Runs `explore` + `general` in parallel |
| `/explore-research` | Research with `explore` agent |
| `/general-analyze` | Analysis with `general` agent |

## Usage in Main Agents

When main agents need to call explore/general, use wrapper commands:

**Before (no subtask2):**
```yaml
# In workflow or agent file
Call: explore directly
```

**After (with subtask2):**
```yaml
# In workflow or agent file
Call: /explore-research "topic"  # Gets subtask2 features
```

## Example: Parallel Research

```bash
/explore-general "research authentication patterns"
```
This spawns:
- `explore` subagent (research)
- `general` subagent (analyze)
- Both run in parallel
- Results synthesized automatically

## Files Added

- `.opencode/command/explore-general.md`
- `.opencode/command/explore-research.md`
- `.opencode/command/general-analyze.md`

**Pattern:** Wrapper commands with `agent: explore/general` + `subtask: true`
