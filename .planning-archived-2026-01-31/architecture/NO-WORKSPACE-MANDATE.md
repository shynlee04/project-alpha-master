# NO-WORKSPACE MANDATE

**Version:** 2.0.0
**Created:** 2026-01-31
**Updated:** 2026-01-31 (Phase 01 - added kill plan)
**Status:** ACTIVE - MANDATORY COMPLIANCE
**Enforcement:** ESLint + Pre-commit Hook + CI Block

---

## 🚨 ABSOLUTE PROHIBITION

The following terms are **BANNED** from the codebase:

| Banned Term | Current Count | Target | Replacement |
|-------------|---------------|--------|-------------|
| `workspaceBindings` / `WorkspaceBindings` | **368** | **0** | `PluginType[]` or `enabledPlugins` |
| `workspaceId` / `WorkspaceId` | **642** | **0** | `projectId` only |
| `workspace-*` files | **44** | **0** | `plugin-*`, `platform-*`, or domain name |

**Total violations: 1,054**
**Estimated effort: 3-4 days of focused work (Phase 05)**

---

## 📜 Rationale

### The Old Model (REJECTED)

```typescript
// ❌ WRONG - Workspace-centric thinking
interface Project {
  workspaceBindings: {
    ide: boolean;      // "Can this project be used in IDE workspace?"
    notes: boolean;    // "Can this project be used in Notes workspace?"
    knowledge: boolean;
    study: boolean;
  };
}

interface FileMetadata {
  workspaceId: 'ide' | 'notes' | 'knowledge' | 'study';  // "Which workspace owns this file?"
}
```

**Problems:**
1. Files belong to PROJECTS, not workspaces
2. Workspaces are UI concepts, not domain concepts
3. Platform determines available features, not project config
4. Creates artificial silos between features

### The New Model (REQUIRED)

```typescript
// ✅ CORRECT - Project-centric + Plugin-based
interface Project {
  id: string;
  name: string;
  storageType: 'fsa' | 'indexeddb';
  settings: ProjectSettings;
  // NO workspaceBindings field
}

interface ProjectSettings {
  enabledPlugins: PluginType[];
  defaultPlugin: PluginType;
}

interface FileMetadata {
  projectId: string;  // Files belong to projects ONLY
  // NO workspaceId field
}

type PluginType = 'file-tree' | 'chat' | 'monaco' | 'notes' | 'terminal' | 'preview';
```

---

## 🗡️ KILL-BY-FILE PLAN

### Priority 1: Core Type Definitions (ELIMINATE FIRST)

These files define the poison types. Kill them first to break the dependency chain:

| File | Violations | Action |
|------|------------|--------|
| `src/domain/entities/project.ts` | 5 | Remove `workspaceBindings` field, re-export from schemas |
| `src/domain/entities/workspace.ts` | - | **DELETE ENTIRE FILE** |
| `src/domain/value-objects/workspace-binding.ts` | - | **DELETE ENTIRE FILE** |
| `src/domain/value-objects/workspace-type.ts` | - | **DELETE ENTIRE FILE** |
| `src/domain/use-cases/switch-workspace-use-case.ts` | - | **DELETE ENTIRE FILE** |
| `src/domain/services/workspace-transition-service.ts` | - | **DELETE ENTIRE FILE** |

### Priority 2: Migration Infrastructure (Massive workspaceId count)

| File | Violations | Action |
|------|------------|--------|
| `src/infrastructure/persistence/dexie-db-migrations.ts` | **347** | Rewrite migrations to use `projectId` |
| `src/infrastructure/persistence/dexie-db-core-types.ts` | 17 | Remove all workspace references |
| `src/infrastructure/persistence/dexie-db.ts` | 4 | Update table definitions |

### Priority 3: Project Store Slices (workspaceBindings concentrated)

| File | Violations | Action |
|------|------------|--------|
| `src/infrastructure/persistence/stores/project/project-bindings-slice.ts` | 32 | **REWRITE** to `plugin-settings-slice.ts` |
| `src/infrastructure/persistence/stores/project/project-types.ts` | 17 | Remove binding types |
| `src/infrastructure/persistence/stores/project/migrate-bindings.ts` | 17 | **DELETE** after data migration |
| `src/infrastructure/persistence/stores/project/project-utils-slice.ts` | 5 | Remove workspace logic |
| `src/infrastructure/persistence/stores/project/useWorkspaceProjects.ts` | 4 | Rename, remove workspace logic |

### Priority 4: Workspace Store (DELETE ENTIRE DIRECTORY)

These are the poisoned workspace stores:

