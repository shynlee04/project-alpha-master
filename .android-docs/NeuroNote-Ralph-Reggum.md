Below are two **ready-to-run Ralph Wiggum loop prompts** (Genesis + one Epic loop) that follow the required YAML frontmatter + success-criteria + constraints + validation + `<promise>...</promise>` stop signal pattern.[1][2][3]

## Genesis prompt (repo + governance)

Copy into `PROMPT.md` and run your loop against it.[2][3]

```markdown
---
active: true
iteration: 1
max_iterations: 30
completion_promise: "NeuralNote scaffold complete: governance artifacts created, Expo app boots on Android, validation script passes, and Hello-World local RAG skeleton runs offline."
started_at: "2026-01-02T01:08:00+07:00"
module: "neuralnote-genesis"
---

## Context
You are starting a greenfield project: **NeuralNote** — a local-first Android knowledge OS combining Notion-like blocks/databases, Obsidian-like links/graph/canvas, and NotebookLM-like grounded synthesis (RAG with citations).
This project must be **offline-first**: core flows must work in Airplane Mode.
This repo must be prepared for BMAD v6 workflow automation from day 0.

## Inputs (authoritative)
- Product spec: `NeuralNote-PRD-v1.0.md`
- Technical spec: `NeuralNote-Architecture-v1.0.md`
- Governance spec: `NeuralNote-AGENTS.md`

If any of these input files are missing, STOP and create placeholders with explicit TODO markers and a short “Missing Inputs” section.

## Task
### Phase A — Establish BMAD governance (no app code first unless needed to satisfy validation)
Create or update these files as the **single source of truth**:
1. `PRD.md` (copy contents from `NeuralNote-PRD-v1.0.md`)
2. `architecture.md` (copy contents from `NeuralNote-Architecture-v1.0.md`)
3. `AGENTS.md` (copy contents from `NeuralNote-AGENTS.md`)
4. `sweeping-validation.md`
   - Include the 12-level checklist adapted for mobile + offline + local AI.
   - Include explicit “Evidence required” per level (what file/command proves it).
5. `epics.md`
   - Extract Phase 1 epics/stories from PRD (at minimum: 1.1 Block Editor & Storage, 1.2 Databases, 1.3 Local RAG, 1.4 Import/Export).
   - Each story must include: user story, acceptance criteria, non-goals, and validation commands.
6. `sprint-status.yaml`
   - Track each story with statuses: backlog → drafted → ready-for-dev → in-progress → review → done.
7. `bmm-workflow-status.yaml`
   - Track workflow state: PRD/Architecture/Epics/Sprint/Stories status.

### Phase B — Scaffold the Expo Android app (minimum viable)
Create an Expo + TypeScript app that can boot on Android emulator/device.
- If repo is empty: initialize with `create-expo-app` (blank TypeScript).
- If repo exists: do not re-scaffold; integrate governance and tooling only.

### Phase C — Tooling + validation automation
Add scripts and configs:
- `scripts/ralph-loop.sh` (or equivalent) to run the loop repeatedly.
- `scripts/validate.sh` must run:
  1) formatting/lint
  2) TypeScript typecheck
  3) unit tests (even if minimal placeholder)
  4) a lightweight build sanity check (avoid heavy builds each iteration; see constraints)

Define package scripts (choose the package manager already present in repo: pnpm > yarn > npm):
- `lint`
- `typecheck`
- `test`
- `validate` (calls the above in the right order)

### Phase D — “Hello World Local RAG Skeleton” (architecture-compliant)
Implement only the **interfaces + skeleton** needed to prove end-to-end wiring without committing to heavy native dependencies yet:
- Create `src/services/rag/` with:
  - `Chunker` interface + deterministic chunking implementation (pure TS).
  - `Embedder` interface + a mock embedder implementation (returns stable vectors).
  - `VectorStore` interface + an in-memory implementation for now.
  - `RAGService` that: ingest(text) → chunk → embed → store; query(text) → embed → retrieve topK.
- Add a minimal “RAG Playground” screen that can:
  - Ingest a paragraph
  - Query and show top matches with mock “citations” (IDs + excerpts)

Important: this is NOT the final on-device model. It is a skeleton proving the contracts in `architecture.md`.

## Success criteria (must all be true)
- [ ] `PRD.md`, `architecture.md`, `AGENTS.md`, `sweeping-validation.md`, `epics.md`, `sprint-status.yaml`, `bmm-workflow-status.yaml` exist and are internally consistent.
- [ ] Expo app boots on Android emulator/device (document exact command in README).
- [ ] `scripts/validate.sh` exits 0 on a clean checkout.
- [ ] “RAG Playground” screen works fully offline using the skeleton pipeline.
- [ ] No placeholder-only “TODO-driven” completion: where something is deferred, it must be listed as an explicit story in `epics.md`.

## Constraints
- Max background tasks: 1
- Heavy operations (Android build/prebuild) are allowed only on iteration 1 and final iteration, not every iteration.
- No external API calls for RAG (must run offline).
- Keep files small: components <200 lines, non-UI modules <300 lines; split if needed.

## Validation (run every iteration)
- `./scripts/validate.sh`
- If validation fails, fix before proceeding to the next iteration.

## Course-correction protocol
If you discover missing inputs, contradictory requirements, or an infeasible constraint:
1) Document the issue in `docs/course-corrections/YYYY-MM-DD.md`
2) Create a sprint change proposal `docs/sprint-change-proposals/YYYY-MM-DD-neuralnote.md`
3) Update `PRD.md`/`architecture.md`/`epics.md` accordingly
4) Resume the loop

## Completion signal
Output exactly:
<promise>NeuralNote scaffold complete: governance artifacts created, Expo app boots on Android, validation script passes, and Hello-World local RAG skeleton runs offline.</promise>
```

