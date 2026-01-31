# AGENTS.md - Project Alpha Constitution
**Version:** 3.0.0 | **Updated:** 2026-01-29T16:00:00+07:00 | **Status:** ACTIVE CONSTITUTION

---

## 🏛️ AGENT CONSTITUTION - NON-NEGOTIABLE RULES

### 1. SKILLS ARE MANDATORY
**EVERY TASK** must use appropriate SKILL(s). No exceptions.
- Check SKILL list before ANY response
- Not using SKILL? → 3 paragraphs explaining why
- Still not using? → 5 more paragraphs

### 2. DOCUMENT STAMPING (ABSOLUTE)
**ALL** `.md` files MUST have:
- **Filename**: `name-YYYY-MM-DD.md`
- **Frontmatter**: Exact timestamp from system
- **NO FABRICATED DATES** - Use real time commands

### 3. STALENESS CHECK (2-HOUR RULE)
**NEVER** consume documents >2 hours old without validation:
- Check file modification time
- Verify against git status
- Refresh stamps if valid

### 4. TOOL CONSTRAINTS (DELEGATION REQUIRED)
**EVERY** sub-agent delegation MUST specify:
```yaml
tool_permissions:
  write: [true/false]
  edit: [true/false] 
  bash: [true/false]
  task: [true/false]
role_boundaries: [what they CAN and CANNOT do]
output: [report path, success criteria, timebox]
```

### 5. VERIFICATION BEFORE CLAIMS
**NO** "done" without fresh evidence:
```bash
pnpm typecheck:fast    # Must pass
pnpm test:fast         # Must pass
pnpm governance        # Must pass
```
Run → Read output → THEN claim.

---

## 🚀 QUICK START

### For New Agents
1. **Read** this file completely
2. **Check** `bmm-workflow-status.yaml` for current work
3. **Load** relevant SKILL(s) for your task
4. **Run** verification commands before claiming completion

### Essential Commands
```bash
# Type Checking (FAST - 10x speedup)
pnpm typecheck:fast        # tsgo native compiler
pnpm typecheck:watch       # Watch mode

# Testing
pnpm test:fast             # Parallel thread pool
pnpm test [pattern]        # Single test file

# Governance
pnpm governance            # Size + import checks
pnpm governance:size       # File size limits
pnpm governance:imports    # Import path validation

# Dependencies
pnpm deps:circular         # Check cycles
pnpm lint:fix              # Auto-fix ESLint
```

---

## 📁 PROJECT STRUCTURE

### Canonical Paths (STRICT)
```
src/
├── routes/                    # TanStack Router ONLY
├── presentation/              # React UI ONLY
│   ├── components/
│   │   ├── ui/               # Design system primitives
│   │   ├── common/           # Shared components
│   │   ├── layout/           # Layout components
│   │   ├── notes/            # Notes-specific
│   │   └── ide/              # IDE-specific
│   ├── layouts/              # Page layouts
│   └── hooks/                # React hooks
├── domain/                    # Business Logic ONLY
│   ├── entities/             # Domain entities
│   ├── services/             # Domain services
│   ├── types/                # Domain types
│   └── interfaces/           # Service contracts
└── infrastructure/            # External Interfaces ONLY
    ├── persistence/
    │   ├── dexie-db.ts
    │   └── stores/          # Zustand stores
    ├── filesystem/          # Storage adapters
    ├── sync/                # File sync logic
    └── events/              # Event bus
```

### FORBIDDEN Paths
```
❌ @/lib/*           → Use @/infrastructure/* or @/domain/*
❌ @/stores/*        → NEVER existed
❌ Relative imports crossing layers
❌ PascalCase filenames (use kebab-case)
```

### 🚨 NO-WORKSPACE MANDATE (ABSOLUTE)
**See:** `.planning/SOURCE-OF-TRUTH.md` (Part 6: What is BANNED)

The following terms are **BANNED** from the codebase:
```
❌ WorkspaceBindings  → Use PluginType[] or ProjectPlugins
❌ workspaceBindings  → Use plugins or enabledPlugins
❌ WorkspaceId        → Use PluginType
❌ workspaceId        → Use projectId (files belong to projects)
❌ workspace-* files  → Rename to plugin-*, platform-*, or domain name
```

**Architecture:** Project-centric + Plugin-based
- Files belong to PROJECTS (projectId only)
- Plugins offer FEATURES (editor, notes, chat)
- Platform determines available plugins
- NO artificial workspace silos

---

## 🎨 CODE STANDARDS

### TypeScript
```typescript
// ✅ ALWAYS: Explicit return types on routes
loader: async ({ params }): Promise<{ project: Project }> => {
  return { project: await fetchProject(params.projectId) }
}

// ✅ ALWAYS: useShallow for Zustand
const { items, addItem } = useStore(
  useShallow((state) => ({ items: state.items, addItem: state.addItem }))
);

// ❌ NEVER: Implicit any
// ❌ NEVER: Multiple store selectors (causes re-renders)
```

### 8-Bit Design System (NON-NEGOTIABLE)
```css
/* ✅ REQUIRED */
border-radius: 0;              /* Sharp corners */
border-radius: 2px;            /* Minimal rounding only */
box-shadow: 4px 4px 0 0;       /* Pixel shadows */
animation-timing-function: steps(N, end);  /* 8-bit timing */

/* ❌ FORBIDDEN */
border-radius: 0.5rem;         /* Too rounded */
backdrop-filter: blur();       /* Glassmorphism */
opacity: 0.8;                  /* Use solid colors */
```

