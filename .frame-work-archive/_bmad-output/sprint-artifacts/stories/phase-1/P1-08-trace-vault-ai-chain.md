---
story_key: "P1-08-trace-vault-ai-chain"
epic: "EPIC-P1"
story: 8
status: "validated"
created_at: "2026-01-08T20:30:00+07:00"
points: 4
priority: "P0-CRITICAL"
---

# P1-08: Trace Vault → AI Chain (BLOCKER INVESTIGATION)

## User Story

**As a** Developer
**I want** to trace the complete chain from API key save to AI feature execution
**So that** I can identify and fix why AI features fail with "API Key missing" errors

## Context

This is a **critical blocker investigation**. Users report that AI slash commands in Notes fail with "API Key missing" errors even after configuring API keys in Settings. The vault chain is complex with multiple potential failure points.

## Acceptance Criteria

### AC-1: Document Complete Chain
**Given** A user saves an API key in Settings
**When** The complete chain is traced
**Then** Every step is documented from save → AI execution

### AC-2: Identify Blockers
**Given** The chain documentation exists
**When** Each step is analyzed
**Then** All potential blockers are identified with specific file locations and line numbers

### AC-3: Propose Simplification
**Given** Blockers are identified
**When** A Phase 1 simplification proposal is created
**Then** The proposal ensures AI features work without complex vault logic

### AC-4: Verification Method
**Given** The chain is documented
**When** A user tests AI slash command
**Then** The verification method confirms the chain is working end-to-end

## Tasks

### Investigation Tasks
- [ ] T1: Map Settings → Vault storage flow
- [ ] T2: Map Vault → Agent config retrieval flow
- [ ] T3: Map Agent config → AI service invocation flow
- [ ] T4: Identify all SSR guards and their impact
- [ ] T5: Test migration status and its effect on key availability
- [ ] T6: Document error handling at each step
- [ ] T7: Create chain visualization diagram
- [ ] T8: Propose Phase 1 simplification if needed

### Research Requirements
- [ ] Check credential-vault.ts initialization timing
- [ ] Check migrate-api-keys-to-vault.ts execution status
- [ ] Check note-ai-service.ts credential retrieval
- [ ] Check provider-store integration with vault

## Dev Notes

### Potential Blockers (From Phase 1 Epics Document)

#### BLOCKER-01: credential-vault.ts (535 lines)
- **Complex async initialization** - may not complete before AI service calls
- **SSR guards** (line 167-170, 392-394, 424-427) - may skip initialization during SSR
- **Keys stored in localStorage + IndexedDB hybrid** - complex sync between storages
- **If vault doesn't initialize, AI features fail** silently

#### BLOCKER-02: migrate-api-keys-to-vault.ts (389 lines)
- **Migration may not have run** - keys still in old provider state location
- **If providers still have apiKey field** - vault is bypassed entirely
- **Verification step may fail silently** - no clear error to user

#### BLOCKER-03: useWorkspaceAccess hook
- Returns 'no_projects' or loops infinitely
- Already bypassed in notes.lazy.tsx
- Needs bypass in ide.tsx too

### Key Files to Trace

```
src/lib/agent/providers/credential-vault.ts (535 lines)
├── initialize() - Lines 158-234
│   ├── SSR guard (167-170) - May skip on server
│   ├── validateStorageKeys() (128-149) - Checks localStorage
│   ├── createNewVault() (239-271) - Creates fresh vault
│   └── getOrCreateVaultPassword() (276-293) - Password derivation
├── storeCredentials() - Lines 390-412
│   ├── SSR guard (392-394)
│   └── Throws if vault not initialized (397-399)
└── getCredentials() - Lines 422-455
    ├── SSR guard (424-427)
    └── Throws if master key null (432-435)

src/infrastructure/persistence/stores/providers/migrate-api-keys-to-vault.ts (389 lines)
├── isMigrationNeeded() - Lines 65-67
├── migrateApiKeysToVault() - Lines 94-268
│   ├── Phase 1: Backup (139-161)
│   ├── Phase 2: Migrate (164-214)
│   ├── Phase 3: Verify (218-250)
│   └── Phase 4: Cleanup (252-253)
└── rollbackMigration() - Lines 279-337

src/lib/notes/note-ai-service.ts (287 lines)
├── generateNoteContent() - Lines 57-128
│   ├── Gets agent for workspace (63-69)
│   ├── Gets API key from vault (88) - **CRITICAL PATH**
│   └── Throws NO_API_KEY if null (90-95)
└── callProviderAPI() - Lines 153-286
    └── Makes fetch call with API key (249-253)
```

### Integration Points

| Component | Touches | Breaks | Tests Required |
|-----------|---------|--------|----------------|
| Settings page | credential-vault.ts | No | Manual smoke test |
| Provider store | credential-vault.ts | No | Unit test |
| Migration script | Both vault + provider | Yes | Integration test |
| Note AI service | credential-vault.ts | Yes (if vault not ready) | Integration test |
| Agent system | credential-vault.ts | Yes (if vault not ready) | Integration test |

### Architecture Patterns to Follow

- **Pattern**: Async initialization with ready state
- **Rationale**: Vault requires async crypto operations, must signal ready state
- **Reference**: credential-vault.ts `isReady()` method (517-519)

- **Pattern**: SSR guards for browser-only APIs
- **Rationale**: localStorage/IndexedDB not available during SSR
- **Reference**: credential-vault.ts `typeof window === 'undefined'` checks

## References

- Epic: `_bmad-output/project-planning-artifacts/phase-1-epics-2026-01-08.md#story-p1-08`
- Sprint Status: `_bmad-output/sprint-artifacts/phase-1-sprint-status-2026-01-08.yaml`
- Related Stories:
  - P1-09: Simplify Agent/Key Flow for Phase 1 (depends on P1-08)

## Dev Agent Record

*This section populated during development phase*

### Agent
- Model: {model_name}
- Session: {timestamp}

### Task Progress
- [ ] T1: Map Settings → Vault storage flow
- [ ] T2: Map Vault → Agent config retrieval flow
- [ ] T3: Map Agent config → AI service invocation flow
- [ ] T4: Identify all SSR guards and their impact
- [ ] T5: Test migration status and its effect on key availability
- [ ] T6: Document error handling at each step
- [ ] T7: Create chain visualization diagram
- [ ] T8: Propose Phase 1 simplification if needed

### Research Executed
*Documentation of investigation findings*

### Files Analyzed
| File | Lines | Key Findings |
|------|-------|---------------|
| credential-vault.ts | 535 | 3 SSR guards at lines 167, 392, 424 |
| migrate-api-keys-to-vault.ts | 389 | Migration may not have run |
| note-ai-service.ts | 287 | Line 88: getCredentials() is critical |

### Chain Diagram
*To be created during investigation*

### Decisions Made
- Decision 1: {rationale}

## Code Review

*This section populated during review phase*

**Reviewer:** {model_name}
**Date:** {timestamp}

### Checklist
- [ ] All ACs verified
- [ ] Chain documentation complete
- [ ] Blockers identified with specific locations
- [ ] Simplification proposal created
- [ ] Verification method defined

### Issues Found
*Issues and resolutions documented here*

### Sign-off
[ ] APPROVED for next phase

## Status History

| Status | Timestamp | Agent | Notes |
|--------|-----------|-------|-------|
| backlog | 2026-01-08T20:00:00+07:00 | SM | From Phase 1 Epics |
| drafted | 2026-01-08T20:30:00+07:00 | BMAD Master | Story file created |
| validated | 2026-01-08T21:00:00+07:00 | BMAD Master | 100% validation pass |
