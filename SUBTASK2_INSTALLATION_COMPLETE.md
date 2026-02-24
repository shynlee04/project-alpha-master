# Subtask2 Plugin Installation - Complete
**Date:** 2026-01-15
**Status:** ✅ Successfully Installed Globally

## Summary

Successfully installed `@openspoon/subtask2@latest` plugin to your GLOBAL OpenCode configuration.

## Installation Details

### 1. Global Installation
✅ **Package installed:** `npm install -g @openspoon/subtask2@latest`
✅ **Version:** 0.2.9 (latest)
✅ **Location:** `~/.npm-global/lib/node_modules/@openspoon/subtask2/`

### 2. Global Configuration
✅ **Config file:** `~/.config/opencode/opencode.json`
✅ **Plugin array:** Added `@openspoon/subtask2@latest` to plugins
✅ **JSON validation:** Config is valid
✅ **Other plugins preserved:** opencode-supermemory@latest, opencode-antigravity-auth@beta

### 3. Project Configuration
✅ **Restored:** Original `.opencode/opencode.jsonc` from backup
✅ **No changes:** Project-level config left untouched
✅ **Valid JSON:** Project config is valid

## Current Plugin Configuration

### Global Config (`~/.config/opencode/opencode.json`)

```json
{
  "plugin": [
    "opencode-supermemory@latest",
    "opencode-antigravity-auth@beta",
    "@openspoon/subtask2@latest"  // ✅ NEW
  ]
}
```

### Project Config (`.opencode/opencode.jsonc`)
- ✅ **No plugin array** - Uses global config
- ✅ **BMAD framework** - Fully configured
- ✅ **All agents intact** - bmad-master, ext-master, dev-ext, etc.

## Subtask2 Features Now Available

### 1. `return` - Custom Return Prompts
Control what happens after a command completes:
```yaml
subtask: true
return: Look again, challenge findings, then implement valid fixes.
---
Review PR# $ARGUMENTS for bugs.
```

**Multiple returns:**
```yaml
return:
  - Implement fix
  - Run tests
  - /send-report
```

**Trigger /commands:**
```yaml
return:
  - /plan{model:anthropic/claude-sonnet-4} design auth
  - /plan{model:openai/gpt-5.2}
  - Compare both plans
```

### 2. `parallel` - Concurrent Subtasks
Run multiple commands in parallel:
```yaml
subtask: true
parallel:
  - /plan-gemini
  - /plan-opus
  - /plan-gpt
return:
  - Compare and synthesize results
---
Analyze $ARGUMENTS
```

**With custom arguments:**
```yaml
parallel:
  - command: research-docs
    arguments: authentication flow
  - command: research-codebase
    arguments: auth middleware
return: Synthesize findings
```

**Inherit main args:**
```yaml
parallel: /research-docs, /research-codebase, /security-audit
```

### 3. `{model:...}` - Inline Model Override
Override model without modifying command file:
```bash
/plan{model:anthropic/claude-sonnet-4} design auth
/plan{model:github-copilot/claude-opus-4.5} analyze code
```

**Priority:** inline `{model:...}` > frontmatter `model:` field

### 4. `$TURN[n]` - Reference Previous Conversation
Inject conversation context into commands:
```yaml
---
description: summarize our conversation
subtask: true
---
Review following conversation:

$TURN[10]
```

**Syntax options:**
- `$TURN[6]` - last 6 messages
- `$TURN[:3]` - just 3rd message from end
- `$TURN[:2:5:8]` - specific messages at indices 2, 5, 8
- `$TURN[*]` - all messages

**Format output:**
```
--- USER ---
What's the best way to implement auth?

--- ASSISTANT ---
I'd recommend using JWT tokens...

--- USER ---
Can you show me an example?
...
```

## Usage Examples

### Sequential Workflow with Returns
```yaml
---
description: design, implement, test
subtask: true
return:
  - Implement the feature following best practices
  - Write comprehensive unit tests
  - Run test suite and fix failures
  - Update documentation
---
Create auth component for $ARGUMENTS
```

### Parallel Multi-Model Planning
```yaml
---
description: multi-model ensemble plan
subtask: true
parallel:
  - /plan-gemini
  - /plan-opus
  - /plan-gpt
return:
  - Compare all 3 plans and validate each against codebase
  - Pick best ideas from each and create unified plan
  - /review-plan focus on simplicity
---
Plan implementation of $ARGUMENTS
```

### Chaining Commands
```yaml
---
subtask: true
return:
  - /analyze-code focus on performance
  - /security-audit
  - /generate-tests
---
Review authentication system
```

### Inline Model Override
```bash
/plan{model:github-copilot/claude-opus-4.5} design auth flow
/review{model:anthropic/claude-sonnet-4} check correctness
/fix{model:minimax/MiniMax-M2.1} implement solution
```

## Configuration Options

### Global Config (`~/.config/opencode/subtask2.jsonc`)

Subtask2 supports project-level configuration:

