# Course Correction CC-2025-12-25-003: useMemo Dependency Bug

**ID:** CC-2025-12-25-003  
**Created:** 2025-12-25T19:40:00+07:00  
**Severity:** P0 (Blocking MVP-3 Tool Execution)  
**Status:** ✅ FIX APPLIED - Awaiting E2E Verification  
**Related:** CC-001 (Path Handling), CC-002 (System Prompt)

---

## Incident Summary

With project folder opened and 686 files synced, agent tools (list_files) still fail with error. Investigation revealed:

1. System prompt fix (CC-002) worked - agent IS calling tools
2. Error feedback IS working - agent reports tool failure
3. But tools return "File tools not available" even when folder is open

---

## Root Cause: React Anti-Pattern

**File:** `src/components/ide/AgentChatPanel.tsx` line 135

```typescript
// BUGGY CODE
const fileTools = useMemo(() => {
    ...
}, [localAdapterRef.current, syncManagerRef.current, eventBus]);
//   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//   Using .current in deps is a React anti-pattern!
```

**Why This Fails:**
- React refs are mutable objects that persist across renders
- Changing `ref.current` does NOT trigger React re-renders
- useMemo compares the ref object reference (same), not .current value
- `fileTools` is created once on mount with null refs
- When refs are populated after sync, useMemo never recreates facade

---

## Fix Applied

Changed dependency to use state that DOES trigger re-renders:

```typescript
const { localAdapterRef, syncManagerRef, eventBus, initialSyncCompleted } = useWorkspace();

const fileTools = useMemo(() => {
    ...
}, [localAdapterRef, syncManagerRef, eventBus, initialSyncCompleted]);
//                                              ^^^^^^^^^^^^^^^^^^^^
//   State that changes when sync completes, triggering useMemo to re-run
```

---

## Files Modified

1. `src/components/ide/AgentChatPanel.tsx`
   - Added `initialSyncCompleted` to useWorkspace destructuring
   - Changed useMemo deps from `ref.current` to actual state
   - Added debug console.log to trace facade creation

2. `src/lib/agent/factory.ts` (earlier in session)
   - Improved error messages for workspace-not-ready scenario

---

## Verification Required

1. [ ] Build passes
2. [ ] Browser console shows `[AgentChatPanel] fileTools created - workspace ready` after sync
3. [ ] Agent can list files after folder is opened and synced
4. [ ] E2E: User asks agent to read files, agent succeeds

---

## Lessons Learned

> **Never use `ref.current` in React useMemo/useEffect dependencies.**
> 
> Refs don't trigger re-renders. Use state that changes when you need the effect/memo to re-run.

---

## Timeline

| Time | Event |
|------|-------|
| 19:34 | User reports tool failure with folder open |
| 19:36 | Investigated factory.ts - thought it was workspace-not-ready |
| 19:38 | User shared screenshot showing 686 files synced |
| 19:39 | Found real bug: useMemo deps with ref.current |
| 19:40 | Fix applied: use initialSyncCompleted state as dep |
