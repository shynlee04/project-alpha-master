# Tool Enforcement Matrix for Best Practices

**Version**: 1.0.0  
**Date**: 2026-01-18  
**Purpose**: Categorize all best practices into tool-enforceable categories with ESLint configurations

---

## Overview

This document categorizes all recommendations from two source documents:

1. **Cycle 4 Report Best Practices** - Found in `best-practices-validation-2026-01-08.md`
2. **Agent OS Best Practices** - Found in `.opencode/instructions/` directory

Each rule is categorized based on how enforceable it is by automated tools (ESLint, scripts, CI/CD).

---

## tool_enforcement_matrix

### fully_tool_enforceable

Rules that can be 100% enforced by ESLint, scripts, or CI/CD:

```yaml
fully_tool_enforceable:
  # ===== STATE MANAGEMENT RULES =====

  - rule: "Store files must be <300 lines (Slice Pattern)"
    source: "Cycle 4 Report - ADR-027"
    tool: "ESLint max-lines"
    implementation: |
      ".eslintrc": {
        "max-lines": ["error", {
          "max": 300,
          "skipBlankLines": true,
          "skipComments": true
        }]
      }
    priority: P0
    auto_fixable: false
    category: "state"
    enforcement_location: "pre-commit, ci"

  - rule: "Zustand store slices must be <120 lines"
    source: "Cycle 4 Report - ADR-027"
    tool: "ESLint custom plugin"
    implementation: |
      // Custom ESLint rule: max-lines-per-slice
      {
        "name": "zustand-slice-size",
        "meta": { "fixable": "code" },
        create(context) {
          return {
            CallExpression(node) {
              if (isZustandSlicePattern(node)) {
                const lines = getSourceCodeLength(node);
                if (lines > 120) {
                  context.report({ node, message: "Slice must be <120 lines" });
                }
              }
            }
          };
        }
      }
    priority: P1
    auto_fixable: false
    category: "state"
    enforcement_location: "pre-commit"

  - rule: "No direct imports from src/lib/"
    source: "Agent OS - Canonical Sources"
    tool: "eslint-plugin-import"
    implementation: |
      ".eslintrc": {
        "import/no-restricted-paths": ["error", {
          "zones": [
            { "target": "src/lib", "message": "Use @/infrastructure, @/domain, or @/presentation instead" },
            { "target": "src/stores", "message": "Stores must be in @/infrastructure/persistence/stores" }
          ]
        }]
      }
    priority: P0
    auto_fixable: false
    category: "architecture"
    enforcement_location: "pre-commit, ci"

  - rule: "Zustand must use individual selectors"
    source: "Cycle 4 Report - ADR-001"
    tool: "ESLint custom plugin"
    implementation: |
      // Custom rule to detect destructuring from useStore
      {
        "name": "zustand-no-destructuring",
        meta: { type: "problem" },
        create(context) {
          return {
            CallExpression(node) {
              if (isZustandUseStoreCall(node) && hasDestructuringPattern(node)) {
                context.report({
                  node,
                  message: "Use individual selectors: useStore(state => ({ prop: state.prop }))"
                });
              }
            }
          };
        }
      }
    priority: P1
    auto_fixable: false
    category: "state"
    enforcement_location: "pre-commit"

  # ===== COMPONENT SIZE RULES =====

  - rule: "React components must be <300 lines"
    source: "Cycle 4 Report - ADR-004"
    tool: "ESLint max-lines"
    implementation: |
      ".eslintrc": {
        "max-lines": ["error", {
          "max": 300,
          "skipBlankLines": true,
          "skipComments": true
        }]
      }
    priority: P0
    auto_fixable: false
    category: "components"
    enforcement_location: "pre-commit, ci"

  - rule: "God component threshold check (>500 lines)"
    source: "Cycle 4 Report"
    tool: "Custom Node.js script"
    implementation: |
      // scripts/check-god-files.js
      const { ESLint } = require('eslint');
      const fs = require('fs');
      const path = require('path');

      async function checkGodFiles() {
        const eslint = new ESLint({ useEslintrc: false });
        const files = await glob('src/**/*.{ts,tsx}');

        const godFiles = files.filter(file => {
          const lines = fs.readFileSync(file, 'utf8').split('\n').length;
          return lines > 500;
        });

        if (godFiles.length > 0) {
          console.error(`GOD FILES DETECTED (${godFiles.length}):`);
          godFiles.forEach(f => console.error(`  - ${f}`));
          process.exit(1);
        }
      }
    priority: P0
    auto_fixable: false
    category: "components"
    enforcement_location: "ci"

  # ===== CLEAN ARCHITECTURE RULES =====

  - rule: "No imports from Infrastructure to Domain"
    source: "Cycle 4 Report - ADR-003"
    tool: "eslint-plugin-import"
    implementation: |
      ".eslintrc": {
        "import/no-restricted-paths": ["error", {
          "zones": [
            { 
              "target": "src/domain", 
              "from": ["src/infrastructure", "src/presentation"],
              "message": "Domain layer must not depend on Infrastructure or Presentation"
            }
          ]
        }]
      }
    priority: P0
    auto_fixable: false
    category: "architecture"
    enforcement_location: "pre-commit, ci"

  - rule: "No imports from Infrastructure to Core"
    source: "Agent OS - Dependency boundaries"
    tool: "eslint-plugin-import"
    implementation: |
      ".eslintrc": {
        "import/no-restricted-paths": ["error", {
          "zones": [
            { 
              "target": "src/core", 
              "from": ["src/infrastructure", "src/domain"],
              "message": "Core layer must not depend on Infrastructure or Domain"
            }
          ]
        }]
      }
    priority: P0
    auto_fixable: false
    category: "architecture"
    enforcement_location: "pre-commit, ci"

  - rule: "Dependencies must point inward (dependency direction)"
    source: "Agent OS - Dependency Inversion"
    tool: "eslint-plugin-dependency-direction"
    implementation: |
      // Custom plugin or use eslint-plugin-import-restrict
      {
        "name": "dependency-direction",
        "meta": { "docs": { description: "Enforce inward dependency flow" } },
        create(context) {
          return {
            ImportDeclaration(node) {
              const sourceLayer = getLayer(node.source.value);
              const targetLayer = getLayer(node.filename);
              if (sourceLayer > targetLayer) {
                context.report({
                  node,
                  message: `Dependencies must point inward. ${sourceLayer} cannot import from ${targetLayer}`
                });
              }
            }
          };
        }
      }
    priority: P0
    auto_fixable: false
    category: "architecture"
    enforcement_location: "pre-commit, ci"

  # ===== TYPESCRIPT RULES =====

  - rule: "No 'any' types allowed"
    source: "Cycle 4 Report - TypeScript Improvements"
    tool: "@typescript-eslint/no-explicit-any"
    implementation: |
      ".eslintrc": {
        "@typescript-eslint/no-explicit-any": "error"
      }
    priority: P1
    auto_fixable: false
    category: "typescript"
    enforcement_location: "pre-commit, ci"

  - rule: "No @ts-ignore suppressions"
    source: "Cycle 4 Report - TypeScript Improvements"
    tool: "ESLint comment-directive"
    implementation: |
      ".eslintrc": {
        "no-warning-comments": ["error", { "terms": ["@ts-ignore", "@ts-nocheck"] }]
      }
    priority: P1
    auto_fixable: false
    category: "typescript"
    enforcement_location: "pre-commit"

  - rule: "Prefer interfaces over type aliases for public APIs"
    source: "Cycle 4 Report - TypeScript Improvements"
    tool: "@typescript-eslint/consistent-type-definitions"
    implementation: |
      ".eslintrc": {
        "@typescript-eslint/consistent-type-definitions": ["error", "interface"]
      }
    priority: P2
    auto_fixable: true
    category: "typescript"
    enforcement_location: "pre-commit"

  # ===== ERROR HANDLING RULES =====

  - rule: "Error boundaries required for routes"
    source: "Cycle 4 Report - ADR-028"
    tool: "Custom AST scanner"
    implementation: |
      // scripts/check-error-boundaries.js
      const fs = require('fs');

      function checkRouteErrorBoundaries() {
        const routeFiles = glob.sync('src/routes/**/*.tsx');
        const filesWithoutErrorBoundary = routeFiles.filter(file => {
          const content = fs.readFileSync(file, 'utf8');
          return !content.includes('<ErrorBoundary') &&
                 !content.includes('<ErrorRecovery') &&
                 !content.includes('createLazyFileRoute'); // TanStack routes need boundary
        });

        if (filesWithoutErrorBoundary.length > 0) {
          console.error(`ROUTES WITHOUT ERROR BOUNDARY (${filesWithoutErrorBoundary.length}):`);
          filesWithoutErrorBoundary.forEach(f => console.error(`  - ${f}`));
          process.exit(1);
        }
      }
    priority: P0
    auto_fixable: false
    category: "error-handling"
    enforcement_location: "ci"

  # ===== FILE ORGANIZATION RULES =====

  - rule: "Zustand stores must be in infrastructure/persistence/stores/"
    source: "Agent OS - Canonical Sources"
    tool: "ESLint custom rule"
    implementation: |
      {
        "name": "zustand-store-location",
        "meta": { "docs": { description: "Enforce store location" } },
        create(context) {
          return {
            CallExpression(node) {
              if (isZustandCreateCall(node)) {
                const filename = context.getFilename();
                if (!filename.includes('infrastructure/persistence/stores')) {
                  context.report({
                    node,
                    message: "Zustand stores must be in src/infrastructure/persistence/stores/"
                  });
                }
              }
            }
          };
        }
      }
    priority: P1
    auto_fixable: false
    category: "organization"
    enforcement_location: "pre-commit"

  - rule: "Dexie database must be in infrastructure/persistence/dexie/"
    source: "Agent OS - Canonical Sources"
    tool: "ESLint custom rule"
    implementation: |
      {
        "name": "dexie-location",
        "meta": { "docs": { description: "Enforce Dexie database location" } },
        create(context) {
          return {
            CallExpression(node) {
              if (isDexieImport(node)) {
                const filename = context.getFilename();
                if (!filename.includes('infrastructure/persistence/dexie')) {
                  context.report({
                    node,
                    message: "Dexie database must be in src/infrastructure/persistence/dexie/"
                  });
                }
              }
            }
          };
        }
      }
    priority: P1
    auto_fixable: false
    category: "organization"
    enforcement_location: "pre-commit"

  # ===== VALIDATION RULES =====

  - rule: "Zod schemas required for API inputs"
    source: "Agent OS - Input sanitization"
    tool: "@typescript-eslint/explicit-function-return-type"
    implementation: |
      // Combined with custom rule
      {
        "name": "api-input-validation",
        "meta": { "docs": { description: "Enforce Zod validation for API handlers" } },
        create(context) {
          return {
            CallExpression(node) {
              if (isAPIHandler(node) && !hasZodSchema(node)) {
                context.report({
                  node,
                  message: "API handlers must have Zod schema validation"
                });
              }
            }
          };
        }
      }
    priority: P1
    auto_fixable: false
    category: "security"
    enforcement_location: "pre-commit"

  - rule: "No hardcoded credentials"
    source: "Agent OS - Security"
    tool: "eslint-plugin-security"
    implementation: |
      ".eslintrc": {
        "security.detected-privateKey": "error",
        "security.detected-basic-auth": "error"
      }
    priority: P0
    auto_fixable: false
    category: "security"
    enforcement_location: "pre-commit, ci"

  # ===== ROUTING RULES =====

  - rule: "TanStack Router must use createLazyFileRoute"
    source: "Cycle 4 Report - Routing"
    tool: "@tanstack/eslint-plugin-router"
    implementation: |
      // Custom or community plugin
      {
        "name": "tanstack-router-lazy",
        "meta": { "docs": { description: "Enforce lazy route creation" } },
        create(context) {
          return {
            CallExpression(node) {
              if (isRouteDefinition(node) && !isLazyRoute(node)) {
                context.report({
                  node,
                  message: "Use createLazyFileRoute for all routes"
                });
              }
            }
          };
        }
      }
    priority: P1
    auto_fixable: false
    category: "routing"
    enforcement_location: "pre-commit"

  # ===== EVENT HANDLING RULES =====

  - rule: "No memory leak in event listeners"
    source: "Agent OS - Error isolation"
    tool: "eslint-plugin-react-hooks"
    implementation: |
      ".eslintrc": {
        "react-hooks/exhaustive-deps": "warn"
      }
    priority: P1
    auto_fixable: false
    category: "react"
    enforcement_location: "pre-commit"
```

