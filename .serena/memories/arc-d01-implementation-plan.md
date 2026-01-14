# ARC-D01: ProjectId Template Literal Type - Implementation Plan

## Current State
- Project.id typed as `string` (no type safety)
- projectId parameters everywhere are `string`
- Naming convention: `{workspaceType}:proj_{timestamp}_{random}`

## Target State
- Create `WorkspaceType` union type
- Create `ProjectId` template literal type  
- Create `NamespacedProjectId` branded type
- Add type guard functions

## Files to Modify
1. src/domain/types/project-ids.ts (NEW)
2. src/domain/entities/project.ts (update Project.id type)
3. src/infrastructure/persistence/stores/project/project-types.ts (re-export)