### File Size Limits
| Type | Max Lines | Action if Exceeded |
|------|-----------|-------------------|
| Stores | 300 | Split immediately |
| Components | 400 | Extract hooks/composables |
| Services | 500 | Decompose by responsibility |

### Naming Conventions
- **Files**: `kebab-case.ts` (NOT PascalCase)
- **Components**: PascalCase in JSX
- **Hooks**: `useFeatureName.ts`
- **Stores**: `feature-store.ts`
- **Types**: PascalCase with descriptive names

---

## 🔄 WORKFLOW PROTOCOL

### BMAD Commands Available
```bash
# Workflow Management
/workflow-status          # Check current state
/workflow-audit           # Validate compliance
/workflow-init            # Initialize new workflow

# Development
/dev-story               # Execute story with TDD
/code-review             # Multi-agent review
/correct-course          # Recovery when stuck

# Testing
/testarch-framework      # Test architecture
/testarch-atdd          # Acceptance tests
/testarch-ci            # CI/CD tests
```

### Story Lifecycle
1. **Pre-Planning**: Load context, validate schema
2. **Implementation**: TDD (RED → GREEN → REFACTOR)
3. **Review**: Spec compliance → Code quality
4. **Verification**: All checks pass
5. **Completion**: Update all status files

### Team Assignments
- **Team A**: Complex tasks, architecture, critical fixes
- **Team B**: Simpler tasks, documentation, testing
- **Parallel**: Independent tasks run concurrently

---

## 🏗️ ARCHITECTURE PRINCIPLES

### Clean Architecture (ENFORCED)
```
Presentation → Domain ← Infrastructure
     ↓              ↓
  React UI    Business Logic    External APIs
```

### State Management
- **Zustand v5** for global state
- **useShallow** mandatory for selectors
- **Dexie.js** for IndexedDB persistence
- **No Redux** - Zustand only

### Storage Strategy
- **Desktop**: File System Access API (FSA)
- **Mobile**: IndexedDB via Dexie
- **Preview**: WebContainer (StackBlitz)

### Key Files
| Purpose | Location |
|---------|----------|
| Storage Adapter | `src/infrastructure/filesystem/fsa-storage-adapter.ts` |
| Domain Interface | `src/domain/interfaces/storage-adapter.interface.ts` |
| Layout Store | `src/presentation/layouts/PluginLayoutStore.ts` |
| Design Tokens | `src/styles/design-tokens.css` |

---

## 📊 STATUS FILES (KEEP UPDATED)

| File | Purpose | Update Frequency |
|------|---------|------------------|
| `AGENT-STATE.yaml` | Current session state | Every action |
| `bmm-workflow-status.yaml` | Workflow tracking | Daily |
| `sprint-status-YYYY-MM-DD.yaml` | Sprint progress | Per story |
| `PHASE-1A-REGISTRY-YYYY-MM-DD.md` | Phase governance | Weekly |

### Status Update Template
```yaml
# After ANY work:
last_updated: "2026-01-29T16:00:00+07:00"
updated_by: "[agent-name]"
changes:
  - file: "path/to/file"
    action: "created|modified|deleted"
    reason: "brief description"
verification:
  typecheck: "pass|fail"
  tests: "pass|fail"
  governance: "pass|fail"
```

---

## ⚠️ COMMON PITFALLS

### NEVER DO
1. **Skip build validation** - Always run checks
2. **Use stale documents** - >2 hours = validate
3. **Trust assumptions** - Evidence required
4. **Modify without reading** - Read first, always
5. **Create without plan** - TODO list first
6. **Hardcode values** - Use design tokens
7. **Skip error handling** - Always handle errors
8. **Ignore mobile** - Responsive is mandatory
9. **Use `any`** - Explicit types only
10. **Forget i18n** - EN + VI support required

### ALWAYS DO
1. **Start with context** - Read relevant docs
2. **Use MCP servers** - For official docs
3. **Follow 8-bit design** - Sharp corners, pixel shadows
4. **Respect prefers-reduced-motion** - Accessibility
5. **Split at 400 lines** - No god components
6. **Use canonical paths** - No @/lib/ imports
7. **Export errors to files** - For debugging
8. **Update status files** - Every action
9. **Run verification** - Before claiming done
10. **Document decisions** - In ADRs

---

## 🔗 ESSENTIAL REFERENCES

| Document | Location | Purpose |
|----------|----------|---------|
| **Architecture** | `.planning/SOURCE-OF-TRUTH.md` | **THE** canonical architecture (replaces all previous) |
| **UX Spec** | `_bmad-output/planning-artifacts/ux-specification/` | Design system |
| **Epics** | `_bmad-output/planning-artifacts/epics.md` | Story backlog |
| **ADR-039** | `_bmad-output/planning-artifacts/adr/` | Authority decisions |
| **BMAD Framework** | `_bmad/FRAMEWORK.md` | Full framework |
| **Constitution** | `_bmad-ext/constitution/` | Governance rules |

---

## 🎯 SUCCESS METRICS

| Metric | Target | Current |
|--------|--------|---------|
| TypeScript Errors | 0 | 0 ✅ |
| Test Coverage | >80% | TBD |
| God Files (>300 lines) | <10 | 30 ⚠️ |
| lib/ Imports | 0 | 654 ❌ |
| Circular Deps | <3 | 2 ✅ |
| Health Score | >85% | 29.5% 🔴 |

---

## 🚨 CURRENT BLOCKERS

1. **654 @/lib/ imports** → Migrate to canonical paths
2. **30 god files** → Split into focused modules
3. **104 TODO markers** → Address or remove

**Next Priority**: Fix lib/ imports to reach 85% health.

---

*This constitution is binding. Violations require justification in writing.*
**End of AGENTS.md**
