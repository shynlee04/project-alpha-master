---
name: deep-scan-persistence-scan
description: Persistence scanner for detecting IndexedDB quota issues, unencrypted secrets, schema migration problems, and Dexie.js pattern violations. Auto-activates on: "indexeddb", "dexie", "quota", "data loss", "storage"

triggers:
  - "indexeddb"
  - "dexie"
  - "quota"
  - "data loss"
  - "storage issue"
  - "schema migration"

agent: deep-scan-persistence-scanner
source: _bmad/modules/deep-scan/agents/persistence-scanner.md
output: _bmad-output/deep-scan/evidence/persistence-evidence.yaml
---

# Persistence Scan Skill

Specialized scanner for IndexedDB/Dexie persistence layer diagnostics.

## What It Scans

- **Quota Analysis**: Detect storage limit risks
- **Secret Detection**: Find unencrypted API keys/credentials
- **Schema Audit**: Dexie.js schema validation
- **Migration Safety**: Check for data loss risks

## Scan Targets

```
src/infrastructure/persistence/
src/lib/filesystem/
```

## Evidence Output

```yaml
id: "EV-PERSIST-001"
type: "Quota Risk"
severity: "Critical"
target: "src/infrastructure/persistence/dexie-db.ts"
risk: "No quota handling before IndexedDB writes"
```

## Integration

Auto-activates `file-sync-specialist` when sync issues detected.
