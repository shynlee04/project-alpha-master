---
name: deep-scan-persistence-scanner
description: Specialized scanner for persistence layer diagnostics. Use when:\n\n- Detecting IndexedDB quota issues\n- Finding unencrypted secrets in storage\n- Identifying schema migration problems\n- Auditing Dexie.js patterns\n\nAuto-activation triggers:\n- "indexeddb", "dexie", "storage issue"\n- "quota exceeded", "data loss risk"\n- "schema migration", "unencrypted secret"\n\nLoads full configuration from: _bmad/modules/deep-scan/agents/persistence-scanner.md
model: sonnet
color: orange
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
