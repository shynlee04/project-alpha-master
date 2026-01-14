# File Structure Governance Scanner

**Domain:** file_structure_governance
**Priority:** P0 (CRITICAL - Foundation for Traceability)
**Created:** 2026-01-10
**Status:** Specification (Implementation Pending)

---

## description

Govern file structure, naming conventions, and change registration:
- All new files must be registered with metadata
- Naming conventions must be followed
- File changes must be logged
- Post-workflow hooks required for change registration

**Why P0 Critical:** Without governance:
- File changes become untraceable
- Naming chaos makes code hard to navigate
- Missing metadata prevents artifact management
- No audit trail for changes

---

## Scanner Scope

### 1. File Change Registration

**Target:** All files in `src/**/*.{ts,tsx}`

**Checks:**
- **New File Registration**: New files have required front matter/metadata
- **Change Logging**: File modifications are logged
- **Registration Window**: New files registered within 5 minutes of creation
- **Metadata Completeness**: All required metadata present

**Output:**
```typescript
interface FileRegistrationReport {
  file_path: string;
  registration_status: "registered" | "unregistered" | "stale";
  created_at: Date;
  registered_at?: Date;
  registration_delay_minutes?: number;
  missing_metadata: string[];
  change_log_entries: ChangeLogEntry[];
}
```

**Thresholds:**
- `registration_required`: true (for all new files)
- `change_log_grace_period_minutes`: 5
- `required_metadata`: ["author", "description", "related_domain"]

---

### 2. Naming Convention Enforcement

**Target:** All source files

**Checks:**
- **File Name Format**: Follows kebab-case for components, PascalCase for classes
- **Test File Naming**: Test files match source files
- **Folder Structure**: Files are in correct folder per architecture
- **Duplicate Names**: No duplicate file names (case-insensitive)

**Output:**
```typescript
interface NamingConventionReport {
  file_path: string;
  convention_type: "component" | "utility" | "type" | "test" | "hook" | "store";
  follows_convention: boolean;
  issues: NamingIssue[];
  suggested_name?: string;
}
```

**Conventions:**

| File Type | Pattern | Example |
|-----------|---------|---------|
| Component | `kebab-case.component.tsx` | `note-editor.component.tsx` |
| Utility | `kebab-case.ts` | `format-date.ts` |
| Type | `PascalCase.types.ts` | `Note.types.ts` |
| Test | `PascalCase.test.ts` | `NoteEditor.test.ts` |
| Hook | `use-PascalCase.ts` | `useNoteStore.ts` |
| Store | `kebab-case.store.ts` | `note-store.store.ts` |

---

### 3. Post-Workflow Hook Validation

**Target:** `.bmad/hooks/post-workflow.yaml`

**Checks:**
- **Hook Exists**: Post-workflow hook is configured
- **Hook Executable**: Hook script has execute permissions
- **Change Registration**: Hook calls change registration script
- **Failure Handling**: Hook failures are logged and reported

**Output:**
```typescript
interface PostWorkflowHookReport {
  hook_exists: boolean;
  hook_executable: boolean;
  change_registration_configured: boolean;
  last_execution?: Date;
  execution_failures: number;
}
```

**Thresholds:**
- `hook_required`: true
- `registration_in_hook`: true
- `max_hook_failures`: 3

---

### 4. Folder Structure Compliance

**Target:** `src/` folder structure

**Checks:**
- **Architecture Layers**: Files in correct layer (infrastructure, domain, presentation)
- **Feature Boundaries**: Feature-specific files in feature folders
- **No Circular Imports**: Detect cross-layer circular dependencies
- **Import Direction**: Imports follow dependency direction (infrastructure ← domain ← presentation)

**Output:**
```typescript
interface FolderStructureReport {
  file_path: string;
  correct_layer: boolean;
  current_layer: string;
  expected_layer?: string;
  cross_layer_imports: ImportInfo[];
  circular_dependencies: CircularDependency[];
}
```

**Valid Layers:**
- `src/infrastructure/` - External interfaces (API, persistence, sync)
- `src/domain/` - Business logic (entities, services, types)
- `src/presentation/` - UI components (components, hooks, routes)

---

## Scan Patterns

```yaml
file_registration:
  - "src/**/*.ts"
  - "src/**/*.tsx"

naming_conventions:
  - "src/**/*.component.tsx"
  - "src/**/*.types.ts"
  - "src/**/*.test.ts"
  - "src/**/*.store.ts"
  - "src/hooks/use-*.ts"

folder_structure:
  - "src/infrastructure/**/*.ts"
  - "src/domain/**/*.ts"
  - "src/presentation/**/*.ts"

post_workflow_hooks:
  - ".bmad/hooks/post-workflow.yaml"
  - "_bmad/hooks/post-workflow.yaml"
```

