---
name: "rag-context-governance"
type: "governance-policy"
description: "Govern RAG indexing, entity context, and conversation threads"
version: "1.0.0"
critical: true
---

# RAG Context Governance

**description**: Govern RAG (Retrieval-Augmented Generation) indexing, entity context management, and prevent context poisoning.

## Problem Statement

RAG systems can suffer from:
- **Context poisoning**: Stale or irrelevant entities indexed
- **Scattered context**: Same data in multiple entities
- **Oversized context**: Too much context degrades quality
- **Entity drift**: Entities change without index updates

## Governance Framework

### 1. Entity Registration

All RAG-indexed entities must be registered:

```yaml
entity_registry:
  - name: "{entity_name}"
    type: "{document|code|conversation|artifact}"
    source_path: "{path}"
    index_strategy: "{full|chunk|embedding}"
    refresh_rate: "{realtime|daily|weekly}"
    stale_threshold: "{hours}"
    dependencies: [entities that must be fresh]
```

### 2. Index Strategy Guidelines

```yaml
index_strategies:
  full:
    use_for: "Small, frequently accessed documents"
    max_size: "10KB"
    refresh: "realtime"

  chunk:
    use_for: "Large documents, code files"
    chunk_size: "500-1000 tokens"
    overlap: "100 tokens"
    refresh: "on_change"

  embedding:
    use_for: "Semantic search, similarity matching"
    model: "{embedding model}"
    dimension: "{vector dimension}"
    refresh: "weekly"
```

### 3. Context Poisoning Prevention

```yaml
poisoning_prevention:
  - type: "staleness_check"
    rule: "entity.last_modified < 48 hours ago"
    action: "flag_for_refresh"

  - type: "duplicate_detection"
    rule: "similarity_score > 0.9 between entities"
    action: "merge_or_deduplicate"

  - type: "size_limit"
    rule: "context_size > 50K tokens"
    action: "truncate_or_summarize"

  - type: "consistency_check"
    rule: "entity.content != source.content"
    action: "reindex"
```

### 4. Context Gathering Rules

```yaml
context_gathering:
  scan:
    - identify_relevant_domains
    - list_entities_in_scope
    - check_freshness_thresholds

  select:
    - prioritize_by_relevance_score
    - respect_context_size_limits
    - include_dependencies

  validate:
    - check_staleness_flags
    - verify_content_integrity
    - confirm_no_duplicates

  package:
    - create_context_package
    - add_metadata_timestamps
    - generate_context_summary
```

### 5. Entity Lifecycle

```yaml
entity_lifecycle:
  creation:
    - register_in_entity_registry
    - assign_index_strategy
    - set_refresh_schedule

  update:
    - detect_source_changes
    - trigger_reindex_if_needed
    - update_dependency_graph

  deprecation:
    - mark_as_stale
    - remove_from_index
    - archive_if_historic

  deletion:
    - verify_no_active_references
    - remove_from_registry
    - cleanup_vector_store
```

### 6. Quality Metrics

```yaml
quality_metrics:
  relevance:
    - metric: "context_usage_rate"
      threshold: "> 70%"
      meaning: "Retrieved context was actually used"

  freshness:
    - metric: "stale_entity_rate"
      threshold: "< 5%"
      meaning: "Most entities are fresh"

  efficiency:
    - metric: "average_context_size"
      threshold: "< 10K tokens"
      meaning: "Context is focused, not bloated"

  consistency:
    - metric: "duplicate_content_rate"
      threshold: "< 2%"
      meaning: "Minimal redundancy"
```

## Integration

**Used By**: context-first workflow (contextualize step)

**Monitored By**: agent-rag-scanner

**Output**: Context package with metadata and quality scores

## Context Package Format

```yaml
context_package:
  generated_at: "{timestamp}"
  request_id: "{uuid}"
  domains_in_scope: [list]
  entities_included: [count]

  entities:
    - name: "{entity_name}"
      type: "{type}"
      path: "{path}"
      size_tokens: {number}
      relevance_score: {0-1}
      last_modified: "{timestamp}"
      freshness: "{fresh|stale|critical}"

  metadata:
    total_tokens: {number}
    estimated_cost: "{token_cost}"
    quality_score: {0-1}
    flags: [warnings]

  warnings:
    - type: "{staleness|size|duplicate}"
      entity: "{name}"
      recommendation: "{action}"
```

## Critical Priority

RAG context is HIGH RISK for:
- Context poisoning from stale artifacts
- Oversized context degrading LLM quality
- Duplicate entities wasting tokens
- Scattered knowledge across multiple entities

**This governance MUST run before any agent operation requiring context.**
