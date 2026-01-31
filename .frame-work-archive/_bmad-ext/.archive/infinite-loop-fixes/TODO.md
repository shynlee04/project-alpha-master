# Infinite Loop Fixes - TODO List

## Fix 1: IDELayoutMain.tsx useEffect Chains (Lines 200-206)
**Status**: PENDING
**File**: `src/presentation/components/layout/IDELayoutMain.tsx`
**Issue**: 5 separate useEffect hooks with refs in dependencies causing cascading re-renders

## Fix 2: useIdeStatePersistence.ts useEffect (Lines 122-129)
**Status**: PENDING
**File**: `src/hooks/useIdeStatePersistence.ts`
**Issue**: useEffect syncing refs with store state - already has single useEffect (good pattern)

## Fix 3: handlePersistenceService.persistHandle() in ProjectCreationWizard
**Status**: PENDING
**File**: `src/presentation/components/project/ProjectCreationWizard.tsx`
**Issue**: Missing handlePersistenceService.persistHandle() call after project creation

## Fix 4: TemplateSelectionStep.tsx useEffect with updateFormData
**Status**: PENDING
**File**: `src/presentation/components/project/steps/TemplateSelectionStep.tsx`
**Issue**: useEffect has updateFormData in dependency array (lines 106-114)

## Fix 5: Validate all fixes
**Status**: PENDING
**Action**: Run TypeScript and tests
