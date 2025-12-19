# CHAM Usage Guide

## Quick Start

### 1. Run Full Audit

```bash
# Using BMAD
agent cham-synthesizer
workflow full-audit

# Or using platform-specific commands
cham-run-audit  # Windsurf
/cham-audit     # Claude Code
```

### 2. Check Status

View audit progress:
```bash
cat .bmad/custom/src/modules/cham/status/audit-status.json
```

### 3. Review Roadmap

After synthesis phase:
```bash
cat .bmad/custom/src/modules/cham/status/remediation-roadmap.md
```

### 4. Start Remediation

```bash
workflow incremental-remediation
```

## Workflow Phases

### Phase 1: Discovery (30-60 min)

**Agents:** Cartographer, Pattern Analyzer

**Outputs:**
- `codebase-map.json` - Complete codebase structure
- `patterns-detected.yaml` - Architectural patterns and violations

**What Happens:**
- Maps all files and dependencies
- Detects architectural patterns
- Identifies violations

### Phase 2: Scanning (1-2 hours)

**Agents:** 8 scanning agents (parallel)

**Outputs:**
- `issue-reports/architecture.json`
- `issue-reports/dependencies.json`
- `issue-reports/type-safety.json`
- `issue-reports/state.json`
- `issue-reports/performance.json`
- `issue-reports/testing.json`
- `issue-reports/ux.json`
- `issue-reports/security.json`

**What Happens:**
- All 8 agents run in parallel
- Each scans for specific issue types
- Results saved to issue-reports/

### Phase 3: Synthesis (30 min)

**Agent:** Synthesizer

**Outputs:**
- `remediation-roadmap.md` - Prioritized remediation plan

**What Happens:**
- All reports merged and de-duplicated
- Issues clustered by root cause
- Prioritized by impact and effort
- Roadmap generated

### Phase 4: Remediation (Hours to days)

**Agents:** Fixer agents + Test Validator

**Process:**
- User approves each cluster
- Fixer agent executes changes
- Test validator runs tests
- Commits if tests pass

**What Happens:**
- Interactive cluster-by-cluster fixing
- Test validation after each fix
- Progress tracked in status files

### Phase 5: Validation (30 min)

**Agents:** Final Validator, Documenter

**Outputs:**
- `final-validation-report.md`
- Updated architecture docs

**What Happens:**
- Re-runs all scans
- Compares before/after
- Updates documentation
- Generates final report

## Platform-Specific Usage

### KiloCode

```bash
# Run workflow
.kilocode/workflows/cham-audit/cham-audit.md
```

### Windsurf

```bash
# Use command
cham-run-audit

# Or reference agents
cham-cartographer
```

### Claude Code

```bash
# Use command
/cham-audit

# Or reference agents
.claude/agents/cham/cartographer.md
```

### Cursor

Reference in rules:
```
@bmad/cham/workflows/full-audit
@bmad/cham/agents/cartographer
```

### Gemini Studio

Load configuration:
```
.gemini/cham/full-audit.toml
```

### Agent

```bash
# Use command
cham-audit

# Or reference agents
.agent/rules/agents/cham-cartographer.md
```

## Configuration

Edit `.bmad/custom/src/modules/cham/control/config.yaml`:

```yaml
audit:
  depth: advanced  # basic | advanced
  auto_remediate: false
  test_validation: true
  max_iterations: 3
```

## Status Files

All status is tracked in `.bmad/custom/src/modules/cham/status/`:

- `audit-status.json` - Overall audit state
- `phase-discovery.json` - Discovery results
- `phase-scanning.json` - Scanning results
- `phase-synthesis.json` - Synthesis results
- `phase-remediation.json` - Remediation progress
- `phase-validation.json` - Validation results

## Troubleshooting

### Audit Stuck

Check status file to see which phase is stuck:
```bash
cat .bmad/custom/src/modules/cham/status/audit-status.json
```

### Agent Failed

Check agent-specific output in issue-reports/ or phase JSON files.

### Tests Failing After Fix

Test Validator will report failures. Review and iterate (max 3 times).

## Best Practices

1. **Run Full Audit First** - Get complete picture before fixing
2. **Review Roadmap** - Understand priorities before starting
3. **Fix Incrementally** - One cluster at a time
4. **Test Continuously** - Don't skip test validation
5. **Document Changes** - Review migration notes
