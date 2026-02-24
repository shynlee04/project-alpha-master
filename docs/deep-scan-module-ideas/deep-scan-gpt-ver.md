---

A BMAD v6 “Codebase Deep-Scan” module can be run purely from repo code (no docs) by splitting the tree into scan domains, having specialized agents extract *raw facts with path-level evidence*, and then synthesizing a risk register + course-correction backlog. The attached codetree already shows multiple architectural layers and at least two parallel “state/persistence” stacks that must be reconciled via evidence-led scanning (e.g., `infrastructure/persistence/**` plus `lib/state/**`, and duplicated event-bus locations).codetree-for-analysis.md

## Module scope (from codetree facts)

Use the codetree as the authoritative scan map and treat each top-level boundary as a domain that gets its own evidence inventory pass: `core/**`, `domain/**`, `application/**`, `infrastructure/**`, `lib/**`, `presentation/**`, `routes/**`, `hooks/**`, `i18n/**`, `styles/**`, `workers/**`. The tree indicates a “clean-ish” layering intent (`core`, `domain`, `application`, `infrastructure`, `presentation`) coexisting with a large `lib/**` that also contains agent, RAG, filesystem, sync, state, and events—this is a prime drift/spaghetti vector to diagnose with import graphs and concrete call chains. The store/persistence footprint is broad and split across `infrastructure/persistence/*` (Dexie DB, helpers, orchestrator, and `stores/**`) and also `lib/state/**` (Dexie + workspace store + migrations), which is a *code-level* signal for potential dual-source-of-truth and boundary leakage that must be proven/quantified by scan agents.codetree-for-analysis.md

## BMAD deep-scan workflow (iterative, evidence-first)

**Phase A — Inventory (raw facts only):** each agent produces an inventory artifact with counts, file lists, and “why this belongs to this domain” purely by path and import references (no opinions yet). **Phase B — Dependency & boundary proofs:** agents generate import graphs and trace “write paths” (UI event → store action → service → persistence) for high-risk areas like agents/tools, RAG indexing, filesystem sync, and conversation threads (these are all explicitly present as subtrees under `lib/**` and `infrastructure/persistence/stores/**`). **Phase C — Synthesis & remediation:** a lead architect agent merges evidence into a ranked risk register (P0–P2) and converts each risk into a BMAD story with acceptance criteria, required tests, and a measurable validation command set.codetree-for-analysis.md

## Evidence protocol (what “proof” looks like)

Standardize every finding into an “Evidence Block” so results are audit-grade and directly actionable:

- **Finding:** one sentence, falsifiable (e.g., “Two independent persistence stacks exist for workspace state.”)codetree-for-analysis.md
- **Evidence:** file paths + symbols (exports/imports) and grep-able patterns (e.g., `lib/state/workspace-store.ts` alongside `infrastructure/persistence/stores/workspace/**`)codetree-for-analysis.md
- **Impact surface:** which modules depend on it (routes/workspaces/features) using import-graph outputs anchored to specific entrypoints such as `router.tsx`, `routes/**`, and workspace pages under `presentation/components/**`codetree-for-analysis.md
- **Remediation shape:** refactor plan expressed as interfaces/contracts to introduce (DTOs, repositories, event contracts), not just “move files”codetree-for-analysis.md
- **Validation:** exact commands and expected deltas (e.g., “circular deps = 0”, “only one SoT store for workspace context”), tied to the modules involvedcodetree-for-analysis.md

## Domain scan playbooks (what each agent must prove)

Below are the core scan tracks implied by the codetree (each track outputs a standalone artifact plus append-only updates per iteration).codetree-for-analysis.md

