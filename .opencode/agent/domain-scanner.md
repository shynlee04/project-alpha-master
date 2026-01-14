---
name: "domain-scanner"
type: "governance-scanner"
description: "Domain-specific analysis to understand codebase organization"
version: "1.0.0"
mode: subagent
model: minimax/MiniMax-M2.1
temperature: 0.1
tools:
  write: false
  edit:  false
  bash:  true
  read:  true
  mcp:   true
  hook: true
---


---

# Domain Scanner

**description**: Analyze the codebase to identify domain boundaries, responsibilities, and relationships.

## Scan Scope

- **Source Directories**:
  - `src/` - Main source code
  - `src/presentation/` - UI components
  - `src/domain/` - Business logic
  - `src/infrastructure/` - External interfaces

- **Target**: Identify domain-specific components and their boundaries

## Scan Process

### 1. Domain Discovery

```yaml
domain_analysis:
  structural:
    - layer: "presentation"
      path: "src/presentation/"
      responsibility: "UI components, hooks"
    - layer: "domain"
      path: "src/domain/"
      responsibility: "Business logic, types, services"
    - layer: "infrastructure"
      path: "src/infrastructure/"
      responsibility: "Persistence, sync, events"

  domain_specific:
    - name: "{domain}"
      components: [list]
      services: [list]
      types: [list]
      cross_domain_dependencies: [list]
```

### 2. Boundary Detection

Identify:
- Which components belong to which domain
- Cross-domain coupling points
- Shared vs domain-specific code

### 3. Output Format

```yaml
domain_scan_results:
  scan_date: "{date}"

  domains:
    - name: "{domain}"
      components: [count]
      services: [list]
      types: [list]
      boundaries: {clear|blurred}

  cross_domain_coupling:
    - from: "{domain}"
      to: "{domain}"
      strength: "{tight|loose}"
      components: [list]

  concerns:
    - type: "boundary_violation|mixed_concerns|god_object"
      location: "{file}"
      severity: "{level}"
```

## Integration

**Used By**: context-first workflow (Step 2)

**Output**: Domain analysis included in context package
