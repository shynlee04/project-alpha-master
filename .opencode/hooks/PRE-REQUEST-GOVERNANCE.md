# Pre-Request Governance System - Integration Guide

**Version**: 1.0.0  
**Created**: 2026-01-11

---

## Quick Start

### OpenCode Usage

Before any remediation request, run:

```
/bmad-governance-check
```

Or manually run the script:

```bash
./.opencode/scripts/governance-check.sh "your request here"
```

### Claude Code Usage

The hook runs automatically on every prompt. No manual action needed.

---

## Test Cases

### Test 1: Remediation Request with Conflicts (Should Block)

```bash
# Set up conflicts
# In bmm-workflow-status.yaml: story: FS-05
# In AGENTS.md: Next Story: FS-03

# Then try:
./.opencode/scripts/governance-check.sh "correct-course fix god store"

# Expected: BLOCKED with conflict message
```

### Test 2: Remediation Request with Clean State (Should Proceed)

```bash
# Set up consistency
# In bmm-workflow-status.yaml: story: FS-05
# In AGENTS.md: Next Story: FS-05

# Then try:
./.opencode/scripts/governance-check.sh "correct-course fix god store"

# Expected: PASSED, proceed with remediation
```

### Test 3: Implementation Request with Conflicts (Should Warn)

```bash
# Set up conflicts
# In bmm-workflow-status.yaml: story: FS-05
# In AGENTS.md: Next Story: FS-03

# Then try:
./.opencode/scripts/governance-check.sh "dev-story story=FS-05"

# Expected: Warning but proceed
```

---

## Files Created

| File | Purpose |
|------|---------|
| `.opencode/hooks/pre-request-governance.yaml` | Main hook documentation |
| `.opencode/commands/bmad-governance-check.md` | OpenCode command |
| `.opencode/scripts/governance-check.sh` | Bash utility script |
| `.claude/hooks/pre-request-governance.yaml` | Claude Code hook |

---

## How It Works

### 1. Intent Detection
```bash
# Keywords for each intent type
remediation: correct-course, fix, remediate, god store, refactor
planning: sprint, plan, story, epic
implementation: implement, create, develop
governance: agents.md, constitution, standard
```

### 2. Document Loading
Always loads:
- `bmm-workflow-status.yaml` - Current story/epic
- `AGENTS.md` - Quick Reference section
- `sprint-status.yaml` - Sprint context (if exists)

### 3. Consistency Checks
```yaml
# Checks story ID matches
bmm-workflow-status.story_id == AGENTS.md.Next Story

# Checks epic ID matches
bmm-workflow-status.epic_id == AGENTS.md.Active Epic

# Checks story in sprint (if sprint exists)
bmm-workflow-status.story_id IN sprint-status.sprint_stories
```

### 4. Action Matrix
| Intent | Conflicts | Action |
|--------|-----------|--------|
| remediation | YES | **BLOCK** |
| remediation | NO | Continue |
| planning | YES | Warn + Continue |
| implementation | YES | Warn + Continue |
| any | NO | Continue |

---

## Example Output

### Blocked Remediation Request
```
=== PRE-REQUEST GOVERNANCE CHECK ===
Intent: remediation

Loading governance documents...
  bmm-workflow-status.yaml: story=FS-05, epic=EPIC-FS
  AGENTS.md: story=FS-03, epic=EPIC-FS

Checking consistency...
Conflicts found: 2
  - Story ID: workflow='FS-05' vs agents='FS-03'
  - Epic ID: workflow='EPIC-FS' vs agents='EPIC-FS'

╔═══════════════════════════════════════════════════════════════════════╗
║  ⚠️ GOVERNANCE DOCUMENTS OUT OF SYNC                                ║
╠═══════════════════════════════════════════════════════════════════════╣
║  - Story ID: workflow='FS-05' vs agents='FS-03'                     ║
║  - Epic ID: workflow='EPIC-FS' vs agents='EPIC-FS'                  ║
║                                                                       ║
║  Fix before proceeding with remediation:                             ║
║  1. Update bmm-workflow-status.yaml                                  ║
║  2. Update AGENTS.md Quick Reference                                 ║
║  3. Update sprint-status.yaml (if exists)                            ║
║                                                                       ║
║  [BLOCKED]                                                           ║
╚═══════════════════════════════════════════════════════════════════════╝

=== GOVERNANCE CHECK COMPLETE ===
```

### Clean Remediation Request
```
=== PRE-REQUEST GOVERNANCE CHECK ===
Intent: remediation

Loading governance documents...
  bmm-workflow-status.yaml: story=FS-05, epic=EPIC-FS
  AGENTS.md: story=FS-05, epic=EPIC-FS

Checking consistency...

✅ Governance check passed. Documents are consistent.

=== GOVERNANCE CHECK COMPLETE ===
```

---

## Integration with bmad-master

### Modify bmad-master to auto-run check

Add at the top of any bmad-master workflow:

```bash
# Run pre-request governance check
./.opencode/scripts/governance-check.sh "$USER_PROMPT" || exit 1
```

This ensures:
1. Governance check runs BEFORE any AI request
2. If remediation intent + conflicts → Block immediately
3. No wasted API calls on invalid state

---

## Troubleshooting

### "File not found" errors
```bash
# Ensure you're in the project root
cd /Users/apple/Documents/coding-projects/project-alpha-master

# Check files exist
ls bmm-workflow-status.yaml
ls AGENTS.md
```

### "Permission denied" on script
```bash
chmod +x .opencode/scripts/governance-check.sh
```

### Hook not firing (Claude Code)
```bash
# Check hook is in correct location
ls .claude/hooks/pre-request-governance.yaml

# Verify hook syntax is valid
# (Claude Code will report errors in console)
```

---

## Next Enhancements

| Feature | Status | Priority |
|---------|--------|----------|
| Auto-fix conflicts | Planned | High |
| Stale document detection | Planned | Medium |
| Integration with bmad-master | In Progress | High |
| Multi-platform sync | Planned | Low |

---

**Last Updated**: 2026-01-11
