# P0-1: Tool Permission Manager Refactoring Plan

**File**: `src/lib/agent/tool-permission/tool-permission-manager.ts`
**Current**: 378 lines (exceeds 300-line limit)
**Target**: 3 slices ≤120 lines each

## Slice Structure

### 1. tool-permission-singleton.ts (~60 lines)
**Responsibility**: Singleton pattern, factory methods
**Exports**:
- `ToolPermissionManager` class (partial: singleton methods only)
- `getInstance()`, `createInstance()`
- `setEventBus()`

### 2. tool-permission-trust.ts (~130 lines)
**Responsibility**: Trust level CRUD, session trust, permission checking
**Exports**:
- `getTrustLevel()`, `setTrustLevel()`
- `hasSessionTrust()`, `addSessionTrust()`, `removeSessionTrust()`, `clearSessionTrust()`
- `checkPermission()`, `checkPermissionLegacy()`, `createResult()`
- Legacy methods (deprecated)

### 3. tool-permission-queries.ts (~130 lines)
**Responsibility**: Query methods, YOLO mode, category approval
**Exports**:
- `getAllTrustLevels()`, `getToolsByLevel()`
- `hasPromptTools()`, `hasBlockedTools()`
- `isYOLOActive()`, `getYOLOMode()`, `toggleYOLO()`, `enableYOLO()`, `disableYOLO()`
- `getCategoryApproval()`, `setCategoryApproval()`, `resetCategoryApprovals()`
- Legacy methods (deprecated)

## Barrel Export Pattern

```typescript
// tool-permission-manager.ts (updated facade)
export { ToolPermissionManager } from './tool-permission-singleton';
export type * from './types';
```

## Acceptance Criteria

- [ ] All 3 new files ≤120 lines
- [ ] TypeScript compiles without errors
- [ ] Zero breaking changes (existing imports still work)
- [ ] All methods preserved
- [ ] Event emission maintained

## Dependencies

- `useToolPermissionStore` from `@/infrastructure/persistence/stores/permissions/tool-permission-store`
- `types.ts` (ToolTrustLevel, ToolCategory, YOLOMode, PermissionCheckResult)
- `constants.ts` (getToolCategory)
- `helpers.ts` (getToolDisplayName)
