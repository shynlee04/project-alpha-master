# Governance Workflow - Research

**Workflow Type**: Core Concept (3 of 3)  
**Purpose**: Internet-based validation for tech choices, scenarios, and trade-offs  
**Triggered By**: 
- Agent-expert decision (modify or investigate)
- User request for tech evaluation
- Architectural decision point
- Performance optimization request

---

## Purpose

The **Research** workflow ensures that technical decisions are **validated against real-world evidence** rather than assumptions. It:

1. **Identifies Topics**: Extract tech choices and trade-offs to evaluate
2. **Conducts Search**: Internet-based research for similar scenarios
3. **Evaluates Options**: Weigh tech choices against alternatives
4. **Provides Advice**: Recommend best practices and warn about anti-patterns

This prevents:
- Choosing suboptimal technologies
- Missing known issues with chosen approach
- Ignoring performance trade-offs
- Creating solutions that will cause future problems

---

## Workflow Steps

### Step 1: Identify Research Topics

**Purpose**: Extract what needs to be researched from user's request

```yaml
research_step_1:
  name: "identify_topics"
  description: "Extract tech choices and evaluation criteria"
  
  inputs:
    - user_request: "{what user wants to research}"
    - context: {from context-first}
    - agent_expert_analysis: {from agent-expert}
  
  tasks:
    1. "Extract tech choices"
       - Programming languages
       - Frameworks and libraries
       - Databases and storage
       - APIs and protocols
       - Tools and utilities
    
    2. "Identify evaluation criteria"
       - Performance requirements
       - Scalability needs
       - Security requirements
       - Maintainability goals
       - Cost constraints
    
    3. "Identify scenarios"
       - Current use case
       - Future use cases
       - Edge cases
       - Failure modes
    
    4. "Identify alternatives"
       - What other options exist?
       - What are the trade-offs?
       - What are the risks?
  
  outputs:
    - tech_choices: [list]
    - evaluation_criteria: [list]
    - scenarios: [list]
    - alternatives: [list]
    - research_topics: [list of search queries]
```

### Step 2: Conduct Internet Search

**Purpose**: Search for real-world evidence and best practices

```yaml
research_step_2:
  name: "conduct_search"
  description: "Search for relevant information"
  
  inputs:
    - research_topics: {from step 1}
    - evaluation_criteria: {from step 1}
  
  tasks:
    1. "Search for similar scenarios"
       - "How others solved similar problems"
       - "Best practices for {tech_choice}"
       - "Common pitfalls with {tech_choice}"
    
    2. "Search for performance data"
       - "Benchmarks: {tech_choice} vs alternatives"
       - "Performance considerations for {tech_choice}"
       - "Scalability limits of {tech_choice}"
    
    3. "Search for issues and problems"
       - "Known issues with {tech_choice}"
       - "Anti-patterns with {tech_choice}"
       - "When NOT to use {tech_choice}"
    
    4. "Search for alternatives"
       - "Alternatives to {tech_choice}"
       - "Comparison: {tech_choice} vs {alternative}"
       - "When to choose {alternative} over {tech_choice}"
  
  outputs:
    - search_results: {topic: [list of results]}
    - performance_data: {topic: {findings}}
    - issues_found: [list]
    - best_practices: [list]
    - alternatives_analysis: {alternative: {pros, cons}}
```

### Step 3: Evaluate Evidence

**Purpose**: Weight tech choices against criteria

```yaml
research_step_3:
  name: "evaluate_evidence"
  description: "Analyze research findings against criteria"
  
  inputs:
    - tech_choices: {from step 1}
    - evaluation_criteria: {from step 1}
    - search_results: {from step 2}
  
  tasks:
    1. "Score each tech choice"
       - Rate against each criterion (1-10)
       - Calculate weighted score
    
    2. "Identify trade-offs"
       - What are the pros and cons?
       - What is gained and lost?
       - What are the risks?
    
    3. "Identify best practices"
       - What do successful implementations do?
       - What patterns are recommended?
       - What should be avoided?
    
    4. "Identify anti-patterns"
       - What are common mistakes?
       - What leads to problems?
      - What causes chaos?
  
  outputs:
    - scores: {tech_choice: {criterion: score}}
    - weighted_scores: {tech_choice: total_score}
    - trade_offs: [list]
    - best_practices: [list]
    - anti_patterns: [list]
    - recommendations: [list]
```

