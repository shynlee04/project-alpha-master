# GOVERNANCE INDEX

> **Purpose:** Master index of all governance documents with status tracking, cross-references, and validation history.  
> **Last Audit:** 2025-12-21T20:00:00+07:00  
> **Next Scheduled Audit:** 2025-12-28

---

## Quick Legend

| Status | Meaning |
|--------|---------|
| ✅ CURRENT | Validated and reflects source of truth |
| ⚠️ NEEDS_REVIEW | May contain outdated information |
| ❌ DEPRECATED | Superseded, marked for archival |
| 🔄 IN_PROGRESS | Being actively updated |

---

## 1. Architecture Documents

| ID | File | Status | Last Validated | Depends On | Notes |
|----|------|--------|----------------|------------|-------|
| ARCH-001 | [core-architectural-decisions](architecture/core-architectural-decisions.md) | ⚠️ NEEDS_REVIEW | Unknown | - | May predate Epic 27 changes |
| ARCH-002 | [project-structure-boundaries](architecture/project-structure-boundaries.md) | ⚠️ NEEDS_REVIEW | Unknown | - | Verify against actual structure |
| ARCH-003 | [implementation-patterns-consistency-rules](architecture/implementation-patterns-consistency-rules.md) | ⚠️ NEEDS_REVIEW | Unknown | - | - |
| ARCH-004 | [via-gent-foundational-architectural-slice](architecture/via-gent-foundational-architectural-slice-project-alpha.md) | ⚠️ NEEDS_REVIEW | Unknown | - | Core vision doc |
| ARCH-005 | [workspace-context-layer-epic-3-hotfix](architecture/workspace-context-layer-epic-3-hotfix.md) | ⚠️ NEEDS_REVIEW | Unknown | EPIC-03 | May reference old state patterns |
| ARCH-006 | [workspaceorchestrator-layer](architecture/workspaceorchestrator-layer.md) | ⚠️ NEEDS_REVIEW | Unknown | ARCH-005 | - |
| ARCH-010 | [event-bus-architecture-epic-10](architecture/event-bus-architecture-epic-10.md) | ✅ CURRENT | 2025-12-21 | EPIC-10 | Infrastructure exists |
| ARCH-012 | [agent-tool-facade-layer-epic-12](architecture/agent-tool-facade-layer-epic-12.md) | ⚠️ NEEDS_REVIEW | Unknown | EPIC-12 | AI tool layer design |
| ARCH-013 | [terminal-integration-epic-13-course-correction-v5](architecture/terminal-integration-epic-13-course-correction-v5.md) | ⚠️ NEEDS_REVIEW | Unknown | EPIC-13 | v5 may be outdated (now v7) |
| ARCH-CQ3 | [code-quality-standards-course-correction-v3](architecture/code-quality-standards-course-correction-v3.md) | ❌ DEPRECATED | - | - | Superseded by v7 |
| ARCH-045 | [project-fugu-enhancement-layer-epic-45](architecture/project-fugu-enhancement-layer-epic-45.md) | ⚠️ NEEDS_REVIEW | Unknown | EPIC-45 | Future enhancement |

---

## 2. Epics - Status Summary

