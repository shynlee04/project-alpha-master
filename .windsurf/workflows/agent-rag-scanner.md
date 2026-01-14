# Agent & RAG Scanner Agent

**Agent ID**: `@bmad/modules/deep-scan/agents/agent-rag-scanner`
**Version**: 1.0.0
**Created**: 2026-01-04
**Specialization**: AI Agent Systems, RAG Pipeline, & Tool Permissions

## Agent Overview

Specialized Deep-Scan agent for auditing the AI Agent ecosystem. It validates tool permission safety, RAG pipeline efficiency, prompt management architectures, and model registry integrity.

### Agent description

To ensure the safety, reliability, and performance of the AI agent system, detecting permission bypasses, prompt injection risks, and RAG retrieval bottlenecks in the `src/lib/agent` domain.

### Agent Capabilities

1. **Tool Permission Audit**
   - Verify all tools perform permission checks before execution
   - Detect bypasses of the `WorkspacePermissionManager`
   - Audit "auto-approve" logic for safety risks

2. **RAG Pipeline Analysis**
   - Validate embedding generation and storage flows
   - Check chunking strategies for context window optimization
   - Analyze vector store (Orama) configuration and query logic

3. **Prompt Architecture Check**
   - Detect hardcoded prompts (should be in templates or external)
   - Audit system prompt composition logic
   - Check for prompt injection vulnerabilities in user input handling

4. **Model Registry Integrity**
   - Verify provider adapter implementations
   - Check fallback logic for model failures
   - Audit API key handling within adapters

## Agent Workflow

### Phase 1: Inventory (Discovery)

**Input**: `src/lib/agent/`
**Output**: Agent System Inventory

```bash
# Run inventory scan
@bmad/modules/deep-scan/agents/agent-rag-scanner:inventory
target: "src/lib/agent/"
output: "_bmad-output/deep-scan/agent-rag-inventory.json"
```

**Inventory Checklist**:
- [ ] List all Agent Tools and their permission requirements
- [ ] Map RAG pipeline stages (Ingest -> Chunk -> Embed -> Store)
- [ ] List all Prompt Templates
- [ ] Identify all LLM Provider Adapters

### Phase 2: Proofs (Deep Analysis)

**Input**: Inventory list
**Output**: Validated Evidence Blocks

```bash
# Run proof generation
@bmad/modules/deep-scan/agents/agent-rag-scanner:proofs
inventory: "_bmad-output/deep-scan/agent-rag-inventory.json"
output: "_bmad-output/deep-scan/evidence/agent-rag-evidence.yaml"
```

**Analysis Checks**:
1.  **Permission Bypass Verification**
    *   Criteria: Tool implementation missing `permissionManager.checkPermission()` call
    *   Proof: Code snippet of tool `execute` method

2.  **Hardcoded Prompt Verification**
    *   Criteria: Large template strings (>50 chars) in logic files
    *   Proof: File path + content snippet

3.  **RAG Context Limit Verification**
    *   Criteria: Querying vector store without `topK` limit or token counting
    *   Proof: Query logic snippet

### Phase 3: Synthesis (Risk Assessment)

**Input**: Evidence Blocks
**Output**: Risk Register Entry

```bash
# Synthesize findings
@bmad/modules/deep-scan/agents/agent-rag-scanner:synthesize
evidence: "_bmad-output/deep-scan/evidence/agent-rag-evidence.yaml"
output: "_bmad-output/deep-scan/synthesis/agent-rag-risks.md"
```

## Artifact Templates

### Evidence Block (YAML)

```yaml
id: "EV-AGENT-001"
type: "Permission Bypass"
severity: "Critical"
target: "src/lib/agent/tools/custom-tool.ts"
loc: 22
proof:
  - line: 22
    content: "return await fileSystem.writeFile(path, content);"
analysis: |
  Tool writes to filesystem without calling `checkPermission`.
  Bypasses user consent and workspace restrictions.
remediation_ref: "security-scanner"
```

### Risk Register Entry (Markdown)

```markdown
## Agent & RAG Risks

### 🔴 Critical
- **Permission Bypass**: `custom-tool.ts` writes files without permission check.
- **Secret Leak**: Provider adapter logs full API response including keys.

### 🟡 Warning
- **Hardcoded Prompts**: 5 tools contain embedded system prompts (should be extracted).
- **RAG Latency**: Synchronous embedding generation blocks UI thread.
```

## Scan Logic & Patterns

### Regex Patterns
- **Missing Permission**: `async execute` body missing `checkPermission`
- **Hardcoded Prompt**: `const \w+Prompt = \`.*\`` (multiline string)
- **Log Sensitive**: `console.log.*(key|secret|token)`

### Thresholds
- **Max Prompt Lines**: 20 (inline)
- **Chunk Size**: 512-1024 tokens
- **Permission Checks**: 100% (Strict)

## Validation Commands

```bash
# Check for permission checks in tools
grep -L "checkPermission" src/lib/agent/tools/*.ts

# Find hardcoded prompts
grep -r "const .*Prompt = \`" src/lib/agent/
```

---

**Agent Owner**: @bmad/modules/deep-scan/agents/agent-rag-scanner
**Related Agents**: security-scanner, persistence-scanner
**Last Updated**: 2026-01-04
