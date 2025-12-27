# Story: Complete CRUD for Provider Configs

## 1. Story Definition

**Epic:** AI-25 - AI Foundation Sprint
**Story:** AI-25-2
**Title:** Complete CRUD for all config types
**Status:** Review
**Priority:** P0

### User Story
**AS A** Developer
**I WANT** to be able to add, edit, and delete provider configurations in the settings UI
**SO THAT** I can manage multiple LLM providers and update their keys as needed.

### Acceptance Criteria

#### AC-1: Provider Settings UI
- [x] List all configured providers (from `useProviderStore`).
- [x] Show details: Name, Model, Provider Type.
- [x] "Add Provider" button opens configuration dialog.

#### AC-2: Delete Provider
- [x] Each provider in the list has a Delete action.
- [x] Confirmation dialog appears before deletion.
- [x] On confirmation:
  - [x] Removes from `useProviderStore` (Zustand).
  - [x] Removes from `providerConfigs` (Dexie).
  - [x] Removes credentials from `credentials` table (Dexie/Vault).
- [x] UI updates immediately.

#### AC-3: Edit Provider
- [x] Each provider in the list has an Edit action.
- [x] Opens configuration dialog pre-filled with existing data.
- [x] On save:
  - [x] Updates `useProviderStore`.
  - [x] Updates `providerConfigs` (Dexie).
  - [x] Updates credentials if changed.
- [x] UI updates immediately.

#### AC-4: Validation & Security
- [x] API keys are never shown in plain text (only "********" or empty if creating new).
- [x] Cannot delete the last remaining provider (optional, but good UX).

## 2. Technical Approach

### Architecture Pattern
- **Store:** `useProviderStore` (src/lib/state/provider-store.ts)
- **Persistence:** `dexie-db.ts` (Already migrated in AI-25-1).
- **Component:** Create `src/components/agent/ProviderSettings.tsx`.
- **Encryption:** Use `CredentialVault` for key storage/removal.

### Tasks
- [x] Search for any existing `ProviderSettings` logic to reuse.
- [x] Create `src/components/agent/ProviderSettings.tsx`.
- [x] Implement `ProviderList` sub-component.
- [x] Implement `handleDelete` using `useProviderStore.removeProvider`.
- [x] Implement `handleEdit` connecting to `AgentConfigDialog` (or dedicated `ProviderConfigDialog`).
- [x] Ensure `excludeKeys` logic when editing (don't overwrite key with empty string).

## 3. Research Requirements (Mandatory)
- [ ] Verify `AgentConfigDialog` props for editorial mode.
- [ ] Check `CredentialVault` API for delete/update methods.
- [ ] Confirm `provider-store.ts` actions availability (`removeProvider`, `updateProvider`).

## 4. References
- `docs/2025-12-28/target-architecture.md`
- `src/lib/state/provider-store.ts`

## 5. Dev Agent Record
- **Implementation:** Created `ProviderSettings.tsx` and `ProviderConfigDialog.tsx`.
- **Testing:** Added 100% test coverage for new components. 
- **Decisions:** Created dedicated `ProviderConfigDialog` instead of reusing `AgentConfigDialog` to separate concerns (Agent vs Provider config). Use `credentialVault` directly for API key management.
- **Verification:** Verified Add/Edit/Delete flows with mocked store.

## 6. File List
- `src/components/agent/ProviderSettings.tsx`
- `src/components/agent/ProviderConfigDialog.tsx`
- `src/components/agent/__tests__/ProviderSettings.test.tsx`
- `src/components/agent/__tests__/ProviderConfigDialog.test.tsx`

## 7. Change Log
- 2025-12-28: Implemented Provider Settings CRUD (Add, Edit, Delete) with secure key management.

## 8. Status
In Progress

