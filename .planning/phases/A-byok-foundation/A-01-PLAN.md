---
phase: A-byok-foundation
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/infrastructure/ai/credential-encryption.ts
  - src/infrastructure/ai/credential-storage.ts
  - src/infrastructure/ai/credential-vault.ts
  - src/infrastructure/ai/index.ts
  - src/lib/agent/providers/credential-vault.ts
autonomous: true
user_setup: []

must_haves:
  truths:
    - "CredentialVault class can encrypt/decrypt API keys"
    - "Vault persists across browser refresh via IndexedDB"
    - "Old stub import path still works via re-export"
  artifacts:
    - path: "src/infrastructure/ai/credential-encryption.ts"
      provides: "AES-256-GCM encryption operations"
      min_lines: 300
    - path: "src/infrastructure/ai/credential-storage.ts"
      provides: "IndexedDB storage via Dexie"
      min_lines: 150
    - path: "src/infrastructure/ai/credential-vault.ts"
      provides: "CredentialVault public API facade"
      exports: ["CredentialVault", "credentialVault"]
    - path: "src/infrastructure/ai/index.ts"
      provides: "Barrel export for ai infrastructure"
  key_links:
    - from: "src/infrastructure/ai/credential-vault.ts"
      to: "src/infrastructure/ai/credential-encryption.ts"
      via: "import"
      pattern: "from './credential-encryption'"
    - from: "src/infrastructure/ai/credential-storage.ts"
      to: "@/infrastructure/persistence/dexie-db"
      via: "import"
      pattern: "from '@/infrastructure/persistence/dexie-db'"
---

<objective>
Restore credential vault infrastructure from Phase 2 archive to canonical location.

Purpose: Provide working AES-256-GCM encryption for API key storage - the foundation for BYOK.
Output: Working CredentialVault class at `src/infrastructure/ai/` with re-export from old path.
</objective>

<execution_context>
@/Users/apple/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/apple/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/A-byok-foundation/A-CONTEXT.md
@src/infrastructure/persistence/dexie-db.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create credential-encryption.ts at canonical location</name>
  <files>src/infrastructure/ai/credential-encryption.ts</files>
  <action>
    1. Create directory: `mkdir -p src/infrastructure/ai`
    2. Copy `_phase2-archive/lib/agent/providers/credential-encryption.ts` to `src/infrastructure/ai/credential-encryption.ts`
    3. Update import path on line 18:
       - FROM: `import { arrayBufferToBase64, base64ToArrayBuffer } from './credential-storage';`
       - TO: `import { arrayBufferToBase64, base64ToArrayBuffer } from './credential-storage.js';`
    4. No other changes needed - pure crypto operations with no external deps
  </action>
  <verify>File exists and has ~367 lines. Contains `class CredentialEncryption`.</verify>
  <done>credential-encryption.ts exists at canonical path with correct sibling import.</done>
</task>

<task type="auto">
  <name>Task 2: Create credential-storage.ts with updated Dexie import</name>
  <files>src/infrastructure/ai/credential-storage.ts</files>
  <action>
    1. Copy `_phase2-archive/lib/agent/providers/credential-storage.ts` to `src/infrastructure/ai/credential-storage.ts`
    2. Update Dexie import on line 14:
       - FROM: `import { getDb, type CredentialRecord } from '@/infrastructure/persistence/dexie-db';`
       - TO: `import { getDb, type CredentialRecord } from '@/infrastructure/persistence/dexie-db.js';`
    3. No other changes - the file already uses correct Dexie path pattern
  </action>
  <verify>File exists and has ~239 lines. Contains `class CredentialStorage`.</verify>
  <done>credential-storage.ts exists at canonical path with Dexie integration.</done>
</task>

<task type="auto">
  <name>Task 3: Create credential-vault.ts with updated sibling imports</name>
  <files>src/infrastructure/ai/credential-vault.ts, src/infrastructure/ai/index.ts, src/lib/agent/providers/credential-vault.ts</files>
  <action>
    1. Copy `_phase2-archive/lib/agent/providers/credential-vault.ts` to `src/infrastructure/ai/credential-vault.ts`
    2. Update sibling imports on lines 23-27:
       ```typescript
       import { CredentialStorage } from './credential-storage.js';
       import {
           CredentialEncryption,
           type EncryptedData,
       } from './credential-encryption.js';
       ```
    3. Create barrel export `src/infrastructure/ai/index.ts`:
       ```typescript
       /**
        * @fileoverview AI Infrastructure Barrel Export
        * @module infrastructure/ai
        * 
        * Canonical location for AI-related infrastructure:
        * - Credential vault (BYOK key storage)
        * - AI Gateway (future: Phase B)
        * - Provider adapters (future: Phase B)
        */
       
       // Credential Vault
       export { CredentialVault, credentialVault, type VaultStatus } from './credential-vault.js';
       export { CredentialEncryption, type EncryptedData, type VaultKeys } from './credential-encryption.js';
       export { CredentialStorage, arrayBufferToBase64, base64ToArrayBuffer, uint8ArrayToBase64, base64ToUint8Array, type StorageResult } from './credential-storage.js';
       ```
    4. Update stub at `src/lib/agent/providers/credential-vault.ts` to re-export:
       ```typescript
       /**
        * Re-export from canonical location
        * @deprecated Import from '@/infrastructure/ai' instead
        */
       export { CredentialVault, credentialVault, type VaultStatus } from '@/infrastructure/ai/credential-vault.js';
       export { Credential } from '@/infrastructure/ai/credential-vault.js';
       export default credentialVault;
       ```
       
       Note: The Credential interface should be kept or moved - check if it's used elsewhere. 
       If the old stub's Credential interface differs from archived code, keep the old interface
       and add it to the re-export.
  </action>
  <verify>
    - `src/infrastructure/ai/credential-vault.ts` exists (~544 lines)
    - `src/infrastructure/ai/index.ts` exists 
    - `src/lib/agent/providers/credential-vault.ts` now re-exports from canonical path
    - Run: `pnpm typecheck:fast` shows no new errors in these files
  </verify>
  <done>
    - CredentialVault at canonical path
    - Barrel export created
    - Old path maintains backward compatibility via re-export
  </done>
</task>

</tasks>

<verification>
1. Run: `pnpm typecheck:fast` - should complete without new errors
2. Run: `pnpm governance` - no new violations in infrastructure/ai/
3. Check file sizes:
   - credential-encryption.ts: ~350+ lines
   - credential-storage.ts: ~230+ lines  
   - credential-vault.ts: ~540+ lines
</verification>

<success_criteria>
- [ ] `src/infrastructure/ai/` directory exists with 4 files
- [ ] credential-vault.ts exports CredentialVault class
- [ ] Old import path `@/lib/agent/providers/credential-vault` still works
- [ ] TypeScript compiles without new errors
- [ ] No circular dependencies introduced
</success_criteria>

<output>
After completion, create `.planning/phases/A-byok-foundation/A-01-SUMMARY.md`
</output>
