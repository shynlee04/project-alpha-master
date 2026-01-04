---
name: deep-scan-agent-rag-scan
description: AI Agent & RAG scanner for detecting tool permission bypasses, prompt injection risks, RAG pipeline issues, and citation safety problems. Auto-activates on: "tool permission", "rag pipeline", "prompt injection", "agent tool"

triggers:
  - "tool permission"
  - "rag pipeline"
  - "prompt injection"
  - "agent tool"
  - "citation safety"
  - "context window"

agent: deep-scan-agent-rag-scanner
source: _bmad/modules/deep-scan/agents/agent-rag-scanner.md
output: _bmad-output/deep-scan/evidence/agent-rag-evidence.yaml
---

# Agent/RAG Scan Skill

Specialized scanner for AI agent tool safety and RAG pipeline validation.

## What It Scans

- **Tool Permission Audit**: Detect permission bypasses
- **Prompt Safety**: Identify injection vectors
- **RAG Pipeline**: Chunking, embedding, retrieval validation
- **Citation Verification**: Check for hallucination risks

## Scan Targets

```
src/lib/agent/
src/components/agent/
src/lib/rag/
```

## Evidence Output

```yaml
id: "EV-AGENT-001"
type: "Permission Bypass"
severity: "Critical"
target: "src/lib/agent/tools/write.ts"
issue: "Tool executes without workspace validation"
```

## Integration

Escalates to security review for P0 permission bypasses.
