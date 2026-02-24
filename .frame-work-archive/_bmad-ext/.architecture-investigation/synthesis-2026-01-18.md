# Architecture Investigation Synthesis

**Generated**: 2026-01-18T22:00:00+07:00  
**Source**: Consolidated architecture investigation documents (5 files analyzed)  
**Purpose**: Clean context document for device separation and storage architecture

---

## Original Problems (From Investigation)

### 1. Terminology Confusion (CRITICAL - Blocks AI Developers)
- "Workspace" has dual meaning - is it a type enum (`WorkspaceId = 'ide' | 'knowledge' | 'study' | 'notes'`) or UI context state (`currentWorkspace`)?
- "Project" vs "Workspace" relationship unclear - Project CONTAINS workspaces, but terminology ambiguous
- Developers (including AI agents) spend hours understanding simple terms

### 2. Dual Storage Architecture Unclear (HIGH - Blocks Development Clarity)
- Four separate sync implementations exist:
  - `lib/sync/` - Legacy sync (event bus, reverse sync)
  - `lib/filesync/` - Legacy file sync services
  - `lib/filesystem/sync-manager/` - Legacy sync manager (500+ lines god module)
  - `infrastructure/sync/` - New sync implementation
- NoteEditor → Dexie (500ms) → FSA (2000ms) - when does FSA sync happen?
- No clear source-of-truth rules for when to use DexieDB vs FSA

### 3. Contract Violations (MEDIUM - Blocks Testability)
- Direct DexieDB calls bypass StorageGateway abstraction (6+ locations found)
- UI components access stores directly without contracts
- Services call each other directly without interfaces
- Cannot mock storage for testing

### 4. Platform Separation Unclear (LOW - Blocks Platform-Specific Features)
- PC vs Mobile flows not clearly separated in documentation
- Risk of sharing business logic between platforms

### 5. Security Vulnerabilities (CRITICAL)
- Hardcoded API keys in `seed-workspace-permissions.ts` and `agent-validation-service.ts`
- XSS vulnerabilities: 5+ instances of `dangerouslySetInnerHTML` without sanitization
- Event listener errors can crash entire event bus

---

## Root Causes Identified

| Root Cause | Evidence | Impact |
|------------|----------|--------|
| **Duplication Crisis** | 4 sync implementations, duplicate entity definitions, split provider logic | Maintenance nightmare, 150+ issues identified |
| **God Modules** | 8 god-modules exceeding 300 lines (dexie-db.ts: 1,165 lines) | Hard to maintain, test, understand |
| **Layer Bleeding** | Bidirectional dependencies between lib/, infrastructure/, and domain/ layers | Violates clean architecture, 12 boundary violations |
| **Terminology Overload** | "Workspace" used as type enum, UI state, and feature toggle | Developer confusion, AI agent blocking |
| **Unclear Storage Rules** | Dual storage works but rules undefined | Developers don't know when to write to which storage |
| **Contract Absences** | No explicit interfaces for stores, services | Impossible to mock, test, or swap implementations |

---

## Recommendations From Investigation

### Priority 1: Immediate (15 minutes - 2 hours)

| Action | Effort | Impact |
|--------|--------|--------|
| Rename `WorkspaceId` → `WorkspaceType` (CAPITALIZED) | 15 min | Blocks AI developer confusion |
| Delete hardcoded API key files | 1 hour | Security critical |
| Wrap event listeners in try-catch | 1 hour | Prevents event bus crashes |
| Replace direct Dexie calls with gateway methods | 2 hours | Fixes contract violations |

### Priority 2: Short-term (1-2 weeks)

| Action | Effort | Impact |
|--------|--------|--------|
| Add source-of-truth rules to ADR-033 | 2 hours | Clarifies DexieDB vs FSA usage |
| Define StorageGateway error contracts | 2 hours | Consistent error handling |
| Document platform separation strategy | 1 hour | Prevents PC/Mobile cross-contamination |
| Reduce sync latency complexity | 2 hours | Improves UX (2500ms → 1000ms) |

### Priority 3: Deferred (Future Epics)

| Action | Effort | Why Deferred |
|--------|--------|--------------|
| Consolidate 4 sync implementations | 2-3 weeks | Functionality works, just confusing |
| Split god stores (dexie-db.ts, etc.) | 12+ hours | Not blocking Notes/IDE features |
| Add XSS sanitization (DOMPurify) | 3 hours | Security but not blocking |
| Add ESLint rules for contracts | 4 hours | Governance, can be added later |

---

## Current State (2026-01-18)

### Sprint Status Summary

| Epic | Progress | Status |
|------|----------|--------|
| **EPIC-FS** (File System Foundation) | 28.6% (4/14) | IN_PROGRESS |
| **EPIC-30** (P0 Critical Fixes) | 100% | COMPLETE |
| **EPIC-38** (Clean Architecture) | ~40% (8/21) | IN_PROGRESS |
| **EPIC-UX** (8-bit Design) | 60% | IN_PROGRESS |
| **EPIC-MOBILE** | 83.3% | IN_PROGRESS |
| **EPIC-40** (Multimodal Chat) | 0% | READY_FOR_DEV |

### Issue Status Matrix