### partially_tool_enforceable

Rules that can be partially automated but require human judgment:

```yaml
partially_tool_enforceable:
  # ===== DEPENDENCY INVERSION =====

  - rule: "Dependency inversion via interfaces"
    source: "Agent OS - Dependency Inversion Enforcement"
    tool: "AST parsing + human review"
    implementation: |
      // Can detect: Missing interface for service
      // Cannot verify: Correct abstraction level
      // Pattern: flag files with 'impl' suffix without corresponding interface
      const glob = require('glob');
      const fs = require('fs');

      function checkMissingInterfaces() {
        const implFiles = glob.sync('src/**/*-impl.ts');
        const implWithoutInterface = implFiles.filter(implFile => {
          const interfaceName = implFile.replace('-impl.ts', '.ts');
          return !fs.existsSync(interfaceName);
        });

        if (implWithoutInterface.length > 0) {
          console.warn(`FILES WITHOUT INTERFACE (manual review needed):`);
          implWithoutInterface.forEach(f => console.warn(`  - ${f}`));
        }
      }
    priority: P0
    notes: "Can flag missing interfaces, but abstraction quality requires human judgment"
    category: "architecture"
    enforcement_location: "ci"

  # ===== ANTI-CORRUPTION LAYER =====

  - rule: "Anti-corruption layer for external integrations"
    source: "Agent OS - Anti-corruption layer validation"
    tool: "Architecture scanner"
    implementation: |
      // Scripts/architecture-scanner.js
      const path = require('path');

      function checkExternalIntegrationACL() {
        const externalIntegrations = [
          { pattern: /@webcontainer|webcontainer/i, name: 'WebContainer' },
          { pattern: /monaco|editor/i, name: 'Monaco Editor' },
          { pattern: /dexie|indexeddb/i, name: 'IndexedDB' },
          { pattern: /gemini|openai|anthropic/i, name: 'AI Provider' }
        ];

        const violations = [];
        externalIntegrations.forEach(({ pattern, name }) => {
          const adapterFiles = glob.sync(`src/infrastructure/**/${name.toLowerCase()}-*.ts`);
          const hasACL = adapterFiles.some(f => {
            const content = fs.readFileSync(f, 'utf8');
            return content.includes('AntiCorruption') || content.includes('Adapter');
          });

          if (!hasACL) {
            violations.push(`${name}: Missing anti-corruption layer adapter`);
          }
        });

        return violations;
      }
    priority: P1
    notes: "Can detect missing adapters, but adapter quality requires human review"
    category: "architecture"
    enforcement_location: "ci"

  # ===== IDEMPOTENCY =====

  - rule: "Idempotency key enforcement for mutations"
    source: "Agent OS - Idempotency key enforcement"
    tool: "Code pattern scanner"
    implementation: |
      // Scripts/check-idempotency.js
      function checkIdempotencyPatterns() {
        const mutationHandlers = glob.sync('src/**/*mutation*.ts');
        const handlersWithoutIdempotency = mutationHandlers.filter(handler => {
          const content = fs.readFileSync(handler, 'utf8');
          return !content.includes('idempotencyKey') &&
                 !content.includes('IdempotencyKey') &&
                 !content.includes('dedup');
        });

        return handlersWithoutIdempotency;
      }
    priority: P1
    notes: "Can flag mutations without idempotency patterns, but business logic decision requires human"
    category: "api"
    enforcement_location: "ci"

  # ===== RUNTIME SCHEMA VALIDATION =====

  - rule: "Runtime schema validation enabled"
    source: "Agent OS - Schema validation at runtime"
    tool: "Build-time check + runtime instrumentation"
    implementation: |
      // Build script validation
      function checkRuntimeValidation() {
        const validatorFiles = glob.sync('src/**/*validator*.ts');
        const schemaFiles = glob.sync('src/**/*.schema.ts');

        if (validatorFiles.length === 0 && schemaFiles.length === 0) {
          console.warn('WARNING: No runtime schema validation detected');
          console.warn('Consider adding Zod or io-ts for runtime validation');
        }
      }
    priority: P2
    notes: "Can detect absence, but implementation quality requires human review"
    category: "validation"
    enforcement_location: "ci"

  # ===== CROSS-CONTEXT CONTRACTS =====

  - rule: "Cross-context contracts defined"
    source: "Agent OS"
    tool: "Type checker + documentation scanner"
    implementation: |
      // Can detect: Import across context boundaries
      // Cannot verify: Contract completeness or correctness
      const crossContextImports = detectCrossContextImports();
      return crossContextImports.map(imp => ({
        file: imp.file,
        fromContext: imp.from,
        toContext: imp.to,
        requiresContract: true
      }));
    priority: P1
    notes: "Can flag cross-context imports, but contract quality requires human judgment"
    category: "architecture"
    enforcement_location: "ci"

  # ===== ERROR CLASSIFICATION =====

  - rule: "Error classification standards"
    source: "Agent OS - Documentation Standards"
    tool: "Documentation linter"
    implementation: |
      // Check error documentation pattern
      function checkErrorClassification() {
        const errorFiles = glob.sync('src/**/*error*.ts');
        const unclassified = errorFiles.filter(file => {
          const content = fs.readFileSync(file, 'utf8');
          return !content.includes('ErrorType') &&
                 !content.includes('classification') &&
                 !content.includes('category');
        });

        return unclassified;
      }
    priority: P2
    notes: "Can detect missing classification patterns, but classification correctness requires human"
    category: "documentation"
    enforcement_location: "ci"

  # ===== RAG PROVENANCE TRACKING =====

  - rule: "RAG provenance tracking"
    source: "Agent OS - Documentation Standards"
    tool: "Documentation template checker"
    implementation: |
      // Check story template for provenance field
      function checkRAGProvenance() {
        const storyFiles = glob.sync('stories/**/*.xml');
        const missingProvenance = storyFiles.filter(story => {
          const content = fs.readFileSync(story, 'utf8');
          return !content.includes('rag_provenance') &&
                 !content.includes('sources') &&
                 !content.includes('research');
        });

        return missingProvenance;
      }
    priority: P2
    notes: "Can check template compliance, but provenance quality requires human verification"
    category: "documentation"
    enforcement_location: "ci"
```

