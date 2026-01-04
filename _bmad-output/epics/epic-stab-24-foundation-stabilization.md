---
date: 2026-01-04
time: "18:30:00"
phase: Phase 4 - Implementation
epic_id: STAB-24
epic_name: "Foundation Stabilization"
priority: P0
status: backlog
estimated_hours: 44
sprint: "Stabilization Sprint 1A"
team: "A+B (Parallel)"
adr_reference: "ADR-024"
module_reference: "architecture-remediation"
workflow_reference: "/stabilization-sprint"
---

# Epic STAB-24: P0 Foundation Stabilization

## Epic Overview

**Priority**: P0 - CRITICAL (Security & Data Integrity)
**Duration**: 5-7 days
**Total Effort**: 38-50 hours
**Team Assignment**: Parallel execution (Team A + Team B)

### Current State Analysis

From deep scan post-EPIC 53:

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| **Health Score** | 68.5/100 | 75/100 | 6.5 points |
| **P0 Risks** | 3 | 0 | 3 eliminations |
| **localStorage Keys** | 3 exposed | 0 | Encrypt all |
| **Quota Handlers** | 0 tables | 23 tables | 23 additions |
| **Pixel Violations** | 86 | <20 | 66+ fixes |

### P0 Risks Being Addressed

| Risk ID | Description | Severity | Impact |
|---------|-------------|----------|--------|
| P0-1 | API keys in plaintext localStorage | CRITICAL | Data breach risk |
| P0-2 | 86 hardcoded pixels breaking mobile | CRITICAL | UX disaster |
| P0-3 | No IndexedDB quota handling | CRITICAL | Silent data loss |

---

## Epic User Story

**As a** platform administrator and developer
**I want** all P0 critical risks eliminated from the codebase
**So that** the platform is secure, stable, and prevents data loss

## Epic Acceptance Criteria

### EAC-1: Security Hardening
- [ ] All API keys encrypted at rest
- [ ] Zero sensitive data in localStorage
- [ ] Migration path tested and validated

### EAC-2: Data Integrity
- [ ] QuotaExceededError handling on all Dexie operations
- [ ] User notification for quota warnings
- [ ] Graceful degradation path implemented

### EAC-3: Responsive Design
- [ ] Design token system implemented
- [ ] Mobile responsive test passes
- [ ] Tablet responsive test passes
- [ ] Desktop responsive test passes

### EAC-4: Zero Regression
- [ ] All existing tests pass
- [ ] Zero new TypeScript errors
- [ ] Build completes successfully
- [ ] All workspaces boot without crashes

---

## Stories

### Story STAB-24.1: Encrypt localStorage Keys

**Priority**: P0
**Effort**: 12-16 hours
**Team**: B (Backend)
**Agent**: @bmad-bmm-dev
**Status**: backlog

#### User Story

**As a** security-conscious user
**I want** my API keys stored securely
**So that** they cannot be stolen from browser storage

#### Acceptance Criteria

##### AC-1: Key Audit Complete
**Given** the current codebase
**When** I search for localStorage usage with sensitive data
**Then** I identify all vulnerable keys that need migration

##### AC-2: Encrypted Storage Utility
**Given** a need to store sensitive data
**When** I use the new encrypted storage utility
**Then** data is encrypted before IndexedDB storage with AES-256-GCM

##### AC-3: Key Migration Complete
**Given** existing keys `vge-kv3`, `vg-salt-v3`, `vg-vp-v3` in localStorage
**When** the migration runs
**Then** all keys are moved to encrypted IndexedDB storage

##### AC-4: Deprecation Warning
**Given** code that accesses old localStorage paths
**When** running in development mode
**Then** a console warning indicates the deprecated path

##### AC-5: Zero Data Loss
**Given** a user with existing keys in localStorage
**When** they upgrade to the new version
**Then** their keys are migrated without manual intervention

#### Tasks

- [ ] T1: Audit localStorage usage for sensitive keys (2h)
  - Search patterns: `localStorage.setItem`, `localStorage.getItem`
  - Document all sensitive key patterns
  