---

## Governance Rules

### Rule 1: New File Registration Required

**Problem:** New files without metadata can't be tracked

**Detection:**
```typescript
function checkFileRegistration(filePath: string): RegistrationStatus {
  const metadata = readFileMetadata(filePath);
  const required = ["author", "description", "created_at", "related_domain"];
  const missing = required.filter(f => !metadata[f]);

  if (missing.length > 0) {
    return {
      status: "unregistered",
      missing_metadata: missing,
      severity: "warning"
    };
  }

  const age = Date.now() - metadata.created_at;
  if (age > 5 * 60 * 1000 && !metadata.registered) { // 5 minutes
    return {
      status: "overdue",
      age_minutes: Math.floor(age / 60000),
      severity: "critical"
    };
  }

  return { status: "registered" };
}
```

**Action:**
- < 5 min: Warn about missing registration
- > 5 min: BLOCK until registered
- Log all registration delays

---

### Rule 2: Naming Convention Compliance

**Problem:** Inconsistent naming makes navigation difficult

**Detection:**
```typescript
function checkNamingConvention(filePath: string): NamingResult {
  const filename = basename(filePath);

  // Components: kebab-case.component.tsx
  if (filename.endsWith(".component.tsx")) {
    const match = filename.match(/^([a-z][a-z0-9-]*)\.component\.tsx$/);
    if (!match) {
      return {
        follows_convention: false,
        issue: "Component name must be kebab-case",
        suggested: toKebabCase(filename.replace(".tsx", ""))
      };
    }
  }

  // Hooks: use-PascalCase.ts
  if (filePath.startsWith("src/hooks/") && filename.match(/^use[A-Z]/)) {
    return { follows_convention: true };
  }

  // Stores: kebab-case.store.ts
  if (filename.endsWith(".store.ts")) {
    const match = filename.match(/^([a-z][a-z0-9-]*)\.store\.ts$/);
    if (!match) {
      return {
        follows_convention: false,
        issue: "Store name must be kebab-case"
      };
    }
  }

  return { follows_convention: true };
}
```

**Action:**
- Warn for non-critical files (utility, test)
- BLOCK for critical files (component, store, types)

---

### Rule 3: Post-Workflow Registration

**Problem:** Changes made during workflows aren't registered

**Detection:**
```typescript
function validatePostWorkflowHook(): HookValidation {
  const hookPath = "_bmad/hooks/post-workflow.yaml";

  if (!exists(hookPath)) {
    return {
      valid: false,
      issue: "Post-workflow hook does not exist",
      severity: "critical"
    };
  }

  const hook = readYaml(hookPath);

  if (!hook.steps?.some(s => s.change_registration)) {
    return {
      valid: false,
      issue: "Hook does not include change registration step",
      severity: "critical"
    };
  }

  return { valid: true };
}
```

**Action:** BLOCK workflow completions if hook missing/broken

---

### Rule 4: Architecture Layer Compliance

**Problem:** Files in wrong layer violate clean architecture

**Detection:**
```typescript
function checkArchitectureLayer(filePath: string): LayerResult {
  const { layer, category } = parsePath(filePath);

  // Infrastructure: only external interfaces
  if (layer === "infrastructure") {
    if (category === "components" || category === "ui") {
      return {
        compliant: false,
        issue: "UI components should be in presentation layer",
        expected_location: `src/presentation/components/${basename(filePath)}`
      };
    }
  }

  // Domain: only business logic
  if (layer === "domain") {
    if (category === "api" || category === "infrastructure") {
      return {
        compliant: false,
        issue: "Infrastructure code should be in infrastructure layer"
      };
    }
  }

  // Presentation: can use domain and infrastructure
  if (layer === "presentation") {
    // Always valid - presentation can depend on anything
    return { compliant: true };
  }

  return { compliant: true };
}
```

**Action:** Warn for misplaced files, suggest correct location

---

## Change Log Format

### Change Log Entry

```typescript
interface ChangeLogEntry {
  timestamp: string;
  file_path: string;
  change_type: "create" | "update" | "delete" | "move";
  author: string;
  workflow?: string;
  related_ticket?: string;
  description: string;
}
```

### Change Log Storage

**Location:** `_bmad/state/file-change-log.yaml`

