# Pre-Request Governance System - Implementation Summary

**Date:** 2026-01-11  
**Status:** ✅ IMPLEMENTED  
**Purpose:** Prevent 400 provider errors by checking governance document consistency before AI requests

---

## What Was the Problem?

1. **400 Provider Error**: Mistral API returned "Invalid structured output syntax" (error 3051) when running `/correct-course`
2. **Governance Documents Out of Sync**: `bmm-workflow-status.yaml`, `AGENTS.md`, and `sprint-status.yaml` had mismatched story/epic IDs
3. **No Pre-Flight Check**: System didn't check document consistency before sending requests to AI
4. **Context Poisoning**: Agent couldn't automatically detect that user wanted remediation and that documents were stale

---

## What We Built

### 1. Natural Language Intent Detection

**File:** `.opencode/scripts/governance-check.sh`

Detects user intent from natural language with weighted scoring:

| Intent Type | Patterns | Weight |
|-------------|----------|--------|
| **remediation** | correct-course, stuck, blocked, god store, refactor | 3-4 points |
| **planning** | sprint, story, epic, backlog, plan | 1-3 points |
| **implementation** | implement, create, develop, feature | 1-2 points |
| **governance** | agents.md, constitution, standard | 2-3 points |

**Examples:**
```
"This story is stuck and not moving forward" → remediation (7 points)
"Can you help me implement a new feature?" → implementation (5 points)
"What about planning the next sprint?" → planning (6 points)
/bmad:bmm:workflows:correct-course → remediation (3 points)
```

### 2. Document Consistency Check

Compares governance documents for consistency:

- **bmm-workflow-status.yaml** vs **AGENTS.md**
  - Story ID comparison (whitespace-trimmed)
  - Epic ID comparison
- **Sprint status** verification
- Blocks remediation requests if documents are inconsistent

### 3. Auto-Fix Feature

**File:** `.opencode/scripts/governance-fix.sh`

Automatically fixes governance document inconsistencies:
- Backs up current state to `_bmad-output/.archive/governance-backups/YYYY-MM-DD/`
- Syncs AGENTS.md Quick Reference from bmm-workflow-status.yaml
- Preserves table formatting using perl
- Provides revert instructions

### 4. Stale Document Detection

**File:** `.opencode/scripts/governance-freshness.sh`

Checks document freshness (≤4 hours threshold):
- Warns if documents exceed freshness threshold
- Detects stale files that need refresh
- Provides instructions for refresh

---

## Files Created

```
.opencode/
├── scripts/
│   ├── governance-check.sh      # Main pre-request check
│   ├── governance-fix.sh        # Auto-fix inconsistencies
│   └── governance-freshness.sh  # Document freshness check
├── hooks/
│   └── pre-request-governance.yaml
└── commands/
    └── bmad-governance-check.md

.claude/
└── hooks/
    └── pre-request-governance.yaml

_bmad-output/
└── .archive/
    └── governance-backups/
        └── 2026-01-11/
            ├── bmm-workflow-status.yaml.bak
            ├── AGENTS.md.bak
            └── sprint-status.yaml.bak
```

---

## Test Results

### ✅ All Tests Passing

| Test | Result |
|------|--------|
| Natural language intent detection | ✅ PASS |
| Document consistency check | ✅ PASS |
| Auto-fix script | ✅ PASS |
| Freshness detection | ✅ PASS |
| Original error scenario (/correct-course) | ✅ PASS |

### Intent Detection Scores

```
"stuck story" → remediation: 7, planning: 1, implementation: 0, governance: 0
"implement feature" → remediation: 0, planning: 1, implementation: 5, governance: 0
"sprint planning" → remediation: 0, planning: 6, implementation: 0, governance: 0
```

---

## Usage

### Before Any AI Request

```bash
# Check governance status
./.opencode/scripts/governance-check.sh "your request here"

# If documents are inconsistent, fix them
./.opencode/scripts/governance-fix.sh

# Check document freshness
./.opencode/scripts/governance-freshness.sh
```

### Integration with bmad-master

```bash
# At the top of any bmad-master workflow
./.opencode/scripts/governance-check.sh "$USER_PROMPT" || exit 1
```

---

## Known Issues & Limitations

1. **Perl dependency**: Auto-fix uses `perl` for table preservation (works on macOS/Linux)
2. **File modification time**: Freshness check uses file mtime, not content timestamps
3. **Epic progress sync**: Only syncs current story/epic, not all epic progress values

---

## Future Enhancements

1. **Auto-sync all epic progress** - Sync full Active Epics table, not just current
2. **Git-based freshness** - Check git commit timestamps for freshness
3. **Webhook integration** - Notify when documents go stale
4. **CI/CD gate** - Block PRs if governance documents are inconsistent

---

## Rollback Instructions

If issues arise from the governance system:

```bash
# Revert AGENTS.md
cp _bmad-output/.archive/governance-backups/2026-01-11/AGENTS.md.bak AGENTS.md

# Revert bmm-workflow-status.yaml
cp _bmad-output/.archive/governance-backups/2026-01-11/bmm-workflow-status.yaml.bak bmm-workflow-status.yaml

# Remove scripts (if needed)
rm .opencode/scripts/governance-check.sh
rm .opencode/scripts/governance-fix.sh
rm .opencode/scripts/governance-freshness.sh
```
