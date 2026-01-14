# Cohesion Scanner
# Sprint-Planning Wrapper - Scanner Module
# description: Detect fragmented UX, "Dual Chat" type issues, and narrative incoherence

version: "1.0.0"
last_updated: "2026-01-11"

# Cohesion checks for sprint validation
checks:
  narrative_check:
    name: "Narrative Check - The Movie Script Test"
    description: "Generate 30-second demo script for entire sprint"
    severity: "high"

    methodology:
      prompt: |
        "Generate a 30-second demo script that tells the story of a user
        experiencing ALL features in this sprint. The narrative should flow
        naturally without context switches or fragmentation."

      output: "demo-script.md"

      evaluation:
        - "Does user start in one place and flow naturally?"
        - "Are there jarring context switches?"
        - "Can a stakeholder understand the whole sprint in 30 seconds?"

      fail_if:
        - "User must switch between disconnected UIs"
        - "Multiple workflows for same goal visible in demo"
        - "Demo requires explanation to understand"

  dependency_friction:
    name: "Dependency Friction"
    description: "Map story completion dates vs dependency start dates"
    severity: "critical"

    methodology:
      for_each_dependency:
        check: |
          "Story A (dependency) completes on Day X
           Story B (dependent) starts on Day Y

           Conflict if: Y < X (not parallel work)"

      output:
        conflicts: "List of temporal conflicts"
        warnings: "List of potential issues"

      fail_if:
        - "Critical path story blocked by dependency"
        - "No way to parallelize work"
        - "Story scheduled before dependency completes"

  ghost_logic:
    name: "Ghost Logic Detector"
    description: "Scan for missing error/empty/loading state definitions"
    severity: "medium"

    methodology:
      scan_for:
        - "Stories with no error handling defined"
        - "Stories with no empty state handling"
        - "Stories with no loading state indication"

      output:
        missing_states: "List of stories missing states"
        by_type:
          error: "{stories missing error handling}"
          empty: "{stories missing empty state}"
          loading: "{stories missing loading state}"

      fail_if:
        - "More than 50% of stories missing error states"
        - "Critical user actions lack loading feedback"

# Anti-patterns specific to sprint cohesion
anti_patterns:
  split_brain:
    name: "Split Brain"
    description: "Dual/fragmented workflows for same goal"
    severity: "critical"

    detection:
      - "Multiple stories implementing similar features"
      - "Different UI paths for same user goal"
      - "Contradictory UX patterns"

    examples:
      - "Dual Chat Systems - history lost when switching"
      - "Multiple create buttons with different behaviors"
      - "Separate settings vs in-line controls"

  island_parade:
    name: "Island Parade"
    description: "Features with no clear connection or user journey"
    severity: "medium"

    detection:
      - "Stories with no clear entry point"
      - "Features disconnected from main flow"
      - "No narrative connection between stories"

    examples:
      - "Feature accessible only via direct URL"
      - "Advanced setting buried in preferences"
      - "Standalone feature with no integration"

  carousel_chaos:
    name: "Carousel Chaos"
    description: "User must cycle through disconnected states"
    severity: "high"

    detection:
      - "Story requires navigating away and back"
      - "Context loss during workflow"
      - "Multiple tabs/pages for related tasks"

    examples:
      - "Must switch tabs to see result"
      - "Modal opens different page, closes original"
      - "Navigation required mid-workflow"

# Scoring rubric
scoring:
  cohesion_score:
    min: 1
    max: 5

    rubric:
      5: "Delightful - Seamless narrative flow"
      4: "Good - Minor friction points"
      3: "Acceptable - Some rough edges"
      2: "Poor - Fragmented, confusing"
      1: "Broken - Incoherent sprint"

    factors:
      narrative_flow: 1.0
      dependency_alignment: 1.0
      state_coverage: 1.0
      context_preservation: 1.0
      entry_point_clarity: 1.0

# Output templates
outputs:
  demo_script:
    format: "markdown"
    filename: "demo-script.md"
    template: |
      # 30-Second Sprint Demo: {sprint_id}

      ## The Story
      {narrative story of user experiencing all sprint features}

      ## User Journey
      1. User starts at: {entry point}
      2. User does: {actions}
      3. System responds: {responses}
      4. Value delivered: {outcomes}

      ## Cohesion Notes
      {notes on flow and connections}

  cohesion_report:
    format: "markdown"
    filename: "cohesion-report-{date}.md"
    template: |
      # Cohesion Report: {sprint_id}
      **Date**: {timestamp}
      **Score**: {score}/5

      ## Narrative Check
      {result and notes}

      ## Dependency Friction
      {conflicts and warnings}

      ## Ghost Logic
      {missing states}

      ## Anti-Patterns Detected
      {list of detected patterns}

      ## Recommendations
      {actionable recommendations}
