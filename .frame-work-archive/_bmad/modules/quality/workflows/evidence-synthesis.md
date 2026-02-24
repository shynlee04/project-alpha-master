# Evidence Synthesis Workflow

**Workflow ID**: `@bmad/modules/deep-scan/workflows/evidence-synthesis`
**Version**: 1.0.0
**Created**: 2026-01-04

## Workflow Overview

The intelligence processing layer. It takes raw technical proofs from scanners and turns them into business/architectural intelligence (Risks, Trends, Health Scores).

### Steps

### 1. Ingestion
- Load all `.yaml` evidence files from `_bmad-output/deep-scan/evidence/`.
- Validate YAML schema.

### 2. Deduplication & Correlation
- Merge duplicate findings (same line/file reported by multiple runs).
- Correlate: Link `Layer Violation` in UI with `God Store` in State (often related).

### 3. Scoring
- Calculate **Health Score** (0-100) per domain.
- Formula: `100 - (Critical * 5) - (High * 2) - (Medium * 1)`.

### 4. Prioritization
- Sort risks by Severity (Critical > High > Medium).
- Group by "Blast Radius" (how many files affected).

### 5. Report Generation
- Generate `MASTER-RISK-REGISTER.md` (Current State).
- Generate `REMEDIATION-BACKLOG.yaml` (Future Work).
- Generate `TREND-REPORT.md` (If historical data exists).

## Outputs
- Risk Register
- Backlog
- Health Scores

---

**Trigger**: End of `full-scan` or Manual.
**Success Criteria**: Actionable, prioritized backlog.
