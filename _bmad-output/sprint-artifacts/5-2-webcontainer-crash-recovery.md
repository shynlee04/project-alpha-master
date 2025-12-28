---
title: "5-2 WebContainer Crash Recovery & Resilience"
epic: "Epic 5: Production-Ready Polish"
story: "5-2-webcontainer-crash-recovery"
status: "drafted"
priority: "P1"
points: 5
created: "2025-12-29"
sprint: "SPRINT-5"
team: "Team A"
dependencies:
  - "3-2-webcontainer-boot"
---

# Story: 5-2 WebContainer Crash Recovery & Resilience

**As a** user,
**I want** the system to recover automatically if the underlying engine crashes,
**So that** I don't have to manually reload and lose my context.

---

## Story Context

### From Epic 5

Epic 5 delivers "Production-Ready Polish". Story 5-2 delivers crash recovery for WebContainer, meeting FR-ERROR-03 requirement.

### User Journey

1. WebContainer process terminates unexpectedly
2. System detects crash within 1 second
3. Auto-reboot attempted (max 3 attempts)
4. File system re-mounted automatically
5. Toast confirms recovery
6. Terminal session re-attached

### Technical Context

**Crash Detection:**
- WebContainer `process` event listener
- Health check pings (every 5s)
- Timeout detection

**Recovery Strategy:**
- Immediate reboot attempt
- Exponential backoff for retries
- Max 3 attempts before alerting user

---

## Acceptance Criteria

### AC-1: Crash Detection

**Given** the WebContainer process terminates unexpectedly (FR-ERROR-03)
**When** the crash is detected
**Then** within 1 second, crash is detected
**And** recovery process starts automatically

---

### AC-2: Auto-Recovery Attempt

**Given** a crash is detected
**When** recovery starts
**Then** the system attempts to auto-reboot the instance
**And** re-mounts the file system automatically
**And** attempt count increments (max 3)

---

### AC-3: Recovery Success State

**Given** auto-recovery succeeds
**When** the system is back online
**Then** a toast appears: "Engine restarted (state restored)"
**And** terminal session is re-attached
**And** file operations resume normally

---

### AC-4: Recovery Failure State

**Given** auto-recovery fails 3 times
**When** the limit is reached
**Then** a modal appears: "Critical Error. Please reload the page."
**And** "Export Logs" button is available for debugging
**And** user can trigger manual reload

---

### AC-5: Health Monitoring

**Given** WebContainer is running
**When** health checks run every 5 seconds
**Then** if no response, crash is detected
**And** recovery triggered immediately
**And** metrics logged for analysis

---

## Implementation Tasks

### Task 1: Extend WebContainerManager with crash recovery

**File:** `src/lib/webcontainer/manager.ts`

Add recovery methods:
```typescript
export class WebContainerManager {
  private crashCount = 0;
  private maxCrashes = 3;
  private healthCheckInterval?: ReturnType<typeof setInterval>;

  // Start health monitoring
  private startHealthCheck(): void;

  // Handle crash detection
  private handleCrash(error: Error): Promise<void>;

  // Attempt recovery
  private async attemptRecovery(): Promise<boolean>;

  // Reset crash count on successful operation
  private resetCrashCount(): void;
}
```

---

### Task 2: Create CrashRecoveryDialog component

**File:** `src/components/webcontainer/CrashRecoveryDialog.tsx`

**Features:**
- Modal for critical errors
- "Reload Page" button
- "Export Logs" button
- Error details display

---

### Task 3: Create RecoveryToast component

**File:** `src/components/webcontainer/RecoveryToast.tsx`

**Features:**
- Success notification
- Auto-dismiss after 5 seconds
- "View Details" option
- Animation on appearance

---

### Task 4: Add unit tests

**File:** `src/lib/webcontainer/__tests__/crash-recovery.test.ts`

**Test cases:**
- Crash detection within 1 second
- Recovery attempt count tracking
- Success state after recovery
- Failure after max attempts

---

## Technical Notes

### Crash Detection Methods

1. **Process Events**: Listen for `process` exit
2. **Health Pings**: Periodic `setInterval` checks
3. **Operation Timeouts**: Detect hanging operations

### Recovery Sequence

```
Crash Detected
    ↓
Increment crash count
    ↓
Check if max crashes reached
    ↓
Yes → Show error dialog
No → Attempt recovery
    ↓
Wait 1s (exponential backoff)
    ↓
Re-boot WebContainer
    ↓
Re-mount files
    ↓
Success? → Reset count, notify user
Failure → Retry from crash count check
```

---

## Dependencies

| Dependency | Status | Purpose |
|------------|--------|---------|
| Story 3-2 | Drafted | WebContainer boot |
| @webcontainer/api | Installed | WebContainer API |

---

## Definition of Done

- [ ] All acceptance criteria verified
- [ ] Crash detected within 1 second
- [ ] Auto-recovery works (max 3 attempts)
- [ ] Unit tests written and passing
- [ ] Error dialog implemented
- [ ] Story file updated with Dev Agent Record
- [ ] `sprint-status.yaml` updated: `5-2-webcontainer-crash-recovery: done`

---

## Dev Agent Record

**Agent:** TBD
**Session:** TBD

#### Task Progress:
- [ ] T1: Extend WebContainerManager with crash recovery
- [ ] T2: Create CrashRecoveryDialog component
- [ ] T3: Create RecoveryToast component
- [ ] T4: Add unit tests

#### Research Executed:
- [ ] Context7: WebContainer API crash handling
- [ ] DeepWiki: Error recovery patterns

#### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| src/lib/webcontainer/manager.ts | Modified | - |
| src/components/webcontainer/CrashRecoveryDialog.tsx | Created | - |
| src/components/webcontainer/RecoveryToast.tsx | Created | - |
| src/lib/webcontainer/__tests__/crash-recovery.test.ts | Created | - |

#### Decisions Made:
- TBD

---