- [ ] T2: Create encrypted IndexedDB storage utility (4h)
  - Location: `src/infrastructure/security/encrypted-storage.ts`
  - Methods: `setEncrypted()`, `getEncrypted()`, `deleteEncrypted()`
  - Encryption: Web Crypto API with AES-256-GCM
  
- [ ] T3: Create migration utility (3h)
  - Location: `src/infrastructure/security/key-migration.ts`
  - Detect localStorage keys → migrate → delete old
  
- [ ] T4: Update key vault store to use encrypted storage (2h)
  - File: `src/lib/state/credential-store.ts`
  
- [ ] T5: Add deprecation warnings to old paths (1h)
  
- [ ] T6: Write migration tests (2h)
  - Test: Fresh install (no migration needed)
  - Test: Existing user (migration triggered)
  - Test: Partial migration (resumable)

#### Technical Notes

**Research Required**:
- Web Crypto API for encryption
- IndexedDB binary storage for encrypted blobs
- Migration patterns for client-side data

**Files to Create**:
```
src/infrastructure/security/
├── encrypted-storage.ts      # Core encryption utility
├── key-migration.ts          # Migration logic
├── encryption-types.ts       # Type definitions
└── index.ts                  # Barrel export
```

**Files to Modify**:
```
src/lib/state/credential-store.ts     # Update storage layer
src/infrastructure/persistence/dexie-db.ts  # Add encrypted table
```

#### Validation Script

```bash
# After completion, run:
grep -rE "localStorage\.(set|get)Item.*['\"]vge-['\"]" src/ --include="*.ts" --include="*.tsx"
# Expected: 0 matches

grep -r "EncryptedStorage" src/infrastructure/security/ --include="*.ts"
# Expected: >3 matches (utility defined)
```

---

### Story STAB-24.2: IndexedDB Quota Handling

**Priority**: P0
**Effort**: 18-22 hours
**Team**: B (Backend)
**Agent**: @bmad-bmm-dev
**Status**: backlog

#### User Story

**As a** user with limited browser storage
**I want** the app to handle storage quota gracefully
**So that** I never lose data unexpectedly

#### Acceptance Criteria

##### AC-1: Quota Detection Utility
**Given** the need to monitor storage usage
**When** I call the quota detection utility
**Then** I receive current usage and available quota

##### AC-2: QuotaExceeded Handler
**Given** a Dexie write operation
**When** QuotaExceededError is thrown
**Then** the error is caught and handled gracefully

##### AC-3: All Tables Protected
**Given** all 23 Dexie tables in the database
**When** any table's write operation fails due to quota
**Then** the user is notified and data is not corrupted

##### AC-4: User Notification
**Given** a quota warning threshold (80% usage)
**When** the threshold is exceeded
**Then** a non-intrusive notification warns the user

##### AC-5: Graceful Degradation
**Given** storage quota is exhausted
**When** the user continues using the app
**Then** read operations work normally
**And** write operations show clear error messages

#### Tasks

- [ ] T1: Create storage quota monitoring service (4h)
  - Location: `src/infrastructure/persistence/quota-monitor.ts`
  - Methods: `getCurrentUsage()`, `getAvailableQuota()`, `getUsagePercentage()`
  
- [ ] T2: Create QuotaExceededError handler (3h)
  - Location: `src/infrastructure/persistence/quota-handler.ts`
  - Wraps Dexie operations with try-catch
  
- [ ] T3: Audit and protect all 23 Dexie tables (6h)
  - Wrap each table's write operations
  - Add quota handler to `add()`, `put()`, `bulkAdd()`, `bulkPut()`
  
- [ ] T4: Create quota warning notification UI (3h)
  - React component: `QuotaWarningToast.tsx`
  - Integration with toast system (Sonner)
  
- [ ] T5: Implement graceful degradation mode (4h)
  - Read-only mode activation
  - Clear messaging to user
  - Export data functionality
  