| ID | Epic | Status | Stories Done | Depends On | Notes |
|----|------|--------|--------------|------------|-------|
| EPIC-01 | Project Foundation | ✅ DONE | All | - | Core complete |
| EPIC-02 | WebContainers | ✅ DONE | All | EPIC-01 | Core complete |
| EPIC-03 | File System Access | ✅ DONE | All | EPIC-01 | 2 versions (base + reopened) |
| EPIC-04 | IDE Components | ✅ DONE | All | EPIC-03 | Core complete |
| EPIC-05 | Persistence Layer | ❌ SUPERSEDED | - | EPIC-04 | Replaced by EPIC-27 |
| EPIC-06 | AI Agent Integration | 🔄 BACKLOG | 0 | EPIC-25 | Blocked by AI Foundation |
| EPIC-07 | Git Integration | 🔄 BACKLOG | 0 | FS Abstraction | 2 versions (base + extended) |
| EPIC-08 | Validation & Polish | 🔄 BACKLOG | 0 | - | - |
| EPIC-09 | Multi-Root Workspace | 🔄 POST-MVP | 0 | Many | Major future enhancement |
| EPIC-10 | Sync Architecture | 🔄 PARTIAL | 3/7 | EPIC-03 | Event bus exists, wiring incomplete |
| EPIC-11 | Code Splitting | 🔄 BACKLOG | 0 | EPIC-10 | Proposed |
| EPIC-12 | Agent Tool Interface | 🔄 BACKLOG | 0 | EPIC-25 | Blocked by AI Foundation |
| EPIC-13 | Terminal & Sync Stability | 🔄 PARTIAL | 2/6 | EPIC-03 | Story 13-1 done |
| EPIC-14-20 | Various Enhancements | 🔄 BACKLOG | 0 | - | Lower priority |
| EPIC-21 | Localization | 🔄 IN-PROGRESS | 4/8 | - | Platform A |
| EPIC-22 | Production Hardening | 🔄 IN-PROGRESS | 4/8 | - | Platform A |
| EPIC-23 | UX/UI Modernization | 🔄 IN-PROGRESS | 5/8 | - | Platform B |
| EPIC-24 | Smart Dependency Sync | 🔄 BLOCKED | 0 | EPIC-27 | Waiting for Epic 27 completion |
| EPIC-25 | AI Foundation Sprint | 🔄 UNBLOCKED | 0 | EPIC-27 | **Unblocked** - Epic 27 integration complete |
| EPIC-26 | Agent Dashboard | 🔄 BLOCKED | 0 | EPIC-25 | Waiting for AI Foundation |
| EPIC-27 | State Architecture | 🔄 IN_PROGRESS | 4/7 | - | Story 27-I in progress - terminal/sync fixes |
| EPIC-45 | Project Fugu | 🔄 FUTURE | 0 | - | Enhancement layer |

---

## 3. Context Poisoning Risks

| Risk | Document(s) | Impact | Action Required |
|------|-------------|--------|-----------------|
| **HIGH** | course-correction-v3.md | References stale patterns | Archive or update header |
| **HIGH** | epic-3 duplicate files | Confusion about which is current | Consolidate |
| **HIGH** | epic-7 duplicate files | Confusion about which is current | Consolidate |
| **MEDIUM** | Architecture docs unknown validation | May reference idb, old patterns | Audit and update |
| **MEDIUM** | Sprint artifacts context XMLs | May contain stale code | Validate before use |
| **LOW** | Analysis reports (same day) | May have conflicting recommendations | Cross-reference |

---

## 4. Epic Dependency Graph

```
FOUNDATION (Complete):
Epic 1 → Epic 2 → Epic 3 → Epic 4

STATE STABILIZATION (Current):
Epic 5 (Superseded) → Epic 27 (Current)
                      ├── 27-1 ✅
                      ├── 27-1b ✅
                      ├── 27-1c → Epic 24
                      └── 27-2 → Epic 10

AI PATH (Blocked):
Epic 27 → Epic 25 → Epic 6 → Epic 26
                  → Epic 12

PARALLEL TRACKS:
Epic 21 (Localization) - Independent
Epic 22 (Production) - Independent
Epic 23 (UX/UI) - Independent
```

---

## 5. Standards Validation

| Standard | Status | Last Checked | Notes |
|----------|--------|--------------|-------|
| tech-stack.md | ✅ CURRENT | 2025-12-21 | Updated with Zustand/Dexie/LangGraph |
| coding-style.md | ⚠️ NEEDS_REVIEW | Unknown | May need AI patterns |
| components.md | ⚠️ NEEDS_REVIEW | Unknown | - |
| conventions.md | ⚠️ NEEDS_REVIEW | Unknown | - |
| mcp-research.md | ⚠️ NEEDS_REVIEW | Unknown | - |

---

## 6. Recommended Actions

### Immediate (Before 27-1c):
1. Add AI-observable JSDoc to `ide-store.ts`
2. Design taskContext table in dexie-db.ts v2
3. Update ARCH-005, ARCH-006 with Zustand patterns

### Short-term (This Week):
4. Consolidate Epic 3 duplicate files
5. Consolidate Epic 7 duplicate files
6. Archive course-correction-v3.md
7. Validate all ARCH-* docs

### Ongoing:
8. Add YAML frontmatter to all docs
9. Weekly validation cycle
10. JSDOC `@governance` annotations in code