| File/Directory | Action |
|----------------|--------|
| `src/infrastructure/persistence/stores/workspace/` | **DELETE ENTIRE DIRECTORY** |
| `src/infrastructure/persistence/stores/workspace-store-factory.ts` | **DELETE** |
| `src/infrastructure/persistence/stores/workspace-store-facade.ts` | **DELETE** |

### Priority 5: Event System (Cross-workspace events)

| File | Violations | Action |
|------|------------|--------|
| `src/lib/events/cross-workspace-event-bus.ts` | 13 | **DELETE** - replace with `plugin-event-bus.ts` |
| `src/lib/events/workspace-events.ts` | - | **DELETE** |
| `src/lib/events/use-workspace-event.ts` | - | **DELETE** |
| `src/lib/events/use-cross-workspace-events.ts` | - | **DELETE** |
| `src/lib/events/use-chat-state-sync.ts` | 12 | Rewrite to use projectId |
| `src/lib/events/use-chat-event-bridge.ts` | 5 | Rewrite to use projectId |
| `src/infrastructure/events/cross-workspace-event-bus.ts` | - | **DELETE** |

### Priority 6: Lib Workspace Directory (DELETE ENTIRE DIRECTORY)

| File/Directory | Action |
|----------------|--------|
| `src/lib/workspace/` | **DELETE ENTIRE DIRECTORY** |

Contents being deleted:
- `workspace-detector.ts` → Move detection logic to `platform-detector.ts`
- `workspace-access-helper.tsx` → **DELETE**
- `workspace-transition-manager.ts` → **DELETE**
- `workspace-types.ts` → **DELETE**
- `migrate-projects.ts` → Keep temporarily, then delete
- `fsa-persistence.ts` → Move to `infrastructure/filesystem/`
- `browser-mode.ts` → Move to `infrastructure/platform/`

### Priority 7: Test Files (55 violations in one file!)

| File | Violations | Action |
|------|------------|--------|
| `src/lib/workspace/__tests__/project-metadata.test.ts` | 55 | **DELETE** (test for deleted code) |
| `src/domain/entities/__tests__/project.test.ts` | 22 | Update to test new model |
| `src/domain/entities/__tests__/workspace.test.ts` | - | **DELETE** |
| All `**/cross-workspace-*.test.ts` | - | **DELETE** |

### Priority 8: UI Components

| File | Violations | Action |
|------|------------|--------|
| `src/presentation/components/project/steps/WorkspaceSetupStep.tsx` | 22 | **REWRITE** to `PluginSetupStep.tsx` |
| `src/presentation/components/hub/useWorkspaceBindingState.ts` | 16 | **DELETE** |
| `src/presentation/components/hub/HubHomePage.tsx` | 9 | Remove workspace logic |
| `src/presentation/components/hub/useDashboardMetrics.ts` | 6 | Remove workspace logic |
| `src/presentation/components/hub/ProjectCard.tsx` | 5 | Remove workspaceBindings |
| `src/presentation/components/project/ProjectCreationWizard.tsx` | 5 | Remove workspace step |
| `src/hooks/useWorkspaceContext.ts` | 7 | **DELETE** |

### Priority 9: Agent System

| File | Violations | Action |
|------|------------|--------|
| `src/domain/entities/agent.ts` | 14 | Remove workspace bindings, use capabilities |
| `src/domain/services/agent-workspace-utils.ts` | 9 | **DELETE** or rewrite |
| `src/application/services/AgentService.ts` | 8 | Remove workspace logic |
| `src/lib/agent/workspace-permission-manager.ts` | - | **DELETE** |
| `src/mocks/agents.ts` | 6 | Update mock data |

### Priority 10: File Sync System

| File | Violations | Action |
|------|------------|--------|
| `src/infrastructure/filesystem/handle-persistence.ts` | 11 | Use projectId only |
| `src/lib/filesystem/file-snapshot-store.ts` | 4 | Use projectId only |
| `src/lib/filesync/cross-workspace-file-references.ts` | - | **DELETE** |
| `src/infrastructure/sync/workspace-services/` | - | **DELETE DIRECTORY** |

---

## 📊 Current Status (Updated 2026-01-31)

| Metric | Baseline | Target | Current |
|--------|----------|--------|---------|
| workspaceBindings references | 368 | 0 | **368** ❌ |
| workspaceId references | 642 | 0 | **642** ❌ |
| workspace-* files | 44 | 0 | **44** ❌ |
| Total violations | 1,054 | 0 | **1,054** ❌ |

### Top Offenders

| File | Violations | Priority |
|------|------------|----------|
| `dexie-db-migrations.ts` | 347 | P2 |
| `project-metadata.test.ts` | 55 | P7 (delete) |
| `project-bindings-slice.ts` | 32 | P3 |
| `WorkspaceSetupStep.tsx` | 22 | P8 |
| `project.test.ts` | 22 | P7 |
| `project-types.ts` | 17 | P3 |
| `migrate-bindings.ts` | 17 | P3 |
| `agent.ts` | 14 | P9 |
| `cross-workspace-event-bus.ts` | 13 | P5 |
| `use-chat-state-sync.ts` | 12 | P5 |