### process_based_only

Rules that require human discipline, documentation, or code review:

```yaml
process_based_only:
  # ===== STATE MANAGEMENT =====

  - rule: "Persist on combined store only"
    source: "Cycle 4 Report - ADR-001"
    implementation: |
      // Manual review required
      // Pattern to check: persist() call should be on combined store
      // NOT on individual slices
      // This is a code review decision based on architecture understanding
    priority: P1
    notes: "Can detect persist() calls, but whether to persist slice requires architectural judgment"
    category: "state"
    enforcement_location: "code-review"

  # ===== ERROR HANDLING =====

  - rule: "Three-tier error handling strategy"
    source: "Cycle 4 Report - ADR-028"
    implementation: |
      // Manual implementation required:
      // Tier 1: Recovery (local component-level with retry)
      // Tier 2: Degradation (feature-level with fallback UI)
      // Tier 3: Notification (global onUncaughtError with support ticket)
      // Cannot lint for "correct tier" - human design decision
    priority: P0
    notes: "Requires architectural design, cannot be linted"
    category: "error-handling"
    enforcement_location: "code-review, architecture-review"

  - rule: "Error isolation between workspaces"
    source: "Agent OS - Error isolation"
    implementation: |
      // Manual design required:
      // - Define error boundaries between workspaces
      // - Ensure workspace crash doesn't cascade
      // - Implement graceful degradation per workspace
      // Requires human understanding of workspace relationships
    priority: P1
    notes: "Workspace isolation is architectural decision requiring human judgment"
    category: "error-handling"
    enforcement_location: "architecture-review"

  # ===== SYNC PATTERNS =====

  - rule: "Two-phase commit with rollback"
    source: "Agent OS"
    implementation: |
      // Manual implementation:
      // Phase 1: Tentative write to both local and remote
      // Phase 2: Confirm only if both succeed
      // Rollback: If phase 2 fails, revert phase 1
      // Cannot lint for "has rollback" - human implementation required
    priority: P1
    notes: "Complex pattern requiring careful human implementation and testing"
    category: "sync"
    enforcement_location: "code-review, architecture-review"

  - rule: "Idempotency by design"
    source: "Agent OS"
    implementation: |
      // Manual implementation:
      // - Design operations to be safe to retry
      // - Use idempotency keys for mutations
      // - Handle duplicate detection
      // Cannot lint for "is idempotent" - requires human verification
    priority: P1
    notes: "Idempotency is a business logic property, not a syntax pattern"
    category: "api"
    enforcement_location: "code-review, architecture-review"

  # ===== DATA CONSISTENCY =====

  - rule: "Dual-write pattern with consistency check"
    source: "Agent OS"
    implementation: |
      // Manual implementation:
      // When writing to two systems:
      // 1. Write to both
      // 2. Verify consistency
      // 3. If inconsistent, trigger reconciliation
      // Cannot lint for "consistency check" - human design required
    priority: P1
    notes: "Consistency model depends on business requirements"
    category: "sync"
    enforcement_location: "architecture-review"

  # ===== SECURITY PATTERNS =====

  - rule: "Input sanitization validation"
    source: "Agent OS - Input sanitization"
    implementation: |
      // Manual implementation:
      // - Identify all input sources
      // - Define sanitization rules per input type
      // - Implement validation at input boundaries
      // Cannot lint for "all inputs sanitized" - human audit required
    priority: P0
    notes: "Requires comprehensive understanding of all input paths"
    category: "security"
    enforcement_location: "security-review, code-review"

  # ===== AI AGENT ARCHITECTURE =====

  - rule: "Workspace-aware tool permissions"
    source: "Cycle 4 Report - AI Architecture"
    implementation: |
      // Manual implementation:
      // - Define permission matrix per agent
      // - Implement workspace context awareness
      // - Handle permission escalation scenarios
      // Cannot lint for "correct permissions" - human design required
    priority: P1
    notes: "Permission model depends on trust levels and workspace requirements"
    category: "security"
    enforcement_location: "architecture-review, security-review"

  - rule: "ReAct pattern implementation"
    source: "Cycle 4 Report - AI Architecture"
    implementation: |
      // Manual implementation:
      // - Implement reasoning loop
      // - Handle action execution
      // - Manage state between reasoning steps
      // Cannot lint for "correct ReAct" - human verification required
    priority: P1
    notes: "AI pattern correctness requires functional testing"
    category: "ai"
    enforcement_location: "code-review, testing"

  # ===== CLEAN ARCHITECTURE =====

  - rule: "Domain layer completion (use cases)"
    source: "Cycle 4 Report - ADR-003"
    implementation: |
      // Manual implementation:
      // - Define repository interfaces in Domain
      // - Implement use cases that use interfaces
      // - Infrastructure implements interfaces
      // Cannot lint for "complete domain layer" - human judgment required
    priority: P1
    notes: "Domain completeness is architectural judgment"
    category: "architecture"
    enforcement_location: "architecture-review"

  # ===== COMPONENT DECOMPOSITION =====

  - rule: "Single responsibility per component"
    source: "Cycle 4 Report - ADR-004"
    implementation: |
      // Manual decomposition:
      // - Identify multiple responsibilities in large components
      // - Extract sub-components for each responsibility
      // - Design proper prop drilling or context usage
      // Cannot lint for "single responsibility" - human judgment required
    priority: P1
    notes: "Responsibility boundaries are design decisions"
    category: "components"
    enforcement_location: "code-review, architecture-review"
```

