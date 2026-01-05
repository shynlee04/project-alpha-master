---
name: continuous-monitoring
description: Lightweight health checks for PR and scheduled audits
web_bundle: true
installed_path: '{project-root}/.bmad/custom/src/modules/cham/workflows/continuous-monitoring'

# ============================================================
# GOVERNANCE FRONTMATTER (REQUIRED)
# ============================================================
workflow_id: "WF-CHAM-002"
workflow_type: "workflow"
governance_version: "1.0.0"
created_at: "2026-01-06T00:00:00+07:00"
expires_at: "2099-12-31T23:59:59+07:00"
status: "ACTIVE"
team: "shared"
parent_id: "governance-foundation-001"
related_artifacts: []
---

# Continuous Monitoring Workflow

**Goal:** Run lightweight health checks on pull requests and scheduled full audits to detect architecture drift.

**Your Role:** Execute fast scans for common issues and alert on regressions.

## WORKFLOW PROCESS

### On Pull Request

1. **Fast Architecture Scan**
   - Architecture Compliance Agent (2 min)
   - Type Safety Agent (TS compiler errors)
   - Test Coverage Agent (fail if <80%)

2. **Report Results**
   - Block PR if critical violations
   - Warn on high-priority issues
   - Pass if all checks pass

### Weekly Scheduled

1. **Full Audit**
   - Run complete full-audit workflow
   - Compare to baseline
   - Alert on drift

2. **Drift Detection**
   - Compare to last audit
   - Identify new violations
   - Alert team

## USAGE

Configure in CI/CD or run manually for health checks.
