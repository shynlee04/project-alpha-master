then the other team comes up with this "# Deep Scan Complete: Root Causes Identified

**Date**: 2026-01-17
**Status**: Critical Bugs Found in Permission Flow & Routing

---

## Findings

### 1. Permission Loop (BUG-011)
**Root Cause**: Strict folder name validation + Automatic prompting.
-   **Logic**: handle-persistence.ts rejects any folder where handle.name !== storedRecord.directoryPath.
-   **Loop**: If you renamed the folder (or casing changed), it rejects your selection, throws an error, and the UI (or hook) immediately re-prompts you. You select the folder again → Rejected again. Infinite loop.
-   **Fix**: Update the stored path if the user explicitly selects a folder, rather than rejecting it.

### 2. Notes Blocked on Desktop (BUG-012)
**Root Cause**: Hardcoded block in src/routes/notes.tsx.
-   **Logic**: if (platform.canAccessFSA) { return <ProjectPickerDialog ... />; } 
-   **Result**: Desktop users NEVER see the Notes interface. They see a dialog; if they close it, they go to /hub. Notes workspace is effectively disabled for desktop.
-   **Fix**: Remove this block. Allow Desktop users to enter Notes (showing project picker as an *option* or overlay, not a replacement).

### 3. Trash Identified (BUG-013)
-   src/routes/workspace/ (Legacy)
-   src/lib/workspace/fsa-persistence.ts (Dead code)

---

## Action Plan

I will delegate dev-ext to execute **FIX-PERM-01** (Permission & Routing Fixes).

**Steps**:
1.  **Fix BUG-011**: Modify handle-persistence.ts to update the stored path on mismatch instead of throwing/rejecting.
2.  **Fix BUG-012**: Remove the "Desktop Block" from src/routes/notes.tsx.
3.  **Fix BUG-013**: Delete the trash files (src/routes/workspace/, fsa-persistence.ts).
4.  **Record**: Update bug-log.yaml and file-change-registry.yaml.

**Shall I proceed with these fixes?**" I Wonder is it the solution for or making thing worse to the above