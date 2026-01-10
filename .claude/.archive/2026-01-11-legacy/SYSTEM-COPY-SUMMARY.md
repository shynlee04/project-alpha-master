# Claude Code System Copy Summary

**Date**: 2026-01-03
**Source**: `/Users/apple/.claude/`
**Target**: Opencode Platform (`.`)

## What Was Copied

### Agents (19 agents, 4 categories)

```
.claude/agents/
├── bmad-analysis/     (4 agents)
│   ├── api-documenter.md
│   ├── codebase-analyzer.md
│   ├── data-analyst.md
│   └── pattern-detector.md
├── bmad-planning/     (7 agents)
│   ├── dependency-mapper.md
│   ├── epic-optimizer.md
│   ├── requirements-analyst.md
│   ├── technical-decisions-curator.md
│   ├── trend-spotter.md
│   ├── user-journey-mapper.md
│   └── user-researcher.md
├── bmad-research/     (2 agents)
│   ├── market-researcher.md
│   └── tech-debt-auditor.md
└── bmad-review/       (3 agents)
    ├── document-reviewer.md
    ├── technical-evaluator.md
    └── test-coverage-analyzer.md
```

### Commands (8 commands)

```
.claude/commands/
├── ado.md                    # Agentic Development Orchestrator master
├── ado-discovery.md          # Discovery phase command
├── ado-implementation.md     # Implementation phase command
├── ado-planning.md           # Planning phase command
├── ado-research.md           # Research phase command
├── ado-status.md             # Status command
└── orchestrate-implement.md  # Orchestration command
```

### Skills (15 skills)

```
.claude/skills/
├── brainstorming/                       # Creative work exploration
├── dispatching-parallel-agents/         # Parallel agent dispatch
├── executing-plans/                     # Plan execution
├── finishing-a-development-branch/      # Branch completion
├── receiving-code-review/               # Code review handling
├── requesting-code-review/              # Code review request
├── subagent-driven-development/         # Multi-agent coordination
├── systematic-debugging/                # Debugging methodology
├── test-driven-development/             # TDD workflow
├── using-git-worktrees/                 # Git worktree usage
├── using-superpowers/                   # Superpowers system
├── verification-before-completion/      # Verification workflow
├── writing-plans/                       # Plan creation
└── writing-skills/                      # Skill development

# Plus 13 development standard skills:
├── backend-api/
├── backend-migrations/
├── backend-models/
├── backend-queries/
├── frontend-accessibility/
├── frontend-components/
├── frontend-css/
├── frontend-responsive/
├── global-coding-style/
├── global-commenting/
├── global-conventions/
├── global-error-handling/
├── global-tech-stack/
├── global-validation/
└── testing-test-writing/
```

### Plugin System

```
.opencode/
├── plugin/
│   └── superpowers.js       # Superpowers plugin with:
│                             - use_skill tool
│                             - find_skills tool
│                             - Automatic bootstrap injection
└── skills/                  # Project-specific skills directory
```

### Rules

```
.cursor/rules/bmad/
├── bmb/                     # Builder module
├── bmm/                     # Implementation module
├── cis/                     # Creative/strategy module
├── core/                    # Core module
└── index.mdc                # Rules index
```

## Files Created/Updated

| File | Action |
|------|--------|
| `.claude/README.md` | Created - System documentation |
| `.claude/MCP-SERVERS-README.md` | Renamed from README.md |
| `.claude/settings.json` | Updated from Claude settings |
| `.claude/agents/*` | Copied 19 agent files |
| `.claude/commands/*` | Copied 8 command files |
| `.claude/skills/*` | Copied 15 workflow skills + 13 standard skills |
| `.opencode/plugin/superpowers.js` | Copied plugin |
| `.cursor/rules/bmad/*` | Preserved existing rules |

## Not Copied (Security)

- `settings.json` API keys and credentials
- Personal plugin cache
- Session history and logs

## Usage

### Skills
```bash
/use_skill brainstorming
/use_skill superpowers:test-driven-development
```

### Agents
```markdown
You are bmm-codebase-analyzer...
```

### Commands
```bash
/ado
*discovery
```

## Next Steps

1. Review `.claude/README.md` for full documentation
2. Test skill loading with `/use_skill`
3. Configure MCP servers in `.claude/mcp-config.json`
4. Add project-specific skills to `.opencode/skills/`
