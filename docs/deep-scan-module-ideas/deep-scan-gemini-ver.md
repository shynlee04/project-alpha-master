Based on the comprehensive codetree analysis, I'll now create a **BMAD v6 iterative agent scan framework** that produces exhaustive, evidence-based diagnostics across all architectural domains.[1]

***

## BMAD v6 Deep-Scan Framework for Project Alpha

This framework orchestrates **multiple specialized scanning agents** that operate in cycles, synthesize findings, cross-validate, and produce actionable remediation artifacts. Each agent examines specific architectural domains from raw code, generating evidence-backed reports.

***

### Phase 1: Domain-Specific Scanning Agents

#### **Agent 1: State & Store Architecture Scanner**
**Domain:** Zustand stores, persistence, hydration, cross-store dependencies

**Scan Checklist:**
- **Store Inventory Audit**
  - List all stores in `infrastructure/persistence/stores/`[1]
  - Classify: SoT vs derived cache vs UI ephemeral
  - Evidence: File paths, export signatures, state shape
- **Persistence Boundary Violations**
  - Scan for `persist()` middleware usage patterns
  - Flag stores with overlapping storage keys (collision risk)
  - Evidence: Storage key strings, partialize functions[2]
- **Cross-Store Dependencies**
  - Detect stores importing other stores directly
  - Identify circular import chains (e.g., `agents-store.ts ↔ provider-store.ts`)[2]
  - Evidence: Import statements, dependency graph
- **Selector Anti-Patterns**
  - Scan for destructuring patterns `const { agents, addAgent } = useStore()`
  - Flag component subscriptions without selector isolation
  - Evidence: Hook usage patterns in components[2]
- **Hydration Safety**
  - Verify all persisted stores have version/migration logic
  - Check for race conditions in `useEffect` hydration patterns
  - Evidence: Store initialization order, middleware config[2]

**Artifacts:**
- `store-inventory.md` (classification table, storage keys, dependencies)
- `store-cross-dependencies.md` (circular import chains with severity)
- `persistence-safety-gaps.md` (collision risks, missing migrations)

***

#### **Agent 2: Data Contract & Type Safety Scanner**
**Domain:** TypeScript errors, type boundaries, API contracts

**Scan Checklist:**
- **TypeScript Error Census**
  - Run `tsc --noEmit` and categorize errors:
    - Production vs test files
    - Missing imports vs type mismatches vs unused symbols
  - Separate vitest global errors from application logic[2]
  - Evidence: Error codes (TS2307, TS6196), file paths, line numbers
- **Entity Contract Violations**
  - Audit core entities (`Agent.ts`, `Conversation.ts`, `Provider.ts`)[1]
  - Check for drift between `/core/entities/` and `/domain/entities/`[1]
  - Verify Zod schemas exist at API boundaries
  - Evidence: Type definitions, interface mismatches
- **Barrel Export Compliance**
  - Scan for deep imports bypassing `index.ts` barrels
  - Flag inconsistent export patterns across modules
  - Evidence: Import paths, barrel file coverage
- **Cross-Layer Type Leaks**
  - Detect infrastructure types (`Dexie` tables) bleeding into presentation
  - Verify DTO layer exists between domain and persistence[1]
  - Evidence: Import chains, type dependency graph

**Artifacts:**
- `typescript-error-breakdown.md` (categorized by type, priority, module)
- `entity-contract-drift.md` (schema mismatches, missing DTOs)
- `import-compliance-violations.md` (deep imports, missing barrels)

***

#### **Agent 3: Persistence & IndexedDB Safety Scanner**
**Domain:** Dexie operations, quota handling, transaction safety

**Scan Checklist:**
- **Direct IndexedDB Write Audit**
  - Grep for `db.*.add()`, `db.*.bulkAdd()`, `db.*.put()` without wrappers
  - Identify 79 files flagged in prior validation[2]
  - Evidence: File paths, operation types
- **Quota Handling Gaps**
  - Verify quota warning UI exists for large write operations
  - Check for `QuotaExceededError` handling in catch blocks
  - Evidence: Error handling patterns, user-facing warnings[2]
- **Transaction Rollback Logic**
  - Scan for multi-step writes without `Dexie.transaction()`
  - Verify rollback mechanisms in `sync-transaction/` module[1]
  - Evidence: Transaction boundaries, error recovery paths
- **Silent Failure Patterns**
  - Search for `console.error(...)` followed by `return null` (23 instances flagged)[2]
  - Flag operations that swallow errors without user notification
  - Evidence: Error logging patterns, missing toast/modal alerts
- **Migration Safety**
  - Audit `dexie-db-migrations.ts` for backward compatibility[1]
  - Verify version bump logic and data transformation correctness
  - Evidence: Migration scripts, schema version history

**Artifacts:**
- `indexeddb-safety-audit.md` (unsafe writes, quota handling gaps)
- `silent-failure-inventory.md` (23+ instances with remediation plan)
- `migration-risk-assessment.md` (breaking changes, rollback safety)

