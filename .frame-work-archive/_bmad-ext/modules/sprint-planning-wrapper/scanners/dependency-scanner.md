# Dependency Scanner
# Sprint-Planning Wrapper - Scanner Module
# description: Map cross-story dependencies and identify hidden temporal conflicts

version: "1.0.0"
last_updated: "2026-01-11"

# Dependency types to detect
dependency_types:
  explicit:
    name: "Explicit Dependencies"
    description: "Declared dependencies in story metadata"
    source: "story files - 'depends_on' field"

    parse_pattern:
      from_story: "{story_key}"
      depends_on:
        - story: "{blocking_story_key}"
          type: "{hard|soft}"
          reason: "{why dependency exists}"

    example:
      story: "2-1-user-profile"
      depends_on:
        - story: "1-3-auth-system"
          type: "hard"
          reason: "Profile requires authenticated user"

  implicit_component:
    name: "Implicit Component Dependencies"
    description: "Multiple stories modifying same component"
    source: "analyze affected components in stories"

    detection:
      check: "Do stories modify the same component/file?"
      flag: "Potential merge conflict"
      severity: "medium"

    example:
      stories:
        - "1-2-note-list: modifies notes-list.tsx"
        - "2-3-note-filter: modifies notes-list.tsx"
      conflict: "Both modify NotesListComponent"

  implicit_data:
    name: "Implicit Data Dependencies"
    description: "Story A creates data used by Story B"
    source: "analyze data flow and entities"

    detection:
      check: "Does Story A create entity that Story B consumes?"
      flag: "Data dependency not explicitly declared"
      severity: "high"

    example:
      stories:
        - "1-1-note-crud: creates Note entity"
        - "2-1-note-summary: consumes Note entity"
      dependency: "2-1 depends on 1-1 completing"

  implicit_api:
    name: "Implicit API Dependencies"
    description: "Story A modifies API used by Story B"
    source: "analyze API contracts and endpoints"

    detection:
      check: "Does Story A change API contract Story B uses?"
      flag: "Breaking change risk"
      severity: "critical"

    example:
      stories:
        - "1-5-api-refactor: changes /api/notes"
        - "2-4-note-sync: uses /api/notes"
      conflict: "2-4 may break if API changes mid-sprint"

# Temporal conflict detection
temporal_validation:
  name: "Temporal Conflict Detection"
  description: "Verify story ordering doesn't create impossible dependencies"

  methodology:
    for_each_dependency:
      dependency_story:
        key: "{story A}"
        estimated_completion: "{day N}"

      dependent_story:
        key: "{story B}"
        estimated_start: "{day M}"

      evaluation:
        if_M_less_than_N:
          result: "CONFLICT"
          severity: "critical"
          message: "Story B starts before Story A completes"

        if_M_equals_N:
          result: "RISK"
          severity: "medium"
          message: "Same day - may need coordination"

        if_M_greater_than_N:
          result: "OK"
          severity: "none"
          message: "Sufficient buffer"

# Dependency graph generation
graph_generation:
  format: "yaml"
  filename: "dependency-map.yaml"

  structure:
    nodes:
      - story_key: "{story}"
        title: "{title}"
        epic: "{epic}"
        estimated_days: "{n}"

    edges:
      - from: "{story A}"
        to: "{story B}"
        type: "{hard|soft|implicit_component|implicit_data|implicit_api}"
        risk: "{none|low|medium|high|critical}"

    critical_path:
      algorithm: "longest path through dependency graph"
      output: "ordered list of stories on critical path"

    conflicts:
      temporal: "{list of temporal conflicts}"
      component: "{list of potential merge conflicts}"
      breaking: "{list of breaking change risks}"

# Resolution strategies
resolution_strategies:
  reorder:
    description: "Reorder stories to satisfy dependencies"
    when: "Temporal conflicts can be resolved by reordering"
    action: "Adjust story sequence"

  split:
    description: "Split story into smaller chunks"
    when: "Story too large, blocking other work"
    action: "Break story into sub-stories"

  parallel:
    description: "Enable parallel work with interface contract"
    when: "Stories can be worked independently"
    action: "Define interface, work in parallel"

  contract_first:
    description: "Complete API contract before implementation"
    when: "Implicit API dependencies detected"
    action: "Define API contract, stories implement to contract"

# Output templates
outputs:
  dependency_map:
    format: "yaml"
    filename: "dependency-map.yaml"
    template: |
      # Dependency Map: {sprint_id}

      nodes:
        {list of stories with metadata}

      edges:
        {list of dependency relationships}

      critical_path:
        - {ordered list of critical stories}

      conflicts:
        temporal:
          {list of temporal conflicts}
        component:
          {list of component conflicts}
        breaking:
          {list of breaking change risks}

      recommendations:
        {resolution strategies}
