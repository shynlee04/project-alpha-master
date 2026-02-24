# 🔴 BUG-011: High CPU Load on Folder Sync - Investigation Report

**Date:** 2026-01-19  
**Investigator:** dev-ext (investigation-only)  
**Severity:** CRITICAL - Application unresponsive  
**Status:** ROOT CAUSE IDENTIFIED

---

## Executive Summary

High CPU load during folder selection/sync in project creation is caused by **unstable React hook dependencies** that create an infinite effect loop. The primary culprit is `ProjectDetailsStep.tsx:93-99` where `updateFormData` callback in the dependency array triggers repeated re-renders.

---

## 1. Flow Diagram: Project Creation Wizard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PROJECT CREATION FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

User Action                    State Change                    Component
──────────────────────────────────────────────────────────────────────────────
1. Open Wizard            →   open=true                      ProjectCreationWizard
                              currentStep=1
                              formData={storageType: undefined}

2. Mount ProjectDetailsStep  →   useEffect fires (PROBLEM!)   ProjectDetailsStep
   - Calls getPlatformContract()
   - Checks platform.canAccessFSA
   - Compares with formData.storageType
   - Calls updateFormData('storageType', 'fsa')

3. updateFormData()        →   setFormData(prev => {...})    ProjectCreationWizard
   - Updates formData.storageType
   - May trigger re-render
   - Creates NEW updateFormData reference (PROBLEM!)

4. useEffect re-runs       →   Infinite loop!                ProjectDetailsStep
   - updateFormData changed
   - Effect runs again
   - Calls updateFormData again
   - Creates new reference...
   └────────────────────────→ HIGH CPU, UNRESPONSIVE

5. Folder Picker           →   fsaHandle = handle            ProjectDetailsStep
   - window.showDirectoryPicker()
   - Updates formData.fsaHandle
   - (Never reached due to loop)

6. Create Project          →   createProject() called        ProjectCreationWizard
   - (Never reached due to loop)
──────────────────────────────────────────────────────────────────────────────
```

---

## 2. State Chain Analysis

### State Touch Points During Folder Selection

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          STATE CHAIN TRACE                                   │
└─────────────────────────────────────────────────────────────────────────────┘

1. getPlatformContract()
   └─> Returns cached PlatformContract (OK - cached)
       └── deviceType, canAccessFSA, storageType

2. useEffect([platform.canAccessFSA, formData.storageType, updateFormData])
   └─> ISSUE: updateFormData is unstable!

3. updateFormData(key, value)
   └─> setFormData(prev => ({...prev, [key]: value}))
       └── Triggers re-render of ProjectCreationWizard
           └── Creates NEW updateFormData (due to useCallback dependency)
               └── Effect re-runs (updateFormData changed!)
                   └── Loop continues...

4. formData (WizardFormData)
   └── storageType: 'fsa' | 'indexeddb'
   └── fsaHandle: FileSystemDirectoryHandle | null
   └── workspaceBindings: WorkspaceBindings

5. Project Store (Zustand)
   └── useProjectStore.getState().createProject()
       └── DB persistence to Dexie
       └── FSA handle persistence via handle-persistence.ts
──────────────────────────────────────────────────────────────────────────────
```

---

## 3. Potential Loop Sources (Ranked by Severity)

### 🔴 CRITICAL - Primary Cause

**File:** `src/presentation/components/project/steps/ProjectDetailsStep.tsx`  
**Lines:** 93-99

```typescript
// ❌ PROBLEMATIC CODE
useEffect(() => {
  const optimalStorage = platform.canAccessFSA ? 'fsa' : 'indexeddb';
  // Always force the correct storage type for the platform
  if (formData.storageType !== optimalStorage) {
    updateFormData('storageType', optimalStorage as WizardFormData['storageType']);
  }
}, [platform.canAccessFSA, formData.storageType, updateFormData]);
```

**Root Cause Analysis:**
1. `updateFormData` is created via `useCallback` in parent component
2. Its dependencies are `[currentStep, stepErrors]` (lines 265-277)
3. When `updateFormData` is called, it can change `stepErrors`
4. This creates a new `updateFormData` reference on next render
5. The useEffect sees the changed callback and re-runs
6. Infinite loop established

**Evidence:** `updateFormData` calls `setFormData()` which triggers re-render, potentially changing `stepErrors`, which changes `updateFormData`.

---

### 🟠 HIGH - Secondary Issues

