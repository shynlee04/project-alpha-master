---
name: "multimodality-governance"
type: "governance-policy"
purpose: "Govern input/output multimodality across workspaces"
version: "1.0.0"
critical: true
---

# Multimodality Governance

**Purpose**: Track and govern multimodal input/output handling across different workspaces to prevent inconsistency.

## Problem Statement

Multimodality introduces complexity:
- **Input variations**: Different workspace support different input types
- **Output handling**: Same content rendered differently per workspace
- **Tool manipulation**: Some workspaces allow tool manipulation, others don't
- **Inconsistent experience**: User expectations vs actual capabilities

## Governance Framework

### 1. Modality Registry

```yaml
modality_registry:
  - type: "{text|image|audio|video|file}"
    supported_inputs:
      - workspace: "{workspace_name}"
        in_page: "{yes|no|partial}"
        max_size: "{limit}"
        formats: [supported_formats]
        processing: "{how handled}"

    supported_outputs:
      - workspace: "{workspace_name}"
        rendering: "{how displayed}"
        manipulation: "{tool_available|not_available}"
        quality_settings: [options]
```

### 2. Workspace Capabilities Matrix

```yaml
workspace_capabilities:
  desktop:
    inputs:
      text: "full - keyboard input"
      image: "full - drag-drop, paste, capture"
      audio: "partial - mic input"
      video: "none"
      file: "full - file system access"

    outputs:
      text: "full - rich text, markdown"
      image: "full - display, download, edit"
      audio: "full - play, download"
      video: "full - embedded player"
      file: "full - save, organize"

    tool_manipulation: "full - write tools available"

  web:
    inputs:
      text: "full - keyboard input"
      image: "partial - upload only"
      audio: "none"
      video: "none"
      file: "partial - upload only"

    outputs:
      text: "full - rich text, markdown"
      image: "full - display, download"
      audio: "full - play, download"
      video: "full - embedded player"
      file: "partial - download only"

    tool_manipulation: "limited - browser sandbox"

  mobile:
    inputs:
      text: "full - virtual keyboard"
      image: "partial - camera, gallery"
      audio: "partial - voice input"
      video: "none"
      file: "limited - app-specific"

    outputs:
      text: "full - responsive text"
      image: "full - display, save to gallery"
      audio: "full - play, download"
      video: "full - embedded player"
      file: "limited - app-specific sharing"

    tool_manipulation: "none - read-only"
```

### 3. Consistency Rules

```yaml
consistency_rules:
  input_fallback:
    - rule: "primary_input_not_available"
      fallback: "use_next_best_modality"
      example: "image not available → request text description"

    - rule: "format_not_supported"
      fallback: "convert_format"
      example: "webp not supported → convert to png"

  output_adaptation:
    - rule: "workspace_cannot_render"
      adaptation: "provide_alternative"
      example: "video not possible → provide transcript"

    - rule: "manipulation_not_available"
      adaptation: "offer_download"
      example: "cannot edit image → offer downloadable version"

  experience_parity:
    - rule: "core_functionality_must_work"
      requirement: "text input/output always available"
    - rule: "declare_limitations_early"
      requirement: "show unsupported modalities as disabled"
```

### 4. Quality Metrics

```yaml
quality_metrics:
  availability:
    - metric: "modality_availability_rate"
      threshold: "> 90%"
      meaning: "Most modalities work in most workspaces"

  consistency:
    - metric: "cross_workspace_consistency"
      threshold: "> 80%"
      meaning: "Similar experience across workspaces"

  clarity:
    - metric: "limitation_communication"
      threshold: "100%"
      meaning: "All limitations clearly communicated"

  fallback_success:
    - metric: "fallback_utilization_rate"
      threshold: "> 70%"
      meaning: "Fallbacks work when needed"
```

### 5. Tool Manipulation Governance

```yaml
tool_manipulation:
  high_risk_workspaces: ["web", "mobile"]

  restrictions:
    - rule: "no_direct_file_system_access"
      applies_to: ["web", "mobile"]
      alternative: "upload/download APIs"

    - rule: "no_clipboard_write"
      applies_to: ["web"]
      alternative: "copy_to_buffer API"

    - rule: "no_background_execution"
      applies_to: ["web", "mobile"]
      alternative: "foreground_only_operations"

  safeguards:
    - type: "capability_detection"
      check: "detect_workspace_capabilities_before_operation"

    - type: "graceful_degradation"
      fallback: "provide_best_available_alternative"

    - type: "user_notification"
      inform: "explain_limitation_before_attempting_operation"
```

### 6. Implementation Guidelines

```yaml
implementation:
  detect:
    - run_capability_detection
    - cache_workspace_capabilities
    - apply_workspace_specific_rules

  adapt:
    - modify_ui_for_available_modalities
    - disable_unavailable_features
    - provide_alternatives_for_limitations

  validate:
    - test_operations_before_executing
    - verify_output_rendering_possible
    - confirm_tool_manipulation_allowed

  communicate:
    - show_available_modalities
    - explain_unavailable_features
    - suggest_alternatives
```

## Integration

**Used By**: All agents handling multimodal content

**Monitored By**: agent-rag-scanner

**Output**: Modality capability reports and consistency audits

## Capability Detection Protocol

```yaml
detection_protocol:
  step_1: "Detect workspace (desktop|web|mobile)"
  step_2: "Load workspace capability profile"
  step_3: "Enable supported modalities"
  step_4: "Disable unavailable modalities with explanation"
  step_5: "Provide fallbacks for critical features"
```

## Critical Priority

Multimodality governance is MEDIUM-HIGH risk:
- Workspace fragmentation creates inconsistent UX
- Tool manipulation restrictions vary significantly
- Fallback failures break core functionality
- Undeclared limitations frustrate users

**Every agent handling multimodal content MUST check workspace capabilities.**
