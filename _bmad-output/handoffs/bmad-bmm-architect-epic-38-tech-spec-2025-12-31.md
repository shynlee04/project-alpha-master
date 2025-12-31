---
date: 2025-12-31
time: 11:25:00+07:00
phase: correct-course-handoff
team: Team-A
agent_mode: bmad-core-bmad-master
handoff_to: bmad-bmm-architect
---

# Handoff to @bmad-bmm-architect: Technical Specification for Epic 38

## Task: Generate Technical Specification for Project Management System Enhancement

### Context Summary

**Epic:** EPIC-38 - Project Management System Restoration
**Classification:** Core Infrastructure Enhancement
**Priority:** P0
**Estimated Duration:** 3-4 weeks
**Dependencies:** Epic 24 (completed), Epic 3 (completed)

The current project requires comprehensive restoration and enhancement of the synchronization infrastructure. The system facilitates bidirectional data flow between the central hub/workspace and user-local file systems. This epic addresses widespread disruption affecting both backend services and frontend user interfaces.

**Current Architecture State:**
- Local FS is source of truth (verified)
- SyncManager handles direction: Local → WebContainer only
- Missing: WebContainer → Local propagation (Reverse Sync)
- Frontend components (File Tree, Sync Status, Properties, Navigation) require sync integration

**Key Existing Infrastructure:**
- LocalFSAdapter (`src/lib/filesystem/local-fs-adapter.ts`) - Operational
- SyncManager (`src/lib/filesystem/sync-manager.ts`) - Operational
- FSA Permissions (`src/lib/filesystem/permission-lifecycle.ts`) - Operational
- Dexie Schema v9 (`src/lib/state/dexie-db.ts`) - Operational
- FileMetadataCache (`src/lib/filesystem/file-metadata-cache.ts`) - Operational

---

### Task Specification

Generate a comprehensive technical specification document for Epic 38 that covers all 12 stories:

#### Stories Requiring Technical Specification

| Story ID | Name | Effort | Priority | Team |
|----------|------|--------|----------|------|
| 38-1 | Reverse Sync Infrastructure | 3 days | P0 | Team B |
| 38-2 | Project Initialization Workflow | 2 days | P0 | Team A |
| 38-3 | Space Management Service | 2 days | P1 | Team B |
| 38-4 | Terminal Sync Integration | 1 day | P1 | Team B |
| 38-5 | Editor Auto-Save Integration | 2 days | P1 | Team A |
| 38-6 | Sync Status UI Components | 2 days | P0 | Team A |
| 38-7 | File Tree Sync Integration | 3 days | P0 | Team A |
| 38-8 | Properties Panel Component | 2 days | P1 | Team A |
| 38-9 | Navigation Sync Enhancements | 1 day | P2 | Team A |
| 38-10 | State Management Cleanup | 1 day | P0 | Team A |
| 38-11 | Sync Event Bus Implementation | 2 days | P0 | Team B |
| 38-12 | Integration Testing | 3 days | P1 | Both |

#### Technical Specification Requirements

For each story, the technical specification must include:

1. **Interface Definitions**
   - TypeScript interfaces for all public APIs
   - Method signatures with parameter and return types
   - Event types and payloads for EventBus

2. **Component Architecture**
   - React component hierarchy and props
   - State management integration points
   - Store slices and actions required

3. **Integration Points**
   - Dependencies on existing services
   - Data flow diagrams
   - API contracts between components

4. **Implementation Details**
   - Pseudo-code patterns for complex logic
   - File locations for new components
   - Import patterns following project conventions

5. **Testing Strategy**
   - Unit test patterns
   - Mock strategies for dependencies
   - Integration test approach

---

### Acceptance Criteria

#### Overall Epic Specification

- [ ] Technical specification document covers all 12 stories
- [ ] Interface definitions follow TypeScript conventions (interfaces, not type aliases)
- [ ] Architecture diagrams show data flow and component relationships
- [ ] Integration points documented with existing codebase components
- [ ] Performance considerations identified for each feature
- [ ] Error handling patterns specified for all operations

#### Story-Level Specifications

**Story 38-1 (Reverse Sync Infrastructure):**
- [ ] File watcher interface (WebContainer + polling fallback)
- [ ] Conflict detection algorithm specification
- [ ] Merge strategy implementation patterns
- [ ] Sync queue management for reverse direction

**Story 38-2 (Project Initialization Workflow):**
- [ ] Directory picker integration pattern
- [ ] Permission request workflow specification
- [ ] Sync session initialization sequence
- [ ] Error handling for permission denial

