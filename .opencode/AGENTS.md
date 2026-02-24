# AGENTS.md - Project Alpha Constitution
**Version:** 4.0.0 | **Updated:** 2026-01-29 | **Status:** ACTIVE

---

## 1. NON-NEGOTIABLE RULES (ENFORCED BY HOOKS)

These rules are **automatically enforced** by pre-execution hooks. Violations are **blocked**.

| # | Rule | Enforcement |
|---|------|-------------|
| 1 | **Skills Mandatory** - Use appropriate SKILL before ANY work | Hook blocks execution without skill |
| 2 | **Document Stamping** - ALL `.md` files: `name-YYYY-MM-DD.md` + frontmatter | Hook validates filename & timestamp |
| 3 | **Staleness Check** - Never consume docs >2h old without validation | Hook blocks reads of stale files |
| 4 | **Tool Constraints** - Delegation MUST specify tool_permissions | Hook validates permission matrix |
| 5 | **Verification First** - NO "done" without fresh evidence | Hook requires test/lint output |

---

## 2. ESSENTIAL COMMANDS

```bash
# Type Checking (FAST)
pnpm typecheck:fast        # tsgo native compiler

# Testing
pnpm test:fast             # Parallel thread pool

# Governance
pnpm governance            # Size + import checks
```

---

## 3. PROJECT STRUCTURE (CANONICAL PATHS)

```
src/
├── routes/                    # TanStack Router ONLY
├── presentation/              # React UI ONLY
│   ├── components/
│   ├── hooks/
│   └── layouts/
├── domain/                    # Business Logic ONLY
│   ├── entities/
│   ├── services/
│   └── types/
└── infrastructure/            # External Interfaces ONLY
    ├── persistence/
    ├── filesystem/
    └── sync/
```

**FORBIDDEN**: `src/lib/*`, `@/lib/*`, `@/stores/*`

---

## 4. CODE STANDARDS

### TypeScript
```typescript
// ✅ Explicit return types on routes
loader: async ({ params }): Promise<{ project: Project }> => {
  return { project: await fetchProject(params.projectId) }
}

// ✅ useShallow for Zustand
const { items } = useStore(useShallow((state) => ({ items: state.items })));
```

### 8-Bit Design
```css
/* ✅ REQUIRED */
border-radius: 0;              /* Sharp corners */
box-shadow: 4px 4px 0 0;       /* Pixel shadows */

/* ❌ FORBIDDEN */
border-radius: 0.5rem;         /* Too rounded */
backdrop-filter: blur();       /* Glassmorphism */
```

### File Size Limits
| Type | Max Lines | Action |
|------|-----------|--------|
| Stores | 300 | Split immediately |
| Components | 400 | Extract hooks |
| Services | 500 | Decompose |

---

## 5. WORKFLOW PROTOCOL

### Story Lifecycle
1. **Load Skill**: `skill:story` before any story work
2. **Pre-Planning**: Research gate (hooks enforce)
3. **Implementation**: TDD (RED → GREEN → REFACTOR)
4. **Validation**: All checks pass (hooks verify)
5. **Completion**: Update AGENT-STATE.yaml

### Delegation Template
```yaml
tool_permissions:
  write: [true/false]
  edit: [true/false]
  bash: [true/false]
  task: [true/false]
role_boundaries: [CAN/CANNOT]
output: [path, success_criteria, timebox]
```

---

## 6. AGENT ROLES

| Agent | Purpose | Permissions |
|-------|---------|-------------|
| **dev** | Implementation, TDD | write: src/, bash: test/lint |
| **analyst** | Research, requirements | write: analysis/, bash: false |
| **architect** | System design, ADRs | write: adr/, bash: false |
| **reviewer** | Code review | write: reviews/, edit: false |
| **test** | Testing | write: tests/, bash: test |
| **writer** | Documentation | write: docs/, bash: false |
| **ux** | UX/UI design | write: design/, bash: false |
| **pm** | Product requirements | write: prd/, bash: false |

---

## 7. NEVER DO / ALWAYS DO

### NEVER
- Skip skill loading
- Use `src/lib/` imports
- Write >400 line components
- Trust assumptions without evidence
- Skip verification before claims

### ALWAYS
- Load skill first
- Use canonical paths
- Split at 400 lines
- Run tests before "done"
- Update AGENT-STATE.yaml

---

## 8. STATUS FILES

| File | Purpose | Update Frequency |
|------|---------|------------------|
| `AGENT-STATE.yaml` | Session state | Every action |
| `artifact-registry.yaml` | Artifact tracking | On creation |

---

## 9. MIGRATION NOTES

This is **v4.0** - Migrated from BMAD-ext to OpenCode Native:
- 82 skills → 10 skills (on-demand loading)
- 7 wrapper layers → 1 layer (flat)
- 450K framework lines → 2.5K lines
- 35% context overhead → 5%
- 1.1% governance compliance → 95% (enforced)

---

**Lines**: ~200
**Last Updated**: 2026-01-29
