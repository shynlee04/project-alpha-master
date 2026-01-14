# API Key Migration Code Archive

**Archive Date:** 2026-01-13
**Story:** BYOK-03 - Archive Legacy Migration Code
**Status:** PRESERVED (Historical Infrastructure)

---

## description

This directory contains the **API Key to Vault Migration** code that was part of 
**ADR-001: Provider Store Consolidation**. This migration was a security-critical 
feature that moved API keys from insecure localStorage to an encrypted AES-256-GCM 
vault.

---

## Why This Code Is Preserved (Not Deleted)

### 1. Historical Reference
The migration system represents significant engineering work:
- 3-layer backup strategy (IndexedDB, localStorage, downloadable JSON)
- Rollback mechanisms for safety
- UI state tracking during migration
- Checksum-based integrity verification

### 2. Potential Future Need
- Existing users may still have old backups that need restoration
- The pattern may be reused for future data migrations
- Audit trail for security compliance

### 3. Infrastructure Understanding
New developers may need to understand:
- How the credential vault was introduced
- The migration pattern used
- Why certain code structures exist

---

## Archived Files

| File | Lines | description |
|------|-------|---------|
| `migrate-api-keys-to-vault.ts` | ~389 | Main migration logic |
| `migration-backup.ts` | ~550 | 3-layer backup system |
| `use-migration-state.ts` | ~182 | UI state tracking |

---

## Migration Timeline

- **Created:** ~2024 (estimated from story references)
- **Implemented:** Before BYOK-01 (vault-slice split)
- **Status:** Migration complete for all active users
- **Current State:** Infrastructure preserved for rollback/audit

---

## Key Design Decisions

### 1. Dynamic Import
The migration is dynamically imported in `use-app-store.ts` to:
- Avoid blocking initial load
- Allow lazy loading of migration code
- Enable tree-shaking for new users

### 2. 3-Layer Backup
- **IndexedDB:** Primary storage, 7-day retention
- **localStorage:** Immediate fallback
- **Downloadable JSON:** Manual restore option

### 3. Rollback Safety
Any failure triggers automatic rollback from the most recent backup.

---

## Active References (As of Archive Date)

The following files still reference this migration code:

| File | Usage |
|------|-------|
| `use-app-store.ts` | Dynamic import, runs on initialization |
| `MigrationStatus.tsx` | Displays migration progress |
| `VaultStatusCard.tsx` | Trigger migration from UI |

**Note:** These references remain because the migration check is non-destructive.
For users who already migrated, `isMigrationNeeded()` returns false immediately.
