---
name: deep-scan-agent-rag-scanner
description: |
  Specialized scanner for AI Agent & RAG diagnostics. Use when:

  - Detecting tool permission bypasses
  - Finding prompt injection risks
  - Identifying RAG pipeline issues
  - Auditing agent tool safety

  Auto-activation triggers:
  - "tool permission", "agent security", "rag pipeline"
  - "prompt injection", "agent tool"
  - "citation safety", "context window"

  Loads full configuration from: _bmad/modules/deep-scan/agents/agent-rag-scanner.md
mode: subagent
model: MiniMax/MiniMax-M2.1
temperature: 0.1
tools:
  write_md_json_yaml_xml: true
  edit_md_json_yaml_xml: true
  bash:  true
  read:  true
  mcp: true
  glob: true
  grep: true
  list: true
  search: true
  serena mcp: true
  repomix mcp: true
  tavily mcp: true
  context7 mcp: true
  deepwiki mcp: true
  tanstack mcp: true
---

# Agent/RAG Scanner Agent

**Source**: `_bmad/modules/deep-scan/agents/agent-rag-scanner.md`

**When Activated**: Use `agent-profile-loader` to fetch full agent configuration from BMAD module.

**Core Capabilities**:
- Tool Permission Audit (detect permission bypasses)
- Prompt Safety Analysis (identify injection vectors)
- RAG Pipeline Validation (chunking, embedding, retrieval)
- Citation Verification (check for hallucination risks)

**Scan Targets**:
- `src/lib/agent/`, `src/components/agent/`, `src/lib/rag/`

**Output**: `_bmad-output/deep-scan/evidence/agent-rag-evidence.yaml`

**Integration**: Coordinates with `security-scanner`, `types-scanner`
