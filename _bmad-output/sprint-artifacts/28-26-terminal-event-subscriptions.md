# Story 28-26: Terminal Event Subscriptions

## Story Header

- **Epic:** 28 - UX Brand Identity & Design System
- **Story ID:** 28-26
- **Title:** Terminal Event Subscriptions
- **Points:** 3
- **Priority:** P1
- **Platform:** Platform A
- **Created:** 2025-12-24T05:12:00+07:00
- **Status:** drafted

## User Story

**As a** user viewing the terminal,  
**I want** the terminal to display process output from AI agent commands in real-time,  
**So that** I can see what the agent is doing without manual refreshing.

## Acceptance Criteria

### AC-28-26-1: Subscribe to Process Output Events
**Given** the terminal component is mounted  
**When** an AI agent emits `process:output` event  
**Then** the terminal displays the output data

### AC-28-26-2: Subscribe to Process Exit Events
**Given** a process is running  
**When** an AI agent emits `process:exited` event  
**Then** the terminal shows the exit code

### AC-28-26-3: Cleanup on Unmount
**Given** the terminal component is mounted  
**When** the component unmounts  
**Then** all event subscriptions are properly cleaned up

### AC-28-26-4: Handle Undefined EventBus
**Given** the eventBus may be undefined  
**When** hook is called with undefined eventBus  
**Then** hook returns gracefully with no errors

## Tasks

- [ ] T1: Create `useTerminalEventSubscriptions.ts` hook
- [ ] T2: Subscribe to `process:output` and `process:exited` events
- [ ] T3: Create unit tests (6+ tests)
- [ ] T4: Update governance files

## Dev Notes

### Event Types (from workspace-events.ts)
```typescript
'process:output': [{ pid: string; data: string; type: 'stdout' | 'stderr' }]
'process:exited': [{ pid: string; exitCode: number }]
```

### File Location
- Hook: `src/components/ide/XTerminal/hooks/useTerminalEventSubscriptions.ts`
- Test: `src/components/ide/XTerminal/hooks/__tests__/useTerminalEventSubscriptions.test.ts`

## Dev Agent Record

_To be filled during development_

## Status History

| Date | Status | Agent | Notes |
|------|--------|-------|-------|
| 2025-12-24T05:12:00 | drafted | SM (Platform A) | Story created |