- **State & stores (SoT + duplication):** enumerate all stores in `infrastructure/persistence/stores/**` (agents, conversation, filesystem snapshots, IDE slices, knowledge slices, project store, permissions, rag slices, workspace context/provider) and compare against `lib/state/**` and other store-like modules in `lib/notes/**`, `lib/workspace/**` to prove where state is authored vs mirrored.codetree-for-analysis.md
- **Persistence boundaries (Dexie + IndexedDB):** map all Dexie DB definitions/migrations/helpers under `infrastructure/persistence/**` (e.g., `dexie-db*.ts`, `dexie-db-helpers/**`, `dexie-db-migrations.ts`) and then detect any “side DB” usage under `lib/persistence/**`, `lib/rag/indexeddb-storage.ts`, and notes embedding worker bridges to prove whether persistence is centralized or fragmented.codetree-for-analysis.md
- **Events & cross-workspace coupling:** inventory event buses and event stores under both `infrastructure/events/**` and `lib/events/**`, plus cross-workspace hooks (`hooks/use-cross-workspace-events.ts`, `lib/events/use-cross-workspace-events.ts`) to prove duplication and whether event types/contracts are unified or split-brain.codetree-for-analysis.md
- **Agent/tool security & data contracts:** trace tool permission logic from UI config (`presentation/components/agent/**` and `stores/permissions/tool-permission-store.ts`) into runtime tool execution (`lib/agent/tools/**`, `tool-permission-manager.ts`, `workspace-permission-manager.ts`, `workspace-tool-filter.ts`) to prove write-approval gates, tool scoping, and contract enforcement points.codetree-for-analysis.md
- **RAG correctness (index + retrieval + citations):** prove end-to-end flows from UI panels (`presentation/components/rag/**`, `components/rag/**`) into store slices (`infrastructure/persistence/stores/rag/**`) and runtime RAG engine (`lib/rag/**`, including chunk strategies, embedding cache/service, hybrid retriever, Orama index adapter) to locate where citation integrity and index lifecycle are enforced vs assumed.codetree-for-analysis.md
- **Routing/entrypoint wiring & feature reachability:** start at `router.tsx` and `routes/**` and prove which stores/services are actually reachable per workspace route (IDE/Knowledge/Notes/Study/Hub), identifying dead modules, orphan features, and cross-workspace leakage.codetree-for-analysis.md

## Required outputs (artifacts for course-correction)

To “complete diagnose” in BMAD terms, the scan should end with these artifacts (all must be evidence-backed, path-linked, and internally consistent with the codetree):codetree-for-analysis.md

- `artifacts/scan-inventory/DOMAIN_INVENTORY.md` per domain (state, persistence, events, agent/tools, rag, filesystem sync, UI/routing, i18n/theme) listing files, exported symbols, and module ownership.codetree-for-analysis.md
- `artifacts/scan-proofs/WRITE_PATHS.md` containing at least 10 traced write flows (agent config save, tool execution log write, note edit persistence, project binding change, indexing start/stop, snapshot sync) with concrete call chains.codetree-for-analysis.md
- `artifacts/scan-proofs/IMPORT_GRAPH.md` + `CYCLES.md` (cycles enumerated with exact edges) focused especially on “store imports store” and “UI imports persistence” boundary violations.codetree-for-analysis.md
- `artifacts/risk-register/RISKS.md` with P0–P2 items, each linked to evidence blocks and annotated with “blast radius” (routes + workspaces impacted).codetree-for-analysis.md
- `artifacts/course-correction/BACKLOG.md` converting each P0/P1 risk into an epic/story set with acceptance criteria that explicitly eliminate the proven boundary violation/duplication (e.g., unify event bus, collapse dual state stacks, enforce repository interfaces).codetree-for-analysis.md

If the target is “sweep through all files”, the next needed input is the **exact BMAD module name** and how you want to partition ownership (by top-level tree vs by capability: agent/RAG/sync/UI), because the codetree supports both, but the artifact set and iteration cadence will differ.

[Deep Scan V2](https://www.notion.so/Deep-Scan-V2-2de926f31a4d80148966c45cc7c4b23e?pvs=21)