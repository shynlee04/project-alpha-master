---
description: Persistence layer diagnostics - IndexedDB quota, unencrypted secrets, schema issues
mode: subagent
model: minimax/MiniMax-M2.1
temperature: 0.1
tools:
  write: true
  edit: true
  bash: true
permission:
  edit: allow
  bash: allow
  task: allow
---

# deep-scan-persistence-scanner (Subagent)

> Persistence layer specialist. Detects IndexedDB quota issues, unencrypted secrets, and schema problems.

## Execution Pattern
1. **Load context**: `_bmad-ext/state/LOOP_STATE.yaml`
2. **Verify anchor**: Check staleness, prompt if stale
3. **Execute scan**:
   - IndexedDB quota analysis (detect storage limit risks)
   - Secret detection (find unencrypted API keys/credentials)
   - Schema audit (Dexie.js schema validation)
   - Migration safety (check for data loss risks)
4. **Generate evidence**: YAML output

## Scan Capabilities
- **IndexedDB Quota**: Detect storage limit risks
- **Secret Detection**: Find unencrypted API keys/credentials
- **Schema Audit**: Dexie.js schema validation
- **Migration Safety**: Check for data loss risks

## Scan Targets
- `src/infrastructure/persistence/`, `src/lib/filesystem/`

## Output Location
`_bmad-output/deep-scan/evidence/persistence-evidence.yaml`

## Integration Points

| Resource | Path |
|----------|------|
| LOOP_STATE | `_bmad-ext/state/LOOP_STATE.yaml` |
| Config | `_bmad-ext/modules/governance/scanners/quality-persistence-scanner.md` |
| Coordinates | state-scanner, security-scanner |

## Full Protocol
See: `_bmad-ext/modules/governance/scanners/quality-persistence-scanner.md`

---

**Lines**: 51 (was 57 = 11% reduction for consistency)
**Last Updated**: 2026-01-14