- [ ] T6: Write quota simulation tests (2h)
  - Mock storage quota exceeded
  - Verify error handling path

#### Technical Notes

**Dexie Tables to Protect** (23 total):
1. agentConfigs
2. conversations
3. messages
4. projects
5. files
6. fileSnapshots
7. sources
8. chunks
9. embeddings
10. quizzes
11. flashcards
12. studySessions
13. notes
14. noteFolders
15. toolPermissions
16. canvasNodes
17. canvasLinks
18. knowledgeGraph
19. syncStates
20. userPreferences
21. ragIndex
22. workspaceBindings
23. encryptedKeys (new from STAB-24.1)

**Pattern to Apply**:
```typescript
export const safeWrite = async <T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      quotaHandler.handleQuotaExceeded();
      return fallback ?? null;
    }
    throw error;
  }
};
```

#### Validation Script

```bash
# Verify quota handling exists
grep -r "QuotaExceededError" src/infrastructure/persistence/ --include="*.ts" | wc -l
# Expected: >5 matches

grep -r "safeWrite\|quotaHandler" src/infrastructure/persistence/ --include="*.ts" | wc -l
# Expected: >20 matches (applied to tables)
```

---

### Story STAB-24.3: Replace Hardcoded Pixels with Design Tokens

**Priority**: P0
**Effort**: 8-12 hours
**Team**: A (UI)
**Agent**: @bmad-bmm-dev or @bmad-bmm-ux-designer
**Status**: backlog

#### User Story

**As a** user accessing the platform on mobile devices
**I want** responsive layouts that adapt to my screen
**So that** I can use the platform comfortably on any device

#### Acceptance Criteria

##### AC-1: Design Token System Created
**Given** the need for consistent spacing/sizing
**When** I review the CSS custom properties
**Then** I find a complete design token system

##### AC-2: Hardcoded Pixels Reduced
**Given** 86 pixel value violations identified
**When** the refactoring is complete
**Then** fewer than 20 hardcoded pixel values remain (intentional fixed sizes)

##### AC-3: Mobile Responsive
**Given** the platform rendered on mobile viewport (375px)
**When** I navigate all workspaces
**Then** no horizontal scrolling or overflow occurs

##### AC-4: Tablet Responsive
**Given** the platform rendered on tablet viewport (768px)
**When** I navigate all workspaces
**Then** layouts adapt appropriately

##### AC-5: Desktop Responsive
**Given** the platform rendered on desktop viewport (1440px)
**When** I navigate all workspaces
**Then** content uses available space effectively

#### Tasks

- [ ] T1: Audit hardcoded pixel values (2h)
  - Pattern: `[0-9]+px` in CSS/TSX
  - Exclude: CSS type definitions, third-party
  
- [ ] T2: Create design token CSS variables (2h)
  - File: `src/presentation/styles/tokens.css`
  - Categories: spacing, sizing, typography, breakpoints
  
- [ ] T3: Replace hardcoded values - spacing (3h)
  - margin, padding, gap patterns
  
- [ ] T4: Replace hardcoded values - sizing (2h)
  - width, height, min/max patterns
  
- [ ] T5: Test responsive breakpoints (2h)
  - Mobile: 375px, 414px
  - Tablet: 768px, 1024px
  - Desktop: 1280px, 1440px
  
- [ ] T6: Update Tailwind config for tokens (1h)
  - Extend theme with custom tokens

#### Technical Notes

**Design Token Categories**:

```css
:root {
  /* Spacing Scale */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.5rem;    /* 24px */
  --space-6: 2rem;      /* 32px */
  --space-8: 3rem;      /* 48px */
  --space-10: 4rem;     /* 64px */
  
  /* Fixed Sizes (intentional) */
  --icon-sm: 16px;
  --icon-md: 24px;
  --icon-lg: 32px;
  
  /* Breakpoints */
  --bp-mobile: 375px;
  --bp-tablet: 768px;
  --bp-desktop: 1280px;
  --bp-wide: 1440px;
}
```

