# Deep Audit Report: Client-Side Agentic RAG Platform (Revision 2)
**Date**: 2026-01-07
**Agent**: BMAD Master (@bmad-core-bmad-master)
**Subject**: Hub Content, Routing Logic, and Critical Instability

## Executive Summary
This specific deep-dive audit confirms the platform's routing and project binding logic creates a fragmented user experience, while critical pages (Settings, Study) are completely broken. The "Hub" acts as a functional but "offline-prone" launcher, while workspace routing enforces strict, opaque project binding that confuses users.

---

## 1. Hub & Entry Point Analysis
**Status**: **PARTIAL PASS (UX Issues)**

-   **Content Visibility**: Validated. The Hub renders all expected sections:
    -   **Statistics**: Projects, Storage, Activity.
    -   **Action Cards**: `CREATE_PROJECT`, `FIELD_NOTES` (Notes), `NEURAL_AGENTS` (Agents), etc.
    -   **Bottom Grid**: Functional filters for content types.
-   **Initialization Failure**: P0 Issue. Upon first load, the app incorrectly reports "You're offline" and often requires a "Recover Database" (Dexie Schema Reset) to function. This indicates a **critical breakdown in local persistence reliability**.

## 2. Sidebar & Global Navigation
**Status**: **CRITICAL FAIL**

-   **Agents Tab**: **PASS**. Loads `Via-Gent Coder` (Agent Center) correctly.
-   **Settings Tab**: **BLOCKING FAIL**. Navigating to `/settings` triggers a **White Screen of Death (WSOD)**.
    -   **Root Cause**: `SyntaxError` in `useProjectStore.ts` (missing export `useProjectStats`). This blocks all configuration of API keys.
-   **Study Tab**: **BLOCKING FAIL**. Same WSOD error as Settings.

## 3. Workspaces & Routing Logic (The "Bounce Back")
**Status**: **FAIL (Conceptual & Technical)**

### The "Project Binding" Problem
You correctly identified that the system "binds" incorrectly. Here is the exact technical behavior derived from testing:

1.  **Direct Access (`/notes`)**:
    -   **Behavior**: Does *not* redirect to `/hub`, but **does not load the Editor**.
    -   **State**: It enters a "Gatekeeper" state (`Notes Workspace` overlay).
    -   **Context**: Auto-creates a **`temp-notes`** project context.
    -   **User Friction**: Users expect to type immediately. Instead, they hit a "Create Project / Quick Notes" wall. The "Quick Notes" button was observed to be **unresponsive** in Phase 1, trapping the user.

2.  **Siloed Contexts**:
    -   Entering **IDE** creates `temp-ide`.
    -   Entering **Notes** creates `temp-notes`.
    -   **Result**: These contexts are **mutually exclusive**. You cannot reference your IDE code in your Notes because the contexts are strictly containerized by the workspace route, not the user's session. This validates your "Incorrect Redirection/Binding" concern.

---

## 4. Console & Architecture Findings
-   **Credential Vault**: **DEAD**. `InvalidAccessError` on key wrapping.
    -   *Impact*: You cannot save API keys. AI features will never work in this state.
-   **Dexie Database**: unstable schema versions cause frequent reset requirements.

---

## Recommendations for Correction

### Immediate (Team B - P0 Stabilization)
1.  **Fix Exports**: Inspect `src/infrastructure/persistence/stores/project/useProjectStore.ts` and ensure `useProjectStats` is correctly exported to unblock **Settings** and **Study**.
2.  **Restore Vault**: Fix the `CredentialVault` crypto implementation to support the current browser environment.

### Architectural (Team A - Routing)
1.  **Unified Project Context**: Remove `temp-ide` and `temp-notes`. Implement a single **`Global Temporary Context`** that persists across route changes.
    -   *Goal*: If I start coding in IDE, let me click "Notes" and write about that code immediately, without a "Create Project" wall.
2.  **Direct-to-Editor**: If `/notes` is accessed without a project, auto-initialize the Global Temp Context and **deep-link strictly to the editor**, bypassing the "Gatekeeper" overlay.

---

