# Opencode Claude Code System

This document describes the Claude Code skills, agents, plugins, hooks, and commands system that has been ported from Claude Code to enable similar functionality in the Opencode platform.

## Overview

The Opencode platform now supports:

- **Skills**: Proven workflows and development processes (15+ skills)
- **Agents**: Specialized AI agents for different tasks (19 agents)
- **Commands**: Slash commands for common operations
- **Plugins**: Extensible plugin system with custom tools
- **Rules**: Development guidelines and best practices

## Directory Structure

```
.claude/
├── agents/                    # Specialized AI agents
│   ├── bmad-analysis/        # Codebase analysis agents
│   │   ├── api-documenter.md
│   │   ├── codebase-analyzer.md
│   │   ├── data-analyst.md
│   │   └── pattern-detector.md
│   ├── bmad-planning/        # Planning and architecture agents
│   │   ├── dependency-mapper.md
│   │   ├── epic-optimizer.md
│   │   ├── requirements-analyst.md
│   │   ├── technical-decisions-curator.md
│   │   ├── trend-spotter.md
│   │   ├── user-journey-mapper.md
│   │   └── user-researcher.md
│   ├── bmad-research/        # Research agents
│   │   ├── market-researcher.md
│   │   └── tech-debt-auditor.md
│   └── bmad-review/          # Review agents
│       ├── document-reviewer.md
│       ├── technical-evaluator.md
│       └── test-coverage-analyzer.md
├── commands/                 # Slash commands
│   ├── ado.md               # Agentic Development Orchestrator
│   ├── ado-discovery.md
│   ├── ado-implementation.md
│   ├── ado-planning.md
│   ├── ado-research.md
│   ├── ado-status.md
│   └── orchestrate-implement.md
├── skills/                   # Development skills (15+ skills)
│   ├── brainstorming/
│   ├── dispatching-parallel-agents/
│   ├── executing-plans/
│   ├── finishing-a-development-branch/
│   ├── receiving-code-review/
│   ├── requesting-code-review/
│   ├── subagent-driven-development/
│   ├── systematic-debugging/
│   ├── test-driven-development/
│   ├── using-git-worktrees/
│   ├── using-superpowers/
│   ├── verification-before-completion/
│   ├── writing-plans/
│   └── writing-skills/
├── rules/                    # Development rules
│   └── bmad/
│       ├── bmb/
│       ├── bmm/
│       ├── cis/
│       ├── core/
│       └── index.mdc
└── settings.json            # Configuration

.opencode/                    # Opencode plugin system
├── plugin/
│   └── superpowers.js       # Superpowers plugin
└── skills/                  # Project-specific skills
```

## Skills System

Skills are proven workflows that guide development. Use the `use_skill` tool or reference skills directly in prompts.

### Core Skills

#### brainstorming
**Path**: `.claude/skills/brainstorming/`

Use before any creative work - exploring user intent, requirements, and design before implementation.

```markdown
You MUST use this before any creative work - creating features, building components,
adding functionality, or modifying behavior.
```

#### test-driven-development
**Path**: `.claude/skills/test-driven-development/`

Write tests before code using the Red-Green-Refactor cycle.

#### systematic-debugging
**Path**: `.claude/skills/systematic-debugging/`

Debug using condition-based waiting, root cause tracing, and defense-in-depth.

#### using-git-worktrees
**Path**: `.claude/skills/using-git-worktrees/`

Create isolated workspaces using Git worktrees for parallel development.

#### writing-plans
**Path**: `.claude/skills/writing-plans/`

Create detailed implementation plans from designs.

### Workflow Skills

#### executing-plans
**Path**: `.claude/skills/executing-plans/`

Execute implementation plans with verification gates.

#### finishing-a-development-branch
**Path**: `.claude/skills/finishing-a-development-branch/`

Complete development branches with proper cleanup and verification.

#### verification-before-completion
**Path**: `.claude/skills/verification-before-completion/`

Verify all work meets quality standards before completion.

### Code Review Skills

#### requesting-code-review
**Path**: `.claude/skills/requesting-code-review/`

Request and conduct effective code reviews.

#### receiving-code-review
**Path**: `.claude/skills/receiving-code-review/`

Receive and respond to code review feedback.

### Advanced Skills

#### subagent-driven-development
**Path**: `.claude/skills/subagent-driven-development/`

Coordinate multiple agents for complex tasks.

#### dispatching-parallel-agents
**Path**: `.claude/skills/dispatching-parallel-agents/`

Dispatch agents in parallel for concurrent work.

#### using-superpowers
**Path**: `.claude/skills/using-superpowers/`

Use the superpowers skill system effectively.

### Writing Skills

#### writing-skills
**Path**: `.claude/skills/writing-skills/`

Write and document new skills.

## Agents System

Specialized AI agents for different development tasks.

