---
name: deep-scan-persistence-scanner
description: |
  Specialized scanner for persistence layer diagnostics. Use when:

  - Detecting IndexedDB quota issues
  - Finding unencrypted secrets in storage
  - Identifying schema migration problems
  - Auditing Dexie.js patterns

  Auto-activation triggers:
  - "indexeddb", "dexie", "storage issue"
  - "quota exceeded", "data loss risk"
  - "schema migration", "unencrypted secret"

  Loads full configuration from: _bmad/modules/deep-scan/agents/persistence-scanner.md
color: "#FFA500"
model: MiniMaxAI/MiniMax-M2.1
mode: subagent
temperature: 0.1
tools:
  write: "md, xml, yaml, json"
  edit:  "md, xml, yaml, json"
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

# Persistence Scanner Agent

**Source**: `_bmad/modules/deep-scan/agents/persistence-scanner.md`

**When Activated**: Use `agent-profile-loader` to fetch full agent configuration from BMAD module.

**Core Capabilities**:
- IndexedDB Quota Analysis (detect storage limit risks)
- Secret Detection (find unencrypted API keys/credentials)
- Schema Audit (Dexie.js schema validation)
- Migration Safety (check for data loss risks)

**Scan Targets**:
- `src/infrastructure/persistence/`, `src/lib/filesystem/`

**Output**: `_bmad-output/deep-scan/evidence/persistence-evidence.yaml`

**Integration**: Coordinates with `state-scanner`, `security-scanner`
