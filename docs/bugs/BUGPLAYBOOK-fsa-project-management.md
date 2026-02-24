# FSA Project Management Bug Playbook

**Version**: 1.0.0
**Date**: 2026-01-19
**Bug Class**: Class A (Invariant Break), Class B (Async Never Finishes), Class C (Observability Gap)

---

## 1. Invariants (Make Invalid States Unrepresentable)

### Invariant 1: One Folder ↔ One Project

```typescript
// INVALID: Duplicate projects allowed
await createProject(folderHandle);  // Project A
await createProject(folderHandle);  // Project B (SHOULD FAIL)

// VALID: Repository enforces uniqueness
const duplicate = await ProjectRepository.checkDuplicate(folderHandle);
if (duplicate.isDuplicate) {
  throw new Error('Project already exists for this folder');
}
```

**Enforced By**: `ProjectRepository.checkDuplicate()` before creation
**Recovery**: Return `{ isDuplicate: true, existingProjectId }` instead of creating duplicate

### Invariant 2: Route Loader Must Not Hard Redirect

```typescript
// INVALID: Hard redirect on missing record
const project = await db.projects.get(projectId);
if (!project) {
  throw redirect({ to: '/hub' });  // Loses context
}

// VALID: Return explicit recovery state
const result = await ProjectRepository.getOrRecover(projectId);
if (result.status === 'missing') {
  return { status: 'missing', projectId };  // UI decides action
}
if (result.status === 'needsRegrant') {
  return { status: 'needsRegrant', projectId };  // Show recovery UI
}
```

**Enforced By**: `ProjectRepository.getOrRecover()` returns explicit states
**Recovery**: UI shows "Project not found" or "Regrant access" based on status

### Invariant 3: Async Operations Must Terminate

```typescript
// INVALID: No timeout - can hang forever
const files = await importDirectory(handle);

// VALID: With deadline and structured result
const result = await withDeadline(
  () => importDirectory(handle),
  { deadlineMs: 10000, operationName: 'folderImport' }
);

if (result.status === 'timeout') {
  showRecoveryUI('Import timed out', 'Retry smaller folder');
}
```

**Enforced By**: `withDeadline()` wrapper on all async file operations
**Recovery**: Timeout shows actionable remediation instead of infinite spinner

---

## 2. Structured Observability (Trace Events)

### Flow: `createProjectFromFolder`

| Step | Expected Event | ok | Error Code | If Fails |
|------|---------------|-----|------------|----------|
| START | - | true | - | - |
| duplicateCheck | `duplicateCheck` | false | DUPLICATE_PROJECT | Return duplicate error |
| persistHandle | `persistHandle` | false | FSA_HANDLE_INVALID | Handle write failed |
| verifyPersistence | `verifyHandlePersistence` | false | FSA_HANDLE_INVALID | Handle not stored |
| projectCreated | `projectCreated` | false | DEXIE_WRITE_FAILED | Dexie write failed |
| COMPLETE | - | true | - | - |

### Flow: `loadProject`

| Step | Expected Event | ok | Error Code | If Fails |
|------|---------------|-----|------------|----------|
| START | - | true | - | - |
| verifyDexieRecord | `verifyDexieRecord` | false | DEXIE_RECORD_MISSING | Show "missing" state |
| verifyHandlePersistence | `verifyHandlePersistence` | false | FSA_HANDLE_INVALID | Return "needsRegrant" |
| handleRestored | `handleRestored` | false | FSA_PERMISSION_REVOKED | Return "needsRegrant" |
| COMPLETE | - | true | - | - |

### Flow: `folderSelection`

| Step | Expected Event | ok | Error Code | If Fails |
|------|---------------|-----|------------|----------|
| START | - | true | - | - |
| asyncTimeout | `asyncTimeout` | false | ASYNC_TIMEOUT | Show timeout recovery |
| asyncComplete | `asyncComplete` | false | UNKNOWN | Show error |
| COMPLETE/FAILED | - | - | - | - |

---

## 3. Reproduction Steps

### Scenario 1: Duplicate Project Creation

**Preconditions**:
- No project exists for folder "TestFolder"
- User has FSA access to "TestFolder"

**Steps**:
1. Navigate to `/hub`
2. Click "Create Project"
3. Select "TestFolder"
4. Click "Create" → Project A created
5. Navigate to `/hub`
6. Click "Create Project"
7. Select "TestFolder" again
8. Click "Create"

**Expected**:
- Step 8 shows error: "A project for this folder already exists"
- Trace shows `duplicateCheck` → `{ isDuplicate: true }`

**If Fails**:
- Duplicate project created
- Two entries in Dexie `projects` table for same folder

### Scenario 2: Bounce Back Redirect

**Preconditions**:
- Project exists but handle was revoked/deleted
- `fsaHandles` table has record but handle not accessible

**Steps**:
1. Create project with FSA folder
2. Revoke folder permission in browser
3. Navigate to `/ide/$projectId`