### Analysis Agents (bmad-analysis)

| Agent | Description |
|-------|-------------|
| `bmm-codebase-analyzer` | Comprehensive codebase analysis |
| `bmm-api-documenter` | API documentation generation |
| `bmm-data-analyst` | Data structure and flow analysis |
| `bmm-pattern-detector` | Design pattern detection |

### Planning Agents (bmad-planning)

| Agent | Description |
|-------|-------------|
| `bmm-requirements-analyst` | Requirements gathering and analysis |
| `bmm-user-researcher` | User research and personas |
| `bmm-user-journey-mapper` | User journey mapping |
| `bmm-dependency-mapper` | Dependency analysis and mapping |
| `bmm-technical-decisions-curator` | Technical decision documentation |
| `bmm-epic-optimizer` | Epic optimization and breakdown |
| `bmm-trend-spotter` | Technology trend identification |

### Research Agents (bmad-research)

| Agent | Description |
|-------|-------------|
| `bmm-market-researcher` | Market and competitor research |
| `bmm-tech-debt-auditor` | Technical debt identification |

### Review Agents (bmad-review)

| Agent | Description |
|-------|-------------|
| `bmm-document-reviewer` | Documentation review |
| `bmm-technical-evaluator` | Technical evaluation |
| `bmm-test-coverage-analyzer` | Test coverage analysis |

## Commands System

Slash commands for common operations.

### ADO Command

The Agentic Development Orchestrator (ADO) provides phase-gated development:

```bash
/ado              # Load the master coordinator
/ado *discovery   # Begin discovery phase
/ado *planning    # Begin planning phase
/ado *implementation  # Begin implementation phase
/ado *review      # Begin review phase
/ado *sitrep      # Situation report
/ado *status      # Check sprint status
/ado *research    # Execute research queries
```

### ADO Subcommands

| Command | Description |
|---------|-------------|
| `*discovery` | Requirements gathering and research |
| `*planning` | Architecture design and story creation |
| `*implementation` | TDD development with validation |
| `*review` | Skeptical validation and QA |
| `*sitrep` | Current project state report |
| `*status` | Sprint tracker status |
| `*research` | MCP research query execution |
| `*create-story` | Generate user stories |
| `*tech-context` | JIT technical specifications |

## Plugin System

The Opencode platform supports plugins that extend functionality.

### Superpowers Plugin

Located at `.opencode/plugin/superpowers.js`, this plugin provides:

- `use_skill` - Load and use development skills
- `find_skills` - List available skills
- Automatic skill bootstrap injection
- Session context management

### Plugin Configuration

```json
{
  "enabledPlugins": {
    "superpowers": true
  }
}
```

## Rules System

Development guidelines and best practices organized by BMAD modules.

### Core Modules

| Module | Purpose |
|--------|---------|
| `bmad/core` | Core development principles |
| `bmad/bmm` | Implementation module agents |
| `bmad/bmb` | Builder tools and workflows |
| `bmad/cis` | Creative/strategy agents |

### Development Standards

Rules cover:
- Global coding style
- Backend API design
- Frontend components
- Testing practices
- Error handling
- Validation
- Accessibility
- Responsive design

## Usage Examples

### Using Skills

```bash
# Use a skill
/use_skill brainstorming

# Use a skill with explicit namespace
/use_skill superpowers:test-driven-development

# Project-specific skill
/use_skill project:my-custom-skill
```

### Invoking Agents

```markdown
You are bmm-codebase-analyzer...
```

### Using Commands

```bash
/ado
*discovery
```

## Configuration

### Settings (.claude/settings.json)

```json
{
  "enabledPlugins": {
    "superpowers": true
  },
  "env": {
    "API_TIMEOUT_MS": "3000000"
  }
}
```

### MCP Servers (.claude/mcp-config.json)

Configure MCP servers for extended capabilities.

See `.claude/MCP-SERVERS-README.md` for full MCP configuration documentation.

## Integration with Opencode

The system integrates with Opencode through:

1. **Skills Loader**: `.opencode/plugin/superpowers.js` provides skill loading
2. **Command Parser**: Slash commands are recognized and dispatched
3. **Agent System**: Agents can be invoked by prefixing with agent name
4. **Rules Engine**: Development rules are applied contextually

## Best Practices

1. **Always brainstorm** before implementing new features
2. **Use TDD** for all code changes
3. **Follow the ADO workflow** for complex tasks
4. **Use agents appropriately** - don't over-engineer
5. **Document decisions** using technical decision curators
6. **Review code** using the code review skills
7. **Verify before completion** using verification skills

## References

- Claude Code Documentation: `/Users/apple/.claude/`
- BMAD Method: `.cursor/rules/bmad/`
- Opencode Plugin: `.opencode/plugin/superpowers.js`
- MCP Servers: `.claude/mcp-config.json`
