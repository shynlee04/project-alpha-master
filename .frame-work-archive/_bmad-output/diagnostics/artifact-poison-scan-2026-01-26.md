# Artifact Staleness & Poisoning Scan Report

**Scan Date**: 2026-01-26T14:00:00+07:00
**Scan Scope**: `_bmad-output/`
**Total Active Artifacts**: 918 files
**Scanner**: artifact-scanner (Subagent)

---

## Executive Summary

| Category | Count | Action |
|----------|-------|--------|
| **God Files (>3000 lines)** | 2 | CRITICAL ARCHIVE |
| **Files Without Date Stamps** | 50+ | ARCHIVE or RENAME |
| **Stale Status Files** | 3 | ARCHIVE |
| **Root-Level Scattered Files** | 12 | RELOCATE |
| **Duplicate Directory Structures** | 4 | MERGE |
| **Orphaned Epic Directories** | 5 | ARCHIVE |

---

## 🚨 CRITICAL: God Files (>3000 lines)

| File Path | Lines | Reason | Action |
|-----------|-------|--------|--------|
| `_bmad-output/sprint-artifacts/sprint-status.yaml` | 3602 | EXCEEDS 200 line limit - contains accumulated history | **ARCHIVE** - Keep only last 200 lines |
| `_bmad-output/.archive/2026-01-09/CLAUDE-v1.md` | 4132 | Already archived, good | NO ACTION |
| `_bmad-output/.archive/2026-01-09/AGENTS-v1.md` | 3953 | Already archived, good | NO ACTION |

---

## 🟡 Stale Status Files (Not Updated Recently)

| File Path | Last Modified | Reason | Action |
|-----------|---------------|--------|--------|
| `_bmad-output/bmm-workflow-status.yaml` | 2026-01-14 | 12 days stale - SUPERSEDED by dated versions | **ARCHIVE** |
| `_bmad-output/sprint-artifacts/sprint-status-architecture-remediation-2026-01-21.yaml` | 2026-01-16 | Epic-specific, superseded | **ARCHIVE** |
| `_bmad-output/sprint-artifacts/arc-sprint-status.yaml` | 2026-01-17 | Orphan - no references | **ARCHIVE** |

---

## 🟡 Root-Level Scattered Files (Misplaced)

| File Path | Reason | Action |
|-----------|--------|--------|
| `_bmad-output/ux-scan-results.md` | No date stamp, root-level | **MOVE** → `diagnostics/` |
| `_bmad-output/epic-44-progress-summary.md` | No date stamp, orphan | **ARCHIVE** |
| `_bmad-output/team-b-state-route-cleanup-investigation-report-2026-01-16-v2.md` | Root-level, 38KB | **MOVE** → `investigations/` |
| `_bmad-output/correct-course-resolution-track3-epic-cc-11-2026-01-22.md` | Root-level, old | **ARCHIVE** |
| `_bmad-output/correction-course-results-2026-01-18.md` | Root-level, old | **ARCHIVE** |
| `_bmad-output/emergency-fix-final-summary-2026-01-21.md` | Root-level, completed | **ARCHIVE** |
| `_bmad-output/emergency-fix-hooks-error-plan-2026-01-21.md` | Root-level, completed | **ARCHIVE** |
| `_bmad-output/emergency-fix-progress-report-2026-01-21.md` | Root-level, completed | **ARCHIVE** |
| `_bmad-output/social-media-tech-article-vi-2026-01-21.md` | Root-level content | **MOVE** → `documentation/` |
| `_bmad-output/project-context-2026-01-26.md` | Root-level, current | **MOVE** → `state/` |
| `_bmad-output/workflow-status-2026-01-25.yaml` | Should have 01-26 version | **REPLACE** with current |
| `_bmad-output/audit-report.json` | Empty file (0 bytes) | **DELETE** |

---

## 🟡 Duplicate Directory Structures

| Directory | Duplicate Of | Reason | Action |
|-----------|--------------|--------|--------|
| `_bmad-output/sprint-artifacts/ARCH-ARCH-01/` | `EPIC-ARCH-01/` | Naming error (double ARCH) | **MERGE** into EPIC-ARCH-01 |
| `_bmad-output/stories/` | `sprint-artifacts/stories/` | Root-level duplicate | **ARCHIVE** - use sprint-artifacts/stories |
| `_bmad-output/epics/stories/` | `sprint-artifacts/stories/` | Misplaced | **ARCHIVE** |
| `_bmad-output/planning-artifacts/stories/` | `sprint-artifacts/stories/` | Misplaced | **ARCHIVE** |

---

## 🟡 Orphaned Epic Directories

| Directory | Last Modified | Reason | Action |
|-----------|---------------|--------|--------|
| `_bmad-output/stories/EPIC-40/` | Unknown | No active sprint references | **ARCHIVE** |
| `_bmad-output/stories/EPIC-FS/` | Unknown | No active sprint references | **ARCHIVE** |
| `_bmad-output/stories/EPIC-STORE/` | Unknown | No active sprint references | **ARCHIVE** |
| `_bmad-output/sprint-artifacts/epic-mobile/` | Unknown | No active sprint references | **ARCHIVE** |
| `_bmad-output/sprint-artifacts/epic-summaries/` | Unknown | Empty or stale | **ARCHIVE** |

---

