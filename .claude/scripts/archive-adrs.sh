#!/bin/bash
# ADR Archival Script
# Archives outdated ADRs with proper metadata
# Date: 2026-01-26

ARCHIVE_DIR="_bmad-ext/.archive/adr"
mkdir -p "$ARCHIVE_DIR"

# Function to add frontmatter metadata to archived ADR
add_metadata() {
  local src_file=$1
  local dest_file=$2
  local title=$3
  local status=$4
  local superseded_by=$5
  local reason=$6

  echo "Archiving: $title"
  echo "  Source: $src_file"
  echo "  Destination: $dest_file"
  echo "  Status: $status"

  # Extract original content
  local original_content=$(cat "$src_file")

  # Create new file with metadata
  cat > "$dest_file" <<EOF
---
title: "$title"
status: "$status"
archived_by: "$superseded_by"
archived_date: "2026-01-26"
superseded_reason: "$reason"
original_path: "$src_file"
---

$original_content
EOF

  echo "  ✓ Archived successfully"
  echo ""
}

# ========================================
# Superseded by ADR-039 (Primary Authority)
# ========================================

add_metadata \
  "_bmad-output/planning-artifacts/adr/ADR-033-correct-course-architectural-remediation-2026-01-16.md" \
  "$ARCHIVE_DIR/ADR-033-superseded-2026-01-26.md" \
  "ADR-033: Correct-Course Architectural Remediation" \
  "SUPERSEDED" \
  "ADR-039" \
  "Consolidated into ADR-039: Unified Architecture Fundamentals (v2.0.0 Alignment)"

add_metadata \
  "_bmad-output/planning-artifacts/adr/ADR-035-correct-course-v2-architecture-standardization-2026-01-20.md" \
  "$ARCHIVE_DIR/ADR-035-superseded-2026-01-26.md" \
  "ADR-035: Correct-Course v2 - Architecture Standardization" \
  "SUPERSEDED" \
  "ADR-039" \
  "Consolidated into ADR-039: Unified Architecture Fundamentals (v2.0.0 Alignment)"

# ========================================
# Stale (>30 days) - Proposed for Review/Deprecation
# ========================================

# ADR-001 to ADR-005 (Foundational ADRs)
add_metadata \
  "_bmad-output/planning-artifacts/architecture/adr/ADR-001-zustand-state-management.md" \
  "$ARCHIVE_DIR/ADR-001-stale-2026-01-26.md" \
  "ADR-001: Zustand State Management with v5 Patterns" \
  "STALE" \
  "N/A" \
  "PROPOSED >30 days (19 days stale). Awaiting review: Approve, update, or deprecate. Foundational Zustand v5 patterns."

add_metadata \
  "_bmad-output/planning-artifacts/architecture/adr/ADR-002-single-source-of-truth.md" \
  "$ARCHIVE_DIR/ADR-002-stale-2026-01-26.md" \
  "ADR-002: Single Source of Truth for State" \
  "STALE" \
  "N/A" \
  "PROPOSED >30 days (19 days stale). Awaiting review: Approve, update, or deprecate. Infrastructure location and facade patterns."

add_metadata \
  "_bmad-output/planning-artifacts/architecture/adr/ADR-003-clean-architecture-layers.md" \
  "$ARCHIVE_DIR/ADR-003-stale-2026-01-26.md" \
  "ADR-003: Clean Architecture Layer Separation" \
  "STALE" \
  "N/A" \
  "PROPOSED >30 days (19 days stale). Awaiting review: Approve, update, or deprecate. 4-layer architecture, dependency flow."

add_metadata \
  "_bmad-output/planning-artifacts/architecture/adr/ADR-004-god-component-decomposition.md" \
  "$ARCHIVE_DIR/ADR-004-stale-2026-01-26.md" \
  "ADR-004: God Component and Store Decomposition" \
  "STALE" \
  "N/A" \
  "PROPOSED >30 days (19 days stale). Awaiting review: Approve, update, or deprecate. Size limits (300/120 lines), decomposition patterns."

add_metadata \
  "_bmad-output/planning-artifacts/architecture/adr/ADR-005-governance-patterns.md" \
  "$ARCHIVE_DIR/ADR-005-stale-2026-01-26.md" \
  "ADR-005: Governance Patterns and Autonomous Execution" \
  "STALE" \
  "N/A" \
  "PROPOSED >30 days (19 days stale). Awaiting review: Approve, update, or deprecate. BMAD governance, time-boxing, TTL filtering."

# ADR-026 to ADR-032 (Integration ADRs)
add_metadata \
  "_bmad-output/planning-artifacts/architecture/adr-026-ai-service-unification.md" \
  "$ARCHIVE_DIR/ADR-026-stale-2026-01-26.md" \
  "ADR-026: AI Service Unification" \
  "STALE" \
  "N/A" \
  "PROPOSED >30 days (19 days stale). Awaiting review: Approve, update, or deprecate. AI provider consolidation, unified API calls."

