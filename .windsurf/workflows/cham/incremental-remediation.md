# CHAM Incremental Remediation Workflow

Fix issues cluster-by-cluster from an existing remediation roadmap.

## Process

1. Load remediation-roadmap.md
2. For each cluster:
   - Present to user for approval
   - Run appropriate fixer agent
   - Run test validator
   - Commit if tests pass
3. Track progress in status files

## Usage

Run when you have an existing remediation roadmap and want to fix issues incrementally.