## Epic prompt (Epic 1.1: Block Editor + Storage)

Use this after Genesis completes (it assumes your governance files and scaffold exist).[3][2]

```markdown
---
active: true
iteration: 1
max_iterations: 80
completion_promise: "Epic 1.1 complete: Block editor + local storage implemented with TDD, all AC met, and 12-level validation passed."
started_at: "2026-01-02T01:08:00+07:00"
module: "epic-1.1-block-editor-storage"
---

## Context
Epic 1.1 builds the “Notion-inspired Neural Vault” foundation: block-based pages, persisted locally, editable with mobile-grade performance and undo/redo.

## Inputs (must read first)
- `PRD.md` (Epic 1.1 acceptance criteria)
- `architecture.md` (layer boundaries, data model decisions, performance targets)
- `AGENTS.md` + `sweeping-validation.md`
- `epics.md` (story definitions)
- `sprint-status.yaml` (current status)

## Task (Story cycle, repeat until Epic done)
For each story in Epic 1.1 (e.g., 1.1.1–1.1.4 as defined in `epics.md`):
### Phase 1 — Story context
- Create `docs/stories/1.1.X-<slug>.md` including:
  - User story
  - Acceptance criteria (testable)
  - Non-goals
  - Data contracts (types/interfaces)
  - Validation commands
  - Risks + mitigations
- Update `sprint-status.yaml` → `ready-for-dev`

### Phase 2 — TDD implementation
- RED: Write failing tests first (Jest).
- GREEN: Implement minimal code to pass.
- REFACTOR: Enforce file size limits and clean architecture boundaries.
- Required constraints:
  - UI components never call DB directly.
  - Store/state is single source of truth.
  - No “fake UI wiring”: every feature must be reachable via navigation and have at least one E2E path stubbed (Maestro can be placeholder until later, but story must track it).

### Phase 3 — Validation per story
Run:
- `./scripts/validate.sh`

If pass:
- Mark story done in `sprint-status.yaml`
- Add a brief implementation note to the story file (what changed, where to test)

## Epic-level acceptance criteria
- [ ] Create/edit pages composed of blocks (at least: heading, paragraph, bulleted list, numbered list, code block).
- [ ] Persist blocks locally (real persistence; no in-memory-only).
- [ ] Undo/redo works (minimum 20 steps) and is covered by unit tests.
- [ ] Block operations exist: insert, delete, move, duplicate.
- [ ] Meets mobile constraints from `sweeping-validation.md` (touch targets, offline, perf budgets as defined).

## Constraints
- Max background tasks: 1
- Avoid heavy Android build tasks; rely on `validate.sh` unless UI is broken.
- No scope creep into Databases/Graph/RAG beyond what Epic 1.1 explicitly requires.

## Completion signal
Output exactly:
<promise>Epic 1.1 complete: Block editor + local storage implemented with TDD, all AC met, and 12-level validation passed.</promise>
```
---
---
active: true
iteration: 1
max_iterations: 30
completion_promise: "NeuralNote scaffold complete: BMAD governance established, Expo app initialized with Tamagui/Zustand/op-sqlite, and 'Hello World' Local RAG pipeline validated."
started_at: "2026-01-02T01:15:00+07:00"
module: "neuralnote-genesis-expo"
---

