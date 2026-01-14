# Utility: Stale Check

> **description:** Validate file freshness before development
> **Used by:** Step 04 (validate-context)

---

## What It Checks

A file is considered **stale** if:
1. Last modified >24 hours ago AND not explicitly acknowledged
2. Has uncommitted changes in git
3. Context file timestamp is older than referenced source files

## Usage

```bash
# Load this utility
READ: _bmad/bmb/workflows/story-cycle/utils/_stale-check.md

# Execute on context XML
EXECUTE: check_freshness(context_file_path)
```

## Check Procedure

### 1. Extract Referenced Files

From context XML `<files>` section:
```xml
<files>
  <file path="src/lib/example.ts" ... />
  <file path="src/components/Widget.tsx" ... />
</files>
```

### 2. Check Each File

```bash
FOR EACH file IN referenced_files:
  # Get file modification time
  stat {file_path}

  # Get git status
  git status {file_path}

  # Compare to context XML timestamp
  # If file mtime > context timestamp: STALE
END FOR
```

### 3. Report Results

```markdown
## Stale Check Report

**Context:** {context_file}
**Checked At:** {timestamp}

| File | Modified | Status | Notes |
|------|----------|--------|-------|
| src/lib/x.ts | {mtime} | ✅ Current | Modified 2h ago |
| src/lib/y.ts | {mtime} | ⚠️ Stale | Modified 3d ago |

### Overall: {PASS|FAIL|ACKNOWLEDGED}

### Actions Required
{if stale files exist, list options}
```

## Handling Stale Files

### Option 1: Refresh Context
- Re-run step 03 (create-context)
- Update code snippets with current file content
- Update context timestamp

### Option 2: Acknowledge Stale State
- Document why stale state is acceptable
- Add explicit acknowledgement in context XML:
  ```xml
  <file path="..." acknowledged="true" reason="intentional_stale">
  ```

### Option 3: Defer Story
- Pause story development
- Wait for file to be committed/stabilized
- Resume when ready

## Integration

Called from:
- `04-validate-context.md` (mandatory check)
- Can be triggered manually via `/stale-check {context_file}`