## 🟡 Files Without Date Stamps (Sample - 50+ Total)

| File Path | Reason | Action |
|-----------|--------|--------|
| `**/01-aider-repo-map-research.md` | No date in name | **RENAME** with date |
| `**/01-research-findings.md` | No date in name | **RENAME** with date |
| `**/02-correct-course.md` | No date in name | **RENAME** with date |
| `**/ADR-001-zustand-state-management.md` | No date in name | **RENAME** with date |
| `**/ADR-002-single-source-of-truth.md` | No date in name | **RENAME** with date |
| `**/api-contracts.md` | No date in name | **RENAME** with date |
| `**/api-contracts.yaml` | No date in name | **RENAME** with date |
| `**/UX-5-shadow-consolidation.md` | No date in name | **RENAME** with date |
| `**/STORAGE-SPRINT-COMPLETE.md` | No date in name | **RENAME** with date |

---

## 🟡 Large Files (1000-3000 lines) - Review Needed

| File Path | Lines | Reason | Action |
|-----------|-------|--------|--------|
| `_bmad-output/planning-artifacts/ux-specification.md` | 2118 | Core document - acceptable | **KEEP** |
| `_bmad-output/planning-artifacts/epics/EPIC-CC-AR02AR03-plugin-system-phase1a-2026-01-26.md` | 1853 | Active epic | **KEEP** |
| `_bmad-output/research/llm-provider-abstraction-patterns-2026-01-25.md` | 1585 | Research doc | **KEEP** (archive after 90 days) |
| `_bmad-output/sprint-artifacts/correct-course-sprint-plan-2026-01-16.md` | 1353 | Old sprint plan | **ARCHIVE** |
| `_bmad-output/planning-artifacts/prd.md` | 1121 | Core document | **KEEP** |

---

## 🔴 Immediate Actions (Priority Order)

### 1. CRITICAL - God File Remediation
```bash
# Truncate sprint-status.yaml to last 200 lines
tail -200 _bmad-output/sprint-artifacts/sprint-status.yaml > temp.yaml && mv temp.yaml _bmad-output/sprint-artifacts/sprint-status.yaml
```

### 2. Archive Stale Root Files
```bash
mkdir -p _bmad-output/.archive/2026-01-26-root-cleanup
mv _bmad-output/epic-44-progress-summary.md _bmad-output/.archive/2026-01-26-root-cleanup/
mv _bmad-output/correct-course-resolution-track3-epic-cc-11-2026-01-22.md _bmad-output/.archive/2026-01-26-root-cleanup/
mv _bmad-output/correction-course-results-2026-01-18.md _bmad-output/.archive/2026-01-26-root-cleanup/
mv _bmad-output/emergency-fix-*.md _bmad-output/.archive/2026-01-26-root-cleanup/
```

### 3. Archive Stale Workflow Files
```bash
mkdir -p _bmad-output/.archive/2026-01-26-stale-status
mv _bmad-output/bmm-workflow-status.yaml _bmad-output/.archive/2026-01-26-stale-status/
```

### 4. Merge Duplicate Directory
```bash
# Merge ARCH-ARCH-01 into EPIC-ARCH-01
cp -r _bmad-output/sprint-artifacts/ARCH-ARCH-01/* _bmad-output/sprint-artifacts/EPIC-ARCH-01/
mv _bmad-output/sprint-artifacts/ARCH-ARCH-01 _bmad-output/.archive/2026-01-26-duplicate-dir/
```

### 5. Archive Orphaned Stories Directories
```bash
mkdir -p _bmad-output/.archive/2026-01-26-orphan-stories
mv _bmad-output/stories _bmad-output/.archive/2026-01-26-orphan-stories/root-stories
mv _bmad-output/epics/stories _bmad-output/.archive/2026-01-26-orphan-stories/epics-stories
mv _bmad-output/planning-artifacts/stories _bmad-output/.archive/2026-01-26-orphan-stories/planning-stories
```

### 6. Relocate Root Files
```bash
mv _bmad-output/ux-scan-results.md _bmad-output/diagnostics/ux-scan-results-2026-01-09.md
mv _bmad-output/team-b-state-route-cleanup-investigation-report-2026-01-16-v2.md _bmad-output/investigations/
mv _bmad-output/social-media-tech-article-vi-2026-01-21.md _bmad-output/documentation/
mv _bmad-output/project-context-2026-01-26.md _bmad-output/state/
rm _bmad-output/audit-report.json
```

---

## Recommendations

### Short-term (Today)
1. ✅ Execute god file truncation
2. ✅ Archive stale root files
3. ✅ Archive stale workflow status
4. ✅ Merge duplicate directories

### Medium-term (This Week)
1. Implement file naming convention enforcement
2. Set up automated staleness detection
3. Create single `stories/` location policy

### Long-term (Governance)
1. Add pre-commit hooks for artifact naming
2. Implement TTL-based auto-archive
3. Set up artifact registry validation

---

## Validation

After cleanup, expected state:
- God files: 0 (under 500 lines each)
- Root-level scattered files: 2 max (workflow-status, LOOP_STATE)
- Duplicate directories: 0
- Stale status files: 0
- Total active artifacts: ~850 (reduced from 918)

---

**Report Generated By**: artifact-scanner
**Execution Time**: ~2 minutes
**Status**: COMPLETE