**Expected**:
- Loader returns `{ status: 'needsRegrant', projectId }`
- UI shows "Restore Access" button (not redirect to hub)
- Trace shows `verifyHandlePersistence` → `ok: false`

**If Fails**:
- Redirects to `/hub` with no explanation
- User sees empty hub, doesn't understand what happened

### Scenario 3: Notes Import Spinner

**Preconditions**:
- Notes workspace open
- Project with FSA folder selected
- `importDirectory()` can hang (invalid handle, permission issue)

**Steps**:
1. Navigate to `/notes/$projectId`
2. System attempts `importDirectory(handle)`
3. Handle is invalid (permission revoked)

**Expected**:
- After 10 seconds, spinner shows timeout
- Recovery UI: "Import timed out. Regrant folder access or switch to browser storage."
- Trace shows `asyncTimeout` at 10000ms

**If Fails**:
- Spinner spins forever
- CPU stays at 100%
- No trace events visible

---

## 4. Recovery UI Rules

### Rule 1: Missing Project

```
┌─────────────────────────────────────────┐
│  Project Not Found                       │
│                                         │
│  Project "$projectId" was not found.    │
│  It may have been deleted.              │
│                                         │
│  [Go to Hub]  [Contact Support]         │
└─────────────────────────────────────────┘
```

### Rule 2: Needs Regrant

```
┌─────────────────────────────────────────┐
│  Folder Access Required                  │
│                                         │
│  Permission to access "$projectName"    │
│  was revoked or expired.                │
│                                         │
│  [Restore Access]  [Switch to Browser]  │
└─────────────────────────────────────────┘
```

### Rule 3: Timeout

```
┌─────────────────────────────────────────┐
│  Operation Timed Out                     │
│                                         │
│  Import timed out after 10 seconds.     │
│  The folder may be too large or         │
│  inaccessible.                          │
│                                         │
│  [Retry]  [Try Smaller Folder]          │
└─────────────────────────────────────────┘
```

### Rule 4: Duplicate

```
┌─────────────────────────────────────────┐
│  Project Already Exists                  │
│                                         │
│  A project for "$folderName" already    │
│  exists: "$existingProjectId"           │
│                                         │
│  [Open Existing]  [Cancel]              │
└─────────────────────────────────────────┘
```

---

## 5. Test Cases

### Test 1: Cannot Create Duplicate FSA Project

```typescript
describe('Project Repository', () => {
  it('should reject duplicate FSA project', async () => {
    const handle = mockDirectoryHandle('TestFolder');
    
    // Create first project
    const result1 = await ProjectRepository.create({
      name: 'TestFolder',
      storageType: 'fsa',
      fsaHandle: handle
    });
    expect(result1.status).toBe('ok');
    
    // Try to create duplicate
    const result2 = await ProjectRepository.create({
      name: 'TestFolder',
      storageType: 'fsa',
      fsaHandle: handle
    });
    expect(result2.status).toBe('error');
    expect(result2.errorCode).toBe('DUPLICATE_PROJECT');
  });
});
```

### Test 2: IDE Loader Returns Recoverable State

```typescript
it('should return needsRegrant when handle missing', async () => {
  const projectId = 'test-project-id';
  
  // Setup: project exists, handle deleted
  await db.projects.put({ id: projectId, name: 'Test', storageType: 'fsa' });
  await handlePersistenceService.deleteHandle(projectId);
  
  const result = await ProjectRepository.getOrRecover(projectId);
  
  expect(result.status).toBe('needsRegrant');
  expect(result.errorCode).toBe('FSA_HANDLE_INVALID');
});
```

### Test 3: Notes Import Has Timeout

```typescript
it('should timeout long-running import', async () => {
  const slowImport = () => new Promise((resolve) => {
    // Never resolves
  });
  
  const result = await withDeadline(slowImport, {
    deadlineMs: 100,
    operationName: 'testImport'
  });
  
  expect(result.status).toBe('timeout');
  expect(result.durationMs).toBeGreaterThanOrEqual(100);
});
```

---

## 6. Diagnostics Panel

Access traces at: `http://localhost:5173/debug/traces`

```typescript
// Get recent traces
import { getRecentTraces, clearTraces } from '@/lib/diagnostics';

const traces = await getRecentTraces(10);
// Display in debug panel
```

---

## 7. Checklist for New Code

- [ ] Does this enforce invariants?
- [ ] Are async operations wrapped with `withDeadline()`?
- [ ] Are trace events emitted at each step?
- [ ] Does the UI show recovery actions, not redirects?
- [ ] Are error codes specific, not generic "failed"?

---

## 8. Related Files

| File | Purpose |
|------|---------|
| `src/lib/diagnostics/trace-system.ts` | Trace event system |
| `src/lib/diagnostics/async-timeout.ts` | Deadline wrapper |
| `src/lib/workspace/project-repository.ts` | Single source of truth |
| `src/routes/ide.$projectId.tsx` | IDE route (uses repository) |
| `src/presentation/components/project/ProjectCreationWizard.tsx` | Project creation |

---

**END OF PLAYBOOK**
