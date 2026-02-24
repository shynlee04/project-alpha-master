# Client-Side IDE Architecture Research (PUT ASIDE - Return Later)

**Created:** 2026-01-17T12:00:00+07:00  
**Status:** COMPLETED_PUT_ASIDE  
**Document:** `_bmad-output/project-planning-artifacts/research/technical-client-side-ide-architecture-2026-01-17.md`

## Research Scope

This research targeted IDE workspace WebContainer sandboxing alternatives and FSA vs IndexedDB (Dexie) for unified storage across 2 device types (desktop/mobile).

## Key Findings Summary

### 1. Storage Architecture Decisions

**FSA + DexieDB Dual Storage = PROCEED** [High Confidence]
- Chrome DevRel officially recommends this pattern
- Clear separation: FSA for file I/O, DexieDB for metadata
- Index storage layer essential for performance
- Desktop = FSA automatically, Mobile = IndexedDB automatically (no user choice)

**DexieDB-Only Unified Storage = REJECT** [High Confidence]
- 3x-4x slower than FSA/OPFS
- 2GB quota insufficient for IDE workloads
- Breaks local file system integration

### 2. WebContainer Sandbox Alternatives (7 Technologies Analyzed)

Analyzed via SWOT: StackBlitz WebContainer, iframe sandbox, Service Worker, Web Workers, OPFS sandbox, etc.

### 3. Performance Priorities

- **P0**: Implement file tree snapshot index
- **OPFS** is 3x-4x faster than IndexedDB
- Enables instant project switching

## Decision Outcomes

| Decision | Outcome | Confidence |
|-----------|----------|-------------|
| FSA + DexieDB Dual Storage | **PROCEED** | High |
| DexieDB-Only Unified Storage | **REJECT** | High |
| File Tree Snapshot Index | **P0 Priority** | High |

## Next Steps (Not Yet Executed)

Before deep-scanning system architecture, need to conduct:

1. **Domain-Specific Discovery** (Stack-Feature Scan)
2. **Dependency/Conflict Analysis Framework**
3. **Deep-Scanning System Architecture Remediation**

## Why Put Aside?

This research is a **foundation piece** but requires deeper understanding of current codebase structure before implementation. We need to:
- Map out all features and domains
- Identify dependencies and conflicts
- Analyze architecture violations
- THEN apply these research findings to remediation plan

## Related Governance Documents

- ADR-033: Correct-Course Architectural Remediation (APPROVED)
- Research Workflow: `_bmad/bmm/workflows/1-analysis/research/workflow.md`
- Config: `_bmad/bmm/config.yaml`

## Memory References

- Track ID: RES-ARCH-2026-01-17
- Document path: `_bmad-output/project-planning-artifacts/research/technical-client-side-ide-architecture-2026-01-17.md`
- Workflow status: Updated in `bmm-workflow-status.yaml`
