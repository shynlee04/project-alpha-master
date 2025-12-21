# Code Quality Standards (Course Correction v3)

**Status:** MANDATORY for all new code and refactoring  
**Enforcement:** Pre-commit hooks + Code review

### File Size Limits

| Standard | Limit | Rationale |
|----------|-------|-----------|
| **Lines per file** | ≤ 250 | Cognitive load, testability |
| **Public exports per module** | ≤ 2 | Single Responsibility |
| **Functions per file** | ≤ 5 | Focused modules |

### Zero Tolerance

- **No dead code** - Remove unused functions, variables, imports
- **No hardcoded values** - Use constants or configuration
- **No code smells** - Address complexity, duplication, coupling
- **No drift** - Follow established architectural patterns

### File Splitting Guidelines

When a file exceeds limits, split using these patterns:

```
Original: local-fs-adapter.ts (840 lines)

Split into:
├── local-fs-adapter.ts    # Main adapter, ≤200 lines
├── path-guard.ts          # Path validation, ≤100 lines
├── directory-walker.ts    # Directory traversal, ≤150 lines
├── file-io.ts             # Read/write operations, ≤150 lines
├── error-mapping.ts       # Error classification, ≤80 lines
└── index.ts               # Re-exports, ≤30 lines
```

### Current Violations (Tracked)

| File | Lines | Target | Epic |
|------|-------|--------|------|
| local-fs-adapter.ts | 840 | 200 | 11-1, 11-2 |
| sync-manager.ts | 530 | 200 | 11-3, 11-4 |
| IDELayout.tsx | 480 | 200 | 3-8, 11-5 |
| FileTree.tsx | 430 | 200 | 3-8, 11-7 |
| WorkspaceContext.tsx | 360 | 200 | 10-3 |
| project-store.ts | 355 | 200 | Keep (borderline) |

### Enforcement Tools

```bash
# ESLint rule for file length (planned)
"max-lines": ["error", { "max": 250, "skipBlankLines": true, "skipComments": true }]

# Pre-commit hook (planned)
#!/bin/bash
for file in $(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$'); do
  lines=$(wc -l < "$file")
  if [ "$lines" -gt 250 ]; then
    echo "Error: $file has $lines lines (max 250)"
    exit 1
  fi
done
```

---