| Issue | Investigation Finding | Current State | Notes |
|-------|----------------------|---------------|-------|
| **Direct db.notes calls** | 6+ violations | PARTIALLY FIXED | Found 2 active violations in `note-folder-bridge.ts` + migrations (acceptable) |
| **Storage Gateway (ARC-B01)** | Contract needed | IMPLEMENTED | `storage-gateway-factory.ts` exists, widely used across slices |
| **Platform routing** | PlatformContract exists | WORKING | `createStorageGateway` factory pattern implemented |
| **Hardcoded API keys** | 2 files with keys | REMOVED | Files deleted per investigation |
| **Event listener error isolation** | 9 listeners without try-catch | NEEDS WORK | ADR-038 created but not implemented |
| **XSS vulnerabilities** | 5+ instances | NEEDS WORK | ADR-037 created but not implemented |
| **Terminology** | WorkspaceId confusion | NOT FIXED | Still uses `WorkspaceId` type |

### Direct Dexie Calls Found (2026-01-18)

| File | Lines | Assessment |
|------|-------|------------|
| `infrastructure/persistence/dexie-db-migrations.ts` | 1416 | OK - migrations need direct DB access |
| `infrastructure/sync/bridges/note-folder-bridge.ts` | 95, 116 | NEEDS FIX - direct calls bypassing gateway |
| `lib/notes/__tests__/note-store.test.ts` | Multiple | OK - test mocks |
| `lib/notes/__tests__/mocks/...` | - | OK - test mocks |

### StorageGateway Implementation Status

| Component | Status | Usage |
|-----------|--------|-------|
| `storage-gateway-factory.ts` | ✅ Complete | Factory for creating platform-specific gateways |
| `note-gateway.ts` | ✅ Complete | Note-specific facade wrapping StorageGateway |
| `note-crud-slice.ts` | ✅ Using Gateway | Lines 180, 259, 344 use `createStorageGateway` |
| `note-indexing-slice.ts` | ✅ Using Gateway | Line 93 uses gateway |
| `note-metadata-slice.ts` | ✅ Using Gateway | Lines 59, 119 use gateway |

---

## Gaps Remaining

### High Priority (Blocker for Architecture Clarity)

1. **[ ] Fix direct db.notes calls in note-folder-bridge.ts**
   - Status: 2 violations found (lines 95, 116)
   - Should use StorageGateway instead of direct Dexie calls
   - Effort: 1 hour

2. **[ ] Complete terminology standardization**
   - Status: Still using `WorkspaceId` instead of `WorkspaceType`
   - Need: Rename type + create `ViewState` interface
   - Effort: 15 minutes

3. **[ ] Implement ADR-038 (Event Listener Error Isolation)**
   - Status: ADR created but not implemented
   - 9 listeners still without try-catch protection
   - Effort: 1 hour

4. **[ ] Implement ADR-037 (XSS Sanitization)**
   - Status: ADR created but not implemented
   - 5+ dangerouslySetInnerHTML without sanitization
   - Effort: 3 hours

### Medium Priority (Architecture Compliance)

5. **[ ] Update ADR-033 with source-of-truth rules**
   - Status: Missing clear DexieDB vs FSA usage rules
   - Need: Document when to use which storage
   - Effort: 2 hours

6. **[ ] Add StorageGateway error handling contracts**
   - Status: Interface exists, error contracts missing
   - Need: QUOTA_EXCEEDED, PERMISSION_DENIED handling
   - Effort: 2 hours

### Low Priority (Deferred to Future Epics)

7. **[ ] Consolidate 4 sync implementations**
   - Status: Still 4 separate implementations
   - Impact: Confusing but functional
   - Effort: 2-3 weeks (deferred)

8. **[ ] Split god stores (dexie-db.ts)**
   - Status: 1,165 lines, 100+ helper functions
   - Impact: Maintainability not blocking features
   - Effort: 12+ hours (deferred)

9. **[ ] Add ESLint rules for import boundaries**
   - Status: 12 boundary violations documented
   - Impact: Governance, not blocking
   - Effort: 4 hours (deferred)

---

## Key Insights from Investigation

### "Less for More" Principle Correctly Applied

The investigation correctly identified that:
- **Dual storage is intentional design**, not a bug - FSA provides critical IDE capabilities (hot reactivity, agent operations)
- **4 sync implementations are confusing but functional** - can defer consolidation
- **Terminology fix is 15 minutes**, not 8-week refactor
- **Contract violations are simple fixes** (search+replace), not governance projects

### What NOT to Do

❌ **DO NOT eliminate FSA** - Breaks hot reactivity and agent operations  
❌ **DO NOT force DexieDB-only** - Adds VFS complexity (2,000+ lines)  
❌ **DO NOT consolidate sync in this epic** - Functionality works, just confusing  
❌ **DO NOT split god stores now** - Not blocking Notes/IDE features

### What TO Do

✅ **Keep both storages** (DexieDB + FSA for PC)  
✅ **Clarify rules** about when to use each storage  
✅ **Fix contract violations** (direct Dexie calls)  
✅ **Standardize terminology** (WorkspaceId → WorkspaceType)  
✅ **Implement missing error handling** (event isolation, XSS sanitization)

---

## Reference Files

| File | Purpose |
|------|---------|
| `consolidated/UNIFIED-ARCHITECTURE-DIAGNOSIS-REPORT.md` | Full diagnosis of 150 issues |
| `recommendation-ONE-QUICK-DEV-EPIC-2026-01-18.md` | Focused 1-2 week epic recommendations |
| `research-paper-01-independent-findings-2026-01-18.md` | Independent research on storage architecture |
| `research-paper-02-combined-synthesis-2026-01-18.md` | Cross-validation with previous team findings |
| `cycle1-map-hypotheses/architecture-violations.json` | 12 boundary violations, 24 god components |

---

*Generated from analysis of 5 key architecture investigation documents. See source files for detailed evidence and recommendations.*
