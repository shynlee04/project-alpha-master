# Code Quality Standards (Mandatory - Course Correction v3)

### File Size Limits

| Metric | Limit | Enforcement |
|--------|-------|-------------|
| Lines per file | ≤250 | ESLint max-lines |
| Exports per file | ≤2 | Manual review |
| Cyclomatic complexity | ≤10 | ESLint complexity |

### Current Violations to Address

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

**Architecture Status:** UPDATED - Course Correction v5 Applied ✅

**Updates Applied:**

| Date | Course Correction | Changes |
|------|-------------------|---------|
| 2025-12-12 | v3 | Event Bus, AI Tool Facades, WorkspaceOrchestrator, Code Quality |
| 2025-12-20 | v5 | Terminal Integration, Sync Behavior, Known Issues (Epic 13) |
| 2025-12-21 | Gap Analysis | State management (Zustand), Security headers, Deployment patterns |

---
