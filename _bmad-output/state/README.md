# BMAD Runtime State

**Purpose**: This folder contains the LIVE runtime state files that were previously incorrectly placed in `_bmad-ext/`.

## Files

| File | Purpose | Updated By |
|------|---------|-----------|
| `LOOP_STATE.yaml` | Single source of truth for BMAD Extension session state | BMAD Master Orchestrator |
| `ARTIFACT_REGISTRY.yaml` | Registry of all artifacts created during session | Various agents |

## Critical Rules

1. **_bmad-ext/** = TEMPLATES, PROFILES, SCHEMAS (not runtime data)
2. **_bmad-output/** = ACTUAL OUTPUT, RUNTIME STATE, ARTIFACTS

## When State Changes

Any agent that updates session state MUST:
1. Update `_bmad-output/state/LOOP_STATE.yaml`
2. Update artifact registry if creating new artifacts
3. Never write runtime state to `_bmad-ext/`

## Session Reset

To reset state for new session:
```bash
# Backup current state
cp _bmad-output/state/LOOP_STATE.yaml _bmad-output/state/.archive/LOOP_STATE-$(date +%Y%m%d-%H%M%S).yaml

# Reset to template (if exists)
cp _bmad-ext/config/state-template.yaml _bmad-output/state/LOOP_STATE.yaml
```

---

**Moved from _bmad-ext/state/**: 2026-01-14
**Reason**: Separation of concerns - _bmad-ext is for templates only
