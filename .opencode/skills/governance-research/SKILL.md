---
name: governance-research
description: Use when validating technical claims, researching tech stack decisions, or verifying 2026 best practices. Requires evidence from 3+ MCP sources with 5 successful iterations before concluding.
allowed-tools:
  - mcp__tavily__tavily-search
  - mcp__exa__web_search_exa
  - mcp__exa__get_code_context_exa
  - mcp__context7__resolve-library-id
  - mcp__context7__query-docs
  - read
  - write
---

# Governance Research Skill

<purpose>
Validate technical claims and architecture decisions using external research.
Enforces multi-source verification with strict iteration requirements.
All claims must be backed by current 2026 best practices.
</purpose>

## When to Use

- Validating tech stack choices in PRD/Architecture
- Verifying claimed best practices
- Researching implementation patterns
- Checking for deprecated dependencies
- Confirming security recommendations

## Research Protocol

### Rule: 3+ Sources, 5+ Iterations

Every technical claim must be verified through:
- **Minimum 3 different MCP sources** (Tavily, Exa, Context7)
- **Minimum 5 successful query iterations** before concluding
- **Cross-reference** results for consistency

### Source Hierarchy

```yaml
source_priority:
  tier_1_authoritative:
    - Official documentation (Context7)
    - GitHub repositories (Exa code search)
    - RFC/Specification documents
    
  tier_2_trusted:
    - Major tech blogs (Tavily search)
    - Conference talks/presentations
    - Reputable tutorials (verified authors)
    
  tier_3_supplementary:
    - Community discussions
    - Stack Overflow answers
    - Medium articles (with caution)
```

## Research Templates

### Template 1: Tech Stack Validation

```yaml
research_task: "Validate tech stack choice"
subject: "{technology}"
version: "{version}"

queries:
  - source: "context7"
    query: "How to use {technology} in production 2026"
    libraryId: "{resolved-library-id}"
    
  - source: "exa"
    query: "{technology} best practices production 2026"
    type: "deep"
    
  - source: "tavily"
    query: "{technology} vs alternatives 2026 comparison"
    search_depth: "advanced"
    
  - source: "exa-code"
    query: "{technology} enterprise implementation patterns"
    
  - source: "tavily"
    query: "{technology} known issues vulnerabilities 2026"

validation_criteria:
  - is_actively_maintained: true
  - has_security_advisories: false  # or documented mitigations
  - community_adoption: "growing" | "stable"
  - enterprise_usage: "verified"
```

### Template 2: Architecture Pattern Validation

```yaml
research_task: "Validate architecture decision"
pattern: "{pattern_name}"
context: "{project_context}"

queries:
  - source: "exa-code"
    query: "{pattern_name} implementation {tech_stack}"
    
  - source: "context7"
    query: "When to use {pattern_name}"
    libraryId: "{framework-library}"
    
  - source: "tavily"
    query: "{pattern_name} pros cons scalability"
    search_depth: "advanced"
    
  - source: "exa"
    query: "{pattern_name} real-world case study"
    type: "deep"
    
  - source: "tavily"
    query: "{pattern_name} anti-patterns pitfalls"

validation_criteria:
  - fits_scale: "{expected_scale}"
  - team_expertise_match: true
  - maintenance_complexity: "acceptable"
  - proven_at_similar_scale: true
```

### Template 3: Dependency Audit

```yaml
research_task: "Audit dependency"
package: "{package_name}"
current_version: "{version}"

queries:
  - source: "tavily"
    query: "{package_name} security vulnerabilities 2025-2026"
    time_range: "year"
    
  - source: "exa"
    query: "{package_name} alternatives comparison 2026"
    
  - source: "context7"
    query: "{package_name} migration guide upgrade"
    libraryId: "{package-library-id}"
    
  - source: "tavily"
    query: "{package_name} breaking changes deprecation"
    
  - source: "exa-code"
    query: "{package_name} production configuration"

validation_criteria:
  - no_critical_cves: true
  - active_maintenance: true
  - upgrade_path_exists: true
  - not_deprecated: true
```

## Execution Process

### Step 1: Claim Extraction