***

#### **Agent 4: Architecture & Layer Boundary Scanner**
**Domain:** Clean architecture compliance, cross-layer dependencies

**Scan Checklist:**
- **God Component Detection**
  - Scan for files >300 LOC (17 files flagged)[2]
  - Rank by size: `rag-store.ts` (1,595), `AgentConfigDialog.tsx` (1,089)[2]
  - Evidence: Line counts, responsibility overlap
- **Layer Boundary Violations**
  - Verify dependencies flow: `presentation → application → domain → infrastructure`
  - Flag direct Dexie imports in React components
  - Detect UI logic in domain services
  - Evidence: Import chains, architectural drift map[1]
- **Service Layer Gaps**
  - Identify missing service abstractions (e.g., `AgentService.ts` vs direct store access)[1]
  - Verify use-case layer exists for complex workflows
  - Evidence: Service coverage matrix, direct store subscriptions
- **Barrel Export Structure**
  - Verify each layer has clean index exports
  - Flag inconsistent module boundaries
  - Evidence: Barrel file audit across `application/`, `domain/`, `infrastructure/`[1]

**Artifacts:**
- `god-component-inventory.md` (17 files ranked by size, refactor plan)
- `layer-boundary-violations.md` (cross-layer imports with remediation)
- `service-layer-gaps.md` (missing abstractions, direct store coupling)

***

#### **Agent 5: Agent/RAG Safety & Multimodal Scanner**
**Domain:** Tool permissions, context pipeline, RAG correctness

**Scan Checklist:**
- **Tool Permission Integrity**
  - Verify `tool-permission-manager.ts` enforces workspace boundaries[1]
  - Audit `workspace-tool-filter.ts` for bypass paths
  - Check that all write tools require explicit approval[2]
  - Evidence: Permission checks, approval flows
- **Context Construction Pipeline**
  - Verify explicit pipeline: retrieval → filtering → ranking → packing
  - Check for token budget accounting in `context-window-manager.ts`[1]
  - Flag ad-hoc concatenation without truncation strategy
  - Evidence: Context assembly code, budget enforcement
- **RAG Citation Correctness**
  - Verify citations include source ID + offsets in `citation-types.ts`[1]
  - Check citations survive reindex operations
  - Audit `hybrid-retriever.ts` for citation passthrough[1]
  - Evidence: Citation schema, retrieval flow
- **Multimodal Readiness**
  - Scan `gemini-image-processor.ts`, `gemini-pdf-processor.ts`[1]
  - Verify extraction → embeddings → storage → retrieval pipeline
  - Flag stubbed modalities (audio, video) without feature flags
  - Evidence: Processor implementations, ingestion completeness
- **Agent Workspace Binding**
  - Verify `workspace-binding.ts` prevents cross-workspace tool execution[1]
  - Check `agent-workspace-bindings-slice.ts` for binding enforcement[1]
  - Evidence: Binding validation, execution guards

**Artifacts:**
- `tool-permission-audit.md` (bypass paths, approval integrity)
- `rag-pipeline-gaps.md` (context assembly, citation correctness)
- `multimodal-readiness.md` (modality support, stubbed features)

***

#### **Agent 6: Mobile, I18N, Theme, UX Scanner**
**Domain:** Responsive design, translation completeness, accessibility

**Scan Checklist:**
- **Mobile Reality Check**
  - Audit touch target sizing (44px minimum for buttons/links)
  - Verify scroll virtualization in `FileTree`, `ThreadsList`[1]
  - Flag desktop-only patterns (hover states, drag-drop without alternatives)
  - Evidence: Component markup, CSS breakpoints[2]
- **I18N Completeness**
  - Scan for hardcoded strings not using `t()` hooks
  - Verify all UI strings exist in `i18n/en.json` and `i18n/vi.json`[1]
  - Check error messages have translations
  - Evidence: String extraction, missing keys[2]
- **Theme System Compliance**
  - Verify all colors use CSS variables from `design-tokens.css`[1]
  - Flag hardcoded hex values or inline styles
  - Audit dark mode support across components
  - Evidence: Color usage, theme token coverage
- **Accessibility Gaps**
  - Check ARIA labels on interactive elements
  - Verify keyboard navigation in modals, trees, grids
  - Audit focus management in `AgentConfigDialog.tsx` (1,089 LOC)[2]
  - Evidence: ARIA attributes, focus trap patterns

**Artifacts:**
- `mobile-ux-gaps.md` (touch targets, virtualization, responsive failures)
- `i18n-coverage-audit.md` (hardcoded strings, missing translations)
- `theme-accessibility-gaps.md` (color compliance, ARIA coverage)

***

#### **Agent 7: Cross-Workspace Integration Scanner**
**Domain:** File sync, event bus, project binding

**Scan Checklist:**
- **Cross-Workspace Event Bus**
  - Audit `cross-workspace-event-bus.ts` for event isolation[1]
  - Verify events don't leak between workspaces
  - Check subscription cleanup in workspace transitions
  - Evidence: Event emitter patterns, subscription lifecycle
