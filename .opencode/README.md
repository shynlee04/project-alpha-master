# OpenCode Configuration for BMAD Framework

This directory contains the OpenCode configuration that integrates the BMAD (Business Model & Agile Development) framework with OpenCode AI coding agent.

## Structure

```
.opencode/
├── opencode.jsonc              # Main configuration file
├── agent/                       # Custom agents
│   ├── bmad-master.md          # Primary BMAD orchestrator
│   ├── bmad-governance.md      # Governance enforcement agent
│   ├── bmad-sprint-manager.md  # Sprint execution agent
│   ├── arc-master-architect.md # Architecture remediation agent
│   └── deep-scan-orchestrator.md # Diagnostics orchestrator
├── command/                     # Custom commands (auto-generated from opencode.jsonc)
├── plugin/                      # Plugin modules
│   ├── bmad-hooks.js           # BMAD hooks integration
│   └── bmad-context-loader.js  # Context loader plugin
├── prompt/                      # Prompt templates
└── instructions/                # Instruction files
    ├── bmad-constitution.md    # BMAD constitution
    ├── governance-rules.md     # Governance rules
    └── agent-behavior.md       # Agent behavior guidelines
```

## Integration Points

### With Claude Code (.claude/)

The BMAD framework is designed to work seamlessly across both Claude Code and OpenCode:

- **Shared State**: `.claude/AGENT-STATE.yaml` (symlinked from `.opencode/`)
- **Shared Hooks**: `.claude/hooks/` (referenced by OpenCode plugins)
- **Shared Modules**: `_bmad/modules/` (accessed by both platforms)

### Configuration Merging

OpenCode supports configuration merging. The main config in `.opencode/opencode.jsonc` is merged with:
- Global config: `~/.config/opencode/opencode.json`
- Custom config: Path specified in `OPENCODE_CONFIG` env var

## Usage

### Using BMAD Agents

In your conversations with OpenCode, you can invoke BMAD agents:

```
@bmad-master Execute sprint task for Epic CC-1
@bmad-governance Run governance validation
@arc-master-architect Eliminate god stores in src/lib/state/
@deep-scan-orchestrator Execute full scan
```

### Using BMAD Commands

Use the custom commands defined in `opencode.jsonc`:

```
/bmad-sprint [task description]
/bmad-refactor [workflow name]
/bmad-scan [scan type]
/bmad-governance
```

### Using BMAD Hooks

The plugins automatically:
- Run pre-execution validation on session creation
- Load BMAD context when modules are mentioned
- Log tool executions for audit
- Update AGENT-STATE.yaml on completion

## Customization

### Adding New Agents

Create markdown files in `.opencode/agent/` with the following frontmatter:

```yaml
---
description: Agent description
mode: primary|subagent
model: anthropic/claude-sonnet-4-20250514
temperature: 0.3
maxSteps: 20
tools:
  write: true
  edit: true
  bash: false
---

# Agent Name

[Agent instructions...]
```

### Adding New Commands

Add commands to `opencode.jsonc` under the `command` key:

```json
{
  "command": {
    "my-command": {
      "description": "Command description",
      "template": "Task template with $ARGUMENTS",
      "agent": "agent-name",
      "model": "anthropic/claude-haiku-4-20250514"
    }
  }
}
```

### Modifying Hooks

Edit the plugin files in `.opencode/plugin/` to customize:
- Pre/post execution validation
- Context loading behavior
- Tool execution logging
- Custom BMAD commands

## Dependencies

The plugins use:
- Node.js built-in modules (fs, path)
- Bun shell API (for command execution)
- glob (for file discovery)

External dependencies are managed via `~/.config/opencode/package.json` if needed.

## Troubleshooting

### Hooks Not Running

Check that:
1. Plugin files are in `.opencode/plugin/`
2. Files have `.js` extension
3. No syntax errors (run `node --check` on files)
4. OpenCode has permissions to execute plugins

### Context Not Loading

Verify:
1. BMAD modules exist in `_bmad/modules/`
2. Module names are correctly mapped in plugins
3. Message contains module keywords

### State Not Syncing

Ensure:
1. `.claude/AGENT-STATE.yaml` is writable
2. Symlinks are set up correctly
3. Both platforms use the same state file

## Documentation

- [OpenCode Config Docs](https://opencode.ai/docs/config/)
- [OpenCode Agents Docs](https://opencode.ai/docs/agents/)
- [OpenCode Plugins Docs](https://opencode.ai/docs/plugins/)
- [BMAD Framework](../AGENTS.md)