**Evidence**:
- Screenshot: `hub_deep_scroll_*.png` (Hub Content)
- Screenshot: `settings_tab_*.png` (WSOD Crash)
- Screenshot: `direct_notes_access_.png` (Gatekeeper UI)
# Deep Audit Report: Client-Side Agentic RAG Platform (Revision 2)
**Date**: 2026-01-07
**Agent**: BMAD Master (@bmad-core-bmad-master)
**Subject**: Hub Content, Routing Logic, and Critical Instability

## Executive Summary
This specific deep-dive audit confirms the platform's routing and project binding logic creates a fragmented user experience, while critical pages (Settings, Study) are completely broken. The "Hub" acts as a functional but "offline-prone" launcher, while workspace routing enforces strict, opaque project binding that confuses users.

---

## 1. Hub & Entry Point Analysis
**Status**: **PARTIAL PASS (UX Issues)**

-   **Content Visibility**: Validated. The Hub renders all expected sections:
    -   **Statistics**: Projects, Storage, Activity.
    -   **Action Cards**: `CREATE_PROJECT`, `FIELD_NOTES` (Notes), `NEURAL_AGENTS` (Agents), etc.
    -   **Bottom Grid**: Functional filters for content types.
-   **Initialization Failure**: P0 Issue. Upon first load, the app incorrectly reports "You're offline" and often requires a "Recover Database" (Dexie Schema Reset) to function. This indicates a **critical breakdown in local persistence reliability**.

## 2. Sidebar & Global Navigation
**Status**: **CRITICAL FAIL**

-   **Agents Tab**: **PASS**. Loads `Via-Gent Coder` (Agent Center) correctly.
-   **Settings Tab**: **BLOCKING FAIL**. Navigating to `/settings` triggers a **White Screen of Death (WSOD)**.
    -   **Root Cause**: `SyntaxError` in `useProjectStore.ts` (missing export `useProjectStats`). This blocks all configuration of API keys.
-   **Study Tab**: **BLOCKING FAIL**. Same WSOD error as Settings.

## 3. Workspaces & Routing Logic (The "Bounce Back")
**Status**: **FAIL (Conceptual & Technical)**

### The "Project Binding" Problem
You correctly identified that the system "binds" incorrectly. Here is the exact technical behavior derived from testing:

1.  **Direct Access (`/notes`)**:
    -   **Behavior**: Does *not* redirect to `/hub`, but **does not load the Editor**.
    -   **State**: It enters a "Gatekeeper" state (`Notes Workspace` overlay).
    -   **Context**: Auto-creates a **`temp-notes`** project context.
    -   **User Friction**: Users expect to type immediately. Instead, they hit a "Create Project / Quick Notes" wall. The "Quick Notes" button was observed to be **unresponsive** in Phase 1, trapping the user.

2.  **Siloed Contexts**:
    -   Entering **IDE** creates `temp-ide`.
    -   Entering **Notes** creates `temp-notes`.
    -   **Result**: These contexts are **mutually exclusive**. You cannot reference your IDE code in your Notes because the contexts are strictly containerized by the workspace route, not the user's session. This validates your "Incorrect Redirection/Binding" concern.

---

## 4. Console & Architecture Findings
-   **Credential Vault**: **DEAD**. `InvalidAccessError` on key wrapping.
    -   *Impact*: You cannot save API keys. AI features will never work in this state.
-   **Dexie Database**: unstable schema versions cause frequent reset requirements.

---

## Recommendations for Correction

### Immediate (Team B - P0 Stabilization)
1.  **Fix Exports**: Inspect `src/infrastructure/persistence/stores/project/useProjectStore.ts` and ensure `useProjectStats` is correctly exported to unblock **Settings** and **Study**.
2.  **Restore Vault**: Fix the `CredentialVault` crypto implementation to support the current browser environment.

### Architectural (Team A - Routing)
1.  **Unified Project Context**: Remove `temp-ide` and `temp-notes`. Implement a single **`Global Temporary Context`** that persists across route changes.
    -   *Goal*: If I start coding in IDE, let me click "Notes" and write about that code immediately, without a "Create Project" wall.
2.  **Direct-to-Editor**: If `/notes` is accessed without a project, auto-initialize the Global Temp Context and **deep-link strictly to the editor**, bypassing the "Gatekeeper" overlay.

---

**Evidence**:
- Screenshot: `hub_deep_scroll_*.png` (Hub Content)
- Screenshot: `settings_tab_*.png` (WSOD Crash)
- Screenshot: `direct_notes_access_.png` (Gatekeeper UI)
