---
name: validate-integration
description: "Run 12-level sweeping validation on KSI integration"
agent: integration-validator
estimated_effort: "4 hours"
---

# Validate KSI Integration

**Purpose:** Execute comprehensive 12-level validation on Knowledge Synthesis 
Integration to ensure all components are properly wired and meet quality standards.

**References:**
- `_bmad-output/validation/sweeping-validation.md`
- `_bmad-output/validation/12-level-framework-integration-2025-12-29.md`

---

## Pre-Validation Checks

```bash
# 1. Build must pass
pnpm build

# 2. TypeScript check
pnpm tsc --noEmit

# 3. Tests must pass
pnpm test
```

---

## Level 1: State Integrity (KSI-Specific)

- [ ] **Synthesis state single source**
  - `synthesisStore` is only source for synthesis results
  - No localStorage fallbacks
  - Test: Synthesize → refresh → state persists

- [ ] **Chat mode persistence**
  - Mode stored in localStorage
  - Correct mode loaded on mount
  - Test: Change mode → refresh → mode persists

- [ ] **Citation state flow**
  - Citations flow from retriever → hook → UI
  - No stale citations after new query
  - Test: Query → wait → new query → old citations cleared

- [ ] **RAG index hydration**
  - Orama index loaded from IndexedDB on init
  - No duplicate indexing
  - Test: Import source → refresh → source searchable

---

## Level 2: Code Hygiene (KSI Files)

**File Size Check:**
```bash
# Run on KSI-related files
find src -name "*.ts" -o -name "*.tsx" | \
  xargs wc -l | \
  awk '$1 > 300 {print $2 ": " $1 " lines (VIOLATION)"}' | \
  grep -E "(synthesis|rag|knowledge|linkage|citation)"
```

Expected violations: 0

**Unused Imports:**
```bash
# Check for unused imports in KSI files
pnpm eslint src/lib/knowledge --rule 'no-unused-vars: error'
pnpm eslint src/lib/rag --rule 'no-unused-vars: error'
pnpm eslint src/presentation/components/knowledge --rule 'no-unused-vars: error'
```

Expected errors: 0

---

## Level 3: Naming Consistency (KSI)

- [ ] **Source ID naming**
  - All use `sourceId` (no `source_id`, `srcId`, `id`)
  - Grep check: `grep -rE "(source_id|srcId)" src/lib/knowledge/`

- [ ] **Synthesis ID naming**
  - All use `synthesisId` 
  - Grep check: `grep -rE "(synthesis_id|synthId)" src/lib/knowledge/`

- [ ] **Event naming**
  - All use `SCREAMING_SNAKE_CASE`
  - Pattern: `SOURCE_IMPORTED`, `SOURCE_SYNTHESIZED`

---

## Level 4: Dependency Sanity (KSI)

**Circular Import Check:**
```bash
pnpm madge --circular src/lib/knowledge src/lib/rag
```

Expected: No circular dependencies

**Cross-Store Import Check:**
- [ ] Stores don't import other stores directly
- [ ] Event bus used for cross-store communication

---

## Level 5: Integration Reality (KSI)

### Source → RAG Pipeline
- [ ] Import source → auto-indexed in Orama
- [ ] Search returns imported source
- [ ] Delete source → removed from index

### Chat → RAG Pipeline
- [ ] RAG mode query → hybrid-retriever called
- [ ] Hybrid mode → context injected into prompt
- [ ] Citations returned with response

### Synthesis Pipeline
- [ ] Synthesize button calls SynthesisService
- [ ] Gemini API called with correct prompt
- [ ] Frontmatter validated with Zod
- [ ] Result stored in Dexie

### Canvas Linkage Pipeline
- [ ] 3+ nodes → analysis triggered
- [ ] Recommendations displayed
- [ ] Accept → edge created

---

## Level 6: Architecture Compliance (KSI)

- [ ] **Layer boundaries**
  - Components don't call Gemini API directly
  - All API calls go through services
  - `grep -r "generativelanguage.googleapis.com" src/components/` → 0 results

- [ ] **Store access patterns**
  - Components use hooks, not stores directly
  - `grep -r "synthesisStore" src/components/` → only via hooks

- [ ] **Event-driven updates**
  - UI updates via event subscriptions
  - No direct store mutations from components

---

## Level 7: Mobile Reality (KSI)

- [ ] **Knowledge page layout**
  - Works on 640px width
  - SourceCard stack vertically on mobile
  - No horizontal scrolling

- [ ] **Chat mode toggle**
  - Visible on mobile
  - Touch targets ≥44px

- [ ] **Citation sidebar**
  - Collapses to overlay on mobile
  - Swipe to open/close