**Files to Create**:
```
src/presentation/styles/
├── tokens.css            # Core design tokens
├── responsive.css        # Responsive utilities
└── index.css             # Main entry (imports tokens)
```

**Files to Modify**:
- `tailwind.config.ts` - Extend with token references
- Components with hardcoded pixels (86 files)

#### Validation Script

```bash
# Count remaining hardcoded pixels
grep -rE "[0-9]+px" src/ --include="*.css" --include="*.tsx" | \
  grep -v ".css.d.ts" | \
  grep -v "node_modules" | \
  grep -v "tokens.css" | \
  wc -l
# Expected: <20 matches

# Token system exists
grep -r "var(--space-" src/ --include="*.css" --include="*.tsx" | wc -l
# Expected: >50 matches (token usage)
```

---

## Epic Dependencies

### Prerequisites
- Epic 53 (State Management Consolidation) - Story 53-1 complete ✅
- Architecture Remediation Module installed ✅

### Blockers
- None identified

### Related Epics
- STAB-25: Store Consolidation (dependent on STAB-24 completion)
- Epic 22: Production Hardening (parallel work possible)
- Epic 23: UX/UI Modernization (parallel work possible)

---

## Success Metrics

| Metric | Before | After | Verification |
|--------|--------|-------|--------------|
| Health Score | 68.5/100 | ≥75/100 | Automated scan |
| P0 Risks | 3 | 0 | Checklist validation |
| Security Vulnerabilities | 3 exposed keys | 0 | Security audit |
| Quota Coverage | 0/23 tables | 23/23 tables | Code review |
| Pixel Violations | 86 | <20 | Grep analysis |
| Mobile UX | Broken | Functional | Manual test |

---

## Risk Mitigation

### Risk 1: Migration Data Loss
**Probability**: Low
**Impact**: High
**Mitigation**: Create backup before migration, implement rollback

### Risk 2: Quota Handling Overhead
**Probability**: Medium
**Impact**: Medium
**Mitigation**: Use lazy initialization, micro-benchmark critical paths

### Risk 3: Design Token Conflicts
**Probability**: Low
**Impact**: Low
**Mitigation**: Prefix tokens with unique namespace

---

## Timeline

| Day | Story | Team | Hours |
|-----|-------|------|-------|
| 1-2 | STAB-24.1 (Start) | B | 8h |
| 1-2 | STAB-24.3 (Start) | A | 8h |
| 3-4 | STAB-24.1 (Complete) | B | 8h |
| 3-4 | STAB-24.2 (Start) | B | 10h |
| 3-4 | STAB-24.3 (Complete) | A | 4h |
| 5-6 | STAB-24.2 (Complete) | B | 10h |
| 7 | Epic Validation | Both | 4h |

**Total Duration**: 5-7 days
**Total Effort**: 38-50 hours

---

## Handoff Protocol

### Story Completion

Upon completing each story:

1. **Update sprint-status.yaml**:
```yaml
STAB-24-1-encrypt-localstorage: done  # COMPLETED 2026-01-XX
```

2. **Create completion artifact**:
```
_bmad-output/sprint-artifacts/stab-24-1-completion-{date}.md
```

3. **Update bmm-workflow-status.yaml**:
```yaml
session_notes:
  - timestamp: "2026-01-XX"
    action: "STORY STAB-24.1 COMPLETE"
    agent: "@bmad-bmm-dev"
```

### Epic Completion

Upon completing all 3 stories:

1. **Run validation gate**
2. **Calculate health score delta**
3. **Create epic completion report**
4. **Trigger STAB-25 (Phase 3)**

---

## References

- ADR-024: State Management Consolidation
- Architecture Remediation Module: `_bmad/modules/architecture-remediation/`
- Workflow: `/stabilization-sprint`
- Config: `_bmad/modules/architecture-remediation/config/priorities.yaml`

---

**Epic Owner**: @bmad-core-bmad-master
**Created**: 2026-01-04T18:30:00+07:00
**Status**: BACKLOG - READY FOR EXECUTION