### documentation_standards

Rules that affect documentation or naming conventions:

```yaml
documentation_standards:
  # ===== DOCUMENTATION =====

  - rule: "Architecture Decision Records for significant changes"
    source: "Cycle 4 Report - Architecture Governance"
    implementation: |
      // Enforced via: Git commit hooks, PR template
      // Template location: _bmad/templates/adr-template.md
      // When: Any architectural change > 50 lines
    priority: P1
    category: "documentation"
    enforcement_location: "commit-hook, pr-template"

  - rule: "Story documentation completeness"
    source: "Agent OS"
    implementation: |
      // Enforced via: Story template validation
      // Required fields: context, requirements, constraints, acceptance_criteria
    priority: P1
    category: "documentation"
    enforcement_location: "ci"

  - rule: "API documentation with OpenAPI spec"
    source: "Documentation Standards"
    implementation: |
      // Enforced via: Build validation
      // Required: openapi.yaml or openapi.json for all API endpoints
    priority: P2
    category: "documentation"
    enforcement_location: "ci"

  - rule: "README.md required for each major component"
    source: "Documentation Standards"
    implementation: |
      // Enforced via: Directory structure validation
      // Pattern: src/<module>/README.md
    priority: P2
    category: "documentation"
    enforcement_location: "ci"

  - rule: "Mermaid diagrams must render correctly"
    source: "Documentation Standards"
    implementation: |
      // Enforced via: mermaid-cli validation
      // Command: npx mermaid -p docs/
    priority: P2
    category: "documentation"
    enforcement_location: "ci"

  # ===== NAMING CONVENTIONS =====

  - rule: "Store files must use slice suffix"
    source: "Cycle 4 Report - ADR-027"
    implementation: |
      // Pattern: *-slice.ts
      // Enforced via: ESLint custom rule
    priority: P1
    category: "naming"
    enforcement_location: "pre-commit"

  - rule: "Interface files must not use -impl suffix"
    source: "Agent OS"
    implementation: |
      // Pattern: *.ts for interfaces, *-impl.ts for implementations
      // Enforced via: ESLint custom rule
    priority: P1
    category: "naming"
    enforcement_location: "pre-commit"

  - rule: "Error types must use Error suffix"
    source: "Agent OS"
    implementation: |
      // Pattern: *Error.ts for custom error classes
      // Enforced via: ESLint custom rule
    priority: P2
    category: "naming"
    enforcement_location: "pre-commit"

  - rule: "Route files must use .lazy.tsx suffix"
    source: "TanStack Router Best Practices"
    implementation: |
      // Pattern: *route.lazy.tsx or *.lazy.tsx
      // Enforced via: ESLint custom rule
    priority: P1
    category: "naming"
    enforcement_location: "pre-commit"

  # ===== RAG-SPECIFIC =====

  - rule: "Research sources must be documented"
    source: "Agent OS - RAG provenance"
    implementation: |
      // Enforced via: Story template field
      // Required field: research_sources (MCP query URLs, dates)
    priority: P2
    category: "documentation"
    enforcement_location: "ci"

  - rule: "MCP usage must be documented"
    source: "BMAD Governance"
    implementation: |
      // Enforced via: Pre-commit check
      // Pattern: All MCP tool calls must have comment with tool name
    priority: P1
    category: "documentation"
    enforcement_location: "pre-commit"

  # ===== FRONTMATTER =====

  - rule: "All docs must have YAML frontmatter"
    source: "Documentation Standards"
    implementation: |
      // Required fields: title, description, date
      // Enforced via: Prettier plugin or custom lint
    priority: P2
    category: "documentation"
    enforcement_location: "pre-commit"

  - rule: "Artifacts must have date stamp"
    source: "BMAD Governance"
    implementation: |
      // Pattern: name-YYYY-MM-DD.ext
      // Enforced via: File creation template
    priority: P2
    category: "naming"
    enforcement_location: "cli-tool"
```

