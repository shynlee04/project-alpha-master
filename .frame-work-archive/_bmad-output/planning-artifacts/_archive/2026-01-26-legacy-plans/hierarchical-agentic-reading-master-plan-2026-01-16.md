# Hierarchical Agentic Reading System — Master Plan
**EPIC ID**: HARS-001
**Created**: 2026-01-16
**Status**: PLANNING → PHASE 1
**Priority**: P0 (Foundation for Context Architecture)

---

## Executive Summary

This EPIC implements a **Hierarchical Agentic Reading System** that transforms how coding agents understand and navigate complex codebases. Inspired by production-proven patterns from Aider, Factory.ai, and the 2026 Context Engineering movement, this system provides:

1. **Token-efficient codebase understanding** via tree-sitter AST parsing
2. **Sectional file parsing** for MD/YAML/JSON/XML governance documents
3. **Context compression** with anchored summaries
4. **Sub-agent delegation** with handoff protocols
5. **GraphRAG-style retrieval** for cross-file relationships

**Estimated Effort**: 10-14 hours across 5 phases
**Expected Duration**: 1-2 weeks
**Team**: Team A (with potential Team B coordination on Dexie integration)

---

## The Master Branch Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         HARS-001 MASTER PLAN                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ROOT                                                                       │
│  ├── PHASE 1: Repo Map Service ───────────────────┐                         │
│  │   ├── HARS-01: Tree-sitter wrapper             │                         │
│  │   ├── HARS-02: Symbol extractor                │                         │
│  │   ├── HARS-03: Graph ranking engine            │                         │
│  │   └── HARS-04: Token budget manager            │                         │
│  │                                              │                           │
│  ├── PHASE 2: Sectional Parser ─────────────────┤                           │
│  │   ├── HARS-05: Frontmatter extractor           │                           │
│  │   ├── HARS-06: Section indexer                 │                           │
│  │   ├── HARS-07: Breadcrumb trail                │                           │
│  │   └── HARS-08: Drill-bounce controller         │                           │
│  │                                              │                           │
│  ├── PHASE 3: Context Compression ──────────────┤                           │
│  │   ├── HARS-09: Anchored summary service       │                           │
│  │   ├── HARS-10: Two-threshold compressor       │                           │
│  │   ├── HARS-11: Artifact preservation           │                           │
│  │   └── HARS-12: Breadcrumb manager              │                           │
│  │                                              │                           │
│  ├── PHASE 4: Sub-Agent Coordinator ────────────┤                           │
│  │   ├── HARS-13: Delegation router               │                           │
│  │   ├── HARS-14: Handoff protocol                │                           │
│  │   ├── HARS-15: Result condenser                │                           │
│  │   └── HARS-16: Parallel executor                │                           │
│  │                                              │                           │
│  ├── PHASE 5: BMAD Integration ─────────────────┤                           │
│  │   ├── HARS-17: Event bus wiring                │                           │
│  │   ├── HARS-18: LOOP_STATE updater              │                           │
│  │   ├── HARS-19: Governance integration          │                           │
│  │   └── HARS-20: Validation & testing             │                           │
│  │                                              │                           │
│  └── BRANCHING LOGIC                              │                           │
│      │                                                                           │
│      ├── Each phase has a GATE before proceeding to next                    │
│      ├── Phases 1-3 can run sequentially (Foundation)                        │
│      ├── Phase 4 requires Phase 1-3 complete (needs context to delegate)  │
│      └── Phase 5 requires Phase 4 complete (needs delegation to wire events)│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase Dependencies & Branching Rules

```yaml
phase_dependencies:
  PHASE_1:
    requires: []
    blocks: [PHASE_2, PHASE_3]
    can_run_in_parallel_with: []
    rationale: "Foundation - all other phases depend on repo map"

  PHASE_2:
    requires: [PHASE_1]
    blocks: []
    can_run_in_parallel_with: [PHASE_3]
    rationale: "Sectional parsing independent of compression"

  PHASE_3:
    requires: [PHASE_1]
    blocks: [PHASE_4]
    can_run_in_parallel_with: [PHASE_2]
    rationale: "Compression needed before sub-agent can return condensed results"

  PHASE_4:
    requires: [PHASE_1, PHASE_2, PHASE_3]
    blocks: [PHASE_5]
    can_run_in_parallel_with: []
    rationale: "Sub-agent coordinator needs all context services ready"

  PHASE_5:
    requires: [PHASE_1, PHASE_2, PHASE_3, PHASE_4]
    blocks: []
    can_run_in_parallel_with: []
    rationale: "Final integration - all foundation must exist"
```

