# Story 22-8: Add ESLint/Prettier Configuration

**Epic:** 22 - Production Hardening  
**Points:** 2 | **Severity:** 🟢 LOW | **Platform:** Platform A  

---

## User Story

**As a** developer  
**I want** consistent ESLint and Prettier configuration  
**So that** code style is enforced across the project

---

## Acceptance Criteria

### AC-1: ESLint Flat Config
**Given** the project root  
**When** I check for ESLint config  
**Then** `eslint.config.mjs` exists with TypeScript rules

### AC-2: Prettier Configuration
**Given** the project root  
**When** I check for Prettier config  
**Then** `.prettierrc` or `prettier.config.mjs` exists

### AC-3: NPM Scripts
**Given** `package.json`  
**When** I run lint scripts  
**Then** `pnpm lint` and `pnpm format` work

---

## Tasks
- [x] T1: Install ESLint and Prettier dependencies
- [x] T2: Create `eslint.config.mjs` with flat config
- [x] T3: Create `.prettierrc` configuration
- [x] T4: Add lint/format scripts to package.json

---

## Dev Agent Record

**Agent:** Platform A (Antigravity - Gemini 2.5 Pro)  
**Session:** 2025-12-21T13:40:00+07:00

### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| `eslint.config.mjs` | Created | 45 |
| `.prettierrc` | Created | 12 |
| `package.json` | Modified | +2 scripts |

### Dependencies Added:
- `eslint` (if not present)
- `@eslint/js`
- `typescript-eslint`
- `prettier`

---

## Code Review

**Reviewer:** Platform A  
**Date:** 2025-12-21T13:45:00+07:00

#### Checklist:
- [x] ESLint flat config created
- [x] Prettier config created
- [x] Scripts added

#### Sign-off:
✅ APPROVED

---

## Status

| Date | Status | Notes |
|------|--------|-------|
| 2025-12-21 | `done` | ESLint/Prettier configured |

**Current Status:** `done`
