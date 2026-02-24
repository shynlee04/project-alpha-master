# P0-HOOKS-FIX-02: React Hooks Violation in project-context.tsx

**Handoff ID**: `hnd_20260125_190000_p0_hooks_fix_02`
**Created**: 2026-01-25T19:00:00+07:00
**Source Agent**: architect-ext
**Target Agent**: dev-ext
**Priority**: P0 (CRITICAL - STILL BLOCKING)
**Status**: READY_FOR_IMMEDIATE_EXECUTION

---

## 🚨 CRITICAL: PREVIOUS FIX WAS INCOMPLETE

The previous fix (HOOKS-FIX-01) migrated imports but **did NOT fix the actual hooks violation** in the NEW context itself!

---

## Root Cause (CONFIRMED)

**File**: `src/infrastructure/context/project-context.tsx`
**Line**: 250
**Violation**: Calling React hook inside async function inside useEffect

```typescript
// Lines 173-266 (simplified)
useEffect(() => {
  async function initializeProject() {
    // ... other code ...
    
    // ❌ LINE 250: HOOKS VIOLATION - Calling hook inside async function!
    const fileTreeStore = useFileTreeStore();
    setFileTree(fileTreeStore);
    
    // ... rest of code ...
  }

  initializeProject();
}, [projectId]);
```

### Why This Fails

React's Rules of Hooks state:
1. Only call Hooks at the top level of your React function
2. Don't call Hooks inside loops, conditions, or nested functions
3. Don't call Hooks inside async functions

**`useFileTreeStore()` is being called inside `initializeProject()` which is an async function inside `useEffect` - this is a triple violation!**

---

## The Fix

Move the hook call to the component's top level:

### Before (BROKEN):
```typescript
export const ProjectContextProvider: React.FC<{...}> = ({ projectId, children }) => {
  const { getProject, setActiveProject } = useProjectStore();
  const [loading, setLoading] = useState<boolean>(true);
  // ... other state ...
  const [fileTree, setFileTree] = useState<ReturnType<typeof useFileTreeStore> | null>(null);

  useEffect(() => {
    async function initializeProject() {
      // ... code ...
      const fileTreeStore = useFileTreeStore(); // ❌ VIOLATION
      setFileTree(fileTreeStore);
      // ... code ...
    }
    initializeProject();
  }, [projectId]);
  
  // ...
};
```

### After (FIXED):
```typescript
export const ProjectContextProvider: React.FC<{...}> = ({ projectId, children }) => {
  const { getProject, setActiveProject } = useProjectStore();
  
  // ✅ MOVE HOOK TO TOP LEVEL
  const fileTreeStore = useFileTreeStore();
  
  const [loading, setLoading] = useState<boolean>(true);
  // ... other state ...
  // Remove fileTree state - use fileTreeStore directly

  useEffect(() => {
    async function initializeProject() {
      // ... code ...
      // ✅ Use fileTreeStore directly (already available from top level)
      // No need to call useFileTreeStore() here
      // ... code ...
    }
    initializeProject();
  }, [projectId]);
  
  // In context value:
  const contextValue: ProjectContext | null = (loading || error || !project || !platform || !gateway)
    ? null
    : {
        // ...
        fileTree: fileTreeStore, // ✅ Use the top-level hook result
        // ...
      };
};
```

---

## Implementation Steps

### Step 1: Open file
```
src/infrastructure/context/project-context.tsx
```

### Step 2: Move useFileTreeStore to top level (around line 161)

**Find** (around line 161):
```typescript
  const { getProject, setActiveProject } = useProjectStore();
  const [loading, setLoading] = useState<boolean>(true);
```

**Replace with**:
```typescript
  const { getProject, setActiveProject } = useProjectStore();
  const fileTreeStore = useFileTreeStore(); // ✅ MOVED TO TOP LEVEL
  const [loading, setLoading] = useState<boolean>(true);
```

### Step 3: Remove fileTree state (around line 167)

