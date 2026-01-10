# Expert Analysis - Codebase Comparison Workflow

**Purpose:** Compare user request against actual codebase to detect flaws and determine appropriate response

**Workflow Type:** Enforcement Check 2 of 3

**Integration:** Receives contextualized prompt from `context-first.md`, outputs to governance report

---

## Overview

This workflow implements the second enforcement check: **Agent as Expert**. It analyzes the user's request against the actual codebase to identify potential problems and categorize the appropriate response.

**Core Capability:** The agent must act as an expert that:
1. Compares user approach with ACTUAL codebase patterns
2. Detects flaws in user's approach
3. Decides whether to ALLOW, WARN, or BLOCK the work

---

## Error Category Determination

### Category Definitions

#### 1. Quick Patch (Immediate Fix Allowed)

**Characteristics:**
- Single component change
- No cross-domain impact
- No state boundary violation
- Test coverage exists
- Clear, isolated fix

**Examples:**
- Fixing a typo in component text
- Correcting a CSS class name
- Adding a missing import
- Fixing a simple bug in isolated function

**Response:** ALLOW - Proceed with direct fix

#### 2. Independent Feature (Isolated Workflow)

**Characteristics:**
- New feature or self-contained change
- Minimal cross-domain impact
- Clear boundaries
- Can be tested independently
- No circular dependencies

**Examples:**
- Adding a new button component
- Creating a new utility function
- Adding a new route with isolated logic
- Implementing a standalone service

**Response:** WARN - Lightweight gating, acknowledge scope

#### 3. Architectural Conflict (Comprehensive Remediation Required)

**Characteristics:**
- Cross-domain impact (2+ domains affected)
- State boundary violation
- Affects multiple features
- Requires journey mapping
- Potential circular dependencies

**Examples:**
- Modifying store structure used by multiple features
- Changing file system adapter interface
- Modifying sync orchestration flow
- Changes affecting both presentation and infrastructure

**Response:** BLOCK - Require comprehensive remediation

---

## Detection Logic

### Conflict Detection Algorithm

```typescript
function detectConflict(
  userRequest: string,
  contextualizedPrompt: ContextualizedPrompt,
  codebaseAnalysis: CodebaseSnapshot
): Category {
  // Check 1: Domain overlap
  const affectedDomains = analyzeDomains(userRequest, codebaseAnalysis);
  if (affectedDomains.length > 2) {
    return {
      category: "architectural_conflict",
      reason: `Affects ${affectedDomains.length} domains: ${affectedDomains.join(', ')}`
    };
  }

  // Check 2: State boundary violation
  if (touchesStateBoundary(userRequest, codebaseAnalysis)) {
    return {
      category: "architectural_conflict",
      reason: "Modifies state boundaries affecting multiple consumers"
    };
  }

  // Check 3: Journey impact
  if (affectsUserJourney(userRequest, codebaseAnalysis)) {
    return {
      category: "architectural_conflict",
      reason: "Changes affect critical user journey paths"
    };
  }

  // Check 4: Test coverage
  if (!hasTestCoverage(userRequest, codebaseAnalysis)) {
    return {
      category: "independent_feature",
      reason: "New feature without existing tests - requires test creation"
    };
  }

  // Default: Quick Patch
  return {
    category: "quick_patch",
    reason: "Isolated change with clear scope"
  };
}
```

### Analysis Checks

#### Check 1: Domain Overlap

```typescript
function analyzeDomains(request: string, codebase: CodebaseSnapshot): string[] {
  const affectedFiles = extractMentionedFiles(request);
  const domains = new Set<string>();

  for (const file of affectedFiles) {
    const domain = classifyFile(file);
    domains.add(domain);
  }

  return Array.from(domains);
}

function classifyFile(filePath: string): string {
  const path = filePath.toLowerCase();

  if (path.includes('/domain/services/')) return 'domain_services';
  if (path.includes('/infrastructure/persistence/')) return 'state_persistence';
  if (path.includes('/presentation/components/')) return 'ui_components';
  if (path.includes('/routes/')) return 'routing';
  if (path.includes('/infrastructure/sync/')) return 'sync';

  return 'other';
}
```

#### Check 2: State Boundary Violation

```typescript
function touchesStateBoundary(request: string, codebase: CodebaseSnapshot): boolean {
  const keywords = ['store', 'state', 'zustand', 'persistence', 'dexie'];
  const hasStateKeywords = keywords.some(k => request.toLowerCase().includes(k));

  if (!hasStateKeywords) return false;

  // Check if modification affects existing store
  const storeFiles = codebase.files.filter(f =>
    f.path.includes('stores/') && f.path.endsWith('-store.ts')
  );

  for (const store of storeFiles) {
    const consumers = codebase.findImports(store.exportedSymbols);
    if (consumers.length > 3) {
      // Heavily used store - architectural impact
      return true;
    }
  }

  return false;
}
```

#### Check 3: Journey Impact

```typescript
function affectsUserJourney(request: string, codebase: CodebaseSnapshot): boolean {
  // Identify journey-critical files
  const criticalFiles = [
    'sync-manager.ts',
    'file-lock-service.ts',
    'auth-service.ts'
  ];

  const mentionedFiles = extractMentionedFiles(request);
  const touchesCritical = mentionedFiles.some(f =>
    criticalFiles.some(c => f.toLowerCase().endsWith(c))
  );

  return touchesCritical;
}
```

