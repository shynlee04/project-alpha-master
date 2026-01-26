# CC-AR-10: Clean Hub Page from Workspace Terminology

## Story Metadata

| Field | Value |
|--------|--------|
| **Story ID** | CC-AR-10 |
| **Epic ID** | EPIC-CC-AR02AR03 |
| **Title** | Clean Hub Page from Workspace Terminology |
| **Team** | Team A |
| **Priority** | P1 |
| **Status** | READY |
| **Effort** | 2 hours |
| **Depends On** | CC-AR-09 |

---

## User Story

**As a** user accessing the application's home page,
**I want to** see project-centric terminology (not "workspace"),
**So that** the UI is consistent with the project-centric architecture (ADR-034).

---

## Problem Statement

The Hub page (`src/presentation/components/hub/HubHomePage.tsx`) still uses "workspace" terminology, which violates ADR-034's project-centric architecture:

- "Workspace" labels in UI
- `WorkspacePieChart` component name
- Workspace tabs (WORKSPACE, AGENTS, KNOWLEDGE buttons)
- i18n keys using "workspace" instead of "project"

### ADR-034 Requirement

> "All user-facing UI must use 'project' terminology, not 'workspace'. The term 'workspace' is reserved for internal IDE context only."

---

## Acceptance Criteria

- [ ] `WorkspacePieChart` component removed or renamed to `ProjectDistribution`
- [ ] All "workspace" text in Hub page replaced with "project"
- [ ] Workspace tabs (WORKSPACE, AGENTS, KNOWLEDGE) removed
- [ ] i18n keys updated from "workspace" to "project"
- [ ] TypeScript compiles with 0 errors
- [ ] Manual test: Hub page shows no "workspace" terminology

---

## Files to Modify

```
src/presentation/components/hub/HubHomePage.tsx
src/presentation/components/hub/WorkspacePieChart.tsx → Archive or rename
src/i18n/en.json (update keys)
src/i18n/vi.json (update keys)
```

---

## Implementation Plan

### Step 1: Archive or Rename WorkspacePieChart

**Option A: Archive** (if not used elsewhere)
```bash
mv src/presentation/components/hub/WorkspacePieChart.tsx \
   _bmad-ext/.archive/workspace-terminology-2026-01-26/
```

**Option B: Rename** (if used)
```bash
mv src/presentation/components/hub/WorkspacePieChart.tsx \
   src/presentation/components/hub/ProjectDistribution.tsx
```

### Step 2: Update HubHomePage.tsx

Replace all "workspace" references:

```typescript
// BEFORE:
const workspaceCount = projects.length;
<WorkspacePieChart data={projects} />

// AFTER:
const projectCount = projects.length;
<ProjectDistribution data={projects} />
```

Remove workspace tabs:

```typescript
// DELETE:
<div className="workspace-tabs">
  <Tab label="WORKSPACE" />
  <Tab label="AGENTS" />
  <Tab label="KNOWLEDGE" />
</div>
```

### Step 3: Update i18n Keys

**en.json**:
```json
// DELETE (replace with project):
"hub.workspacesCount": "{{count}} workspaces"
"hub.myWorkspaces": "My Workspaces"
"hub.createNewWorkspace": "Create Workspace"

// ADD:
"hub.projectsCount": "{{count}} projects"
"hub.myProjects": "My Projects"
"hub.createNewProject": "Create Project"
```

**vi.json**:
```json
// DELETE (replace with project):
"hub.workspacesCount": "{{count}} không gian làm việc"
"hub.myWorkspaces": "Không gian làm việc của tôi"
"hub.createNewWorkspace": "Tạo Không gian làm việc"

// ADD:
"hub.projectsCount": "{{count}} dự án"
"hub.myProjects": "Dự án của tôi"
"hub.createNewProject": "Tạo Dự án"
```

---

## Dependencies

**Depends On**: CC-AR-09 (Archive routes - ensures clean route structure)

**Blocks**: CC-AR-11 (Workspace terminology removal across codebase)

---

## Validation Gate

```bash
# Search for workspace references in Hub page
grep -i "workspace" src/presentation/components/hub/HubHomePage.tsx
# Target: 0 UI-visible matches

# TypeScript check
pnpm tsc --noEmit
```

---

## Breaking Changes

**UI Changes**:
- "My Workspaces" → "My Projects"
- "Workspace Count" → "Project Count"
- Workspace tabs removed (simplified UI)

---

## Success Metrics

| Metric | Before | After |
|--------|--------|-------|
| "workspace" references in Hub page | 10+ | 0 |
| WorkspacePieChart component | Present | Archived or renamed |
| i18n "workspace" keys | 5+ | 0 |
| TypeScript errors | 0 | 0 |

---

**Created**: 2026-01-26
**Story Type**: Correct-Course (Foundation Reset)
**ADR Reference**: ADR-034 (Project-Centric Architecture)
