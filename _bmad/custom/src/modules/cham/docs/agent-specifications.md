# CHAM Agent Specifications

## Discovery Agents

### Cartographer

**Purpose:** Map codebase structure, dependencies, and file relationships

**MCP Tools:**
- deepwiki - Scan entire codebase
- File tree walker
- Import/export analyzer

**Output:** codebase-map.json

**Key Capabilities:**
- File inventory with metadata
- Dependency graph building
- Orphaned file detection
- Circular dependency detection

### Pattern Analyzer

**Purpose:** Detect architectural patterns actually used vs. documented

**MCP Tools:**
- deepwiki - Read architecture docs + code
- context7 - Fetch TanStack/React patterns
- Pattern matching engine

**Output:** patterns-detected.yaml

**Key Capabilities:**
- Compare stated vs. actual architecture
- Detect pattern violations
- Identify anti-patterns
- Map state management approaches

## Scanning Agents (8)

### Architecture Compliance

**Purpose:** Detect violations of stated architecture

**MCP Tools:** deepwiki

**Output:** issue-reports/architecture.json

**Scans For:**
- Files in wrong layers
- Cross-domain imports bypassing APIs
- Missing domain boundaries
- Inconsistent folder structures
- Event bus usage issues

### Dependency Hygiene

**Purpose:** Analyze package usage, version mismatches, redundancy

**MCP Tools:** context7, tavily

**Output:** issue-reports/dependencies.json

**Scans For:**
- Unused dependencies
- Redundant packages
- Deprecated packages
- Missing peer dependencies
- Bundle size impact

### Type Safety

**Purpose:** Detect TypeScript type issues

**MCP Tools:** context7

**Output:** issue-reports/type-safety.json

**Scans For:**
- `any` types
- `@ts-ignore` comments
- Missing return types
- Implicit `any` in callbacks
- Non-null assertions
- Type casting abuse

### State Management

**Purpose:** Detect state duplication and sync issues

**MCP Tools:** deepwiki, context7

**Output:** issue-reports/state.json

**Scans For:**
- Duplicated state
- Missing single source of truth
- Unnecessary local state
- Missing persistence
- Over-rendering
- State mutations

### Performance

**Purpose:** Detect performance issues

**MCP Tools:** tavily, Bundle analyzer

**Output:** issue-reports/performance.json

**Scans For:**
- Large components
- Missing React.memo
- Missing useMemo/useCallback
- Unoptimized images
- Missing code splitting
- Event listeners not cleaned up
- Memory leaks

### Test Coverage

**Purpose:** Analyze test coverage and quality

**MCP Tools:** deepwiki, Vitest coverage parser

**Output:** issue-reports/testing.json

**Scans For:**
- Files with 0% coverage
- Missing integration tests
- Tests importing from lib/ instead of domains/
- Flaky tests
- Test duplication
- Missing E2E tests

### UX Consistency

**Purpose:** Detect UI/UX issues and accessibility problems

**MCP Tools:** deepwiki, context7

**Output:** issue-reports/ux.json

**Scans For:**
- Inconsistent button styles
- Missing loading states
- Poor error messages
- Missing accessibility
- Inconsistent spacing/typography
- Dark mode support issues

### Security & Data Flow

**Purpose:** Detect security vulnerabilities

**MCP Tools:** tavily, context7

**Output:** issue-reports/security.json

**Scans For:**
- API keys in localStorage
- XSS vulnerabilities
- CORS issues
- File System Access API edge cases
- Unvalidated user input
- Sensitive data in error logs

## Synthesis Agent

### Synthesizer

**Purpose:** Merge all issue reports into prioritized remediation roadmap

**Inputs:** All 8 issue-reports/*.json files

**Output:** remediation-roadmap.md

**Process:**
1. De-duplicate issues
2. Calculate impact scores
3. Cluster related issues
4. Sequence remediation
5. Estimate effort

## Remediation Agents (5)

### Architecture Fixer

**Purpose:** Fix architecture violations by moving files and updating imports

**Specializes In:**
- File moves
- Import rewriting
- Folder restructuring
- Export updates

### Type Safety Fixer

**Purpose:** Add types, remove `any`, fix type errors

**MCP Tools:** context7

**Specializes In:**
- Replacing `any` with proper types
- Adding missing return types
- Fixing type errors
- Improving type patterns

### State Refactor

**Purpose:** Consolidate stores, add persistence

**Specializes In:**
- Merging duplicate state
- Adding PersistMiddleware
- Improving state patterns
- Removing unnecessary complexity

### Test Writer

**Purpose:** Write missing tests, fix brittle tests

**MCP Tools:** deepwiki, context7

**Specializes In:**
- Writing missing tests
- Fixing flaky tests
- Improving test quality
- Adding E2E tests

### Test Validator

**Purpose:** Run tests, check coverage, report regressions

**Specializes In:**
- Running test suites
- Checking coverage deltas
- Detecting regressions
- Performance monitoring

## Orchestration Agent (1)

### Master Orchestrator

**Purpose:** Understand natural language, diagnose requirements, plan sequential cycles, generate executable prompts

**Capabilities:**
- Natural language understanding and parsing
- Comprehensive diagnosis and check-ups
- Sequential planning with agent/workflow cycles
- Executable prompt generation (ready to paste)
- Progress tracking across cycles
- Automatic handoffs with feedback loops

**Output:** master-plan.md + cycle-prompts.md + execution-status.json

**Key Features:**
- Auto-fetches agents/workflows in generated prompts
- Platform-specific prompt formatting
- Context preservation across cycles
- Iteration and rollback support

## Validation Agents (2)

### Final Validator

**Purpose:** Re-run all scans and validate remediation

**Process:**
1. Re-run all 8 scanning agents
2. Compare before/after counts
3. Verify metrics hit targets
4. Smoke test critical flows

**Output:** final-validation-report.md

### Documenter

**Purpose:** Update architecture docs and generate reports

**Process:**
1. Update architecture docs
2. Generate audit summary
3. Create migration guide
4. Update module README

**Output:** Updated documentation + audit report
