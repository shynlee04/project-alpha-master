---
name: incremental-remediation
description: Cluster-by-cluster remediation workflow with test validation
web_bundle: true
installed_path: '{project-root}/.bmad/custom/src/modules/cham/workflows/incremental-remediation'
---

# Incremental Remediation Workflow

**Goal:** Fix issues cluster-by-cluster from an existing remediation roadmap with test validation after each fix.

**Your Role:** Guide the incremental remediation process, ensuring each cluster is fixed, tested, and validated before proceeding.

## WORKFLOW PROCESS

1. **Load Roadmap**
   - Read remediation-roadmap.md
   - Identify clusters to fix

2. **For Each Cluster:**
   - Present cluster to user
   - Get approval
   - Run appropriate fixer agent
   - Run test validator
   - Commit if tests pass
   - Update roadmap

3. **Track Progress**
   - Update status files
   - Record completions
   - Generate migration notes

## USAGE

Run this workflow when you have an existing remediation roadmap and want to fix issues incrementally.
