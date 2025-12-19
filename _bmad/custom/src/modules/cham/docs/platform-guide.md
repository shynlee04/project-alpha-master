# CHAM Platform Guide

Usage instructions for each supported platform.

## KiloCode

### Location
`.kilocode/workflows/cham-audit/`

### Usage

Run the main workflow:
```
.kilocode/workflows/cham-audit/cham-audit.md
```

### Phase Files

Workflow executes phases sequentially:
1. `1-discovery-phase.md`
2. `2-scanning-phase.md`
3. `3-synthesis-phase.md`
4. `4-remediation-phase.md`
5. `5-validation-phase.md`

### Status Tracking

Status tracked in workflow state and `.bmad/custom/src/modules/cham/status/`

## Windsurf

### Location
- Agents: `.windsurf/rules/agents/cham-*.md`
- Commands: `.windsurf/rules/commands/cham-*.md`
- Workflows: `.windsurf/workflows/cham/*.md`

### Usage

**Run Full Audit:**
```
cham-run-audit
```

**Use Individual Agents:**
```
cham-cartographer
cham-synthesizer
```

**Reference Workflows:**
```
.windsurf/workflows/cham/full-audit.md
.windsurf/workflows/cham/incremental-remediation.md
```

### Integration

Windsurf rules integrate with trigger system and command shortcuts.

## Claude Code

### Location
- Commands: `.claude/commands/cham-*.md`
- Agents: `.claude/agents/cham/*.md`
- Skills: `.claude/skills/cham/SKILL.md`

### Usage

**Run Full Audit:**
```
/cham-audit
```

**Run Scanning Only:**
```
/cham-scan
```

**Run Remediation:**
```
/cham-remediate
```

**Activate Agents:**
Reference `.claude/agents/cham/{agent-name}.md`

### Skills

CHAM skill provides overview of all capabilities:
```
.claude/skills/cham/SKILL.md
```

## Cursor

### Location
`.cursor/rules/bmad/cham/`

### Usage

**Reference Module:**
```
@bmad/cham
```

**Reference Agents:**
```
@bmad/cham/agents/cartographer
@bmad/cham/agents/synthesizer
```

**Reference Workflows:**
```
@bmad/cham/workflows/full-audit
@bmad/cham/workflows/incremental-remediation
```

### Activation

Cursor rules activate agents and workflows when referenced in your rules.

## Gemini Studio

### Location
`.gemini/cham/`

### Usage

**Load Full Audit Config:**
```
.gemini/cham/full-audit.toml
```

**Load Phase-Specific Configs:**
```
.gemini/cham/discovery-phase.toml
.gemini/cham/scanning-phase.toml
.gemini/cham/synthesis-phase.toml
.gemini/cham/remediation-phase.toml
.gemini/cham/validation-phase.toml
```

### Configuration

TOML files contain phase-specific prompts and agent configurations.

## Agent

### Location
- Agents: `.agent/rules/agents/cham-*.md`
- Commands: `.agent/rules/commands/cham-*.md`
- Workflows: `.agent/workflows/cham/*.md`

### Usage

**Run Full Audit:**
```
cham-audit
```

**Use Individual Agents:**
```
cham-cartographer
cham-synthesizer
```

**Reference Workflows:**
```
.agent/workflows/cham/full-audit.md
.agent/workflows/cham/incremental-remediation.md
```

## BMAD (Native)

### Location
`.bmad/custom/src/modules/cham/`

### Usage

**Run Workflows:**
```
workflow full-audit
workflow incremental-remediation
workflow continuous-monitoring
```

**Activate Agents:**
```
agent cham-cartographer
agent cham-synthesizer
```

### Native Integration

BMAD provides native support with YAML agent files and workflow step files.

## Platform Comparison

| Platform | Command Format | Agent Format | Workflow Format |
|----------|---------------|--------------|-----------------|
| KiloCode | N/A | N/A | Markdown step files |
| Windsurf | `cham-*` | Markdown rules | Markdown workflows |
| Claude Code | `/cham-*` | Markdown agents | Markdown workflows |
| Cursor | `@bmad/cham/*` | .mdc rules | .mdc rules |
| Gemini Studio | TOML config | TOML config | TOML config |
| Agent | `cham-*` | Markdown rules | Markdown workflows |
| BMAD | `workflow/agent` | YAML agents | Markdown workflows |

## Cross-Platform Status

All platforms share the same status files:
- `.bmad/custom/src/modules/cham/status/audit-status.json`
- `.bmad/custom/src/modules/cham/status/phase-*.json`

This allows switching between platforms during an audit.
