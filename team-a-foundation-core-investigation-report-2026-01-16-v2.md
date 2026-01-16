# Team A Foundation & Core Investigation Report

**Date**: 2026-01-16
**Team**: Team A
**Duration**: 2-3 hours

## Executive Summary
Team A has completed a deep scan of the foundation layer. The core findings indicate a "Split Brain" architecture where legacy `src/lib` utilities conflict with modern `src/infrastructure` implementations. 

**Key Critical Findings:**
1.  **State Schism:** `useProjectStore` is intentionally "in-memory only" but this design choice conflicts with the need for persistent UI state (last opened, layout), leading to "dual storage chaos".
2.  **Platform Detection Redundancy:** Two competing platform detection logic sets exist (`src/lib/utils` vs `src/infrastructure/filesystem`), using different methodologies (UA string vs Feature Detection/Screen Size).
3.  **FSA "Silent" Restore Failure:** While code for silent restore exists, it relies on `showDirectoryPicker({ id })` which is browser-dependent and often falls back to prompting, violating the "seamless" requirement.
4.  **BYOK Vault Disconnect:** The `CredentialVault` is robust (AES-256-GCM) but "orphaned" - it exists but is not consistently called by the Provider Service layer, leading to hardcoded or missing keys.

## Priority Findings (PRIORITY)

### Task A1: Project Space Analysis (PRIORITY - FIRST UNBINDING KNOT)
**Status**: **PARTIAL / CONFUSED**
**Details**: 
- **Central Store:** `src/infrastructure/persistence/stores/project/useProjectStore.ts` is the main entry point.
- **Persistence Model:** Comments explicitly state: *"This store is now a transient in-memory cache, NOT persisted"*. It relies on `project-crud-slice` to write to Dexie (`db.projects`) and `project-utils-slice` to hydrate from it.
- **Routing:** `useWorkspaceProjects` hook exists to filter projects, but data sources are split. Hub uses `useLiveQuery` (Dexie direct) while IDE uses `useProjectStore` (Zustand memory).
**Issues**:
- **Dual Source of Truth:** Hub vs IDE seeing different states if hydration lags.
- **Hydration Race Conditions:** "WSOD" (White Screen of Death) reported due to missing `useProjectStats` export and race conditions in loading.
- **Legacy Artifacts:** References to `src/lib/workspace/project-store` (legacy) still exist in some files.
**Recommendations**:
- **Consolidate:** Force ALL reads through `useProjectStore` (which must robustly sync with Dexie) or fully migrate to `useLiveQuery` for read-heavy views.
- **Fix Persistence:** Re-enable Zustand persistence *specifically* for UI state (layout, last opened) while keeping data in Dexie.

### Task A2: Platform Detection Analysis
**Status**: **FOUND (DUPLICATE)**
**Details**:
- **Canonical:** `src/infrastructure/filesystem/platform-detection.ts` (Correct, strictly typed).
- **Legacy/Duplicate:** `src/lib/utils/platform-detection.ts` (Incorrect, mixes UI concerns).
- **Logic Conflict:** 
    - Canonical uses strictly User Agent + Capability (`showDirectoryPicker`).
    - Legacy uses Screen Width + Touch points.
**Issues**:
- **Redundant Code:** Two files doing the same thing differently.
- **Fragility:** Legacy detection might identify a small desktop window as "mobile".
**Recommendations**:
- **Delete:** `src/lib/utils/platform-detection.ts`.
- **Refactor:** Update all imports to use `src/infrastructure/filesystem/platform-detection.ts`.

### Task A3: Platform Guards Analysis
**Status**: **FOUND / IMPLEMENTED**
**Details**:
- **Route Guard:** `src/routes/ide.$projectId.tsx` implements a `beforeLoad` check.
- **Logic:** Calls `getPlatformContract()`. If `!canAccessIDE`, throws redirect to `/notes/$projectId`.
**Issues**:
- **None Critical:** The implementation aligns with ADR-033.
**Recommendations**:
- **Verify:** Ensure `getPlatformContract` correctly identifies mobile devices (depends on Task A2 fix).

### Task A4: FSA Integration Analysis
**Status**: **PARTIAL / FLAKY**
**Details**:
- **Handle Management:** `fsa-handle-manager.ts` and `handle-persistence.ts` manage handles.
- **Restore Logic:** Attempts `window.showDirectoryPicker({ id: projectId })` for silent restore.
**Issues**:
- **Prompting Loop:** "FSA-002" infection confirmed: Restore logic often triggers a user prompt instead of being silent, breaking the "auto-load" flow.
- **Permissions:** `FileSystemHandle` permissions are not consistently persisted or restored.
**Recommendations**:
- **Strict Logic:** Only attempt restore if `mode: 'readwrite'` is explicitly granted previously.
- **Fallback:** If silent restore fails, degradation to "Ask User" should be handled gracefully in UI, not as an error loop.

### Task A5: BYOK Analysis
**Status**: **FOUND / ORPHANED**
**Details**:
- **Vault:** `src/lib/agent/providers/credential-vault.ts` implements AES-256-GCM.
- **UI:** `VaultStatusCard` exists.
**Issues**:
- **Integration Gap:** "CRIT-010" confirmed. Providers (chat, embeddings) often skip the Vault and look for keys in `localStorage` (legacy) or environment variables.
- **SSR Failure:** Chat API (`api/chat.ts`) runs on server and cannot access IndexedDB-based Vault.
**Recommendations**:
- **Client-Side Only:** AI calls must originate or be fully composed on the client where the Vault is accessible.
- **Bridge:** Ensure `ProviderService` *always* calls `credentialVault.getCredentials()` before making requests.

## Priority Recommendations
1.  **Immediate Cleanup (A2):** Delete `src/lib/utils/platform-detection.ts` and reroute imports to `src/infrastructure`. This stabilizes the "Foundation".
2.  **Unify Project Source (A1):** standardise on *one* read pattern (likely `useLiveQuery` for lists, `useProjectStore` for active session) to kill the "Split Brain".
3.  **Wire the Vault (A5):** Modify `ProviderService` to strictly require Vault access, removing legacy `localStorage` fallbacks.

## Next Steps
- Execute cleanup of `src/lib/utils/platform-detection.ts`.
- Refactor `ProviderService` to enforce Vault usage.
- Debug FSA silent restore on actual Chrome 129+ environment.
