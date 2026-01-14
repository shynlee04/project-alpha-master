# Agent/AI/RAG/Multimodality Scanner

**Domain:** agent_ai_rag_multimodality
**Priority:** P0 (CRITICAL - Most Heavy-Weight)
**Created:** 2026-01-10
**Status:** Specification (Implementation Pending)

---

## description

Govern the most heavy-weight and complex ecosystem in the project:
- Agents with CRUD tools
- RAG (Retrieval Augmented Generation) context management
- Conversation thread storage
- Multimodal input/output handling

**Why P0 Critical:** Without governance, this ecosystem becomes:
- A cluster of overlapping components
- A web of conflicting agents
- A source of cross-domain coupling issues
- A maintenance nightmare

---

## Scanner Scope

### 1. Agent Tool Governance

**Target:** `src/domain/tools/**/*.ts`, `src/domain/agents/**/*.ts`

**Checks:**
- **Overlapping Tool Detection**: Multiple tools with similar functionality
- **CRUD Permission Validation**: CRUD tools have proper permission checks
- **Tool Count per Agent**: No agent has >10 CRUD tools
- **Tool Description Quality**: All tools have clear descriptions

**Output:**
```typescript
interface AgentToolReport {
  agent_id: string;
  tool_count: number;
  crud_tool_count: number;
  overlapping_tools: string[];
  missing_permissions: string[];
  poorly_described_tools: string[];
}
```

**Thresholds:**
- `max_crud_tools_per_agent`: 10
- `max_tool_overlap_score`: 0.3 (30%)
- `permission_required_for_crud`: true

---

### 2. RAG Context Governance

**Target:** `src/infrastructure/ai/**/*.ts`, `src/domain/rag/**/*.ts`

**Checks:**
- **Workspace Isolation**: RAG contexts are isolated per workspace
- **Context Overlap Detection**: No >15% overlap between workspace contexts
- **Context Freshness**: RAG contexts have freshness timestamps
- **Vector Storage**: Embedding vectors have proper isolation

**Output:**
```typescript
interface RAGContextReport {
  workspace_id: string;
  context_isolated: boolean;
  overlap_percentage: number;
  overlap_with_workspaces: string[];
  context_freshness_hours: number;
  vector_storage_isolated: boolean;
}
```

**Thresholds:**
- `max_context_overlap`: 0.15 (15%)
- `context_freshness_hours`: 24
- `workspace_isolation_required`: true

---

### 3. Conversation Thread Governance

**Target:** `src/domain/conversations/**/*.ts`, `src/infrastructure/threads/**/*.ts`

**Checks:**
- **Thread Age**: No threads older than 720 hours (30 days) without archival
- **Thread Ownership**: Each thread has clear ownership (workspace, user)
- **Thread Privacy**: Cross-workspace thread access is blocked
- **Thread Cleanup**: Old threads are archived/compressed

**Output:**
```typescript
interface ConversationThreadReport {
  thread_id: string;
  age_hours: number;
  requires_archive: boolean;
  workspace_id: string;
  cross_workspace_access: boolean;
  ownership_clear: boolean;
}
```

**Thresholds:**
- `max_thread_age_hours`: 720
- `archive_threshold_hours`: 720
- `cross_workspace_access_allowed`: false

---

### 4. Multimodal I/O Governance

**Target:** `src/presentation/ai/**/*.tsx`, `src/infrastructure/media/**/*.ts`

**Checks:**
- **Image Input Validation**: Image inputs are validated and sanitized
- **Media Storage**: Media files are stored per-workspace
- **Multimodal Routing**: Multimodal inputs route to correct workspace
- **Media Cleanup**: Old media files are cleaned up

**Output:**
```typescript
interface MultimodalReport {
  media_type: "image" | "audio" | "video";
  input_validated: boolean;
  storage_isolated: boolean;
  routing_correct: boolean;
  cleanup_scheduled: boolean;
}
```

**Thresholds:**
- `multimodal_context_isolation`: true
- `media_validation_required`: true
- `max_media_age_days`: 30

---

## Scan Patterns

```yaml
agent_tools:
  - "src/domain/tools/**/*.ts"
  - "src/domain/agents/**/*.ts"
  - "**/agent*.ts"
  - "**/tool*.ts"

rag_context:
  - "src/infrastructure/ai/**/*.ts"
  - "src/domain/rag/**/*.ts"
  - "**/rag*.ts"
  - "**/embedding*.ts"
  - "**/vector*.ts"

conversation_threads:
  - "src/domain/conversations/**/*.ts"
  - "src/infrastructure/threads/**/*.ts"
  - "**/thread*.ts"
  - "**/conversation*.ts"

multimodal:
  - "src/presentation/ai/**/*.tsx"
  - "src/infrastructure/media/**/*.ts"
  - "**/multimodal*.ts"
  - "**/media*.ts"
```

---

## Governance Rules

### Rule 1: No Overlapping Tools

**Problem:** Multiple agents with similar tools create confusion

