---
name: governance-rules
description: Critical governance rules for AI agents and workflows
version: 1.0.0
updated: 2026-01-04
---

# Governance Rules for AI Agents

## 🚨 CRITICAL: Read Before Any Structural Change

This document defines MANDATORY governance rules that ALL AI agents MUST follow when executing workflows that modify codebase structure.

---

## Rule 1: Post-Workflow Documentation Updates

After completing ANY of these workflows, you MUST run governance enforcement:

### Triggering Workflows
- `eliminate-god-stores`
- `normalize-components`
- `workspace-file-system-e2e`
- `notes-sync-strategy`
- `knowledge-sync-strategy`
- Any store refactoring or migration
- Any component splitting or consolidation
- Any import/export path changes

### Required Actions
1. Run `/governance-enforcement` workflow
2. Update `AGENTS.md` with new file locations
3. Run `/bmad-bmm-workflows-generate-project-context`
4. Update sprint status YAML

---

## Rule 2: Repomix Usage

When using repomix for codebase analysis:

### ALWAYS Exclude
```
*.md, node_modules, .git, dist, build, cache, *.txt, *.xml, 
*.log, coverage, __tests__, *.test.*, .claude, .opencode, 
_bmad, _bmad-output, .agent, knowledge_synthesis_research
```

### Configuration
Use `repomix.config.json` in project root or pass `--ignore` flags

### MANDATORY Cleanup
After analysis completes, DELETE repomix output files:
```bash
find . -name "repomix-output*" -delete
find . -name ".repomix-output*" -delete
```

---

## Rule 3: TypeScript Error Handling

### Code Files (ENFORCE)
- All TypeScript errors in production code MUST be addressed
- Use incremental checking: `pnpm exec tsc --noEmit --incremental`

### Test Files (EXCLUDE)
- TypeScript errors in `*.test.ts`, `*.test.tsx`, `__tests__/` are NON-BLOCKING
- Do not count test file errors in metrics
- Filter: `grep -v "\.test\." | grep -v "__tests__"`

---

## Rule 4: Sprint Status Updates

After EVERY story completion:

1. Update `_bmad-output/sprint-artifacts/arc-sprint-status.yaml`:
   - Mark story status as DONE
   - Update progress percentage
   - Log artifacts created
   
2. Update `_bmad/modules/architecture-remediation/artifacts/epic-tracking.md`:
   - Mark story checkboxes
   - Update health score if applicable

---

## Rule 5: Handoff Protocol

When switching between agents or completing phases:

### Handoff Artifact Template
```markdown
## 📋 HANDOFF: {agent_from} → {agent_to}

**Task:** {task_description}
**Phase:** {phase}/{total}
**Timestamp:** {ISO_timestamp}

### Completed
- {what_was_done}

### Artifacts Created
- {file_path}: {description}

### Validation Results
- TypeScript: ✅/❌
- Tests: {count} passing
- Size compliance: ✅/❌

### Next Action
{what_needs_to_happen_next}
```

---

## Rule 6: MCP Research Protocol

Before implementing unfamiliar patterns:

### Required Steps
1. Query Context7 MCP for official documentation
2. Query DeepWiki for semantic understanding
3. Query Exa/Tavily for recent examples
4. Document findings in Context XML

### Minimum Validation
- 3+ MCP servers queried
- 5+ successful iterations per research topic

---

## Rule 7: File Size Limits

### Stores
- Individual slices: ≤ 120 lines
- Combined stores: ≤ 300 lines
- God stores (>500 lines): MUST be split

### Components
- React components: ≤ 300 lines
- Custom hooks: ≤ 150 lines
- Utility files: ≤ 200 lines

### Action on Violation
If creating a file that exceeds limits, STOP and use:
- `/bmad-arc-eliminate-god-stores` for stores
- `/bmad-arc-normalize-components` for components

---

## Rule 8: Backward Compatibility

When refactoring stores or components:

### Facade Pattern (MANDATORY)
```typescript
// Old export path continues to work
// src/stores/legacy-store.ts
export * from './new-location/store';
export { useLegacyStore } from './new-location/store';
```

### Migration Period
- Keep facades for minimum 2 weeks
- Track deprecation in AGENTS.md
- Remove only after all consumers updated

---

## Governance Enforcement Checklist

After any structural change, verify:

- [ ] AGENTS.md updated with new paths
- [ ] CLAUDE.md updated if patterns changed (if exists)
- [ ] project-context.md regenerated
- [ ] sprint-status.yaml updated
- [ ] Repomix output files deleted
- [ ] All file size limits respected
- [ ] Backward compatibility maintained
- [ ] TypeScript passes (code files only)
- [ ] Tests pass (if modified)

---

**This document is authoritative. Violations require immediate correction.**