### Step 4: Provide Advice

**Purpose**: Generate actionable recommendations and warnings

```yaml
research_step_4:
  name: "provide_advice"
  description: "Generate recommendations and warnings"
  
  inputs:
    - tech_choices: {from step 1}
    - scores: {from step 3}
    - anti_patterns: {from step 3}
    - best_practices: {from step 3}
  
  tasks:
    1. "Generate recommendation"
       - "Based on research, {tech_choice} is recommended because..."
       - "Score: {weighted_score}/100"
       - "Key strengths: {list}"
       - "Key weaknesses: {list}"
    
    2. "Generate warnings"
       - "WARNING: {anti_pattern} will cause chaos because..."
       - "Avoid: {list of bad practices}"
       - "Watch out for: {list of issues}"
    
    3. "Generate alternatives"
       - "If {tech_choice} doesn't fit, consider {alternative}"
       - "Alternative strengths: {list}"
       - "Alternative weaknesses: {list}"
    
    4. "Generate next steps"
       - "Try: {specific action}"
       - "Avoid: {specific action}"
       - "Research further: {topic}"
  
  outputs:
    - recommendation: "{detailed recommendation}"
    - warnings: [list]
    - alternatives: [list]
    - next_steps: [list]
    - research_report: "{comprehensive report}"
```

---

## Research Categories

### Category 1: Technology Evaluation

```yaml
technology_evaluation:
  topics:
    - "Framework comparison: {A} vs {B}"
    - "Database choice for {use_case}"
    - "State management for {framework}"
    - "Authentication approach for {app_type}"
  
  search_queries:
    - "best practices for {tech} in {context}"
    - "{tech} vs alternatives 2024"
    - "when to use {tech} vs {alternative}"
    - "common mistakes with {tech}"
```

### Category 2: Performance Optimization

```yaml
performance_optimization:
  topics:
    - "Performance bottlenecks in {context}"
    - "Optimization techniques for {tech}"
    - "Caching strategies for {use_case}"
    - "Scalability patterns for {app_type}"
  
  search_queries:
    - "{tech} performance benchmarks"
    - "how to optimize {tech} {operation}"
    - "{tech} scalability limits"
    - "performance best practices for {tech}"
```

### Category 3: Architecture Patterns

```yaml
architecture_patterns:
  topics:
    - "Clean architecture for {framework}"
    - "Microservices vs monolith for {use_case}"
    - "Event-driven architecture for {domain}"
    - "CQRS implementation for {context}"
  
  search_queries:
    - "architecture patterns for {tech}"
    - "best architecture for {use_case}"
    - "microservices vs monolith when to use"
    - "CQRS benefits and drawbacks"
```

### Category 4: Security and Compliance

```yaml
security_compliance:
  topics:
    - "Security best practices for {tech}"
    - "Authentication flow for {app_type}"
    - "Data protection for {domain}"
    - "Compliance requirements for {region}"
  
  search_queries:
    - "security best practices for {tech}"
    - "{framework} security vulnerabilities"
    - "authentication best practices 2024"
    - "data protection requirements {region}"
```

---

## Integration Points

### With Agent-Expert Workflow

```yaml
# Triggered when agent-expert returns "modify" or "investigate"
workflow: "research"
inputs:
  - user_request: "{what user wants to research}"
  - topics: {from agent-expert}
on_complete:
  - "Pass research findings to agent-expert"
  - "Re-run agent-expert with research context"
  - "If proceed: continue with implementation"
```