**Detection:**
```typescript
function detectOverlappingTools(tools: Tool[]): Overlap[] {
  const similarities = tools.flatMap(t1 =>
    tools.filter(t2 => t1 !== t2)
      .map(t2 => ({
        tools: [t1.id, t2.id],
        similarity: cosineSimilarity(t1.description, t2.description)
      }))
      .filter(s => s.similarity > 0.7)
  );
  return similarities;
}
```

**Action:** Warn about overlap, suggest consolidation

---

### Rule 2: CRUD Requires Permissions

**Problem:** CRUD tools without permissions can modify anything

**Detection:**
```typescript
function validateCRUDPermissions(tools: Tool[]): PermissionIssue[] {
  return tools
    .filter(t => t.category === "crud")
    .filter(t => !t.hasPermissionCheck)
    .map(t => ({
      tool: t.id,
      severity: "critical",
      message: `CRUD tool ${t.id} lacks permission check`
    }));
}
```

**Action:** BLOCK if any CRUD tool lacks permissions

---

### Rule 3: Workspace Context Isolation

**Problem:** RAG contexts leaking between workspaces

**Detection:**
```typescript
function checkContextIsolation(contexts: RAGContext[]): IsolationIssue[] {
  return contexts.flatMap(c1 =>
    contexts.filter(c2 => c1.workspace_id !== c2.workspace_id)
      .map(c2 => ({
        workspace1: c1.workspace_id,
        workspace2: c2.workspace_id,
        overlap_percentage: calculateOverlap(c1.vectors, c2.vectors)
      }))
      .filter(o => o.overlap_percentage > 0.15)
  );
}
```

**Action:** BLOCK if overlap exceeds 15%

---

### Rule 4: Thread Archival

**Problem:** Old conversation threads consume storage without cleanup

**Detection:**
```typescript
function findStaleThreads(threads: Thread[]): Thread[] {
  const max_age = 720 * 60 * 60 * 1000; // 30 days in ms
  const now = Date.now();
  return threads.filter(t => now - t.created_at > max_age && !t.archived);
}
```

**Action:** Warn about stale threads, suggest archival

---

## Output Format

### Scanner Result

```typescript
interface AgentAIRAGScannerResult {
  scanner: "agent-ai-rag-scanner";
  timestamp: string;
  status: "PASS" | "WARN" | "FAIL";
  domains: string[];

  agent_tools: {
    total_agents: number;
    total_tools: number;
    crud_tools: number;
    overlapping_tools: number;
    permission_issues: number;
    report: AgentToolReport[];
  };

  rag_context: {
    total_workspaces: number;
    isolated_workspaces: number;
    overlapping_contexts: number;
    stale_contexts: number;
    report: RAGContextReport[];
  };

  conversation_threads: {
    total_threads: number;
    active_threads: number;
    stale_threads: number;
    archived_threads: number;
    report: ConversationThreadReport[];
  };

  multimodal: {
    image_inputs_validated: boolean;
    audio_inputs_validated: boolean;
    video_inputs_validated: boolean;
    media_isolated: boolean;
    report: MultimodalReport[];
  };

  recommendations: string[];
  critical_issues: string[];
}
```

---

## Integration with Enforcement Checks

### Context First Check

- **Domain Mapping**: agent, ai, rag, multimodal keywords → agent_ai_rag_multimodality domain
- **File Selection**: Only scan agent/AI-related files
- **Relevance Scoring**: Prioritize CRUD tools, RAG contexts, threads

### Expert Analysis Check

- **Category Detection**: Agent/AI changes often = architectural_conflict
- **Impact Assessment**: Check for cross-workspace implications
- **Dependency Check**: Verify workspace isolation exists

### Research Trigger

Auto-trigger research when:
- Adding new agent CRUD operations
- Implementing RAG for first time
- Adding multimodal input support
- Refactoring agent tool structure

---

## Stage Gating Integration

This scanner enforces stage-gating for Agent/AI features:

- **Stage 0**: Scanner operational, detecting issues
- **Stage 1**: Basic tools validated (read-only, CRUD permissions)
- **Stage 2**: RAG context isolation verified
- **Stage 3**: Multimodal I/O validated
- **Stage 4**: Multi-agent orchestration safe

**Example Gate:**
```
User: "Add RAG context management"

Governance: "🔒 BLOCKED - Stage 2 feature
  Current Stage: 0 (Governance Foundation)
  agent-ai-rag-scanner not yet operational

  Required stages:
    ✅ Stage 0: Governance Foundation (in progress)
    🔒 Stage 1: Basic Agent Tools
    🔒 Stage 2: RAG Context Management (requested)

  Complete Stage 0 scanner first."
```

---

## Implementation Checklist

- [ ] Agent tool overlap detection
- [ ] CRUD permission validation
- [ ] RAG context isolation check
- [ ] Conversation thread archival check
- [ ] Multimodal I/O validation
- [ ] Cross-workspace access blocking
- [ ] Tool count enforcement
- [ ] Context overlap calculation
- [ ] Thread age tracking
- [ ] Media storage isolation

---

**Lines:** ~220 (estimated)
**Dependencies:** domains.yaml, expert-analysis-engine.ts
**Stage:** Week 2 (P0 Scanners)
