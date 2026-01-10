# Research Trigger - Auto-Research Workflow

**Purpose:** Automatically trigger internet research when technical decisions require external validation

**Workflow Type:** Enforcement Check 3 of 3

**Integration:** Receives analysis from `expert-analysis.md`, determines if research is needed

---

## Overview

This workflow implements the third enforcement check: **Research Required**. It automatically triggers internet research when the user's request involves:

1. Technology Selection
2. Performance Trade-offs
3. Anti-Pattern Detection
4. Framework Comparison
5. Breaking Changes
6. Security Implications

**Key Principle:** Research happens BEFORE implementation, not during debugging.

---

## Auto-Trigger Conditions

### 1. Technology Selection

**Trigger Pattern:** Choosing between alternatives

**Examples:**
- "Should I use React Query or SWR?"
- "TanStack Router vs React Router?"
- "Drizzle vs Prisma for this project?"

**Detection:**
```typescript
function detectTechnologySelection(request: string): boolean {
  const orPatterns = /\b(?:or|vs|versus)\b/i;
  const alternatives = request.split(orPatterns);

  if (alternatives.length >= 2) {
    const mentionedLibraries = alternatives.flatMap(extractLibraryNames);
    return mentionedLibraries.length >= 2;
  }

  return false;
}
```

### 2. Performance Trade-off

**Trigger Pattern:** Optimizing for competing metrics

**Examples:**
- "Optimize for bundle size vs runtime speed"
- "Memory vs CPU trade-off for this algorithm"
- "Client-side vs server-side rendering?"

**Detection:**
```typescript
function detectPerformanceTradeoff(request: string): boolean {
  const tradeoffKeywords = [
    ['bundle', 'size', 'runtime', 'speed'],
    ['memory', 'cpu', 'performance'],
    ['client', 'server', 'rendering'],
    ['lazy', 'eager', 'loading']
  ];

  const lowerRequest = request.toLowerCase();
  return tradeoffKeywords.some(pair =>
    pair.every(keyword => lowerRequest.includes(keyword))
  );
}
```

### 3. Anti-Pattern Detection

**Trigger Pattern:** Warning signs about problematic approaches

**Examples:**
- "This approach might cause memory leaks"
- "Won't this create circular dependencies?"
- "Is this a God component?"

**Detection:**
```typescript
function detectAntiPatternRisk(request: string): boolean {
  const warningPatterns = [
    /\bgod (component|object|class|store)\b/i,
    /\bcircular (depend|reference|import)\b/i,
    /\bmemory (leak|bloat)\b/i,
    /\b(monolithic|tight.?coupl)\b/i
  ];

  return warningPatterns.some(pattern => pattern.test(request));
}
```

### 4. Framework Comparison

**Trigger Pattern:** Integrating new library/framework

**Examples:**
- "Add Zod for validation"
- "Integrate Sonner for toasts"
- "Use Framer Motion for animations"

**Detection:**
```typescript
function detectFrameworkIntegration(request: string): boolean {
  const integrationPatterns = [
    /add|install|integrate|use.*\b(zod|sonner|framer|tanstack|zustand|dexie)\b/i
  ];

  return integrationPatterns.some(pattern => pattern.test(request));
}
```

### 5. Breaking Changes

**Trigger Pattern:** API changes affecting consumers

**Examples:**
- "Change function signature for X"
- "Remove deprecated Y method"
- "Refactor store to use new pattern"

**Detection:**
```typescript
function detectBreakingChange(request: string, codebase: CodebaseSnapshot): boolean {
  const breakingKeywords = ['remove', 'delete', 'replace', 'refactor', 'change signature'];

  if (breakingKeywords.some(k => request.toLowerCase().includes(k))) {
    const targetFile = extractPrimaryTarget(request);
    if (targetFile) {
      const consumers = codebase.findImports(targetFile);
      return consumers.length > 0;
    }
  }

  return false;
}
```

### 6. Security Implications

**Trigger Pattern:** Auth, data handling, XSS risks

**Examples:**
- "Add authentication"
- "Store user tokens"
- "Render HTML from user input"
- "Handle file uploads"

**Detection:**
```typescript
function detectSecurityImplications(request: string): boolean {
  const securityKeywords = [
    'auth', 'token', 'credential', 'password',
    'xss', 'csrf', 'injection', 'sanitiz',
    'upload', 'download', 'file', 'storage',
    'encrypt', 'decrypt', 'hash', 'session'
  ];

  const lowerRequest = request.toLowerCase();
  return securityKeywords.some(keyword => lowerRequest.includes(keyword));
}
```

---

## Research Execution

### Research Orchestration

When a trigger condition is met, execute research using available MCP tools:

```yaml
research_triggers:
  technology_selection:
    tools: ["context7", "tavily"]
    query_template: "Compare {alternatives} for {use_case}"
    confidence_target: 0.8

  performance_tradeoff:
    tools: ["tavily", "context7"]
    query_template: "{metrics} trade-off for {technology}"
    confidence_target: 0.7

  anti_pattern_detection:
    tools: ["tavily", "deepwiki"]
    query_template: "{pattern} anti-pattern best practices"
    confidence_target: 0.9

  framework_comparison:
    tools: ["context7", "deepwiki"]
    query_template: "{library} documentation examples"
    confidence_target: 0.85

  breaking_changes:
    tools: ["context7", "tavily"]
    query_template: "{library} migration guide breaking changes"
    confidence_target: 0.9

  security_implications:
    tools: ["context7", "tavily"]
    query_template: "{security_topic} best practices security"
    confidence_target: 0.95
```