add_metadata \
  "_bmad-output/planning-artifacts/architecture/adr-027-state-management-consolidation.md" \
  "$ARCHIVE_DIR/ADR-027-stale-2026-01-26.md" \
  "ADR-027: State Management Consolidation" \
  "STALE" \
  "N/A" \
  "PROPOSED >30 days (19 days stale). Awaiting review: Approve, update, or deprecate. God stores (9 files >300 lines), slice decomposition."

add_metadata \
  "_bmad-output/planning-artifacts/architecture/adr-028-error-boundary-coverage.md" \
  "$ARCHIVE_DIR/ADR-028-stale-2026-01-26.md" \
  "ADR-028: Error Boundary Coverage" \
  "STALE" \
  "N/A" \
  "PROPOSED >30 days (19 days stale). Awaiting review: Approve, update, or deprecate. Error handling tiers, WSOD prevention, route protection."

add_metadata \
  "_bmad-output/planning-artifacts/architecture/adr-029-clean-architecture-layer-compliance.md" \
  "$ARCHIVE_DIR/ADR-029-stale-2026-01-26.md" \
  "ADR-029: Clean Architecture Layer Compliance" \
  "STALE" \
  "N/A" \
  "PROPOSED >30 days (19 days stale). Awaiting review: Approve, update, or deprecate. StorageAdapter interface, FSA/IDB adapters."

add_metadata \
  "_bmad-output/planning-artifacts/architecture/adr-030-multimodal-integration.md" \
  "$ARCHIVE_DIR/ADR-030-stale-2026-01-26.md" \
  "ADR-030: Multimodal Integration Architecture" \
  "STALE" \
  "N/A" \
  "PROPOSED >30 days (17 days stale). Awaiting review: Approve, update, or deprecate. Voice I/O, image processing, context management."

add_metadata \
  "_bmad-output/planning-artifacts/architecture/adr-031-chat-system-unification.md" \
  "$ARCHIVE_DIR/ADR-031-stale-2026-01-26.md" \
  "ADR-031: Chat System Unification" \
  "STALE" \
  "N/A" \
  "PROPOSED >30 days (17 days stale). Awaiting review: Approve, update, or deprecate. Unified chat store, thread hierarchy, tool execution."

add_metadata \
  "_bmad-output/planning-artifacts/architecture/adr-032-clean-storage-architecture.md" \
  "$ARCHIVE_DIR/ADR-032-stale-2026-01-26.md" \
  "ADR-032: Clean Storage Architecture (Phase 2)" \
  "STALE" \
  "N/A" \
  "PROPOSED >30 days (15 days stale). Awaiting review: Approve, update, or deprecate. FSA implementation, TypeScript fixes, phase tracking."

# Additional Stale ADRs from /adr/
add_metadata \
  "_bmad-output/planning-artifacts/adr/ADR-036-foundation-cleanup-architecture-2026-01-21.md" \
  "$ARCHIVE_DIR/ADR-036-stale-2026-01-26.md" \
  "ADR-036: Foundation Cleanup & Infrastructure Consolidation" \
  "STALE" \
  "N/A" \
  "PROPOSED >30 days (11 days stale). Awaiting review: Approve, update, or deprecate. Merged into ADR-027 recommendation."

add_metadata \
  "_bmad-output/planning-artifacts/adr/ADR-037-platform-contract-consolidation-2026-01-18.md" \
  "$ARCHIVE_DIR/ADR-037-stale-2026-01-26.md" \
  "ADR-037: Platform Contract Interface Consolidation" \
  "STALE" \
  "N/A" \
  "PROPOSED >30 days (8 days stale). Awaiting review: Approve, update, or deprecate. Duplicate interface resolution, 19 import locations."

add_metadata \
  "_bmad-output/planning-artifacts/adr/ADR-038-event-listener-isolation-2026-01-18.md" \
  "$ARCHIVE_DIR/ADR-038-stale-2026-01-26.md" \
  "ADR-038: Event Listener Error Isolation" \
  "STALE" \
  "N/A" \
  "PROPOSED >30 days (8 days stale). Awaiting review: Approve, update, or deprecate. Event bus error handling, try-catch wrapping, listener error isolation."

add_metadata \
  "_bmad-output/planning-artifacts/adr/ADR-037-xss-sanitization-2026-01-18.md" \
  "$ARCHIVE_DIR/ADR-037-xss-stale-2026-01-26.md" \
  "ADR-037-xss: XSS Sanitization Strategy" \
  "STALE" \
  "N/A" \
  "PROPOSED >30 days (8 days stale). Awaiting review: Approve, update, or deprecate. DOMPurify, 7 vulnerable locations, iframe/doc.write safety."

echo "========================================="
echo "✅ Archival Complete"
echo "========================================="
echo "Total ADRs archived: $(ls -1 $ARCHIVE_DIR/*.md 2>/dev/null | wc -l | tr -d ' ')"
echo "Archive location: $ARCHIVE_DIR"
echo ""