**Format:**
```yaml
change_log:
  - timestamp: "2026-01-10T14:30:00+07:00"
    file_path: "src/domain/entities/Note.ts"
    change_type: update
    author: human
    workflow: "correct-course"
    related_ticket: "STORY-13-1"
    description: "Add deletedAt field to Note entity"

  - timestamp: "2026-01-10T15:00:00+07:00"
    file_path: "src/presentation/components/NoteEditor.tsx"
    change_type: create
    author: agent
    description: "Create note editor component with markdown support"
```

---

## Post-Workflow Hook Template

**Location:** `_bmad/hooks/post-workflow.yaml`

```yaml
name: post-workflow-change-registration
description: Register all file changes made during workflow
triggers:
  - workflow_complete

steps:
  - name: detect-changed-files
    action: git-status
    filter: "*.ts,*.tsx"

  - name: register-new-files
    action: register-files
    required_metadata:
      - author
      - description
      - related_domain
    grace_period_minutes: 5

  - name: log-modifications
    action: append-to-log
    log_file: _bmad/state/file-change-log.yaml

  - name: validate-naming
    action: check-naming-conventions
    block_on_violation: false

  - name: notify-on-failure
    action: notify
    on: failure
    message: "Post-workflow registration failed for ${files}"
```

---

## Output Format

### Scanner Result

```typescript
interface FileStructureScannerResult {
  scanner: "file-structure-scanner";
  timestamp: string;
  status: "PASS" | "WARN" | "FAIL";
  domains: string[];

  file_registration: {
    total_files: number;
    registered_files: number;
    unregistered_files: number;
    overdue_files: number;
    report: FileRegistrationReport[];
  };

  naming_conventions: {
    total_files_checked: number;
    compliant_files: number;
    non_compliant_files: number;
    report: NamingConventionReport[];
  };

  folder_structure: {
    total_files_checked: number;
    compliant_files: number;
    misplaced_files: number;
    circular_dependencies: number;
    report: FolderStructureReport[];
  };

  post_workflow_hook: {
    hook_exists: boolean;
    hook_valid: boolean;
    last_execution?: Date;
    report: PostWorkflowHookReport;
  };

  recommendations: string[];
  critical_issues: string[];
}
```

---

## Integration with Enforcement Checks

### Context First Check

- **Domain Mapping**: file, structure, change, naming keywords → file_structure_governance domain
- **File Selection**: Scan all `src/**/*.{ts,tsx}` files
- **Relevance Scoring**: Prioritize new files, recently modified files

### Expert Analysis Check

- **Category Detection**: File structure changes often = independent_feature (if isolated) or architectural_conflict (if cross-layer)
- **Impact Assessment**: Check for architecture layer violations
- **Dependency Check**: Verify no circular dependencies introduced

### Research Trigger

Auto-trigger research when:
- Refactoring folder structure
- Introducing new naming conventions
- Changing file organization patterns

---

## Implementation Checklist

- [ ] New file registration detection
- [ ] Change log validation
- [ ] Naming convention checks (all file types)
- [ ] Post-workflow hook validation
- [ ] Architecture layer compliance
- [ ] Circular dependency detection
- [ ] Duplicate name detection
- [ ] Registration grace period enforcement
- [ ] Metadata completeness check
- [ ] Change log append functionality

---

## Example Scanner Output

```
┌─────────────────────────────────────────────────────────────┐
│           FILE STRUCTURE GOVERNANCE SCAN REPORT             │
├─────────────────────────────────────────────────────────────┤
│ Status: WARN ⚠️                                             │
│                                                              │
│ File Registration:                                           │
│   Total Files: 127                                           │
│   Registered: 119 ✅                                         │
│   Unregistered: 8 ⚠️                                        │
│   Overdue (>5min): 2 ❌                                     │
│                                                              │
│ Naming Conventions:                                          │
│   Compliant: 115 ✅                                          │
│   Non-Compliant: 12 ⚠️                                       │
│                                                              │
│ Folder Structure:                                            │
│   Misplaced Files: 3 ⚠️                                      │
│   Circular Dependencies: 0 ✅                                │
│                                                              │
│ Critical Issues:                                             │
│   ❌ src/new-file.ts (unregistered, 12min old)             │
│   ❌ src/MyComponent.tsx (wrong naming, use kebab-case)     │
│   ⚠️ Post-workflow hook not executable                       │
│                                                              │
│ Recommendations:                                             │
│   1. Register new files with metadata                        │
│   2. Rename MyComponent.tsx → my-component.component.tsx     │
│   3. Fix post-workflow hook permissions                     │
└─────────────────────────────────────────────────────────────┘
```

---

**Lines:** ~180 (estimated)
**Dependencies:** domains.yaml, expert-analysis-engine.ts
**Stage:** Week 2 (P0 Scanners)