### With Correct-Course Workflow

```yaml
# Triggered when bug has unknown cause
workflow: "research"
inputs:
  - user_request: "{what's causing this bug?}"
  - topics: ["root cause of {bug}", "fixes for {bug}"]
on_complete:
  - "Pass research to remediation"
  - "Identify fix based on research"
  - "Implement fix with research-backed approach"
```

### With Sprint Planning

```yaml
# Triggered before technical decision in sprint
workflow: "research"
inputs:
  - user_request: "{technical decision point}"
  - topics: ["{tech} for {feature}", "alternatives"]
on_complete:
  - "Provide research-backed recommendation"
  - "Help with sprint planning decision"
  - "Document research findings"
```

---

## Example Research Report

### User Request

```yaml
user_request: "Should we use Redux or Zustand for state management?"
```

### Step 1: Identify Topics

```yaml
tech_choices: ["Redux", "Zustand"]
evaluation_criteria:
  - "Performance"
  - "Developer experience"
  - "Bundle size"
  - "Learning curve"
  - "Ecosystem"
scenarios: ["Medium-sized React app", "Team of 5 developers"]
alternatives: ["Recoil", "Jotai", "Context API"]
```

### Step 2: Conduct Search

```yaml
search_results:
  - "Redux vs Zustand comparison 2024"
  - "When to use Redux vs Zustand"
  - "Redux performance optimization"
  - "Zustand best practices"
  - "State management benchmarks"

performance_data:
  Redux: "5-10kb gzipped (core), larger with middleware"
  Zustand: "1-2kb gzipped, minimal footprint"
```

### Step 3: Evaluate Evidence

```yaml
scores:
  Redux:
    Performance: 8
    Developer experience: 7
    Bundle size: 5
    Learning curve: 4
    Ecosystem: 9
  Zustand:
    Performance: 9
    Developer experience: 9
    Bundle size: 10
    Learning curve: 8
    Ecosystem: 7

weighted_scores:
  Redux: 66
  Zustand: 86
```

### Step 4: Provide Advice

```yaml
recommendation: |
  Based on research, **Zustand** is recommended for your use case.
  
  **Score: 86/100** (Redux: 66/100)
  
  **Key Strengths:**
  - Minimal bundle size (1-2kb vs 5-10kb)
  - Excellent developer experience
  - Simpler learning curve
  - Good performance out of the box
  
  **Key Weaknesses:**
  - Smaller ecosystem than Redux
  - Fewer middlewares available
  - Less opinionated (could lead to inconsistency)

warnings: |
  **WARNING:** Redux Toolkit (RTK) has improved significantly and addresses
  many traditional Redux complaints. If your team has Redux experience,
  RTK might still be a valid choice.
  
  **WARNING:** Don't use Context API for complex state - it causes
  unnecessary re-renders and is harder to debug.

alternatives:
  - "Recoil: Good for atom-based state, smaller community"
  - "Jotai: Good for primitive-based state, very minimal"
  - "Context API: Only for trivial state (< 3 values)"

next_steps:
  - "Try Zustand in a small feature first"
  - "Set up TypeScript types early"
  - "Establish store structure conventions"
  - "Document patterns for the team"
```

---

## Metrics to Track

| Metric | Description | Target |
|--------|-------------|--------|
| `research_invocations` | Times research was run | N/A |
| `decision_changes` | Times research changed decision | > 20% |
| `warnings_issued` | Anti-pattern warnings issued | N/A |
| `false_recommendations` | Recommendations that led to problems | < 5% |
| `avg_research_time` | Time to complete research | < 5 min |

---

## Version

**Version**: 1.0.0  
**Created**: 2026-01-11  
**Updated**: 2026-01-11

---

## Related Files

- `context-first.md` - Context gathering workflow
- `agent-expert.md` - Expert analysis workflow
- `correct-course-governance.md` - Integration with remediation
- `research-triggers.md` - When to trigger research
