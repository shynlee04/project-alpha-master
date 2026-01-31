Governance Pre-Execution Report
Date: 2026-01-25
Generated: 2026-01-25 (local time; exact time not provided)

Inputs:
- .claude/hooks/pre-execution.sh
- _bmad-ext/state/LOOP_STATE.yaml
- bmm-workflow-status.yaml
- _bmad-output/sprint-artifacts/sprint-status-2026-01-25.yaml

Pre-Execution Hook:
- Command: ./.claude/hooks/pre-execution.sh
- Output: "✅ Governance check passed"
- Errors: none

Anchor Freshness:
- anchor.human_intent_timestamp: 2026-01-25T10:00:00+07:00
- staleness_threshold_hours: 24
- Assessment: FRESH (same local date; age is within 0-24 hours). Exact age cannot be computed without current time-of-day.

Governance Signals:
- sprint-status-2026-01-25.yaml reports stale_artifacts: 1
- app_status: NON_FUNCTIONAL (from sprint status)
- No violations reported by pre-execution hook output

Blockers:
- Stale artifacts: 1 (per sprint status)
- App status non-functional (FSA handle integration missing)
