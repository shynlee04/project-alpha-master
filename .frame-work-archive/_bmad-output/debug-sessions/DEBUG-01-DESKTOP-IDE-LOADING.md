# DEBUG SESSION 01: DESKTOP IDE LOADING FAILURE

**Status**: IN_PROGRESS
**Date**: 2026-01-17
**Priority**: CRITICAL
**Coordinator**: Antigravity

## Problem Description
User reports critical failure in "Returning User - Desktop - IDE Access" flow.
1. Sidebar IDE icon triggers "Use Temp Project" dialog (Unwanted).
2. Selecting folder freezes the app.
3. Hub Recent Projects lead to empty state/UI collapse.
4. "Back" button navigation is broken.

## Analysis Findings
- **Infection Point**: `src/spike/components/common/FolderPickerDialog.tsx` hardcodes "Use Temp Project".
- **Trigger**: Sidebar links to `/spike/ide` (root) instead of `/spike/ide/$projectId`.
- **Root Cause**: Missing route guard on `/spike/ide` and ambiguous sidebar navigation.

## Remediation Plan
1. **Exterminate**: Remove "Use Temp Project" button/logic from `FolderPickerDialog.tsx`.
2. **Redirect**: Modify `/spike/ide` route to redirect to `/spike` (Hub) if no project ID is present.
3. **Navigation**: Update Sidebar to link to dynamic project URL or Hub.

## Log
- [x] Initial Analysis (Analyst-Ext)
- [ ] Remove Temp Project (Dev-Ext)
- [ ] Fix Sidebar Routing (Dev-Ext)
- [ ] Verify Fix (User)