---

## Phase 1: Repo Map Service (Foundation)

**Goal**: Provide Aider-style repository maps using tree-sitter AST parsing

### HARS-01: Tree-sitter Wrapper
```typescript
// src/infrastructure/context/tree-sitter/TreeSitterWrapper.ts
interface LanguageConfig {
  parser: any;
  query: string; // tags.scm for symbol extraction
}

class TreeSitterWrapper {
  private languages: Map<string, LanguageConfig>;

  parseFile(filePath: string, lang: string): ASTNode;
  getSymbols(filePath: string): Symbol[];
}
```

**Deliverables**:
- TreeSitter wrapper class
- Language configurations for TypeScript, MD, YAML, JSON
- Unit tests for parsing accuracy

### HARS-02: Symbol Extractor
```typescript
interface SymbolSignature {
  name: string;
  type: 'class' | 'function' | 'interface' | 'type' | 'variable';
  signature: string; // Call signature only, no body
  line: number;
  column: number;
  exports: boolean; // Is this exported?
}

class SymbolExtractor {
  extract(ast: ASTNode): SymbolSignature[];
  findReferences(ast: ASTNode, symbolName: string): Reference[];
}
```

### HARS-03: Graph Ranking Engine
```typescript
interface DependencyGraph {
  nodes: string[]; // file paths
  edges: { from: string; to: string; weight: number }[];
}

class GraphRankingEngine {
  buildGraph(symbols: Map<string, SymbolSignature[]>): DependencyGraph;
  rankByCentrality(graph: DependencyGraph): Map<string, number>;
  selectTopFiles(ranking: Map<string, number>, tokenBudget: number): string[];
}
```

### HARS-04: Token Budget Manager
```typescript
interface RepoMapEntry {
  path: string;
  symbols: SymbolSignature[];
  importance: number;
}

interface RepoMapConfig {
  maxTokens: number; // Default 1000
  includeSignatures: boolean;
  includeDocStrings: boolean;
}

class RepoMapService {
  async buildRepoMap(
    projectRoot: string,
    config: RepoMapConfig
  ): Promise<RepoMapEntry[]>;

  formatForLLM(entries: RepoMapEntry[]): string;
}
```

**Phase 1 Gate**:
- [ ] Tree-sitter parses .ts/.tsx files accurately
- [ ] Symbol extraction matches TypeScript definitions
- [ ] Graph ranking prioritizes correctly (validated against Aider output)
- [ ] Repo map fits within 1k token budget

---

## Phase 2: Sectional Parser (Governance Documents)

**Goal**: Enable drill-bounce traversal of MD/YAML/JSON/XML files

### HARS-05: Frontmatter Extractor
```typescript
interface Frontmatter {
  raw: string; // Original YAML/JSON
  parsed: Record<string, unknown>;
  format: 'yaml' | 'json';
}

class FrontmatterExtractor {
  extract(markdown: string): Frontmatter;
  validate(frontmatter: Frontmatter, schema?: unknown): boolean;
}
```

### HARS-06: Section Indexer
```typescript
interface SectionIndex {
  id: string; // e.g., "sec-1-2-3"
  path: string; // e.g., "1.2.3"
  level: number; // 1-6 for h1-h6
  title: string;
  lineStart: number;
  lineEnd: number;
  parentPath: string | null;
  children: string[]; // Child section IDs
}

interface ParsedDocument {
  frontmatter: Frontmatter;
  sections: Map<string, SectionIndex>;
  rootSections: string[]; // Top-level sections
}

class SectionIndexer {
  indexMarkdown(markdown: string): ParsedDocument;
  buildSectionTree(sections: Map<string, SectionIndex>): SectionTree;
}
```