### Research Workflow

1. **Identify Trigger Type**: Determine which condition(s) match
2. **Select Tools**: Choose appropriate MCP tools for query
3. **Execute Search**: Run parallel queries across tools
4. **Cross-Reference**: Validate findings across sources
5. **Assign Confidence**: Score each finding by source reliability
6. **Generate Report**: Compile findings with citations

---

## Research Output Format

### Research Report

```yaml
research_report:
  timestamp: "2026-01-10T10:40:00Z"
  trigger_type: "framework_integration"
  trigger_reason: "User requested integrating Zod for validation"

  query: "Zod validation TypeScript best practices"

  findings:
    - source: "context7"
      citation: "https://zod.dev/?id=installation"
      confidence: 0.95
      summary: "Zod is TypeScript-first schema validation with automatic type inference"
      key_insights:
        - "Use z.infer to derive TypeScript types from schemas"
        - "Zod schemas are reusable across client and server"
        - "Integrates well with tRPC for end-to-end type safety"

    - source: "tavily"
      citation: "https://github.com/colinhacks/zod/discussions/2100"
      confidence: 0.75
      summary: "Community discussion on Zod vs Yup patterns"
      key_insights:
        - "Zod preferred over Yup for TypeScript projects"
        - "Performance is comparable for typical use cases"
        - "Consider bundle size impact for small projects"

  recommended_approach:
    library: "Zod"
    confidence: 0.9
    reasoning: "TypeScript-first approach aligns with project standards"
    implementation_notes:
      - "Install via pnpm add zod"
      - "Create schemas in domain/types/schemas/"
      - "Use zodResolver with react-hook-form if needed"
      - "Bundle size impact: ~13KB gzipped"

  risk_warnings:
    - level: "low"
      issue: "Bundle size for small projects"
      mitigation: "Consider alternative if validation needs are minimal"

  action_items:
    - "Review Zod schema patterns in documentation"
    - "Create example schema for validation"
    - "Consider integration with existing form handling"
```

---

## Confidence Scoring

### Source Hierarchy

| Source Type | Confidence Range | Examples |
|-------------|------------------|----------|
| Official Documentation | 0.9-1.0 | Library docs, API references |
| High-Quality Repositories | 0.8-0.9 | Verified GitHub examples, official starters |
| Community Consensus | 0.6-0.8 | Stack Overflow accepted answers, multiple articles |
| Individual Sources | 0.4-0.6 | Single blog post, personal experience |

### Scoring Algorithm

```typescript
function calculateConfidence(source: Source, findings: Finding[]): number {
  let baseConfidence = source.type === 'official' ? 0.9 :
                       source.type === 'repository' ? 0.8 :
                       source.type === 'community' ? 0.7 : 0.5;

  // Boost for multiple confirmations
  const confirmations = findings.filter(f =>
    f.conclusion === finding.conclusion
  ).length;

  const confirmationBonus = Math.min(confirmations * 0.05, 0.1);

  // Penalty for outdated information
  const age = Date.now() - source.timestamp;
  const agePenalty = age > 366 * 24 * 60 * 60 * 1000 ? 0.1 : 0;

  return Math.min(baseConfidence + confirmationBonus - agePenalty, 1.0);
}
```

---

## Integration Points

### Input: From expert-analysis.md

```yaml
input:
  request_analysis: "{{from_expert_analysis}}"
  category: "{{from_expert_analysis}}"
  contextualized_prompt: "{{from_context_first}}"
```

### Output: To correct-course.yaml (Governance Report)

```yaml
output:
  research_required: "{{true|false}}"
  research_report: "{{if_required}}"
  confidence_score: "{{overall_confidence}}"
  recommended_approach: "{{based_on_research}}"
```

---

## Success Criteria

### PASS Conditions:
- [ ] Research completed for all triggered conditions
- [ ] Multiple sources cross-referenced (2+)
- [ ] Confidence scores assigned
- [ ] Recommended approach clear
- [ ] Risk warnings documented

### SKIP Conditions (No Research Needed):
- [ ] Quick Patch category
- [ ] No trigger conditions met
- [ ] Well-understood pattern in codebase

---

## Example Executions

### Example 1: Technology Selection

**Input:** "Should I use Zod or Yup for validation?"

**Research Triggered:** YES (technology_selection)

**Output:**
```yaml
recommended_approach:
  choice: "Zod"
  confidence: 0.9
  reasoning: "TypeScript-first, automatic type inference, better DX"
```

### Example 2: Quick Patch (No Research)

**Input:** "Fix typo in button component"

**Research Triggered:** NO (quick_patch)

**Output:**
```yaml
research_required: false
```

---

**Workflow Owner:** governance-core
**Integrates With:**
- `_bmad-ext/modules/governance-core/workflows/expert-analysis.md` (input)
- `_bmad-ext/modules/governance-core/workflows/correct-course.yaml` (output)
- MCP tools: context7, tavily, deepwiki

**Last Updated:** 2026-01-10
