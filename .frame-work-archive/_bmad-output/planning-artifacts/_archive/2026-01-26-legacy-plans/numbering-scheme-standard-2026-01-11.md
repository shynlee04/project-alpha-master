# Numbering Scheme Standard

**Date:** 2026-01-11  
**Status:** APPROVED  
**description:** Establish sensible epic/story numbering that doesn't "sound like bullshit"

---

## Problem Statement

**Previous Scheme Issues:**
- "Greater number epics execute first" = BULLSHIT
- Mix of formats: EPIC-40, EPIC-FS, Phase-1, Phase-1.5
- Numbers don't reflect logical order
- No clear dependency rules

**User Quote:** "Greater number epics do are executed before in plan is one example of bullshit to my logic"

**Agreement:** Epic numbers should NOT imply priority or execution order

---

## New Numbering Scheme: Monotonic Sequential

### Epic Format: EPIC-XX

```
Format: EPIC-XX (two-digit zero-padded)
Example: EPIC-01, EPIC-02, EPIC-03, ..., EPIC-99

Interpretation:
- Numbers are ASSIGNED SEQUENTIALLY as work is identified
- Number does NOT indicate priority
- Number does NOT indicate execution order
```

### Story Format: XX-YY

```
Format: XX-YY (Epic-Story, two-digit each)
Example: 01-03, 01-04, 02-01, 02-02

Interpretation:
- First number = Epic identifier
- Second number = Story number within epic
- Stories stay within epic context
```

### Dependency Rule (Clear, Not Implicit)

```
Hard Rule:
  EPIC-N requires EPIC-(N-1) to be 80%+ complete BEFORE starting

Execution Order:
  EPIC-01 → EPIC-02 → EPIC-03 → ...

But Priority is INDEPENDENT:
  EPIC-02 might be P0 while EPIC-03 is P2
```

---

## Example: Correct Usage

### Current Mapping

| Old ID | New ID | Name | Progress | Priority |
|--------|--------|------|----------|----------|
| EPIC-FS | EPIC-01 | File System Foundation | 28.6% | P0 |
| EPIC-38 | EPIC-02 | Architecture Remediation | BLOCKED | P0 |
| EPIC-39 | EPIC-03 | 8-bit Design Compliance | 67% | P1 |
| EPIC-40 | EPIC-04 | Multimodal Chat Unification | 100% ⚠️ | P1 |

### Why This Works

1. **EPIC-01 (FS)** is foundation → P0, 28.6% done
2. **EPIC-02 (Architecture)** depends on EPIC-01 → BLOCKED until 80%+
3. **EPIC-03 (Design)** can run in parallel → P1, 67% done
4. **EPIC-04 (Multimodal)** needs VERIFICATION → claimed 100% but suspicious

### Number vs Priority Independence

```
PRIORITY (independent of number):
├── P0 (Must do first)
│   ├── EPIC-01 (File System) - #1 but P0
│   └── EPIC-02 (Architecture) - #2 but P0
├── P1 (Should do)
│   ├── EPIC-03 (Design) - #3 but P1
│   └── EPIC-04 (Multimodal) - #4 but P1
└── P2 (Could do)
    └── EPIC-05 (Future) - #5 but P2
```

---

## Story Numbering Examples

### EPIC-01: File System Foundation

```
EPIC-01 (File System Foundation)
├── 01-01 (done) File system foundation
├── 01-02 (done) File operations
├── 01-03 (done) Sync logic
├── 01-04 (done) Permission handling
├── 01-05 (done) Research task
├── 01-06 (in_progress) Next implementation
├── 01-07 (pending) Task
├── 01-08 (pending) Task
├── 01-09 (pending) Task
├── 01-10 (pending) Task
├── 01-11 (pending) Task
├── 01-12 (pending) Task
├── 01-13 (pending) Task
└── 01-14 (pending) Task
```

### EPIC-02: Architecture Remediation

```
EPIC-02 (Architecture Remediation)
├── BLOCKED until EPIC-01 is 80%+
├── 02-01 (pending) Break circular dependencies
├── 02-02 (pending) Fix layer violations
├── 02-03 (pending) Consolidate types
├── 02-04 (pending) Fix N+1 queries
├── 02-05 (pending) Fix sync race conditions
├── 02-06 (pending) Decompose god stores
├── 02-07 (pending) Update ADRs
├── 02-08 (pending) Verify story completions
└── ... more stories as needed
```

---

## Anti-Patterns to Avoid

### ❌ BAD: Non-sequential Numbers
```
EPIC-FS, EPIC-38, EPIC-39, EPIC-40
```
Why: Mix of formats, FS meaning unclear, no logical pattern

### ❌ BAD: Numbers Implying Priority
```
EPIC-30 (P0), EPIC-31 (P1), EPIC-32 (P2)
```
Why: Numbers suggest execution order when priority might differ

### ❌ BAD: Reusing Numbers
```
EPIC-01 used, then reused for new epic
```
Why: Breaks traceability, loses history

### ❌ BAD: Gap Filling
```
EPIC-01, EPIC-02, EPIC-05 (skips 03, 04)
```
Why: Suggests missing work, confusing references

---

## Implementation Guide

### Converting from Old Scheme

| Old ID | New ID | Action |
|--------|--------|--------|
| EPIC-FS | EPIC-01 | Rename |
| EPIC-30 | EPIC-05 | Archive as complete |
| EPIC-31 | EPIC-06 | Archive as complete |
| EPIC-38 | EPIC-02 | Rename (blocked) |
| EPIC-39 | EPIC-03 | Rename |
| EPIC-40 | EPIC-04 | Rename (mark suspicious) |
| Phase-1 | ARCHIVED | Mark complete |
| Phase-1.5 | ARCHIVED | Mark complete |

### File Updates Required

1. **bmm-workflow-status.yaml**
   - Change epic IDs
   - Update story references
   - Fix ordering logic

2. **epics.md**
   - Add prefix to all epic titles
   - Update story IDs
   - Fix cross-references

3. **Story files**
   - Rename individual story files
   - Update internal IDs

4. **Import statements**
   - Update all epic/story references
   - Fix imports in code

---

## Validation Checklist

```
□ Epic IDs are zero-padded two digits (EPIC-01, not EPIC-1)
□ Story IDs follow XX-YY format (01-03, not 1-3)
□ No epic/story numbers are reused
□ Dependencies are explicitly documented
□ Priority is separate from number
□ Old IDs are archived, not deleted
□ Cross-references are updated
□ Import statements are fixed
```

---

## References

- **ADR Best Practices:** `_bmad-output/planning-artifacts/BEST-PRACTICES-REPORT-planning-artifacts-2026-01-11.md`
- **Epics Reconciliation:** `_bmad-output/planning-artifacts/epics-reconciliation-report-2026-01-11.md`
- **Architecture Corrections:** `_bmad-output/planning-artifacts/architecture/architecture-2026-01-11-CORRECTED.md`

---

**Approved By:** Architecture Recovery Process  
**Effective Date:** 2026-01-11  
**Review Date:** 2026-02-11 (quarterly)

---

*Part of planning artifacts cleanup*  
*Supersedes: bmm-workflow-status.yaml numbering rules*
