---
phase: A-byok-foundation
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - src/infrastructure/persistence/stores/providers/credentials/vault-slice.ts
  - src/infrastructure/persistence/stores/providers/index.ts
autonomous: true
user_setup: []

must_haves:
  truths:
    - "Provider store has working vault operations"
    - "storeVaultCredential() calls actual CredentialVault"
    - "retrieveVaultCredential() returns decrypted API key"
  artifacts:
    - path: "src/infrastructure/persistence/stores/providers/credentials/vault-slice.ts"
      provides: "Zustand slice with vault operations"
      exports: ["createProviderVaultSlice"]
    - path: "src/infrastructure/persistence/stores/providers/index.ts"
      provides: "Provider store barrel with vault slice integration"
  key_links:
    - from: "src/infrastructure/persistence/stores/providers/credentials/vault-slice.ts"
      to: "@/infrastructure/ai"
      via: "import"
      pattern: "from '@/infrastructure/ai'"
---

<objective>
Restore provider vault slice from archive and integrate with provider store.

Purpose: Enable provider store to perform real vault operations (store/retrieve API keys).
Output: Working vault slice with credentialVault integration.
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
@src/infrastructure/persistence/stores/providers/index.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create vault-slice.ts in credentials subdirectory</name>
  <files>src/infrastructure/persistence/stores/providers/credentials/vault-slice.ts</files>
  <action>
    1. Create directory: `mkdir -p src/infrastructure/persistence/stores/providers/credentials`
    2. Copy `_phase2-archive/infrastructure/persistence/stores/providers/credentials/vault-slice.ts` to `src/infrastructure/persistence/stores/providers/credentials/vault-slice.ts`
    3. Update import on line 18:
       - FROM: `import { credentialVault } from '@/lib/agent/providers/credential-vault';`
       - TO: `import { credentialVault } from '@/infrastructure/ai/credential-vault.js';`
       
       Note: Can also use `from '@/infrastructure/ai'` if barrel export works.
  </action>
  <verify>
    File exists and has ~135 lines. Contains `createProviderVaultSlice` export.
    Import points to canonical location.
  </verify>
  <done>vault-slice.ts created with correct import path.</done>
</task>

<task type="auto">
  <name>Task 2: Update provider store barrel to include vault slice</name>
  <files>src/infrastructure/persistence/stores/providers/index.ts</files>
  <action>
    The current `index.ts` is a stub. Update it to:
    
    1. Add import for vault slice:
       ```typescript
       import { createProviderVaultSlice } from './credentials/vault-slice.js';
       ```
    
    2. Export the vault slice creator:
       ```typescript
       export { createProviderVaultSlice } from './credentials/vault-slice.js';
       ```
    
    3. Keep all existing stub exports for backward compatibility (providers, models, utils slices).
       The stub slices still work - vault slice adds NEW functionality, doesn't replace stubs.
    
    Note: DO NOT remove stub code - other parts of the app depend on it. 
    The vault slice is additive.
  </action>
  <verify>
    `src/infrastructure/persistence/stores/providers/index.ts` exports `createProviderVaultSlice`.
    Run: `pnpm typecheck:fast` shows no new errors.
  </verify>
  <done>Provider store barrel exports vault slice alongside existing stub slices.</done>
</task>

<task type="auto">
  <name>Task 3: Create credentials barrel export</name>
  <files>src/infrastructure/persistence/stores/providers/credentials/index.ts</files>
  <action>
    Create `src/infrastructure/persistence/stores/providers/credentials/index.ts`:
    
    ```typescript
    /**
     * Credentials Slice Barrel Export
     * @module providers/credentials
     */
    
    export { createProviderVaultSlice } from './vault-slice.js';
    ```
    
    This enables cleaner imports from parent.
  </action>
  <verify>File exists and exports vault slice.</verify>
  <done>Credentials subdirectory has barrel export.</done>
</task>

</tasks>

<verification>
1. Run: `pnpm typecheck:fast` - no new errors
2. Check import works: 
   ```typescript
   import { createProviderVaultSlice } from '@/infrastructure/persistence/stores/providers';
   ```
3. Verify vault slice calls actual credentialVault (not stub)
</verification>

<success_criteria>
- [ ] credentials/vault-slice.ts exists with correct import path
- [ ] credentials/index.ts barrel export exists
- [ ] providers/index.ts exports createProviderVaultSlice
- [ ] TypeScript compiles without new errors
- [ ] Vault slice imports from @/infrastructure/ai (canonical path)
</success_criteria>

<output>
After completion, create `.planning/phases/A-byok-foundation/A-02-SUMMARY.md`
</output>