---

## Level 8: I18N Wiring (KSI)

**Check for hardcoded strings:**
```bash
# In KSI components
grep -rE '>\s*[A-Z][a-z]+' src/presentation/components/knowledge/*.tsx | \
  grep -v 't(' | grep -v '{' | head -20
```

Expected: 0 hardcoded strings

**Check translation completeness:**
- [ ] `en.json` has all KSI keys
- [ ] `vi.json` has all KSI keys
- [ ] No `[key]` rendering in UI

---

## Level 9: Performance Under Load (KSI)

### Large Knowledge Base
- [ ] 100 sources load in <2s
- [ ] Search response <500ms for 100 indexed docs
- [ ] Canvas with 50 nodes at 60fps

### Synthesis Performance
- [ ] Synthesis request <10s for typical PDF
- [ ] UI responsive during synthesis (loading state)
- [ ] Concurrent synthesis possible (queue or parallel)

---

## Level 10: Security + Privacy (KSI)

- [ ] **API key handling**
  - Gemini key from credentialVault only
  - No key in console.log or error messages
  - Key not in network request logs

- [ ] **Source content privacy**
  - Content only sent to Gemini for synthesis
  - No content sent to non-AI endpoints
  - Local FS files stay local

---

## Level 11: Documentation Completeness (KSI)

- [ ] **README updated**
  - Knowledge synthesis features documented
  - API configuration documented

- [ ] **AGENTS.md updated**
  - KSI module listed
  - Workflows documented

- [ ] **JSDoc comments**
  - Public functions documented
  - Types have descriptions

---

## Level 12: Test Coverage (KSI)

```bash
# Run tests for KSI modules
pnpm test -- --coverage src/lib/knowledge src/lib/rag
```

**Target Coverage:**
- [ ] synthesis-service.ts: >80%
- [ ] source-rag-bridge.ts: >80%
- [ ] linkage-analyzer.ts: >80%
- [ ] hybrid-retriever.ts: >80%

---

## Use Case Validation

### Use Case 1: Initial Vault Population
```
[ ] Create vault
[ ] Batch import (PDF, image, audio, markdown)
[ ] All sources processed successfully
[ ] Click "Synthesize" on each
[ ] Frontmatter generated for all
[ ] Sources searchable in RAG
[ ] Subject groupings visible
```

### Use Case 2: Canvas Linkage Discovery
```
[ ] Open canvas
[ ] Drag 3 synthesized sources to canvas
[ ] Trigger linkage discovery
[ ] Recommendations appear
[ ] Accept conceptual link
[ ] Edge created with label
[ ] Dismiss proposal → removed
[ ] Cluster synthesis proposal appears
```

### Use Case 3: Conversational Knowledge Exploration
```
[ ] Open chat in populated vault
[ ] Toggle to "Hybrid" mode
[ ] Query about concepts across sources
[ ] Response includes knowledge context
[ ] Citations displayed in sidebar
[ ] Click citation → source preview
[ ] Request synthesis → new artifact created
```

### Use Case 4: Dynamic Knowledge Matrix
```
[ ] Vault has 20+ sources
[ ] Invoke reorganization
[ ] Analysis runs
[ ] Subject classifications shown
[ ] Relevancy scores calculated
[ ] 3 organization options presented
[ ] Select option → view updates
[ ] Multiple views work simultaneously
```

---

## Validation Report Template

```markdown
# KSI Integration Validation Report
Date: {{date}}
Iteration: {{iteration}}

## Summary
- **Overall Score:** {{score}}/100
- **Levels Passed:** {{passed}}/12
- **Use Cases Passed:** {{useCasesPassed}}/4

## Level Results
| Level | Status | Issues | Notes |
|-------|--------|--------|-------|
| L1 State Integrity | {{status}} | {{issues}} | {{notes}} |
| L2 Code Hygiene | {{status}} | {{issues}} | {{notes}} |
| ... | ... | ... | ... |

## Use Case Results
| Use Case | Status | Gaps |
|----------|--------|------|
| 1. Vault Population | {{status}} | {{gaps}} |
| 2. Canvas Linkage | {{status}} | {{gaps}} |
| 3. Conversational | {{status}} | {{gaps}} |
| 4. Knowledge Matrix | {{status}} | {{gaps}} |

## Critical Issues
1. {{issue}}
2. {{issue}}

## Next Actions
1. {{action}}
2. {{action}}
```

---

## Update LOOP_STATE.yaml

```yaml
phase_7:
  tasks:
    - id: "run-12-level-validation"
      status: "DONE"
      completed_at: "{{timestamp}}"
      notes: "Score: {{score}}/100, {{passed}}/12 levels passed"
```