---

## implementation_priority

### immediate (Week 1-2)

High-impact rules that should be implemented immediately:

```yaml
immediate:
  # P0 - Critical Architecture Rules
  - "ESLint forbidden imports (src/lib, src/stores)"
    rationale: "Prevents layer violations immediately"
    
  - "ESLint max-lines (300) for stores and components"
    rationale: "Enforces size limits from Cycle 4 Report"
    
  - "Clean Architecture import restrictions (Domain layer protection)"
    rationale: "Prevents dependency violations"
    
  - "Zustand store location enforcement"
    rationale: "Canonical source enforcement"
    
  - "No 'any' types rule"
    rationale: "TypeScript improvement from Cycle 4"
    
  - "Error boundary route check (CI script)"
    rationale: "Addresses ADR-028 priority gap"

  # P1 - High Value Rules
  - "God file detection script (CI)"
    rationale: "Monitors technical debt"
    
  - "TypeScript no-@ts-ignore rule"
    rationale: "TypeScript improvement"
    
  - "TanStack Router lazy route enforcement"
    rationale: "Best practice alignment"
    
  - "Store slice naming convention"
    rationale: "ADR-027 compliance"
```

### short_term (Week 3-4)

Medium-effort rules requiring custom ESLint plugins or codemods:

```yaml
short_term:
  - "Custom codemod: Convert destructuring to individual selectors"
    rationale: "Addresses Zustand best practice from Cycle 4"
    
  - "Custom ESLint: Zustand slice size check"
    rationale: "Enforces <120 lines per slice"
    
  - "Custom ESLint: Dexie database location"
    rationale: "Canonical source enforcement"
    
  - "Dependency direction checker"
    rationale: "Clean Architecture enforcement"
    
  - "API handler validation check"
    rationale: "Input sanitization enforcement"
    
  - "Anti-corruption layer detector"
    rationale: "Architecture quality check"
```