---

## 🔧 Migration Guide

### For Type Definitions

```typescript
// ❌ OLD
import type { WorkspaceBindings } from '@/domain/entities/project';
import type { WorkspaceId } from '@/lib/events/cross-workspace-event-bus';

// ✅ NEW
import type { PluginType } from '@/domain/schemas';
import type { ProjectSettings } from '@/domain/schemas/project.schema';
```

### For Project Fields

```typescript
// ❌ OLD
const project = {
  workspaceBindings: { ide: true, notes: true }
};

// ✅ NEW
const project = {
  settings: {
    enabledPlugins: ['monaco', 'notes'],
    defaultPlugin: 'monaco'
  }
};
```

### For File References

```typescript
// ❌ OLD
const file = {
  workspaceId: 'ide',
  projectId: 'abc123'
};

// ✅ NEW
const file = {
  projectId: 'abc123'  // Files belong to projects only
};
```

### For Agent Capabilities

```typescript
// ❌ OLD
const agent = {
  workspaceBindings: [
    { workspaceType: 'ide', isAvailable: true }
  ]
};

// ✅ NEW
const agent = {
  capabilities: ['code-edit', 'file-read'],
  // Platform determines where agent appears
};
```

---

## 🚫 Enforcement

### ESLint Rule

```javascript
// eslint.config.js
{
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Identifier[name=/[Ww]orkspace[Bb]indings/]',
        message: 'WorkspaceBindings is banned. See NO-WORKSPACE-MANDATE.md'
      },
      {
        selector: 'Identifier[name=/workspaceId/]',
        message: 'workspaceId is banned. Use projectId. See NO-WORKSPACE-MANDATE.md'
      }
    ]
  }
}
```

### Pre-commit Hook

```bash
#!/bin/bash
# scripts/check-no-workspace.sh

VIOLATIONS=$(grep -rn "workspaceBindings\|WorkspaceBindings\|workspaceId\|WorkspaceId" src/ \
  --include="*.ts" --include="*.tsx" \
  | grep -v "// @legacy" \
  | grep -v "NO-WORKSPACE-MANDATE" \
  | wc -l)

if [ $VIOLATIONS -gt 0 ]; then
  echo "❌ BLOCKED: $VIOLATIONS workspace violations found"
  echo "See .planning/architecture/NO-WORKSPACE-MANDATE.md"
  exit 1
fi
```

### CI Check

```yaml
# .github/workflows/governance.yml
- name: No Workspace Terms
  run: |
    COUNT=$(grep -rn "workspaceBindings\|WorkspaceBindings" src/ \
      --include="*.ts" --include="*.tsx" \
      | grep -v "@deprecated\|@legacy" \
      | wc -l)
    if [ $COUNT -gt 0 ]; then
      echo "❌ $COUNT workspace violations found"
      exit 1
    fi
```

---

## 📝 Exceptions (TEMPORARY ONLY)

During migration, if you MUST use a workspace term:

1. Add `// @legacy-workspace: PHASE-05 - Removal by 2026-02-15`
2. The file MUST be in the kill plan above
3. No new workspace terms allowed

```typescript
// @legacy-workspace: PHASE-05 - Removal by 2026-02-15
workspaceBindings: {} // Temporary for backward compat
```

---

## 📚 Related Documents

| Document | Purpose |
|----------|---------|
| `.planning/research/DOMAIN-MODEL-2026-01-31.md` | Canonical entity definitions |
| `.planning/architecture/ENTITY-DIAGRAM-2026-01-31.md` | Visual model |
| `.planning/research/ROADMAP-REVISED-2026-01-31.md` | Phase 05 is cleanup phase |
| `src/domain/schemas/` | Replacement types |

---

## 🎯 Execution Timeline

| Phase | Action | Duration |
|-------|--------|----------|
| Phase 01 | Document model (this file) | ✅ DONE |
| Phase 02 | Schema consolidation | 1 week |
| Phase 03 | State layer enforcement | 1 week |
| Phase 04 | Plugin coordination | 1.5 weeks |
| **Phase 05** | **KILL WORKSPACE TERMS** | 2 weeks |
| Phase 06 | Verification | 1.5 weeks |

**Target: 0 violations by Phase 05 completion (2026-02-28)**

---

*This mandate is NON-NEGOTIABLE. Violations will block PR merge.*

**Signed:** Architecture Team
**Date:** 2026-01-31
**Phase:** 01 - Conceptual Clarity