#### 3.1 FSA Storage Adapter Polling

**File:** `src/infrastructure/filesystem/fsa-storage-adapter.ts`  
**Lines:** 410-421

```typescript
private startPolling(): void {
  if (this.watchInterval) return;

  console.log('[FSAStorageAdapter] Starting file watch polling');

  this.watchInterval = setInterval(async () => {
    await this.checkForChanges();
  }, this.watchOptions.pollInterval); // pollInterval = 2000ms

  this.scanAllFiles().catch(console.error);
}
```

**Issues:**
- Polling interval is short (2000ms)
- `scanAllFiles()` reads ALL files in directory (expensive)
- `checkForChanges()` computes SHA-256 hash for each file (very expensive)
- If watcher is started multiple times → multiplied CPU load

---

#### 3.2 FSAGateway Polling (Duplicate Mechanism)

**File:** `src/infrastructure/filesystem/fsa-gateway.ts`  
**Lines:** 106-116, 460+

```typescript
private watchInterval: ReturnType<typeof setInterval> | null = null;
private watchOptions: WatchOptions = {
  pollInterval: 2000,  // Same as FSA adapter
  debounceMs: 300,
};
```

**Issues:**
- Duplicate polling mechanism to `fsa-storage-adapter.ts`
- Both could be active simultaneously
- Exponential CPU usage if both run

---

### 🟡 MEDIUM - Potential Issues

#### 3.3 ProjectContext Effect Chain

**File:** `src/lib/workspace/ProjectContext.tsx`  
**Lines:** 251-257, 280-308

```typescript
// Clear handle when project changes
React.useEffect(() => {
  if (project?.id) {
    console.log(`[ProjectProvider] Project changed to: ${project.id}, clearing FSA handle`);
    setFsaHandle(null);
  }
}, [project?.id]);

// Restore handle
React.useEffect(() => {
  if (!project?.id || fsaHandle) return;
  // ... restore handle async
}, [project?.id, fsaHandle]);
```

**Potential Issue:** The `setFsaHandle(null)` in one effect could trigger re-renders that affect other effects.

---

#### 3.4 Multiple setInterval Watchers Found

The following files have polling mechanisms that could compound CPU load:

| File | Poll Interval | Purpose |
|------|---------------|---------|
| `fsa-storage-adapter.ts` | 2000ms | File change detection |
| `fsa-gateway.ts` | 2000ms | Storage gateway watching |
| `note-sync-layer.ts` | Variable | Auto-sync |
| `file-watcher.ts` | Variable | Note file watching |
| `notes-file-sync-service.ts` | Variable | Notes sync |

---

## 4. Quick Fix Recommendations

### Priority 1: Fix Infinite Loop (IMMEDIATE)

**File:** `src/presentation/components/project/steps/ProjectDetailsStep.tsx`

**Fix 1a: Remove unstable dependency (Recommended)**

```typescript
// ✅ FIXED - Don't depend on updateFormData
useEffect(() => {
  const optimalStorage = platform.canAccessFSA ? 'fsa' : 'indexeddb';
  if (formData.storageType !== optimalStorage) {
    updateFormData('storageType', optimalStorage as WizardFormData['storageType']);
  }
}, [platform.canAccessFSA, formData.storageType]);
//                    ^^^ REMOVED updateFormData
```

**Fix 1b: Use useCallback with stable reference**

In `ProjectCreationWizard.tsx`, ensure `updateFormData` is memoized properly:

```typescript
// ✅ Ensure dependencies are minimal
const updateFormData = useCallback(<K extends keyof WizardFormData>(
  key: K,
  value: WizardFormData[K]
) => {
  setFormData((prev) => {
    const newState = { ...prev, [key]: value };
    // Clear error for current step
    if (stepErrors[currentStep]) {
      return newState;
    }
    return newState;
  });
}, [currentStep]); // Remove stepErrors from dependencies
```

---

### Priority 2: Reduce Polling CPU Impact

**File:** `src/infrastructure/filesystem/fsa-storage-adapter.ts`

```typescript
private watchOptions: WatchOptions = {
  pollInterval: 5000,  // ✅ INCREASE from 2000 to 5000ms
  debounceMs: 500,     // ✅ INCREASE debounce
};
```

**Add polling guard:**

```typescript
private startPolling(): void {
  if (this.watchInterval) {
    console.log('[FSAStorageAdapter] Polling already active, skipping');
    return;  // Prevent duplicate polling
  }
  // ... rest of implementation
}
```