**Story 38-11 (Sync Event Bus Implementation):**
- [ ] EventBus singleton design
- [ ] Event type enumeration with payloads
- [ ] Subscription/unsubscription patterns
- [ ] Error handling for event delivery failures

---

### Constraints

1. **Technology Constraints:**
   - Must use File System Access API for local file operations
   - Must use WebContainer API for sandbox file operations
   - Must use TanStack Store for state management
   - Must use Dexie.js for IndexedDB persistence
   - Must follow existing 8-bit design system

2. **Architecture Constraints:**
   - Bidirectional sync must maintain data integrity
   - Conflict resolution must be deterministic
   - EventBus must handle out-of-order events gracefully
   - All components must be mobile-responsive

3. **Performance Constraints:**
   - Sync operations complete within 500ms for files <1MB
   - Auto-save triggers within 2 seconds of user inactivity
   - File tree updates within 100ms of sync events
   - No UI blocking during sync operations

4. **Code Quality Constraints:**
   - All interfaces defined as TypeScript interfaces
   - All strings via i18n (t() hook)
   - All styles via design tokens (CSS custom properties)
   - Test coverage ≥90% for infrastructure, ≥85% for UI

---

### Current Workflow Status

**From `bmm-workflow-status.yaml`:**
- **Phase:** Implementation
- **Active Epics:** 13 (DONE), 21 (IN_PROGRESS), 22 (IN_PROGRESS), 23 (IN_PROGRESS)
- **Next Priority:** Epic 22 (Production Hardening) - P0

**From `sprint-status.yaml`:**
- Sprint 22 in progress (Production Hardening)
- Stories 22-2 through 22-8 assigned
- Ralph Loop validation in progress

---

### References

#### Course Correction Proposal
- `_bmad-output/course-corrections/project-management-system-enhancement-2025-12-31.md`

#### Architecture Documentation
- `_bmad-output/project-planning-artifacts/architecture.md`
- `docs/2025-12-28/version-2/technical-architecture-document.md`

#### Existing Infrastructure
- `src/lib/filesystem/local-fs-adapter.ts`
- `src/lib/filesystem/sync-manager.ts`
- `src/lib/filesystem/permission-lifecycle.ts`
- `src/lib/state/dexie-db.ts`
- `src/lib/state/file-sync-status-store.ts`

#### State Management
- `_bmad-output/state-management-audit-p1.10-2025-12-26.md`
- `src/lib/state/ide-store.ts`
- `src/lib/state/navigation-store.ts`

#### Tech Stack Documentation
- [WebContainer API Documentation](https://developer.stackblitz.com/platform/api/webcontainer-api)
- [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)
- [TanStack Store](https://tanstack.com/store)
- [Dexie.js](https://dexie.org)

#### Related Epics
- Epic 3 (DONE): Local-First File Magic - Foundation for current sync
- Epic 24 (DONE): Performance & UX - Dexie v9 schema, incremental sync

---

### Output Location

**_bmad-output/tech-specs/epic-38-tech-spec-2025-12-31.md**

### Document Structure

The technical specification document should follow this structure:

```
1. Executive Summary
2. Architecture Overview
   2.1 Current State Analysis
   2.2 Proposed Architecture
   2.3 Data Flow Diagrams
3. Story Specifications
   3.1 Reverse Sync Infrastructure (38-1)
   3.2 Project Initialization Workflow (38-2)
   3.3 Space Management Service (38-3)
   3.4 Terminal Sync Integration (38-4)
   3.5 Editor Auto-Save Integration (38-5)
   3.6 Sync Status UI Components (38-6)
   3.7 File Tree Sync Integration (38-7)
   3.8 Properties Panel Component (38-8)
   3.9 Navigation Sync Enhancements (38-9)
   3.10 State Management Cleanup (38-10)
   3.11 Sync Event Bus Implementation (38-11)
   3.12 Integration Testing (38-12)
4. Interface Definitions
5. Component Specifications
6. Integration Points
7. Testing Strategy
8. Performance Considerations
9. Risk Assessment
10. Implementation Guidelines
```

---

### Return via Report to @bmad-core-bmad-master

When complete, provide a completion report with:

**Artifacts Created:**
- `_bmad-output/tech-specs/epic-38-tech-spec-2025-12-31.md`

**Workflow Status Updates:**
- None (specification only, no story status changes)

**Next Action:**
- Handoff to @bmad-bmm-pm for sprint planning

---

*Document Version: 1.0*
*Created: 2025-12-31T11:25:00+07:00*
*Handoff Version: 1.0*