#### Check 4: Test Coverage

```typescript
function hasTestCoverage(request: string, codebase: CodebaseSnapshot): boolean {
  const targetFile = extractPrimaryTarget(request);
  if (!targetFile) return true; // No specific target - assume patch

  const testFile = targetFile.replace('.ts', '.test.ts').replace('.tsx', '.test.tsx');
  return codebase.files.some(f => f.path === testFile);
}
```

---

## Flaw Detection

### Common User Approach Flaws

| Flaw Type | Detection Pattern | Example |
|-----------|-------------------|---------|
| Overlapping Work | Request duplicates existing code | "Add file locking" when FileLockService exists |
| Conflicting Changes | Request breaks existing patterns | "Change to rounded corners" when 8-bit system active |
| Missing Dependencies | Request skips required setup | "Add RAG" without Stage 0 completion |
| Wrong Category | User miscategorizes complexity | "Quick fix" for store refactoring |

### Detection Rules

```typescript
const flawRules = [
  {
    name: "Overlapping Work",
    detect: (request, codebase) => {
      const keywords = extractKeywords(request);
      for (const file of codebase.files) {
        const fileKeywords = extractKeywords(file.content);
        const overlap = intersection(keywords, fileKeywords);
        if (overlap.length >= 3) {
          return {
            flaw: "overlapping_work",
            evidence: `Similar functionality exists in ${file.path}`,
            existing: file.path
          };
        }
      }
      return null;
    }
  },
  {
    name: "Conflicting Changes",
    detect: (request, codebase) => {
      // Check against design system standards
      if (request.includes('rounded') && codebase.hasDesignSystem('8-bit')) {
        return {
          flaw: "design_conflict",
          evidence: "Project uses 8-bit design system with sharp corners only",
          standard: "8-bit-design-tokens"
        };
      }
      return null;
    }
  },
  {
    name: "Missing Dependencies",
    detect: (request, codebase) => {
      if (request.includes('RAG') || request.includes('agent')) {
        const stageStatus = getStageStatus(codebase);
        if (stage.current !== 'Stage 1') {
          return {
            flaw: "stage_gate_violation",
            evidence: "RAG features require Stage 1 completion",
            current: stage.current,
            required: "Stage 1"
          };
        }
      }
      return null;
    }
  }
];
```

---

## Action Decision Matrix

| Finding | Action | Governance Response |
|---------|--------|---------------------|
| Quick Patch + No Flaws | ALLOW | Proceed directly, no gate |
| Quick Patch + Minor Flaws | WARN | Note overlap, confirm intent |
| Independent Feature | WARN | Lightweight gating, acknowledge scope |
| Architectural Conflict | BLOCK | Require comprehensive remediation |

---

## Output Format

### Expert Analysis Report

```yaml
expert_analysis:
  timestamp: "2026-01-10T10:35:00Z"
  contextualized_prompt: "[from context-first]"

  request_analysis:
    primary_target: "file-lock-service.ts"
    affected_domains:
      - "domain_services"
      - "sync"
    complexity: "independent_feature"

  flaw_detection:
    overlapping_work: null
    conflicting_changes: null
    missing_dependencies: null
    wrong_category: false

  categorization:
    category: "independent_feature"
    confidence: 0.85
    reasoning: "New service implementation, isolated to domain layer, minimal cross-domain impact"

  recommendation:
    action: "WARN"
    governance_decision: "Lightweight gating required"
    next_steps:
      - "Confirm isolated scope"
      - "Ensure test coverage created"
      - "Register new service in artifact registry"

  artifacts_to_register:
    - path: "domain/services/file-lock-service.ts"
      type: "domain_service"
      stage: "Stage 1"
```

---

## Integration Points

### Input: From context-first.md

```yaml
input:
  contextualized_prompt: "{{from_context_first}}"
  context_summary: "{{from_context_first}}"
  original_user_prompt: "{{from_correct_course}}"
```

### Output: To correct-course.yaml (Governance Report)

```yaml
output:
  category: "{{quick_patch|independent_feature|architectural_conflict}}"
  recommendation: "{{ALLOW|WARN|BLOCK}}"
  flaw_report: "{{flaw_detection_result}}"
  next_steps: "{{action_items}}"
```

---

## Success Criteria

### PASS Conditions:
- [ ] Category determined with confidence >0.7
- [ ] Flaws detected or ruled out
- [ ] Action decision clear (ALLOW/WARN/BLOCK)
- [ ] Next steps defined

### FAIL Conditions:
- [ ] Cannot determine category (confidence <0.5)
- [ ] Conflicting analysis results
- [ ] Missing codebase context

---

**Workflow Owner:** governance-core
**Integrates With:**
- `_bmad-ext/modules/governance-core/workflows/context-first.md` (input)
- `_bmad-ext/modules/governance-core/workflows/correct-course.yaml` (output)
- `_bmad-ext/state/ARTIFACT_REGISTRY.yaml` (registration)

**Last Updated:** 2026-01-10