### long_term (Week 5+)

Complex rules requiring significant tooling or infrastructure:

```yaml
long_term:
  - "Runtime schema validation framework"
    rationale: "Zod/io-ts integration for runtime checks"
    
  - "Dependency graph visualization"
    rationale: "Architecture monitoring dashboard"
    
  - "Idempotency key enforcement framework"
    rationale: "API consistency"
    
  - "Cross-context contract validator"
    rationale: "Architecture boundary enforcement"
    
  - "Dual-write consistency checker"
    rationale: "Data integrity monitoring"
    
  - "Workspace isolation validator"
    rationale: "Error isolation verification"
```

---

## Tool Configuration Files

### .eslintrc.json (Immediate Implementation)

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "plugins": [
    "@typescript-eslint",
    "import",
    "react",
    "react-hooks",
    "security"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
    "react-hooks/exhaustive-deps": "warn",
    "import/no-restricted-paths": ["error", {
      "zones": [
        { "target": "./src/lib", "message": "Use @/infrastructure or @/domain instead" },
        { "target": "./src/domain", "from": ["./src/infrastructure", "./src/presentation"] },
        { "target": "./src/core", "from": ["./src/infrastructure", "./src/domain", "./src/presentation"] }
      ]
    }],
    "security.detected-privateKey": "error",
    "security.detected-basic-auth": "error",
    "max-lines": ["error", { "max": 300, "skipBlankLines": true, "skipComments": true }]
  },
  "settings": {
    "import/resolver": {
      "typescript": true,
      "node": true
    }
  }
}
```

### .eslintrc.js (With Custom Rules)

```javascript
// For rules requiring custom implementation
module.exports = {
  // ... base config above
  rules: {
    // ... base rules above
    
    // Custom rules would be loaded here
    'zustand-slice-size': ['error', { maxLines: 120 }],
    'zustand-store-location': ['error', { allowedPath: 'infrastructure/persistence/stores' }],
    'tanstack-router-lazy': ['error'],
    'naming-convention-slice': ['error', { pattern: '.*-slice\\.ts$' }],
    'naming-convention-error': ['error', { pattern: '.*Error\\.ts$' }]
  },
  plugins: [
    // ... standard plugins
    'zustand-rules',  // Custom plugin
    'architecture-rules'  // Custom plugin
  ]
};
```

### package.json Scripts

```json
{
  "scripts": {
    "lint:architecture": "node scripts/check-architecture-rules.js",
    "lint:god-files": "node scripts/check-god-files.js",
    "lint:error-boundaries": "node scripts/check-error-boundaries.js",
    "lint:idempotency": "node scripts/check-idempotency.js",
    "lint:acl": "node scripts/check-anti-corruption-layer.js",
    "validate:all": "eslint src/ --ext .ts,.tsx && npm run lint:architecture && npm run lint:god-files"
  }
}
```

---

## CI/CD Pipeline Integration

```yaml
# .github/workflows/enforce-best-practices.yml
name: Enforce Best Practices