**Find**:
```typescript
  const [fileTree, setFileTree] = useState<ReturnType<typeof useFileTreeStore> | null>(null);
```

**Remove this line entirely** (fileTreeStore from Step 2 replaces it)

### Step 4: Remove hook call from useEffect (line 250)

**Find** (inside initializeProject async function):
```typescript
        // 4. Initialize file tree state
        const fileTreeStore = useFileTreeStore();
        setFileTree(fileTreeStore);
```

**Replace with**:
```typescript
        // 4. Initialize file tree state (using top-level hook)
        // fileTreeStore is already available from component top level
```

### Step 5: Update file tree loading (line 254-256)

**Find**:
```typescript
        // Load initial file tree
        const entries = await storageGateway.list('.');
        // Type assertion needed because ReturnType doesn't expose load method
        (fileTree as any).load(entries);
```

**Replace with**:
```typescript
        // Load initial file tree
        const entries = await storageGateway.list('.');
        // Use top-level fileTreeStore directly
        if (fileTreeStore.load) {
          fileTreeStore.load(entries);
        }
```

### Step 6: Update context value (around line 294-306)

**Find**:
```typescript
  const contextValue: ProjectContext | null = (loading || error || !project || !platform || !gateway || !fileTree)
    ? null
    : {
        // ...
        fileTree: fileTree!,
        // ...
      };
```

**Replace with**:
```typescript
  const contextValue: ProjectContext | null = (loading || error || !project || !platform || !gateway)
    ? null
    : {
        // ...
        fileTree: fileTreeStore, // ✅ Use top-level hook result directly
        // ...
      };
```

### Step 7: Update refreshFileTree callback (around line 272-277)

**Find**:
```typescript
  const refreshFileTree = useCallback(async () => {
    if (!gateway || !fileTree) return;
    const entries = await gateway.list('.');
    // Type assertion needed
    (fileTree as any).load(entries);
  }, [gateway, fileTree]);
```

**Replace with**:
```typescript
  const refreshFileTree = useCallback(async () => {
    if (!gateway) return;
    const entries = await gateway.list('.');
    if (fileTreeStore.load) {
      fileTreeStore.load(entries);
    }
  }, [gateway, fileTreeStore]);
```

---

## Verification

```bash
# TypeScript check
pnpm tsc --noEmit
# Expected: 0 errors

# Dev server
pnpm dev
# Expected: Starts without errors

# Browser test
# 1. Navigate to Hub
# 2. Create new project
# 3. Verify NO "Invalid hook call" error
# 4. Verify project loads successfully
```

---

## Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC1 | useFileTreeStore() called at component top level | Code inspection |
| AC2 | No hook calls inside useEffect or async functions | Code inspection |
| AC3 | No "Invalid hook call" error on project create/load | Browser test |
| AC4 | TypeScript compiles with 0 errors | `pnpm tsc --noEmit` |

---

## Why Previous Fix Didn't Work

The previous fix (HOOKS-FIX-01) focused on migrating **import statements** from OLD context to NEW context. However, it did not inspect the NEW context itself for hooks violations.

The hooks error was always coming from the NEW context's `project-context.tsx` file, not from the import migrations. The file has had this bug since it was created in ARCH-02-03.

---

## Tool Constraints

```yaml
write: false      # No new files needed
edit: true        # Modify project-context.tsx
bash: true        # Run verification commands
task: false       # No delegation needed
```

---

## Estimated Effort

**15-30 minutes** - This is a focused code fix, not a migration.

---

## Handoff Signature

```yaml
artifact_id: "hnd_20260125_190000_p0_hooks_fix_02"
artifact_type: "handoff"
parent_id: "hnd_20260125_180000_p0_hooks_fix"
story_id: "HOOKS-FIX-02"
source_agent: "architect-ext"
target_agent: "dev-ext"
status: "PENDING"
created_at: "2026-01-25T19:00:00+07:00"
priority: "P0"
```

---

**THIS IS THE ACTUAL FIX. EXECUTE IMMEDIATELY.**
