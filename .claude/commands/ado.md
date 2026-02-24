# ado

Load the ADO (Agentic Development Orchestrator) Master Coordinator - your command center for research-driven, phase-gated development.

## Prerequisites

- ADO module must be installed at `.bmad/ado/`
- Project should have clear development goals or issues to address
- Optional: Active git repository for change tracking

## Usage

```
/ado [command] [options]
```

**Default behavior**: Loads the master coordinator without arguments.

## Command Overview

When loaded, the ADO Coordinator provides an interactive command menu:

### Core Phases
- **Discovery** (`*discovery`) - Requirements gathering, research, constraint definition
- **Planning** (`*planning`) - Architecture design, story creation, task breakdown
- **Implementation** (`*implementation`) - TDD development, validation gates
- **Review** (`*review`) - Skeptical validation, quality assurance

### Essential Commands
- **`*help`** - Show all available commands
- **`*sitrep`** - Situation report (current project state)
- **`*research`** - Execute MCP research queries (DeepWiki, Context7, etc.)
- **`*status`** - Check sprint tracker and workflow status
- **`*create-story`** - Generate user stories from requirements
- **`*tech-context`** - Create JIT technical specifications

### Research Tools
- **`*research-sync`** - Orchestrate multiple MCP tools
- **`*query-deepwiki`** - Research GitHub repositories
- **`*query-context7`** - Pull official documentation

### Management
- **`*status-update`** - Update sprint progress
- **`*course-correction`** - Debug and fix issues
- **`*knowledge-base`** - Access cumulative learnings
- **`*preserve-registry`** - View/modify protected code paths

## How It Works

### 1. **Configuration Loading**
The coordinator automatically loads:
- `.bmad/ado/config.yaml` - Module configuration
- Workflow status from `docs/ado-artifacts/ado-workflow-status.yaml`
- Sprint tracker from `docs/ado-artifacts/ado-sprint-tracker.yaml`

### 2. **Phase-Gated Workflow**
```
Discovery → [Gate 1] → Planning → [Gate 2] → Implementation → [Gate 3] → Review → [Gate 4]
```

Each phase requires validation before proceeding to the next.

### 3. **Research-First Enforcement**
- **Mandatory research** before code generation
- Multi-tool orchestration (DeepWiki, Context7, Tavily, Repomix, Serena)
- Research cache with confidence scores
- Ensures informed architectural decisions

### 4. **Validation Gates**
Each phase includes automatic validation:
- **Phase 1**: Scope defined, constraints documented
- **Phase 2**: Architecture approved, stories created
- **Phase 3**: Tests passing, build successful
- **Phase 4**: Review approved, retrospective complete

## Examples

### Load Coordinator
```
/ado
```
**Result**: Coordinator loads, shows SITREP, displays command menu

### Start Discovery Phase
```
/ado
*discovery
```
**Result**: Begins Phase 1 - requirements gathering and research

### Execute Research Query
```
/ado
*research
```
**Result**: Interactive research workflow using available MCP tools

### Check Current Status
```
/ado
*sitrep
```
**Result**: Shows current phase, progress, blockers, next actions

## Platform Integration

ADO includes platform-specific adapters:
- **Claude Code** (current) - Terminal + file system interface
- **Windsurf** - Cascade integration
- **Cursor** - Composer integration
- **Kilocode** - VSCode extension
- **Gemini** - Workspace patterns
- **Codex** - API patterns

The platform is set in `.bmad/ado/config.yaml`.

## Workflow Integration

ADO workflows are located in `.bmad/ado/workflows/`:

```
ado-discovery/          # Phase 1: Research & requirements
ado-planning/           # Phase 2: Architecture & stories
ado-implementation-loop/# Phase 3: Build & validate
ado-validation-gate/    # Phase 4: Final review
ado-research-sync/      # MCP tool orchestration
ado-create-story/       # Story generation
ado-tech-context/       # JIT tech specs
ado-skeptical-review/   # Code review
ado-retrospective/      # Learning capture
ado-course-correction/  # Debugging workflow
ado-preserve-registry/  # Proven path tracking
ado-status-update/      # Sprint tracking
ado-knowledge-base/     # Cumulative learnings
ado-artifact-handoff/   # Context compression
```

## MCP Tools Available

ADO can orchestrate multiple MCP tools (configured in `config.yaml`):
- **deepwiki** - Repository-specific research
- **context7** - Official documentation pulls
- **tavily** - Multi-source semantic search
- **repomix** - Packed repository analysis
- **serena** - Codebase navigation and refactoring

## Output Structure

All workflow outputs are saved to `docs/ado-artifacts/`:
```
docs/ado-artifacts/
├── ado-workflow-status.yaml    # Current phase and progress
├── ado-sprint-tracker.yaml     # Sprint backlog and status
├── ado-research-cache/         # Research query results
├── ado-phase-outputs/          # Phase-specific artifacts
│   ├── discovery/              # Requirements, constraints
│   ├── planning/               # Architecture, stories
│   ├── implementation/         # Code, tests, builds
│   └── review/                 # Reports, retrospectives
└── ado-knowledge-base/         # Cumulative learnings
```

## Success Criteria

- [ ] Research completed before any code generation
- [ ] Each phase passes validation gates
- [ ] Sprint tracker updated after every workflow
- [ ] Knowledge base maintained for future reference
- [ ] All changes validated and documented

## Use Cases

### 1. **Refactoring Broken Pipeline**
```
/ado
*discovery    # Research the pipeline failure
*planning     # Design refactoring approach
*implementation # Execute refactoring with TDD
*review       # Validate fixes
```

### 2. **New Feature Development**
```
/ado
*research-sync # Research requirements and dependencies
*create-story # Generate user stories
*tech-context # Create technical specifications
*implementation # Build with validation gates
```

### 3. **Bug Investigation**
```
/ado
*query-deepwiki # Research similar issues
*sitrep        # Assess project state
*course-correction # Debug and fix
```

## Notes

- **Phase-gated**: Cannot skip phases without approval
- **Research-enforced**: Mandatory research before code decisions
- **Multi-agent**: Coordinates specialized domain agents
- **Traceable**: All decisions and changes documented
- **Platform-agnostic**: Works across different AI coding platforms

## Integration with BMAD

ADO is a BMAD module located at `.bmad/ado/` and integrates with:
- BMAD workflows and agents
- Project constitution and guidelines
- Git workflow and PR creation
- Test suites and validation tools

For more information, see `.bmad/ado/README.md` and `.bmad/ado/QUICKSTART.md`.