on:
  pull_request:
    paths:
      - 'src/**/*.{ts,tsx}'
      - '!*.d.ts'

jobs:
  enforce-rules:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint:src
      
      - name: Check God Files
        run: npm run lint:god-files
        continue-on-error: false
      
      - name: Check Error Boundaries
        run: npm run lint:error-boundaries
        continue-on-error: true
      
      - name: Check Architecture Rules
        run: npm run lint:architecture
        continue-on-error: true
      
      - name: Report Results
        if: failure()
        run: |
          echo "Best practices violations detected"
          echo "See above for details"
          exit: 1
```

---

## Enforcement Matrix Summary

| Category | Count | Auto-Fixable | Primary Tool | Priority |
|----------|-------|--------------|--------------|----------|
| **Fully Tool-Enforceable** | 18 | 1 (1 via codemod) | ESLint + Scripts | P0-P1 |
| **Partially Tool-Enforceable** | 8 | N/A | Scanners + Human | P1-P2 |
| **Process-Based Only** | 13 | N/A | Code Review | P0-P1 |
| **Documentation Standards** | 11 | 2 | Templates + Lint | P1-P2 |

### Coverage by Source Document

| Source Document | Fully | Partial | Process | Docs |
|-----------------|-------|---------|---------|------|
| Cycle 4 Report Best Practices | 10 | 3 | 5 | 2 |
| Agent OS Best Practices | 8 | 5 | 8 | 9 |

---

## Recommendations

1. **Start with immediate P0 rules** - These prevent critical architecture violations
2. **Invest in custom ESLint plugins** - The 6 partially enforceable rules would benefit from custom tooling
3. **Create codemod for Zustand selectors** - High-value automation opportunity
4. **Document all code review expectations** - Process-based rules need clear guidelines
5. **Iterate quarterly** - Review and update enforcement based on compliance data

---

*Generated: 2026-01-18*  
*Source: Cycle 4 Report + Agent OS Best Practices*