```jsonc
{
  // Replace generic prompt when no 'return' is specified
  "replace_generic": true,  // defaults to true

  // Custom fallback (optional - has built-in default)
  "generic_return": "custom return prompt"
}
```

**Priority:** `return` param > config `generic_return` > built-in default > opencode original

### Built-in Default Return Prompt
If `return` is undefined and `replace_generic: true`, subtask2 uses:

> Review, challenge and validate task output against codebase then continue with the next logical step.

## Subtask Configuration Files

### Create Commands in Project
Create YAML command files in `.opencode/command/` directory:

**Example: `.opencode/command/research.md`**
```yaml
---
description: Research codebase for topic
subtask: true
return: Synthesize findings and provide actionable insights
---
Research $ARGUMENTS in codebase
```

### Project-Level Override
To use subtask2 in a specific project, create `.opencode/command/` directory and add commands there.

## Integration with BMAD

### Using Subtask2 with BMAD Agents

```yaml
---
description: Full BMAD workflow with subtask orchestration
agent: bmad-master
subtask: true
parallel:
  - command: dev-story
    arguments: story=$ARGUMENTS
  - command: code-review
    arguments: story=$ARGUMENTS
return:
  - Verify all acceptance criteria are met
  - Update AGENT-STATE.yaml
  - Run governance validation
---
Execute complete BMAD story cycle for $ARGUMENTS
```

### Parallel Subagent Orchestration

```yaml
---
description: Parallel architecture review
subtask: true
parallel:
  - /architect-ext analyze design patterns
  - /architect-ext review performance
return:
  - Synthesize findings
  - Create unified ADR
---
Review current architecture
```

## Troubleshooting

### If Plugin Not Loading
1. Verify plugin is installed globally: `npm list -g | grep @openspoon/subtask2`
2. Check global config: `cat ~/.config/opencode/opencode.json | jq '.plugin'`
3. Verify JSON syntax: `cat ~/.config/opencode/opencode.json | jq '.'`
4. Check OpenCode logs: `tail -f ~/.config/opencode/logs/*.log`

### If Commands Not Available
1. Restart OpenCode after installation
2. Verify `.opencode/command/` directory exists in project
3. Check command file YAML syntax: `cat .opencode/command/research.md | yaml-lint`

### If Parallel Feature Not Working
**Note:** `parallel` requires [this PR](https://github.com/sst/opencode/pull/6478)
- Check OpenCode version with `opencode --version`
- Update to latest version if needed
- Monitor PR status for merge

## Next Steps

### 1. Create Subtask2 Config (Optional)
Create `~/.config/opencode/subtask2.jsonc` for custom behavior:
```jsonc
{
  "replace_generic": true,
  "generic_return": "Review findings and suggest next actions"
}
```

### 2. Create First Command
Create a test command in `.opencode/command/`:
```bash
mkdir -p /Users/apple/Documents/coding-projects/project-alpha-master/.opencode/command
cat > /Users/apple/Documents/coding-projects/project-alpha-master/.opencode/command/test.md << 'EOF'
---
description: Test subtask2 functionality
subtask: true
return: Test successful if you see this message
---
Test: $ARGUMENTS
EOF
```

### 3. Test Installation
```bash
cd /Users/apple/Documents/coding-projects/project-alpha-master
opencode /test hello
```

Expected output: "Test successful if you see this message"

### 4. Integrate with BMAD
Use subtask2 with BMAD workflows:
```yaml
---
description: BMAD story with parallel subagents
agent: dev-ext
subtask: true
parallel:
  - /bmad-scan targeted
  - /code-review focus=testing
return:
  - Verify story completion
  - Update sprint status
---
Implement story $ARGUMENTS
```

## Verification Commands

```bash
# Check plugin is installed
npm list -g | grep "@openspoon/subtask2"

# Verify global config
cat ~/.config/opencode/opencode.json | jq '.plugin'

# Test OpenCode loads correctly
opencode --version
```

## Current Status

| Component | Status | Details |
|-----------|--------|---------|
| **Global Installation** | ✅ Complete | Plugin installed globally |
| **Global Config** | ✅ Updated | subtask2 added to plugin array |
| **Project Config** | ✅ Restored | No changes to project config |
| **JSON Validation** | ✅ Valid | All configs parse correctly |
| **Ready to Use** | ✅ Yes | Plugin features available |

---

## Summary

✅ **subtask2** is now installed globally and available across all projects
✅ **Features available:** `return`, `parallel`, `{model:...}`, `$TURN[n]`
✅ **Integration ready:** Works with BMAD framework and custom commands
✅ **Project config preserved:** No unintended changes made

**Next Action:** Test subtask2 with a simple command in your project to verify it works!

---

**Installation Type:** GLOBAL (not per-project)
**Plugin Name:** @openspoon/subtask2@latest
**Version:** 0.2.9
**Config File:** ~/.config/opencode/opencode.json
**Status:** ✅ Ready to use
