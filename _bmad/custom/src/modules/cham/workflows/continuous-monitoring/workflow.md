---
name: continuous-monitoring
description: Lightweight health checks for PR and scheduled audits
web_bundle: true
installed_path: '{project-root}/.bmad/custom/src/modules/cham/workflows/continuous-monitoring'
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