- **File Sync Status Consistency**
  - Verify `file-sync-service.ts` maintains single SoT for sync status[1]
  - Check for duplicate sync status stores across workspaces
  - Audit `sync-status-helpers-query.ts` for consistency[1]
  - Evidence: Sync state shape, duplication patterns
- **Project-Workspace Binding**
  - Verify projects can bind to multiple workspaces
  - Check `project-bindings-slice.ts` for binding integrity[1]
  - Audit workspace transition logic in `workspace-transition-service.ts`[1]
  - Evidence: Binding schema, transition guards
- **File Reference Correctness**
  - Verify `cross-workspace-file-references.ts` maintains stable file IDs[1]
  - Check FSA handle lifecycle across workspace switches
  - Evidence: File ID stability, handle persistence

**Artifacts:**
- `cross-workspace-event-bus-audit.md` (event isolation, cleanup)
- `file-sync-consistency.md` (SoT violations, duplicate stores)
- `project-binding-integrity.md` (binding schema, transition safety)

***

### Phase 2: Synthesis & Cross-Validation

**Agent 8: Evidence Synthesizer**
- Aggregates findings from Agents 1-7
- Identifies overlapping risks (e.g., god stores + circular deps)
- Produces `risk-register.md` with severity tiers (P0/P1/P2)
- Cross-references with prior validation report[2]

**Agent 9: Gap Analyzer**
- Compares current state to BMAD v6 12-level validation[2]
- Identifies drifts from architectural standards
- Produces `architectural-drift-report.md`

***

### Phase 3: Remediation Planning

**Agent 10: Remediation Planner**
- Converts findings to epics/stories with acceptance criteria
- Sequences work by dependencies (TS errors → god files → circular deps)
- Produces `remediation-backlog.md` with effort estimates

**Agent 11: Validation Command Generator**
- Creates runnable validation scripts for each gap
- Produces `validation-playbook.md` with repeatable commands

***

### Output Artifacts (Complete Set)

| Artifact | Agent | Purpose |
|----------|-------|---------|
| `store-inventory.md` | 1 | Store classification, persistence keys |
| `store-cross-dependencies.md` | 1 | Circular import chains |
| `persistence-safety-gaps.md` | 1 | Collision risks, missing migrations |
| `typescript-error-breakdown.md` | 2 | Categorized TS errors |
| `entity-contract-drift.md` | 2 | Schema mismatches |
| `import-compliance-violations.md` | 2 | Deep imports, barrel gaps |
| `indexeddb-safety-audit.md` | 3 | Unsafe writes, quota gaps |
| `silent-failure-inventory.md` | 3 | 23+ error swallow patterns |
| `migration-risk-assessment.md` | 3 | Schema migration safety |
| `god-component-inventory.md` | 4 | 17 files >300 LOC |
| `layer-boundary-violations.md` | 4 | Cross-layer imports |
| `service-layer-gaps.md` | 4 | Missing abstractions |
| `tool-permission-audit.md` | 5 | Permission bypass paths |
| `rag-pipeline-gaps.md` | 5 | Context assembly, citations |
| `multimodal-readiness.md` | 5 | Modality support status |
| `mobile-ux-gaps.md` | 6 | Touch targets, responsive failures |
| `i18n-coverage-audit.md` | 6 | Missing translations |
| `theme-accessibility-gaps.md` | 6 | Color compliance, ARIA |
| `cross-workspace-event-bus-audit.md` | 7 | Event isolation |
| `file-sync-consistency.md` | 7 | Sync SoT violations |
| `project-binding-integrity.md` | 7 | Binding schema correctness |
| `risk-register.md` | 8 | P0/P1/P2 risks aggregated |
| `architectural-drift-report.md` | 9 | Gap analysis vs standards |
| `remediation-backlog.md` | 10 | Epics/stories with ACs |
| `validation-playbook.md` | 11 | Repeatable validation commands |

***

### Execution Workflow

```yaml
cycle_1_scan:
  - agent_1: state_stores
  - agent_2: types_contracts
  - agent_3: persistence_safety
  
cycle_2_scan:
  - agent_4: architecture_layers
  - agent_5: agent_rag_safety
  - agent_6: mobile_i18n_theme
  
cycle_3_scan:
  - agent_7: cross_workspace_integration
  
cycle_4_synthesize:
  - agent_8: evidence_synthesis
  - agent_9: gap_analysis
  
cycle_5_remediate:
  - agent_10: remediation_planning
  - agent_11: validation_commands
```

Each cycle produces artifacts that feed into subsequent cycles, ensuring exhaustive cross-validation.

***

This framework produces a **complete, evidence-based diagnosis** suitable for a major course correction, addressing all dimensions flagged in the prior deep validation: TypeScript errors, god components, circular deps, unsafe persistence, mobile gaps, and architectural drift.[2][1]
