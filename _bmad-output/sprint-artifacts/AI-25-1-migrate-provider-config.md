# Story: Migrate Provider Config to Zustand (AI-25-1)

**Epic**: 25 (AI Foundation)
**Sprint**: INTEGRATED-2025-12-28
**Priority**: P0
**Status**: DRAFTED

## User Story
**AS A** User
**I WANT** my LLM provider configuration (API keys, models) to be managed by a robust state manager
**SO THAT** changes are saved immediately and reflect across the UI without reloading.

## Acceptance Criteria (AC)
- [ ] **AC-1**: `ProviderState` interface matches Target Architecture Specification (Section 3.2).
- [ ] **AC-2**: `useProviderStore` is implemented with Zustand `persist` middleware using Dexie adapter.
- [ ] **AC-3**: `CredentialVault` is integrated for secure API key storage separate from general config.
- [ ] **AC-4**: Store supports `add`, `update`, `remove`, and `setActive` actions.
- [ ] **AC-5**: Data persists to `providerConfigs` table in IndexedDB after reload.

## Technical Tasks
- [ ] **Task 1**: Create `src/lib/state/provider-store.ts` implementing the store schema.
- [ ] **Task 2**: Update `src/lib/state/dexie-db.ts` to include `providerConfigs` table (Version 4 schema).
- [ ] **Task 3**: Create `src/lib/state/dexie-storage.ts` adapter for Zustand persistence.
- [ ] **Task 4**: Clean up legacy provider configuration hooks (if any overlapping).
- [ ] **Task 5**: Write unit test for store actions.

## Research & Context
- **Architecture**: Follow `docs/2025-12-28/target-architecture.md` Section 3.
- **Security**: Ensure `CredentialVault` usage for secrets; do NOT store raw keys in Zustand/localStorage.
- **Pattern**: Use `createJSONStorage` pattern with Dexie adapter.

## Dev Notes
- **Dependencies**: `zustand`, `dexie`.
- **Encryption**: keys are stored in `credential-vault.ts` (AES-GCM), only IDs and non-sensitive config go to Zustand/Dexie.

## Dev Agent Record
**Agent:** @bmad-bmm-dev
**Session:** 2025-12-28

### Task Progress
- [x] **Task 1**: Create `src/lib/state/provider-store.ts` implementing the store schema.
- [x] **Task 2**: Update `src/lib/state/dexie-db.ts` to include `providerConfigs` table (Version 6 schema).
- [x] **Task 3**: Create `src/lib/state/dexie-storage.ts` adapter for Zustand persistence.
- [x] **Task 4**: Clean up legacy provider configuration hooks (N/A - separate task in AI-25-2/3).
- [x] **Task 5**: Write unit test for store actions.

### Files Changed
| File | Action | Description |
|------|--------|-------------|
| `src/lib/state/provider-store.ts` | Created | Implemented Zustand store with persistence and CredentialVault integration |
| `src/lib/state/dexie-db.ts` | Modified | Added `providerConfigs` table, bumped schema to v6 |
| `src/lib/state/dexie-storage.ts` | Created | Implemented `StateStorage` adapter for Dexie |
| `src/lib/state/provider-store.test.ts` | Created | Unit tests for store actions (6/6 passing) |

### Decisions Made
- **Schema Version**: Bumped to v6 to account for `providerConfigs`.
- **Persistence Strategy**: Used `createJSONStorage` with custom Dexie adapter to serialize Zustand state.
- **Credential Separation**: `CredentialVault` logic integrated into `removeProvider` action to ensure cleanup, but secrets are NOT stored in Zustand.

### Test Results
- `src/lib/state/provider-store.test.ts`: **PASS** (6 tests)

### Code Review
**Reviewer:** @code-reviewer
**Date:** 2025-12-28

#### Checklist:
- [x] All ACs verified (Store exists, persistence works, safe keys)
- [x] All tests passing (6/6 tests passed)
- [x] Architecture patterns followed (Zustand + Dexie Adapter)
- [x] No TypeScript errors
- [x] Code quality acceptable

#### Sign-off:
✅ APPROVED for merge

### Status History
| Date | Status | Agent | Notes |
|------|--------|-------|-------|
| 2025-12-28 | drafted | @bmad-bmm-sm | Created story |
| 2025-12-28 | ready-for-dev | @bmad-bmm-sm | Context created |
| 2025-12-28 | in-progress | @bmad-bmm-dev | Dev started |
| 2025-12-28 | review | @bmad-bmm-dev | Dev complete |
| 2025-12-28 | done | @code-reviewer | Approved |

