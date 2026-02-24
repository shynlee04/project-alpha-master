# ARCH-04-03 Validation Report (TEAM B)

Date: 2026-01-25
Story: ARCH-04-03 - Integrate PermissionOverlay for New Architecture
Epic: EPIC-ARCH-04 - Complete Architecture Migration & FSA Integration
ADR: ADR-034 Project-Centric Architecture
Reviewer: OpenCode

## Delegation/Mode Note
- LOOP_STATE anchor shows no delegations.active for analyst-ext. Validation performed in conversation mode.

## Verdict
BLOCK

## Summary
- PermissionOverlay component updates mostly align with story ACs (new props, showDirectoryPicker, 8-bit classes).
- ProjectContextProvider integration is incomplete and does not align with ARCH-04-01/02 or EPIC-ARCH-04 requirements (no initialHandle prop, no restore/persistence, no handle passed to adapter, overlay never triggered).
- Result: story completion claims cannot be validated against current code.

## Evidence

### PermissionOverlay props and callbacks
- New props and union type exist, including onPermissionGranted/onCancel.
  - src/presentation/components/layout/PermissionOverlay.tsx:17-42
- showDirectoryPicker is called and passes handle to onPermissionGranted.
  - src/presentation/components/layout/PermissionOverlay.tsx:64-72
- Cancel callback only invoked inside catch; no explicit cancel button.
  - src/presentation/components/layout/PermissionOverlay.tsx:75-81

### 8-bit compliance
- Rounded classes removed; uses rounded-none and solid bg-amber-500.
  - src/presentation/components/layout/PermissionOverlay.tsx:86-112

### ProjectContextProvider integration gaps (ARCH-04-01/02 alignment)
- Provider signature has no initialHandle prop; ARCH-04-02 cannot pass handle into provider.
  - src/infrastructure/context/project-context.tsx:148-151
- StorageAdapterFactory called without handle.
  - src/infrastructure/context/project-context.tsx:208-214
- showPermissionOverlay state exists but is never set to true in initialization flow.
  - src/infrastructure/context/project-context.tsx:170-172, 177-271
- PermissionOverlay onPermissionGranted handler does not persist handle or reinitialize.
  - src/infrastructure/context/project-context.tsx:50-66, 54-61

## Acceptance Criteria Check (ARCH-04-03)
- AC1 PermissionOverlay props match new context callbacks: PASS (component defines onPermissionGranted/onCancel).
- AC2 Grant action calls onPermissionGranted with handle: PASS (showDirectoryPicker + callback).
- AC3 Cancel action returns user to hub: PARTIAL (onCancel navigates in provider, but no explicit cancel control; only triggered on picker cancel).
- AC4 Overlay follows 8-bit design rules: PASS (rounded-none, no transparency).
- AC5 Overlay wiring in ProjectContextProvider: FAIL (no logic to show overlay; no handle flow).

## Alignment with EPIC-ARCH-04 + ADR-034
- EPIC-ARCH-04 requires handle lifecycle in ProjectContextProvider (restore/persist, handle passed to adapter). Current provider lacks these (see evidence). This conflicts with ADR-034 project-centric single-source-of-truth and FSA desktop flow requirements.

## Compatibility with ARCH-04-01/02
- ARCH-04-02 expects ProjectContextProvider to accept initialHandle. Current provider does not, so integration is broken.
- ARCH-04-01 expects handle persistence/restore via handlePersistenceService; not present in current provider.

## Required Fixes Before PASS
1. Add initialHandle prop to ProjectContextProvider and wire to fsa handle state.
2. Call handlePersistenceService.restoreHandle() for FSA projects; set showPermissionOverlay when user interaction required.
3. Pass fsa handle into storageAdapterFactory.createAdapter().
4. Provide explicit cancel control in PermissionOverlay or document that picker cancel is the only cancel path.

## Verdict Rationale
Core overlay component changes are present, but the provider integration required by EPIC-ARCH-04 and ARCH-04-01/02 is missing in the current codebase. This blocks functional validation.