## 1. System Context & Directives
You are the **BMAD Architect Agent** bootstrapping **NeuralNote**: a local-first, privacy-centric Knowledge OS (Notion + Obsidian + NotebookLM) built on **Expo (Android)**.

**Core Tech Stack (Non-Negotiable):**
- **Runtime:** Expo (Managed Workflow with Prebuild).
- **Language:** TypeScript (Strict).
- **UI:** Tamagui (for performance & animations).
- **State:** Zustand + MMKV (JSI persistence).
- **Database:** `op-sqlite` (Fastest JSI SQLite).
- **Vector Search:** `sqlite-vec` (Embedded in op-sqlite) OR pure C++ implementation if extension unavailable.
- **Local AI:** `react-native-executorch` (or placeholder architecture for Phase 1).

## 2. The Loop Task
You must execute the following phases in order. Do not skip validation.

### Phase A: The Regulatory Regime (Governance)
Before writing code, establish the laws of the repo.
1.  **Create `PRD.md`**: Paste the full content of `NeuralNote-PRD-v1.0.md` (Concept: Notion/Obsidian/NotebookLM hybrid).
2.  **Create `architecture.md`**: Paste `NeuralNote-Architecture-v1.0.md`.
3.  **Create `AGENTS.md`**: Paste `NeuralNote-AGENTS.md`.
4.  **Create `sweeping-validation.md`**:
    - Map the 12 levels to Expo constraints (e.g., L2: FlashList, L5: Permissions, L9: JSI-only for DB).
5.  **Create `epics.md`**: Define the Phase 1 Epics (1.1 Block Editor, 1.2 DB, 1.3 RAG).
6.  **Create `sprint-status.yaml`** & `bmm-workflow-status.yaml`.

### Phase B: The Foundation (Scaffold)
Initialize the Expo project *only if `package.json` does not exist*.
1.  **Init:** `npx create-expo-app@latest . --template blank-typescript`
2.  **Config:** Setup `app.json` with correct bundle ID (`com.neuralnote`) and plugins.
3.  **Dependencies (Install exactly these):**
    - UI: `@tamagui/core`, `@tamagui/config`, `react-native-reanimated`.
    - Data: `@op-engineering/op-sqlite`, `react-native-mmkv`, `zustand`.
    - Nav: `expo-router`, `react-native-safe-area-context`.
4.  **File Structure:** Create the directories defined in `architecture.md` (`src/components`, `src/services`, `src/stores`, `src/native`).

### Phase C: The "Hello World" RAG Skeleton
Prove the architecture works without building the full app.
1.  Create `src/services/db.service.ts`: Initialize `op-sqlite`.
2.  Create `src/services/rag/rag.service.ts`:
    - Implement a `ingest(text: string)` function that chunks text (mock/simple split).
    - Implement a `retrieve(query: string)` function.
    - *Constraint:* Since `sqlite-vec` might be complex to configure in iteration 1, use a **naive JSON-based vector store** for this "Hello World" ONLY, just to prove the interface `IRAGService`.
3.  Create a simple UI screen `app/index.tsx`:
    - Input text field.
    - "Ingest" button.
    - "Query" button.
    - Display results.

### Phase D: Validation Infrastructure
1.  Create `scripts/validate.sh`. It must run:
    - `tsc --noEmit` (Type check).
    - `eslint src/` (Lint).
    - `jest` (Unit tests - scaffold a dummy test if needed).
2.  Ensure `package.json` has these scripts.

## 3. Constraints
- **Strict TypeScript:** No `any`. Use interfaces defined in `architecture.md`.
- **No Remote Calls:** The RAG pipeline must run offline (mock the Embedding generation if the model isn't downloaded yet).
- **Validation First:** Run `./scripts/validate.sh` before declaring Phase B or C done.

## 4. Completion Signal
Output exactly this tag when the app boots and validation passes:
<promise>NeuralNote scaffold complete: BMAD governance established, Expo app initialized with Tamagui/Zustand/op-sqlite, and 'Hello World' Local RAG pipeline validated.</promise>

