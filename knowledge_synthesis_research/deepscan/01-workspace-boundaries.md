# Deepscan Pass 1: Workspace Boundaries & Module Architecture

**Date:** 2026-01-03
**Status:** Complete

## 1. Architectural Pattern
The codebase follows a **Layer-First Clean Architecture**:
- `src/domain`: Core business logic (Entities, Value Objects). No external dependencies.
- `src/application`: Use cases and orchestration services.
- `src/infrastructure`: External implementations (Persistence, Events).
- `src/presentation`: UI Components and Views.

## 2. Workspace Organization
Workspaces are defined as distinct "modes" within the Presentation layer, but share underlying Domain/Application services.

**Defined Workspaces:**
- `IDE`: Development environment (`src/presentation/components/ide`)
- `Knowledge`: Research/RAG (`src/presentation/components/knowledge`)
- `Study`: Spaced repetition (`src/presentation/components/study`)
- `Notes`: Quick capture (`src/presentation/components/notes`)

**Findings & Observations:**
- **Definition Location:** Workspace types are defined in `src/lib/state/workspace-types`, but UI metadata (icons, colors) is hardcoded in `WorkspaceEnhancedSwitcher.tsx`.
  - *Recommendation:* Move workspace metadata to a `src/domain/constants` or `src/config` registry to allow shared usage (e.g., by Agents).
- **Isolation:** Workspaces appear to be isolated at the Component level (`src/presentation/components/{workspace}`), which is good for code splitting.
- **Cross-Cutting Concerns:** `src/presentation/components/common`, `chat`, `agent` act as shared capabilities.

## 3. Module Boundaries & Dependency Rules
- **Strictness:** High. `src/domain` does not appear to import from `presentation` or `infrastructure`.
- **Agent Integration:** `src/domain/entities/agent.ts` defines the Agent model, ensuring Agents are a core domain concept, not just a UI feature.

## 4. Gaps Detected
- **Module Directory:** No top-level `src/modules` folder. Features are split by layer. This requires strict discipline to keep related feature code (e.g., "Flashcards") connected across layers (`domain/entities/Flashcard` -> `presentation/components/study/Flashcard`).
- **Workspace Services:** Did not yet verify if specific "Workspace Services" exist in `application` (e.g., `IdeService`, `KnowledgeService`) or if logic is leaking into Components. *To be checked in Pass 4.*

## 5. Next Steps (Pass 2)
- Audit **State Management** (Zustand) to see if stores respect these boundaries.
- Audit **Persistence** (Dexie) to ensure data is strictly accessed via Infrastructure repositories.
