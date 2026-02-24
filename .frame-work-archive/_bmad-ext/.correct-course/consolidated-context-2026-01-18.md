# CONSOLIDATED CONTEXT: Storage Gateway Architecture & Desktop FSA Migration

**Created**: 2026-01-18
**Status**: APPROVED for Epic Planning
**Version**: 1.0.0

---

## 1. Executive Summary

This document consolidates all research, findings, and architectural decisions for the Storage Gateway Foundation and Desktop FSA Migration project. It serves as the single source of truth for Epic planning.

### Key Findings

| Finding | Source | Status |
|---------|--------|--------|
| Paper 1 (research-paper-01) is VALID | Independent validation | ✅ CONFIRMED |
| Paper 2 (research-paper-02) is INVALID | Gap analysis | ❌ HALLUCINATED |
| 6 direct `db.notes.*` calls bypass StorageGateway | Codebase grep | ⚠️ BLOCKING |
| Desktop should use FSA, DexieDB = cache only | User confirmation | ✅ CONFIRMED |
| Mobile uses DexieDB (no FSA support) | Browser capability | ✅ CONFIRMED |

---

## 2. Architectural Principles

### 2.1 Storage Architecture (Finalized)

```
┌─────────────────────────────────────────────────────────────────┐
│                    STORAGE GATEWAY ABSTRACTION                   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              StorageGateway Interface                    │    │
│  │         read(), write(), list(), watch()                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│          ┌────────────────┴────────────────┐                    │
│          ▼                                  ▼                    │
│  ┌─────────────────┐              ┌─────────────────┐           │
│  │  FSAGateway     │              │  IDBGateway     │           │
│  │  (Desktop)      │              │  (Mobile)       │           │
│  └─────────────────┘              └─────────────────┘           │
│                                                                  │
│  TOTALLY DIFFERENT MECHANISMS - BOTH IMPLEMENT SAME INTERFACE   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Platform Rules

| Platform | Primary Storage | Cache | Route Guard | Notes |
|----------|-----------------|-------|-------------|-------|
| **Desktop** | FSA | DexieDB | N/A | Files in `/project/notes/*.md` |
| **Mobile** | DexieDB | N/A | IDE blocked | No FSA support |
| **Tablet** | DexieDB | N/A | IDE blocked | Touch interface |

### 2.3 DexieDB Role Definition

| Usage | Desktop | Mobile | Notes |
|-------|---------|--------|-------|
| **File Storage** | ❌ NEVER | ✅ PRIMARY | Mobile has no choice |
| **Reactive Cache** | ✅ YES | ❌ NO | UI state, not files |
| **Project Metadata** | ✅ YES | ✅ YES | Project config, bindings |
| **User Preferences** | ✅ YES | ✅ YES | Settings, API keys |

---

## 3. Current State Analysis

### 3.1 Files with Direct Dexie Calls (Violations)

```
CRITICAL VIOLATIONS (Bypass StorageGateway):
src/lib/notes/slices/note-crud-slice.ts:167    → db.notes.add()
src/lib/notes/slices/note-crud-slice.ts:229    → db.notes.update()
src/lib/notes/slices/note-crud-slice.ts:294    → db.notes.delete()
src/lib/notes/slices/note-metadata-slice.ts:46 → db.notes.update()
src/lib/notes/slices/note-metadata-slice.ts:88 → db.notes.update()
src/lib/notes/slices/note-indexing-slice.ts:61 → db.notes.update()

Total: 6 violations blocking FSA migration
```

### 3.2 Storage Gateway Implementations

| Gateway | Location | Status | Notes |
|---------|----------|--------|-------|
| **FSAGateway** | `src/infrastructure/filesystem/fsa-gateway.ts` | ✅ EXISTS | Needs verification |
| **IDBGateway** | `src/infrastructure/filesystem/idb-gateway.ts` | ✅ EXISTS | ARC-B03 implementation |
| **StorageGatewayFactory** | `src/infrastructure/filesystem/storage-gateway-factory.ts` | ✅ EXISTS | Routes correctly |

### 3.3 Platform Detection

| Detection Point | Location | Status |
|-----------------|----------|--------|
| **PlatformContract** | `src/infrastructure/filesystem/platform-contract.ts` | ✅ EXISTS |
| **canAccessFSA** | PlatformContract property | ✅ USED |

---

## 4. Problem Statement

### 4.1 The Core Problem

```
CURRENT STATE (BROKEN):
┌─────────────────────────────────────────────────────────────┐
│ Desktop User Journey                                         │
│   1. Creates note in Notes workspace                         │
│   2. Note stored DIRECTLY in DexieDB (bypasses gateway)      │
│   3. File NOT saved to FSA folder                            │
│   4. Agent tools cannot access note                          │
│   5. User confused: "Where are my files?"                    │
└─────────────────────────────────────────────────────────────┘

TARGET STATE (CORRECT):
┌─────────────────────────────────────────────────────────────┐
│ Desktop User Journey                                         │
│   1. Creates note in Notes workspace                         │
│   2. Note saved to FSA folder via FSAGateway                 │
│   3. DexieDB updated for reactive cache only                 │
│   4. Agent tools can access note via terminal                │
│   5. User sees: "Saved to /project/notes/"                   │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Why Direct Dexie Calls Are Wrong

| Issue | Impact | Severity |
|-------|--------|----------|
| **Bypasses abstraction** | Migration to FSA is harder | 🔴 CRITICAL |
| **No file on disk** | Agents cannot access notes | 🔴 CRITICAL |
| **User confusion** | Mental model broken | 🟡 HIGH |
| **Duplicate storage** | Same data in 2 places | 🟡 MEDIUM |

---

## 5. Research Findings

### 5.1 Storage Capabilities Comparison

| Capability | IndexedDB (DexieDB) | FSA (File System Access) |
|------------|---------------------|--------------------------|
| **Quota** | ~60% of disk (shared) | **Unlimited** |
| **Mobile Support** | ✅ Full | ❌ Blocked |
| **Desktop Support** | ✅ Full | ✅ Full |
| **File Watching** | ❌ Polling only | ✅ Native |
| **Hot Reactivity** | ❌ ~2 second delay | ✅ Real-time |
| **Rich Media Storage** | ⚠️ Limited (50MB-1GB) | ✅ Unlimited |
| **Browser Eviction Risk** | ⚠️ YES | ❌ NO |
| **Agent File Operations** | ❌ No native file ops | ✅ Native |

### 5.2 Rich Media Reality (Deferred Research)

| Content Type | IndexedDB | FSA | Status |
|--------------|-----------|-----|--------|
| **Markdown** | ✅ Works | ✅ Works | OK |
| **Images (<1MB)** | ✅ Works | ✅ Works | OK |
| **Images (>10MB)** | ⚠️ Quota risk | ✅ Safe | DEFERRED |
| **AI-generated media** | ❌ NOT sustainable | ✅ Safe | DEFERRED |
| **Video** | ❌ NOT sustainable | ✅ Safe | DEFERRED |

> **NOTE**: Rich media research is DEFERRED. Not blocking current epic.

---

## 6. User Agreements (Must Sustain)

### Agreement #1: Desktop Architecture (CONFIRMED 2026-01-18)

```
✅ Desktop = FSA for all workspaces (IDE, Notes, Knowledge, Study)
✅ DexieDB = reactive cache only, NOT primary storage
✅ DeviceType routing: 'desktop' → FSA, 'mobile' → DexieDB
✅ Desktop users should NOT point to browserDB for file storage
```

### Agreement #2: Mobile Architecture (CONFIRMED)

```
✅ Mobile = DexieDB (no FSA support, no choice)
✅ IDE = BLOCKED (route guard prevents access)
✅ Knowledge/RAG = **DEFER** - Post-MVP (archived to post-mvp-2026-01-18)
✅ Study = **DEFER** - Post-MVP (archived to post-mvp-2026-01-18)
```

---

## 7. Deferred Workspaces (Post-MVP)

### Knowledge Workspace **DEFER**
- **Status**: Archived to `_bmad-ext/.archive/post-mvp-2026-01-18/knowledge/`
- **Files**: 56 TypeScript files archived
- **Features Deferred**:
  - RAG pipeline and vector indexing
  - PDF/URL/GitHub source import
  - Knowledge graph and organization
  - AI synthesis and recommendations
  - Flashcard generation

### Study Workspace **DEFER**
- **Status**: Archived to `_bmad-ext/.archive/post-mvp-2026-01-18/study/`
- **Files**: 8 TypeScript files archived
- **Features Deferred**:
  - Spaced repetition (SRS)
  - Quiz generation
  - Progress tracking

### Future Epic (After MVP)
```
Epic CC-KNOWLEDGE-STUDY: Knowledge + Study Workspaces
- Restore archived files
- Implement FSA storage for knowledge sources
- Build RAG pipeline with vector storage
- Create study flashcards and quizzes
- Integrate with Notes workspace
```

---

## 8. Epic Definitions

### Epic CC-STORAGE-GATEWAY: Storage Gateway Foundation

**Goal**: Fix abstraction layer to enable Desktop FSA migration

**Stories**:
1. Gateway Abstraction - Replace direct calls
2. Clear Platform Routing
3. Migration Path Documentation

**Success Criteria**:
- 0 direct `db.notes.*` calls in note slices
- Desktop → FSAGateway, Mobile → IDBGateway
- Written migration path document

**Team Assignment**: Team A (can be independent)

---

### Epic CC-DESKTOP-FSA: Desktop FSA Migration

**Goal**: Migrate desktop notes from DexieDB to FSA

**Stories** (to be defined):
1. Note file format migration
2. DexieDB → FSA sync
3. Agent tool integration
4. User experience updates

**Success Criteria**:
- All notes stored in FSA folder
- DexieDB only contains cache data
- Agents can read/write notes

**Team Assignment**: Team B (depends on Epic 1)

---

## 8. Validation Checklist

### Pre-Epic Validation

- [ ] Paper 1 validated, Paper 2 rejected
- [ ] Direct Dexie calls identified (6 violations)
- [ ] StorageGateway implementations verified
- [ ] Platform detection working
- [ ] User agreements confirmed

### Sprint 1 Validation

- [ ] Story 1: 6 direct calls replaced with gateway
- [ ] Story 2: Platform routing verified
- [ ] Story 3: Migration path documented
- [ ] No regressions in mobile functionality

---

## 9. Known Risks

| Risk | Mitigation | Owner |
|------|------------|-------|
| Legacy code dependencies on direct Dexie calls | Scan all usages before changes | Architect |
| Race condition between FSA and DexieDB | Add sync layer | Architect |
| User experience confusion during migration | Add UI indicators | Designer |
| Mobile regression | Add integration tests | QA |

---

## 10. References

### Research Papers
- `_bmad-ext/.architecture-investigation/research-paper-01-independent-findings-2026-01-18.md`
- `_bmad-ext/.architecture-investigation/research-paper-02-combined-synthesis-2026-01-18.md`

### Architecture Documents
- `src/infrastructure/filesystem/platform-contract.ts`
- `src/infrastructure/filesystem/storage-gateway-factory.ts`
- `src/infrastructure/filesystem/fsa-gateway.ts`
- `src/infrastructure/filesystem/idb-gateway.ts`

### Workflows
- `_bmad-ext/modules/implementation/workflows/story-cycle/workflow.md`
- `_bmad-ext/modules/sprint-planning-wrapper/workflows/sprint-planning-enhanced/workflow.md`

---

## 11. Appendices

### Appendix A: Direct Dexie Call Locations

| File | Line | Method | Should Use |
|------|------|--------|------------|
| `note-crud-slice.ts` | 167 | `db.notes.add()` | gateway.write() |
| `note-crud-slice.ts` | 229 | `db.notes.update()` | gateway.write() |
| `note-crud-slice.ts` | 294 | `db.notes.delete()` | gateway.delete() |
| `note-metadata-slice.ts` | 46 | `db.notes.update()` | gateway.write() |
| `note-metadata-slice.ts` | 88 | `db.notes.update()` | gateway.write() |
| `note-indexing-slice.ts` | 61 | `db.notes.update()` | gateway.write() |

### Appendix B: StorageGateway Interface

```typescript
interface StorageGateway {
  // Read operations
  read(path: string): Promise<Uint8Array>;
  exists(path: string): Promise<boolean>;

  // Write operations
  write(path: string, data: Uint8Array): Promise<void>;
  delete(path: string): Promise<void>;

  // Directory operations
  list(path: string): Promise<FileEntry[]>;
  mkdir(path: string): Promise<void>;

  // Watch operations (FSA only, IDB uses polling)
  watch(path: string, callback: FileChangeCallback): () => void;
}
```

### Appendix C: Platform Contract Interface

```typescript
interface PlatformContract {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  storageType: 'fsa' | 'indexeddb';
  canAccessFSA: boolean;
  canWatchFiles: boolean;
  canRunTerminal: boolean;
  canDoAgenticCoding: boolean;
  canAccessIDE: boolean;
}
```

---

**Document Version**: 1.0.0
**Last Updated**: 2026-01-18
**Next Review**: Before Sprint 1 kickoff