### HARS-07: Breadcrumb Trail
```typescript
interface Breadcrumb {
  path: string;
  title: string;
  level: number;
}

class BreadcrumbService {
  getBreadcrumbs(doc: ParsedDocument, sectionId: string): Breadcrumb[];
  formatForLLM(breadcrumbs: Breadcrumb[]): string;
}
```

### HARS-08: Drill-Bounce Controller
```typescript
interface DrillRequest {
  documentId: string;
  sectionPath: string; // e.g., "1.2"
  depth: number; // How many levels to drill
  includeChildren: boolean;
}

class SectionalController {
  drill(request: DrillRequest): string; // Returns section content
  bounce(currentSection: string): string | null; // Returns parent section
  getOutline(): SectionTree; // Returns full tree for navigation
}
```

**Phase 2 Gate**:
- [ ] Frontmatter extraction handles YAML and JSON
- [ ] Section indexing preserves hierarchy correctly
- [ ] Breadcrumb navigation works bidirectionally (up/down)
- [ ] Drill-bounce maintains state across calls

---

## Phase 3: Context Compression

**Goal**: Implement Factory.ai's anchored summary pattern

### HARS-09: Anchored Summary Service
```typescript
interface AnchoredSummary {
  anchorMessageId: string; // The message this summary covers
  summary: string; // Condensed content
  artifacts: ArtifactRef[]; // Files created/modified
  breadcrumbs: Breadcrumb[]; // For reconstruction
  timestamp: string;
}

class SummaryService {
  createSummary(messages: Message[]): AnchoredSummary;
  mergeSummaries(existing: AnchoredSummary, new: AnchoredSummary): AnchoredSummary;
  retrieve summaries: Map<string, AnchoredSummary>;
}
```

### HARS-10: Two-Threshold Compressor
```typescript
interface CompressionThresholds {
  fillLine: number; // When to trigger compression
  drainLine: number; // Max tokens to retain after compression
}

interface CompressionResult {
  compressedMessages: Message[];
  summary: AnchoredSummary;
  tokensBefore: number;
  tokensAfter: number;
}

class ContextCompressor {
  shouldCompress(currentTokens: number, thresholds: CompressionThresholds): boolean;
  compress(messages: Message[], thresholds: CompressionThresholds): CompressionResult;
  getActiveContext(summaries: AnchoredSummary[], recentMessages: Message[]): string;
}
```

### HARS-11: Artifact Preservation
```typescript
interface ArtifactRef {
  type: 'file' | 'symbol' | 'section';
  path: string;
  summary: string; // Brief description
  line?: number; // For symbols
}

class ArtifactRegistry {
  registerArtifact(artifact: ArtifactRef): void;
  getRelevantArtifacts(query: string): ArtifactRef[];
  formatForLLM(artifacts: ArtifactRef[]): string;
}
```

### HARS-12: Breadcrumb Manager (Reconstruction)
```typescript
interface ReconstructionBreadcrumb {
  domain: string; // e.g., "persistence", "routing"
  symbol: string; // Function/class name
  filePath: string;
  line: number;
}

class ReconstructionService {
  saveBreadcrumbs(context: string): ReconstructionBreadcrumb[];
  reconstructFromBreadcrumbs(breadcrumbs: ReconstructionBreadcrumb[]): Promise<string>;
}
```

**Phase 3 Gate**:
- [ ] Compression preserves key information (session intent, artifact trail)
- [ ] No redundant re-summarization (incremental updates only)
- [ ] Breadcrumbs enable context reconstruction
- [ ] Token reduction > 50% on test conversations

---

## Phase 4: Sub-Agent Coordinator

**Goal**: Enable delegation with handoff and result condensation

### HARS-13: Delegation Router
```typescript
type SubAgentType =
  | 'ast-grep-scanner'
  | 'glob-scanner'
  | 'tree-sitter-parser'
  | 'vector-search'
  | 'sectional-reader';

interface DelegationRequest {
  agentType: SubAgentType;
  query: string;
  scope?: string; // e.g., "src/infrastructure/"
  tokenBudget: number;
  options?: Record<string, unknown>;
}

class DelegationRouter {
  route(request: DelegationRequest): SubAgentType;
  delegate(request: DelegationRequest): Promise<DelegationResult>;
}
```

