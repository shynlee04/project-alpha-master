# Story: Complete CRUD for Provider Configs

## 1. Story Definition

**Epic:** AI-25 - AI Foundation Sprint
**Story:** AI-25-2
**Title:** Complete CRUD for all config types
**Status:** Drafted
**Priority:** P0

### User Story
**AS A** Developer
**I WANT** to be able to add, edit, and delete provider configurations in the settings UI
**SO THAT** I can manage multiple LLM providers and update their keys as needed.

### Acceptance Criteria

#### AC-1: Provider Settings UI
- [ ] List all configured providers (from `useProviderStore`).
- [ ] Show details: Name, Model, Provider Type.
- [ ] "Add Provider" button opens configuration dialog.

#### AC-2: Delete Provider
- [ ] Each provider in the list has a Delete action.
- [ ] Confirmation dialog appears before deletion.
- [ ] On confirmation:
  - [ ] Removes from `useProviderStore` (Zustand).
  - [ ] Removes from `providerConfigs` (Dexie).
  - [ ] Removes credentials from `credentials` table (Dexie/Vault).
- [ ] UI updates immediately.

#### AC-3: Edit Provider
- [ ] Each provider in the list has an Edit action.
- [ ] Opens configuration dialog pre-filled with existing data.
- [ ] On save:
  - [ ] Updates `useProviderStore`.
  - [ ] Updates `providerConfigs` (Dexie).
  - [ ] Updates credentials if changed.
- [ ] UI updates immediately.

#### AC-4: Validation & Security
- [ ] API keys are never shown in plain text (only "********" or empty if creating new).
- [ ] Cannot delete the last remaining provider (optional, but good UX).

## 2. Technical Approach

### Architecture Pattern
- **Store:** `useProviderStore` (src/lib/state/provider-store.ts)
- **Persistence:** `dexie-db.ts` (Already migrated in AI-25-1).
- **Component:** Create `src/components/agent/ProviderSettings.tsx`.
- **Encryption:** Use `CredentialVault` for key storage/removal.

### Tasks
- [ ] Search for any existing `ProviderSettings` logic to reuse.
- [ ] Create `src/components/agent/ProviderSettings.tsx`.
- [ ] Implement `ProviderList` sub-component.
- [ ] Implement `handleDelete` using `useProviderStore.removeProvider`.
- [ ] Implement `handleEdit` connecting to `AgentConfigDialog` (or dedicated `ProviderConfigDialog`).
- [ ] Ensure `excludeKeys` logic when editing (don't overwrite key with empty string).

## 3. Research Requirements (Mandatory)
- [ ] Verify `AgentConfigDialog` props for editorial mode.
- [ ] Check `CredentialVault` API for delete/update methods.
- [ ] Confirm `provider-store.ts` actions availability (`removeProvider`, `updateProvider`).

## 4. References
- `docs/2025-12-28/target-architecture.md`
- `src/lib/state/provider-store.ts`

## 5. Dev Agent Record
*(To be filled during development)*
