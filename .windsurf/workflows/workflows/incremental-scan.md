# Incremental Deep Scan Workflow

**Workflow ID**: `@bmad/modules/deep-scan/workflows/incremental-scan`
**Version**: 1.0.0
**Created**: 2026-01-04

## Workflow Overview

Scans only the files changed in the current git branch compared to `main` (or specified base). Optimized for CI/CD pipelines and pre-push checks.

### When to Use
- **CI/CD**: On every Pull Request.
- **Pre-Push**: Local git hook.
- **Review**: Before code review to catch obvious issues.

## Steps

### Phase 1: Delta Analysis

Identify changed files.

```bash
git diff --name-only main...HEAD > _bmad-output/deep-scan/changed-files.txt
```

### Phase 2: Route to Scanners

Map changed files to relevant scanners based on extension and path.

- `*-store.ts` -> **State Scanner**
- `*.tsx` -> **UX Scanner** + **Architecture Scanner**
- `*.ts` -> **Types Scanner**
- `src/infrastructure/*` -> **Persistence Scanner**

### Phase 3: Execute Scans

Run relevant scanners in "Targeted" mode on the changed file list.

### Phase 4: Report Delta

Generate a "New Risks" report, highlighting only *new* violations introduced in this delta.

## Outputs

- `_bmad-output/deep-scan/reports/DELTA-RISKS.md`

---

**Trigger**: CI/CD or Manual
**Success Criteria**: No new Critical (P0) risks introduced.
