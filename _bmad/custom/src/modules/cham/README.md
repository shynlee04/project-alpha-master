# Codebase Health Audit Module (CHAM)

**AI-Assisted Systematic Analysis & Remediation Framework**

## Overview

CHAM is a comprehensive multi-phase, agent-orchestrated workflow for detecting, analyzing, and remediating codebase issues through systematic iteration, context synthesis, and research-backed validation.

## Key Features

- **Multi-Pass Analysis** - Different agents scan for different issue types
- **Context Accumulation** - Each pass builds on previous findings
- **Research-Backed Validation** - MCP servers verify against best practices
- **Incremental Remediation** - Fix in prioritized phases, test continuously
- **Living Documentation** - Generate actionable reports, not just lists

## Installation

Install the module using BMAD:

```bash
bmad install cham
```

## Quick Start

1. **Run a full audit:**

   ```
   agent cham-synthesizer
   workflow full-audit
   ```

2. **View audit status:**

   Check `.bmad/custom/src/modules/cham/status/audit-status.json`

3. **Start remediation:**

   ```
   workflow incremental-remediation
   ```

## Module Structure

```
cham/
├── agents/                    # 17 specialized agents
│   ├── cartographer.agent.yaml
│   ├── pattern-analyzer.agent.yaml
│   └── ...
├── workflows/                 # 3 main workflows
│   ├── full-audit/
│   ├── incremental-remediation/
│   └── continuous-monitoring/
├── templates/                 # Agent and workflow configs
├── docs/                      # Documentation
├── status/                    # Audit progress tracking
└── control/                   # Configuration files
```

## Components

### Agents (18 total)

**Discovery Phase:**
- Cartographer - Maps codebase structure
- Pattern Analyzer - Detects architectural patterns

**Scanning Phase (8 agents):**
- Architecture Compliance
- Dependency Hygiene
- Type Safety
- State Management
- Performance
- Test Coverage
- UX Consistency
- Security & Data Flow

**Synthesis Phase:**
- Synthesizer - Merges reports, creates roadmap

**Remediation Phase (5 agents):**
- Architecture Fixer
- Type Safety Fixer
- State Refactor
- Test Writer
- Test Validator

**Validation Phase (2 agents):**
- Final Validator
- Documenter

**Orchestration (1 agent):**
- Master Orchestrator - Understands natural language, diagnoses, plans sequential cycles, generates executable prompts

### Workflows

1. **Full Audit** - Complete 5-phase audit process
2. **Incremental Remediation** - Cluster-by-cluster fixing
3. **Continuous Monitoring** - Lightweight health checks
4. **Master Orchestration** - Natural language to sequential agent/workflow execution

## Configuration

Configuration is in `.bmad/custom/src/modules/cham/control/config.yaml`

**Key Settings:**
- `target_platforms` - Which platforms to generate files for
- `audit_depth` - How deep to scan (basic/advanced)
- `auto_remediate` - Whether to auto-fix issues
- `test_validation` - Run tests after fixes

## Examples

### Example 1: Full Codebase Audit

1. Start the synthesizer agent
2. Run full-audit workflow
3. Review remediation roadmap
4. Approve clusters for fixing

### Example 2: Quick Architecture Check

1. Run architecture-compliance agent only
2. Review violations
3. Fix critical issues manually

## Development Status

- [x] Module structure created
- [x] Agents defined
- [x] Workflows planned
- [ ] Agents implemented
- [ ] Workflows implemented
- [ ] Platform files generated
- [ ] Full testing complete

## Requirements

- BMAD Method version 6.0.0 or higher
- MCP servers: Context7, DeepWiki, Tavily
- TypeScript/JavaScript codebase

## Author

Created as part of via-gent project

## License

See project license