### HARS-14: Handoff Protocol
```typescript
interface Handoff {
  id: string;
  fromAgent: string;
  toAgent: SubAgentType;
  context: CondensedContext;
  expectedOutput: OutputFormat;
  status: 'pending' | 'in_progress' | 'complete' | 'failed';
}

interface CondensedContext {
  sessionIntent: string;
  relevantArtifacts: ArtifactRef[];
  breadcrumbTrail: ReconstructionBreadcrumb[];
  queryContext: string; // Specific query context
}

class HandoffProtocol {
  createHandoff(request: DelegationRequest): Handoff;
  executeHandoff(handoff: Handoff): Promise<DelegationResult>;
  validateResult(result: DelegationResult, expected: OutputFormat): boolean;
}
```

### HARS-15: Result Condenser
```typescript
interface DelegationResult {
  handoffId: string;
  agentType: SubAgentType;
  findings: Finding[];
  breadcrumbs: ReconstructionBreadcrumb[];
  tokensUsed: number;
  metadata: Record<string, unknown>;
}

interface Finding {
  type: string;
  location: { file: string; line?: number };
  summary: string; // One-line summary
  detail?: string; // Optional deeper detail
}

class ResultCondenser {
  condense(rawResult: unknown): DelegationResult;
  mergeResults(results: DelegationResult[]): DelegationResult;
  formatForParentAgent(result: DelegationResult): string;
}
```

### HARS-16: Parallel Executor
```typescript
interface ParallelRequest {
  id: string;
  request: DelegationRequest;
  dependencies?: string[]; // IDs of other requests this depends on
}

class ParallelExecutor {
  async executeParallel(requests: ParallelRequest[]): Promise<DelegationResult[]>;
  buildDependencyGraph(requests: ParallelRequest[]): DependencyGraph;
  topologicalSort(graph: DependencyGraph): string[];
}
```

**Phase 4 Gate**:
- [ ] Router correctly delegates based on query type
- [ ] Handoff protocol preserves context across agent boundaries
- [ ] Result condensation reduces token usage by > 70%
- [ ] Parallel execution handles dependencies correctly

---

## Phase 5: BMAD Integration

**Goal**: Wire into existing BMAD event-driven workflow

### HARS-17: Event Bus Wiring
```yaml
# Event definitions for _bmad-ext/orchestrator/event-bus.yaml

events:
  context_scan_required:
    id: "E-HARS-SCAN"
    priority: "medium"
    handler: "repo-map-service"
    payload:
      scope: string
      depth: "shallow" | "medium" | "deep"

  section_drill_required:
    id: "E-HARS-DRILL"
    priority: "medium"
    handler: "sectional-controller"
    payload:
      document_id: string
      section_path: string

  compression_required:
    id: "E-HARS-COMPRESS"
    priority: "high"
    handler: "context-compressor"
    payload:
      current_tokens: number
      thresholds: CompressionThresholds

  sub_agent_delegation:
    id: "E-HARS-DELEGATE"
    priority: "medium"
    handler: "delegation-router"
    payload:
      agent_type: SubAgentType
      query: string
```

### HARS-18: LOOP_STATE Updater
```typescript
class ContextLOOPStateUpdater {
  updateReadingProgress(sessionId: string, progress: ReadingProgress): void;
  registerContextArtifact(artifact: ContextArtifact): void;
  updateCompressionStats(stats: CompressionStats): void;
}

interface ReadingProgress {
  currentSection: string;
  breadcrumbTrail: string[];
  sectionsVisited: string[];
  tokensConsumed: number;
}
```

### HARS-19: Governance Integration
```typescript
// Wire into existing governance checks
interface GovernanceCheck {
  hasRepoMap(): boolean;
  contextWithinBudget(): boolean;
  breadcrumbsPresent(): boolean;
  noHallucinations(): boolean; // Verify against actual code
}

class HARSIntegration {
  performChecks(): GovernanceCheck;
  triggerCompressionIfNeeded(): void;
  delegateToSubAgentIfNeeded(query: string): void;
}
```

