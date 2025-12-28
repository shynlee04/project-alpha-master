---
title: "3-2 WebContainer Boot with Progress Indicator"
epic: "Epic 3: Local-First File Magic"
story: "3-2-webcontainer-boot"
status: "in-progress"
priority: "P0"
points: 5
created: "2025-12-29"
sprint: "SPRINT-3"
team: "Team A"
dependencies:
  - "3-1-fsa-permission-lifecycle"
---

# Story: 3-2 WebContainer Boot with Progress Indicator

**As a** user,
**I want** to see clear progress when WebContainer initializes,
**So that** I know the system is working and how long to wait.

---

## Story Context

### From Epic 3

Epic 3 delivers "Local-First File Magic". Story 3-2 delivers WebContainer boot with progress indication, meeting NFR-PERF-01 (<5s for small projects).

### User Journey

1. User grants FSA permission
2. WebContainer boot begins
3. Progress indicator shows stages: "Initializing..." → "Mounting..." → "Installing..."
4. Boot completes within 5 seconds for small projects
5. File tree populates, terminal spawns

### Technical Context

**WebContainer Boot Stages:**
1. Instance creation
2. COOP/COEP header verification
3. File system mounting
4. Package installation (if needed)
5. Shell spawn

**NFR Targets:**
- Small projects (<100 files): <5s
- Large projects (>100 files): <10s

---

## Acceptance Criteria

### AC-1: Progress Indicator Display

**Given** a user grants FSA permission
**When** WebContainer starts booting
**Then** a progress indicator shows stages:
- "Initializing..." (10%)
- "Mounting files..." (30%)
- "Preparing environment..." (60%)
- "Almost ready..." (90%)

**And** the progress bar fills incrementally
**And** percentage is displayed

---

### AC-2: Boot Time Performance

**Given** a small project (<100 files)
**When** WebContainer boots
**Then** boot completes within **5 seconds** (NFR-PERF-01)

**Given** a large project (>100 files)
**When** WebContainer boots
**Then** boot completes within **10 seconds**

---

### AC-3: Boot Success State

**Given** WebContainer boot succeeds
**When** the container is ready
**Then** the file tree populates from local project
**And** terminal spawns within 500ms of ready state
**And** status bar shows "Ready" with green indicator

---

### AC-4: Boot Failure Handling

**Given** WebContainer boot fails
**When** an error occurs
**Then** diagnostic info is logged:
- Browser version
- SharedArrayBuffer support status
- COOP/COEP header status
- Available RAM

**And** user sees actionable error message
**And** retry option is available

---

### AC-5: Boot from Cache

**Given** WebContainer has booted previously
**When** user returns to the same project
**Then** cached boot data is used if available
**And** boot time is reduced by 50%+
**And** progress shows "Restoring previous session..."

---

## Implementation Tasks

### Task 1: Update WebContainerManager with progress callbacks

**File:** `src/lib/webcontainer/manager.ts`

Add progress callback support:
```typescript
export async function boot(
    options: WebContainerManagerOptions = {},
    onProgress?: (progress: BootProgress) => void
): Promise<WebContainer>
```

---

### Task 2: Create WebContainerBootManager

**File:** `src/lib/webcontainer/boot-manager.ts`

**Interface:**
```typescript
export interface BootProgress {
  stage: BootStage;
  percent: number;
  message: string;
}

export type BootStage =
  | 'idle'
  | 'initializing'
  | 'mounting'
  | 'installing'
  | 'ready'
  | 'error';

export class WebContainerBootManager {
  async boot(
    files: FileSystemTree,
    onProgress: (progress: BootProgress) => void
  ): Promise<WebContainer>;
  getStatus(): BootProgress;
  isBooted(): boolean;
  async reboot(): Promise<void>;
}
```

---

### Task 3: Create BootProgress component

**File:** `src/components/webcontainer/BootProgress.tsx`

**Features:**
- Animated progress bar
- Stage messages
- Cancel boot option
- Error state with retry

---

### Task 4: Add unit tests

**File:** `src/lib/webcontainer/__tests__/boot-manager.test.ts`

**Test cases:**
- Progress stages increment correctly
- Boot completes within time limit
- Error handling for boot failures
- Cache usage when available

---

## Technical Notes

### Performance Optimization

1. **Parallel mounting**: Mount files in parallel batches
2. **Lazy package install**: Only install if node_modules missing
3. **Cache boot data**: Use IndexedDB to cache WebContainer data

---

## Dependencies

| Dependency | Status | Purpose |
|------------|--------|---------|
| Story 3-1 | Done | FSA permission required first |
| @webcontainer/api | Installed | WebContainer client |
| COOP/COEP headers | Configured | Vite plugin |

---

## Definition of Done

- [ ] All acceptance criteria verified
- [ ] Boot time <5s for small projects (NFR-PERF-01)
- [ ] Unit tests written and passing
- [ ] Progress indicator UI implemented
- [ ] Error handling with diagnostics
- [ ] Story file updated with Dev Agent Record
- [ ] `sprint-status.yaml` updated: `3-2-webcontainer-boot: done`

---

## Dev Agent Record

**Agent:** TBD
**Session:** TBD

#### Task Progress:
- [x] T0: WebContainerManager core exists (15 tests passing)
- [ ] T1: Update WebContainerManager with progress callbacks
- [ ] T2: Create WebContainerBootManager
- [ ] T3: Create BootProgress component
- [ ] T4: Add unit tests

#### Research Executed:
- [ ] Context7: WebContainer API documentation
- [ ] DeepWiki: WebContainer boot optimization patterns

#### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| src/lib/webcontainer/manager.ts | Existing | 293 |
| src/lib/webcontainer/__tests__/manager.test.ts | Existing | 199 |
| src/lib/webcontainer/boot-manager.ts | Created | - |
| src/components/webcontainer/BootProgress.tsx | Created | - |
| src/lib/webcontainer/__tests__/boot-manager.test.ts | Created | - |

#### Decisions Made:
- TBD

---
