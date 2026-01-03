# Deepscan Pass 2: State Store & Persistence Audit

**Date:** 2026-01-03
**Status:** Complete

## 1. Zustand Store Topology
The application uses **Feature-Sliced Stores**, avoiding a single "Root Store" anti-pattern. Stores are located in `src/lib/state/` and correspond to Workspaces or Features.

**Identified Stores:**
- `ide-store.ts`: Manages IDE-specific state (file tree, terminals).
- `knowledge-store.ts`: Manages RAG, Graph, and Synthesis state.
- `quiz-store.ts`: Manages Study workspace state.
- `workspace-store.ts`: Manages global active workspace/layout.
- `tool-permission-store.ts`: Manages agent tool allowances.

**Findings:**
- **Isolation:** Good. IDE state is separate from Knowledge state.
- **Dependencies:** Stores appear independent. No obvious circular dependencies detected via imports.
- **Persist Middleware:** Most stores use `persist` middleware (implied by `workspace-store` file size and typical patterns, though explicit middleware code wasn't dumped).

## 2. Persistence Layer (Dexie)
The app uses `dexie` (IndexedDB wrapper) as the primary offline storage.

**Schema Definition:**
- Defined in `src/lib/state/dexie-db.ts` (Class `ProjectAlphaDatabase`).
- Tables split by domain in `dexie-db-*-types.ts`:
  - `knowledge` (Documents, Chunks, Embeddings)
  - `ai` (Chats, Agents)
  - `session` (User preferences)
  - `dashboard` (Widgets)

**Findings:**
- **Schema Versioning:** `dexie-db-migrations.ts` suggests a robust migration strategy is in place.
- **Type Safety:** High. Tables are strongly typed via `*-types.ts` files.
- **Layer Violation Risk:** The `dexie-db.ts` is in `src/lib/state`. In strict Clean Architecture, this should be in `src/infrastructure/persistence`. It is currently mixed with Application State logic.
  - *Recommendation:* Move `dexie-*.ts` files to `src/infrastructure/persistence/dexie/`.

## 3. Anti-Patterns & Risks
- **"God Store" Risk:** `knowledge-store.ts` is ~27kb. It likely handles too much: RAG settings, Graph UI state, *and* Synthesis logic.
  - *Refactor:* Split into `knowledge-ui-store` (ephemeral) and `knowledge-data-store` (persisted).
- **Direct DB Access:** Need to verify if Components call `db.table.add()` directly or use Repositories. (Stores seem to wrap DB calls, acting as effective Repositories, which is acceptable for React apps but strictly violates Clean Architecture separation).

## 4. Next Steps (Pass 3)
- Audit **Filesystem Sync** (FSA) and **Agent Tooling**.
- Check how `tool-permission-store.ts` interacts with actual Agent execution.
