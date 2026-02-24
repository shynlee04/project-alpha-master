---
name: stale-check
description: File freshness validation for story context. Use when verifying context artifacts are up-to-date. Checks file modification timestamps and git status to ensure context is fresh.
version: 2.0.0
# =============================================================================
# HIERARCHICAL TAXONOMY (BMAD Skills Manifest v3.0)
# =============================================================================
category: utility
parent: story-cycle
children: []
priority: 65
agents:
  - bmad-bmm-sm
triggers:
  - stale check
  - freshness check
  - verify freshness
  - /stale-check
---

# Utility: Stale Check

**description**: Validate file freshness to ensure context artifacts are up-to-date before using them for development.

## When to use

- During context validation (Step 04)
- Before starting development
- After significant delays
- Manual freshness verification

## Instructions

### 1. Check File Modification Times

For each reference file:
```bash
# Get file modification time
stat -f "%Sm" -t "%Y-%m-%dT%H:%M:%S" {file_path}

# Or using ls -l
ls -l {file_path}
```

### 2. Check Git Status

```bash
# Check for uncommitted changes
git status --porcelain {file_path}

# If output is non-empty: file has uncommitted changes
```

### 3. Freshness Criteria

| Age | Status | Action |
|-----|--------|--------|
| < 24 hours | ✅ FRESH | Proceed normally |
| 24-72 hours | ⚠️ STALE | Warn user, offer refresh |
| > 72 hours | ❌ VERY STALE | Require refresh or acknowledgement |

### 4. Files to Check

```yaml
context_files:
  - _bmad-output/epics.md
  - _bmad-output/project-planning-artifacts/architecture.md
  - _bmad-output/project-planning-artifacts/prd.md
  - .claude/rules/governance-rules.md
  - _bmad-output/sprint-artifacts/sprint-status.yaml
```

### 5. Stale Check Report

```markdown
## Stale Check Report

**Checked At:** {timestamp}
**Story:** {story_key}

### File Freshness

| File | Last Modified | Age | Status |
|------|---------------|-----|--------|
| epics.md | {timestamp} | {age} | {status} |
| architecture.md | {timestamp} | {age} | {status} |
| governance-rules.md | {timestamp} | {age} | {status} |
| sprint-status.yaml | {timestamp} | {age} | {status} |

### Git Status
{uncommitted_changes_summary}

### Overall Result: FRESH/STALE/VERY_STALE

### Recommendations
{actions_to_take_if_stale}
```

### 6. Handling Stale Context

#### FRESH (< 24h)
- Proceed without warning
- All checks pass

#### STALE (24-72h)
```
⚠️ WARNING: Some context files may be stale
- epics.md: {age} old
- architecture.md: {age} old

Options:
1. Proceed anyway (acknowledge)
2. Refresh context (reload files)
3. Check git for updates
```

#### VERY STALE (> 72h)
```
❌ BLOCKED: Context files are very stale

Required actions:
1. Refresh all context files
2. Verify git status for updates
3. Re-run validation after refresh

Must acknowledge before proceeding:
- "I understand context may be outdated"
```

### 7. Auto-Refresh on Stale

For stale or very stale files:
```bash
# Re-read the file
READ: {stale_file_path}

# Update last_checked timestamp
# Note: Does not modify original file
```

## Usage Example

```bash
# In validate-context step
/stale-check context={story_key}-context.xml

# Output:
# epics.md: FRESH (2 hours old)
# architecture.md: STALE (30 hours old)
# governance-rules.md: FRESH (4 hours old)
# Result: STALE - Recommendation: Refresh architecture.md
```

## Exit Codes

| Code | Meaning | Action |
|------|---------|--------|
| 0 | All FRESH | Proceed |
| 1 | Some STALE | Warn, offer refresh |
| 2 | VERY STALE | Block, require refresh |

---

**Source**: `_bmad/bmb/workflows/story-cycle/utils/_stale-check.md`
