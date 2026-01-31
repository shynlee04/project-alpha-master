# Requirements: Project Alpha Architecture Remediation

**Defined:** 2026-01-31
**Core Value:** Clear state boundaries — every piece of data has ONE canonical home and ONE flow path.

## v1 Requirements

Requirements for Foundation Reset milestone. Each maps to roadmap phases.

### State Boundaries

- [ ] **STATE-01**: Define 4-layer state architecture contracts (UI → Session → Persisted → File)
- [ ] **STATE-02**: Eliminate Zustand persist middleware for Dexie-owned data
- [ ] **STATE-03**: Enforce `useShallow()` on all Zustand selectors (prevent re-render cascades)
- [ ] **STATE-04**: Enforce `useLiveQuery()` for all Dexie data access (ensure reactivity)
- [ ] **STATE-05**: Document "where does this data live" for each entity type
- [ ] **STATE-06**: Create ESLint rules for state layer violations
- [ ] **STATE-07**: Add runtime boundary violation warnings in dev mode

### Import Path Governance

- [ ] **IMPORT-01**: Define canonical import paths per architectural layer
- [ ] **IMPORT-02**: Migrate all `@/lib/*` imports to proper canonical locations (674 files)
- [ ] **IMPORT-03**: Add ESLint rule to block `@/lib/*` imports
- [ ] **IMPORT-04**: Create auto-fix script for bulk import migrations
- [ ] **IMPORT-05**: Add pre-commit hook for import path enforcement

### God File Splitting

- [ ] **SPLIT-01**: Split Zustand stores >300 LOC into focused slices (≤120 LOC each)
- [ ] **SPLIT-02**: Split React components >400 LOC into composable units
- [ ] **SPLIT-03**: Maintain 100% backward compatibility during splits (facade exports)
- [ ] **SPLIT-04**: Establish max LOC governance script (CI integration)
- [ ] **SPLIT-05**: Add CI check to prevent new god files

### Plugin Coordination

- [ ] **PLUGIN-01**: Implement SharedActiveDocument state across all plugins
- [ ] **PLUGIN-02**: Implement live sync between Monaco ↔ Notes (real-time, not warnings)
- [ ] **PLUGIN-03**: Wire Terminal → Preview dev server detection and URL passing
- [ ] **PLUGIN-04**: Implement device capability fallbacks (graceful degradation on mobile)
- [ ] **PLUGIN-05**: Create plugin capability registry (file-editor, process-runner, etc.)
- [ ] **PLUGIN-06**: Add plugin dependency declarations (requires FSA, requires WebContainer)

### Schema & Data Flow

- [ ] **SCHEMA-01**: Define canonical schemas for Project entity
- [ ] **SCHEMA-02**: Define canonical schemas for Thread entity
- [ ] **SCHEMA-03**: Define canonical schemas for Note entity
- [ ] **SCHEMA-04**: Define canonical schemas for File entity
- [ ] **SCHEMA-05**: Document data flow contracts (who writes, who reads, event triggers)
- [ ] **SCHEMA-06**: Establish single source of truth per entity (no duplication)
- [ ] **SCHEMA-07**: Implement Dexie schema versioning for safe migrations
- [ ] **SCHEMA-08**: Create data flow visualization diagram

### Testing Foundation

- [ ] **TEST-01**: Fix broken test setup (vi imports, Project type errors)
- [ ] **TEST-02**: Add unit tests for state stores (critical path coverage)
- [ ] **TEST-03**: Add unit tests for sync engine (FSA ↔ Dexie)
- [ ] **TEST-04**: Achieve 50%+ test coverage for core modules
- [ ] **TEST-05**: Add E2E tests for plugin coordination flows

### Agent Integration

- [ ] **AGENT-01**: Implement agent suggest mode (propose changes in diff view)
- [ ] **AGENT-02**: Create diff view component for agent suggestions
- [ ] **AGENT-03**: Implement human approval flow (accept/reject/edit)
- [ ] **AGENT-04**: Add tool permission system (allow/ask/deny per tool)
- [ ] **AGENT-05**: Create agent action audit trail (who changed what when)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Agent Full CRUD

- **AGENT-V2-01**: Agent can create files directly (with versioning)
- **AGENT-V2-02**: Agent can edit files directly (with optimistic locking)
- **AGENT-V2-03**: Agent can delete files (with undo capability)
- **AGENT-V2-04**: Implement file versioning for rollback
- **AGENT-V2-05**: Implement concurrent edit resolution

### Advanced Features

- **ADV-01**: Multi-project support (project groups)
- **ADV-02**: Cloud sync (cross-device)
- **ADV-03**: RAG/Embedding pipeline integration
- **ADV-04**: Real-time collaboration (multi-user)

### Mobile Optimization

- **MOBILE-01**: Mobile-first responsive layouts
- **MOBILE-02**: Touch gesture support
- **MOBILE-03**: Offline-first PWA enhancements

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| New user-facing features | Foundation Reset focuses on architecture only |
| Framework migration | React 19, TanStack, Zustand v5 are locked in |
| Full rewrite | Must migrate incrementally (brownfield) |
| Cloud infrastructure | Local-first only for v1 |
| Team collaboration | Single-user (solo dev + Claude) for v1 |
| Mobile-first optimization | Desktop (FSA) is primary platform |
| Custom agent creation | Built-in agents only for v1 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| STATE-01 | TBD | Pending |
| STATE-02 | TBD | Pending |
| STATE-03 | TBD | Pending |
| STATE-04 | TBD | Pending |
| STATE-05 | TBD | Pending |
| STATE-06 | TBD | Pending |
| STATE-07 | TBD | Pending |
| IMPORT-01 | TBD | Pending |
| IMPORT-02 | TBD | Pending |
| IMPORT-03 | TBD | Pending |
| IMPORT-04 | TBD | Pending |
| IMPORT-05 | TBD | Pending |
| SPLIT-01 | TBD | Pending |
| SPLIT-02 | TBD | Pending |
| SPLIT-03 | TBD | Pending |
| SPLIT-04 | TBD | Pending |
| SPLIT-05 | TBD | Pending |
| PLUGIN-01 | TBD | Pending |
| PLUGIN-02 | TBD | Pending |
| PLUGIN-03 | TBD | Pending |
| PLUGIN-04 | TBD | Pending |
| PLUGIN-05 | TBD | Pending |
| PLUGIN-06 | TBD | Pending |
| SCHEMA-01 | TBD | Pending |
| SCHEMA-02 | TBD | Pending |
| SCHEMA-03 | TBD | Pending |
| SCHEMA-04 | TBD | Pending |
| SCHEMA-05 | TBD | Pending |
| SCHEMA-06 | TBD | Pending |
| SCHEMA-07 | TBD | Pending |
| SCHEMA-08 | TBD | Pending |
| TEST-01 | TBD | Pending |
| TEST-02 | TBD | Pending |
| TEST-03 | TBD | Pending |
| TEST-04 | TBD | Pending |
| TEST-05 | TBD | Pending |
| AGENT-01 | TBD | Pending |
| AGENT-02 | TBD | Pending |
| AGENT-03 | TBD | Pending |
| AGENT-04 | TBD | Pending |
| AGENT-05 | TBD | Pending |

**Coverage:**
- v1 requirements: 40 total
- Mapped to phases: 0
- Unmapped: 40 ⚠️

---
*Requirements defined: 2026-01-31*
*Last updated: 2026-01-31 after initial definition*
