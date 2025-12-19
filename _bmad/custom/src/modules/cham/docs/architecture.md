# CHAM Architecture

## Overview

CHAM (Codebase Health Audit Module) is a multi-phase, agent-orchestrated workflow for systematic codebase analysis and remediation.

## Architecture Principles

1. **Multi-Pass Analysis** - Different agents scan for different issue types
2. **Context Accumulation** - Each pass builds on previous findings
3. **Research-Backed Validation** - MCP servers verify against best practices
4. **Incremental Remediation** - Fix in prioritized phases, test continuously
5. **Living Documentation** - Generate actionable reports, not just lists

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TRIGGER CONDITIONS                       │
│  • Manual request                                           │
│  • Post-architecture change                                 │
│  • Pre-major feature                                        │
│  • Weekly scheduled run                                     │
└─────────────────┬───────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────────┐
│              PHASE 1: DISCOVERY & MAPPING                   │
│  Agents: Cartographer, Pattern Analyzer                    │
│  Output: codebase-map.json, patterns-detected.yaml         │
└─────────────────┬───────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────────┐
│         PHASE 2: MULTI-DIMENSIONAL SCANNING                 │
│  8 specialized agents (parallel execution)                 │
│  Output: issue-reports/*.json (8 files)                     │
└─────────────────┬───────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────────┐
│           PHASE 3: SYNTHESIS & PRIORITIZATION               │
│  Agent: Synthesizer                                         │
│  Output: remediation-roadmap.md                             │
└─────────────────┬───────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────────┐
│          PHASE 4: INCREMENTAL REMEDIATION                   │
│  Agents: Specialized fixers + Test validator                │
│  Output: Fixed code + migration guide                      │
└─────────────────┬───────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────────┐
│            PHASE 5: VALIDATION & DOCUMENTATION              │
│  Agents: Final Validator, Documenter                        │
│  Output: final-validation-report.md                         │
└─────────────────────────────────────────────────────────────┘
```

## Agent Architecture

### Discovery Agents (2)

- **Cartographer**: Maps codebase structure, dependencies, file relationships
- **Pattern Analyzer**: Detects architectural patterns vs. documented patterns

### Scanning Agents (8 - Parallel)

- **Architecture Compliance**: Violations of stated architecture
- **Dependency Hygiene**: Package usage, version mismatches, redundancy
- **Type Safety**: TypeScript usage, `any` types, type errors
- **State Management**: State duplication, sync issues
- **Performance**: Bundle size, re-renders, memory leaks
- **Test Coverage**: Missing tests, brittle tests, test quality
- **UX Consistency**: UI/UX issues, accessibility, error handling
- **Security & Data Flow**: Security vulnerabilities, data exposure

### Synthesis Agent (1)

- **Synthesizer**: Merges reports, prioritizes, creates roadmap

### Remediation Agents (5)

- **Architecture Fixer**: Moves files, updates imports, restructures
- **Type Safety Fixer**: Adds types, removes `any`, fixes errors
- **State Refactor**: Consolidates stores, adds persistence
- **Test Writer**: Writes missing tests, fixes brittle tests
- **Test Validator**: Runs tests, reports regressions

### Validation Agents (2)

- **Final Validator**: Re-runs scans, validates metrics
- **Documenter**: Updates architecture docs, generates reports

## Workflow Architecture

### Full Audit Workflow

5-phase orchestration with status tracking and interactive remediation.

### Incremental Remediation Workflow

Cluster-by-cluster fixing with test validation.

### Continuous Monitoring Workflow

Lightweight health checks for PR and scheduled audits.

## Status Tracking

All audit progress is tracked in JSON status files:
- `audit-status.json` - Overall audit state
- `phase-*.json` - Individual phase results
- `issue-reports/*.json` - Agent-specific issue reports

## Platform Support

CHAM supports 7 AI coding platforms:
- KiloCode
- Windsurf
- Claude Code
- BMAD (native)
- Cursor
- Gemini Studio
- Agent

Each platform has platform-specific files that wrap the core CHAM functionality.