```typescript
const extractClaims = (document: string): TechnicalClaim[] => {
    // Pattern matching for claims
    const patterns = [
        /we\s+(?:will\s+)?use\s+([A-Za-z0-9.-]+)/gi,  // "we use X"
        /chosen?\s+([A-Za-z0-9.-]+)\s+(?:for|because)/gi,  // "chosen X for"
        /([A-Za-z0-9.-]+)\s+is\s+(?:the\s+)?(?:best|recommended|preferred)/gi,
        /(?:using|implements?)\s+([A-Za-z0-9.-]+)\s+pattern/gi,
    ];
    
    // Extract and deduplicate
    return [...new Set(matches)].map(m => ({ claim: m, verified: false }));
};
```

### Step 2: Multi-Source Query

```typescript
const researchClaim = async (claim: TechnicalClaim): Promise<ResearchResult> => {
    const results: SourceResult[] = [];
    let iterations = 0;
    
    // Source 1: Context7 (official docs)
    const libraryId = await mcp_context7_resolve_library_id({ 
        libraryName: claim.technology,
        query: claim.context 
    });
    if (libraryId) {
        const docs = await mcp_context7_query_docs({
            libraryId,
            query: `best practices production ${claim.aspect}`
        });
        results.push({ source: "context7", data: docs, iteration: ++iterations });
    }
    
    // Source 2: Exa (deep web search)
    const exaResult = await mcp_exa_web_search_exa({
        query: `${claim.technology} ${claim.aspect} 2026 best practices`,
        type: "deep",
        numResults: 5
    });
    results.push({ source: "exa", data: exaResult, iteration: ++iterations });
    
    // Source 3: Tavily (general search)
    const tavilyResult = await mcp_tavily_tavily_search({
        query: `${claim.technology} production recommendations 2026`,
        search_depth: "advanced",
        max_results: 10
    });
    results.push({ source: "tavily", data: tavilyResult, iteration: ++iterations });
    
    // Additional iterations as needed
    while (iterations < 5 && needsMoreEvidence(results)) {
        const followUp = await conductFollowUpQuery(claim, results);
        results.push(followUp);
        iterations++;
    }
    
    return { claim, sources: results, iterations, consensus: calculateConsensus(results) };
};
```

### Step 3: Consensus Calculation

```yaml
consensus_rules:
  verified:
    condition: "3+ sources agree, no contradictions"
    confidence: 95-100
    
  likely_valid:
    condition: "2+ sources agree, 1 neutral"
    confidence: 80-94
    action: "document with caveat"
    
  uncertain:
    condition: "mixed signals, contradictions found"
    confidence: 50-79
    action: "flag for human review"
    
  refuted:
    condition: "majority sources contradict claim"
    confidence: <50
    action: "reject claim, document alternatives"
```

### Step 4: Evidence Documentation

```markdown
## Research Report: {claim}

**Researched**: {timestamp}
**Sources Used**: {source_count}
**Iterations**: {iteration_count}
**Consensus**: {consensus_level}

### Claim
> {original_claim}

### Evidence Summary

| Source | Finding | Confidence | URL |
|--------|---------|------------|-----|
| Context7 | {finding} | {score} | {url} |
| Exa | {finding} | {score} | {url} |
| Tavily | {finding} | {score} | {url} |

### Consensus Analysis
{detailed_analysis}

### Recommendation
- **Status**: VERIFIED | NEEDS_REVISION | REJECTED
- **Confidence**: {percentage}%
- **Action**: {recommended_action}

### Alternative Considered
{if_rejected_list_alternatives}
```

## Output Artifact

Creates: `_bmad-output/research-reports/{topic}-research-{date}.md`

## Event Subscriptions

```yaml
research_events:
  - research.started      # Research task initiated
  - research.query.sent   # MCP query dispatched
  - research.query.result # Query result received
  - research.iteration    # Iteration completed
  - research.consensus    # Consensus calculated
  - research.completed    # All claims processed
```

## Integration with Verification

This skill is invoked by `governance-verifier` when:
- Technical claims need validation
- Tech stack decisions require evidence
- Architecture patterns need verification

```typescript
// In governance-verifier
if (claim.type === "technical" || claim.type === "architecture") {
    const research = await invokeSkill("governance-research", {
        claims: [claim],
        depth: "thorough"
    });
    claim.evidence = research.results;
    claim.verified = research.consensus >= 95;
}
```