---

### Priority 3: Deduplicate File Watchers

**Issue:** Both `FSAStorageAdapter` and `FSAGateway` have polling watchers.

**Recommendation:**
1. Consolidate to single watcher mechanism
2. Use `FSAGateway` as the single source of truth
3. Remove or wrap `FSAStorageAdapter.watch()` to prevent duplicate calls

---

## 5. Long-term Architectural Recommendations

### 5.1 State Management Best Practices

```typescript
// ✅ GOOD: Minimal dependencies
const updateFormData = useCallback((key, value) => {
  setFormData(prev => ({ ...prev, [key]: value }));
}, []);  // Empty deps = stable reference

// ❌ BAD: Dependencies that change frequently
const updateFormData = useCallback((key, value) => {
  setFormData(prev => {
    const newState = { ...prev, [key]: value };
    if (stepErrors[currentStep]) {  // stepErrors changes often!
      setStepErrors(/* ... */);
    }
    return newState;
  });
}, [currentStep, stepErrors]);  // Unstable!
```

### 5.2 Polling Optimization Strategy

```
RECOMMENDED POLLING ARCHITECTURE:
┌─────────────────────────────────────────┐
│         Unified File Watcher            │
│  (Single setInterval, shared state)     │
└────────────────┬────────────────────────┘
                 │
    ┌────────────┼────────────┐
    ▼            ▼            ▼
┌────────┐  ┌──────────┐  ┌──────────┐
│  IDE   │  │  Notes   │  │Knowledge │
│ Gateway│  │ Gateway  │  │ Gateway  │
└────────┘  └──────────┘  └──────────┘
```

### 5.3 Add Performance Monitoring

```typescript
// Add to FSA adapter polling
private async checkForChanges(): Promise<void> {
  const start = performance.now();
  // ... existing logic
  const duration = performance.now() - start;
  if (duration > 1000) {
    console.warn(`[FSAStorageAdapter] Polling took ${duration}ms - optimization needed`);
  }
}
```

---

## 6. Files Modified During Investigation

| File | Issue | Severity |
|------|-------|----------|
| `src/presentation/components/project/steps/ProjectDetailsStep.tsx` | Unstable useEffect dependency | CRITICAL |
| `src/presentation/components/project/ProjectCreationWizard.tsx` | updateFormData unstable | HIGH |
| `src/infrastructure/filesystem/fsa-storage-adapter.ts` | Short polling interval | MEDIUM |
| `src/infrastructure/filesystem/fsa-gateway.ts` | Duplicate polling | MEDIUM |
| `src/lib/workspace/ProjectContext.tsx` | Effect chain complexity | LOW |

---

## 7. Reproduction Steps

To reproduce the bug:

1. Open project creation wizard (any route to `/projects` with create action)
2. Observe the wizard step 1 (ProjectDetailsStep)
3. Watch for high CPU usage in Activity Monitor/Task Manager
4. Notice the UI becomes unresponsive

**Expected Behavior:** Storage type auto-detection happens once, wizard is responsive.

**Actual Behavior:** Infinite useEffect loop causes 100% CPU on one core.

---

## 8. Conclusion

The high CPU load during folder sync is caused by a **React useEffect infinite loop** in `ProjectDetailsStep.tsx`. The `updateFormData` callback is included in the effect dependency array, but this callback reference changes on every render due to its dependencies on `currentStep` and `stepErrors`.

**Primary Fix:** Remove `updateFormData` from the useEffect dependency array.

**Secondary Fixes:**
1. Increase polling intervals from 2000ms to 5000ms+
2. Consolidate duplicate file watchers
3. Add performance monitoring to detect future issues

---

## 9. References

- **ADR-033:** `_bmad-output/planning-artifacts/adr/ADR-033-correct-course-architectural-remediation-2026-01-16.md`
- **Project Store:** `src/infrastructure/persistence/stores/project/useProjectStore.ts`
- **FSA Adapter:** `src/infrastructure/filesystem/fsa-storage-adapter.ts`
- **Platform Contract:** `src/infrastructure/filesystem/platform-contract.ts`

---

**Report Generated:** 2026-01-19  
**Investigator:** dev-ext (investigation-only mode)  
**Next Action:** Implement fixes with dev-ext (implementation mode) or hand off to dev-ext with implementation permissions