### HARS-20: Validation & Testing
```typescript
describe('HARS Integration', () => {
  it('should build repo map within token budget');
  it('should drill and bounce through sections');
  it('should compress context without losing key info');
  it('should delegate to correct sub-agent type');
  it('should hand off context between agents');
  it('should integrate with BMAD event bus');
});
```

**Phase 5 Gate**:
- [ ] All events fire correctly on triggers
- [ ] LOOP_STATE updates are consistent
- [ ] Governance checks pass at each gate
- [ ] End-to-end test: query → repo map → drill → compress → delegate → result

---

## File Structure

```
src/infrastructure/context/
├── index.ts                          # Public API
├── repo-map/
│   ├── RepoMapService.ts             # HARS-04
│   ├── TreeSitterWrapper.ts          # HARS-01
│   ├── SymbolExtractor.ts             # HARS-02
│   └── GraphRankingEngine.ts         # HARS-03
├── sectional/
│   ├── SectionalParser.ts            # HARS-05-08
│   ├── FrontmatterExtractor.ts       # HARS-05
│   ├── SectionIndexer.ts             # HARS-06
│   ├── BreadcrumbService.ts          # HARS-07
│   └── DrillBounceController.ts      # HARS-08
├── compression/
│   ├── ContextCompressor.ts          # HARS-09-12
│   ├── SummaryService.ts             # HARS-09
│   ├── ArtifactRegistry.ts           # HARS-11
│   └── ReconstructionService.ts      # HARS-12
└── delegation/
    ├── DelegationRouter.ts           # HARS-13-16
    ├── HandoffProtocol.ts            # HARS-14
    ├── ResultCondenser.ts            # HARS-15
    └── ParallelExecutor.ts           # HARS-16

types/context/
├── repo-map.ts                       # Repo map types
├── sectional.ts                      # Section types
├── compression.ts                    # Compression types
└── delegation.ts                     # Delegation types
```

---

## Integration with Existing Stack

```typescript
// Usage in existing AI/chat context
import { RepoMapService } from '@/infrastructure/context';
import { SectionalController } from '@/infrastructure/context';
import { ContextCompressor } from '@/infrastructure/context';

// In AI prompt preparation
const contextService = new ContextService({
  repoMap: new RepoMapService(),
  sections: new SectionalController(),
  compressor: new ContextCompressor(),
});

const context = await contextService.buildContext({
  query: userQuery,
  tokenBudget: 10000,
  includeRepoMap: true,
  compressionThresholds: { fillLine: 8000, drainLine: 5000 },
});
```

---

## Dependencies & External Packages

```json
{
  "dependencies": {
    "web-tree-sitter": "^0.22.0",
    "@tree-sitter-grammars/tree-sitter-typescript": "^0.21.0",
    "@tree-sitter-grammars/tree-sitter-markdown": "^0.7.0",
    "@tree-sitter-grammars/tree-sitter-yaml": "^0.6.0",
    "yaml": "^2.5.0"
  }
}
```

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Repo Map Token Reduction** | > 80% vs full files | Compare token counts |
| **Context Compression Ratio** | > 50% reduction | Before/after tokens |
| **Section Retrieval Latency** | < 100ms | Benchmark drill operation |
| **Sub-Agent Token Savings** | > 70% | Compare delegated vs inline |
| **Hallucination Rate** | < 5% | Verify against actual codebase |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Tree-sitter parsing errors | Medium | High | Extensive unit tests, fallback to regex |
| Token budget exceeded | Low | Medium | Conservative defaults, configurable |
| Sub-agent timeout | Medium | Medium | Timeout handling, graceful degradation |
| BMAD integration conflicts | Low | High | Test in isolation first, phased rollout |

---

**Document Status**: DRAFT — Ready for Phase 1 Implementation
**Next Action**: HARS-01 (Tree-sitter Wrapper)
**Approval Required**: User confirmation to proceed with Phase 1
