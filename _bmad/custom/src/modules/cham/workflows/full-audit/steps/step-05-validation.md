---
statusFile: '{project-root}/.bmad/custom/src/modules/cham/status/audit-status.json'
phaseOutputFile: '{project-root}/.bmad/custom/src/modules/cham/status/phase-validation.json'
finalReportFile: '{project-root}/.bmad/custom/src/modules/cham/status/final-validation-report.md'
---

# Step 5: Validation Phase

## STEP GOAL

Re-run all scans to validate remediation was successful, generate final report, and update documentation.

## EXECUTION PROTOCOLS

1. **Update Status**
   - Set `currentPhase: "validation"` in audit-status.json
   - Set validation phase `status: "in_progress"`

2. **Run Final Validator Agent**
   - Re-run all 8 scanning agents
   - Compare before/after issue counts
   - Verify metrics hit targets
   - Smoke test critical user flows
   - Generate final-validation-report.md

3. **Run Documenter Agent**
   - Update architecture docs with new state
   - Generate audit summary for stakeholders
   - Create migration guide for developers
   - Update module README if needed

4. **Save Phase Results**
   - Write phase-validation.json with validation results
   - Include before/after comparisons
   - Include metrics achieved
   - Include remaining issues

5. **Update Final Status**
   - Set validation phase `status: "completed"`
   - Set overall audit `status: "completed"`
   - Record total duration
   - Set `completedAt` timestamp
   - Update final metrics

6. **Present Final Report**
   - Display final-validation-report.md
   - Show metrics improvements
   - List remaining issues (if any)
   - Provide next steps

## OUTPUTS

- `final-validation-report.md` - Complete audit summary
- Updated architecture documentation
- Migration guide (if needed)
- `phase-validation.json` - Phase results summary
- Updated audit-status.json (completed)

## SUCCESS CRITERIA

- All scans re-run successfully
- Metrics show improvement
- Documentation updated
- Final report generated
- Audit marked complete

## WORKFLOW COMPLETE

The full audit workflow is now complete. Review the final report and proceed with any remaining work.
