# Nonsense Detector
# Sprint-Planning Wrapper - Scanner Module
# Purpose: Spot "Dual Chat" type issues - contradictory, duplicate, or orphan features

version: "1.0.0"
last_updated: "2026-01-11"

# Nonsense patterns to detect
patterns:
  duplicate_workflows:
    name: "Duplicate Workflows"
    description: "Multiple ways to achieve same goal causing confusion"
    severity: "high"

    detection:
      check_for:
        - "Similar story goals from different epics"
        - "Same feature implemented in different ways"
        - "Multiple UI paths for identical user intent"

      signals:
        - "Keywords: 'create X', 'add X', 'new X' in different stories"
        - "Same component names across stories"
        - "Overlapping acceptance criteria"

      examples:
        - name: "Dual Chat Systems"
          description: "Two different chat implementations with different history behavior"
          impact: "Users lose context when switching, confusing UX"
          detection: "Both stories mention 'chat', 'conversation', 'message'"

        - name: "Multiple Create Buttons"
          description: "Different places to create same entity type"
          impact: "Users unsure which to use, inconsistent behavior"
          detection: "Multiple stories have 'create button' acceptance criteria"

    resolution:
      - "Consolidate into single workflow"
      - "Choose one approach, deprecate other"
      - "Create clear differentiation if both are needed"

  contradictory_requirements:
    name: "Contradictory Requirements"
    description: "Stories that conflict with each other"
    severity: "critical"

    detection:
      check_for:
        - "Opposite acceptance criteria"
        - "Mutually exclusive implementations"
        - "Same component with different behaviors"

      signals:
        - "Story A says 'X is Y', Story B says 'X is not Y'"
        - "Both stories modify same component differently"
        - "Conflicting UX patterns"

      examples:
        - name: "Conflicting State Management"
          description: "One story uses local state, another uses global"
          impact: "Inconsistent behavior, potential bugs"
          detection: "Same component uses different state approaches"

        - name: "Contradictory Validation"
          description: "Different validation rules for same entity"
          impact: "User confusion, inconsistent enforcement"
          detection: "Different validation patterns for same entity type"

    resolution:
      - "Resolve conflict before sprint start"
      - "Choose one approach, document decision"
      - "Split epics to separate concerns"

  orphan_features:
    name: "Orphan Features"
    description: "Features with no clear entry point or discoverability"
    severity: "medium"

    detection:
      check_for:
        - "Story with no clear entry point defined"
        - "Feature accessible only via URL direct access"
        - "No navigation/menu item to feature"
        - "Feature not referenced by any other story"

      signals:
        - "Story missing 'entry point' in journey context"
        - "No UI navigation mentioned"
        - "Feature described but not integrated"

      examples:
        - name: "Buried Settings"
          description: "Important setting hidden 5 levels deep in preferences"
          impact: "Feature never discovered by users"
          detection: "Settings story with no clear navigation path"

        - name: "Power User URL"
          description: "Feature only accessible via direct URL construction"
          impact: "Only users who read documentation can find it"
          detection: "Story with no UI entry point"

    resolution:
      - "Add clear entry point (menu item, button, etc.)"
      - "Include feature in onboarding"
      - "Integrate into main workflow"

  zombie_features:
    name: "Zombie Features"
    description: "Features that will be immediately replaced or deleted"
    severity: "low"

    detection:
      check_for:
        - "Feature building component marked for deprecation"
        - "Temporary solution that becomes permanent"
        - "Feature not aligned with roadmap"

      signals:
        - "Story mentions 'temporary' or 'v1, replace later'"
        - "Epic shows component being removed next sprint"
        - "Technical debt with no follow-up story"

      examples:
        - name: "Dead Component Walking"
          description: "Building a component that will be deleted next sprint"
          impact: "Wasted effort, opportunity cost"
          detection: "Component deprecation planned before story completion"

        - name: "Permanent Temporary"
          description: "Temporary workaround never replaced"
          impact: "Technical debt accumulates"
          detection: "Multiple 'temp' implementations over time"

    resolution:
      - "Skip if not aligned with roadmap"
      - "Plan replacement in same sprint"
      - "Convert to proper solution immediately"

# Detection methodology
methodology:
  scan_approach:
    1: "Parse all story acceptance criteria"
    2: "Extract component names and entities"
    3: "Identify overlapping goals"
    4: "Check for contradictory statements"
    5: "Verify entry points for each feature"
    6: "Cross-reference with roadmap/epics"

  analysis:
    keyword_analysis:
      - "Extract action verbs (create, add, update, delete)"
      - "Extract entity types (note, user, chat, etc.)"
      - "Extract UI elements (button, modal, page, etc.)"

    pattern_matching:
      - "Duplicate: same action + entity = potential duplicate"
      - "Conflict: opposite actions = potential contradiction"
      - "Orphan: entity mentioned but no entry = potential orphan"

    semantic_analysis:
      - "Compare acceptance criteria semantics"
      - "Identify contradictory outcomes"
      - "Detect missing integration points"

# Severity levels
severity_levels:
  critical:
    description: "Must resolve before sprint"
    blocking: true
    examples:
      - "Contradictory requirements"
      - "Breaking changes in middle of sprint"

  high:
    description: "Should resolve before sprint"
    blocking: false
    examples:
      - "Duplicate workflows"
      - "Major integration issues"

  medium:
    description: "Flag for review"
    blocking: false
    examples:
      - "Orphan features"
      - "Discoverability concerns"

  low:
    description: "Note for future"
    blocking: false
    examples:
      - "Zombie features"
      - "Minor inconsistencies"

# Output format
outputs:
  nonsense_report:
    format: "markdown"
    section: "Nonsense Detected"

    content:
      | Pattern | Severity | Stories Affected | Description |
      |---------|----------|------------------|-------------|
      | {pattern} | {severity} | {story_keys} | {description} |

    summary:
      critical_count: {n}
      high_count: {n}
      medium_count: {n}
      low_count: {n}
      total: {n}

    recommendations:
      - "{actionable recommendation 1}"
      - "{actionable recommendation 2}"
